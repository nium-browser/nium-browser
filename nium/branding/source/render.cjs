const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  const jobs = [['icon',[16,22,24,32,48,64,128,256,512]],['private',[16,32,48,256,512]],['doc',[16,32,48,256]]];
  for (const [n,sizes] of jobs) for (const s of sizes) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<style>html,body{margin:0;background:transparent}</style>${fs.readFileSync(n+'.svg','utf8').replace('<svg ',`<svg width="${s}" height="${s}" `)}`);
    await p.screenshot({ path: `out/${n}-${s}.png`, omitBackground: true }); }
  // wordmark preview with color
  await p.setViewportSize({ width: 600, height: 198 });
  await p.setContent(`<style>body{margin:0;background:#fff}</style>${fs.readFileSync('wordmark.svg','utf8').replace(/context-fill/g,'#1f2b2e').replace('<svg ','<svg width="600" height="198" ')}`);
  await p.screenshot({ path: 'out/wordmark-preview.png' });
  await b.close(); })();
