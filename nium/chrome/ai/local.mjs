/* Nium AI: IA que roda dentro do próprio navegador (sem Ollama). MPL-2.0
 *
 * Usa o motor de IA local do Firefox (llama.cpp nativo, o mesmo das prévias de link). O modelo
 * é baixado uma vez do Hugging Face e fica guardado no perfil; depois funciona sem internet.
 * Dois tamanhos, como escolhido no plano do Nium:
 *   Leve   — Qwen2.5 0.5B Instruct (~400 MB): rápido, respostas mais simples;
 *   Padrão — Qwen2.5 1.5B Instruct (~1 GB): respostas melhores, pede mais memória.
 * Os dois são Apache-2.0 e falam bem português, inglês e espanhol.
 * O endereço desses dois repositórios é liberado no apply.py (lista de modelos permitidos).
 */

export const LOCAL_MODELS = Object.freeze({
  light: {
    modelId: "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
    modelFile: "qwen2.5-0.5b-instruct-q4_k_m.gguf",
    size: "~400 MB",
    numContext: 6144,
  },
  standard: {
    modelId: "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
    modelFile: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
    size: "~1 GB",
    numContext: 6144,
  },
});

let engine = null;
let engineSize = null;

async function getEngine(size, onDownload, signal) {
  if (engine && engineSize === size) return engine;
  await dispose();
  const model = LOCAL_MODELS[size];
  if (!model) throw new Error("NO_MODEL");
  const { createEngine } = ChromeUtils.importESModule("chrome://global/content/ml/EngineProcess.sys.mjs");
  engine = await createEngine(
    {
      backend: "llama.cpp",
      engineId: `nium-ai-${size}`,
      taskName: "llama-text-generation",
      modelHubRootUrl: "https://huggingface.co/",
      modelHubUrlTemplate: "{model}/resolve/{revision}",
      modelId: model.modelId,
      modelRevision: "main",
      modelFile: model.modelFile,
      numContext: model.numContext,
      timeoutMS: -1,
      useMlock: false,
      useMmap: false,
    },
    data => {
      // Durante o download: porcentagem (só na primeira vez; depois vem do disco).
      if (data?.type === "downloading" && data.total) {
        onDownload?.(Math.min(100, Math.round((100 * data.totalLoaded) / data.total)), data.statusText === "done");
      }
    },
    signal
  );
  engineSize = size;
  return engine;
}

export async function dispose() {
  const e = engine;
  engine = null;
  engineSize = null;
  try {
    await e?.terminate();
  } catch (err) {}
}

/** Gera a resposta; onToken recebe o texto até agora. Parar = signal.abort(). */
export async function chat({ size, messages, onToken, onDownload, signal, maxTokens = 900 }) {
  const eng = await getEngine(size, onDownload, signal);
  let text = "";
  let last = 0;
  let stopped = false;
  try {
    for await (const chunk of eng.runWithGenerator({ nPredict: maxTokens, prompt: messages })) {
      if (signal?.aborted) {
        stopped = true;
        break;
      }
      text += chunk?.text || "";
      const now = Date.now();
      if (now - last > 60) {
        last = now;
        onToken?.(text);
      }
      if (text.length > 30000) {
        stopped = true;
        break;
      }
    }
  } catch (e) {
    await dispose();
    if (/memory/i.test(String(e?.message))) throw new Error("NO_MEMORY");
    throw e;
  }
  // Sair do meio da geração deixa o motor ocupado: começa outro na próxima vez.
  if (stopped) await dispose();
  onToken?.(text);
  if (signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
  if (!text.trim()) throw new Error("EMPTY");
  return text;
}
