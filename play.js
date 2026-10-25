/* 지연 로딩 조각(놀이터 모듈): app.js의 로더가 필요할 때 불러옴 */
// ── 바트 감각 테스트: "이 가격, 한국 돈으로 얼마?" 5문제 (환율은 화면의 ฿1 환율 사용, 없으면 대략 42원) ──
(function(){
  const scrim = $('bahtScrim'); if(!scrim) return;
  const body = $('bhBody'), sub = $('bhSub'), nextBtn = $('bhNext'), closeBtn = $('bhClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = (Math.random()*(i+1))|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
  // 대략적인 현지 가격(장소·시기별로 다름)
  const ITEMS = [
    ['💧','편의점 생수 600ml',10],['🍳','편의점 토스트 샌드위치',35],['🍝','길거리 팟타이 1접시',60],['🥗','로컬 식당 쏨땀 1접시',60],['🥥','노점 코코넛 워터 1개',50],
    ['🍺','편의점 싱하 맥주 캔',50],['🥭','망고 찰밥 1접시',120],['🚕','방콕 택시 기본요금',35],['🚐','파타야 썽태우 1회(시내)',10],['💆','전통 마사지 1시간',400],['⛳','캐디 팁(라운드당 일반적)',400],['🛬','공항 택시 공항 수수료',50]
  ];
  const LSB = 'thai2026_baht'; let st; try{ st = JSON.parse(localStorage.getItem(LSB)); }catch(e){} st = st || {best:0,plays:0};
  const save = () => { try{ localStorage.setItem(LSB, JSON.stringify(st)); }catch(e){} };
  let rate = 42, qs = [], qi = 0, score = 0, answered = false, prevFocus = null;
  const readRate = () => { const v = parseFloat(String($('fxThb') ? $('fxThb').textContent : '').replace(/[^\d.]/g,'')); rate = v > 10 && v < 100 ? v : 42; return rate; };
  const roundW = w => w < 1000 ? Math.max(10, Math.round(w/10)*10) : Math.round(w/100)*100;
  const fmt = n => n.toLocaleString('en-US') + '원';
  function build(){
    readRate();
    qs = shuffle(ITEMS).slice(0,5).map(([e,n,b]) => {
      const a = roundW(b*rate), cand = shuffle([0.35,0.5,2,3,5].map(m => roundW(b*rate*m))), d = [];
      for(const c of cand){ if(c !== a && c > 0 && !d.includes(c)) d.push(c); if(d.length === 3) break; }
      return { e, n, b, a, opts:[a, ...d].sort((x,y) => x-y) };
    });
    qi = 0; score = 0;
  }
  function renderQ(){
    answered = false; nextBtn.hidden = true; const q = qs[qi];
    sub.textContent = `문제 ${qi+1}/${qs.length} · 현재 ${score}점 · 1바트 ≈ ${rate.toFixed(rate % 1 ? 1 : 0)}원 기준`;
    body.innerHTML = `<div class="bh-item"><div class="bh-e" aria-hidden="true">${q.e}</div><div class="bh-name">${esc(q.n)}</div><div class="bh-price">฿${q.b.toLocaleString()}</div><p class="bh-q">한국 돈으로 얼마쯤일까요?</p></div>` +
      `<div class="bh-opts">${q.opts.map(o => `<button class="tq-opt" type="button" data-v="${o}">${fmt(o)}</button>`).join('')}</div><p class="tq-fb" id="bhFb"></p>`;
    const f = body.querySelector('.tq-opt'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function renderRes(){
    st.plays++; st.best = Math.max(st.best, score); save(); sub.textContent = '결과';
    const msg = score === qs.length ? '완벽한 바트 감각! 흥정도 문제없겠어요 💰' : score >= 3 ? '좋아요! 현지 물가가 감이 잡혀요 🛵' : '바트×' + Math.round(rate) + '원! 몇 번 더 하면 감이 와요 😄';
    body.innerHTML = `<div class="tq-res"><div class="tq-score">${score}<small>/${qs.length}</small></div><p class="tq-msg">${msg}</p><p class="tq-rec">최고 기록 ${st.best}/${qs.length} · 도전 ${st.plays}회</p><button class="wn-close bh-again" type="button">🔁 다시 도전</button><p class="th-note" style="margin-top:10px">가격은 대략적인 예시이고 장소·시기에 따라 달라요</p></div>`;
    nextBtn.hidden = true;
  }
  body.addEventListener('click', e => {
    if(e.target.closest('.bh-again')){ haptic('tap'); build(); renderQ(); return; }
    const b = e.target.closest('.tq-opt'); if(!b || answered) return; answered = true;
    const q = qs[qi], v = +b.dataset.v, right = v === q.a; if(right) score++;
    body.querySelectorAll('.tq-opt').forEach(x => { x.disabled = true; if(+x.dataset.v === q.a) x.classList.add('ok'); else if(x === b) x.classList.add('no'); });
    $('bhFb').innerHTML = right ? `<b>정답! ✅</b> ฿${q.b.toLocaleString()} ≈ ${fmt(q.a)}` : `<b>땡! ❌</b> ฿${q.b.toLocaleString()} ≈ ${fmt(q.a)}`;
    haptic(right ? 'ok' : 'strong'); sub.textContent = `문제 ${qi+1}/${qs.length} · 현재 ${score}점`;
    nextBtn.textContent = qi+1 < qs.length ? '다음 →' : '결과 보기'; nextBtn.hidden = false; nextBtn.focus({preventScroll:true});
  });
  nextBtn.addEventListener('click', () => { haptic('tap'); qi++; if(qi < qs.length) renderQ(); else renderRes(); });
  window.__bahtInfo = () => ({ best: st.best, plays: st.plays, rate: readRate() });
  function open(){
    prevFocus = document.activeElement; build(); renderQ();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openBaht = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.tq-opt:not(:disabled), .bh-again, #bhNext:not([hidden]), #bhClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 맛집 월드컵: 파타야·방콕 식당으로 이상형 월드컵 (8강/16강) → 우승 식당을 코스에 담거나 지도에서 보기 ──
(function(){
  const scrim = $('wcScrim'); if(!scrim) return;
  const body = $('wcBody'), sub = $('wcSub'), closeBtn = $('wcClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = (Math.random()*(i+1))|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
  const LSW = 'thai2026_wc'; let st; try{ st = JSON.parse(localStorage.getItem(LSW)); }catch(e){} st = st || {plays:0, wins:{}};
  const save = () => { try{ localStorage.setItem(LSW, JSON.stringify(st)); }catch(e){} };
  let city = 'bkk', size = 16, pool = [], next = [], idx = 0, round = 0, last = null, busy = false, data = null, prevFocus = null;
  const roundName = n => n <= 2 ? '결승' : n + '강';
  const getData = () => { try{ data = window.__foodMapData(); }catch(e){ data = null; } return data; };
  function topWinner(){
    let best = null; Object.entries(st.wins || {}).forEach(([k, m]) => Object.entries(m).forEach(([id, n]) => { if(!best || n > best.n) best = {k, id, n}; }));
    if(!best || !getData() || !data[best.k]) return null;
    const r = data[best.k].R.find(x => x.id === best.id); return r ? {r, n:best.n} : null;
  }
  function setup(){
    getData(); if(!data){ sub.textContent = ''; body.innerHTML = '<p class="tq-msg">식당 정보를 불러오지 못했어요. 새로고침 후 다시 열어주세요.</p>'; return; }
    const max = data[city].R.length, top = topWinner();
    if(size > max) size = 8;
    sub.textContent = '식당 두 곳 중 끌리는 곳을 골라 우승 식당을 가려요';
    body.innerHTML = `<p class="bh-q">도시</p><div class="wc-seg" role="group" aria-label="도시 선택">${Object.entries(data).map(([k, v]) => `<button class="tq-opt wc-opt" type="button" data-city="${k}" aria-pressed="${k === city}">${esc(v.name)} ${v.R.length}곳</button>`).join('')}</div>` +
      `<p class="bh-q">토너먼트 크기</p><div class="wc-seg" role="group" aria-label="강 수 선택">${[8, 16].map(n => `<button class="tq-opt wc-opt" type="button" data-size="${n}" aria-pressed="${n === size}" ${n > max ? 'disabled' : ''}>${n}강</button>`).join('')}</div>` +
      `<button class="wn-close tq-again wc-go" type="button">🏆 시작하기</button>` +
      `<p class="tq-rec">${st.plays ? `지금까지 ${st.plays}번 했어요` : '처음이라면 8강부터!'}${top ? ` · 최다 우승 ${esc(top.r.ko)} (${top.n}회)` : ''}</p>`;
  }
  function start(){
    getData(); pool = shuffle(data[city].R).slice(0, size); next = []; idx = 0; round = size; last = null; busy = false; show();
  }
  const tags = r => [r.badge ? '🏅 ' + esc(r.badge) : '', r.val ? '💸 가성비' : '', r.must ? '📌 꼭 가볼 곳' : '', r.insta ? '📸 인스타 추천' : ''].filter(Boolean).map(t => `<span class="fm-tag">${t}</span>`).join('');
  const card = (r, side) => `<button class="wc-card" type="button" data-side="${side}" aria-label="${esc(r.ko)} 선택"><span class="wc-nm">${esc(r.ko)}</span><span class="wc-en">${esc(r.en)}</span><span class="wc-kind">${esc(r.kind)}</span><span class="wc-price">${esc(r.price)}${r.star && r.star !== '—' ? ' · ★ ' + esc(r.star) : ''}</span><span class="wc-tags">${tags(r)}</span></button>`;
  function show(){
    if(pool.length === 1 && !next.length){ return finish(pool[0]); }
    const a = pool[idx], b = pool[idx + 1], total = pool.length / 2;
    sub.textContent = `${roundName(pool.length)} ${idx / 2 + 1}/${total} · 끌리는 곳을 눌러주세요`;
    body.innerHTML = card(a, 0) + `<div class="wc-vs" aria-hidden="true">VS</div>` + card(b, 1);
    const f = body.querySelector('.wc-card'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function pickSide(side){
    if(busy) return; busy = true; haptic('tap');
    const a = pool[idx], b = pool[idx + 1], w = side ? b : a, l = side ? a : b; last = l;
    body.querySelectorAll('.wc-card').forEach(c => c.classList.add(+c.dataset.side === side ? 'win' : 'lose'));
    setTimeout(() => {
      next.push(w); idx += 2;
      if(idx >= pool.length){ pool = next; next = []; idx = 0; }
      busy = false;
      if(pool.length === 1) finish(pool[0]); else show();
    }, 380);
  }
  function finish(w){
    st.plays++; st.wins = st.wins || {}; st.wins[city] = st.wins[city] || {}; st.wins[city][w.id] = (st.wins[city][w.id] || 0) + 1; save(); haptic('ok');
    if(typeof window.__celebrate === 'function') try{ window.__celebrate(); }catch(e){}
    sub.textContent = `${data[city].name} ${size}강 우승!`;
    body.innerHTML = `<div class="wc-win"><div class="wc-trophy" aria-hidden="true">🏆</div><div class="wc-nm">${esc(w.ko)}</div><div class="wc-en">${esc(w.en)}</div><div class="wc-kind">${esc(w.kind)}</div><div class="wc-price">${esc(w.price)}</div><div class="wc-tags">${tags(w)}</div>${last ? `<p class="tq-rec">결승 상대: ${esc(last.ko)}</p>` : ''}</div>` +
      `<div class="wc-acts"><button class="tq-opt wc-add" type="button">🧳 코스에 담기</button><button class="tq-opt wc-map" type="button">🗺️ 지도에서 보기</button><button class="tq-opt wc-copy" type="button">📋 결과 복사</button><button class="wn-close tq-again wc-again" type="button">🔄 다시 하기</button></div>`;
    body.dataset.win = w.id; body.dataset.last = last ? last.ko : '';
    const f = body.querySelector('.wc-map'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  body.addEventListener('click', e => {
    const c = e.target.closest('.wc-card'); if(c){ pickSide(+c.dataset.side); return; }
    const oc = e.target.closest('[data-city]'); if(oc){ city = oc.dataset.city; haptic('tap'); setup(); return; }
    const os = e.target.closest('[data-size]'); if(os && !os.disabled){ size = +os.dataset.size; haptic('tap'); setup(); return; }
    if(e.target.closest('.wc-go')){ haptic('tap'); start(); return; }
    if(e.target.closest('.wc-again')){ haptic('tap'); setup(); return; }
    const id = body.dataset.win, w = data && data[city] && data[city].R.find(r => r.id === id);
    if(e.target.closest('.wc-add') && w){
      const res = typeof window.__foodMapCourseAdd === 'function' ? window.__foodMapCourseAdd(city, id) : 'err';
      const btn = e.target.closest('.wc-add'); btn.textContent = res === 'ok' ? '✅ 담았어요' : res === 'dup' ? '이미 코스에 있어요' : res === 'full' ? '코스가 가득 찼어요(10곳)' : '담지 못했어요'; haptic(res === 'ok' ? 'ok' : 'tap'); return;
    }
    if(e.target.closest('.wc-map') && w){ close(); setTimeout(() => { if(typeof window.__foodMapFocus === 'function') window.__foodMapFocus(city, id); }, 60); return; }
    if(e.target.closest('.wc-copy') && w){
      const txt = `🏆 우리 가족 맛집 월드컵 (${data[city].name} ${size}강)\n우승: ${w.ko} (${w.en})` + (body.dataset.last ? `\n결승 상대: ${body.dataset.last}` : '');
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).catch(() => { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e2){} ta.remove(); });
      const b = e.target.closest('.wc-copy'); b.textContent = '✅ 복사됨'; haptic('ok');
      if(typeof window.__toast === 'function') window.__toast('🏆', '결과 복사 완료 — 메신저에 붙여넣기', 2400);
    }
  });
  window.__wcInfo = () => ({ plays: st.plays, top: (topWinner() || {}).r ? topWinner().r.ko : '', topN: (topWinner() || {}).n || 0 });
  function open(){
    prevFocus = document.activeElement; setup();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openWorldcup = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key === 'Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wc-opt:not(:disabled), .wc-go, .wc-card, .wc-add, .wc-map, .wc-copy, .wc-again, #wcClose')].filter(x => x.offsetParent !== null);
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(!n) return;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 태국 힐링 사운드: Web Audio로 파도·비·밤 벌레 소리를 직접 합성 (파일·인터넷 없음, 켤 때만 재생, 수면 타이머) ──
(function(){
  const scrim = $('chillScrim'); if(!scrim) return;
  const bodyEl = $('chBody'), stopBtn = $('chStop'), closeBtn = $('chClose');
  const SND = [
    { id:'wave', e:'🌊', n:'파도 소리', d:'파타야 해변의 잔잔한 밀물·썰물' },
    { id:'rain', e:'🌧️', n:'열대 빗소리', d:'스콜이 지나가는 소리' },
    { id:'bug',  e:'🦗', n:'밤 벌레 소리', d:'방콕 밤 정원의 귀뚜라미' }
  ];
  let ctx = null, master = null, timerEnd = 0, timerId = 0, tickId = 0, minutes = 30, prevFocus = null;
  const on = {}, vol = { wave:.6, rain:.5, bug:.5 }, voices = {};
  function ensure(){
    if(ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination); return true;
  }
  function noise(kind){
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); let last = 0;
    for(let i=0;i<len;i++){ const w = Math.random()*2-1; if(kind === 'brown'){ last = (last + .02*w)/1.02; d[i] = last*3.5; } else d[i] = w; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; return src;
  }
  function build(id){
    const out = ctx.createGain(); out.gain.value = 0; out.connect(master); const stops = [];
    const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(); stops.push(() => { try{ o.stop(); }catch(e){} }); return o; };
    const src = k => { const n = noise(k); n.start(); stops.push(() => { try{ n.stop(); }catch(e){} }); return n; };
    if(id === 'wave'){
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; const g = ctx.createGain(); g.gain.value = .55;
      const lfo = osc('sine', .11), lg = ctx.createGain(); lg.gain.value = .4; lfo.connect(lg); lg.connect(g.gain);
      src('brown').connect(lp); lp.connect(g); g.connect(out);
    } else if(id === 'rain'){
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; const g = ctx.createGain(); g.gain.value = .22;
      src('white').connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
    } else {
      const car = osc('sine', 4300), a = ctx.createGain(), env = ctx.createGain(), trim = ctx.createGain(); a.gain.value = .5; env.gain.value = .5; trim.gain.value = .14;
      const l1 = osc('sine', 27), l1g = ctx.createGain(); l1g.gain.value = .5; l1.connect(l1g); l1g.connect(a.gain);
      const l2 = osc('square', 1.15), l2g = ctx.createGain(); l2g.gain.value = .5; l2.connect(l2g); l2g.connect(env.gain);
      car.connect(a); a.connect(env); env.connect(trim); trim.connect(out);
    }
    return { out, stop: () => stops.forEach(f => f()) };
  }
  function setVol(id){ if(voices[id]) voices[id].out.gain.setTargetAtTime(vol[id], ctx.currentTime, .15); }
  function toggle(id, force){
    const want = force === undefined ? !on[id] : force;
    if(want === !!on[id]) return;
    if(want){
      if(!ensure()){ if(typeof window.__toast === 'function') window.__toast('🔇 소리 없음', '이 기기에서는 소리를 만들 수 없어요'); return; }
      if(ctx.state === 'suspended') ctx.resume();
      voices[id] = build(id); on[id] = true; setVol(id);
      if(!timerEnd && minutes) setTimer(minutes);
    } else {
      const v = voices[id]; on[id] = false; delete voices[id];
      if(v){ v.out.gain.setTargetAtTime(0, ctx.currentTime, .12); setTimeout(() => v.stop(), 600); }
      if(!Object.values(on).some(Boolean)) clearTimer();
    }
    paint();
  }
  function stopAll(){ Object.keys(on).forEach(id => toggle(id, false)); clearTimer(); }
  function clearTimer(){ clearTimeout(timerId); clearInterval(tickId); timerEnd = 0; paintLeft(); }
  function setTimer(m){
    clearTimeout(timerId); clearInterval(tickId); minutes = m;
    if(!m || !Object.values(on).some(Boolean)){ timerEnd = 0; paintLeft(); return; }
    timerEnd = Date.now() + m*60000;
    timerId = setTimeout(() => { if(master){ master.gain.setTargetAtTime(0, ctx.currentTime, 2.5); } setTimeout(() => { stopAll(); if(master) master.gain.value = .9; if(typeof window.__toast === 'function') window.__toast('🌙 수면 타이머', '소리를 껐어요. 좋은 꿈 꾸세요'); }, 7000); }, m*60000);
    tickId = setInterval(paintLeft, 1000); paintLeft();
  }
  function paintLeft(){
    const el = $('chLeft'); if(!el) return;
    const left = timerEnd ? Math.max(0, Math.ceil((timerEnd - Date.now())/1000)) : 0;
    el.textContent = timerEnd ? `⏲ ${Math.floor(left/60)}분 ${String(left%60).padStart(2,'0')}초 뒤 자동으로 꺼져요` : (Object.values(on).some(Boolean) ? '타이머 없음 — 직접 끌 때까지 재생돼요' : '');
  }
  function paint(){
    bodyEl.innerHTML = `<div class="ch-timer" role="group" aria-label="수면 타이머">` + [15,30,60,0].map(m => `<button class="wh-chip" type="button" data-m="${m}" aria-pressed="${m === minutes}">${m ? m + '분 뒤 끄기' : '타이머 없음'}</button>`).join('') + `</div><p class="ch-left" id="chLeft" aria-live="off"></p>` +
      SND.map(x => `<div class="ch-card"><div class="ch-top"><div><div class="ch-nm">${x.e} ${x.n}</div><div class="ch-ds">${x.d}</div></div><button class="ch-sw" type="button" data-id="${x.id}" aria-pressed="${!!on[x.id]}">${on[x.id] ? '끄기' : '켜기'}</button></div>` +
        `<label class="ch-vol">🔈 <input type="range" min="5" max="100" value="${Math.round(vol[x.id]*100)}" data-vol="${x.id}" aria-label="${x.n} 볼륨"> 🔊</label></div>`).join('');
    paintLeft();
  }
  bodyEl.addEventListener('click', e => {
    const sw = e.target.closest('.ch-sw'); if(sw){ haptic('tap'); const id = sw.dataset.id; toggle(id); const again = bodyEl.querySelector(`.ch-sw[data-id="${id}"]`); if(again) again.focus({preventScroll:true}); return; }
    const c = e.target.closest('.ch-timer .wh-chip'); if(c){ haptic('tap'); setTimer(+c.dataset.m); bodyEl.querySelectorAll('.ch-timer .wh-chip').forEach(x => x.setAttribute('aria-pressed', String(x === c))); }
  });
  bodyEl.addEventListener('input', e => { const r = e.target.closest('input[data-vol]'); if(!r) return; vol[r.dataset.vol] = +r.value/100; if(ctx) setVol(r.dataset.vol); });
  stopBtn.addEventListener('click', () => { haptic('tap'); stopAll(); });
  window.__chillInfo = () => ({ playing: SND.filter(x => on[x.id]).map(x => x.e).join(''), state: ctx ? ctx.state : null, timerEnd, minutes });
  function open(){
    prevFocus = document.activeElement; paint();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    const f = bodyEl.querySelector('.ch-sw'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openChill = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.ch-timer .wh-chip, .ch-sw, .ch-vol input, #chStop, #chClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 티오프 전 5분 스트레칭: 6동작 × 45초 타이머 (자동 넘김·소리·진동, 화면 꺼짐 방지) ──
(function(){
  const scrim = $('stretchScrim'); if(!scrim) return;
  const body = $('stBody'), goBtn = $('stGo'), prevBtn = $('stPrev'), nextBtn = $('stNext'), closeBtn = $('stClose'), sub = $('stSub');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const SEC = 45;
  const STEPS = [
    ['🙆','목·어깨 풀기','목을 천천히 좌우로 기울이고, 어깨를 앞뒤로 크게 돌려요.'],
    ['🤗','팔·가슴 열기','한 팔을 가슴 앞으로 당겨 15초, 반대쪽도 15초. 마지막은 두 손을 뒤로 깍지 끼고 가슴을 열어요.'],
    ['🌀','몸통 회전','클럽을 어깨 뒤에 걸치고(없으면 팔짱) 상체를 좌우로 천천히 돌려요. 골반은 앞을 보게 두세요.'],
    ['🧎','허리·허벅지 뒤','무릎을 살짝 굽히고 상체를 숙여 허벅지 뒤를 늘려요. 반동은 주지 말고 숨은 편하게 쉬세요.'],
    ['🦵','런지·고관절','한 발을 크게 내딛고 골반을 천천히 낮춰요. 좌우 번갈아 해요.'],
    ['🏌️','손목 풀기·빈 스윙','손목을 돌리고, 클럽으로 가볍게 빈 스윙 5번. 점점 크게 휘두르세요.']
  ];
  const LS = 'thai2026_stretch'; let st; try{ st = JSON.parse(localStorage.getItem(LS)); }catch(e){} st = st || {done:0};
  const save = () => { try{ localStorage.setItem(LS, JSON.stringify(st)); }catch(e){} };
  let idx = 0, left = SEC, running = false, finished = false, endAt = 0, timer = 0, prevFocus = null, wake = null, ctx = null;
  const R = 80, C = 2*Math.PI*R;
  function beep(freq, dur){
    try{
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; ctx = ctx || new AC(); if(ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.start(t); o.stop(t + dur + .02);
    }catch(e){}
  }
  async function lock(){ try{ if(navigator.wakeLock && !wake){ wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } }catch(e){} }
  function unlock(){ try{ if(wake){ wake.release(); } }catch(e){} wake = null; }
  function render(){
    if(finished){
      body.innerHTML = `<div class="st-end"><div class="e" aria-hidden="true">🎉</div><div class="st-name">몸 풀기 끝!</div><p class="st-cue">오늘 라운드도 좋은 샷 많이 나오길 응원해요. 물 한 모금 마시고 티잉 그라운드로 가볼까요?</p></div>`;
      goBtn.textContent = '🔁 한 번 더'; prevBtn.disabled = true; nextBtn.disabled = true; return;
    }
    const [e, n, cue] = STEPS[idx], nx = STEPS[idx+1];
    body.innerHTML = `<div class="st-dots" aria-hidden="true">${STEPS.map((_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'cur' : ''}"></i>`).join('')}</div>` +
      `<div class="st-ring"><svg viewBox="0 0 176 176" aria-hidden="true"><circle class="bg" cx="88" cy="88" r="${R}"/><circle class="fg" id="stFg" cx="88" cy="88" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0"/></svg><div class="in"><span class="e" aria-hidden="true">${e}</span><span class="t" id="stT">${left}</span></div></div>` +
      `<div class="st-name">${idx+1}/${STEPS.length} · ${esc(n)}</div><p class="st-cue">${esc(cue)}</p><p class="st-next">${nx ? '다음: ' + esc(nx[0] + ' ' + nx[1]) : '마지막 동작이에요'}</p>`;
    goBtn.textContent = running ? '⏸ 일시정지' : (left < SEC ? '▶ 계속' : '▶ 시작');
    prevBtn.disabled = idx === 0; nextBtn.disabled = false; paintTime();
  }
  function paintTime(){
    const t = $('stT'), fg = $('stFg'); if(t) t.textContent = left; if(fg) fg.setAttribute('stroke-dashoffset', (C * (1 - left/SEC)).toFixed(1));
    sub.textContent = running ? `${STEPS[idx][1]} · 남은 ${left}초 (전체 ${STEPS.length - idx - 1}동작 남음)` : '여섯 동작을 45초씩, 총 4분 30초예요. 시작을 누르면 알아서 다음 동작으로 넘어가요. 통증이 느껴지면 바로 멈추세요';
  }
  function stop(){ clearInterval(timer); timer = 0; running = false; unlock(); }
  function go(){
    if(finished){ finished = false; idx = 0; left = SEC; render(); start(); return; }
    running ? (stop(), render()) : start();
  }
  function start(){
    running = true; endAt = Date.now() + left*1000; lock(); beep(660, .12); haptic('tap');
    clearInterval(timer); timer = setInterval(tick, 250); render();
  }
  function tick(){
    const l = Math.max(0, Math.ceil((endAt - Date.now())/1000));
    if(l !== left){ left = l; paintTime(); if(l > 0 && l <= 3){ beep(520, .08); haptic('tap'); } }
    if(l <= 0) advance(true);
  }
  function advance(auto){
    if(idx >= STEPS.length - 1){ stop(); finished = true; st.done = (st.done||0) + 1; save(); beep(880, .3); haptic('strong'); render();
      if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🧘 몸 풀기 끝', msg:'오늘 라운드 파이팅!', ms:2600, at:body, dy:0, n:16, spread:100, petals:true });
      return; }
    idx++; left = SEC; beep(740, .15); haptic('ok');
    if(running){ endAt = Date.now() + left*1000; }
    render();
  }
  function jump(d){ const was = running; idx = Math.min(STEPS.length - 1, Math.max(0, idx + d)); left = SEC; endAt = Date.now() + left*1000; haptic('tap'); render(); if(was) goBtn.textContent = '⏸ 일시정지'; }
  goBtn.addEventListener('click', go);
  prevBtn.addEventListener('click', () => jump(-1));
  nextBtn.addEventListener('click', () => { if(idx >= STEPS.length - 1){ advance(false); } else jump(1); });
  function open(){
    prevFocus = document.activeElement; idx = 0; left = SEC; finished = false; running = false; render();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden'; void scrim.offsetHeight; scrim.classList.add('on');
    try{ goBtn.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return; stop();
    scrim.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => { scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){} haptic('tap');
  }
  document.addEventListener('visibilitychange', () => { if(!document.hidden && running){ lock(); tick(); } });
  window.__openStretch = open; window.__stretchInfo = () => ({ done: st.done||0, steps: STEPS.length, sec: SEC });
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key === 'Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [prevBtn, goBtn, nextBtn, closeBtn].filter(b => !b.disabled), cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 오늘의 골프 운세: 이름 + 방콕 날짜로 매일 바뀌는(하루 동안 고정) 라운드 운세 ──
(function(){
  const scrim = $('fortuneScrim'); if(!scrim) return;
  const chipsEl = $('fcChips'), card = $('fcCard'), copyBtn = $('fcCopy'), closeBtn = $('fcClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const people = FAMS.flatMap(f => f.rows.map(r => r.n));
  const CLUBS = ['드라이버','3번 우드','유틸리티','5번 아이언','7번 아이언','9번 아이언','피칭 웨지','샌드 웨지','퍼터'];
  const GOALS = ['페어웨이 안착 7번 이상','3퍼트 없는 라운드','벙커에서 한 번에 탈출','파 세이브 5번','버디 퍼트는 한 번 과감하게','캐디님께 칭찬 한마디 건네기','OB 없이 18홀 마치기','첫 홀 티샷 깔끔하게','그린 적중 5번','동반자 칭찬 3번'];
  const LINES = ['오늘은 드라이버가 슬라이스를 한 번쯤 봐줘요','그린 위에서는 캐디님의 라인이 정답이에요','연습 스윙보다 첫 티샷이 더 잘 맞는 날','바람을 잊고 거리를 믿으면 버디가 와요','벙커는 피해도 되고, 들어가면 즐겨도 돼요','가장 좋은 샷은 후반 9홀에 나와요','캐디님 말에 한 번 더 귀 기울이면 한 타 줄어요','숏게임이 스코어를 지켜주는 날','욕심 대신 템포, 템포 대신 미소','점심 뒤 첫 홀이 승부처예요','파4에서는 투온보다 안전한 레이업이 이득','퍼터가 말을 잘 듣는 날 — 오르막은 짧게 조심'];
  const COLORS = ['제이드 그린','골드','코랄','하늘색','라벤더'];
  const STATS = ['티샷','아이언','숏게임','퍼팅','멘탈'];
  const bkkKey = () => { const t = new Date(Date.now() + 7*36e5); return `${t.getUTCFullYear()}-${t.getUTCMonth()+1}-${t.getUTCDate()}`; };
  const hash = str => { let h = 2166136261; for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function fortune(name){
    const r = rng(hash(name + '|' + bkkKey())), pick = a => a[(r()*a.length)|0];
    const st = STATS.map(l => [l, 1 + ((r()*5)|0)]), avg = st.reduce((a,x)=>a+x[1],0)/st.length;
    const tier = avg >= 4 ? '🌟 대박 라운드' : avg >= 3.2 ? '😄 좋은 흐름' : avg >= 2.4 ? '🙂 무난한 하루' : '🛡️ 안전 운전의 날';
    const today = typeof GOLF !== 'undefined' ? GOLF.find(g => { const t = new Date(Date.now() + 7*36e5); return g.d === `${t.getUTCMonth()+1}/${t.getUTCDate()}`; }) : null;
    return { name, tier, st, line: pick(LINES), club: pick(CLUBS), hole: 1 + ((r()*18)|0), goal: pick(GOALS), color: pick(COLORS), food: pick(FOODS)[0], beer: pick(['싱하','레오','창']), today };
  }
  function render(n){
    const f = fortune(n);
    card.innerHTML = `<div class="fc-top"><span class="fc-name">${dot(n)}${esc(n)}</span><span class="fc-tier">${f.tier}</span></div>` +
      `<p class="fc-line">“${esc(f.line)}”</p>` +
      `<div class="fc-stats">${f.st.map(([l,v]) => `<div class="fc-st"><span>${l}</span><i><b style="width:${v*20}%"></b></i><output>${'★'.repeat(v)}</output></div>`).join('')}</div>` +
      `<ul class="fc-facts"><li>🏌️ 행운의 클럽 <b>${esc(f.club)}</b> · 행운의 홀 <b>${f.hole}번</b></li><li>🎯 오늘의 목표 <b>${esc(f.goal)}</b></li><li>🎨 행운의 색 <b>${esc(f.color)}</b></li><li>🍜 라운드 뒤 <b>${esc(f.food)}</b> + 🍺 <b>${esc(f.beer)}</b></li>${f.today ? `<li>⛳ 오늘 라운드 <b>${esc(f.today.c)}</b> (${esc((f.today.tee||'').replace(' 확정',''))} 티오프)</li>` : ''}</ul>`;
    copyBtn.hidden = false;
    copyBtn.dataset.txt = `🔮 ${n}의 오늘 골프 운세 · ${f.tier}\n“${f.line}”\n행운의 클럽 ${f.club} · 행운의 홀 ${f.hole}번\n오늘의 목표: ${f.goal}\n(태국 겨울 여행 2026 · 재미로만!)`;
  }
  chipsEl.innerHTML = people.map(n => `<button class="wh-chip" type="button" data-n="${esc(n)}" aria-pressed="false" style="border-color:var(--line)">${esc(n)}</button>`).join('');
  card.innerHTML = '<p class="fc-empty">위에서 이름을 눌러보세요 🔮<br>오늘 하루 동안의 라운드 운세가 나와요</p>';
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.wh-chip'); if(!b) return;
    chipsEl.querySelectorAll('.wh-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    haptic('ok'); render(b.dataset.n);
  });
  copyBtn.addEventListener('click', async () => {
    const o = copyBtn.textContent;
    try{ await navigator.clipboard.writeText(copyBtn.dataset.txt || ''); copyBtn.textContent = '✅ 복사했어요'; }catch(e){ copyBtn.textContent = '⚠️ 복사 실패'; }
    haptic('ok'); setTimeout(() => { copyBtn.textContent = o; }, 1800);
  });
  let prevFocus = null;
  function open(){
    prevFocus = document.activeElement;
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    const f = chipsEl.querySelector('.wh-chip'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openFortune = open; window.__fortuneFor = fortune;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-chip, #fcCopy:not([hidden]), #fcClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 태국 역사·공부: 연표 · 여행지 이야기 · 알아두기 (읽기만 하는 큰 글씨 목록) ──
(function(){
  const scrim = $('historyScrim'); if(!scrim) return;
  const tabsEl = $('hsTabs'), body = $('hsBody'), closeBtn = $('hsClose');
  const syncTabs = wireTabs(tabsEl, body);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // [때, 제목, 설명, 이번 여행과 연결, 같은 때 우리나라] — 중학생도 읽을 수 있게 쉬운 말로.
  // 한국민족문화대백과사전·우리역사넷·위키백과·브리태니커 등을 맞춰 보고 확인된 사실만 적었어요. 자료마다 다른 곳은 그렇게 적었어요.
  const TIMELINE = [
    ['6~11세기','드바라바티 문화','수코타이보다 훨씬 앞선 6~11세기쯤, 지금의 태국 중부에는 몬족과 관련된 "드바라바티"라는 문화가 있었어요. 시기는 학자에 따라 조금씩 달라요.','','한반도는 고구려·백제·신라가 겨루던 삼국 시대였어요. 7세기에 신라가 삼국을 통일했어요(668년 고구려 멸망, 676년 나당전쟁 마무리).'],
    ['1238년경','수코타이 왕국','13세기에 타이족 사람들이 지금의 태국 북부에 세운 왕국이에요. 보통 1238년을 시작으로 봐요. 크메르(캄보디아) 사람들의 지배에서 벗어나 독립했다고 전해져요. 이름은 "행복의 새벽"이라는 뜻으로 풀이돼요.','','고려는 몽골의 침입(1231년~)에 맞서 수도를 강화도로 옮겨(1232년) 싸우던 때였어요.'],
    ['1283년경','태국 글자 이야기','람캄행 대왕이 태국 글자를 만들었다고 전해져요. 이 이야기는 돌기둥에 새긴 글(람캄행 비문, 새겨진 연도는 1292년)에 바탕을 둬요. 하지만 이 비문이 정말 그 시대 것인지 학자들 사이에 논쟁이 있어서, 만든 때와 사람은 확실하지 않아요.','','고려는 원나라의 간섭을 받던 때(충렬왕, 1274~1308년)예요. 한글은 이보다 160년쯤 뒤인 1443년에 만들어져요.'],
    ['1296년','치앙마이와 란나 왕국','몽라이 왕이 1296년 치앙마이를 세웠어요. 이곳을 중심으로 태국 북부에 란나 왕국이 번성했어요. 란나의 시작을 1292년으로 보는 자료도 있어요.','','같은 때 고려는 충렬왕 시기로, 원나라의 간섭을 받고 있었어요.'],
    ['1351년','아유타야 왕국','우통 왕(라마티보디 1세)이 아유타야를 도읍으로 세운 왕국이에요. 1350년으로 보는 자료도 있어요. 큰 강과 바다가 가까워 외국 배가 오가는 무역으로 부자 나라가 됐고, 1767년까지 약 400년 이어졌어요.','12/31 골프 치러 가는 로열 방파인 골프클럽이 아유타야와 같은 지역이에요. 옛 왕들이 쉬러 오던 방파인 궁전도 근처에 있어요.','같은 해(1351년) 고려에서는 공민왕이 왕이 됐어요. 공민왕은 원나라의 간섭을 줄이는 개혁(1356년)을 했고, 41년 뒤인 1392년에 이성계가 조선을 세워요.'],
    ['1438~1458년','나라의 틀을 세우다','1438년 아유타야가 수코타이를 자기 땅으로 합쳤어요. 이어 왕이 된 보롬마뜨라이로까낫(1448년)은 신하의 등급을 정하는 제도(1454년, 삭디나)와 법(1458년)을 만들어 나라의 틀을 갖췄어요.','','세종대왕이 한글(훈민정음)을 만들고(1443년) 백성에게 알린(1446년) 때예요. 두 나라 모두 나라의 틀을 다지던 시기였어요.'],
    ['1511년','유럽 사람이 찾아왔어요','포르투갈이 1511년 말라카를 차지한 뒤, 사절 두아르테 페르난데스를 아유타야에 보냈어요. 유럽 사람이 이 나라를 찾아온 첫 사례 가운데 하나로 알려져 있어요. 얼마 뒤 포르투갈과 무역을 허락하는 조약을 맺었는데, 1516년이라는 자료와 1518년이라는 자료가 있어요.','','조선은 중종 때(1506~1544년)였어요. 1510년에는 일본 사람들이 삼포(부산포·제포·염포)에서 일으킨 삼포왜란이 있었어요.'],
    ['1584~1593년','나레수안 대왕과 독립','아유타야는 한동안 이웃 나라 버마(지금의 미얀마) 아래에 있었어요. 나레수안 왕이 1584년 독립을 선언하고 싸웠어요. 타이 기록에는 1593년 1월 코끼리를 타고 버마 왕자와 일대일로 싸워 이겼다고 나와요. 다만 이 코끼리 전투가 실제로 있었는지는 의견이 갈려요.','','1592년 임진왜란이 일어났어요. 이순신 장군과 의병이 일본군에 맞서 싸웠고, 1598년 노량 해전을 끝으로 전쟁이 끝났어요(이순신 장군은 이 해전에서 전사했어요).'],
    ['1767년','아유타야가 무너졌어요','버마 군이 14개월 동안 아유타야를 에워싼 끝에 1767년 4월 성벽을 뚫고 들어왔어요. 400년 도읍이 큰 피해를 입었고, 많은 건물과 기록이 사라졌다고 해요.','','조선은 영조 임금 때(1724~1776년)였어요. 영조는 신하들이 편을 갈라 싸우지 않도록 "탕평책"을 폈어요.'],
    ['1767년 12월','탁신 왕과 톤부리','탁신 장군이 버마군을 몰아내고 1767년 12월 28일 톤부리에서 왕이 됐어요. 톤부리는 지금 방콕의 강 서쪽 동네예요. 탁신 왕은 약 14년 동안(1782년까지) 흩어진 나라를 다시 일으켜 세웠어요.','왓 아룬이 있는 곳이 톤부리예요. 이 절은 이때 "왓 채앙"으로 불렸고, 에메랄드 불상을 1779년부터 몇 해 동안 모셨던 곳이에요.','영조의 손자 정조가 1776년 왕위에 올라요.'],
    ['1782년','방콕 시대의 시작','탁신 왕 다음으로 라마 1세(짜끄리 장군)가 1782년 4월 왕이 되어 짜끄리 왕조를 열었어요. 수도를 강 동쪽의 방콕으로 옮기고 1782년 5월 왕궁을 짓기 시작했어요. 이 왕조가 지금까지 이어져서 지금의 왕이 10번째예요.','12/28 "방콕 대표 사원" 일정에서 왕궁과 왓 포를 가요. 왕궁은 이때 짓기 시작했고, 왓 포는 이때 크게 고쳐졌어요.','정조는 즉위하자 곧 규장각을 세워 인재를 길렀고, 수원 화성을 쌓았어요(1794년 시작, 1796년 완성).'],
    ['1855년','보링 조약','라마 4세(몽꿋)가 1855년 영국과 보링 조약을 맺었어요. 외국 상인이 자유롭게 무역하게 해 주는 약속이에요. 대신 영국 사람이 태국에서 죄를 지어도 태국 법으로 재판받지 않는 권리(치외법권)를 줬어요. 문을 열되 독립은 지키려는 선택이었어요.','','조선은 철종 때(1849~1863년)였어요. 이어 흥선대원군이 외국과의 교류를 막는 쇄국 정책을 폈고(1866년 병인박해 등), 조선은 1876년 강화도 조약으로 문을 열었어요.'],
    ['1868~1910년','라마 5세 (출라롱꼰 대왕)','1853년에 태어나 열다섯 살에 왕이 됐어요. 처음 5년은 섭정이 나랏일을 대신 맡았고, 42년 동안 왕 자리에 있었어요. 학교, 철도, 우편, 전신 같은 것을 들여와 나라를 바꿨어요(근대화). 1905년에는 단계적으로 줄여 온 노예 제도를 완전히 없앴어요. 프랑스와 영국이 주변 나라를 식민지로 만들 때, 외교로 균형을 잡으며 독립을 지켰어요.','방파인 궁전은 라마 4세와 라마 5세 때 다시 가꿔져 왕들이 쉬러 오던 곳으로 쓰였어요.','한국은 1876년 강화도 조약으로 문을 열고, 1897년 대한제국을 세웠어요. 하지만 1905년 을사늑약으로 외교권을 빼앗기고 1910년 일본에 나라를 빼앗겼어요. 같은 시기 태국은 독립을 지켰다는 점이 달랐어요.'],
    ['1893년','프랑스와의 위기','1893년 7월 13일 프랑스 군함이 허락 없이 짜오프라야강을 거슬러 방콕으로 오자, 파크남 요새가 포를 쐈어요. 결국 그해 10월 3일 조약으로 메콩강 동쪽 땅(지금의 라오스 대부분)을 프랑스에 넘겼어요. 태국은 땅 일부를 내주고 독립을 지켰어요.','','1894년 조선에서는 동학농민운동이 일어났고, 이를 계기로 갑오개혁이 이어졌어요.'],
    ['1893~1896년','태국의 첫 철도','1893년 방콕에서 파크남(사뭇쁘라깐)까지 가는 태국 최초의 철도가 개통됐어요. 민간 회사가 만든 노선이에요. 1896년 3월에는 방콕~아유타야를 잇는 국가 철도가 열렸어요. 라마 5세는 1890년에 철도를 맡는 관청을 세웠어요.','','한국 최초의 철도 경인선(노량진~인천 구간)은 1899년 9월 18일 개통됐어요.'],
    ['1917년','제1차 세계대전에 참전','1917년 7월 22일 라마 6세가 독일과 오스트리아-헝가리에 전쟁을 선포했어요. 1918년 유럽에 작은 원정군을 보냈고, 1919년 7월 파리 승전 행진에도 참가했어요. 동남아시아 독립국 가운데 유럽 전선에 군대를 보낸 유일한 나라로 알려져 있어요.','','한국은 일제강점기였어요. 2년 뒤인 1919년 3월 1일 3·1운동이 일어났고, 4월 11일 상하이에서 대한민국 임시정부가 세워졌어요.'],
    ['1932년','입헌혁명','1932년 6월 24일 군인과 관리들이 피를 흘리지 않고 혁명을 일으켜, 왕이 모든 걸 정하던 절대 왕정을 끝냈어요. 헌법이 생기고 국민의 대표가 나라 일에 참여하는 입헌군주제가 됐어요.','','한국은 일제강점기였어요. 1932년에는 이봉창(1월 8일 도쿄)과 윤봉길(4월 29일 상하이) 의사의 의거가 있었어요.'],
    ['1939년','나라 이름이 바뀌었어요','1939년 6월 24일 총리 피분이 나라 이름을 "시암"에서 "타이"로 바꾼다고 발표했어요. 2차 대전이 끝난 뒤 한때 시암으로 돌아갔다가, 1949년에 다시 "타이"가 됐어요. "타이"는 "자유"라는 뜻으로 풀이되기도 해요. 우리가 쓰는 "태국"은 "타이"를 한자(泰國)로 옮긴 이름이에요.','','한국은 일제강점기였어요. 1938년 학교에서 우리말(조선어) 교육이 줄어들었고, 1940년 2월부터 이름을 일본식으로 바꾸게 하는 창씨개명이 강요됐어요.'],
    ['1941~1945년','제2차 세계대전','1941년 12월 8일 일본군이 태국에 들어왔어요. 태국 정부는 싸움을 멈추고 일본과 손을 잡았고(12월 21일 동맹), 1942년 1월 영국과 미국에 선전포고를 했어요. 그런데 미국 주재 태국 대사 세니 쁘라못이 이 문서를 전달하지 않아서 미국은 태국과 전쟁을 선포하지 않았어요. 한편 "자유타이" 운동이 일본에 몰래 맞서 싸웠어요.','','한국은 1945년 8월 15일 광복을 맞았어요.'],
    ['1946~2016년','푸미폰 국왕 (라마 9세)','1946년 6월 9일 형 아난다 마히돈(라마 8세)이 세상을 떠나 푸미폰이 왕이 됐어요. 정식 즉위식(대관식)은 1950년 5월 5일에 열렸어요. 2016년 10월 13일 세상을 떠날 때까지 70년 126일 동안 왕 자리에 있었고, 그때 세계에서 가장 오래 왕위에 있던 왕이었어요.','','1945년 9월부터 3년 동안 남한은 미군정 시기였어요. 1948년 8월 15일 대한민국 정부가 세워졌어요.'],
    ['1950~1953년','한국전쟁과 태국','1950년 7월 태국은 아시아 나라 가운데 가장 먼저 한국을 돕겠다고 나섰어요. 그해 11월 부산에 첫 부대가 도착했고, 포크찹 고지 같은 곳에서 싸워 "꼬마 호랑이(Little Tigers)"라는 별명을 얻었어요. 군대뿐 아니라 식량도 도왔어요.','','1950년 6월 25일 전쟁이 터졌고, 1953년 7월 27일 정전협정을 맺었어요.'],
    ['1958년','한국과 태국의 수교','1958년 10월 1일 한국과 태국이 정식으로 외교 관계를 맺었어요. 전쟁에서 맺은 인연이 이어진 거예요.','','이승만 대통령 때(1948~1960년)예요.'],
    ['1959~1976년','파타야가 커졌어요','파타야는 원래 작은 어촌이었어요. 1959년쯤 미군 병사들이 휴가를 보내러 오면서 알려졌고, 베트남 전쟁 때 미군이 많아지자 호텔과 식당이 늘었어요. 1976년 미군이 떠난 뒤에는 관광객을 맞는 도시로 바뀌었어요. 태국도 1967년 군대(퀸즈 코브라 부대)를 베트남에 보냈어요.','12/16~26에 머무는 파타야가 바로 이곳이에요.','한국도 1964년 9월부터 1973년 3월까지 베트남에 군대를 보냈어요(약 32만 명이 참전).'],
    ['1997년','바트 위기','1997년 7월 2일 태국이 바트화의 값을 시장에 맡기자 바트 값이 크게 떨어졌어요. 이 위기가 인도네시아, 한국 등 아시아 여러 나라로 번졌어요.','12/16에 환전할 때 보는 "바트"가 이 돈이에요.','한국은 그해 11월 21일 IMF에 구제금융을 신청했어요. 우리가 "IMF 외환위기"라고 부르는 일이에요.'],
    ['2016~2019년','지금의 왕','2016년 10월 13일 푸미폰 왕이 세상을 떠나자 아들 와치랄롱꼰이 왕(라마 10세)이 됐어요. 2019년 5월 4~6일 사흘 동안 즉위식(대관식)을 열었어요. 이 왕조의 10번째 왕이에요.','','2019년은 3·1운동과 대한민국 임시정부 수립 100주년이었어요.'],
  ];
  // [장소, 설명, 알아두면 좋은 점]
  const SIGHTS = [
    ['왕궁','1782년 5월 라마 1세가 방콕을 수도로 정하면서 짓기 시작한 궁전이에요. 옛날에는 왕이 살면서 나랏일을 하던 곳이었고, 지금은 나라의 큰 행사를 하는 곳으로 알려져 있어요. 안에 "에메랄드 불상"을 모신 왓 프라깨우가 있어요. 이 불상은 1779년 라오스의 비엔티안에서 가져와 톤부리의 왓 아룬에 모셨다가, 1784~1785년에 이곳으로 옮겼어요(자료에 따라 1784년 또는 1785년).','어깨와 무릎을 가리는 옷을 입어야 해요.'],
    ['왓 포','방콕이 수도가 되기 전부터 있던 오래된 절이에요. 16세기부터 있었다고 하고, 1788년 라마 1세가 다시 지었어요. 라마 3세 때(1832년부터 약 16년) 크게 고쳐지면서 지금 모습이 됐어요. 길이 약 46m, 높이 약 15m의 누워 있는 부처님(와불)이 유명해요. 태국 전통 마사지의 본고장으로 알려져 있어요.','와불은 꼭 보고 오세요. 마사지를 받아볼 수도 있어요.'],
    ['왓 아룬','"새벽의 절"이라는 뜻이에요. 탁신 왕이 톤부리를 수도로 삼은 뒤 이 절을 "왓 채앙"이라 부르며 가까이 두었고, 에메랄드 불상도 한동안 이곳에 모셨어요. 강가에 높이 솟은 탑(프랑)은 라마 2세 때 짓기 시작해 라마 3세 때 완성됐어요. 높이는 80m가 넘는다고 알려져 있어요(자료마다 달라요).','왓 포에서 나룻배를 타고 강을 건너 갈 수 있어요. 해 질 무렵이 예뻐요.'],
    ['아유타야와 방파인 궁전','아유타야는 400년 동안 수도였던 옛 도시예요. 지금은 무너진 절터와 불상이 남아 있고, 1991년 유네스코 세계유산이 됐어요. 방파인 궁전은 17세기 아유타야 시대에 처음 지어졌고, 라마 4세와 라마 5세 때 다시 가꿔져 왕들이 쉬러 오던 곳이에요. 방콕에서 북쪽으로 60km쯤 떨어져 있어요.','로열 방파인 골프클럽이 같은 지역에 있어요.'],
    ['에라완 사당','1956년 11월 9일 모신 사당이에요. 이 자리에 에라완 호텔을 지을 때 사고와 어려움이 자꾸 생기자 나쁜 일을 막으려고 힌두교의 신 브라흐마(태국 말로 "프라 프롬")를 모셨다고 전해져요. 이 이야기는 전설이라 사실 여부를 확인하기는 어려워요.','지금도 소원을 빌러 오는 사람이 많아요.'],
    ['룸피니 공원','1925년 라마 6세가 자기 땅을 내놓아 만든 방콕 최초의 공원으로 알려져 있어요. 이름은 부처님이 태어난 곳인 "룸비니"에서 따왔어요. 라마 6세는 공원이 다 만들어지기 전인 1925년 11월에 세상을 떠났어요.','아침저녁으로 운동하는 현지 사람이 많아요.'],
  ];
  // 예절 항목 중 "여행 안내서 기준"은 법이 아니라 여행 안내서들이 공통으로 알려 주는 문화예요.
  const BASICS = [
    ['불기(佛紀) 달력','태국은 부처님이 돌아가신 해를 기준으로 연도를 세요. 이것을 "불기"라고 해요. 서기 연도에 543을 더하면 돼요. 새해가 1월 1일에 시작되도록 정한 것은 1941년부터예요. 2026년은 불기 2569년이고, 2027년은 2570년이에요.','영수증이나 간판에 2569가 보이면 올해예요.'],
    ['한국과 2시간 차이','태국은 한국보다 2시간 느려요. 한국이 낮 12시면 태국은 오전 10시예요. 서머타임도 없어요.'],
    ['세 가지 색 국기','지금의 삼색기는 1917년 라마 6세 때 정해졌고, 그전에는 빨간 바탕에 흰 코끼리가 그려진 깃발을 썼어요. 보통 빨강은 나라, 흰색은 종교(불교), 파랑은 왕실을 뜻한다고 설명해요. 이 뜻은 공식 해석이 아니라 흔히 하는 설명이에요.'],
    ['방콕의 진짜 이름','태국 사람들은 방콕을 "끄룽텝"이라고 불러요. "천사의 도시"라는 뜻이에요. 라마 1세가 1782년 지어 준 정식 이름은 영어 알파벳으로 168글자나 돼서, 기네스북에 세계에서 가장 긴 지명으로 올라 있어요.'],
    ['왕실에 대한 예절','태국 사람들은 왕과 왕실을 매우 존경해요. 형법 112조는 왕, 왕비, 왕위 계승자, 섭정을 모욕하거나 헐뜯으면 한 건에 3년에서 15년의 징역까지 받을 수 있다고 정하고 있어요. 왕실에 대해 농담도 조심하세요.'],
    ['스님을 만났을 때 (여행 안내서 기준)','스님은 이성의 몸에 닿지 않도록 정해져 있어서, 여성은 스님께 물건을 직접 건네지 않아요. 앞에 놓아 드리거나 남성을 통해 전해요. 남성은 두 손으로 직접 드려도 돼요.'],
    ['머리와 발 (여행 안내서 기준)','태국에서는 머리를 가장 높고 신성한 부분으로, 발을 가장 낮은 부분으로 여겨요. 아이 머리라도 장난으로 쓰다듬지 마세요. 돈에는 왕의 얼굴이 있으니 발로 밟지 마세요.'],
    ['국가가 나올 때 (여행 안내서 기준)','공원이나 역 같은 공공장소에서 오전 8시와 오후 6시에 국가가 흘러나오면, 걸음을 멈추고 서 있는 것이 예의라고 안내해요.'],
  ];
  const TABS = [['time','📜 연표'],['sight','🛕 여행지'],['basic','📘 알아두기'],['quiz','🎮 퀴즈']];
  let mode = 'time';

  // ── 역사 퀴즈: 위 연표·여행지·알아두기에 적힌 내용에서만 문제를 내요 (새 사실을 더하지 않아요) ──
  // [문제, 정답, [오답 3개], 풀이]
  const QUIZ = [
    ['방콕에서 강 건너 서쪽 동네 "톤부리"에서 왕이 된 사람은 누구일까요?','탁신 왕',['라마 1세','나레수안 대왕','람캄행 대왕'],'탁신 장군이 버마군을 몰아내고 1767년 12월 28일 톤부리에서 왕이 됐어요.'],
    ['방콕이 태국의 수도가 된 해는 언제일까요?','1782년',['1767년','1893년','1932년'],'라마 1세가 1782년 짜끄리 왕조를 열고 수도를 방콕으로 옮겼어요.'],
    ['아유타야는 약 몇 년 동안 수도였을까요?','약 400년',['약 40년','약 100년','약 1,000년'],'1351년부터 1767년까지 약 400년 이어졌어요.'],
    ['"왓 아룬"은 무슨 뜻일까요?','새벽의 절',['황금의 절','코끼리의 절','바다의 절'],'"새벽의 절"이라는 뜻이에요. 해 질 무렵에도 예뻐요.'],
    ['왓 포에 있는 누워 있는 부처님(와불)은 길이가 얼마쯤일까요?','약 46m',['약 4.6m','약 14m','약 146m'],'길이 약 46m, 높이 약 15m예요.'],
    ['서기 2026년은 태국 달력(불기)으로 몇 년일까요?','2569년',['2026년','2483년','2543년'],'서기 연도에 543을 더하면 돼요. 2026 + 543 = 2569.'],
    ['한국이 낮 12시일 때 태국은 몇 시일까요?','오전 10시',['오전 9시','오후 1시','오후 2시'],'태국은 한국보다 2시간 느려요. 서머타임도 없어요.'],
    ['방콕을 태국 사람들은 "끄룽텝"이라고 불러요. 무슨 뜻일까요?','천사의 도시',['황금의 도시','물의 도시','왕의 도시'],'"천사의 도시"라는 뜻이에요. 정식 이름은 영어 알파벳으로 168글자나 돼요.'],
    ['1932년 태국에서 일어난 일은 무엇일까요?','피를 흘리지 않은 혁명으로 절대 왕정이 끝났어요',['버마가 아유타야를 무너뜨렸어요','프랑스 군함이 방콕에 왔어요','일본군이 들어왔어요'],'입헌혁명이에요. 헌법이 생기고 입헌군주제가 됐어요.'],
    ['에라완 사당에 모신 신은 누구일까요?','브라흐마(프라 프롬)',['제우스','부처님','가네샤 신의 어머니'],'호텔을 지을 때 어려움이 생기자 나쁜 일을 막으려고 브라흐마를 모셨다고 전해져요.'],
    ['방콕 룸피니 공원의 이름은 어디에서 따왔을까요?','부처님이 태어난 곳 "룸비니"',['라마 6세의 이름','방콕의 옛 이름','공원 근처 강 이름'],'1925년 라마 6세가 자기 땅을 내놓아 만든 방콕 최초의 공원이에요.'],
    ['라마 5세(출라롱꼰 대왕)는 몇 살에 왕이 됐을까요?','15살',['5살','25살','40살'],'1853년에 태어나 1868년에 왕이 됐어요. 처음 5년은 섭정이 나랏일을 맡았어요.'],
    ['푸미폰 국왕(라마 9세)은 왕 자리에 얼마나 있었을까요?','70년 넘게',['7년','약 20년','약 40년'],'1946년부터 2016년까지 70년 126일이에요. 그때 세계에서 가장 오래 왕위에 있던 왕이었어요.'],
    ['지금의 삼색기가 정해지기 전, 태국 깃발에는 무엇이 그려져 있었을까요?','흰 코끼리',['사자','용','연꽃'],'1917년 라마 6세 때 삼색기로 바뀌었어요. 그전엔 빨간 바탕에 흰 코끼리였어요.'],
    ['나라 이름을 "시암"에서 "타이"로 바꾼다고 발표한 해는 언제일까요?','1939년',['1782년','1917년','1997년'],'1939년 6월 24일 총리 피분이 발표했어요. 1949년에 다시 "타이"가 됐어요.'],
    ['지금의 왕은 짜끄리 왕조의 몇 번째 왕일까요?','10번째',['1번째','5번째','9번째'],'2016년 와치랄롱꼰이 라마 10세가 됐어요.'],
    ['왕궁의 "에메랄드 불상"은 어느 나라에서 가져왔을까요?','라오스',['캄보디아','미얀마','중국'],'1779년 라오스의 비엔티안에서 가져와 톤부리 왓 아룬에 모셨다가, 나중에 왕궁으로 옮겼어요.'],
    ['한국전쟁 때 싸운 태국 군대의 별명은 무엇일까요?','꼬마 호랑이',['붉은 코끼리','하늘 독수리','검은 사자'],'포크찹 고지 같은 곳에서 싸워 "꼬마 호랑이(Little Tigers)"라는 별명을 얻었어요.'],
    ['1997년 태국에서 시작해 한국 등 아시아로 번진 일은 무엇일까요?','바트 위기(외환위기)',['대홍수','독립 전쟁','철도 개통'],'1997년 7월 2일 바트 값이 크게 떨어졌고, 한국은 11월에 IMF에 구제금융을 신청했어요.'],
    ['파타야는 원래 어떤 곳이었을까요?','작은 어촌',['왕이 사는 도시','큰 항구 도시','산속 마을'],'1959년쯤 미군 병사들이 휴가를 오면서 알려지고 점점 커졌어요.'],
  ];
  const LSQ = 'thai2026_hsquiz'; let qBest = 0; try{ qBest = +localStorage.getItem(LSQ) || 0; }catch(e){}
  const QN = 6;
  const cel = o => { if(typeof window.__celebrate === 'function') window.__celebrate(o); };
  // 맞힌 문제가 쌓이면 칭호가 올라가요 (이름은 이번 여행 장소에서 따온 놀이용 이름이에요)
  const LSN = 'thai2026_hsquiz_n'; let qTotal = 0; try{ qTotal = +localStorage.getItem(LSN) || 0; }catch(e){}
  const RANKS = [[0,'여행 새내기'],[5,'카오산 길잡이'],[15,'왓 포 해설사'],[30,'아유타야 탐험가'],[50,'짜끄리 왕조 박사']];
  const rankOf = n => RANKS.reduce((a, r, k) => n >= r[0] ? k : a, 0);
  const rankLine = () => { const i = rankOf(qTotal), nx = RANKS[i + 1]; return `🏅 ${RANKS[i][1]} · 맞힌 문제 ${qTotal}개${nx ? ` · 다음 칭호까지 ${nx[0] - qTotal}개` : ' · 가장 높은 칭호예요'}`; };
  function addCorrect(){ const b = rankOf(qTotal); qTotal++; try{ localStorage.setItem(LSN, String(qTotal)); }catch(e){} return rankOf(qTotal) > b; }
  // 여행지 "읽었어요" 표시
  const LSR = 'thai2026_hsread'; let rd; try{ rd = JSON.parse(localStorage.getItem(LSR)); }catch(e){} rd = Array.isArray(rd) ? rd.filter(t => SIGHTS.some(s => s[0] === t)) : [];
  const readBtn = t => `<button class="hs-read" type="button" data-read="${esc(t)}" aria-pressed="${rd.includes(t)}">${rd.includes(t) ? '✅ 읽었어요' : '📖 읽었어요 표시하기'}</button>`;
  const readLine = () => `읽은 여행지 ${rd.length} / ${SIGHTS.length}`;
  const LSD = 'thai2026_hsdaily'; let dq; try{ dq = JSON.parse(localStorage.getItem(LSD)); }catch(e){} if(!dq || typeof dq !== 'object') dq = {};
  const dayNo = () => { const k = new Date(Date.now() + 9 * 36e5); return Math.floor(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()) / 864e5); };
  const dDone = () => dq.last === dayNo();
  const dStreak = () => (dq.last === dayNo() || dq.last === dayNo() - 1) ? (dq.streak || 0) : 0;
  function dRecord(ok){
    const d = dayNo(); if(dq.last === d) return;
    dq = { last: d, ok, streak: dq.last === d - 1 ? (dq.streak || 0) + 1 : 1 };
    try{ localStorage.setItem(LSD, JSON.stringify(dq)); }catch(e){}
    if(typeof window.__dqRefresh === 'function') window.__dqRefresh();
  }
  const dailyRound = () => { const [q, a, w, why] = QUIZ[dayNo() % QUIZ.length]; return [{ q, opts: shuffle([a, ...w]), a, why }]; };
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const yearOf = r => { const m = /^(\d{4})/.exec(r[0]); return m ? +m[1] : 0; };
  // 연표에서 "둘 중 먼저 일어난 일은?" 문제를 만들어요 (30년 넘게 벌어진 두 항목)
  function orderQs(n){
    const d = TIMELINE.filter(yearOf), out = [], used = new Set();
    for(let t = 0; t < 200 && out.length < n; t++){
      const a = d[Math.floor(Math.random() * d.length)], b = d[Math.floor(Math.random() * d.length)];
      if(a === b || used.has(a) || used.has(b) || Math.abs(yearOf(a) - yearOf(b)) < 30) continue;
      used.add(a); used.add(b);
      const [e, l] = yearOf(a) < yearOf(b) ? [a, b] : [b, a];
      out.push({ q: '둘 중 먼저 일어난 일은 무엇일까요?', opts: shuffle([e[1], l[1]]), a: e[1],
        why: `"${e[1]}"(${e[0]})이 "${l[1]}"(${l[0]})보다 먼저예요.` });
    }
    return out;
  }
  const makeRound = () => shuffle(shuffle(QUIZ).slice(0, QN - 2).map(([q, a, w, why]) => ({ q, opts: shuffle([a, ...w]), a, why })).concat(orderQs(2)));
  let qz = null;
  function startDaily(){ qz = { qs: dailyRound(), i: 0, score: 0, picked: null, daily: true }; haptic('tap'); paintQuiz(); const f = body.querySelector('.hq-opt'); if(f) f.focus({preventScroll:true}); }
  const qMsg = s => s === QN ? '모두 맞혔어요! 태국 역사 박사예요' : s >= QN - 2 ? '대단해요! 거의 다 맞혔어요' : s >= 3 ? '좋아요! 연표를 읽고 다시 도전해 보세요' : '연표를 한 번 읽고 다시 도전해 봐요';
  function paintQuiz(){
    if(!qz){
      const done = dDone(), st = dStreak();
      body.innerHTML = `<div class="hq"><h3 class="hq-q">태국 역사 퀴즈</h3><p class="hs-b">연표와 여행지 이야기에서 문제를 내요. 풀고 나면 왜 그런지 바로 알려 줘요.</p><p class="hq-rank">${rankLine()}</p>` +
        (done ? `<p class="hq-day">🎯 오늘의 한 문제를 ${dq.ok ? '맞혔어요' : '풀었어요'}${st > 1 ? ` · 연속 ${st}일` : ''}. 내일 새 문제가 나와요.</p>` : `<button class="hq-go" type="button" data-act="daily">🎯 오늘의 한 문제${st ? ` · 연속 ${st}일 이어가기` : ''}</button>`) +
        `${qBest ? `<p class="hq-best">6문제 최고 기록 ${qBest}/${QN}</p>` : ''}<button class="${done ? 'hq-go' : 'hq-alt'}" type="button" data-act="start">${QN}문제 퀴즈 시작하기</button></div>`;
    } else if(qz.i >= qz.qs.length && qz.daily){
      const st = dStreak();
      body.innerHTML = `<div class="hq"><h3 class="hq-q">${qz.score ? '오늘의 한 문제, 정답이에요!' : '오늘의 한 문제를 풀었어요'}</h3><p class="hs-b">${st > 1 ? `연속 ${st}일째예요. ` : ''}내일 새 문제가 나와요.</p><p class="hq-rank">${rankLine()}</p><button class="hq-go" type="button" data-act="start">${QN}문제 퀴즈 하기</button><button class="hq-alt" type="button" data-act="share">💬 단톡에 자랑하기</button><button class="hq-alt" type="button" data-act="read">연표 보러 가기</button></div>`;
    } else if(qz.i >= qz.qs.length){
      const nb = qz.score > qBest;
      body.innerHTML = `<div class="hq"><h3 class="hq-q">${qz.score} / ${QN} 맞혔어요</h3><p class="hs-b">${qMsg(qz.score)}</p><p class="hq-best">${nb ? '새 최고 기록이에요!' : `내 최고 기록 ${qBest}/${QN}`}</p><p class="hq-rank">${rankLine()}</p><button class="hq-go" type="button" data-act="start">다시 하기</button><button class="hq-alt" type="button" data-act="share">💬 단톡에 자랑하기</button><button class="hq-alt" type="button" data-act="read">연표 보러 가기</button></div>`;
    } else {
      const c = qz.qs[qz.i], pk = qz.picked;
      body.innerHTML = `<div class="hq"><p class="hq-prog">${qz.daily ? '🎯 오늘의 한 문제' : `${qz.i + 1} / ${QN} · 맞힌 개수 ${qz.score}`}</p><h3 class="hq-q">${esc(c.q)}</h3><div class="hq-opts">${c.opts.map((o, k) =>
        `<button class="hq-opt${pk == null ? '' : o === c.a ? ' ok' : k === pk ? ' no' : ''}" type="button" data-k="${k}"${pk == null ? '' : ' aria-disabled="true"'}>${pk != null && o === c.a ? '<b aria-hidden="true">✓ </b><span class="vh">정답: </span>' : pk === k ? '<b aria-hidden="true">✕ </b><span class="vh">틀림: </span>' : ''}${esc(o)}</button>`).join('')}</div>` +
        `<div role="status">${pk == null ? '' : `<p class="hq-why"><b>${c.opts[pk] === c.a ? '정답이에요!' : '아쉬워요.'}</b> ${esc(c.why)}</p><button class="hq-go" type="button" data-act="next">${qz.i + 1 === qz.qs.length ? (qz.daily ? '끝내기' : '결과 보기') : '다음 문제'}</button>`}</div></div>`;
      if(pk != null){ const g = body.querySelector('[data-act="next"]'); if(g) g.focus({preventScroll:false}); }
    }
    body.scrollTop = 0; syncTabs();
  }
  function jump(t){
    const li = [...body.querySelectorAll('.hs-item')].find(x => x.dataset.t === t); if(!li) return;
    li.classList.add('hs-hit'); li.scrollIntoView({ block: 'start' }); li.focus({ preventScroll: true });
  }
  body.addEventListener('click', e => {
    const lk = e.target.closest('.hs-link');
    if(lk && body.contains(lk)){ mode = lk.dataset.go; haptic('tap'); paint(); jump(lk.dataset.t); return; }
    const rb = e.target.closest('.hs-read');
    if(rb && body.contains(rb)){
      const t = rb.dataset.read, was = rd.length;
      rd = rd.includes(t) ? rd.filter(x => x !== t) : rd.concat(t);
      try{ localStorage.setItem(LSR, JSON.stringify(rd)); }catch(err){}
      rb.setAttribute('aria-pressed', String(rd.includes(t))); rb.textContent = rd.includes(t) ? '✅ 읽었어요' : '📖 읽었어요 표시하기';
      const pg = body.querySelector('.hs-prog'); if(pg) pg.textContent = readLine();
      haptic('tap'); if(typeof window.__dqRefresh === 'function') window.__dqRefresh();
      if(rd.length === SIGHTS.length && was < rd.length) cel({ kicker: '🛕 다 읽었어요', msg: `여행지 ${SIGHTS.length}곳을 모두 읽었어요. 가면 더 재미있어요!`, petals: true, n: 22, spread: 110, ms: 3600 });
      return;
    }
    if(mode !== 'quiz') return;
    const b = e.target.closest('button'); if(!b || !body.contains(b)) return;
    if(b.dataset.act === 'start'){ qz = { qs: makeRound(), i: 0, score: 0, picked: null }; haptic('tap'); paintQuiz(); const f = body.querySelector('.hq-opt'); if(f) f.focus({preventScroll:true}); return; }
    if(b.dataset.act === 'daily'){ startDaily(); return; }
    if(b.dataset.act === 'share'){
      const st = dStreak(), txt = qz && qz.daily ? `오늘의 태국 역사 한 문제 ${qz.score ? '정답!' : '도전!'}${st > 1 ? ` 연속 ${st}일째` : ''} 🇹🇭\n${RANKS[rankOf(qTotal)][1]} · 맞힌 문제 ${qTotal}개`
        : `태국 역사 퀴즈 ${qz ? qz.score : 0}/${QN} 🇹🇭\n${RANKS[rankOf(qTotal)][1]} · 맞힌 문제 ${qTotal}개\n2026 태국 가족여행 앱에서 풀었어요`;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { b.textContent = '✅ 복사했어요. 단톡에 붙여넣으세요'; haptic('ok'); }, () => { b.textContent = '⚠️ 복사하지 못했어요'; });
      return;
    }
    if(b.dataset.act === 'read'){ mode = 'time'; haptic('tap'); paint(); return; }
    if(b.dataset.act === 'next'){
      qz.i++; qz.picked = null; haptic('tap');
      if(qz.i >= qz.qs.length && !qz.daily && qz.score === QN) cel({ kicker: '🎉 만점', msg: '6문제를 모두 맞혔어요!', petals: true, n: 30, spread: 130, ms: 3600 });
      if(qz.i >= qz.qs.length && !qz.daily && qz.score > qBest){ qBest = qz.score; try{ localStorage.setItem(LSQ, String(qBest)); }catch(err){} haptic('ok'); }
      paintQuiz(); const f = body.querySelector('.hq-opt, .hq-go'); if(f) f.focus({preventScroll:true}); return;
    }
    if(b.dataset.k != null && qz && qz.picked == null){
      const c = qz.qs[qz.i]; qz.picked = +b.dataset.k;
      if(c.opts[qz.picked] === c.a){
        qz.score++; haptic('ok');
        if(addCorrect()) cel({ kicker: '🏅 새 칭호', msg: RANKS[rankOf(qTotal)][1], petals: true, n: 26, spread: 110, ms: 3600 });
        else if(qz.daily && !dDone()) cel({ n: 10, spread: 70, petals: true, at: b, dy: 6 });
      } else haptic('tap');
      if(qz.daily) dRecord(c.opts[qz.picked] === c.a);
      paintQuiz();
    }
  });
  // 여행지 ↔ 연표 연결 (제목이 같아야 해요)
  const SIGHT_TL = {
    '왕궁': ['방콕 시대의 시작'], '왓 포': ['방콕 시대의 시작'], '왓 아룬': ['탁신 왕과 톤부리'],
    '아유타야와 방파인 궁전': ['아유타야 왕국', '아유타야가 무너졌어요', '라마 5세 (출라롱꼰 대왕)'],
  };
  const tlYear = t => { const r = TIMELINE.find(x => x[1] === t); return r ? r[0] : ''; };
  const links = t => {
    const tl = SIGHT_TL[t], sp = Object.keys(SIGHT_TL).filter(k => SIGHT_TL[k].includes(t));
    const c = (go, name, label) => `<button class="hs-link" type="button" data-go="${go}" data-t="${esc(name)}">${label}</button>`;
    return (tl ? tl.map(n => c('time', n, `📜 연표에서 보기: ${esc(n)} (${esc(tlYear(n))})`)) : sp.map(n => c('sight', n, `🛕 여행지에서 보기: ${esc(n)}`))).join('');
  };
  const item = (top, t, b, extra, label, kr) => `<li class="hs-item" data-t="${esc(t)}" tabindex="-1">${top ? `<p class="hs-year">${esc(top)}</p>` : ''}<h3 class="hs-t">${esc(t)}</h3><p class="hs-b">${esc(b)}</p>${kr ? `<p class="hs-kr"><b>🇰🇷 같은 때 우리나라</b> ${esc(kr)}</p>` : ''}${extra ? `<p class="hs-trip"><b>${label}</b> ${esc(extra)}</p>` : ''}${links(t) ? `<p class="hs-links">${links(t)}</p>` : ''}</li>`;
  function paint(){
    tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === mode)));
    if(mode === 'quiz'){ paintQuiz(); return; }
    let rows = '';
    if(mode === 'time') rows = TIMELINE.map(r => item(r[0], r[1], r[2], r[3], '🧳 이번 여행', r[4])).join('');
    else if(mode === 'sight') rows = SIGHTS.map(r => item('', r[0], r[1], r[2], '💡').replace(/<\/li>$/, readBtn(r[0]) + '</li>')).join('');
    else rows = BASICS.map(r => item('', r[0], r[1], r[2], '💡')).join('');
    body.innerHTML = `${mode === 'sight' ? `<p class="hs-prog">${readLine()}</p>` : ''}<ol class="hs-list">${rows}</ol><p class="hs-src">한국민족문화대백과사전, 우리역사넷, 위키백과, 브리태니커 같은 자료를 맞춰 보고 쉽게 풀어 쓴 거예요. 자료마다 다른 부분은 "전해져요", "알려져 있어요", "자료마다 달라요"로 적었어요.</p>`;
    body.scrollTop = 0; syncTabs();
  }
  tabsEl.innerHTML = TABS.map(([id, l]) => `<button class="wh-tab" role="tab" type="button" data-id="${id}" aria-selected="${id === mode}">${l}</button>`).join('');
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(!b) return; mode = b.dataset.id; haptic('tap'); paint(); });
  window.__historyInfo = () => ({ time: TIMELINE.length, sights: SIGHTS.length, basics: BASICS.length, quiz: QUIZ.length });
  let prevFocus = null;
  function open(m, t){
    prevFocus = document.activeElement;
    if(typeof m === 'string' && TABS.some(x => x[0] === m)) mode = m;
    if(mode === 'quiz' && t === 'daily' && !dDone()) qz = { qs: dailyRound(), i: 0, score: 0, picked: null, daily: true };
    paint();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ tabsEl.querySelector('[aria-selected="true"]').focus({preventScroll:true}); }catch(e){}
    if(t && mode !== 'quiz') jump(t);
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openHistory = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, #hsBody, #hsClose')].filter(x => x.tabIndex >= 0);
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 태국 먹킷리스트: 먹어본 음식·음료를 체크하며 20가지 채우기 (이 기기에만 저장) ──
(function(){
  const scrim = $('eatsScrim'); if(!scrim) return;
  const listEl = $('etList'), fillEl = $('etFill'), cntEl = $('etCnt'), pickBtn = $('etPick'), copyBtn = $('etCopy'), closeBtn = $('etClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ITEMS = [...FOODS, ['태국 밀크티 (차옌)','주황빛 차에 연유·얼음 — 더위 식히는 국민 음료'], ['코코넛 워터','야자 열매째 마시는 시원한 수분 보충'], ['망고 스무디','제철 망고를 갈아 만든 달콤한 한 잔'],
    ['싱하 맥주','1934년 첫 출시된 태국 최초의 맥주'], ['창 맥주','코끼리 로고, 가볍고 부드러운 맛'], ['레오 맥주','표범 로고, 가볍고 부담 없는 맛']];
  const LSE = 'thai2026_eats'; let got; try{ got = JSON.parse(localStorage.getItem(LSE)); }catch(e){} got = new Set(Array.isArray(got) ? got.filter(n => ITEMS.some(i => i[0] === n)) : []);
  const save = () => { try{ localStorage.setItem(LSE, JSON.stringify([...got])); }catch(e){} };
  const toast = (a, b, ms) => { if(typeof window.__toast === 'function') window.__toast(a, b, ms || 2200); };
  let pickName = null;
  function paint(){
    listEl.innerHTML = ITEMS.map(([n,d]) => `<li><button class="et-item${n === pickName ? ' pick' : ''}" type="button" data-n="${esc(n)}" aria-pressed="${got.has(n)}"><span class="ck" aria-hidden="true">✓</span><span class="nm">${esc(n)}</span><span class="ds">${esc(d)}</span></button></li>`).join('');
    const pct = Math.round(got.size / ITEMS.length * 100); fillEl.style.transform = `scaleX(${pct/100})`; cntEl.textContent = `${got.size}/${ITEMS.length}`;
  }
  listEl.addEventListener('click', e => {
    const b = e.target.closest('.et-item'); if(!b) return; const n = b.dataset.n, was = got.has(n);
    if(was) got.delete(n); else got.add(n); pickName = null; save(); haptic(was ? 'tap' : 'ok'); paint();
    const again = listEl.querySelector(`.et-item[data-n="${n.replace(/"/g,'\\"')}"]`); if(again) try{ again.focus({preventScroll:true}); }catch(err){}
    if(!was){
      const k = got.size, T = ITEMS.length;
      if(k === T){ if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🍜 먹킷리스트', msg:`${T}가지 모두 먹어봤어요! 태국 미식가 인정 🎉`, ms:4200, at:fillEl, dy:0, n:34, spread:120, petals:true }); else toast('🍜 완주!', '20가지 모두 먹어봤어요', 3200); }
      else if(k % 5 === 0) toast('🍜 먹킷리스트', `${k}/${T} — ${k === 5 ? '맛보기 시작!' : k === 10 ? '절반 달성!' : '거의 다 왔어요!'}`);
    }
  });
  pickBtn.addEventListener('click', () => {
    const left = ITEMS.filter(i => !got.has(i[0]));
    if(!left.length){ toast('🍜 먹킷리스트', '이미 전부 먹어봤어요!'); return; }
    pickName = left[(Math.random()*left.length)|0][0]; haptic('ok'); paint(); toast('🎲 오늘은 이거!', pickName);
    const el = listEl.querySelector('.et-item.pick'); if(el) el.scrollIntoView({block:'center', behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
  });
  copyBtn.addEventListener('click', async () => {
    const o = copyBtn.textContent;
    const txt = `🍜 태국 먹킷리스트 ${got.size}/${ITEMS.length}\n` + ITEMS.map(i => `${got.has(i[0]) ? '✅' : '⬜'} ${i[0]}`).join('\n');
    try{ await navigator.clipboard.writeText(txt); copyBtn.textContent = '✅ 복사했어요'; }catch(e){ copyBtn.textContent = '⚠️ 복사 실패'; }
    haptic('ok'); setTimeout(() => { copyBtn.textContent = o; }, 1800);
  });
  window.__eatsInfo = () => ({ done: got.size, total: ITEMS.length });
  let prevFocus = null;
  function open(){
    prevFocus = document.activeElement; pickName = null; paint();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ pickBtn.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openEats = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('#etPick, .et-item, #etCopy, #etClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 라운드 기록장: 라운드별 스코어·버디·이글·홀인원 기록 + 트립 리더보드 (이 기기에만 저장) ──
(function(){
  const scrim = $('scoreScrim'); if(!scrim) return;
  const tabsEl = $('scTabs'), pane = $('scPane'), copyBtn = $('scCopy'), closeBtn = $('scClose');
  const LSS = 'thai2026_scores';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let data; try{ data = JSON.parse(localStorage.getItem(LSS)); }catch(e){} if(!data || typeof data !== 'object') data = {};
  const save = () => { try{ localStorage.setItem(LSS, JSON.stringify(data)); }catch(e){} };
  const short = c => c.replace(/^Siam CC /,'').replace(/ Golf( Resort| Club| & CC)?$/,'');
  const rec = (d, n) => { data[d] = data[d] || {}; data[d][n] = data[d][n] || {s:null,b:0,e:0,h:0}; return data[d][n]; };
  const bkkDay = () => { const t = new Date(Date.now() + 7*36e5); return `${t.getUTCMonth()+1}/${t.getUTCDate()}`; };
  let sel = null, mode = 'rec', prevFocus = null;
  const pickDefault = () => { const today = GOLF.find(g => g.d === bkkDay()); if(today) return today.d; const withData = GOLF.filter(g => data[g.d] && Object.keys(data[g.d]).length).pop(); return (withData || GOLF[0]).d; };
  const hasData = d => !!(data[d] && Object.values(data[d]).some(r => r.s || r.b || r.e || r.h));
  const toast = (a, b, ms) => { if(typeof window.__toast === 'function') window.__toast(a, b, ms || 1900); };

  function renderRec(){
    const g = GOLF.find(x => x.d === sel);
    pane.innerHTML = `<div class="sc-rounds" role="group" aria-label="라운드 선택">` + GOLF.map(x => `<button class="sc-round${hasData(x.d) ? ' has' : ''}" type="button" data-d="${x.d}" aria-pressed="${x.d === sel}"><b>${x.d}</b>${esc(short(x.c))}</button>`).join('') + `</div>` +
      `<p class="sc-course">⛳ ${esc(g.c)} · ${g.p.length}인 · 티오프 ${esc((g.tee||'').replace(' 확정',''))}</p>` +
      g.p.map(n => { const r = rec(g.d, n); return `<div class="sc-card" data-n="${esc(n)}"><div class="sc-name"><span>${dot(n)}${esc(n)}</span>` +
        `<label class="sc-score">총 타수 <input type="number" inputmode="numeric" min="40" max="200" step="1" placeholder="–" value="${r.s ?? ''}" data-act="score" aria-label="${esc(n)} 총 타수"></label></div>` +
        `<div class="sc-row"><div class="sc-ctr">🐦 버디<button type="button" data-act="bm" aria-label="${esc(n)} 버디 빼기">−</button><output aria-live="polite">${r.b}</output><button class="plus" type="button" data-act="bp" aria-label="${esc(n)} 버디 더하기">+</button></div>` +
        `<div class="sc-ctr">🦅 이글<button type="button" data-act="em" aria-label="${esc(n)} 이글 빼기">−</button><output aria-live="polite">${r.e}</output><button class="plus" type="button" data-act="ep" aria-label="${esc(n)} 이글 더하기">+</button></div>` +
        `<button class="sc-ho" type="button" data-act="ho" aria-pressed="${!!r.h}">🕳️ 홀인원${r.h ? ' ✓' : ''}</button></div></div>`; }).join('') +
      `<p class="sc-note">이 기기(브라우저)에만 저장돼요 · 단톡에는 아래 복사 버튼으로 공유</p>`;
  }
  function stats(){
    const m = {};
    GOLF.forEach(g => { Object.entries(data[g.d] || {}).forEach(([n, r]) => { const o = m[n] = m[n] || {n, rounds:0, scores:[], b:0, e:0, h:0}; if(r.s || r.b || r.e || r.h) o.rounds++; if(r.s) o.scores.push({s:r.s, d:g.d}); o.b += r.b||0; o.e += r.e||0; o.h += r.h?1:0; }); });
    return Object.values(m).filter(o => o.rounds).map(o => ({...o, best: o.scores.length ? Math.min(...o.scores.map(x => x.s)) : null, avg: o.scores.length ? o.scores.reduce((a,x)=>a+x.s,0)/o.scores.length : null}));
  }
  function renderLb(){
    const st = stats();
    if(!st.length){ pane.innerHTML = '<p class="sc-empty">아직 기록이 없어요 ⛳<br>"✍️ 기록" 탭에서 라운드 후 스코어와 버디를 입력하면 여기에 순위가 생겨요</p>'; return; }
    st.sort((a,b) => (a.best ?? 999) - (b.best ?? 999) || b.b - a.b);
    const bestS = st.filter(x => x.best != null)[0], birdie = [...st].sort((a,b) => b.b - a.b)[0], eagle = st.filter(x => x.e)[0], hio = st.filter(x => x.h);
    pane.innerHTML = `<table class="sc-lb"><thead><tr><th>이름</th><th>라운드</th><th>최저</th><th>평균</th><th>🐦</th><th>🦅</th><th>🕳️</th></tr></thead><tbody>` +
      st.map(o => `<tr><td>${dot(o.n)}${esc(o.n)}</td><td>${o.rounds}</td><td>${o.best ?? '–'}</td><td>${o.avg != null ? o.avg.toFixed(1) : '–'}</td><td>${o.b}</td><td>${o.e}</td><td>${o.h}</td></tr>`).join('') + `</tbody></table>` +
      `<div class="sc-badges">` + [bestS ? `🥇 <b>최저타</b> ${esc(bestS.n)} ${bestS.best}타` : '', birdie && birdie.b ? `🐦 <b>버디왕</b> ${esc(birdie.n)} ${birdie.b}개` : '', eagle ? `🦅 <b>이글</b> ${esc(eagle.n)} ${eagle.e}개` : '', hio.length ? `🕳️ <b>홀인원</b> ${hio.map(x => esc(x.n)).join('·')} 🎉` : ''].filter(Boolean).join('<br>') + `</div>` +
      '<p class="sc-note">최저·평균은 총 타수를 입력한 라운드만 계산해요</p>';
  }
  function render(){ tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === mode))); if(mode === 'rec') renderRec(); else renderLb(); }
  tabsEl.innerHTML = '<button class="wh-tab" role="tab" type="button" data-id="rec" aria-selected="true">✍️ 기록</button><button class="wh-tab" role="tab" type="button" data-id="lb" aria-selected="false">🏆 리더보드</button>';
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(b){ haptic('tap'); mode = b.dataset.id; render(); } });
  pane.addEventListener('click', e => {
    const rb = e.target.closest('.sc-round'); if(rb){ sel = rb.dataset.d; haptic('tap'); renderRec(); return; }
    const btn = e.target.closest('[data-act]'); if(!btn || btn.tagName === 'INPUT') return;
    const card = btn.closest('.sc-card'); if(!card) return; const n = card.dataset.n, r = rec(sel, n), act = btn.dataset.act;
    if(act === 'bp'){ r.b++; haptic('ok'); toast('🐦 버디!', `${n} · 이번 라운드 ${r.b}개째`); }
    else if(act === 'bm') r.b = Math.max(0, r.b-1);
    else if(act === 'ep'){ r.e++; haptic('ok'); if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🦅 이글!', msg:`${n} 이글!`, ms:2600, at:card, dy:0, n:20, spread:90, petals:true }); else toast('🦅 이글!', n, 2400); }
    else if(act === 'em') r.e = Math.max(0, r.e-1);
    else if(act === 'ho'){ r.h = r.h ? 0 : 1; if(r.h){ haptic('ok'); if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🕳️ 홀인원!!', msg:`${n} 홀인원! 오늘 저녁은 ${n}님이 쏘는 날?`, ms:4200, at:card, dy:0, n:34, spread:120, petals:true }); else toast('🕳️ 홀인원!!', n, 3000); } }
    save(); renderRec();
    const again = pane.querySelector(`.sc-card[data-n="${n}"] [data-act="${act}"]`); if(again) try{ again.focus({preventScroll:true}); }catch(err){}
  });
  pane.addEventListener('change', e => {
    const inp = e.target.closest('input[data-act="score"]'); if(!inp) return;
    const n = inp.closest('.sc-card').dataset.n, r = rec(sel, n), v = parseInt(inp.value, 10);
    r.s = (v >= 40 && v <= 200) ? v : null; if(inp.value && r.s == null) inp.value = '';
    save(); haptic('tap');
  });
  function copyText(){
    const lines = ['⛳ 태국 겨울 골프 기록'];
    GOLF.forEach(g => { const rs = data[g.d]; if(!rs) return; const parts = g.p.filter(n => rs[n] && (rs[n].s || rs[n].b || rs[n].e || rs[n].h)).map(n => { const r = rs[n]; return `${n} ${r.s || '–'}${r.b ? ` 🐦${r.b}` : ''}${r.e ? ` 🦅${r.e}` : ''}${r.h ? ' 🕳️' : ''}`; }); if(parts.length) lines.push(`${g.d} ${short(g.c)}: ${parts.join(' · ')}`); });
    const st = stats(), bs = st.filter(x => x.best != null).sort((a,b) => a.best - b.best)[0]; if(bs) lines.push(`🥇 최저타 ${bs.n} ${bs.best}타`);
    return lines.length > 1 ? lines.join('\n') : '';
  }
  copyBtn.addEventListener('click', async () => {
    const t = copyText(), o = copyBtn.textContent;
    if(!t){ copyBtn.textContent = '기록이 아직 없어요'; setTimeout(() => { copyBtn.textContent = o; }, 1600); return; }
    try{ await navigator.clipboard.writeText(t); copyBtn.textContent = '✅ 복사했어요'; }catch(err){ copyBtn.textContent = '⚠️ 복사 실패'; }
    haptic('ok'); setTimeout(() => { copyBtn.textContent = o; }, 1800);
  });
  async function roundImage(){
    const g = GOLF.find(x => x.d === sel), rs = data[g.d] || {}, rows = g.p.filter(n => rs[n] && (rs[n].s || rs[n].b || rs[n].e || rs[n].h));
    if(!rows.length) return 'empty';
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#0E2822'); gr.addColorStop(1, '#1E4B41'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(245,231,192,.08)'; c.beginPath(); c.arc(W-120, 160, 260, 0, 7); c.fill();
    c.textAlign = 'left'; c.fillStyle = '#F5E7C0'; c.font = '600 44px system-ui, sans-serif'; c.fillText('⛳ ROUND CARD', 80, 130);
    c.fillStyle = '#F4EEDD'; c.font = '700 84px "Source Serif 4", Georgia, serif'; c.fillText(`${g.d} (${g.w})`, 80, 250);
    c.font = '600 52px system-ui, sans-serif'; c.fillText(g.c.length > 26 ? g.c.slice(0, 25) + '…' : g.c, 80, 330);
    c.fillStyle = '#B3CABF'; c.font = '500 36px system-ui, sans-serif'; c.fillText(`${g.p.length}인 라운드 · 티오프 ${(g.tee || '').replace(' 확정', '')}`, 80, 390);
    const best = Math.min(...rows.map(n => rs[n].s || 999));
    rows.slice(0, 5).forEach((n, i) => {
      const r = rs[n], y = 470 + i*150; c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(60, y, W-120, 126, 28); c.fill();
      c.fillStyle = pc(n); c.beginPath(); c.arc(110, y+63, 16, 0, 7); c.fill();
      c.fillStyle = '#F4EEDD'; c.font = '700 48px system-ui, sans-serif'; c.fillText(n, 148, y+78); const nw = c.measureText(n).width;
      const badge = `${r.b ? ' 🐦' + r.b : ''}${r.e ? ' 🦅' + r.e : ''}${r.h ? ' 🕳️' : ''}`.trim(); c.fillStyle = '#F5E7C0'; c.font = '600 40px system-ui, sans-serif'; c.fillText(badge, 148 + nw + 28, y+78);
      c.textAlign = 'right'; c.fillStyle = r.s && r.s === best ? '#F5E7C0' : '#F4EEDD'; c.font = '700 64px "Source Serif 4", Georgia, serif'; c.fillText(r.s ? (r.s === best && rows.length > 1 ? '🥇 ' : '') + r.s : '–', W-100, y+82); c.textAlign = 'left';
    });
    c.fillStyle = '#B3CABF'; c.font = '500 34px system-ui, sans-serif'; c.fillText('태국 겨울 여행 2026 · 3가족 9명', 80, H-90);
    const blob = await new Promise(res => cv.toBlob(res, 'image/png')); if(!blob) return 'fail';
    const file = new File([blob], `round-${g.d.replace('/','-')}.png`, {type:'image/png'});
    try{ if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:`${g.d} 라운드 기록`}); return 'shared'; } }catch(e){ if(e && e.name === 'AbortError') return 'cancel'; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return 'saved';
  }
  const imgBtn = $('scImg');
  imgBtn.addEventListener('click', async () => {
    const o = imgBtn.textContent; imgBtn.textContent = '⏳ 이미지 만드는 중…';
    const how = await roundImage();
    imgBtn.textContent = how === 'empty' ? '기록이 아직 없어요' : how === 'saved' ? '✅ 이미지로 저장했어요' : how === 'shared' ? '✅ 공유했어요' : how === 'fail' ? '⚠️ 이미지를 만들지 못했어요' : o;
    haptic('ok'); setTimeout(() => { imgBtn.textContent = o; }, 1800);
  });
  window.__scoreInfo = () => ({ data, stats });
  function open(){
    prevFocus = document.activeElement; sel = sel || pickDefault(); mode = 'rec'; render();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openScore = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, .sc-round, .sc-card input, .sc-ctr button, .sc-ho, #scImg, #scCopy, #scClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 태국 나침반: 폰의 방향 센서 + 위치로 "태국은 저쪽!"을 가리킴 (센서가 없으면 지도 기준으로 표시) ──
(function(){
  const scrim = $('compassScrim'); if(!scrim) return;
  const svg = $('cpSvg'), tabsEl = $('cpTabs'), mainEl = $('cpMain'), subEl = $('cpSub'), hintEl = $('cpHint'),
        startBtn = $('cpStart'), locBtn = $('cpLoc'), closeBtn = $('cpClose');
  const ICN = {lat:37.4602, lon:126.4407, name:'인천'}, PAT = {lat:12.9236, lon:100.8825, name:'파타야'};
  const TARGETS = [
    { id:'pat', tab:'🏝️ 파타야', name:'파타야', e:'🏝️', lat:PAT.lat, lon:PAT.lon, tz:'한국보다 2시간 느려요' },
    { id:'bkk', tab:'🏙️ 방콕',   name:'방콕',   e:'🏙️', lat:13.7563, lon:100.5018, tz:'한국보다 2시간 느려요' },
    { id:'icn', tab:'🏠 집(인천)', name:'집(인천)', e:'🏠', lat:ICN.lat, lon:ICN.lon, tz:'' }
  ];
  const rad = d => d*Math.PI/180, deg = r => r*180/Math.PI;
  function calc(a, b){
    const f1 = rad(a.lat), f2 = rad(b.lat), dl = rad(b.lon-a.lon), dp = f2-f1;
    const h = Math.sin(dp/2)**2 + Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;
    const km = 2*6371*Math.asin(Math.sqrt(h));
    const brg = (deg(Math.atan2(Math.sin(dl)*Math.cos(f2), Math.cos(f1)*Math.sin(f2) - Math.sin(f1)*Math.cos(f2)*Math.cos(dl))) + 360) % 360;
    return { km, brg };
  }
  let sensorTimer = 0, target = TARGETS[0], me = null, heading = null, hasSensor = false, listening = false, locked = false, prevFocus = null, bearing = 0;

  // SVG 나침반 (rose = 회전판, 핀 = 고정)
  function buildSvg(){
    let t = '';
    for(let i=0;i<72;i++){ const a = i*5, big = a%30===0, r1 = big ? 78 : 83; t += `<line class="cp-tick" x1="0" y1="${-r1}" x2="0" y2="-88" transform="rotate(${a})"/>`; }
    const c = [['N',0],['E',90],['S',180],['W',270]].map(([l,a]) => `<text class="cp-card${l==='N'?' n':''}" transform="rotate(${a}) translate(0 -64)" text-anchor="middle" dominant-baseline="central"><tspan transform="rotate(${-a})">${l}</tspan></text>`).join('');
    svg.innerHTML =
      `<circle class="cp-ring" r="96"/><g id="cpRose">${t}${c}` +
      `<g id="cpTgt"><line x1="0" y1="-16" x2="0" y2="-52" stroke="#1E4B41" stroke-width="3" stroke-linecap="round"/>` +
      `<polygon points="0,-60 -8,-46 8,-46" fill="#1E4B41"/><text id="cpFlag" y="-76" font-size="22" text-anchor="middle" dominant-baseline="central">🏝️</text></g></g>` +
      `<circle r="7" fill="#F6F2E8" stroke="#B58A28" stroke-width="2"/><polygon class="cp-pin" points="0,-104 -7,-93 7,-93"/>`;
  }
  const rose = () => $('cpRose'), tgt = () => $('cpTgt');
  function paint(){
    const h = heading == null ? 0 : heading;
    rose().setAttribute('transform', `rotate(${-h})`);
    tgt().setAttribute('transform', `rotate(${bearing})`);
    $('cpFlag').textContent = target.e;
    // 반대로 돌려서 이모지는 항상 똑바로
    $('cpFlag').setAttribute('transform', `rotate(${-(bearing - h)} 0 -76)`);
    const diff = ((bearing - h + 540) % 360) - 180;
    const now = heading != null && Math.abs(diff) < 6;
    svg.classList.toggle('lock', now);
    if(now && !locked){
      locked = true; mainEl.classList.remove('pop'); void mainEl.offsetWidth; mainEl.classList.add('pop');
      try{ if(navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate && navigator.vibrate([20,40,30]); }catch(e){}
      if(typeof window.__toast === 'function') window.__toast(`${target.e} 찾았다!`, `바로 이쪽이 ${target.name} 방향이에요`, 2200);
    } else if(!now && Math.abs(diff) > 14) locked = false;
  }
  function info(){
    const from = me || (target.id === 'icn' ? PAT : ICN), r = calc(from, target);
    bearing = r.brg;
    const km = Math.round(r.km), dir = ['북','북동','동','남동','남','남서','서','북서'][Math.round(bearing/45)%8];
    let t;
    if(km < 3) t = '바로 여기예요! 🎉';
    else if(km < 400) t = `약 ${km.toLocaleString()}km · 자동차로 약 ${Math.max(1, Math.round(km/60*2)/2)}시간`;
    else { const hrs = Math.round((km/720 + 0.5)*2)/2; t = `약 ${km.toLocaleString()}km · 비행기로 약 ${Math.floor(hrs)}시간${hrs%1 ? ' 30분' : ''}`; }
    mainEl.textContent = km < 3 ? t : `${target.name}까지 ${t.replace(/^약 /,'약 ')}`;
    subEl.textContent = `${me ? '📍 내 위치' : '🛫 ' + from.name + ' 기준(기본)'}에서 ${dir}쪽 ${Math.round(bearing)}°` + (target.tz ? ` · ${target.tz}` : '');
    paint();
  }
  function setHint(){
    hintEl.textContent = hasSensor ? '폰을 수평으로 들고 천천히 돌려보세요. 방향이 맞으면 진동과 함께 금색으로 바뀌어요'
      : listening ? '방향 센서 신호를 기다리는 중… 폰을 한 번 흔들어보세요'
      : '나침반을 켜면 폰이 가리키는 방향으로 돌아가요 (센서가 없는 기기는 북쪽 기준 지도로 보여요)';
  }
  function onOrient(e){
    let h = null;
    if(typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if(e.alpha != null && (e.absolute || e.type === 'deviceorientationabsolute')) h = (360 - e.alpha) % 360;
    if(h == null || isNaN(h)) return;
    if(heading == null) heading = h; else { const d = ((h - heading + 540) % 360) - 180; heading = (heading + d*0.3 + 360) % 360; }
    if(!hasSensor){ hasSensor = true; setHint(); startBtn.textContent = '🧭 나침반 끄기'; }
    paint();
  }
  function stopSensor(){
    removeEventListener('deviceorientationabsolute', onOrient, true);
    removeEventListener('deviceorientation', onOrient, true);
    clearTimeout(sensorTimer);
    listening = false; hasSensor = false; heading = null; locked = false;
    startBtn.textContent = '🧭 나침반 켜기'; startBtn.setAttribute('aria-pressed', 'false');
    if(rose()){ paint(); } setHint();
  }
  async function startSensor(){
    if(listening) return;
    try{
      if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
        const r = await DeviceOrientationEvent.requestPermission();
        if(r !== 'granted'){ hintEl.textContent = '방향 센서 권한이 거절됐어요. 설정 → Safari에서 허용해 주세요'; return; }
      }
    }catch(err){ hintEl.textContent = '방향 센서를 켤 수 없어요 (HTTPS 또는 권한 필요)'; return; }
    addEventListener('deviceorientationabsolute', onOrient, true);
    addEventListener('deviceorientation', onOrient, true);
    listening = true; startBtn.setAttribute('aria-pressed', 'true'); startBtn.textContent = '⏳ 센서 연결 중… (누르면 취소)'; setHint();
    sensorTimer = setTimeout(() => {
      if(!hasSensor && listening){ stopSensor(); startBtn.textContent = '🧭 다시 켜기 (센서 없음)'; hintEl.textContent = '이 기기에서는 방향 센서를 쓸 수 없어요. 북쪽이 위인 지도 기준으로 보여드려요'; }
    }, 2500);
  }
  const toggleSensor = () => { haptic('tap'); if(listening) stopSensor(); else startSensor(); };
  function locate(){
    if(me){ me = null; locBtn.textContent = '📍 내 위치로'; locBtn.setAttribute('aria-pressed', 'false'); info(); return; }
    if(!navigator.geolocation){ hintEl.textContent = '이 기기는 위치 기능을 지원하지 않아요'; return; }
    locBtn.textContent = '⏳ 위치 확인 중…';
    navigator.geolocation.getCurrentPosition(pos => {
      me = { lat:pos.coords.latitude, lon:pos.coords.longitude, name:'내 위치' };
      locBtn.textContent = '📍 내 위치 끄기'; locBtn.setAttribute('aria-pressed', 'true'); info();
    }, () => { locBtn.textContent = '📍 내 위치로'; hintEl.textContent = '위치 권한이 없어서 기본 위치(인천·파타야) 기준으로 보여드려요'; },
    { timeout:8000, maximumAge:600000 });
  }
  function setTarget(t){
    target = t; locked = false;
    tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === t.id)));
    info();
  }
  tabsEl.innerHTML = TARGETS.map(t => `<button class="wh-tab" role="tab" type="button" data-id="${t.id}" aria-selected="false">${t.tab}</button>`).join('');
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(b){ haptic('tap'); setTarget(TARGETS.find(t => t.id === b.dataset.id)); } });
  startBtn.addEventListener('click', toggleSensor); startBtn.setAttribute('aria-pressed', 'false'); locBtn.setAttribute('aria-pressed', 'false');
  locBtn.addEventListener('click', locate);

  function open(){
    prevFocus = document.activeElement; if(!rose()) buildSvg();
    setTarget(target); setHint();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ startBtn.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    stopSensor();
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openCompass = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, #cpStart, #cpLoc, #cpClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 나의 여행 칭호: 일정 데이터(GOLF·FAMS)로 사람마다 칭호를 계산해서 붙여줌 ──
(function(){
  const scrim = $('titleScrim'); if(!scrim) return;
  const chipsEl = $('ttChips'), card = $('ttCard'), copyBtn = $('ttCopy'), closeBtn = $('ttClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const NONGOLF = {
    '장모님': ['🏡','가족1의 든든한 중심','가족 모두가 의지하는 든든한 분이에요'],
    '박지해': ['🤝','가족2 든든 서포터','가족2와 함께하는 든든한 동행이에요'],
    '이동현': ['⚡','가족2 에너자이저','마지막 날까지 분위기를 이끌어요']
  };
  const people = FAMS.flatMap(f => f.rows.map(r => ({ n:r.n, p:r.p, g:r.g })));
  function stats(n){
    const r = GOLF.filter(x => x.p.includes(n)), co = {};
    r.forEach(x => x.p.forEach(q => { if(q !== n) co[q] = (co[q]||0)+1; }));
    const top = Object.entries(co).sort((a,b) => b[1]-a[1])[0];
    const bkk = r.filter(x => x.loc !== 'pat').length;
    return { r, n:r.length, courses:new Set(r.map(x => x.c)).size, bkk, pat:r.length-bkk, top, first:r[0] && r[0].d, last:r[r.length-1] && r[r.length-1].d };
  }
  function titleOf(n){
    const m = NONGOLF[n]; if(m) return { e:m[0], t:m[1], line:m[2], rows:null };
    const s = stats(n), total = GOLF.length;
    let e, t, line;
    if(s.n === total){ e='🏅'; t='개근 라운더'; line = `${total}라운드 전부 출전! 이 정도면 골프장 직원이에요`; }
    else if(s.bkk === s.n){ e='✈️'; t='방콕 원정대'; line = `방콕 라운드 ${s.n}번에 출격! 이번 여행의 원정 대표예요`; }
    else if(s.courses === s.n && s.n >= 3){ e='🧭'; t='코스 탐험가'; line = `라운드 ${s.n}번이 전부 다른 코스! 같은 코스는 사양이에요`; }
    else if(!s.bkk){ e='🌴'; t='파타야 전담'; line = `파타야 라운드만 ${s.n}번! ${s.last}까지 알차게 달려요`; }
    else { e='🚀'; t='뒷심 라운더'; line = `${s.first}부터 합류해서 ${s.last}까지 끝까지 달려요`; }
    return { e, t, line, rows:s };
  }
  function render(n, anim){
    const o = titleOf(n), who = people.find(x => x.n === n);
    const rows = o.rows ? [
      `⛳ 라운드 <b>${o.rows.n}회</b> (파타야 ${o.rows.pat} · 방콕 ${o.rows.bkk})`,
      `🗺️ 코스 <b>${o.rows.courses}곳</b>`,
      o.rows.top ? `🤝 단짝 <b>${esc(o.rows.top[0])}</b> (${o.rows.top[1]}번 같은 조)` : '',
      `📅 첫 라운드 <b>${o.rows.first}</b> → 마지막 <b>${o.rows.last}</b>`
    ] : [ `🛫 체류 <b>${esc(who ? who.p : '')}</b>` ];
    card.className = 'tt-card' + (anim ? ' pop' : '');
    card.innerHTML = `<div class="tt-who">${esc(n)}</div><div class="tt-e" aria-hidden="true">${o.e}</div><div class="tt-name">${esc(o.t)}</div>` +
      `<p class="tt-line">${esc(o.line)}</p><ul class="tt-stats">${rows.filter(Boolean).map(x => `<li>${x}</li>`).join('')}</ul>`;
    copyBtn.hidden = false; copyBtn.dataset.txt = `${n} · ${o.e} ${o.t}\n${o.line}\n(태국 겨울 여행 2026 · 나의 여행 칭호)`;
  }
  chipsEl.innerHTML = people.map(x => `<button class="wh-chip" type="button" data-n="${esc(x.n)}" aria-pressed="false" style="border-color:var(--line)">${esc(x.n)}</button>`).join('');
  card.innerHTML = '<p class="tt-empty">위에서 이름을 눌러보세요 🏷️<br>골프 라운드 수·코스·같은 조 인원으로 칭호가 정해져요</p>';
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.wh-chip'); if(!b) return;
    chipsEl.querySelectorAll('.wh-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    haptic('ok'); render(b.dataset.n, true);
    if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🏷️ 칭호', msg:`${b.dataset.n} · ${titleOf(b.dataset.n).e} ${titleOf(b.dataset.n).t}`, ms:2200, at:card, dy:0, n:10, spread:80, petals:true });
  });
  copyBtn.addEventListener('click', async () => {
    const txt = copyBtn.dataset.txt || ''; const o = copyBtn.textContent;
    try{ await navigator.clipboard.writeText(txt); copyBtn.textContent = '✅ 복사했어요'; }
    catch(e){ copyBtn.textContent = '⚠️ 복사 실패 — 직접 길게 눌러 복사하세요'; }
    haptic('ok'); setTimeout(() => { copyBtn.textContent = o; }, 1800);
  });
  let prevFocus = null;
  function open(){
    prevFocus = document.activeElement;
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    const f = chipsEl.querySelector('.wh-chip'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openTitles = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-chip, #ttCopy:not([hidden]), #ttClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 운명의 룰렛: 쏠 사람 · 저녁 메뉴 · 내기/벌칙 · 조 편성 (가족 단톡에서 "누가 쏘지?"를 3초에 정리) ──
(function(){
  const scrim = $('wheelScrim'); if(!scrim) return;
  const LSW = 'thai2026_wheel';
  const ALL = ['윤우열','정유경','정유현','장모님','이준영','박지해','이동현','김태기','윤성욱'];
  const BETS = ['커피 쏘기','건배사 하기','셀카 올리기','먼저 티샷','모닝콜 담당','과일 쏘기','칭찬 3가지','발마사지'];
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const rnd = a => a[(Math.random()*a.length)|0];
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = (Math.random()*(i+1))|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
  const MODES = [
    { id:'pay',  tab:'☕ 쏠 사람',  hint:'오늘 커피·간식을 쏠 사람은? 빠질 사람은 이름을 눌러 제외하세요.', pool:ALL, chips:true, suffix:'오늘은 쏘는 날! ☕' },
    { id:'menu', tab:'🍜 저녁 메뉴', hint:'뭐 먹을지 고민될 때 — 태국 음식 8개 중에서 골라요.', pool:null, chips:false, suffix:'오늘 저녁은 이걸로! 🍜' },
    { id:'bet',  tab:'🎲 내기·벌칙', hint:'라운드 내기나 소소한 벌칙을 룰렛에 맡겨요.', pool:BETS, chips:false, suffix:'내기 당첨! 🎲' },
    { id:'team', tab:'👥 조 편성',   hint:'골프 멤버를 두 팀으로 랜덤하게 나눠요. 빠지는 사람은 이름을 눌러 제외하세요.', pool:GOLFERS, chips:true }
  ];
  const COLORS = ['#1E4B41','#B58A28','#A94A2C','#2C6B4C','#7A5A17','#3D544D'];
  let hist; try{ hist = JSON.parse(localStorage.getItem(LSW)); }catch(e){} if(!Array.isArray(hist)) hist = [];
  let mode = MODES[0], off = {}, items = [], rot = 0, spinning = false, prevFocus = null;
  const tabsEl = $('whTabs'), chipsEl = $('whChips'), wheel = $('whWheel'), wrap = $('whWrap'), teamsEl = $('whTeams'),
        resEl = $('whRes'), logEl = $('whLog'), spinBtn = $('whSpin'), closeBtn = $('whClose'), hintEl = $('whHint');
  const reduce = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

  function poolOf(m){
    if(m.id === 'menu'){ if(!m._menu) m._menu = shuffle(FOODS.map(f => f[0])).slice(0,8); return m._menu; }
    return m.chips ? m.pool.filter(n => !off[n]) : m.pool;
  }
  function drawWheel(){
    items = poolOf(mode); const n = items.length, a = 360/n, R = 96;
    const pt = (deg, r) => { const t = (deg-90)*Math.PI/180; return [(r*Math.cos(t)).toFixed(2), (r*Math.sin(t)).toFixed(2)]; };
    let g = '';
    for(let i=0;i<n;i++){
      const [x1,y1] = pt(i*a,R), [x2,y2] = pt((i+1)*a,R), mid = i*a + a/2, lab = items[i].length > 7 ? items[i].slice(0,6)+'…' : items[i];
      const path = n === 1 ? `<circle r="${R}" fill="${COLORS[0]}"/>` : `<path d="M0 0 L${x1} ${y1} A${R} ${R} 0 ${a>180?1:0} 1 ${x2} ${y2} Z" fill="${COLORS[i%COLORS.length]}" stroke="#F6F2E8" stroke-width="1.2"/>`;
      g += path + `<text transform="rotate(${mid-90}) translate(${R*0.9} 0)" text-anchor="end" dominant-baseline="central" font-size="${n>8?8.5:10}" font-weight="700" fill="#F4EEDD" font-family="system-ui,sans-serif">${esc(lab)}</text>`;
    }
    g += `<circle r="9" fill="#F6F2E8" stroke="#B58A28" stroke-width="2"/>`;
    wheel.innerHTML = `<g class="wh-rot" id="whRot" style="transform:rotate(${rot}deg)">${g}</g>`;
  }
  function renderChips(){
    chipsEl.hidden = !mode.chips;
    chipsEl.innerHTML = mode.chips ? mode.pool.map(n => `<button class="wh-chip" type="button" data-n="${esc(n)}" aria-pressed="${!off[n]}">${esc(n)}</button>`).join('') : '';
  }
  function renderLog(){
    logEl.textContent = hist.length ? '최근 결과 · ' + hist.slice(0,5).map(h => h.t).join(' · ') : '';
  }
  function setMode(m){
    if(spinning) return;
    mode = m; resEl.textContent = ''; resEl.classList.remove('pop');
    tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === m.id)));
    hintEl.textContent = m.hint;
    const isTeam = m.id === 'team';
    wrap.hidden = isTeam; teamsEl.hidden = !isTeam;
    spinBtn.textContent = isTeam ? '👥 섞어요!' : m.id === 'menu' ? '🍜 돌려요!' : '🎡 돌려요!';
    renderChips();
    if(isTeam) teamsEl.innerHTML = ''; else drawWheel();
    updateSpin();
  }
  function updateSpin(){
    const need = mode.id === 'team' ? 2 : 2, n = poolOf(mode).length;
    spinBtn.disabled = n < need; spinBtn.setAttribute('aria-disabled', String(n < need));
    if(n < need) resEl.innerHTML = '<small>2명 이상 선택해 주세요</small>';
  }
  function record(t){ hist.unshift({t}); hist = hist.slice(0,20); try{ localStorage.setItem(LSW, JSON.stringify(hist)); }catch(e){} renderLog(); }
  function celebrate(msg){
    if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🎡 룰렛', msg, ms:2600, at:resEl, dy:0, n:14, spread:90, petals:true });
  }
  function showWin(label){
    resEl.classList.remove('pop'); void resEl.offsetWidth; resEl.classList.add('pop');
    resEl.innerHTML = esc(label) + `<small>${esc(mode.suffix.trim())}</small>`;
    record(label); haptic('ok'); celebrate(label + ' · ' + mode.suffix);
  }
  function spin(){
    if(spinning || spinBtn.disabled) return;
    if(mode.id === 'team'){ return doTeams(); }
    const n = items.length, a = 360/n, win = (Math.random()*n)|0;
    // 포인터(위쪽, 0°)가 win 칸의 중앙(±칸 폭 30%)에 오도록 최종 각도 계산
    const jitter = (Math.random()-.5)*a*.6;
    const target = 360*5 + (360 - (win*a + a/2) + jitter);
    const base = rot - (rot % 360);
    const next = base + target;
    spinning = true; spinBtn.disabled = true; resEl.textContent = ''; haptic('tap');
    const g = $('whRot'), done = () => { spinning = false; rot = next; spinBtn.disabled = false; spinBtn.setAttribute('aria-disabled','false'); showWin(items[win]); };
    if(reduce()){ g.style.transform = `rotate(${next}deg)`; done(); return; }
    g.style.transition = 'transform 4.2s cubic-bezier(.12,.72,.14,1)';
    void g.getBoundingClientRect();
    g.style.transform = `rotate(${next}deg)`;
    let fin = false; const end = () => { if(fin) return; fin = true; g.style.transition = ''; done(); };
    g.addEventListener('transitionend', end, {once:true}); setTimeout(end, 4600);
  }
  function doTeams(){
    const ppl = shuffle(poolOf(mode)), half = Math.ceil(ppl.length/2), A = ppl.slice(0,half), B = ppl.slice(half);
    const names = shuffle([['🦅 버디 팀','🐘 코끼리 팀'],['🔥 쏘이 팀','🥭 망고 팀'],['🐉 용 팀','🌴 야자 팀']])[0];
    teamsEl.innerHTML = [[names[0],A],[names[1],B]].map(([t,m]) => `<div class="wh-team"><h3>${esc(t)}</h3><ul>${m.map(x => `<li>${dotSafe(x)}${esc(x)}</li>`).join('')}</ul></div>`).join('');
    resEl.classList.remove('pop'); void resEl.offsetWidth; resEl.classList.add('pop');
    resEl.innerHTML = '팀이 정해졌어요!<small>마음에 안 들면 다시 섞어요 😄</small>';
    record(`${names[0].replace(/^\S+\s/,'')} ${A.length}:${B.length} ${names[1].replace(/^\S+\s/,'')}`); haptic('ok');
    celebrate('조 편성 완료!');
  }
  const dotSafe = n => (typeof dot === 'function' ? dot(n) : '');

  tabsEl.innerHTML = MODES.map(m => `<button class="wh-tab" role="tab" type="button" data-id="${m.id}" aria-selected="false">${m.tab}</button>`).join('');
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(!b) return; haptic('tap'); setMode(MODES.find(m => m.id === b.dataset.id)); });
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.wh-chip'); if(!b || spinning) return;
    off[b.dataset.n] = !off[b.dataset.n]; b.setAttribute('aria-pressed', String(!off[b.dataset.n]));
    haptic('tap'); resEl.textContent = '';
    if(mode.id === 'team') teamsEl.innerHTML = ''; else drawWheel();
    updateSpin();
  });
  spinBtn.addEventListener('click', spin);

  function open(){
    prevFocus = document.activeElement; renderLog(); setMode(mode);
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ spinBtn.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openWheel = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, .wh-chip, #whSpin:not(:disabled), #whClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();
