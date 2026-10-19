/* 지연 로딩 조각: app.js의 로더가 필요할 때 불러옴 */
(function(){
  const scrim = $('thaiScrim'); if(!scrim) return;
  const tabsEl = $('thTabs'), pane = $('thPane'), voiceEl = $('thVoice'), nextBtn = $('thNext'), closeBtn = $('thClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = (Math.random()*(i+1))|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
  const rnd = a => a[(Math.random()*a.length)|0];
  // PHRASES의 한글 표기 → 태국어 문자 (표기 키는 PHRASES[i][0]과 같아야 함)
  const TH = {
    '싸와디 캅 / 카': [['สวัสดีครับ','남 캅'],['สวัสดีค่ะ','여 카']],
    '컵쿤 캅 / 카': [['ขอบคุณครับ','남 캅'],['ขอบคุณค่ะ','여 카']],
    '마이 펫': [['ไม่เผ็ด','']],
    '라카 타오라이?': [['ราคาเท่าไหร่','']],
    '아로이 (막)': [['อร่อยมาก','']],
    '첵빈 / 겝땅': [['เช็คบิล','체크빌'],['เก็บตังค์','겝땅']],
    '마이 아오 컵쿤': [['ไม่เอา ขอบคุณ','']],
    '헝남 유 티 나이?': [['ห้องน้ำอยู่ที่ไหน','']],
    '코 토트': [['ขอโทษ','']],
    '마이 뻰 라이': [['ไม่เป็นไร','']],
    '안니 타오라이?': [['อันนี้เท่าไหร่','']],
    '롯 노이 다이 마이?': [['ลดหน่อยได้ไหม','']],
    '능 · 썽 · 쌈': [['หนึ่ง สอง สาม','']],
    '차이 / 마이 차이': [['ใช่','네'],['ไม่ใช่','아니요']]
  };
  const items = PHRASES.filter(p => TH[p[0]]).map(p => ({ k:p[0], mean:p[1], th:TH[p[0]], short:p[1].split(/ \(| — /)[0] }));

  // ── 숫자 ──
  const D = ['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'], DK = ['쑨','능','썽','쌈','씨','하','혹','쩻','뺏','까오'], DG = '๐๑๒๓๔๕๖๗๘๙';
  function numTh(n){   // 0~99,999 태국어 읽기 (11·21은 เอ็ด, 20은 ยี่สิบ)
    if(n === 0) return {t:D[0], k:DK[0]};
    const P = [[10000,'หมื่น','믄'],[1000,'พัน','판'],[100,'ร้อย','러이'],[10,'สิบ','십']]; let t = '', k = [], r = n;
    for(const [v,w,wk] of P){
      const d = Math.floor(r/v); r %= v; if(!d) continue;
      if(v === 10){ if(d === 1){ t += w; k.push(wk); } else if(d === 2){ t += 'ยี่' + w; k.push('이' + wk); } else { t += D[d] + w; k.push(DK[d] + wk); } }
      else { t += D[d] + w; k.push(DK[d] + wk); }
    }
    if(r){ if(r === 1 && n > 1){ t += 'เอ็ด'; k.push('엣'); } else { t += D[r]; k.push(DK[r]); } }
    return {t, k:k.join(' ')};
  }
  const glyph = n => String(n).replace(/\d/g, c => DG[+c]);
  const NUM_BIG = [11,20,21,30,50,100,1000,10000,100000,1000000];
  function bigTh(n){ if(n === 100000) return {t:'หนึ่งแสน', k:'능 쌘'}; if(n === 1000000) return {t:'หนึ่งล้าน', k:'능 란'}; return numTh(n); }
  const fmt = n => n.toLocaleString('en-US');

  // ── 맥주 ──
  const BEER_SAY = [
    ['เบียร์สิงห์ หนึ่งขวด','싱하 맥주 한 병 주세요','비아 씽 능 쿠앗'],
    ['เบียร์ช้าง สองขวด','창 맥주 두 병 주세요','비아 창 썽 쿠앗'],
    ['เบียร์ลีโอ หนึ่งกระป๋อง','레오 맥주 캔 하나 주세요','비아 리오 능 끄라뽕'],
    ['ขอเบียร์เย็นๆ','차가운 맥주 주세요','코 비아 옌옌'],
    ['ขอน้ำแข็งด้วย','얼음도 주세요','코 남캥 두어이'],
    ['ไชโย','건배!','차이요']
  ];
  const BEER_Q = [
    {q:'태국에서 가장 오래된 맥주 회사 보론락(Boon Rawd)이 만드는 대표 맥주는?', a:'싱하(Singha)', d:['창(Chang)','타이거(Tiger)','하이네켄']},
    {q:'싱하 맥주가 처음 출시된 해는? (양조장 설립은 1933년)', a:'1934년', d:['1957년','1970년','1995년']},
    {q:'창(Chang) 맥주의 이름이 뜻하는 동물은?', a:'코끼리', d:['사자','호랑이','표범']},
    {q:'싱하(Singha)의 상표에 쓰인 신화 속 동물은?', a:'사자', d:['코끼리','용','공작']},
    {q:'더운 태국에서 맥주를 마시는 독특한 방법은?', a:'얼음을 넣어 마신다', d:['따뜻하게 데워 마신다','소금을 넣어 마신다','탄산수를 섞어 마신다']},
    {q:'태국에서 "건배!"를 외치는 말은?', a:'차이요(ไชโย)', d:['컵쿤캅','싸와디캅','마이펫']},
    {q:'레오(Leo)와 창(Chang)이 처음 나온 1990년대 중반에 일어난 일은?', a:'새 브랜드들이 등장해 본격적인 경쟁이 시작됐다', d:['맥주 판매가 전면 금지됐다','싱하가 생산을 중단했다','모든 맥주가 수입품으로 바뀌었다']}
  ];

  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = null, mode = 'list', prevFocus = null, qs = [], qi = 0, score = 0, answered = false, cur = null, qkind = 'phrase';
  const LSQ = 'thai2026_thquiz'; let st; try{ st = JSON.parse(localStorage.getItem(LSQ)) || {}; }catch(e){ st = {}; }
  st.best = st.best||0; st.plays = st.plays||0; st.num = st.num || {best:0,plays:0}; st.beer = st.beer || {best:0,plays:0};
  const save = () => { try{ localStorage.setItem(LSQ, JSON.stringify(st)); }catch(e){} };
  const rec = k => k === 'phrase' ? st : st[k];
  function pickVoice(){ if(!synth) return; const vs = synth.getVoices() || []; voice = vs.find(v => /^th/i.test(v.lang)) || null; paintVoice(); }
  function paintVoice(){
    voiceEl.textContent = voice ? '🔊 이 기기의 태국어 음성(' + voice.name + ')으로 읽어줘요. 소리를 켜고 눌러보세요'
      : '🔇 이 기기에는 태국어 음성이 없어 글자만 보여요. 폰 설정 → 언어/음성(읽어주기)에서 태국어를 추가하면 들을 수 있어요';
  }
  if(synth){ pickVoice(); if(synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice); }
  function say(text){
    if(!synth || !voice){ if(typeof window.__toast === 'function') window.__toast('🔇 음성 없음', '이 기기에는 태국어 음성이 없어요', 2600); return false; }
    try{ synth.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'th-TH'; u.voice = voice; u.rate = .8; synth.speak(u); }catch(e){ return false; }
    return true;
  }
  const playBtn = (t, sub, extra) => `<button class="th-play" type="button" data-say="${esc(t)}" aria-label="${esc(t)} 듣기">🔊 <span lang="th">${esc(t)}</span>${sub ? ` <small>${esc(sub)}</small>` : ''}</button>`;

  function renderList(){
    nextBtn.hidden = true;
    pane.innerHTML = '<ul class="th-list">' + items.map(it => `<li class="th-row"><div class="th-ko">${esc(it.k)}</div><div class="th-mean">${esc(it.mean)}</div><div class="th-btns">` +
      it.th.map(t => playBtn(t[0], t[1])).join('') + '</div></li>').join('') + '</ul>';
  }
  function numBtn(n, t, k, g){ return `<li><button class="th-num" type="button" data-say="${esc(t)}" aria-label="${esc(fmt(n))} ${esc(t)} 듣기"><span class="n">${g || fmt(n)}</span><span class="t" lang="th">${esc(t)}</span><span class="k">${esc(k)}</span></button></li>`; }
  function renderNums(){
    nextBtn.hidden = true;
    const basic = Array.from({length:11}, (_, n) => { const o = n === 10 ? {t:'สิบ', k:'십'} : numTh(n); return numBtn(n, o.t, o.k, String(n)); }).join('');
    const big = NUM_BIG.map(n => { const o = bigTh(n); return numBtn(n, o.t, o.k, fmt(n)); }).join('');
    const price = [50,120,350,1500,2500].map(n => { const o = numTh(n); return `<li class="th-row" style="grid-column:1/-1"><div class="th-ko">${fmt(n)}바트 · ${esc(o.k)} 바트</div><div class="th-btns">${playBtn(o.t + 'บาท', '')}</div></li>`; }).join('');
    pane.innerHTML =
      '<h3 class="th-h" style="margin-top:0">0 ~ 10 · 눌러서 들어보세요</h3><ul class="th-nums">' + basic + '</ul>' +
      '<h3 class="th-h">11 이상 · 큰 숫자</h3><ul class="th-nums">' + big + '</ul>' +
      '<p class="th-note">규칙 ① 10은 <b>십</b>, 20은 <b>이십(ยี่สิบ)</b> — "썽십"이 아니에요. ② 끝자리 1은 11·21·31처럼 두 자리 이상일 때 <b>엣(เอ็ด)</b>으로 바뀌어요 (능 아님). ③ 100·1,000·10,000은 <b>러이·판·믄</b> 앞에 숫자를 붙여요 (250 = 썽 러이 하 십).</p>' +
      '<h3 class="th-h">가격으로 연습 · 택시·시장에서 자주 듣는 말</h3><ul class="th-nums">' + price + '</ul>' +
      `<p class="th-note">태국 숫자 글자는 ${[...DG].map((g,i) => g + '=' + i).join(' · ')} 이에요. 가격표는 대부분 우리와 같은 아라비아 숫자(1, 2, 3)를 써서 읽는 법만 알면 충분해요.</p>` +
      '<button class="wn-close" id="thNumQuiz" type="button" style="margin-top:12px">🎧 숫자 듣고 요금 맞히기 (5문제)</button>';
  }
  const DET = (t, body, open) => `<details class="th-det"${open ? ' open' : ''}><summary>${t}</summary><div class="th-in">${body}</div></details>`;
  function renderBeer(){
    nextBtn.hidden = true;
    pane.innerHTML =
      DET('🍺 태국 3대 맥주 한눈에', '<div class="th-brand">' +
        '<div><strong>싱하 Singha (สิงห์)</strong>1934년 첫 출시 · 보론락(Boon Rawd) 양조장 · 알코올 약 5% · 몰트 향이 진한 정통 페일 라거예요. 로고는 사찰을 지키는 신화 속 사자 "싱하".</div>' +
        '<div><strong>레오 Leo (ลีโอ)</strong>1994년 출시 · 보론락 · 약 5% · 표범 두 마리 로고 · 싱하보다 가볍고 부담 없는 맛으로 알려져 있어요.</div>' +
        '<div><strong>창 Chang (ช้าง)</strong>1995년 출시 · 타이베브(ThaiBev) · 클래식 약 5% · "창"은 코끼리라는 뜻이고 코끼리 두 마리가 로고예요. 부드럽고 가벼운 편이에요.</div>' +
        '</div><p class="th-note">연도·도수는 라벨·공식 소개 기준 대략값이고, 맛 평가는 사람마다 달라요. 셋 다 편의점·식당 어디서나 팔아요.</p>', true) +
      DET('📜 태국 맥주 역사', '<ul>' +
        '<li><b>1930년대 이전</b> — 당시 시암(태국)에는 자체 맥주 공장이 없어 서양에서 들여온 수입 맥주를 마셨어요.</li>' +
        '<li><b>1933년</b> — 프라야 피롬 박디(พระยาภิรมย์ภักดี, 본명 분러드 스레스타풋)가 태국 최초의 양조장 <b>보론락(Boon Rawd)</b>을 세웠어요.</li>' +
        '<li><b>1934년</b> — 첫 맥주 <b>싱하</b> 출시. 유럽식 라거 양조법을 들여와 만들었고, 한동안 태국 맥주 시장은 사실상 싱하가 이끌었어요.</li>' +
        '<li><b>1990년대</b> — 규제가 풀리면서 새 브랜드가 쏟아졌어요. 보론락이 1994년 <b>레오</b>를, 타이베브가 1995년 <b>창</b>을 내놓으며 본격적인 경쟁이 시작됐어요. 창은 가격 경쟁력으로 빠르게 성장해 해외에서도 알려졌고, 영국 프리미어리그 팀 스폰서로도 유명해요.</li>' +
        '<li><b>2020년대</b> — 소규모 양조 규제가 완화되며 방콕을 중심으로 크래프트 맥주 바와 양조장이 늘고 있어요.</li>' +
        '</ul><p class="th-note">출처마다 연도 표기가 1~2년 다를 수 있어요. 큰 흐름 위주로 정리한 요약이에요.</p>', false) +
      DET('🧊 태국식 맥주 마시는 법', '<ul>' +
        '<li><b>얼음을 넣어 마셔요</b> — 더운 날씨에 병맥주가 금방 미지근해져서, 잔에 얼음을 넣고 따라 마시는 게 흔해요. 얼음 맥주가 낯설어도 한 번쯤 해볼 만해요.</li>' +
        '<li><b>큰 병(620ml)을 같이 나눠 마셔요</b> — 식당에서는 큰 병 하나를 시켜 여러 잔으로 나눠 따르는 모습이 일반적이에요.</li>' +
        '<li><b>건배는 "차이요(ไชโย)"</b> — 잔을 부딪치며 외쳐요. 잔을 부딪치는 건 "촌깨우(ชนแก้ว)".</li>' +
        '<li><b>음식 궁합</b> — 매콤한 쏨땀·팟까파오, 숯불 무삥, 해산물 요리에 시원한 맥주가 잘 어울려요.</li>' +
        '</ul>', false) +
      DET('🏌️ 골프 여행 맥주 팁', '<ul>' +
        '<li><b>대략 가격</b> — 편의점 캔·병은 40~70바트, 일반 식당 큰 병은 90~150바트 안팎이 흔하고, 리조트·골프장 클럽하우스는 더 비싼 편이에요 (지역·시기별로 달라요).</li>' +
        '<li><b>판매 시간·금주일</b> — 마트·편의점은 낮 시간대(보통 14~17시)에 주류 판매를 제한하는 규정이 있어요. 불교 공휴일·선거일에는 판매가 금지될 수 있고, 규정은 바뀔 수 있으니 현지에서 확인하세요.</li>' +
        '<li><b>라운드 후 수분 먼저</b> — 땡볕 라운드 뒤에는 물·전해질음료를 먼저 마시고 맥주는 천천히. 라운드 중 카트 운전은 음주 금지예요.</li>' +
        '<li><b>주문 요령</b> — 병은 쿠앗(ขวด), 캔은 끄라뽕(กระป๋อง). 차갑게 받으려면 "옌옌(เย็นๆ)", 얼음은 "남캥(น้ำแข็ง)".</li>' +
        '</ul>', false) +
      '<h3 class="th-h">🗣️ 맥주 주문 한마디 · 눌러서 들어보세요</h3><ul class="th-list">' +
      BEER_SAY.map(b => `<li class="th-row"><div class="th-ko">${esc(b[2])}</div><div class="th-mean">${esc(b[1])}</div><div class="th-btns">${playBtn(b[0], '')}</div></li>`).join('') + '</ul>' +
      '<button class="wn-close" id="thBeerQuiz" type="button" style="margin-top:12px">🍺 맥주 상식 퀴즈 (5문제)</button>';
  }

  // ── 퀴즈 (한마디 / 숫자 / 맥주) ──
  function build(kind){
    qkind = kind;
    if(kind === 'phrase'){
      qs = shuffle(items).slice(0,5).map(it => {
        const pick = rnd(it.th)[0];
        const others = shuffle(items.filter(o => o !== it && o.short !== it.short)).map(o => o.short);
        const seen = new Set([it.short]); const d = []; for(const x of others){ if(!seen.has(x)){ seen.add(x); d.push(x); } if(d.length === 3) break; }
        return { th:pick, a:it.short, opts:shuffle([it.short, ...d]), e:`${it.k} = ${it.mean}` };
      });
    } else if(kind === 'num'){
      const pool = shuffle([3,5,8,10,12,15,20,25,30,45,50,60,75,100,120,150,200,250,350,500,1000,1500,2000,2500]).slice(0,5);
      qs = pool.map(n => {
        const o = numTh(n), cand = shuffle([n+10, n>10?n-10:n+20, n*10, n>=10?Math.round(n/10):n+1, n+1, n>1?n-1:n+2, n>=20 ? (n%10 ? n : n+5) : n+3]);
        const d = []; for(const c of cand){ if(c !== n && c > 0 && !d.includes(c)) d.push(c); if(d.length === 3) break; }
        return { th:o.t + 'บาท', a:fmt(n) + '바트', opts:shuffle([n, ...d]).map(x => fmt(x) + '바트'), e:`${o.t} (${o.k}) = ${fmt(n)}` };
      });
    } else {
      qs = shuffle(BEER_Q).slice(0,5).map(b => ({ th:'', q:b.q, a:b.a, opts:shuffle([b.a, ...b.d]), e:'' }));
    }
    qi = 0; score = 0;
  }
  const titleOf = k => k === 'phrase' ? '들려주세요' : k === 'num' ? '요금을 들려주세요' : '';
  function renderQ(){
    answered = false; nextBtn.hidden = true; cur = qs[qi];
    const audio = qkind !== 'beer';
    pane.innerHTML = `<div class="th-q"><div class="th-mean">문제 ${qi+1}/${qs.length} · 현재 ${score}점</div>` +
      (audio ? `<button class="th-listen" type="button" id="thListen">🔊 ${voice ? titleOf(qkind) : '다시 보기'}</button><div class="th-big" id="thBig" lang="th">${voice ? '' : esc(cur.th)}</div>` : `<p class="tq-q" style="margin:10px 2px 14px">${esc(cur.q)}</p><div id="thBig" hidden></div>`) +
      `<div class="th-opts">${cur.opts.map((o,i) => `<button class="tq-opt" type="button" data-i="${i}">${esc(o)}</button>`).join('')}</div><p class="tq-fb" id="thFb"></p></div>`;
    if(audio && voice) say(cur.th);
  }
  function renderRes(){
    const r = rec(qkind); r.plays++; r.best = Math.max(r.best, score); save();
    const msg = score === qs.length ? (qkind === 'beer' ? '맥주 박사! 건배는 "차이요" 🍻' : '완벽해요! 현지에서 바로 통하겠는데요 🇹🇭') : score >= 3 ? '좋아요! 한 번만 더 보면 완벽해요 🎧' : '탭에서 한 번 더 보고 다시 도전해봐요 🗣️';
    nextBtn.hidden = true;
    pane.innerHTML = `<div class="tq-res"><div class="tq-score">${score}<small>/${qs.length}</small></div><p class="tq-msg">${msg}</p><p class="tq-rec">최고 기록 ${r.best}/${qs.length} · 도전 ${r.plays}회</p><button class="wn-close th-again" type="button">🔁 다시 도전</button></div>`;
  }
  function setMode(m){
    mode = m; tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === m))); syncTabs();
    if(m === 'list') renderList(); else if(m === 'nums') renderNums(); else if(m === 'beer') renderBeer(); else { build('phrase'); renderQ(); }
  }
  tabsEl.innerHTML = '<button class="wh-tab" role="tab" type="button" data-id="list" aria-selected="true">📖 한마디</button><button class="wh-tab" role="tab" type="button" data-id="quiz" aria-selected="false">🎧 퀴즈</button><button class="wh-tab" role="tab" type="button" data-id="nums" aria-selected="false">🔢 숫자</button><button class="wh-tab" role="tab" type="button" data-id="beer" aria-selected="false">🍺 맥주</button>';
  const syncTabs = wireTabs(tabsEl, pane); pane.setAttribute('role', 'tabpanel'); syncTabs();
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(b){ haptic('tap'); setMode(b.dataset.id); } });
  pane.addEventListener('click', e => {
    const pl = e.target.closest('[data-say]');
    if(pl){ haptic('tap'); const ok = say(pl.dataset.say);
      if(ok){ pane.querySelectorAll('.on').forEach(x => x.classList.remove('on')); pl.classList.add('on'); setTimeout(() => pl.classList.remove('on'), 1600); } return; }
    if(e.target.closest('#thNumQuiz')){ haptic('tap'); build('num'); renderQ(); return; }
    if(e.target.closest('#thBeerQuiz')){ haptic('tap'); build('beer'); renderQ(); return; }
    if(e.target.closest('.th-again')){ haptic('tap'); build(qkind); renderQ(); return; }
    if(e.target.closest('#thListen')){ haptic('tap'); if(voice) say(cur.th); else $('thBig').textContent = cur.th; return; }
    const b = e.target.closest('.tq-opt'); if(!b || answered) return;
    answered = true; const right = cur.opts[+b.dataset.i] === cur.a; if(right) score++;
    pane.querySelectorAll('.tq-opt').forEach(x => { x.disabled = true; const o = cur.opts[+x.dataset.i]; if(o === cur.a) x.classList.add('ok'); else if(x === b) x.classList.add('no'); });
    if(qkind !== 'beer') $('thBig').textContent = cur.th;
    $('thFb').innerHTML = right ? `<b>정답! ✅</b> ${esc(cur.e)}` : `<b>땡! ❌</b> 정답은 “${esc(cur.a)}” ${cur.e ? '— ' + esc(cur.e) : ''}`;
    haptic(right ? 'ok' : 'strong');
    nextBtn.textContent = qi+1 < qs.length ? '다음 →' : '결과 보기'; nextBtn.hidden = false; nextBtn.focus({preventScroll:true});
  });
  nextBtn.addEventListener('click', () => { haptic('tap'); qi++; if(qi < qs.length) renderQ(); else renderRes(); });
  window.__thaiInfo = () => ({ num:numTh, phrases:items.length, beerQ:BEER_Q.length });
  function open(){
    prevFocus = document.activeElement; pickVoice(); setMode('list');
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    const f = scrim.querySelector('.th-play'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    try{ synth && synth.cancel(); }catch(e){}
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(()=>{ scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openThai = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, .th-play, .th-num, summary, #thNumQuiz, #thBeerQuiz, #thListen, .tq-opt:not(:disabled), .th-again, #thNext:not([hidden]), #thClose')].filter(x => x.tabIndex >= 0);
    const cur2 = f.indexOf(document.activeElement), n = f.length;
    if(cur2 === -1 || (!e.shiftKey && cur2 === n-1) || (e.shiftKey && cur2 === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();
