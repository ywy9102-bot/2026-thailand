/* 지연 로딩 조각(히어로 연출 모음): 다가오는 비행기 · 가방 차오름 · 제목 태국어 · 활주로 · 도착 꽃비 · 취침 · 체크아웃 · 장면 탭 · 한국 집 · 골든아워 · 해·달 이야기 · 버디 새 · 밥시간 김 · 새벽 밴 · 도마뱀 · 신정 해돋이 · 별똥별 소원 · 새 떼 · 풍등 · 뚝뚝·파라세일 · 코끼리 · 자정 불꽃 · 배 · 방콕 야경 창문 · 오늘 일정 장면 · 새벽 안개 · 바람 구름 · 손가락 반짝임 · 스크롤 시차 · 하늘 위 비행기 */
(function(){
  if(innerWidth > 760) return;
  const hero = document.querySelector('header.hero'), heat = hero && hero.querySelector('.hero-heat'); if(!hero || !heat) return;
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host = document.createElement('div'); host.className = 'hero-fx2'; host.setAttribute('aria-hidden', 'true');
  host.innerHTML =
    '<div class="hx-mist"><i></i><i></i></div>' +
    '<div class="hx-boat pat"><svg viewBox="0 0 64 24" focusable="false"><path fill="currentColor" d="M3 14h46l9-6-3 10-5 4H10z"/><path fill="currentColor" d="M15 14l4-7h15l4 7z"/><path fill="currentColor" d="M50 13l13-4v2l-13 4z"/></svg></div>' +
    '<div class="hx-boat bkk"><svg viewBox="0 0 70 24" focusable="false"><path fill="currentColor" d="M2 16h58l8-5v8l-5 3H8z"/><path fill="currentColor" d="M12 16V8h36v8z"/><path fill="currentColor" d="M10 8h40l-3-4H14z"/><path fill="currentColor" d="M40 4V0h4v4z"/></svg></div>' +
    '<div class="hx-scene sc-golf"><svg viewBox="0 0 120 50" focusable="false"><path fill="currentColor" d="M0 50Q36 30 92 40T120 42V50Z"/><path fill="currentColor" d="M86 8h2v32h-2z"/><path fill="currentColor" d="M88 8l16 6-16 6z"/></svg><i class="hx-ball"></i></div>' +
    '<div class="hx-scene sc-island"><svg viewBox="0 0 120 50" focusable="false"><path fill="currentColor" d="M0 50Q18 24 52 30T120 40V50Z"/><path d="M70 34Q66 18 76 8" fill="none" stroke="currentColor" stroke-width="2.2"/><path fill="currentColor" d="M76 8Q92 2 100 10Q88 8 76 8ZM76 8Q60 0 52 8Q64 6 76 8Z"/></svg></div>' +
    '<div class="hx-scene sc-wat"><svg viewBox="0 0 60 80" focusable="false"><path fill="currentColor" d="M26 80L28 40L30 18L32 40L34 80Z"/><path fill="currentColor" d="M12 80L15 56L18 46L21 56L24 80Z"/><path fill="currentColor" d="M36 80L39 56L42 46L45 56L48 80Z"/><path fill="currentColor" d="M29 18l1-12 1 12z"/></svg></div>' +
    '<div class="hx-golden"></div>' +
    '<div class="hx-plane" hidden><span class="hx-pe">✈️</span></div>';
  heat.after(host);

  // 방콕 야경: 스카이라인 건물 안에 창문 불빛을 흩뿌려요(밤에만 켜져요)
  (function(){
    const src = hero.querySelectorAll('.sk-bkk rect'); if(!src.length) return;
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'hx-win'); svg.setAttribute('viewBox', '0 0 390 120'); svg.setAttribute('preserveAspectRatio', 'xMidYMax slice'); svg.setAttribute('focusable', 'false');
    const gs = [0, 1, 2].map(i => { const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'gw gw' + i); svg.appendChild(g); return g; });
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    src.forEach(r => {
      const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height'); if(h < 28) return;
      for(let c = 0; c < Math.floor((w - 4) / 6); c++) for(let k = 0; k < Math.floor((h - 6) / 8); k++){
        if(rnd() > .5) continue; const q = document.createElementNS(NS, 'rect');
        q.setAttribute('x', x + 3 + c * 6); q.setAttribute('y', y + 5 + k * 8); q.setAttribute('width', 2.6); q.setAttribute('height', 3.4); gs[(c + k) % 3].appendChild(q);
      }
    });
    host.prepend(svg);
  })();

  const $h = s => host.querySelector(s);
  const thai = () => new Date(Date.now() + 7 * 36e5);
  const cityNow = () => { const n = Date.now(); return (n >= tripDate('depart').getTime() && n < tripDate('bkkFrom').getTime()) ? [12.93, 100.88] : [13.75, 100.5]; };
  const golfDays = new Set(GOLF.map(g => g.d));

  // 하늘 위 비행기: 가족이 타고 있는 항공편이 하늘에 떠 있는 동안, 진행률에 맞춰 히어로를 가로질러요(시각은 일정과 같고, 도착 시각이 없는 편은 대략 5시간 30분으로 어림)
  const T = (y, m, d, hh, mm, tz) => Date.UTC(y, m - 1, d, hh - tz, mm);
  const FLIGHTS = [
    { id: 'OZ743', who: '윤우열', dir: 'in', dep: T(2026, 12, 16, 7, 10, 9), arr: T(2026, 12, 16, 11, 15, 7) },
    { id: 'KE657', who: '김태기', dir: 'in', dep: T(2026, 12, 16, 9, 15, 9), arr: T(2026, 12, 16, 13, 25, 7) },
    { id: 'OZ741', who: '가족1', dir: 'in', dep: T(2026, 12, 18, 18, 5, 9), arr: T(2026, 12, 18, 22, 0, 7) },
    { id: 'KE658', who: '김태기', dir: 'out', dep: T(2026, 12, 23, 21, 40, 7), arr: T(2026, 12, 23, 21, 40, 7) + 33e5 * 6, approx: true },
    { id: 'OZ741', who: '가족2', dir: 'in', dep: T(2026, 12, 27, 19, 35, 9), arr: T(2026, 12, 27, 23, 20, 7) },
    { id: 'OZ744', who: '가족1·2', dir: 'out', dep: T(2027, 1, 2, 12, 25, 7), arr: T(2027, 1, 2, 19, 50, 9) },
  ];
  const dur = ms => { const m = Math.max(1, Math.round(ms / 6e4)); return m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`; };
  const fl = document.getElementById('flCard'), clock = ms => { const t = new Date(ms); return String(t.getUTCHours()).padStart(2, '0') + ':' + String(t.getUTCMinutes()).padStart(2, '0'); };
  let cur = null;
  function plane(){
    const el = $h('.hx-plane'), n = Date.now(), f = FLIGHTS.find(x => n >= x.dep && n <= x.arr); cur = f || null;
    if(!f){ el.hidden = true; if(fl) fl.hidden = true; return; }
    const p = (n - f.dep) / (f.arr - f.dep), inb = f.dir === 'in', W = hero.clientWidth;
    el.hidden = false; el.classList.toggle('in', inb);
    el.style.left = ((inb ? 1 - p : p) * W).toFixed(0) + 'px'; el.style.top = (inb ? 2 + p * 22 : 24 - p * 22).toFixed(0) + 'px';
    if(fl){ fl.hidden = false; document.getElementById('flT').textContent = `${inb ? '도착까지' : '한국 도착까지'} ${f.approx ? '약 ' : ''}${dur(f.arr - n)} · ${f.who} ${f.id}`; }
  }
  if(fl) fl.addEventListener('click', () => { if(typeof haptic === 'function') haptic('tap'); const f = cur; if(!f || typeof window.__toast !== 'function') return; window.__toast('✈️', `${f.who} ${f.id} ${f.dir === 'in' ? '도착 예정 ' + clock(f.arr + 7 * 36e5) + '(태국 시각)' : '한국 도착 예정 ' + clock(f.arr + 9 * 36e5) + '(한국 시각)'}${f.approx ? ' · 대략' : ''}`, 4200); });

  // 날씨·시각에 따라 켜지는 층(오늘 일정 장면, 새벽 안개, 바람)
  function layers(){
    const t = thai(), md = (t.getUTCMonth() + 1) + '/' + t.getUTCDate(), inTrip = Date.now() >= tripDate('depart').getTime() && Date.now() <= tripDate('end', true).getTime();
    const scene = !inTrip ? '' : golfDays.has(md) ? 'golf' : md === '12/19' ? 'island' : md === '12/28' ? 'wat' : '';
    if(scene) hero.dataset.scene = scene; else delete hero.dataset.scene;
    const c = cityNow(), [rise] = sunTimes(c[0], c[1], t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()), now = t.getUTCHours() * 60 + t.getUTCMinutes();
    if(now >= rise - 30 && now <= rise + 60) hero.dataset.mist = '1'; else delete hero.dataset.mist;
    const w = typeof window.__wxNow === 'function' ? window.__wxNow() : null;
    if(w && w.wind != null){ hero.style.setProperty('--wf', Math.max(.35, Math.min(1.6, 1.6 - w.wind / 25)).toFixed(2)); hero.dataset.wind = '1'; } else { hero.style.removeProperty('--wf'); delete hero.dataset.wind; }
  }

  // 자정 불꽃: 12/31 23:59:50부터 10초 카운트다운, 1/1 00:00에 불꽃
  const COL = ['#F5E7C0', '#E3C169', '#EFA895', '#8AC0E4', '#B6A6D9', '#9FD8B8'];
  function fireworks(){
    if(rm){ if(typeof window.__toast === 'function') window.__toast('🎆', '새해 복 많이 받으세요! 2027', 4200); return; }
    const r = hero.getBoundingClientRect(), W = Math.round(r.width), H = Math.min(Math.round(r.height), 720), dpr = Math.min(devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas'); cv.className = 'hx-fw'; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; host.appendChild(cv);
    const c = cv.getContext('2d'); c.scale(dpr, dpr); const P = []; let bursts = 0, next = 0; const t0 = performance.now();
    if(typeof haptic === 'function') haptic('combo');
    if(typeof window.__toast === 'function') window.__toast('🎆', '새해 복 많이 받으세요! 2027', 4200);
    (function frame(now){
      const e = now - t0;
      if(bursts < 9 && e >= next){ bursts++; next = e + 420 + Math.random() * 260; const cx = W * (.15 + Math.random() * .7), cy = H * (.12 + Math.random() * .3), col = COL[bursts % COL.length]; for(let i = 0; i < 46; i++){ const a = Math.PI * 2 * i / 46, s = 1.2 + Math.random() * 1.6; P.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, a: 1, c: col }); } }
      c.clearRect(0, 0, W, H);
      for(let i = P.length - 1; i >= 0; i--){ const q = P[i]; q.x += q.vx; q.y += q.vy; q.vy += .035; q.vx *= .985; q.a -= .013; if(q.a <= 0){ P.splice(i, 1); continue; } c.globalAlpha = q.a; c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y, 1.8, 0, 7); c.fill(); }
      if(bursts < 9 || P.length) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }
  window.__heroFireworks = fireworks;
  let nyCount = null, nyFired = false;
  function ny(){
    const t = thai(), m = t.getUTCMonth() + 1, d = t.getUTCDate(), h = t.getUTCHours(), mi = t.getUTCMinutes(), s = t.getUTCSeconds();
    if(m === 12 && d === 31 && h === 23 && mi === 59 && s >= 50){
      const left = 60 - s; if(!nyCount){ nyCount = document.createElement('div'); nyCount.className = 'hx-count'; host.appendChild(nyCount); }
      if(nyCount.textContent !== String(left)){ nyCount.textContent = left; nyCount.style.animation = 'none'; void nyCount.offsetWidth; nyCount.style.animation = ''; if(typeof haptic === 'function') haptic('tap'); }
    } else if(nyCount){ nyCount.remove(); nyCount = null; }
    if(!nyFired && m === 1 && d === 1 && h === 0 && mi === 0 && s < 30){ let seen = false; try{ seen = localStorage.getItem('thai2026_ny27'); localStorage.setItem('thai2026_ny27', '1'); }catch(e){} if(!seen){ nyFired = true; fireworks(); } }
  }

  // 손가락 따라 반짝임(낮엔 햇살, 밤엔 반딧불이)
  const sp = document.createElement('canvas'); sp.className = 'hx-spark'; host.appendChild(sp);
  const sc = sp.getContext('2d'); let SW = 0, SH = 0, dpr2 = Math.min(devicePixelRatio || 1, 2), S = [], raf = 0, last = 0;
  function fit(){ const r = hero.getBoundingClientRect(); SW = Math.round(r.width); SH = Math.min(Math.round(r.height), 720); sp.width = SW * dpr2; sp.height = SH * dpr2; sp.style.width = SW + 'px'; sp.style.height = SH + 'px'; sc.setTransform(dpr2, 0, 0, dpr2, 0, 0); }
  fit(); addEventListener('resize', fit);
  function loop(){
    sc.clearRect(0, 0, SW, SH); const night = hero.dataset.sky === 'night';
    for(let i = S.length - 1; i >= 0; i--){ const q = S[i]; q.x += q.vx; q.y += q.vy; q.vy += night ? -.004 : .01; q.a -= .02; if(q.a <= 0){ S.splice(i, 1); continue; }
      sc.globalAlpha = night ? q.a * (.55 + .45 * Math.sin(q.t += .3)) : q.a; sc.fillStyle = night ? '#D8F3A0' : '#F5E7C0'; sc.beginPath(); sc.arc(q.x, q.y, q.r, 0, 7); sc.fill(); }
    if(S.length) raf = requestAnimationFrame(loop); else { raf = 0; sc.clearRect(0, 0, SW, SH); }
  }
  function emit(x, y){
    const now = performance.now(); if(now - last < 30) return; last = now; const r = hero.getBoundingClientRect(), px = x - r.left, py = y - r.top;
    if(py < 0 || py > SH) return; for(let i = 0; i < 2 && S.length < 70; i++) S.push({ x: px + (Math.random() - .5) * 10, y: py + (Math.random() - .5) * 10, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8 - .2, a: 1, r: 1.2 + Math.random() * 1.8, t: Math.random() * 6 });
    if(!raf) raf = requestAnimationFrame(loop);
  }
  if(!rm){
    hero.addEventListener('pointermove', e => emit(e.clientX, e.clientY), { passive: true });
    hero.addEventListener('touchmove', e => { const t = e.touches[0]; if(t) emit(t.clientX, t.clientY); }, { passive: true });
  }

  // 스크롤 시차
  let sy = 0, sraf = 0;
  if(!rm) addEventListener('scroll', () => { if(sraf) return; sraf = requestAnimationFrame(() => { sraf = 0; const y = Math.min(scrollY, 700); if(y !== sy){ sy = y; hero.style.setProperty('--sy', y); } }); }, { passive: true });


  // ── 놀이 더하기: 별똥별·소원 · 새 떼 · 풍등 · 뚝뚝/파라세일 · 코끼리 ──
  const FUN_K = 'thai2026_hxfun';
  const fun = (() => { let o = {}; try{ o = JSON.parse(localStorage.getItem(FUN_K)) || {}; }catch(e){} return o; })();
  const save = () => { try{ localStorage.setItem(FUN_K, JSON.stringify(fun)); }catch(e){} };
  const toast = (e, m, ms) => { if(typeof window.__toast === 'function') window.__toast(e, m, ms || 2600); };
  const hap = k => { if(typeof haptic === 'function') haptic(k); };
  const IGN = 'button,a,input,select,textarea,.hw,.countdown,.prog-wrap,.stats,#wxIco,#wxTemp,.hx-hit,.next-card,#deck,#deckDots,.eg-flag';
  const isNight = () => hero.dataset.sky === 'night';
  const live = () => !document.hidden && !hero.classList.contains('hero-off');
  const done = (el, ms) => setTimeout(() => el.remove(), ms);
  const rnd = (a, b) => a + Math.random() * (b - a);

  // 1) 별똥별: 밤에 가끔 가로지르고, 5초 안에 화면을 톡 누르면 소원을 빌어요
  let nextStar = Date.now() + 12000, starAt = 0, wished = true;
  function star(){
    const st = document.createElement('i'); st.className = 'hx-star'; st.style.setProperty('--sx', rnd(40, 70) + '%'); st.style.setProperty('--sy', Math.round(rnd(14, 70)) + 'px');
    host.appendChild(st); done(st, 1500); starAt = Date.now(); wished = false;
    if(!fun.starSeen){ fun.starSeen = 1; save(); setTimeout(() => toast('🌠', '별똥별이에요! 화면을 톡 눌러 소원을 빌어 보세요', 3600), 700); }
  }
  function wish(){
    wished = true; found('wish'); fun.wish = (fun.wish || 0) + 1; save(); hap(fun.wish % 3 === 0 ? 'combo' : 'ok');
    toast('✨', fun.wish % 3 === 0 ? `소원 ${fun.wish}개째 — 이번 여행, 다 이뤄질 거예요` : `소원을 빌었어요 (${fun.wish}번째)`, 2800);
    for(let i = 0; i < 14; i++) S.push({ x: SW * .5 + rnd(-60, 60), y: rnd(20, 90), vx: rnd(-.5, .5), vy: rnd(-.6, .2), a: 1, r: 1.2 + Math.random() * 1.8, t: Math.random() * 6 });
    if(!raf) raf = requestAnimationFrame(loop);
  }

  // 2) 새 떼: 낮에 하늘을 톡 누르면 새가 날아가고, 밤엔 반딧불이가 퍼져요
  let flocks = 0, lastBird = 0;
  function birds(py){
    if(flocks >= 2 || Date.now() - lastBird < 1500) return; lastBird = Date.now(); flocks++; found('birds');
    const fl = document.createElement('div'); fl.className = 'hx-flock'; fl.style.top = Math.max(12, Math.min(py, 120)) + 'px';
    const n = 4 + Math.floor(Math.random() * 3); let h = '';
    for(let i = 0; i < n; i++) h += `<svg class="hx-bird" style="--bx:${i * 22}px;--by:${(i % 2 ? 1 : -1) * Math.round(rnd(4, 14))}px;--bd:${(i * .12).toFixed(2)}s" viewBox="0 0 22 10" focusable="false"><path d="M1 8Q6 0 11 7Q16 0 21 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    fl.innerHTML = h; host.appendChild(fl); done(fl, 7000); setTimeout(() => { flocks = Math.max(0, flocks - 1); }, 7000); hap('tap');
  }

  // 3) 풍등: 히어로를 길게 누르면 그 자리에서 소원 풍등이 떠올라요
  let lanterns = 0;
  function lantern(px, py){
    fun.lantern = (fun.lantern || 0) + 1; save(); hap('strong'); found('lantern');
    toast('🏮', `풍등을 띄웠어요 (모두 ${fun.lantern}개)`, 2600);
    if(rm || lanterns >= 6) return; lanterns++;
    const l = document.createElement('span'); l.className = 'hx-lantern'; l.textContent = '🏮'; l.style.left = px + 'px'; l.style.top = py + 'px'; l.style.setProperty('--dx', Math.round(rnd(-26, 26)) + 'px');
    host.appendChild(l); setTimeout(() => { l.remove(); lanterns = Math.max(0, lanterns - 1); }, 7200);
  }
  let lpT = 0, lpX = 0, lpY = 0;
  const lpClear = () => { clearTimeout(lpT); lpT = 0; };
  hero.addEventListener('pointerdown', e => {
    if(e.target.closest(IGN)) return; lpClear(); lpX = e.clientX; lpY = e.clientY;
    const r = hero.getBoundingClientRect();
    lpT = setTimeout(() => { lpT = 0; lantern(lpX - r.left, lpY - r.top); }, 650);
  }, { passive: true });
  hero.addEventListener('pointermove', e => { if(lpT && Math.hypot(e.clientX - lpX, e.clientY - lpY) > 10) lpClear(); }, { passive: true });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => hero.addEventListener(ev, lpClear, { passive: true }));
  addEventListener('scroll', lpClear, { passive: true });

  // 하늘 탭: 별똥별 소원(밤) · 새 떼(낮) · 반딧불이(밤)
  hero.addEventListener('click', e => {
    if(e.target.closest(IGN)) return; const r = hero.getBoundingClientRect(), py = e.clientY - r.top;
    if(!wished && Date.now() - starAt < 5000){ wish(); return; }
    if(e.target.closest('.title')){ titleTalk(); return; }
    if(sceneTap(e)) return;
    const ob = document.getElementById('skyOrb'); if(ob && parseFloat(getComputedStyle(ob).opacity) > .1){ const q = ob.getBoundingClientRect(); if(Math.hypot(e.clientX - (q.left + q.width / 2), e.clientY - (q.top + q.height / 2)) < 30){ hap('tap'); orbTalk(); return; } }
    if(py > 150) return;
    if(!rm && dusk() && tripNow()){ bats(py, true); return; }
    if(isNight()){ for(let i = 0; i < 10; i++) S.push({ x: e.clientX - r.left + rnd(-16, 16), y: py + rnd(-16, 16), vx: rnd(-.7, .7), vy: rnd(-.7, .3), a: 1, r: 1.2 + Math.random() * 1.8, t: Math.random() * 6 }); if(!raf) raf = requestAnimationFrame(loop); hap('tap'); }
    else if(!rm) birds(py);
  });

  // 4) 뚝뚝(방콕)·파라세일(파타야): 가끔 지나가고, 누르면 인사해요
  let nextRide = Date.now() + 20000, ride = null;
  function startRide(){
    const bkk = hero.dataset.city === 'bkk'; const el = document.createElement('button'); el.type = 'button'; el.className = 'hx-hit hx-ride ' + (bkk ? 'tuk' : 'para');
    el.setAttribute('tabindex', '-1'); el.textContent = bkk ? '🛺' : '🪂'; host.appendChild(el); ride = el;
    el.addEventListener('click', ev => { ev.stopPropagation(); found('ride'); hap(bkk ? 'combo' : 'tap'); toast(bkk ? '🛺' : '🪂', bkk ? '빵빵! 뚝뚝 기사님이 손을 흔들어요' : '파라세일이 파타야 바다 위로 둥실~', 2400); });
    setTimeout(() => { el.remove(); if(ride === el) ride = null; }, bkk ? 27000 : 42000);
  }

  // 5) 코끼리: 국기를 6번 빠르게 누르면 코끼리가 쿵쿵 지나가요
  const fl2 = document.getElementById('egFlag'); let ft = 0, fT;
  if(fl2) fl2.addEventListener('click', () => {
    ft++; clearTimeout(fT); fT = setTimeout(() => { ft = 0; }, 2400); if(ft < 6) return; ft = 0;
    toast('🐘', '코끼리 출동! 쿵쿵쿵', 2600); found('ele'); if(rm) return;
    const el = document.createElement('span'); el.className = 'hx-ele'; el.textContent = '🐘'; host.appendChild(el); done(el, 3600);
    [450, 1250, 2050].forEach(t => setTimeout(() => { hap('strong'); try{ hero.animate([{ translate: '0 0' }, { translate: '-3px 2px' }, { translate: '3px -1px' }, { translate: '0 0' }], { duration: 220 }); }catch(e){} }, t));
  });


  // ── 놀이 더하기 2: 골든아워 · 해/달 이야기 · 버디 새 · 밥시간 김 · 새벽 밴 · 도마뱀 · 신정 해돋이 ──
  const tripNow = () => { const n = Date.now(); return n >= tripDate('depart').getTime() && n <= tripDate('end', true).getTime(); };
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');
  const dayKey = () => { const t = thai(); return t.getUTCFullYear() + '-' + (t.getUTCMonth() + 1) + '-' + t.getUTCDate(); };
  const once = k => { fun.once = fun.once || {}; if(fun.once[k]) return false; fun.once[k] = 1; save(); return true; };
  const sunNow = () => { const t = thai(), c = cityNow(), r = sunTimes(c[0], c[1], t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); return { rise: r[0], set: r[1], min: t.getUTCHours() * 60 + t.getUTCMinutes() }; };

  // 1) 골든아워: 일몰 30분 전부터 하늘이 금빛으로, 여행 중에는 하루 한 번 알려요
  function golden(){
    const { set, min } = sunNow(), on = min >= set - 30 && min <= set + 8;
    if(on) hero.dataset.golden = '1'; else delete hero.dataset.golden;
    if(on && tripNow() && once('gold' + dayKey())){ hap('ok'); toast('🌇', `일몰 30분 전 — 사진 찍기 좋은 시간이에요 (일몰 ${hm(set)})`, 4200); }
  }

  // 2) 해·달 누르면: 일출·일몰, 달 모양과 밝기, 보름달까지
  function orbTalk(){
    found('orb');
    const { rise, set, min } = sunNow(), day = min >= rise && min < set;
    if(day){ toast('☀️', `오늘 일출 ${hm(rise)} · 일몰 ${hm(set)} (현지 시각)`, 3600); return; }
    const syn = 29.530588853, age = (((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % syn + syn) % syn, lit = Math.round((1 - Math.cos(2 * Math.PI * age / syn)) / 2 * 100);
    const toFull = Math.round(((syn / 2 - age) % syn + syn) % syn), e = document.getElementById('skyOrb').textContent || '🌙';
    toast(e, `밝기 ${lit}% · ${toFull <= 0 ? '오늘은 보름달 무렵이에요' : `보름달까지 ${toFull}일`}`, 3600);
  }

  // 3) 버디 새: 라운드 기록장에서 버디를 누르면, 기록장을 닫았을 때 금빛 새가 히어로를 가로질러요
  let birdPending = 0;
  document.addEventListener('hx:birdie', () => { if(!rm) birdPending = Math.min(birdPending + 1, 3); });
  function goldBird(){
    const b = document.createElement('span'); b.className = 'hx-gbird'; b.textContent = '🐦'; b.style.top = Math.round(rnd(30, 90)) + 'px'; host.appendChild(b); done(b, 4200); hap('ok');
  }

  // 4) 밥시간 김: 점심·저녁 시간대에 🍜 김이 오르고, 누르면 대동여지도가 열려요
  let meal = null;
  function mealTick(){
    const { min } = sunNow(), slot = min >= 660 && min < 810 ? 'L' : min >= 1050 && min < 1200 ? 'D' : '';
    const want = slot && tripNow() && !(fun.meal === dayKey() + slot);
    if(want && !meal && !rm){
      const el = document.createElement('button'); el.type = 'button'; el.className = 'hx-hit hx-meal'; el.setAttribute('tabindex', '-1'); el.innerHTML = '<svg viewBox="0 0 24 14" focusable="false"><path d="M5 14q-3-4 0-7t0-7M12 14q-3-4 0-7t0-7M19 14q-3-4 0-7t0-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>🍜'; host.appendChild(el); meal = el; fitSlot(el, SLOT_R);
      el.addEventListener('click', ev => { ev.stopPropagation(); found('meal'); hap('ok'); fun.meal = dayKey() + slot; save(); el.remove(); meal = null; if(typeof window.__openFoodMap === 'function') window.__openFoodMap(); });
    } else if(!want && meal){ meal.remove(); meal = null; }
  }

  // 5) 새벽 밴: 골프 밴 출발 20분 전부터 헤드라이트가 다가와요
  let vanEl = null;
  function vanTick(){
    const t = thai(), md = (t.getUTCMonth() + 1) + '/' + t.getUTCDate(), g = tripNow() ? GOLF.find(x => x.d === md && x.van && x.van.time) : null;
    let p = -1;
    if(g){ const [h, m] = g.van.time.split(':').map(Number), dep = h * 60 + m, now = t.getUTCHours() * 60 + t.getUTCMinutes() + t.getUTCSeconds() / 60;
      if(now >= dep - 20 && now <= dep + 3){ p = Math.max(0, Math.min(1, (now - (dep - 20)) / 20)); if(once('van' + dayKey())){ hap('strong'); toast('🚐', `골프 밴 출발 20분 전 (${g.van.time}) — 로비로 내려갈 준비!`, 4200); } } }
    if(p >= 0 && !rm){
      if(!vanEl){ vanEl = document.createElement('span'); vanEl.className = 'hx-van'; vanEl.textContent = '🚐'; host.appendChild(vanEl); }
      vanEl.style.left = (104 - p * 92).toFixed(1) + '%';
    } else if(vanEl){ vanEl.remove(); vanEl = null; }
  }

  // 6) 도마뱀: 가끔 벽을 기어가고, 누르면 쪼르르 도망가요
  let nextGecko = Date.now() + 40000, gecko = null;
  function startGecko(){
    const el = document.createElement('button'); el.type = 'button'; el.className = 'hx-hit hx-gecko'; el.setAttribute('tabindex', '-1'); el.textContent = '🦎'; el.style.top = Math.round(rnd(110, 230)) + 'px'; host.appendChild(el); gecko = el;
    el.addEventListener('click', ev => { ev.stopPropagation(); found('gecko'); hap('combo'); el.classList.add('run'); toast('🦎', '찍찍! 숙소 벽의 도마뱀은 모기를 잡아 주는 흔한 손님이에요', 3200); setTimeout(() => { el.remove(); if(gecko === el) gecko = null; }, 900); });
    setTimeout(() => { el.remove(); if(gecko === el) gecko = null; }, 16000);
  }

  // 7) 신정 첫 해돋이: 1/1 일출 15분 전 알림, 일출 때 금빛 하늘과 인사
  function nyRise(){
    const t = thai(); if(!(t.getUTCMonth() === 0 && t.getUTCDate() === 1 && t.getUTCFullYear() === 2027)) { delete hero.dataset.nysun; return; }
    const { rise, min } = sunNow();
    if(min >= rise - 15 && min < rise && once('nyrise15')){ hap('ok'); toast('🌅', `새해 첫 해돋이 15분 전이에요 (${hm(rise)})`, 4200); }
    if(min >= rise && min <= rise + 25){ hero.dataset.nysun = '1'; if(once('nyrise')){ hap('combo'); toast('🌅', '2027년 첫 해돋이예요! 올해도 온 가족 건강하고 즐겁게', 5200); for(let i = 0; i < 24; i++) S.push({ x: rnd(20, SW - 20), y: rnd(20, 140), vx: rnd(-.5, .5), vy: rnd(-.5, .1), a: 1, r: 1.2 + Math.random() * 2, t: Math.random() * 6 }); if(!raf) raf = requestAnimationFrame(loop); } }
    else delete hero.dataset.nysun;
  }

  function fun2Tick(){
    golden(); nyRise(); mealTick(); vanTick();
    if(birdPending && live() && !document.querySelector('.wn-scrim.on')){ const n = birdPending; birdPending = 0; for(let i = 0; i < n; i++) setTimeout(goldBird, i * 900); }
    const now = Date.now(); if(!rm && live() && !isNight() && !gecko && now > nextGecko){ nextGecko = now + rnd(70000, 140000); startGecko(); }
  }


  // ── 놀이 더하기 3: 다가오는 비행기 · 가방 차오름 · 제목 태국어 · 출발 전날 활주로 · 도착 꽃비 · 취침 · 체크아웃 · 일정 장면 탭 · 한국 집 ──
  const kst = () => new Date(Date.now() + 9 * 36e5);
  const clickTab = id => { const b = document.getElementById(id); if(b) b.click(); };
  const mkHit = (cls, html, label) => { const el = document.createElement('button'); el.type = 'button'; el.className = 'hx-hit ' + cls; el.setAttribute('tabindex', '-1'); el.innerHTML = html; host.appendChild(el); return el; };

  // 1) 다가오는 비행기: 출발 전에는 D-day가 가까워질수록 비행기가 하늘 가운데로 다가와요
  let comeEl = null;
  function comePlane(){
    const dep = tripDate('depart').getTime(), start = new Date(TRIP.planStart + 'T00:00:00+07:00').getTime(), n = Date.now();
    if(n >= dep){ if(comeEl){ comeEl.remove(); comeEl = null; } return; }
    if(!comeEl){ comeEl = document.createElement('span'); comeEl.className = 'hx-come'; comeEl.textContent = '✈️'; host.appendChild(comeEl); }
    const p = Math.max(0, Math.min(1, (n - start) / (dep - start)));
    comeEl.style.left = (6 + p * 62).toFixed(1) + '%'; comeEl.style.top = (8 - p * 6).toFixed(0) + 'px';
  }

  // 2) 짐 가방: 출발 준비 할 일을 체크한 만큼 가방이 차올라요
  let bagEl = null, bagMode = '';
  function prepFrac(){ const g = TODO.find(x => x.g === '🧳 출발 준비'); if(!g || !g.items.length) return null; const d = g.items.filter(i => store.done && store.done[i]).length; return { d, n: g.items.length }; }
  const CHECKOUT = { '12/26': ['오늘 방콕 이동 — 통부라 10:30 출발 → 티니디', 'tb-stay'], '12/30': ['가족2 이동 — 10:30 티니디 출발 → GCP (체크인 14:00부터)', 'tb-stay'], '1/2': ['귀국일 — 08:30 호텔 출발, 체크아웃 후 공항으로', 'tb-stay'] };
  function bagTick(){
    const trip = tripNow(), t = thai(), md = (t.getUTCMonth() + 1) + '/' + t.getUTCDate(), h = t.getUTCHours();
    const co = trip && CHECKOUT[md] && h >= 5 && h < 13 ? CHECKOUT[md] : null;
    const pre = !trip && Date.now() < tripDate('depart').getTime(), pf = pre ? prepFrac() : null;
    const mode = co ? 'co' : pf ? 'prep' : '';
    if(mode !== bagMode && bagEl){ bagEl.remove(); bagEl = null; }
    bagMode = mode; if(!mode) return;
    if(!bagEl){
      bagEl = mkHit('hx-bag', '<span class="hx-bag-e">🧳</span><b><i></i></b>'); fitSlot(bagEl, SLOT_R);
      bagEl.addEventListener('click', ev => { ev.stopPropagation(); found('bag'); hap('ok');
        if(bagMode === 'co'){ toast('🧳', co ? co[0] : '', 4200); clickTab('tb-stay'); }
        else { const f = prepFrac(); toast('🧳', f.d >= f.n ? '짐 다 쌌어요! 이제 설레는 일만 남았어요' : `출발 준비 ${f.d}/${f.n} — 남은 ${f.n - f.d}개를 체크하러 가요`, 3600); clickTab('tb-todo'); } });
    }
    const fill = bagEl.querySelector('i'); fill.style.transform = 'scaleX(' + (mode === 'prep' ? (pf.d / pf.n).toFixed(3) : (1).toFixed(3)) + ')';
    if(mode === 'prep' && pf.d >= pf.n) bagEl.setAttribute('data-full', '1'); else bagEl.removeAttribute('data-full');
    if(mode === 'prep' && pf.d >= pf.n && once('bagfull')){ hap('combo'); toast('🧳', '짐 다 쌌어요! 이제 설레는 일만 남았어요', 3600); }
  }

  // 3) 제목을 누르면 태국어 한마디(앱의 "자주 쓰는 말" 목록에서)
  let phI = Math.floor(Math.random() * 14);
  function titleTalk(){ phI = (phI + 1 + Math.floor(Math.random() * 3)) % PHRASES.length; const [th, ko] = PHRASES[phI]; hap('tap'); found('title'); toast('🇹🇭', `${th} — ${ko}`, 3600); }

  // 4) 출발 전날 밤~당일 아침: 활주로 불빛과 알림(한국 시간 기준)
  let runEl = null;
  function eveTick(){
    const k = kst(), d = k.getUTCFullYear() + '-' + String(k.getUTCMonth() + 1).padStart(2, '0') + '-' + String(k.getUTCDate()).padStart(2, '0'), h = k.getUTCHours();
    const eve = d === '2026-12-15' && h >= 18, dday = d === '2026-12-16' && h < 11;
    if((eve || dday) && !rm){ if(!runEl){ runEl = document.createElement('div'); runEl.className = 'hx-runway';  host.appendChild(runEl); } } else if(runEl){ runEl.remove(); runEl = null; }
    if(eve && once('eve15')){ hap('strong'); toast('🛫', '내일 출발이에요! 여권·충전기·환전 마지막 확인', 4600); }
    if(dday && once('dday16')){ hap('combo'); toast('🛫', '오늘 출발! 안전하게, 즐겁게 다녀와요', 4600); }
  }

  // 5) 도착 순간: 비행기가 닿는 시각에 꽃비와 인사(각 편마다 한 번)
  function arriveTick(){
    const n = Date.now(); const f = FLIGHTS.find(x => n >= x.arr && n <= x.arr + 10 * 6e4); if(!f) return;
    if(!once('arr' + f.id + f.who + f.arr)) return; hap('combo');
    toast(f.dir === 'in' ? '🛬' : '🏠', f.dir === 'in' ? `${f.who} 태국 도착! 사와디캅~ 🌺` : `${f.who} 한국 도착! 즐거운 여행이었어요`, 5200);
    if(rm || !live()) return;
    for(let i = 0; i < 9; i++){ const fl = document.createElement('span'); fl.className = 'hx-flower'; fl.textContent = ['🌺', '🌼', '🌸'][i % 3]; fl.style.left = Math.round(rnd(4, 92)) + '%'; fl.style.animationDelay = (i * .25).toFixed(2) + 's'; host.appendChild(fl); done(fl, 5200); }
  }

  // 6) 골프 전날 밤: 일찍 자라는 졸음 연출과 알림
  let zzz = null;
  function sleepTick(){
    const t = thai(), h = t.getUTCHours() + t.getUTCMinutes() / 60; let g = null;
    if(tripNow() && h >= 21.5){ const nx = new Date(t.getTime() + 864e5), md = (nx.getUTCMonth() + 1) + '/' + nx.getUTCDate(); g = GOLF.find(x => x.d === md && x.van && x.van.time); }
    if(g && !rm){ if(!zzz){ zzz = document.createElement('span'); zzz.className = 'hx-zzz'; zzz.textContent = '💤'; host.appendChild(zzz); } } else if(zzz){ zzz.remove(); zzz = null; }
    if(g && once('sleep' + dayKey())){ hap('ok'); toast('😴', `내일 ${g.van.time} 골프 밴 (${g.c.split(' ')[0]}) — 일찍 주무세요`, 4600); }
  }

  // 8) 일정 장면 누르기: 골프 깃대 · 꼬란섬 거북이 · 사원 종
  function sceneTap(e){
    const sc = hero.dataset.scene; if(!sc) return false; const el = host.querySelector('.sc-' + sc); if(!el || parseFloat(getComputedStyle(el).opacity) < .1) return false;
    const r = el.getBoundingClientRect(); if(e.clientX < r.left - 8 || e.clientX > r.right + 8 || e.clientY < r.top - 8 || e.clientY > r.bottom + 8) return false;
    found('scene');
    if(sc === 'golf'){ hap('ok'); toast('⛳', '나이스 샷! 오늘도 페어웨이 직진~', 2600); }
    else if(sc === 'island'){ hap('tap'); toast('🐢', '꼬란섬 바다 위로 거북이가 스윽~ 오늘 물놀이 즐겁게!', 3000); if(!rm){ const tu = document.createElement('span'); tu.className = 'hx-turtle'; tu.textContent = '🐢'; host.appendChild(tu); done(tu, 7200); } }
    else { hap('combo'); [350, 800].forEach(t => setTimeout(() => hap('strong'), t)); toast('🔔', '댕—… 사원에선 어깨·무릎을 가리고 조용히 걸어요', 3600); }
    return true;
  }

  // 12) 한국은 지금: 한국이 밤이면 작은 집 불빛, 누르면 한국 시각
  let homeEl = null;
  function homeTick(){
    const k = kst(), h = k.getUTCHours(), night = h >= 22 || h < 6;
    if(night && !homeEl){ homeEl = mkHit('hx-home', '🏠'); fitSlot(homeEl, SLOT_H); homeEl.addEventListener('click', ev => { ev.stopPropagation(); found('home'); hap('tap'); const q = kst(); toast('🏠', `한국은 지금 ${String(q.getUTCHours()).padStart(2, '0')}:${String(q.getUTCMinutes()).padStart(2, '0')} — 집은 고요한 밤이에요`, 3200); }); }
    else if(!night && homeEl){ homeEl.remove(); homeEl = null; }
  }


  // ── 놀이 더하기 4: 겹치지 않게 자리 찾기 · 놀이 도감 · 비 그친 뒤 무지개 · 폭염 물 알림 ──
  const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const SLOT_R = [[132, null, 12], [50, null, 12], [50, null, 62], [96, null, 12], [220, null, 12]], SLOT_H = [[48, 205, null], [48, 150, null], [52, null, 62], [96, null, 60]];
  // 진짜 버튼(동기화·환율 조회·더보기 등)과 겹치면 눌리지 않으므로, 겹치지 않는 자리를 골라 둬요
  function fitSlot(el, slots){
    const cs = [...hero.querySelectorAll('.hero-in button, .hero-in a, .hero-in [role="button"], .hero-in input')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
    const others = [...host.querySelectorAll('.hx-hit')].filter(x => x !== el && /hx-(bag|meal|home|bye)/.test(x.className)).map(x => x.getBoundingClientRect());
    for(const sl of slots){
      el.style.top = sl[0] + 'px'; el.style.left = sl[1] == null ? 'auto' : sl[1] + 'px'; el.style.right = sl[2] == null ? 'auto' : sl[2] + 'px';
      const r = el.getBoundingClientRect(); if(![...cs, ...others].some(c => overlap(r, c) > 40)) return;
    }
  }
  addEventListener('resize', () => { host.querySelectorAll('.hx-bag,.hx-meal').forEach(e => fitSlot(e, SLOT_R)); host.querySelectorAll('.hx-home,.hx-bye').forEach(e => fitSlot(e, SLOT_H)); });

  // 놀이 도감: 처음 발견할 때마다 "새 발견! (N/전체)"
  const DEX = { wish: '🌠 별똥별 소원', birds: '🐦 새 떼', lantern: '🏮 소원 풍등', ride: '🛺 뚝뚝·파라세일', ele: '🐘 코끼리', orb: '☀️ 해·달 이야기', title: '🗣️ 태국어 한마디', scene: '⛳ 일정 장면', gecko: '🦎 도마뱀', meal: '🍜 밥시간', bag: '🧳 가방', home: '🏠 한국 집', rainbow: '🌈 무지개', tee: '⛳ 티오프 샷', xmas: '🎄 크리스마스 불빛', dday: '🎉 D-day 마일스톤', bats: '🦇 황혼 박쥐', bye: '👋 작별 인사' };
  function found(id){
    fun.dex = fun.dex || {}; if(fun.dex[id] || !DEX[id]) return; fun.dex[id] = 1; save();
    const n = Object.keys(fun.dex).length, all = Object.keys(DEX).length;
    setTimeout(() => { toast('✨', `새 발견! ${DEX[id]} (${n}/${all})${n === all ? ' — 히어로 놀이 도감 완성! 🎉' : ''}`, 3400); if(n === all) hap('combo'); }, 3000);
  }

  // 비 그친 뒤 무지개, 폭염엔 물 한 모금 알림(날씨는 앱이 받아 둔 현재 값)
  let bowEl = null;
  function wxTick(){
    const w = typeof window.__wxNow === 'function' ? window.__wxNow() : null; if(!w || w.code == null) return;
    const c = w.code, rain = (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95, now = Date.now();
    if(rain && (!fun.rainTs || now - fun.rainTs > 6e4)){ fun.rainTs = now; save(); }
    const { rise, set, min } = sunNow(), day = min >= rise + 30 && min <= set - 30, since = now - (fun.rainTs || 0);
    const bow = !rain && c <= 3 && fun.rainTs && since >= 0 && since < 3 * 36e5 && day;
    if(bow && !bowEl){ bowEl = document.createElement('div'); bowEl.className = 'hx-rainbow'; host.appendChild(bowEl); }
    else if(!bow && bowEl){ bowEl.remove(); bowEl = null; }
    if(bow && once('bow' + dayKey())){ hap('combo'); toast('🌈', '비가 그쳤어요 — 해 반대편 하늘에 무지개가 떴을지도 몰라요', 4600); found('rainbow'); }
    if(w.temp >= 34 && tripNow() && once('hot' + dayKey())){ hap('ok'); toast('🥵', `지금 ${Math.round(w.temp)}°C — 물 자주 마시고 그늘에서 쉬어요`, 4200); }
  }

  // ── 놀이 더하기 5: 티오프 샷 · 크리스마스 불빛 · D-day 마일스톤 · 황혼 박쥐 · 귀국 작별 ──
  const mdNow = () => { const t = thai(); return (t.getUTCMonth() + 1) + '/' + t.getUTCDate(); };
  // 1) 티오프 샷: 골프 날 티오프 시각이 되면 공이 포물선으로 날아가고 "나이스 샷"
  function teeTick(){
    if(!tripNow()) return; const g = GOLF.find(x => x.d === mdNow() && x.tee), m = g && /(\d\d):(\d\d)/.exec(g.tee); if(!m) return;
    const t = thai(), now = t.getUTCHours() * 60 + t.getUTCMinutes(), tee = +m[1] * 60 + +m[2];
    if(now >= tee && now < tee + 15 && once('tee' + dayKey())){
      found('tee'); hap('ok'); toast('⛳', `티오프! ${g.c} — 나이스 샷, 오늘 라운드 즐겁게!`, 4200);
      if(!rm){ const b = document.createElement('i'); b.className = 'hx-ball'; host.appendChild(b); done(b, 2800); }
    }
  }
  // 2) 크리스마스: 12/24·25 히어로 위에 반짝이는 전구 줄
  let xmasEl = null;
  function xmasTick(){
    const t = thai(), on = t.getUTCFullYear() === 2026 && t.getUTCMonth() === 11 && (t.getUTCDate() === 24 || t.getUTCDate() === 25);
    if(on && !xmasEl){ xmasEl = document.createElement('div'); xmasEl.className = 'hx-xmas'; xmasEl.innerHTML = '<i></i>'.repeat(14); host.appendChild(xmasEl); }
    else if(!on && xmasEl){ xmasEl.remove(); xmasEl = null; }
    if(on && once('xmas' + dayKey())){ found('xmas'); hap('ok'); toast('🎄', t.getUTCDate() === 24 ? '크리스마스 이브예요 — 한여름 파타야에서 맞는 특별한 밤' : '메리 크리스마스! 파타야 마지막 날, 여름 크리스마스를 즐겨요', 4600); }
  }
  // 3) D-day 마일스톤: 출발 100·50·30·20·10·7·3·1일 전에 색종이가 흩날려요
  const MILES = { 100: '백 일 남았어요', 50: '50일 — 슬슬 설레기 시작!', 30: '한 달 전 — 바우처 PDF를 저장해 둘 때예요', 20: '20일 — 여권 유효기간·보험을 확인해요', 10: '10일 — 짐 싸기를 시작해요', 7: '일주일 — 환전과 eSIM을 챙겨요', 3: '사흘 — 상비약·보조배터리까지!', 1: '내일이에요 — 여권과 바우처 마지막 확인!' };
  function ddTick(){
    if(Date.now() >= tripDate('depart').getTime()) return;
    const t = thai(), n = Math.round((Date.UTC(2026, 11, 16) - Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())) / 864e5);
    if(!MILES[n] || !once('dd' + n)) return;
    found('dday'); hap('combo'); toast('🎉', `D-${n} — ${MILES[n]}`, 4800);
    if(!rm && SW){ for(let i = 0; i < 26; i++) S.push({ x: rnd(8, SW - 8), y: rnd(0, 40), vx: rnd(-.4, .4), vy: rnd(.25, .8), a: 1, r: 1.4 + Math.random() * 1.8, t: Math.random() * 6 }); if(!raf) raf = requestAnimationFrame(loop); }
  }
  // 4) 황혼 박쥐: 해 질 무렵 박쥐 떼가 가끔 지나가고, 하늘을 톡 누르면 날아가요
  const dusk = () => { const { set, min } = sunNow(); return min >= set - 5 && min <= set + 50; };
  let nextBat = Date.now() + 15000;
  function bats(py, tapped){
    if(flocks >= 2 || Date.now() - lastBird < 1500) return; lastBird = Date.now(); flocks++; if(tapped){ found('bats'); hap('tap'); if(once('bat1')) toast('🦇', '해 질 무렵이면 박쥐가 날아다녀요 — 열대의 저녁이에요', 3400); }
    const fl = document.createElement('div'); fl.className = 'hx-flock'; fl.style.top = Math.max(12, Math.min(py, 120)) + 'px'; let h = '';
    for(let i = 0; i < 4; i++) h += `<svg class="hx-bird hx-bat" style="--bx:${i * 26}px;--by:${(i % 2 ? 1 : -1) * Math.round(rnd(6, 16))}px;--bd:${(i * .15).toFixed(2)}s" viewBox="0 0 22 10" focusable="false"><path d="M1 3Q4 0 7 4Q9 1 11 5Q13 1 15 4Q18 0 21 3Q17 5 15 8Q13 6 11 9Q9 6 7 8Q5 5 1 3Z" fill="currentColor"/></svg>`;
    fl.innerHTML = h; host.appendChild(fl); done(fl, 7000); setTimeout(() => { flocks = Math.max(0, flocks - 1); }, 7000);
  }
  function batTick(){ if(rm || !live() || !tripNow() || !dusk()) return; const now = Date.now(); if(now > nextBat){ nextBat = now + rnd(25000, 50000); bats(rnd(30, 100), false); } }
  // 5) 귀국 작별: 1/2 아침~낮에 👋 버튼, 누르면 태국어 작별 인사
  let byeEl = null;
  function byeTick(){
    const t = thai(), h = t.getUTCHours(), on = t.getUTCFullYear() === 2027 && t.getUTCMonth() === 0 && t.getUTCDate() === 2 && h >= 6 && h < 13;
    if(on && !byeEl){ byeEl = mkHit('hx-bye', '👋'); byeEl.setAttribute('aria-label', '작별 인사'); fitSlot(byeEl, SLOT_H); byeEl.addEventListener('click', ev => { ev.stopPropagation(); found('bye'); hap('combo'); toast('👋', '라껀 쁘라텟 타이 (ลาก่อน) — 안녕, 태국! 래우 쯔어 깐 마이 (แล้วเจอกันใหม่) — 또 만나요', 5200); }); }
    else if(!on && byeEl){ byeEl.remove(); byeEl = null; }
  }

  let fitN = 0;
  function fun3Tick(){ comePlane(); bagTick(); eveTick(); arriveTick(); sleepTick(); homeTick(); wxTick(); teeTick(); xmasTick(); ddTick(); batTick(); byeTick();
    if(fitN++ % 3 === 0){ host.querySelectorAll('.hx-bag,.hx-meal').forEach(e => fitSlot(e, SLOT_R)); host.querySelectorAll('.hx-home,.hx-bye').forEach(e => fitSlot(e, SLOT_H)); }   // 날씨 글이 늦게 들어와 줄이 바뀌어도 겹치지 않게 다시 맞춰요
  }

  function funTick(){
    if(rm || !live()) return; const now = Date.now();
    if(isNight() && now > nextStar){ nextStar = now + rnd(28000, 65000); star(); }
    if(!isNight() && !ride && now > nextRide){ nextRide = now + rnd(55000, 100000); startRide(); }
  }

  window.__heroFun = { tee: teeTick, xmas: xmasTick, dday: ddTick, bats, bye: byeTick, dex(){ return Object.keys(fun.dex || {}).length; }, wxTick, found, star, startRide, birds, orbTalk, goldBird, startGecko, titleTalk, reset(){ fun.once = {}; delete fun.meal; } };
  const tick = () => { layers(); plane(); ny(); funTick(); fun2Tick(); fun3Tick(); };
  window.__heroTick = tick; window.__heroDebug = () => ({ sparks: S.length });
  tick(); setInterval(tick, 1000); document.addEventListener('wx:updated', layers);
})();
