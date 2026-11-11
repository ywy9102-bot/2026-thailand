// 화면 점검: 접근성(axe) · 가로 넘침 · 콘솔 오류 · 모든 시트 열기 · 조각 파일 지연 로딩 · 키보드 탭 · 오프라인 · 역사 내용 구조
// 사용법: npm install && npx playwright install chromium && npm test   (실패가 있으면 종료 코드 1)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.md': 'text/markdown' };
const EXTERNAL = /raw\.githubusercontent|wikimedia|googleapis|gstatic|open-meteo|er-api|currency-api|unpkg|jsdelivr|openstreetmap|nominatim/;

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

const SHEETS = [['__openPlay', 'playScrim'], ['__openFoodMap', 'foodScrim'], ['__openStory', 'storyScrim'], ['__openCompass', 'compassScrim'], ['__openThai', 'thaiScrim'], ['__openScore', 'scoreScrim'], ['__openChill', 'chillScrim'], ['__openHistory', 'historyScrim'], ['__openTrailer', 'trailerScrim'], ['__openNews', 'newsScrim']];
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
  if(opt.news) await page.route(/raw\.githubusercontent\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(opt.news) }));
  if(opt.clock) await page.clock.setFixedTime(new Date(opt.clock));
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
    for (const name of ['play', 'story', 'foodmap', 'thai', 'learn']) {
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
      // 연도 롤러와 카드로 보기
      ok('연도 롤러: 처음엔 첫 항목의 연도', await page.evaluate(() => document.querySelector('.hs-roll-n').textContent === '1 / 25'));
      await page.evaluate(() => { const b = document.getElementById('hsBody'); b.scrollTop = 1500; }); await page.waitForTimeout(300);
      ok('연도 롤러: 스크롤하면 숫자가 넘어감', await page.evaluate(() => { const n = document.querySelector('.hs-roll-n').textContent; return n !== '1 / 25' && /년|세기/.test(document.querySelector('.hs-roll-y').textContent); }));
      await page.click('[data-view=card]');
      ok('카드로 보기: 1 / 25, 앞면은 태국 이야기', await page.evaluate(() => document.querySelector('.hc-prog').textContent === '1 / 25' && !document.getElementById('hcFace').classList.contains('back')));
      await page.click('[data-flip]');
      ok('카드 뒤집기: 같은 때 우리나라 면', await page.evaluate(() => document.getElementById('hcFace').classList.contains('back') && /같은 때 우리나라/.test(document.getElementById('hcFace').textContent)));
      await page.click('[data-nav="1"]');
      ok('카드 다음: 2 / 25, 앞면으로', await page.evaluate(() => document.querySelector('.hc-prog').textContent === '2 / 25' && !document.getElementById('hcFace').classList.contains('back')));
      await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
      ok('카드 이전(키보드): 처음에서 한 번 더 가면 마지막', await page.evaluate(() => document.querySelector('.hc-prog').textContent === '25 / 25'));
      await page.click('[data-view=list]');
      await page.focus('#hsTabs [aria-selected=true]');
            const sel = () => page.evaluate(() => [...document.querySelectorAll('#hsTabs [role=tab]')].map(b => b.getAttribute('aria-selected') + b.tabIndex).join(' '));
      ok('탭: 처음엔 첫 탭만 Tab 진입', (await sel()) === 'true0 false-1 false-1 false-1', await sel());
      await page.keyboard.press('ArrowRight'); ok('탭: → 로 다음 탭', (await sel()) === 'false-1 true0 false-1 false-1', await sel());
      await page.keyboard.press('End'); ok('탭: End 로 마지막 탭', (await sel()) === 'false-1 false-1 false-1 true0', await sel());
      await page.keyboard.press('Home'); ok('탭: Home 으로 첫 탭', (await sel()) === 'true0 false-1 false-1 false-1', await sel());
      // 퀴즈 탭: 6문제를 끝까지 풀고 결과가 나옴
      await page.click('#hsTabs [data-id=quiz]');
      await page.click('[data-act=start]');
      for (let i = 0; i < 6; i++) { await page.click('.hq-opt'); await page.click('.hq-go'); }
      ok('역사 퀴즈: 6문제를 풀면 결과가 나옴', await page.evaluate(() => /\/ 6 맞혔어요/.test(document.getElementById('hsBody').textContent)));
      ok('같은 때 우리나라 짝: 15개 넘게 연결됨', await page.evaluate(() => window.__historyInfo().kr >= 15), await page.evaluate(() => window.__historyInfo().kr));
      await page.click('[data-act=kr]');
      ok('같은 때 우리나라 문제: 보기 4개, 태국 사건이 문제에 나옴', await page.evaluate(() => document.querySelectorAll('.hq-opt').length === 4 && /같은 때 우리나라/.test(document.querySelector('.hq-q').textContent)));
      for (let i = 0; i < 6; i++) { await page.click('.hq-opt'); await page.click('.hq-go'); }
      ok('같은 때 우리나라 6문제를 풀면 결과가 나옴', await page.evaluate(() => /\/ 6 맞혔어요/.test(document.getElementById('hsBody').textContent)));
      await page.click('#hsTabs [data-id=time]');
      ok('탭 패널 연결', await page.evaluate(() => { const b = document.getElementById('hsBody'); return b.getAttribute('role') === 'tabpanel' && !!document.getElementById(b.getAttribute('aria-labelledby')); }));
      await ctx.close();
    }
    // 4-1) 오늘의 한 문제 · 갈 곳 미리 읽기 · 연표↔여행지 연결 (방콕 12/27 낮으로 시계를 맞춤)
    {
      const { ctx, page } = await open(browser, base, 390, 844, { clock: '2026-12-27T10:00:00+07:00' });
      ok('갈 곳 미리 읽기: 12/27엔 내일(12/28) 카드가 보임', await page.evaluate(() => { const c = document.getElementById('eveCard'); return c.style.display !== 'none' && /내일/.test(c.textContent) && /왕궁/.test(c.textContent); }));
      await page.click('#eveCard'); await page.waitForSelector('#historyScrim.on'); await page.waitForTimeout(400);
      ok('미리 읽기 카드 → 여행지 탭의 왕궁으로 이동', await page.evaluate(() => document.querySelector('#hsTabs [aria-selected=true]').dataset.id === 'sight' && document.activeElement.dataset.t === '왕궁'));
      for (const n of ['왕궁', '왓 포', '왓 아룬']) await page.click(`.hs-item[data-t="${n}"] .hs-read`);
      ok('여행지 읽음 표시: 개수가 올라가고 눌림 상태가 바뀜', await page.evaluate(() => document.querySelector('.hs-prog').textContent.includes('3 / 6') && document.querySelector('.hs-item[data-t="왕궁"] .hs-read').getAttribute('aria-pressed') === 'true'));
      ok('미리 읽기 카드: 그날 갈 곳을 다 읽으면 표시', await page.evaluate(() => /다 읽었어요/.test(document.getElementById('evT').textContent)));
      await page.click('.hs-item[data-t="왕궁"] .hs-link');
      ok('여행지 → 연표 칩: 연표의 방콕 시대 항목으로 이동', await page.evaluate(() => document.querySelector('#hsTabs [aria-selected=true]').dataset.id === 'time' && document.activeElement.dataset.t === '방콕 시대의 시작'));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      await page.click('#dqCard'); await page.waitForSelector('#historyScrim.on'); await page.waitForTimeout(400);
      await page.click('.hq-opt'); await page.click('.hq-go');
      ok('오늘의 한 문제: 풀면 완료 표시와 연속 1일', await page.evaluate(() => /오늘의 한 문제/.test(document.getElementById('hsBody').textContent) && JSON.parse(localStorage.getItem('thai2026_hsdaily')).streak === 1));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      ok('홈 카드가 완료로 바뀜', await page.evaluate(() => /오늘 문제 완료/.test(document.getElementById('dqT').textContent)));
      await ctx.close();
    }
    // 4-1b) 여행 예고편: 열기 · 넘기기 · 기대돼요 ♥ · 홈 카드 갱신
    {
      const { ctx, page } = await open(browser, base, 390, 844, { clock: '2026-10-26T12:00:00+09:00' });
      ok('예고편 카드: 출발까지 남은 날이 보임', await page.evaluate(() => /D-51/.test(document.getElementById('trT').textContent)));
      await page.click('#trCard'); await page.waitForSelector('#trailerScrim.on'); await page.waitForTimeout(400);
      ok('예고편: 자동 넘김 중에는 낭독기 알림을 꺼 둠', await page.evaluate(() => document.getElementById('trStage').getAttribute('aria-live') === 'off'));
      ok('예고편: 첫 장은 D-51 · 잠 51번', await page.evaluate(() => /D-51 · 잠 51번/.test(document.getElementById('trStage').textContent) && document.getElementById('trCount').textContent === '1 / 20'));
      await page.click('#trNext');
      await page.waitForSelector('.tr-photo.fail', { timeout: 5000 });
      ok('예고편: 사진을 못 불러오면 이모지 화면으로 바뀜', await page.evaluate(() => getComputedStyle(document.querySelector('.tr-photo.fail .tr-badge')).fontSize === '72px'));
      ok('예고편: 두 번째 장은 12/16 도착', await page.evaluate(() => /12\/16/.test(document.querySelector('.tr-date').textContent)));
      await page.click('.tr-heart');
      ok('기대돼요 ♥: 눌림 상태와 홈 카드 갱신', await page.evaluate(() => document.querySelector('.tr-heart').getAttribute('aria-pressed') === 'true' && /♥ 1일/.test(document.getElementById('trT').textContent)));
      for (let i = 0; i < 18; i++) await page.click('#trNext');
      ok('예고편: 마지막 장에 기대되는 날이 모임', await page.evaluate(() => document.getElementById('trCount').textContent === '20 / 20' && /기대되는 날 1일/.test(document.getElementById('trStage').textContent)));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      await ctx.close();
    }
    // 4-1c) 라운드 카드: 버디 부각(카드·홀 고르기·리더보드 버디왕·골프 카드 띠)
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      await page.evaluate(() => window.__openScore()); await page.waitForSelector('#scoreScrim.on'); await page.waitForTimeout(400);
      await page.click('.sc-card >> nth=0 >> [data-act=bp]'); await page.click('.sc-card >> nth=0 >> [data-act=bp]');
      ok('버디 카드: 버디 2개가 크게 표시되고 카드가 강조됨', await page.evaluate(() => { const c = document.querySelector('.sc-card'); return c.classList.contains('bird') && c.querySelector('.sc-bnum b').textContent === '2' && c.querySelector('.sc-birds').textContent === '🐦🐦'; }));
      await page.click('[data-act=hole][data-h="5"]');
      ok('버디 홀 고르기: 5번 홀이 표시됨', await page.evaluate(() => /5번 홀/.test(document.querySelector('.sc-bh').textContent)));
      await page.click('#scoreScrim .wh-tab[data-id=lb]');
      ok('리더보드: 버디왕이 크게 나옴', await page.evaluate(() => { const k = document.querySelector('.sc-king'); return !!k && /버디왕/.test(k.textContent) && k.querySelector('b').textContent === '2'; }));
      await page.click('#scClose'); await page.waitForTimeout(450);
      ok('골프 카드: 버디 띠가 그 라운드 카드에 나옴', await page.evaluate(() => { const b = [...document.querySelectorAll('.g-bird:not([hidden])')]; return b.length === 1 && /버디 2개/.test(b[0].textContent); }));
      await ctx.close();
    }
    // 4-1d) 첫 화면 버디 카드: 합계·누가·언제·몇 번째, 새 버디 안내는 최대 3번
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      await page.evaluate(() => window.__openScore()); await page.waitForSelector('#scoreScrim.on'); await page.waitForTimeout(400);
      await page.click('.sc-card >> nth=0 >> [data-act=bp]'); await page.click('.sc-card >> nth=0 >> [data-act=bp]');
      await page.click('[data-act=hole][data-h="9"]');
      await page.click('#scClose'); await page.waitForTimeout(450);
      ok('첫 화면 버디 카드: 합계와 사람별 개수', await page.evaluate(() => { const c = document.getElementById('birdCard'); return !c.hidden && document.getElementById('birdTotal').textContent === '우리 버디 2개' && /윤우열 2/.test(document.getElementById('birdWho').textContent); }));
      await page.click('#birdHead');
      ok('버디 기록: 누가·언제·몇 번째·홀', await page.evaluate(() => { const li = [...document.querySelectorAll('#birdLog li')]; return li.length === 2 && /윤우열/.test(li[0].textContent) && /2번째 버디/.test(li[0].textContent) && /\d+\/\d+ (오전|오후)/.test(li[0].textContent) && /9번 홀/.test(li[0].textContent) && /1번째 버디/.test(li[1].textContent); }));
      await page.reload();
      try { await page.waitForSelector('#wnScrim.on', { timeout: 3000 }); } catch (e) {}
      await page.evaluate(() => { const c = document.getElementById('wnClose'); c && c.click(); });
      await page.waitForSelector('#birdNotice.on', { timeout: 10000 });
      ok('버디 소식 공지: 첫 화면을 열면 합계와 최근 버디가 뜸', await page.evaluate(() => /우리 버디 2개/.test(document.getElementById('bnTotal').textContent) && document.querySelectorAll('#bnList li').length === 2 && /윤우열/.test(document.getElementById('bnList').textContent)));
      await page.click('#bnOk'); await page.waitForTimeout(450);
      ok('버디 소식 공지: 확인하면 닫힘', await page.evaluate(() => document.getElementById('birdNotice').hidden));
      for (let i = 0; i < 3; i++) { await page.reload(); await page.waitForTimeout(700); }
      ok('새 버디 안내는 첫 화면을 열 때 최대 3번까지', await page.evaluate(() => JSON.parse(localStorage.getItem('thai2026_birdseen')).c === 3));
      await ctx.close();
    }
    // 4-1d2) 기사님께 보여주기 · 홈 화면 바로가기
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      ok('기사님께 보여주기 버튼이 있음', await page.evaluate(() => document.querySelectorAll('[data-driver]').length > 0));
      await page.evaluate(() => document.querySelector('[data-driver]').click()); await page.waitForTimeout(450);
      ok('기사님께 보여주기: 영어 이름·주소·태국어 3줄', await page.evaluate(() => { const n = document.getElementById('drvName'), a = document.getElementById('drvAddr'); return !!n && /[A-Za-z]/.test(n.textContent) && a.textContent.length > 5 && document.querySelectorAll('.drv-th').length === 3 && !n.closest('.wn-scrim').hidden; }));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      ok('기사님께 보여주기: Esc로 닫힘', await page.evaluate(() => document.getElementById('drvName').closest('.wn-scrim').hidden));
      await page.goto(base + '#open-food'); await page.reload();
      await page.waitForSelector('#foodScrim.on', { timeout: 8000 }).catch(() => {});
      ok('홈 화면 바로가기(#open-food)로 맛집 지도가 열림', await page.evaluate(() => document.getElementById('foodScrim').classList.contains('on') && location.hash === ''));
      await ctx.close();
    }
    // 4-1d3) 여행 중 카드(숙소로 가기·오늘의 한 장·날씨 맞춤) · 오프라인 띠
    {
      const pre = await open(browser, base, 390, 844, { clock: '2026-10-26T12:00:00+09:00' });
      ok('여행 전에는 숙소·오늘의 한 장 카드가 숨김', await pre.page.evaluate(() => document.getElementById('homeCard').hidden && document.getElementById('dayCard').hidden && document.getElementById('wxCard').hidden));
      await pre.ctx.close();
      const { ctx, page } = await open(browser, base, 390, 844, { clock: '2026-12-27T10:00:00+07:00' });
      ok('여행 중에는 숙소·오늘의 한 장 카드가 보임', await page.evaluate(() => !document.getElementById('homeCard').hidden && !document.getElementById('dayCard').hidden));
      await page.evaluate(() => { document.querySelector('header.hero').dataset.wx = 'rain'; document.dispatchEvent(new CustomEvent('wx:updated')); });
      ok('비 예보면 날씨 맞춤 카드가 실내 맛집을 권함', await page.evaluate(() => { const c = document.getElementById('wxCard'); return !c.hidden && /실내/.test(c.textContent); }));
      await page.evaluate(() => document.getElementById('homeCard').click()); await page.waitForTimeout(500);
      ok('숙소 고르기: 방콕(12/26 이후)이면 방콕 숙소 3곳', await page.evaluate(() => [...document.querySelectorAll('#spList [data-stay]')].map(b => b.dataset.stay).join() === 'tinidee,gcp,oakwood'));
      await page.evaluate(() => document.querySelector('#spList [data-stay="gcp"]').click()); await page.waitForTimeout(700);
      ok('숙소를 고르면 영어 이름·주소가 크게 뜸', await page.evaluate(() => /Grande Centre Point/.test(document.getElementById('drvName').textContent) && /Ratchadamri/.test(document.getElementById('drvAddr').textContent)));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      const dl = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
      await page.evaluate(() => document.getElementById('dayCard').click());
      const d = await dl; ok('오늘의 한 장: 이미지(PNG)로 저장됨', !!d && /^today-2026-12-27\.png$/.test(d.suggestedFilename()));
      // 노을 시계 · 한국 시계 · 나 모드
      ok('노을 시계: 일몰 시각(방콕 12/27 약 17:5x)과 남은 시간', await page.evaluate(() => { const t = document.getElementById('scT').textContent; return /일몰 17:5\d/.test(t) && /(시간|분)/.test(t); }));
      ok('한국 시계: 서울 시각이 카운트다운 아래에 표시', await page.evaluate(() => /서울 \d\d:\d\d · 한국이 2시간 빨라요/.test(document.getElementById('cdSub').textContent)));
      await page.evaluate(() => document.getElementById('homeCard').click()); await page.waitForTimeout(500);
      await page.evaluate(() => document.querySelector('#spWho [data-n="윤성욱"]').click()); await page.waitForTimeout(300);
      ok('나 모드: 윤성욱을 고르면 오크우드가 내 숙소로 맨 위', await page.evaluate(() => /내 숙소 · 오크우드/.test(document.querySelector('#spList [data-stay]').textContent) && JSON.parse(localStorage.getItem('thai2026_todo_v1')).myName === '윤성욱'));
      await page.evaluate(() => document.getElementById('spOk').click()); await page.waitForTimeout(500);
      ok('나 모드: 인사말에 이름, 숙소 카드는 바로 보여주기, 내 라운드 표시', await page.evaluate(() => /윤성욱님, /.test(document.getElementById('heroGreet').textContent) && /윤성욱님 숙소/.test(document.getElementById('hmT').textContent) && document.querySelectorAll('.gcard.mine').length > 0));
      await page.evaluate(() => document.getElementById('homeCard').click()); await page.waitForTimeout(700);
      ok('나 모드: 한 번에 내 숙소(Oakwood) 영어 주소가 크게 뜨고 다른 숙소 버튼이 있음', await page.evaluate(() => /Oakwood/.test(document.getElementById('drvName').textContent) && !document.getElementById('drvMore').hidden));
      await page.keyboard.press('Escape'); await page.waitForTimeout(450);
      await page.evaluate(() => document.getElementById('foodMapCard').click()); await page.waitForSelector('#foodScrim.on', { timeout: 6000 }).catch(() => {}); await page.waitForTimeout(900);
      ok('카드 펼침 전환: 맛집 지도가 열리고 전환 이름·임시 클래스가 정리됨', await page.evaluate(() => document.getElementById('foodScrim').classList.contains('on') && !document.getElementById('foodScrim').classList.contains('vt') && !document.getElementById('foodMapCard').style.viewTransitionName));
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
      await page.context().setOffline(true); await page.evaluate(() => window.dispatchEvent(new Event('offline'))); await page.waitForTimeout(200);
      ok('오프라인이면 위에 띠가 뜸', await page.evaluate(() => !document.getElementById('offBar').hidden && /끊겼/.test(document.getElementById('offBar').textContent)));
      await page.context().setOffline(false); await page.evaluate(() => window.dispatchEvent(new Event('online'))); await page.waitForTimeout(200);
      ok('다시 연결되면 띠가 사라짐', await page.evaluate(() => document.getElementById('offBar').hidden));
      await ctx.close();
    }
    // 4-1d3b) "오늘 일정" 카드: 태국 낮 시간에도 오늘 날짜의 일정이 나와야 함(UTC 날짜 오류 재발 방지)
    for (const [clock, want] of [['2026-12-28T13:00:00+07:00', '12/28'], ['2026-12-28T01:00:00+07:00', '12/28'], ['2026-12-28T23:30:00+07:00', '12/28'], ['2026-12-17T10:00:00+07:00', '12/17']]) {
      const { ctx, page } = await open(browser, base, 390, 844, { clock });
      const r = await page.evaluate(() => ({ tag: document.getElementById('ncTag').textContent, t: document.getElementById('ncT').textContent }));
      ok(`오늘 일정 카드(${clock.slice(5, 16)} 태국): 오늘(${want}) 일정이 "오늘"로`, /오늘/.test(r.tag) && r.t.startsWith(want));
      await ctx.close();
    }
    // 4-1d4) 히어로 연출: 오늘의 달 · 실제 일몰 하늘 · 도시 실루엣 · 열기 아지랑이 · 기울기
    {
      const { ctx, page } = await open(browser, base, 390, 844, { clock: '2026-12-24T22:00:00+07:00' });
      ok('보름달(12/24 밤): 히어로 달이 🌕', await page.evaluate(() => document.getElementById('skyOrb').textContent === '🌕'));
      ok('노을 시계 밤: 달 이름이 함께 보임(보름달)', await page.evaluate(() => /보름달/.test(document.getElementById('scT').textContent)));
      await ctx.close();
      const { ctx: c2, page: p2 } = await open(browser, base, 390, 844, { clock: '2026-12-18T17:40:00+07:00' });
      ok('실제 일몰(12/18 17:53) 기준: 17:40은 해질녘(dusk)', await p2.evaluate(() => document.querySelector('header.hero').dataset.sky === 'dusk'));
      ok('도시 실루엣: 파타야 선택이면 pat', await p2.evaluate(() => document.querySelector('header.hero').dataset.city === 'pat'));
      await p2.evaluate(() => document.querySelector('.wx-c[data-city="방콕"]').click()); await p2.waitForTimeout(400);
      ok('도시 실루엣: 방콕으로 바꾸면 bkk', await p2.evaluate(() => document.querySelector('header.hero').dataset.city === 'bkk'));
      await p2.evaluate(() => { document.getElementById('wxTemp').textContent = '33°C'; document.dispatchEvent(new CustomEvent('wx:updated')); });
      ok('33°C 이상이면 열기 아지랑이 켜짐', await p2.evaluate(() => document.querySelector('header.hero').dataset.heat === '1'));
      await p2.evaluate(() => { document.getElementById('wxTemp').textContent = '28°C'; document.dispatchEvent(new CustomEvent('wx:updated')); });
      ok('28°C면 아지랑이 꺼짐', await p2.evaluate(() => document.querySelector('header.hero').dataset.heat === undefined));
      await p2.evaluate(() => { window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { gamma: 20, beta: 40 })); window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { gamma: 20, beta: 52 })); }); await p2.waitForTimeout(200);
      ok('폰을 기울이면 히어로 층이 움직임(--tx)', await p2.evaluate(() => Math.abs(parseFloat(document.querySelector('header.hero').style.getPropertyValue('--tx'))) > 3 && !document.getElementById('tiltRow').hidden));
      await c2.close();
    }
    // 4-1d5) 히어로 연출 모음(hero.js): 일정 맞춤 장면 · 안개 · 바람 · 비행기 · 불꽃 · 반짝임 · 시차 · 창문
    {
      const mk = async (clock, w = 390, h = 844) => { const o = await open(browser, base, w, h, { clock }); await o.page.waitForFunction(() => !!window.__heroTick, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => window.__heroTick && window.__heroTick()); return o; };
      let o = await mk('2026-12-17T10:00:00+07:00');
      ok('일정 맞춤 장면: 골프날(12/17)은 golf', await o.page.evaluate(() => document.querySelector('header.hero').dataset.scene === 'golf'));
      ok('배: 파타야 보트가 있음', await o.page.evaluate(() => !!document.querySelector('.hx-boat.pat svg')));
      ok('야경 창문: 방콕 스카이라인에 창문이 생성됨', await o.page.evaluate(() => document.querySelectorAll('.hx-win rect').length > 20));
      await o.ctx.close();
      o = await mk('2026-12-19T10:00:00+07:00'); ok('일정 맞춤 장면: 12/19는 섬(island)', await o.page.evaluate(() => document.querySelector('header.hero').dataset.scene === 'island')); await o.ctx.close();
      o = await mk('2026-12-28T10:00:00+07:00'); ok('일정 맞춤 장면: 12/28은 사원(wat)', await o.page.evaluate(() => document.querySelector('header.hero').dataset.scene === 'wat')); await o.ctx.close();
      o = await mk('2026-12-25T10:00:00+07:00'); ok('일정 맞춤 장면: 일정 없는 날(12/25)은 없음', await o.page.evaluate(() => document.querySelector('header.hero').dataset.scene === undefined)); await o.ctx.close();
      o = await mk('2026-12-18T06:40:00+07:00'); ok('새벽 안개: 일출 직후(12/18 06:40)에 켜짐', await o.page.evaluate(() => document.querySelector('header.hero').dataset.mist === '1')); await o.ctx.close();
      o = await mk('2026-12-18T13:00:00+07:00'); ok('새벽 안개: 한낮에는 꺼짐', await o.page.evaluate(() => document.querySelector('header.hero').dataset.mist === undefined));
      await o.page.evaluate(() => { window.__wxNow = () => ({ wind: 30 }); window.__heroTick(); });
      ok('바람 구름: 풍속 30km/h면 구름이 빨라짐(--wf < 1)', await o.page.evaluate(() => parseFloat(document.querySelector('header.hero').style.getPropertyValue('--wf')) < 1 && document.querySelector('header.hero').dataset.wind === '1'));
      await o.page.evaluate(() => { window.__wxNow = () => ({ wind: 2 }); window.__heroTick(); });
      ok('바람 구름: 풍속 2km/h면 느려짐(--wf > 1)', await o.page.evaluate(() => parseFloat(document.querySelector('header.hero').style.getPropertyValue('--wf')) > 1));
      await o.ctx.close();
      o = await mk('2026-12-18T20:00:00+07:00');
      ok('하늘 위 비행기: OZ741 비행 중(12/18 20:00)에 표시', await o.page.evaluate(() => { const e = document.querySelector('.hx-plane'); const c = document.getElementById('flCard'); return !e.hidden && !c.hidden && /OZ741/.test(c.textContent) && /^도착까지/.test(document.getElementById('flT').textContent); }));
      await o.ctx.close();
      o = await mk('2026-12-20T20:00:00+07:00'); ok('하늘 위 비행기: 비행이 없는 시각에는 숨김', await o.page.evaluate(() => document.querySelector('.hx-plane').hidden && document.getElementById('flCard').hidden)); await o.ctx.close();
      o = await mk('2026-12-31T23:59:55+07:00');
      ok('자정 카운트다운: 23:59:55에 5가 보임', await o.page.evaluate(() => { const c = document.querySelector('.hx-count'); return !!c && c.textContent === '5'; })); await o.ctx.close();
      o = await mk('2027-01-01T00:00:03+07:00');
      await o.page.waitForTimeout(300);
      ok('자정 불꽃: 1/1 00:00에 불꽃 화면(canvas)이 생김', await o.page.evaluate(() => !!document.querySelector('.hx-fw') || !!localStorage.getItem('thai2026_ny27')));
      await o.ctx.close();
      o = await mk('2026-12-18T10:00:00+07:00');
      await o.page.evaluate(() => { const h = document.querySelector('header.hero'), r = h.getBoundingClientRect(); for (let i = 0; i < 6; i++) { h.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 80 + i * 6, clientY: r.top + 140, bubbles: true })); } });
      await o.page.waitForTimeout(120);
      ok('손가락 반짝임: 히어로를 문지르면 반짝임이 생김', await o.page.evaluate(() => window.__heroDebug().sparks > 0));
      await o.page.evaluate(() => { window.scrollTo({ top: 240, behavior: 'instant' }); }); await o.page.waitForTimeout(500);
      ok('스크롤 시차: 스크롤하면 --sy가 바뀜', await o.page.evaluate(() => parseFloat(document.querySelector('header.hero').style.getPropertyValue('--sy')) > 100));
      await o.page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' })); await o.page.waitForTimeout(600);
      ok('히어로가 화면 밖이면 애니메이션 멈춤(hero-off)', await o.page.evaluate(() => document.querySelector('header.hero').classList.contains('hero-off')));
      await o.ctx.close();
    }
    // 4-1d6) 히어로 놀이(hero.js): 별똥별 소원 · 새 떼 · 풍등 · 뚝뚝/파라세일 · 코끼리
    {
      const mk = async clock => { const o = await open(browser, base, 390, 844, { clock }); await o.page.waitForFunction(() => !!window.__heroFun, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => window.__heroTick && window.__heroTick()); await o.page.evaluate(() => { try { localStorage.removeItem('thai2026_hxfun'); } catch (e) {} }); return o; };
      const tap = (page, y) => page.evaluate(y => { const h = document.querySelector('header.hero'), r = h.getBoundingClientRect(); h.dispatchEvent(new MouseEvent('click', { clientX: r.left + 200, clientY: r.top + y, bubbles: true })); }, y);
      let o = await mk('2026-12-18T22:00:00+07:00');
      ok('히어로 놀이: 밤에는 하늘이 night', await o.page.evaluate(() => document.querySelector('header.hero').dataset.sky === 'night'));
      await o.page.evaluate(() => window.__heroFun.star());
      ok('별똥별: 밤에 별똥별이 나타남', await o.page.evaluate(() => !!document.querySelector('.hx-star')));
      await tap(o.page, 100); await o.page.waitForTimeout(200);
      ok('별똥별: 5초 안에 하늘을 누르면 소원이 저장됨', await o.page.evaluate(() => { try { return JSON.parse(localStorage.getItem('thai2026_hxfun')).wish === 1; } catch (e) { return false; } }));
      await o.ctx.close();
      o = await mk('2026-12-18T10:00:00+07:00');
      await tap(o.page, 90); await o.page.waitForTimeout(150);
      ok('새 떼: 낮에 하늘을 누르면 새가 날아감', await o.page.evaluate(() => document.querySelectorAll('.hx-bird').length >= 4 && document.querySelector('.hx-bird').getBoundingClientRect().width >= 20));
      await o.page.evaluate(() => { const h = document.querySelector('header.hero'), r = h.getBoundingClientRect(); h.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + 150, clientY: r.top + 260, bubbles: true, pointerType: 'touch' })); });
      await o.page.waitForTimeout(900);
      ok('풍등: 히어로를 길게 누르면 풍등이 뜨고 개수가 저장됨', await o.page.evaluate(() => !!document.querySelector('.hx-lantern') && JSON.parse(localStorage.getItem('thai2026_hxfun')).lantern === 1));
      await o.page.evaluate(() => window.__heroFun.startRide());
      ok('뚝뚝·파라세일: 지나가는 탈것이 생기고 누를 수 있는 크기(44px)', await o.page.evaluate(() => { const e = document.querySelector('.hx-ride'); if(!e) return false; const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
      await o.page.evaluate(() => { const e = document.getElementById('egFlag'); for (let i = 0; i < 6; i++) e.click(); });
      ok('코끼리: 국기를 6번 빠르게 누르면 코끼리가 지나감', await o.page.evaluate(() => !!document.querySelector('.hx-ele')));
      ok('히어로 놀이: 새 요소가 탭 순서에 끼지 않음(tabindex -1)', await o.page.evaluate(() => [...document.querySelectorAll('.hero-fx2 button')].every(b => b.tabIndex === -1)));
      ok('히어로 놀이: 콘솔 오류 없음', o.errs.length === 0, o.errs);
      await o.ctx.close();
    }
    // 4-1d7) 히어로 놀이 2: 골든아워 · 해/달 이야기 · 버디 새 · 밥시간 김 · 새벽 밴 · 도마뱀 · 신정 해돋이
    {
      const mk = async clock => { const o = await open(browser, base, 390, 844, { clock }); await o.page.waitForFunction(() => !!window.__heroFun, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => { try { localStorage.removeItem('thai2026_hxfun'); } catch (e) {} window.__heroFun.reset(); window.__tl = []; window.__toast = (k, m) => window.__tl.push(k + ' ' + m); window.__heroTick(); }); return o; };
      const tl = page => page.evaluate(() => (window.__tl || []).join(' | '));
      let o = await mk('2026-12-18T17:35:00+07:00');
      ok('골든아워: 일몰 30분 전에 하늘이 금빛(data-golden)이고 알림이 뜸', await o.page.evaluate(() => document.querySelector('header.hero').dataset.golden === '1') && /일몰 30분 전/.test(await tl(o.page)));
      await o.page.evaluate(() => window.__heroTick());
      ok('골든아워: 같은 날 알림은 한 번만', (await tl(o.page)).split('일몰 30분 전').length === 2);
      await o.ctx.close();
      o = await mk('2026-12-18T12:00:00+07:00');
      ok('골든아워: 한낮에는 꺼짐', await o.page.evaluate(() => document.querySelector('header.hero').dataset.golden === undefined));
      await o.page.evaluate(() => window.__heroFun.orbTalk());
      ok('해 이야기: 낮에 해를 누르면 일출·일몰 시각', /일출 \d\d:\d\d · 일몰 \d\d:\d\d/.test(await tl(o.page)));
      ok('밥시간 김: 점심(12:00)에 🍜 버튼이 뜨고 44px 이상', await o.page.evaluate(() => { const e = document.querySelector('.hx-meal'); if(!e) return false; const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
      await o.page.evaluate(() => { window.__openFoodMap = () => { window.__fmCalled = 1; }; document.querySelector('.hx-meal').click(); });
      ok('밥시간 김: 누르면 대동여지도가 열리고 버튼이 사라짐', await o.page.evaluate(() => window.__fmCalled === 1 && !document.querySelector('.hx-meal')));
      await o.page.evaluate(() => window.__heroFun.startGecko());
      ok('도마뱀: 나타나고 44px 이상, 누르면 알림', await o.page.evaluate(() => { const e = document.querySelector('.hx-gecko'); const r = e.getBoundingClientRect(); e.click(); return r.width >= 44; }) && /도마뱀/.test(await tl(o.page)));
      await o.page.evaluate(() => { document.dispatchEvent(new Event('hx:birdie')); window.__heroTick(); });
      await o.page.waitForTimeout(100);
      ok('버디 새: 버디를 기록하면 금빛 새가 히어로를 가로지름', await o.page.evaluate(() => !!document.querySelector('.hx-gbird')));
      await o.ctx.close();
      o = await mk('2026-12-18T21:00:00+07:00');
      await o.page.evaluate(() => window.__heroFun.orbTalk());
      ok('달 이야기: 밤에 달을 누르면 밝기와 보름달까지 남은 날', /밝기 \d+%/.test(await tl(o.page)) && /(보름달까지 \d+일|보름달 무렵)/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-17T06:20:00+07:00');
      ok('새벽 밴: 골프 밴 출발 10분 전에 헤드라이트 밴이 나타나고 알림', await o.page.evaluate(() => !!document.querySelector('.hx-van')) && /밴 출발 20분 전 \(06:30\)/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2027-01-01T06:45:00+07:00');
      ok('신정 해돋이: 1/1 일출 직후에 금빛 하늘(data-nysun)과 인사', await o.page.evaluate(() => document.querySelector('header.hero').dataset.nysun === '1') && /첫 해돋이/.test(await tl(o.page)));
      await o.ctx.close();
    }
    // 4-1d8) 히어로 놀이 3: 다가오는 비행기 · 가방 · 제목 태국어 · 활주로 · 도착 꽃비 · 취침 · 체크아웃 · 장면 탭 · 한국 집
    {
      const mk = async clock => { const o = await open(browser, base, 390, 844, { clock }); await o.page.waitForFunction(() => !!window.__heroFun, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => { try { localStorage.removeItem('thai2026_hxfun'); } catch (e) {} window.__heroFun.reset(); window.__tl = []; window.__toast = (k, m) => window.__tl.push(k + ' ' + m); window.__heroTick(); }); return o; };
      const tl = page => page.evaluate(() => (window.__tl || []).join(' | '));
      const size44 = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if(!e) return false; const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }, sel);
      let o = await mk('2026-11-20T10:00:00+09:00');
      ok('다가오는 비행기: 출발 전 하늘에 비행기가 있고 위치(left)가 6~68%', await o.page.evaluate(() => { const e = document.querySelector('.hx-come'); const l = parseFloat(e && e.style.left); return !!e && l >= 6 && l <= 68; }));
      ok('가방: 출발 전 가방(44px)과 준비율 막대가 보임', await size44(o.page, '.hx-bag') && await o.page.evaluate(() => /^scaleX\(/.test(document.querySelector('.hx-bag i').style.transform)));
      ok('가방: 다 안 찼을 때는 움직이지 않음(애니메이션 없음)', await o.page.evaluate(() => { const b = document.querySelector('.hx-bag'); return !b.hasAttribute('data-full') && getComputedStyle(b.querySelector('.hx-bag-e')).animationName === 'none'; }));
      await o.page.evaluate(() => { const g = TODO.find(x => x.g === '🧳 출발 준비'); g.items.forEach(i => { store.done[i] = true; }); window.__heroTick(); });
      ok('가방: 준비를 다 체크하면 가득 차고 "짐 다 쌌어요" 알림', await o.page.evaluate(() => document.querySelector('.hx-bag').dataset.full === '1' && /^scaleX\(1(\.0+)?\)$/.test(document.querySelector('.hx-bag i').style.transform)) && /짐 다 쌌어요/.test(await tl(o.page)));
      await o.page.evaluate(() => document.querySelector('header.hero .title').dispatchEvent(new MouseEvent('click', { bubbles: true })));
      ok('제목 태국어: 제목을 누르면 태국어 한마디가 알림으로 나옴', /🇹🇭 .+ — .+/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-15T21:00:00+09:00');
      ok('출발 전날 밤: 활주로 불빛과 알림', await o.page.evaluate(() => !!document.querySelector('.hx-runway')) && /내일 출발/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-16T11:20:00+07:00');
      ok('도착 순간: OZ743 도착 직후 꽃비와 알림', await o.page.evaluate(() => document.querySelectorAll('.hx-flower').length > 0) && /윤우열 태국 도착/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-16T22:00:00+07:00');
      ok('취침: 골프 전날 밤에 💤와 "내일 06:30 골프 밴" 알림', await o.page.evaluate(() => !!document.querySelector('.hx-zzz')) && /내일 06:30 골프 밴/.test(await tl(o.page)));
      ok('한국 집: 한국이 밤(12/17 00:00)이면 🏠이 뜨고 누르면 한국 시각', await size44(o.page, '.hx-home') && await o.page.evaluate(() => { document.querySelector('.hx-home').click(); return true; }) && /한국은 지금 00:00/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-30T09:00:00+07:00');
      ok('체크아웃 날: 12/30 아침에 가방 버튼이 뜨고 이동 안내', await size44(o.page, '.hx-bag') && await o.page.evaluate(() => { document.querySelector('.hx-bag').click(); return true; }) && /10:30 티니디 출발/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-17T14:00:00+07:00');
      ok('한국 집: 한국이 낮(16:00)이면 🏠 없음', await o.page.evaluate(() => !document.querySelector('.hx-home')));
      await o.page.waitForTimeout(1500);
      const tapScene = await o.page.evaluate(() => { const el = document.querySelector('.hx-scene.sc-golf'); if(!el || parseFloat(getComputedStyle(el).opacity) < .1) return false; const r = el.getBoundingClientRect(), h = document.querySelector('header.hero'); h.dispatchEvent(new MouseEvent('click', { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true })); return true; });
      ok('일정 장면 탭: 골프날(12/17) 깃대 장면을 누르면 "나이스 샷"', tapScene && /나이스 샷/.test(await tl(o.page)));
      ok('히어로 놀이 3: 콘솔 오류 없음', o.errs.length === 0, o.errs);
      await o.ctx.close();
    }
    // 4-1d9) 히어로 놀이 4: 겹치지 않는 자리 · 놀이 도감 · 무지개 · 폭염 알림
    {
      const mk = async (clock, w = 390) => { const o = await open(browser, base, w, 844, { clock }); await o.page.waitForFunction(() => !!window.__heroFun, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => { try { localStorage.removeItem('thai2026_hxfun'); } catch (e) {} window.__heroFun.reset(); window.__tl = []; window.__toast = (k, m) => window.__tl.push(k + ' ' + m); window.__heroTick(); }); return o; };
      const tl = page => page.evaluate(() => (window.__tl || []).join(' | '));
      const clash = page => page.evaluate(() => { const ov = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); const cs = [...document.querySelectorAll('header.hero .hero-in button, header.hero .hero-in a, header.hero .hero-in [role=button]')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0); return [...document.querySelectorAll('.hx-bag,.hx-meal,.hx-home')].filter(e => getComputedStyle(e).display !== 'none').map(e => { const r = e.getBoundingClientRect(); return cs.reduce((m, c) => Math.max(m, ov(r, c)), 0); }); });
      for (const w of [390, 320]) {
        const o = await mk('2026-11-20T23:30:00+09:00', w);
        await o.page.waitForTimeout(3300);
        const cl = await clash(o.page);
        ok(`놀이 버튼 자리: ${w}px에서 가방·🏠이 진짜 버튼(동기화·환율·더보기)과 겹치지 않음`, cl.length >= 1 && cl.every(v => v <= 40), cl);
        await o.ctx.close();
      }
      let o = await mk('2026-12-17T12:10:00+07:00', 320);
      const cl2 = await clash(o.page);
      ok('놀이 버튼 자리: 320px 점심 🍜도 진짜 버튼과 겹치지 않음', cl2.length >= 1 && cl2.every(v => v <= 40), cl2);
      await o.page.evaluate(() => { window.__heroFun.found('gecko'); window.__heroFun.found('gecko'); window.__heroFun.found('bag'); });
      ok('놀이 도감: 같은 놀이는 한 번만 세고 두 개를 발견', await o.page.evaluate(() => window.__heroFun.dex() === 2));
      await o.page.waitForTimeout(3400);
      ok('놀이 도감: "새 발견! (N/13)" 알림', /새 발견!.*\/13\)/.test(await tl(o.page)));
      await o.page.evaluate(() => { window.__wxNow = () => ({ code: 61, temp: 28, wind: 5 }); window.__heroFun.wxTick(); window.__wxNow = () => ({ code: 1, temp: 30, wind: 5 }); window.__heroFun.wxTick(); });
      ok('무지개: 비가 그친 낮에 무지개와 알림', await o.page.evaluate(() => !!document.querySelector('.hx-rainbow')) && /무지개/.test(await tl(o.page)));
      await o.page.evaluate(() => { window.__wxNow = () => ({ code: 0, temp: 36, wind: 5 }); window.__heroFun.wxTick(); });
      ok('폭염: 34°C 이상이면 물 한 모금 알림', /36°C — 물 자주/.test(await tl(o.page)));
      ok('히어로 놀이 4: 콘솔 오류 없음', o.errs.length === 0, o.errs);
      await o.ctx.close();
    }
    // 4-1d10) 히어로 놀이 5: 티오프 샷 · 크리스마스 불빛 · D-day 마일스톤 · 황혼 박쥐 · 귀국 작별
    {
      const mk = async clock => { const o = await open(browser, base, 390, 844, { clock }); await o.page.waitForFunction(() => !!window.__heroFun, null, { timeout: 8000 }).catch(() => {}); await o.page.evaluate(() => { try { localStorage.removeItem('thai2026_hxfun'); } catch (e) {} window.__heroFun.reset(); window.__tl = []; window.__toast = (k, m) => window.__tl.push(k + ' ' + m); window.__heroTick(); }); return o; };
      const tl = page => page.evaluate(() => (window.__tl || []).join(' | '));
      let o = await mk('2026-12-17T08:40:00+07:00');
      ok('티오프 샷: 티오프 시각 직후 공이 날고 알림이 한 번', await o.page.evaluate(() => !!document.querySelector('.hx-ball')) && /티오프! Chee Chan/.test(await tl(o.page)));
      await o.page.evaluate(() => window.__heroTick());
      ok('티오프 샷: 같은 날 알림은 한 번만', (await tl(o.page)).split('티오프!').length === 2);
      await o.ctx.close();
      o = await mk('2026-12-17T12:00:00+07:00');
      ok('티오프 샷: 티오프 시각이 지나면 없음', await o.page.evaluate(() => !document.querySelector('.hx-ball')) && !/티오프!/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-25T12:00:00+07:00');
      ok('크리스마스: 12/25에 전구 줄 14개와 알림', await o.page.evaluate(() => document.querySelectorAll('.hx-xmas i').length === 14) && /메리 크리스마스/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-26T12:00:00+07:00');
      ok('크리스마스: 12/26에는 전구 줄이 없음', await o.page.evaluate(() => !document.querySelector('.hx-xmas')));
      await o.ctx.close();
      o = await mk('2026-11-16T10:00:00+07:00');
      ok('D-day 마일스톤: D-30에 색종이와 알림', /D-30 — 한 달 전/.test(await tl(o.page)) && await o.page.evaluate(() => window.__heroDebug().sparks > 0));
      await o.ctx.close();
      o = await mk('2026-11-17T10:00:00+07:00');
      ok('D-day 마일스톤: D-29는 조용함', !/D-\d+ —/.test(await tl(o.page)));
      await o.ctx.close();
      o = await mk('2026-12-18T18:10:00+07:00');
      await o.page.evaluate(() => window.__heroFun.bats(60, true));
      ok('황혼 박쥐: 해 진 직후 하늘을 누르면 박쥐 떼가 날고 도감에 기록', await o.page.evaluate(() => document.querySelectorAll('.hx-bat').length === 4 && window.__heroFun.dex() >= 1));
      await o.ctx.close();
      o = await mk('2027-01-02T09:00:00+07:00');
      ok('귀국 작별: 1/2 아침에 👋 버튼이 44px 이상으로 뜸', await o.page.evaluate(() => { const e = document.querySelector('.hx-bye'); if(!e) return false; const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && e.tabIndex === -1; }));
      await o.page.evaluate(() => document.querySelector('.hx-bye').click());
      ok('귀국 작별: 누르면 태국어 작별 인사', /라껀 쁘라텟 타이/.test(await tl(o.page)));
      ok('히어로 놀이 5: 콘솔 오류 없음', o.errs.length === 0, o.errs);
      await o.ctx.close();
      o = await mk('2027-01-02T15:00:00+07:00');
      ok('귀국 작별: 오후에는 사라짐', await o.page.evaluate(() => !document.querySelector('.hx-bye')));
      await o.ctx.close();
    }
    // 4-1e0) 소식이 없는 날: 빈 목록이 오면 낡은 소식을 지우고 카드를 숨김
    {
      const o = await open(browser, base, 390, 844, { news: { updated: new Date().toISOString(), date: '2026-11-09', items: [] } });
      await o.page.evaluate(() => { try { localStorage.setItem('thai2026_news', JSON.stringify({ updated: new Date().toISOString(), items: [{ cat: 'news', title: '낡은 소식', src: 'x', url: 'https://x/1', ts: new Date().toISOString() }] })); } catch (e) {} });
      await o.page.reload(); await o.page.waitForTimeout(1500);
      ok('소식 없는 날: 빈 목록이면 소식 카드가 숨겨지고 낡은 저장본이 지워짐', await o.page.evaluate(() => document.getElementById('newsCard').hidden && localStorage.getItem('thai2026_news') === null));
      await o.ctx.close();
    }
    // 4-1e) 오늘의 태국 소식: 카드·목록·하루 첫 실행 공지(하루 한 번)
    {
      const now = new Date().toISOString();
      const news = { updated: now, date: now.slice(0, 10), items: [
        { cat: 'breaking', title: '방콕 도심 시위 속보', src: '연합뉴스', url: 'https://example.com/1', ts: now }, { cat: 'weather', title: '파타야 폭우 주의', src: '뉴시스', url: 'https://example.com/2', ts: now },
        { cat: 'fx', title: '태국 바트 환율 하락', src: '한국경제', url: 'https://example.com/3', ts: now }, { cat: 'golf', title: '파타야 골프장 소식', src: '골프저널', url: 'https://example.com/4', ts: now }, { cat: 'travel', title: '수완나품 공항 지연', src: 'YTN', url: 'https://example.com/5', ts: now } ] };
      const { ctx, page } = await open(browser, base, 390, 844, { news });
      await page.waitForSelector('#newsScrim.on', { timeout: 10000 });
      ok('소식 공지: 하루 첫 실행에 5개가 뜸', await page.evaluate(() => document.querySelectorAll('#nwBody a.nw-a').length === 5 && [...document.querySelectorAll('#nwBody a')].every(a => /noopener/.test(a.rel) && a.target === '_blank')));
      await page.click('#nwOk'); await page.waitForTimeout(450);
      ok('소식 카드: 맨 위 소식 제목이 보임', await page.evaluate(() => !document.getElementById('newsCard').hidden && /방콕 도심 시위 속보/.test(document.getElementById('nwT').textContent)));
      await page.reload();
      try { await page.waitForSelector('#wnScrim.on', { timeout: 3000 }); } catch (e) {}
      await page.evaluate(() => { const c = document.getElementById('wnClose'); c && c.click(); }); await page.waitForTimeout(6000);
      ok('소식 공지: 같은 날 다시 열면 또 뜨지 않음', await page.evaluate(() => document.getElementById('newsScrim').hidden));
      await page.click('#newsCard'); await page.waitForSelector('#newsScrim.on');
      ok('소식 카드를 누르면 다시 볼 수 있음', await page.evaluate(() => document.querySelectorAll('#nwBody a.nw-a').length === 5));
      await ctx.close();
    }
    // 4-1f) 첫 화면 정리: 작은 카드는 덱 하나로, 3칸 요약 없음, 인사말
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      await page.waitForTimeout(800);
      const r = await page.evaluate(() => {
        const vis = [...document.querySelectorAll('#deck>.next-card')].filter(e => getComputedStyle(e).display !== 'none' && !e.hidden);
        return { hero: Math.round(document.querySelector('header.hero').getBoundingClientRect().height), slides: vis.length, dots: document.getElementById('deckDots').children.length,
          stats: !!document.querySelector('.stats'), golfSum: !!document.getElementById('gSum'), daily: !!document.getElementById('dailyCard'), greet: document.getElementById('heroGreet').textContent.trim().length,
          loose: [...document.querySelectorAll('.hero-in>.next-card')].filter(e => getComputedStyle(e).display !== 'none' && e.id !== 'roundLive' && !e.classList.contains('play-card')).length };
      });
      ok('첫 화면: 히어로 높이 700px 이하(작은 카드는 덱 하나)', r.hero <= 700, r);
      ok('첫 화면: 덱의 점 개수 = 보이는 카드 수 (2개 이상)', r.slides >= 2 && r.dots === r.slides, r);
      ok('첫 화면: 3칸 요약·골프 요약 3칸·오늘의 태국 카드 없음, 덱 밖의 작은 카드 없음', !r.stats && !r.golfSum && !r.daily && r.loose === 0, r);
      ok('첫 화면: 인사말이 나옴', r.greet > 3, r);
      await page.evaluate(() => { const d = document.getElementById('deck'); d.dispatchEvent(new Event('pointerdown')); const s = [...d.children].filter(e => e.classList.contains('next-card') && getComputedStyle(e).display !== 'none'); d.scrollTo({ left: s[1].offsetLeft, behavior: 'instant' }); });
      await page.waitForFunction(() => [...document.getElementById('deckDots').children].findIndex(i => i.classList.contains('on')) === 1, null, { timeout: 4000 }).catch(() => {});
      ok('덱: 옆으로 넘기면 점과 카드가 바뀜', await page.evaluate(() => [...document.getElementById('deckDots').children].findIndex(i => i.classList.contains('on')) === 1));
      await ctx.close();
    }
    // 4-1g) 놀이터 메뉴: 남은 6개만, 접기 버튼 없음
    {
      const { ctx, page } = await open(browser, base, 390, 844);
      await page.evaluate(() => window.__openPlay()); await page.waitForSelector('#playScrim.on'); await page.waitForTimeout(500);
      const r = await page.evaluate(() => ({ tiles: [...document.querySelectorAll('#plGrid .play-tile')].map(b => b.querySelector('.pt').textContent), more: !!document.querySelector('#plGrid .play-more') }));
      ok('놀이터 메뉴: 남은 타일 6개와 접기 버튼 없음', r.tiles.length === 6 && !r.more && ['태국 이야기 · 맛집 카드', '태국 역사 · 공부', '태국 나침반', '태국어 · 숫자 · 맥주', '라운드 기록장', '태국 힐링 사운드'].every(x => r.tiles.includes(x)), r);
      ok('뺀 놀이는 더 이상 없음', await page.evaluate(() => ['__openWorldcup', '__openPass', '__openBingo', '__openTquiz', '__openWheel', '__openTitles', '__openFortune', '__openEats', '__openBaht', '__openStretch'].every(n => typeof window[n] === 'undefined')));
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
