// 화면 점검: 접근성(axe) · 가로 넘침 · 콘솔 오류 · 모든 시트 열기 · 조각 파일 지연 로딩 · 키보드 탭 · 오프라인 · 역사 내용 구조
// 사용법: npm install && npx playwright install chromium && npm test   (실패가 있으면 종료 코드 1)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.md': 'text/markdown' };
const EXTERNAL = /googleapis|gstatic|open-meteo|er-api|currency-api|unpkg|jsdelivr|openstreetmap|nominatim/;

const results = [];
const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, detail }); if(!pass) console.log('  ✗', name, detail !== undefined ? '→ ' + JSON.stringify(detail).slice(0, 300) : ''); };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, () => res({ srv, base: 'http://localhost:' + srv.address().port + '/index.html' }));
  });
}

const SHEETS = [['__openPlay', 'playScrim'], ['__openFoodMap', 'foodScrim'], ['__openStory', 'storyScrim'], ['__openWorldcup', 'wcScrim'], ['__openPass', 'passScrim'], ['__openBingo', 'bingoScrim'], ['__openTquiz', 'tquizScrim'], ['__openWheel', 'wheelScrim'], ['__openTitles', 'titleScrim'], ['__openCompass', 'compassScrim'], ['__openThai', 'thaiScrim'], ['__openScore', 'scoreScrim'], ['__openFortune', 'fortuneScrim'], ['__openEats', 'eatsScrim'], ['__openBaht', 'bahtScrim'], ['__openStretch', 'stretchScrim'], ['__openChill', 'chillScrim'], ['__openHistory', 'historyScrim']];
const TABS = ['golf', 'itin', 'stay', 'cost', 'todo'];

async function open(browser, base, w, h, opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, serviceWorkers: opt.sw ? 'allow' : 'block' });
  const page = await ctx.newPage(); const errs = [], reqs = [], atLoad = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if(m.type() === 'error' && !/net::|Failed to load|ERR_/.test(m.text())) errs.push(m.text()); });
  page.on('request', r => reqs.push(path.basename(new URL(r.url()).pathname)));
  page.on('load', () => atLoad.push(...reqs));
  await page.route(EXTERNAL, r => r.abort());
  if(opt.block) await page.route(opt.block, r => r.abort());
  await page.goto(base);
  // "이번 업데이트" 안내창은 새 버전을 처음 열 때 뜨므로, 뜰 때까지 잠깐 기다렸다가 닫아요
  try { await page.waitForSelector('#wnScrim.on', { timeout: 3000 }); } catch (e) {}
  await page.evaluate(() => { const c = document.getElementById('wnClose'); c && c.click(); });
  await page.waitForFunction(() => { const s = document.getElementById('wnScrim'); return !s || s.hidden || !s.classList.contains('on'); }, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  return { ctx, page, errs, reqs, atLoad };
}
const axe = (page, sel) => page.evaluate(async sel => {
  if(!window.axe) return ['axe-missing'];
  const r = await axe.run(sel ? document.querySelector(sel) : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } });
  return r.violations.map(v => v.id + ':' + v.nodes.length);
}, sel);
const smallTargets = (page, root) => page.evaluate(root => [...document.querySelector(root).querySelectorAll('button,a[href],[role=button],input,select,summary')].filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent !== null && r.width > 0 && !e.disabled && !e.closest('.leaflet-control-container') && (r.height < 44 || r.width < 44); }).map(e => (e.id || e.className || e.tagName).toString().slice(0, 30) + ':' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)), root);

