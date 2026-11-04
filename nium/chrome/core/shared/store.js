'use strict';
// Nium Core — armazenamento comum. Dentro do Nium: a ponte niumNative (arquivo JSON no perfil).
// Fora dele (teste num navegador comum): IndexedDB. API: NiumStore.get(key) / NiumStore.set(key, value).
(() => {
  const native = window.niumNative;
  const inNium = !!(native && typeof chrome !== 'undefined' && typeof chrome.send === 'function');
  let dbPromise = null;
  function db() {
    dbPromise ||= new Promise((resolve, reject) => {
      const req = indexedDB.open('nium-core', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function idb(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction('kv', mode);
      const req = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  }
  window.NiumStore = Object.freeze({
    inNium,
    async get(key) {
      if (inNium) return native.call('storeGet', { key });
      return (await idb('readonly', (s) => s.get(key))) ?? null;
    },
    async set(key, value) {
      if (inNium) return native.call('storeSet', { key, value });
      await idb('readwrite', (s) => s.put(value, key));
      return true;
    },
  });
})();
