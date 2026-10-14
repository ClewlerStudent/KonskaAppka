// usage: node render_all.cjs  -> renders every board from canvas.json, prints overflow summary
const fs = require('fs'), path = require('path');
const S = path.resolve(__dirname, '..');
const puppeteer = require(S + '/mmdc/node_modules/puppeteer');
const P = S + '/mockups/project';
const canvas = JSON.parse(fs.readFileSync(P + '/canvas.json', 'utf8'));
(async () => {
  const b = await puppeteer.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu']});
  const out = [];
  for (const [file, bd] of Object.entries(canvas.boards)) {
    const name = file.replace('.dc.html', '');
    if (!fs.existsSync(P + '/' + file)) { out.push({name, missing: true}); continue; }
    let w = bd.w, h = bd.h;
    if (name.startsWith('Wyswietlacz')) { w = 1920; h = 1080; }
    const src = fs.readFileSync(P + '/' + file, 'utf8').replace(/<script src="\.\/support\.js"><\/script>/, '').replace(/\{\{accent\}\}/g, '#8A5230');
    const html = `${__dirname}/shots/${name}.html`; fs.writeFileSync(html, src);
    const p = await b.newPage(); await p.setViewport({width: w, height: Math.min(h, 1200)});
    await p.goto('file://' + html, {waitUntil: 'load'}); await new Promise(r => setTimeout(r, 250));
    const r = await p.evaluate(() => {
      const root = document.querySelector('x-dc > div') || document.body;
      const bad = [];
      document.querySelectorAll('*').forEach(e => {
        const cs = getComputedStyle(e);
        if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible') bad.push(e.textContent.trim().slice(0, 50));
      });
      // wordmark check
      const wm = [...document.querySelectorAll('span')].filter(s => s.textContent.trim() === 'EQUENOR');
      const wmBad = wm.filter(s => { const r = s.getBoundingClientRect(); const pr = s.parentElement.getBoundingClientRect(); return r.right > pr.right + 1 || r.height > parseFloat(getComputedStyle(s).fontSize) * 1.9; }).length;
      return {rootW: root.scrollWidth, rootCW: root.clientWidth, rootH: root.scrollHeight, rootCH: root.clientHeight, bad: bad.filter(t => !/Szukaj|Cyfra|Kod z SMS/.test(t)).slice(0, 4), wm: wm.length, wmBad};
    });
    await p.screenshot({path: `${__dirname}/shots/${name}.png`, fullPage: !!bd.expand});
    await p.close();
    out.push({name, w, h, fill: !!bd.expand, ...r});
  }
  await b.close();
  for (const o of out) {
    const flags = [];
    if (o.missing) flags.push('MISSING');
    else {
      if (o.rootW > o.rootCW + 1) flags.push('H-OVERFLOW root');
      if (!o.fill && o.rootH > o.h + 1) flags.push(`root ${o.rootH} > ${o.h}`);
      if (o.bad.length) flags.push('clipped: ' + o.bad.join(' | '));
      if (o.wmBad) flags.push('WORDMARK wraps/overflows');
    }
    console.log((flags.length ? '!! ' : 'ok ') + o.name + (o.wm ? ` [EQUENOR x${o.wm}]` : '') + (flags.length ? '  ' + flags.join('; ') : ''));
  }
})();
