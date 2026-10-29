/* 지연 로딩 조각(놀이터 모듈): app.js의 로더가 필요할 때 불러옴 */
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
    else if(act === 'bm'){ haptic('tap'); if(r.b > 0) unlogBird(n, sel); r.b = Math.max(0, r.b-1); if(r.bh.length > r.b) r.bh.pop(); if(!r.b && openHoles === n) openHoles = null; }
    else if(act === 'hl') haptic('tap'), openHoles = openHoles === n ? null : n;
    else if(act === 'hole'){ const h = +btn.dataset.h; const had = r.bh.includes(h); r.bh = had ? r.bh.filter(x => x !== h) : r.bh.concat(h).sort((a, b) => a - b); if(r.bh.length > r.b){ r.b = r.bh.length; logBird(n, sel, r.b, short(GOLF.find(x => x.d === sel).c)); } tagHole(n, sel, h, !had); haptic('tap'); }
    else if(act === 'ep'){ r.e++; haptic('ok'); if(typeof window.__celebrate === 'function') window.__celebrate({ kicker:'🦅 이글!', msg:`${n} 이글!`, ms:2600, at:card, dy:0, n:20, spread:90, petals:true }); else toast('🦅 이글!', n, 2400); }
    else if(act === 'em') haptic('tap'), r.e = Math.max(0, r.e-1);
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
    haptic('tap');
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
    haptic('tap');
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
  locBtn.addEventListener('click', () => { haptic('tap'); locate(); });

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
