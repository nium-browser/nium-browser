/* Nium: entrega a cor da página para a janela (ver NiumTintChild). MPL-2.0 */

export class NiumTintParent extends JSWindowActorParent {
  receiveMessage(message) {
    if (message.name !== "Nium:Tint") return;
    const browser = this.browsingContext.top?.embedderElement;
    browser?.ownerGlobal?.NiumSidebar?.setTint?.(browser, message.data?.color ?? null);
  }
}
