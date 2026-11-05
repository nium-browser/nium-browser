/* Nium AI: lê o texto da página para a IA (como no Nium Electron). MPL-2.0
 *
 * Roda no processo da página e devolve só texto simples e limitado: título, endereço, autor e
 * os parágrafos do artigo (sem formulários, campos, menus nem rodapés). Também devolve o trecho
 * selecionado.
 */

const MAX_TEXT = 300000;
const MAX_PARAGRAPHS = 800;
const EXCLUDED =
  'script,style,noscript,template,form,input,textarea,select,button,option,[hidden],[aria-hidden="true"],[contenteditable]:not([contenteditable="false" i])';
const ARTICLE_EXCLUDED = EXCLUDED + ",nav,footer,header,aside";
const TAGS = "h1,h2,h3,p,li,blockquote,pre";

export class NiumPageChild extends JSWindowActorChild {
  receiveMessage(message) {
    if (message.name === "Nium:Extract") return this.extract();
    if (message.name === "Nium:Selection") {
      return { text: String(this.contentWindow?.getSelection()?.toString() || "").slice(0, 4000) };
    }
    return null;
  }

  extract() {
    const win = this.contentWindow;
    const doc = this.document;
    if (!doc?.body) return null;
    const editable = String(doc.designMode).toLowerCase() === "on";
    const blocked = (node, selector) => editable || !!node?.closest?.(selector) || !!node?.isContentEditable;
    const textOf = (root, selector, limit) => {
      if (!root || blocked(root, selector)) return { text: "", truncated: false };
      let text = "";
      let truncated = false;
      const walker = doc.createTreeWalker(root, win.NodeFilter.SHOW_ELEMENT | win.NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeType === 1
            ? blocked(node, selector)
              ? win.NodeFilter.FILTER_REJECT
              : win.NodeFilter.FILTER_SKIP
            : win.NodeFilter.FILTER_ACCEPT;
        },
      });
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const remaining = limit - text.length;
        const value = node.nodeValue || "";
        if (value.length > remaining) {
          text += value.slice(0, remaining);
          truncated = true;
          break;
        }
        text += value;
      }
      return { text, truncated };
    };
    const title = String(doc.title || "").slice(0, 200);
    const author = String(doc.querySelector('meta[name="author"]')?.content || "").slice(0, 1000);
    const root = doc.querySelector("article") || doc.querySelector("main") || doc.querySelector('[role="main"]') || doc.body;
    const paragraphs = [];
    let remaining = MAX_TEXT;
    let truncated = false;
    if (root && !blocked(root, ARTICLE_EXCLUDED)) {
      const walker = doc.createTreeWalker(root, win.NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
          if (blocked(node, ARTICLE_EXCLUDED)) return win.NodeFilter.FILTER_REJECT;
          return node.matches(TAGS) ? win.NodeFilter.FILTER_ACCEPT : win.NodeFilter.FILTER_SKIP;
        },
      });
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        // Um bloco escolhido já contém os blocos e itens de lista de dentro.
        const parent = node.parentElement?.closest(TAGS);
        if (parent && root.contains(parent)) continue;
        if (paragraphs.length === MAX_PARAGRAPHS || remaining <= 0) {
          truncated = true;
          break;
        }
        const result = textOf(node, ARTICLE_EXCLUDED, remaining);
        const text = result.text.trim();
        truncated ||= result.truncated;
        if (text) {
          paragraphs.push({ tag: node.localName, text });
          remaining -= text.length + 2;
        }
        if (result.truncated) break;
      }
    }
    const fallback = paragraphs.length ? null : textOf(root, ARTICLE_EXCLUDED, MAX_TEXT);
    truncated ||= !!fallback?.truncated;
    const text = paragraphs.length ? paragraphs.map(p => p.text).join("\n\n").slice(0, MAX_TEXT) : fallback.text;
    return { title, url: win.location.href, author, text, paragraphs, truncated };
  }
}
