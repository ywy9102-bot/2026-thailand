#!/usr/bin/env node
// 첫 화면용 스타일(critical CSS)을 만들어 index.html 안의 <style id="critical"> 에 넣어요.
// 왜: style.css(약 140KB)를 다 받을 때까지 첫 화면이 안 그려지는 걸 줄이려는 거예요.
//     첫 화면에 실제로 쓰인 규칙만 골라 HTML에 직접 넣고, 전체 style.css는 뒤따라 받아요(app.js는 그 뒤에 실행).
// 사용법: npm install && npx playwright install chromium && npm run critical   (style.css를 고치면 다시 실행)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require('playwright');
const postcss = require('postcss');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png' };
const EXTERNAL = /googleapis|gstatic|open-meteo|er-api|currency-api|unpkg|jsdelivr|openstreetmap|nominatim/;
const VIEWPORTS = [[320, 640], [390, 844], [768, 1024], [1280, 800]];   // 미디어쿼리 구간을 넓게 덮어요

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(rsp);
    }).listen(0, () => res({ srv, base: 'http://localhost:' + srv.address().port + '/index.html' }));
  });
}
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);

(async () => {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const { srv, base } = await serve();
  const browser = await chromium.launch();
  const used = [];
  for (const [w, h] of VIEWPORTS) {
    // 서비스 워커·저장본 없이, 처음 방문하는 상태로 측정해요
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.route(EXTERNAL, r => r.abort());
    await page.coverage.startCSSCoverage();
    await page.goto(base); await page.waitForTimeout(1800);
    await page.evaluate(() => { const c = document.getElementById('wnClose'); c && c.click(); }); await page.waitForTimeout(600);
    const cov = await page.coverage.stopCSSCoverage();
    const e = cov.find(x => /style\.css/.test(x.url));
    if(!e || e.text !== css) throw new Error('style.css 측정 대상을 찾지 못했어요 (' + (e ? '내용 불일치' : '없음') + ')');
    used.push(...e.ranges);
    await ctx.close();
  }
  await browser.close(); srv.close();

  const hit = (a, b) => used.some(r => r.start < b && r.end > a);   // [a,b) 범위가 한 번이라도 쓰였는지
  const root = postcss.parse(css);
  const keep = new Set();   // 살릴 노드
  const names = new Set();  // 살린 규칙이 가리키는 keyframes 이름
  root.walkRules(r => {
    if(r.parent && r.parent.type === 'atrule' && /keyframes/i.test(r.parent.name)) return;
    if(hit(r.source.start.offset, r.source.end.offset + 1)) {
      keep.add(r);
      r.walkDecls(/^animation(-name)?$/, d => { d.value.split(/[\s,]+/).forEach(t => names.add(t)); });
    }
  });
  const out = postcss.root();
  const copy = (node, into) => {
    if(node.type === 'comment') return;
    if(node.type === 'rule' && keep.has(node)) { into.append(node.clone()); return; }
    if(node.type === 'atrule') {
      if(/keyframes/i.test(node.name)) { if(names.has(node.params)) into.append(node.clone()); return; }
      if(/^(font-face|charset|import)$/i.test(node.name)) { into.append(node.clone()); return; }
      if(node.nodes) { const shell = node.clone({ nodes: [] }); node.each(ch => copy(ch, shell)); if(shell.nodes && shell.nodes.length) into.append(shell); }
    }
  };
  root.each(n => copy(n, out));
  // 주석·불필요한 줄바꿈 정리 (문자열 안의 공백은 건드리지 않도록 규칙 단위로만 압축)
  let critical = out.toString().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n+/g, '\n').replace(/[ \t]*\n[ \t]*/g, '');
  critical = `/* style.css(${sha(css)}) 중 첫 화면에 쓰인 규칙 — scripts/build-critical.js 로 만들어요. 직접 고치지 마세요 */` + critical;

  const hp = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(hp, 'utf8');
  const re = /<!--critical:start-->[\s\S]*?<!--critical:end-->/;
  if(!re.test(html)) throw new Error('index.html 에 <!--critical:start--> ... <!--critical:end--> 표시가 없어요');
  fs.writeFileSync(hp, html.replace(re, () => `<!--critical:start--><style id="critical">${critical}</style><!--critical:end-->`));
  console.log(`critical CSS ${Buffer.byteLength(critical)}B (style.css ${Buffer.byteLength(css)}B 중 ${(Buffer.byteLength(critical) / Buffer.byteLength(css) * 100).toFixed(0)}%), 규칙 ${keep.size}개, 해시 ${sha(css)}`);
})().catch(e => { console.error(e); process.exit(1); });
