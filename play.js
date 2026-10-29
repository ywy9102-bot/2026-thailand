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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key === 'Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key === 'Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-chip, #fcCopy:not([hidden]), #fcClose')];
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
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
  const rec = (d, n) => { data[d] = data[d] || {}; data[d][n] = data[d][n] || {s:null,b:0,e:0,h:0,bh:[]}; if(!Array.isArray(data[d][n].bh)) data[d][n].bh = []; return data[d][n]; };
  // 버디 기록(누가·언제·몇 번째·어느 홀): 첫 화면의 버디 카드가 읽어요
  const LSL = 'thai2026_birdlog';
  const getLog = () => { let l; try{ l = JSON.parse(localStorage.getItem(LSL)); }catch(e){} return Array.isArray(l) ? l : []; };
  const setLog = l => { try{ localStorage.setItem(LSL, JSON.stringify(l.slice(-300))); }catch(e){} };
  const logBird = (n, d, k, c) => { const l = getLog(); l.push({ id: Date.now() + l.length, t: Date.now(), n, d, k, c }); setLog(l); };
  const unlogBird = (n, d) => { const l = getLog(); for(let i = l.length - 1; i >= 0; i--) if(l[i].n === n && l[i].d === d){ l.splice(i, 1); break; } setLog(l); };
  const tagHole = (n, d, h, on) => { const l = getLog(); for(let i = l.length - 1; i >= 0; i--){ const e = l[i]; if(e.n !== n || e.d !== d) continue; if(on && !e.h){ e.h = h; break; } if(!on && e.h === h){ delete e.h; break; } } setLog(l); };
  const holesTxt = bh => bh && bh.length ? bh.join('·') + '번 홀' : '';
  const birdRow = n => '🐦'.repeat(Math.min(n, 9)) + (n > 9 ? `+${n - 9}` : '');
  const BIRD_MSG = c => c === 1 ? '버디!' : c === 2 ? '버디 2개! 불이 붙었어요 🔥' : c === 3 ? '버디 3개! 오늘 컨디션 최고예요' : `버디 ${c}개! 전설의 라운드예요`;
  let openHoles = null;   // 버디 홀 고르기를 펼친 사람
  const bkkDay = () => { const t = new Date(Date.now() + 7*36e5); return `${t.getUTCMonth()+1}/${t.getUTCDate()}`; };
  let sel = null, mode = 'rec', prevFocus = null;
  const pickDefault = () => { const today = GOLF.find(g => g.d === bkkDay()); if(today) return today.d; const withData = GOLF.filter(g => data[g.d] && Object.keys(data[g.d]).length).pop(); return (withData || GOLF[0]).d; };
  const hasData = d => !!(data[d] && Object.values(data[d]).some(r => r.s || r.b || r.e || r.h));
  const toast = (a, b, ms) => { if(typeof window.__toast === 'function') window.__toast(a, b, ms || 1900); };

  function renderRec(){
    const g = GOLF.find(x => x.d === sel);
    pane.innerHTML = `<div class="sc-rounds" role="group" aria-label="라운드 선택">` + GOLF.map(x => `<button class="sc-round${hasData(x.d) ? ' has' : ''}" type="button" data-d="${x.d}" aria-pressed="${x.d === sel}"><b>${x.d}</b>${esc(short(x.c))}</button>`).join('') + `</div>` +
      `<p class="sc-course">⛳ ${esc(g.c)} · ${g.p.length}인 · 티오프 ${esc((g.tee||'').replace(' 확정',''))}</p>` +
      g.p.map(n => { const r = rec(g.d, n), nm = esc(n), open = openHoles === n && r.b > 0;
        return `<div class="sc-card${r.b ? ' bird' : ''}" data-n="${nm}"><div class="sc-name"><span>${dot(n)}${nm}</span>` +
        `<label class="sc-score">총 타수 <input type="number" inputmode="numeric" min="40" max="200" step="1" placeholder="–" value="${r.s ?? ''}" data-act="score" aria-label="${nm} 총 타수"></label></div>` +
        `<div class="sc-bird"><button class="sc-bbtn" type="button" data-act="bp" aria-label="${nm} 버디 1개 더하기"><span aria-hidden="true">🐦</span> 버디!</button>` +
        `<div class="sc-bnum" role="status" aria-live="polite" aria-label="${nm} 버디 ${r.b}개"><b>${r.b}</b><span>버디</span></div>` +
        `<button class="sc-bm" type="button" data-act="bm" aria-label="${nm} 버디 1개 빼기">−</button></div>` +
        (r.b ? `<p class="sc-birds" aria-hidden="true">${birdRow(r.b)}</p><p class="sc-bh">${r.bh.length ? `⛳ 버디 친 홀: <b>${esc(holesTxt(r.bh))}</b>` : '어느 홀이었는지 남겨 보세요 (선택)'}</p>` +
          `<button class="sc-hbtn" type="button" data-act="hl" aria-expanded="${open}">${open ? '▴ 홀 고르기 닫기' : '⛳ 몇 번 홀? 고르기'}</button>` +
          (open ? `<div class="sc-holes" role="group" aria-label="${nm} 버디 친 홀">${Array.from({length: 18}, (_, i) => `<button type="button" data-act="hole" data-h="${i + 1}" aria-pressed="${r.bh.includes(i + 1)}">${i + 1}</button>`).join('')}</div>` : '') : '') +
        `<div class="sc-row"><div class="sc-ctr">🦅 이글<button type="button" data-act="em" aria-label="${nm} 이글 빼기">−</button><output aria-live="polite">${r.e}</output><button class="plus" type="button" data-act="ep" aria-label="${nm} 이글 더하기">+</button></div>` +
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
    const king = birdie && birdie.b ? `<div class="sc-king"><span class="sc-king-ico" aria-hidden="true">🐦</span><div><p class="sc-king-k">버디왕</p><p class="sc-king-n">${dot(birdie.n)}${esc(birdie.n)}</p></div><p class="sc-king-c"><b>${birdie.b}</b>개</p></div>` +
      `<ul class="sc-bl">${[...st].filter(x => x.b).sort((a, b) => b.b - a.b).map(x => `<li><span>${dot(x.n)}${esc(x.n)}</span><span class="sc-bl-r" aria-hidden="true">${birdRow(x.b)}</span><b>${x.b}개</b></li>`).join('')}</ul>` : '';
    pane.innerHTML = king + `<table class="sc-lb"><thead><tr><th>이름</th><th>라운드</th><th>최저</th><th>평균</th><th class="bcol">🐦</th><th>🦅</th><th>🕳️</th></tr></thead><tbody>` +
      st.map(o => `<tr><td>${dot(o.n)}${esc(o.n)}</td><td>${o.rounds}</td><td>${o.best ?? '–'}</td><td>${o.avg != null ? o.avg.toFixed(1) : '–'}</td><td class="bcol">${o.b}</td><td>${o.e}</td><td>${o.h}</td></tr>`).join('') + `</tbody></table>` +
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
    if(act === 'bp'){
      r.b++; openHoles = n; haptic(r.b >= 2 ? 'combo' : 'ok'); logBird(n, sel, r.b, short(GOLF.find(x => x.d === sel).c));
      if(typeof window.__celebrate === 'function') window.__celebrate({ kicker: '🐦 버디!', msg: `${n} · ${BIRD_MSG(r.b)}`, ms: 3000, at: card, dy: 0, n: 12 + r.b * 6, spread: 80 + r.b * 10, petals: r.b >= 2 });
      else toast('🐦 버디!', `${n} · 이번 라운드 ${r.b}개째`);
    }
    else if(act === 'bm'){ if(r.b > 0) unlogBird(n, sel); r.b = Math.max(0, r.b-1); if(r.bh.length > r.b) r.bh.pop(); if(!r.b && openHoles === n) openHoles = null; }
    else if(act === 'hl') openHoles = openHoles === n ? null : n;
    else if(act === 'hole'){ const h = +btn.dataset.h; const had = r.bh.includes(h); r.bh = had ? r.bh.filter(x => x !== h) : r.bh.concat(h).sort((a, b) => a - b); if(r.bh.length > r.b){ r.b = r.bh.length; logBird(n, sel, r.b, short(GOLF.find(x => x.d === sel).c)); } tagHole(n, sel, h, !had); haptic('tap'); }
    else if(act === 'ep'){ r.e++; haptic('ok'); if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🦅 이글!', msg:`${n} 이글!`, ms:2600, at:card, dy:0, n:20, spread:90, petals:true }); else toast('🦅 이글!', n, 2400); }
    else if(act === 'em') r.e = Math.max(0, r.e-1);
    else if(act === 'ho'){ r.h = r.h ? 0 : 1; if(r.h){ haptic('ok'); if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🕳️ 홀인원!!', msg:`${n} 홀인원! 오늘 저녁은 ${n}님이 쏘는 날?`, ms:4200, at:card, dy:0, n:34, spread:120, petals:true }); else toast('🕳️ 홀인원!!', n, 3000); } }
    save(); renderRec(); if(typeof window.__birdieRefresh === 'function') window.__birdieRefresh();
    if(act === 'bp'){ const cd = pane.querySelector(`.sc-card[data-n="${n}"]`); if(cd){ cd.classList.add('fresh'); const f = document.createElement('span'); f.className = 'sc-fly'; f.setAttribute('aria-hidden', 'true'); f.textContent = '🐦'; cd.appendChild(f); setTimeout(() => f.remove(), 1200); } }
    const again = pane.querySelector(`.sc-card[data-n="${n}"] [data-act="${act}"]${act === 'hole' ? `[data-h="${btn.dataset.h}"]` : ''}`); if(again) try{ again.focus({preventScroll:true}); }catch(err){}
  });
  pane.addEventListener('change', e => {
    const inp = e.target.closest('input[data-act="score"]'); if(!inp) return;
    const n = inp.closest('.sc-card').dataset.n, r = rec(sel, n), v = parseInt(inp.value, 10);
    r.s = (v >= 40 && v <= 200) ? v : null; if(inp.value && r.s == null) inp.value = '';
    save(); haptic('tap'); if(typeof window.__birdieRefresh === 'function') window.__birdieRefresh();
  });
  function copyText(){
    const lines = ['⛳ 태국 겨울 골프 기록'];
    GOLF.forEach(g => { const rs = data[g.d]; if(!rs) return; const parts = g.p.filter(n => rs[n] && (rs[n].s || rs[n].b || rs[n].e || rs[n].h)).map(n => { const r = rs[n]; return `${n} ${r.s || '–'}${r.b ? ` ${birdRow(r.b)} 버디${r.b}${r.bh && r.bh.length ? `(${holesTxt(r.bh)})` : ''}` : ''}${r.e ? ` 🦅${r.e}` : ''}${r.h ? ' 🕳️' : ''}`; }); if(parts.length) lines.push(`${g.d} ${short(g.c)}: ${parts.join(' · ')}`); });
    const st0 = stats(), bk = [...st0].sort((a, b) => b.b - a.b)[0]; if(bk && bk.b) lines.push(`🐦🐦 버디왕 ${bk.n} ${bk.b}개! 🐦🐦`);
    const st = st0, bs = st.filter(x => x.best != null).sort((a,b) => a.best - b.best)[0]; if(bs) lines.push(`🥇 최저타 ${bs.n} ${bs.best}타`);
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
    const best = Math.min(...rows.map(n => rs[n].s || 999)), tb = rows.reduce((a, n) => a + (rs[n].b || 0), 0), bn = rows.filter(n => rs[n].b);
    let y0 = 450;
    if(tb){
      // 버디 영웅 띠: 오늘 라운드의 버디를 가장 크게
      const hg = c.createLinearGradient(60, y0, W-60, y0+210); hg.addColorStop(0, '#F5E7C0'); hg.addColorStop(1, '#E2B84F');
      c.fillStyle = hg; c.beginPath(); c.roundRect(60, y0, W-120, 210, 36); c.fill();
      c.textAlign = 'left'; c.fillStyle = '#0E2822'; c.font = '700 40px system-ui, sans-serif'; c.fillText('BIRDIE', 100, y0+62);
      c.font = '800 150px "Source Serif 4", Georgia, serif'; c.fillText(String(tb), 96, y0+185);
      const nw0 = c.measureText(String(tb)).width; c.font = '700 56px system-ui, sans-serif'; c.fillText('개', 96 + nw0 + 12, y0+185);
      c.font = '90px system-ui, sans-serif'; c.textAlign = 'right'; c.fillText('🐦'.repeat(Math.min(tb, 5)), W-96, y0+110);
      c.font = '600 38px system-ui, sans-serif'; c.fillText(bn.map(n => `${n} ${rs[n].b}`).join(' · ').slice(0, 30), W-96, y0+172);
      y0 += 240;
    }
    const RH = tb ? 138 : 150, maxRows = tb ? 4 : 5;
    rows.slice(0, maxRows).forEach((n, i) => {
      const r = rs[n], y = y0 + i*RH, hot = !!r.b; c.textAlign = 'left';
      c.fillStyle = hot ? 'rgba(245,231,192,.20)' : 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(60, y, W-120, RH-18, 28); c.fill();
      if(hot){ c.strokeStyle = '#F5E7C0'; c.lineWidth = 5; c.beginPath(); c.roundRect(60, y, W-120, RH-18, 28); c.stroke(); }
      const hh = hot && r.bh && r.bh.length, ny = hh ? y+56 : y+(RH-18)/2+14;
      c.fillStyle = pc(n); c.beginPath(); c.arc(110, ny-14, 16, 0, 7); c.fill();
      c.fillStyle = '#F4EEDD'; c.font = '700 46px system-ui, sans-serif'; c.fillText(n, 148, ny); const nw = c.measureText(n).width;
      if(hot){ const t = `🐦 ×${r.b}`; c.font = '800 42px system-ui, sans-serif'; const tw = c.measureText(t).width + 36; c.fillStyle = '#F5E7C0'; c.beginPath(); c.roundRect(148 + nw + 22, ny-46, tw, 58, 29); c.fill(); c.fillStyle = '#0E2822'; c.fillText(t, 148 + nw + 40, ny-3); }
      const extra = `${r.e ? ' 🦅' + r.e : ''}${r.h ? ' 🕳️' : ''}`.trim(); if(extra){ c.fillStyle = '#F5E7C0'; c.font = '600 38px system-ui, sans-serif'; c.fillText(extra, 148 + nw + (hot ? 190 : 28), ny); }
      if(hh){ c.fillStyle = '#F5E7C0'; c.font = '500 32px system-ui, sans-serif'; c.fillText('버디 홀 ' + holesTxt(r.bh), 148, y+102); }
      c.textAlign = 'right'; c.fillStyle = r.s && r.s === best ? '#F5E7C0' : '#F4EEDD'; c.font = '700 60px "Source Serif 4", Georgia, serif'; c.fillText(r.s ? (r.s === best && rows.length > 1 ? '🥇 ' : '') + r.s : '–', W-100, y+(RH-18)/2+22); c.textAlign = 'left';
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, .sc-round, .sc-card input, .sc-card button, #scImg, #scCopy, #scClose')];
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, .wh-chip, #whSpin:not(:disabled), #whClose')];
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();