(async () => {
  const { srv, base } = await serve();
  const browser = await chromium.launch();
  try {
    // 1) 홈·탭: 오류 없음 · 넘침 없음 · axe · 처음 로딩 때 큰 조각을 받지 않음
    for (const [w, h] of [[390, 844], [320, 640], [1280, 800]]) {
      const { ctx, page, errs, atLoad } = await open(browser, base, w, h);
      await page.addScriptTag({ content: AXE });
      ok(`홈 ${w}px: 처음 로딩에 지연 조각(play/story/foodmap/thai)을 받지 않음`, !atLoad.some(n => /^(play|story|foodmap|thai)\.js$/.test(n)), atLoad);
      ok(`홈 ${w}px: axe`, (await axe(page)).length === 0, await axe(page));
      for (const t of TABS) {
        await page.locator(`[data-t="${t}"]`).first().click(); await page.waitForTimeout(300);
        ok(`${t} 탭 ${w}px: 가로 넘침 없음`, !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
        if(w < 500) { const v = await axe(page, '#' + t); ok(`${t} 탭 ${w}px: axe`, v.length === 0, v); }
      }
      ok(`${w}px: 콘솔·페이지 오류 없음`, errs.length === 0, errs);
      await ctx.close();
    }
    // 2) 모든 시트: 처음 눌러서 열림 · axe · 터치 영역 · 넘침
    {
      const { ctx, page, errs } = await open(browser, base, 390, 844);
      await page.addScriptTag({ content: AXE });
      for (const [fn, id] of SHEETS) {
        await page.evaluate(fn => window[fn] && window[fn](), fn);
        let opened = true; try { await page.waitForSelector('#' + id + '.on', { timeout: 6000 }); } catch (e) { opened = false; }
        ok(`시트 ${fn}: 열림`, opened);
        if(opened) {
          await page.waitForTimeout(500);
          const v = await axe(page, '#' + id); ok(`시트 ${fn}: axe`, v.length === 0, v);
          const s = await smallTargets(page, '#' + id); ok(`시트 ${fn}: 터치 영역 44px`, s.length === 0, s);
          ok(`시트 ${fn}: 가로 넘침 없음`, !(await page.evaluate(id => { const e = document.querySelector('#' + id + ' .wn-sheet'); return e ? e.scrollWidth > e.clientWidth + 1 : false; }, id)));
        }
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      }
      ok('시트 전체: 콘솔·페이지 오류 없음', errs.length === 0, errs);
      await ctx.close();
    }
    // 3) 조각 파일이 막혀도 앱은 살아 있음
    for (const name of ['play', 'story', 'foodmap', 'thai']) {
      const { ctx, page, errs } = await open(browser, base, 390, 844, { block: new RegExp(name + '\\.js') });
      await page.evaluate(() => { (window.__openHistory || window.__openThai || window.__openFoodMap)(); });
      await page.waitForTimeout(1500);
      ok(`${name}.js 차단: 앱이 계속 동작`, await page.evaluate(() => !!document.getElementById('main')) && errs.length === 0, errs);
      await ctx.close();
    }
    // 4) 역사 시트: 내용 구조와 키보드 탭
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      await page.evaluate(() => window.__openHistory()); await page.waitForSelector('#historyScrim.on'); await page.waitForTimeout(400);
      const t = await page.evaluate(() => [...document.querySelectorAll('.hs-item')].map(li => ({ kr: !!li.querySelector('.hs-kr'), year: !!li.querySelector('.hs-year') })));
      ok('역사 연표: 모든 항목에 때와 "같은 때 우리나라"가 있음', t.length >= 20 && t.every(x => x.kr && x.year), { n: t.length });
      const sel = () => page.evaluate(() => [...document.querySelectorAll('#hsTabs [role=tab]')].map(b => b.getAttribute('aria-selected') + b.tabIndex).join(' '));
      ok('탭: 처음엔 첫 탭만 Tab 진입', (await sel()) === 'true0 false-1 false-1', await sel());
      await page.keyboard.press('ArrowRight'); ok('탭: → 로 다음 탭', (await sel()) === 'false-1 true0 false-1', await sel());
      await page.keyboard.press('End'); ok('탭: End 로 마지막 탭', (await sel()) === 'false-1 false-1 true0', await sel());
      await page.keyboard.press('Home'); ok('탭: Home 으로 첫 탭', (await sel()) === 'true0 false-1 false-1', await sel());
      ok('탭 패널 연결', await page.evaluate(() => { const b = document.getElementById('hsBody'); return b.getAttribute('role') === 'tabpanel' && !!document.getElementById(b.getAttribute('aria-labelledby')); }));
      await ctx.close();
    }
    // 4-2) 읽어보는 카드: 홈 제목은 처음부터 보이고, 열면 오늘의 추천 4장
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      ok('홈 놀이터 카드: "오늘의 이야기 · 제목"이 보임', /^오늘의 이야기 · .{2,}/.test(await page.evaluate(() => (document.querySelector('#playCard .pc-txt span') || {}).textContent || '')));
      await page.evaluate(() => window.__openStory()); await page.waitForSelector('#storyScrim.on', { timeout: 6000 }); await page.waitForTimeout(500);
      ok('읽어보는 카드: 오늘의 추천이 4장', (await page.evaluate(() => window.__storyInfo().n)) === 4, await page.evaluate(() => window.__storyInfo()));
      await ctx.close();
    }
    // 5) 서비스 워커: 오프라인에서도 열림 · 버전 교체 시 옛 저장소 삭제
    {
      const { ctx, page } = await open(browser, base, 390, 844, { sw: true });
      let ctl = true; try { await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, { timeout: 10000 }); } catch (e) { ctl = false; }
      ok('서비스 워커: 등록되어 화면을 제어함', ctl);
      await page.waitForTimeout(4500);
      await ctx.setOffline(true); await page.reload(); await page.waitForTimeout(800);
      ok('오프라인 새로고침: 화면이 열림', await page.evaluate(() => !!document.getElementById('main')));
      await page.evaluate(() => { const c = document.getElementById('wnClose'); c && c.click(); window.__openHistory(); });
      let h = true; try { await page.waitForSelector('#historyScrim.on', { timeout: 5000 }); } catch (e) { h = false; }
      ok('오프라인: 역사 시트가 열림', h);
      await ctx.setOffline(false);
      const keys0 = await page.evaluate(async () => JSON.stringify(await caches.keys()));
      await page.evaluate(() => navigator.serviceWorker.register('sw.js?v=99.99')); await page.waitForTimeout(3500);
      const keys1 = await page.evaluate(async () => JSON.stringify(await caches.keys()));
      ok('버전 교체: 옛 저장소가 지워지고 새 저장소가 생김', keys1 === '["thai2026-99.99"]' && keys0 !== keys1, { keys0, keys1 });
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
  const fail = results.filter(r => !r.pass);
  console.log(`\n${results.length - fail.length}/${results.length} 통과` + (fail.length ? `, ${fail.length}건 실패` : ''));
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
