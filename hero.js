/* 지연 로딩 조각(히어로 연출 모음): 자정 불꽃 · 배 · 방콕 야경 창문 · 오늘 일정 장면 · 새벽 안개 · 바람 구름 · 손가락 반짝임 · 스크롤 시차 · 하늘 위 비행기 */
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

  const tick = () => { layers(); plane(); ny(); };
  window.__heroTick = tick; window.__heroDebug = () => ({ sparks: S.length });
  tick(); setInterval(tick, 1000); document.addEventListener('wx:updated', layers);
})();
