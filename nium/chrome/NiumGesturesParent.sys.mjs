/* Nium: executa no navegador a ação de um gesto do mouse (ver NiumGesturesChild). MPL-2.0 */

const COMMANDS = {
  back: "Browser:Back",
  forward: "Browser:Forward",
  reload: "Browser:Reload",
  newTab: "cmd_newNavigatorTab",
  closeTab: "cmd_close",
  nextTab: "Browser:NextTab",
  previousTab: "Browser:PrevTab",
};

export class NiumGesturesParent extends JSWindowActorParent {
  receiveMessage(message) {
    if (message.name !== "Nium:Gesture") return;
    const id = COMMANDS[message.data?.action];
    const browser = this.browsingContext.top?.embedderElement;
    const win = browser?.ownerGlobal;
    console.log("Nium gestos: ação recebida", message.data?.action, !!win);
    if (!id || !win?.gBrowser || win.gBrowser.selectedBrowser !== browser) return;
    win.document.getElementById(id)?.doCommand();
  }
}
