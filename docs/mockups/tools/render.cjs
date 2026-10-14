// usage: node render.cjs NAME W H   (reads mockups/project/NAME.dc.html, writes bezakcji/shots/NAME.png)
const fs = require('fs'), path = require('path');
const S = path.resolve(__dirname, '..');
const puppeteer = require(S + '/mmdc/node_modules/puppeteer');
const [name, w, h] = process.argv.slice(2);
const src = fs.readFileSync(`${S}/mockups/project/${name}.dc.html`, 'utf8')
  .replace(/<script src="\.\/support\.js"><\/script>/, '')
  .replace(/\{\{accent\}\}/g, '#8A5230');
const out = `${__dirname}/shots/${name}.html`;
fs.writeFileSync(out, src);
(async () => {
  const b = await puppeteer.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu']});
  const p = await b.newPage();
  await p.setViewport({width: +w, height: +h});
  await p.goto('file://' + out, {waitUntil: 'load'});
  await new Promise(r => setTimeout(r, 400));
  const r = await p.evaluate(() => {
    const root = document.querySelector('x-dc > div') || document.body;
    const wraps = [];
    document.querySelectorAll('*').forEach(e => {
      const cs = getComputedStyle(e);
      if (cs.overflow !== 'visible' && e.scrollWidth > e.clientWidth + 1 && e.children.length === 0) wraps.push('H-OVERFLOW: ' + e.textContent.trim().slice(0, 60));
      if (cs.overflow !== 'visible' && e.scrollHeight > e.clientHeight + 1 && e !== root) wraps.push('V-OVERFLOW(' + e.tagName + '): ' + e.textContent.trim().replace(/\s+/g,' ').slice(0, 60));
    });
    return {docScrollH: document.documentElement.scrollHeight, rootClientH: root.clientHeight, rootScrollH: root.scrollHeight, rootScrollW: root.scrollWidth, rootClientW: root.clientWidth, issues: wraps.slice(0, 20)};
  });
  await p.screenshot({path: `${__dirname}/shots/${name}.png`});
  console.log(name, JSON.stringify(r));
  await b.close();
})();
