/* Nium AI: conversa com o Ollama neste computador (como no Nium Electron). MPL-2.0
 *
 * Só fala com 127.0.0.1: sem conta, sem chave, sem servidor de fora. O texto da página não sai
 * do computador. Usa XMLHttpRequest "mozSystem" (pedido do próprio navegador, sem cabeçalho
 * Origin), porque o Ollama recusa pedidos com Origin de fora da lista dele.
 */

import { validModelName, RECOMMENDED } from "./reading-ai.mjs";

const BASE = "http://127.0.0.1:11434/api";
export const OFFLINE = "OFFLINE";

function request(method, path, { body, timeout = 0, onChunk, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
    xhr.open(method, BASE + path);
    xhr.timeout = timeout;
    if (body) xhr.setRequestHeader("Content-Type", "application/json");
    let seen = 0;
    xhr.onprogress = () => {
      if (!onChunk) return;
      const text = xhr.responseText;
      if (text.length > seen) {
        onChunk(text.slice(seen));
        seen = text.length;
      }
    };
    xhr.onload = () => {
      if (onChunk && xhr.responseText.length > seen) onChunk(xhr.responseText.slice(seen));
      resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = () => reject(Object.assign(new Error(OFFLINE), { offline: true }));
    xhr.ontimeout = () => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" }));
    xhr.onabort = () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
    if (signal) {
      if (signal.aborted) return xhr.abort();
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(body ? JSON.stringify(body) : null);
  });
}

// Lê o fluxo de JSON por linha do Ollama.
function lineReader(onObject) {
  let buf = "";
  return chunk => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) {
        try {
          onObject(JSON.parse(line));
        } catch (e) {}
      }
    }
  };
}

export async function models() {
  const res = await request("GET", "/tags", { timeout: 3000 });
  if (res.status !== 200) throw new Error("LIST_FAILED");
  const data = JSON.parse(res.text || "{}");
  return (data.models || []).map(x => x.name).filter(validModelName).slice(0, 50);
}

export async function status() {
  try {
    return { reachable: true, models: await models(), recommended: RECOMMENDED };
  } catch (e) {
    return { reachable: false, models: [], recommended: RECOMMENDED, error: e.message };
  }
}

/** Uma resposta por vez. onToken recebe o texto gerado até agora. */
export async function chat({ model, messages, onToken, signal, maxTokens = 900 }) {
  if (!validModelName(model)) throw new Error("NO_MODEL");
  let text = "";
  let failure = "";
  let last = 0;
  const read = lineReader(obj => {
    if (obj.error) failure = String(obj.error).slice(0, 200);
    text += obj.message?.content || "";
    const now = Date.now();
    if (now - last > 60) {
      last = now;
      onToken?.(text);
    }
  });
  const res = await request("POST", "/chat", {
    body: { model, messages, stream: true, options: { num_predict: maxTokens, num_ctx: 8192, temperature: 0.3 } },
    timeout: 180000,
    onChunk: read,
    signal,
  });
  if (res.status !== 200) {
    throw new Error(/memory/i.test(res.text) ? "NO_MEMORY" : "MODEL_ERROR");
  }
  if (failure) throw new Error(failure);
  onToken?.(text);
  if (!text.trim()) throw new Error("EMPTY");
  return text;
}

/** Baixa um modelo recomendado; onProgress recebe a porcentagem. */
export async function pull({ name, onProgress, signal }) {
  if (!RECOMMENDED.some(r => r.name === name)) throw new Error("NOT_RECOMMENDED");
  let failure = "";
  const read = lineReader(obj => {
    if (obj.error) failure = String(obj.error).slice(0, 200);
    if (obj.total && obj.completed) onProgress?.(Math.min(100, Math.round((obj.completed / obj.total) * 100)));
  });
  const res = await request("POST", "/pull", { body: { model: name, stream: true }, onChunk: read, signal });
  if (res.status !== 200 || failure) throw new Error(failure || "PULL_FAILED");
}
