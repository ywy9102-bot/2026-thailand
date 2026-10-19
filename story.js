/* 지연 로딩 조각(읽어보는 카드): app.js의 로더가 필요할 때 불러옴. 홈 화면의 "오늘의 이야기" 제목은 app.js가 맡아요 */
// ── 읽어보는 카드: 태국 이야기 + 대동여지도 슬라이드쇼(방콕 맛집·볼거리, 파타야 맛집) + 한 줄 소개 모음 ──
(function(){
  const scrim = $('storyScrim'); if(!scrim) return;
  const card = $('syCard'), sub = $('sySub'), prevBtn = $('syPrev'), nextBtn = $('syNext'), autoBtn = $('syAuto'), viewBtn = $('syView'), closeBtn = $('syClose'), nav = $('syNav'), decksEl = $('syDecks');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const STORY = [["🏙️", "방콕의 진짜 이름은 엄청 길어요", "방콕의 정식 이름(끄룽 텝 마하 나콘…)은 세계에서 가장 긴 수도 이름으로 알려져 있어요. 현지에서는 줄여서 \"끄룽텝\"(천사의 도시)이라고 불러요.", "12/26부터 머무는 도시예요. 택시 기사님께 \"끄룽텝\"이라고 하면 알아들어요.", "도시·역사"], ["💚", "에메랄드 불상은 옷을 갈아입어요", "왓 프라깨우의 에메랄드 불상은 계절에 맞춰 옷을 갈아입히는 의식이 있어요. 작은 불상이라 높은 곳에 모셔져 있어요.", "12/28 왕궁 코스의 첫 번째 볼거리예요. 어깨·무릎을 가리고 가세요.", "사원"], ["😴", "왓 포의 와불은 길이 46m", "왓 포의 누워 있는 부처님은 길이 약 46m, 높이 약 15m예요. 발바닥에는 108가지 길상 무늬가 자개로 새겨져 있어요.", "12/28 왕궁에서 도보 5분. 발바닥 무늬는 꼭 가까이서 보세요.", "사원"], ["🌅", "왓 아룬은 \"새벽\"이라는 뜻", "왓 아룬의 \"아룬\"은 새벽을 뜻해요. 중앙 탑에는 도자기 조각이 촘촘히 붙어 있어서 햇빛에 반짝여요.", "12/28 마지막 코스. 강 건너에서 보는 일몰이 특히 예뻐요.", "사원"], ["🦀", "푸팟퐁 커리를 유명하게 만든 집", "게를 카레 가루와 달걀로 볶은 푸팟퐁 커리는 쏨분 시푸드가 대중화한 요리로 알려져 있어요. 달걀이 들어가 순하고 고소해요.", "12/26(반탓통·수라웡)과 12/30(센트럴월드) 저녁에 먹을 후보예요.", "음식"], ["🥭", "망고 찰밥은 코코넛 밀크의 맛", "따뜻한 찰밥에 코코넛 밀크를 얹고 잘 익은 망고를 곁들인 디저트예요. 달콤·고소·짭짤함이 한 접시에 있어요.", "왓 포 근처 꼬 파니치에서 먹어볼 만해요. 망고 품질은 계절에 따라 달라요.", "음식"], ["🍲", "똠얌꿍은 허브의 맛", "레몬그라스·갈랑가·라임잎을 넣어 새콤하고 매콤하게 끓인 새우 수프예요. 맑은 국물과 우유를 넣은 진한 국물 두 가지가 있어요.", "맵기가 걱정이면 \"마이 펫\"(안 맵게)이라고 해보세요.", "음식"], ["🍜", "팟타이는 나라가 키운 국민 음식", "1930~40년대에 정부가 쌀국수 요리를 장려하면서 팟타이가 국민 음식이 됐다고 해요. 땅콩·숙주·라임을 곁들여 먹어요.", "카오산 근처 팁싸마이와 팟타이 파이타루에서 비교해 보세요.", "음식"], ["🙏", "인사는 두 손을 모아서", "\"와이\"는 두 손을 가슴 앞에 모으는 인사예요. 손이 높을수록 존경이 커서 어른께는 코 높이쯤에서 합니다. 어른이 먼저 하시는 게 예의예요.", "\"사와디 캅(남자)/카(여자)\"를 같이 해보세요.", "예절"], ["🧑‍🦳", "머리는 높게, 발은 낮게", "태국에서는 머리를 신성하게 여겨 아이 머리도 함부로 쓰다듬지 않아요. 발은 낮은 곳이라 발로 물건을 가리키거나 불상 쪽으로 뻗지 않아요.", "사원에서 앉을 때 발바닥이 불상을 향하지 않게 하세요.", "예절"], ["👑", "왕실에 대한 존중", "태국에서는 왕실에 대한 존중이 매우 커요. 돈에 있는 왕의 얼굴을 밟거나 가볍게 말하는 건 큰 실례예요.", "떨어진 동전을 발로 밟아 잡지 마세요.", "예절"], ["🛺", "툭툭 이름은 엔진 소리에서", "세 바퀴 택시 \"툭툭\"은 엔진 소리를 흉내 낸 이름이라고 해요. 미터기가 없어서 타기 전에 요금을 정해야 해요.", "관광지 앞에서는 그랩·볼트 호출이 더 편하고 가격도 미리 보여요.", "일상"], ["🐘", "코끼리는 태국의 상징", "태국 코끼리는 나라를 상징하는 동물이에요. 옛 국기에도 흰 코끼리가 있었고 지금도 기념품·장식에서 많이 보여요.", "기념품 가게의 코끼리 바지·장식을 눈여겨보세요.", "문화"], ["🏖️", "파타야는 어촌이었어요", "파타야는 작은 어촌이었다가 1960년대 미군 휴양지로 알려지면서 지금의 해변 도시로 커졌다고 해요.", "12/16~12/26 머무는 곳이에요. 통부라 빌라에서 바다까지 이동을 계획해 보세요.", "도시·역사"], ["⛳", "골프 천국 태국", "태국은 골프장이 많고 캐디가 한 명씩 붙어 코스를 안내해 주는 곳이 많아요. 겨울(건기)이 골프하기 좋은 시기예요.", "12/17부터 라운드가 이어져요. 캐디 팁은 현금(밧)으로 준비하세요.", "골프·날씨"], ["🌤️", "12월은 여행하기 좋은 계절", "12~1월은 비가 적고 상대적으로 선선한 건기예요. 한낮엔 여전히 덥지만 아침저녁은 지내기 편해요.", "사원 투어는 오전 일찍, 한낮엔 쇼핑몰에서 쉬는 일정이 좋아요.", "골프·날씨"], ["🎆", "새해 카운트다운은 강변과 쇼핑가에서", "방콕 새해 카운트다운은 센트럴월드와 아이콘시암 같은 곳에서 큰 행사가 열려요. 자정 불꽃놀이가 하이라이트예요.", "12/31 일정에 두 곳이 후보로 들어 있어요. 인파가 많으니 일찍 가세요.", "도시·역사"], ["🏪", "편의점이 정말 많아요", "태국에는 세븐일레븐 같은 편의점이 곳곳에 있어서 물·간식·간단한 음식을 쉽게 살 수 있어요.", "생수는 편의점에서 사 마시고, 수돗물은 마시지 마세요.", "일상"], ["🚤", "짜오프라야 강이 방콕의 길", "방콕 한가운데를 흐르는 짜오프라야 강에는 보트와 나룻배가 다녀요. 왓 포 쪽 타 띠안에서 왓 아룬으로 건너는 나룻배는 몇 밧이에요.", "12/28 코스에서 타 띠안 나룻배를 타 보세요.", "일상"], ["💐", "꽃시장은 밤에도 열려요", "팍클렁딸랏 꽃시장은 24시간 열려 있고 한밤~새벽이 가장 활기차다고 해요. 낮에는 한적하게 구경할 수 있어요.", "왕궁·왓 아룬 코스 중간에 잠깐 들르기 좋아요.", "일상"], ["💆", "마사지는 태국의 일상", "전통 마사지는 가게마다 가격이 달라요. 마사지를 받고 나서 마사지사에게 작은 팁을 주는 문화가 있어요.", "왓 포는 마사지 본원으로 유명해요. 장모님 코스 후보예요.", "문화"], ["🧭", "태국은 불교의 나라", "대부분의 국민이 불교 신자이고 아침에 스님께 음식을 올리는 풍경을 볼 수 있어요. 사원에서는 조용히, 복장은 단정하게 해요.", "스님께는 여성이 직접 물건을 건네지 않는 게 예의예요.", "문화"], ["🍺", "싱하 맥주의 사자", "태국 대표 맥주 \"싱하\"는 신화 속 사자에서 이름을 땄어요. 라벨에도 사자가 그려져 있고, 이 밖에 창(코끼리 로고)·레오 같은 맥주가 흔해요.", "라운드 후 클럽하우스나 저녁 식사에서 시원한 맥주 한 잔 하기 좋아요. 과음은 다음 날 라운드에 주의하세요.", "음식"], ["🥗", "쏨땀은 매운 파파야 샐러드", "덜 익은 파파야를 절구에 찧어 라임·피시소스·고추로 버무린 쏨땀은 이산(동북부) 지방의 대표 음식이에요. 찹쌀밥이나 구운 닭고기와 자주 먹어요.", "맵게 먹기 어렵다면 주문할 때 \"마이 펫\"(안 맵게)이라고 말하세요.", "음식"], ["🌶️", "맵기를 말로 조절하는 법", "\"마이 펫\"은 안 매워요, \"펫 닛너이\"는 조금 매워요라는 뜻이에요. 태국 음식은 고추를 아낌없이 쓰는 경우가 많아서 말해 두는 게 좋아요.", "아이들·장모님과 함께 먹을 때 꼭 써보세요.", "음식"], ["🍢", "무삥은 길거리 돼지고기 꼬치", "달콤짭짤하게 양념해 숯불에 구운 돼지고기 꼬치 \"무삥\"은 아침부터 노점에서 팔아요. 찰밥과 함께 먹는 경우가 많아요.", "카오산이나 야시장에서 간식으로 도전해 보세요.", "음식"], ["🥤", "주황색 아이스 밀크티", "\"차 옌\"은 진한 홍차에 연유를 넣은 주황색 아이스 밀크티예요. 아주 달아서 처음에는 덜 달게 달라고 하는 분이 많아요.", "로티 마타바에서 로티와 함께 마셔 보세요.", "음식"], ["🥞", "로티는 인도 이민자의 영향", "얇게 편 반죽을 구운 \"로티\"는 인도·무슬림 문화의 영향을 받은 음식이에요. 바나나와 연유를 넣은 달콤한 로티가 길거리에서 인기예요.", "프라아팃의 오래된 로티 가게(카림 로티 마타바)를 지도에서 찾아보세요.", "음식"], ["🍗", "닭밥 하나로 줄 서는 집", "닭고기를 삶은 육수로 지은 밥에 닭고기를 얹은 \"카오만가이\"는 가장 흔한 한 그릇 음식이에요. 한 그릇이 몇십 밧일 만큼 저렴한 집도 있어요.", "GCP 근처 고앙 빠뚜남 치킨라이스가 대표적이에요.", "음식"], ["🧾", "메뉴판의 \"++\"는 세금·봉사료", "가격 뒤에 ++가 붙어 있으면 봉사료 약 10%와 부가세 7%가 따로 붙는다는 뜻이에요. 표시 가격에 약 1.18을 곱하면 실제 금액에 가까워요.", "대동여지도의 식당 카드마다 \"부가세·봉사료\" 표기를 적어 두었어요.", "일상"], ["💸", "팁은 의무가 아니에요", "식당에서 이미 봉사료가 붙어 있으면 따로 팁을 더 주지 않아도 돼요. 마사지나 골프 캐디, 짐을 들어준 분께는 소액의 팁을 주는 문화가 있어요.", "캐디 팁용으로 작은 단위 현금(밧)을 챙기세요.", "일상"], ["🚇", "방콕은 지상철·지하철이 편해요", "도로가 자주 막히는 방콕에서는 BTS(지상철)와 MRT(지하철)가 시간 맞추기에 좋아요. 시암, 아속, 프롬퐁 같은 구간에 쇼핑몰이 이어져 있어요.", "오크우드(프롬퐁 근처)와 터미널21(아속) 사이도 BTS로 이동할 수 있어요.", "일상"], ["🚕", "택시는 앱으로 부르면 편해요", "그랩·볼트 같은 앱을 쓰면 목적지를 영어로 입력하고 가격을 미리 볼 수 있어요. 대동여지도에는 영문 주소 복사 버튼이 있어요.", "목록 카드의 \"영문 주소 복사\"를 눌러 앱에 붙여넣으세요.", "일상"], ["🧥", "쇼핑몰은 정말 시원해요", "방콕의 쇼핑몰과 식당은 냉방이 강한 곳이 많아서 한낮엔 더워도 안에서는 춥게 느껴질 수 있어요.", "얇은 겉옷을 하나 챙기면 좋아요.", "일상"], ["☀️", "햇빛이 강해요", "건기라도 한낮의 햇빛은 강해요. 모자·선크림·물을 챙기고 한낮에는 실내에서 쉬는 일정이 좋아요.", "사원 투어는 오전 일찍, 오후엔 쇼핑몰이나 카페에서 쉬세요.", "골프·날씨"], ["🔌", "전기와 시차 상식", "태국은 한국보다 2시간 느려요. 전압은 220V로 한국과 같고, 콘센트 모양이 달라 보일 수 있어서 멀티 어댑터가 있으면 안심이에요.", "항공권 시각이 한국 시간인지 현지 시간인지 확인하세요.", "일상"], ["📅", "태국 달력은 불기", "태국은 불교 달력(불기)을 함께 써요. 서기에 543을 더하면 불기가 돼요. 올해(2026년)는 불기 2569년이에요.", "영수증이나 공문서에 2569가 보이면 올해 날짜예요.", "문화"], ["🎶", "하루에 두 번 국가가 나와요", "태국의 공공장소에서는 오전 8시와 오후 6시에 국가가 나오기도 해요. 그때 멈춰 서서 예의를 표하는 사람들을 볼 수 있어요.", "역이나 공원에서 음악이 나오면 잠시 멈춰 서면 좋아요.", "문화"], ["🥄", "숟가락으로 먹는 태국 식사", "태국에서는 포크로 음식을 숟가락에 올려 숟가락으로 먹는 게 기본이에요. 젓가락은 주로 국수에 써요.", "숟가락과 포크를 받으면 그렇게 써 보세요.", "예절"], ["💬", "마이뺀라이는 \"괜찮아요\"", "\"마이 뺀 라이\"는 \"괜찮아요, 신경 쓰지 마세요\"라는 뜻으로 태국 사람들이 자주 써요. 작은 실수에도 너그러운 분위기를 보여 주는 말이에요.", "태국어 놀이에도 이 표현을 모아 두었어요.", "문화"], ["🙌", "고맙다는 말은 \"컵쿤\"", "\"컵쿤 캅(남자)/카(여자)\"는 고맙습니다예요. 식당·마사지·택시에서 한마디만 해도 분위기가 좋아져요.", "웃는 얼굴과 함께 말해 보세요.", "문화"], ["🧭", "주소 읽는 법: 쏘이와 타논", "\"쏘이\"는 큰길에서 갈라진 골목, \"타논\"은 큰길이에요. 수쿰윗 쏘이 24는 수쿰윗 길에서 24번째 골목이라는 뜻이에요.", "오크우드 스위트가 수쿰윗 쏘이 24에 있어요.", "일상"], ["🏙️", "마하나콘은 픽셀 건물", "마하나콘 타워는 건물 외벽이 픽셀처럼 파여 있어서 멀리서도 눈에 띄는 방콕의 고층 건물이에요. 전망대에는 유리 바닥이 있어요.", "12/30 Plan B로 일몰 전망을 노려 보세요(입장료가 비싼 편이에요).", "도시·역사"], ["🧵", "짐 톰슨은 실크로 유명한 사람", "미국 출신 사업가 짐 톰슨은 태국 실크를 세계에 알렸어요. 1967년 말레이시아에서 산책 중 실종된 일로도 유명해요.", "12/27 Plan B 또는 12/30 Plan C로 짐 톰슨 하우스를 보세요.", "도시·역사"], ["🙏", "에라완 사당은 소원의 장소", "에라완 사당은 힌두 신(브라흐마)을 모신 곳으로, 소원이 이뤄지면 전통 무용을 공양하는 모습을 볼 수 있어요. 쇼핑가 한복판에 있어요.", "GCP에서 걸어서 갈 수 있어요. 12/31은 매우 붐벼요.", "문화"], ["🏺", "아유타야는 옛 수도", "아유타야는 오랫동안 태국의 수도였던 도시예요. 왓 마하탓의 나무뿌리 속 불상 머리가 유명해요.", "1/1 Plan B(아유타야 당일 투어) 후보예요.", "도시·역사"], ["🌺", "차 거울에 걸린 꽃 화환", "택시·툭툭의 백미러에 걸린 꽃 화환(푸앙말라이)은 안전과 행운을 비는 장식이에요. 시장에서 파는 화환을 불상에 올리기도 해요.", "택시를 탈 때 눈여겨보세요.", "문화"], ["🦎", "벽에서 우는 도마뱀", "호텔이나 식당 벽에서 \"쯧쯧\" 소리를 내며 도는 작은 도마뱀(찡쪽)이 흔한데 사람에게 해가 없어요. 모기를 잡아먹는다고도 해요.", "객실에서 보더라도 놀라지 마세요.", "일상"], ["🎄", "12월 말 쇼핑몰은 축제 분위기", "태국의 쇼핑몰들은 크리스마스·새해 장식을 크게 하고 카운트다운 행사를 준비해요. 센트럴월드와 아이콘시암이 대표적이에요.", "12/30~31 센트럴월드·GCP 근처는 인파가 늘 수 있어요.", "도시·역사"], ["⛳", "방콕 골프일은 새벽 출발", "방콕 쪽 라운드(12/29 니칸티, 12/31 로열 방파인)는 새벽 5시~5시 30분에 숙소에서 출발하는 일정이에요. 이른 티오프가 더위를 피하기 좋아요.", "전날 일찍 주무시고 스트레칭 놀이도 써 보세요.", "골프·날씨"], ["🏌️", "파타야 골프장들", "파타야에서는 치찬, 롤링힐스, 플랜테이션, 워터사이드, 피닉스골드 등에서 라운드해요. 왕복밴이 숙소 앞으로 와요.", "12/17·18·21·22·23·24 라운드 일정이 있어요.", "골프·날씨"]];
  const DECKS = [['today','오늘의 추천'],['story','태국 이야기'],['bkk','방콕 맛집'],['bkks','방콕 볼거리'],['pat','파타야 맛집']];
  const GE = {육:'🥩',해:'🦐',천:'🌇',양:'🍝',아:'🍜',노:'🥢',고:'🍽️',한:'🍲',볼:'🎡'};
  const SE = {grandpalace:'🏛️',watpho:'😴',watarun:'🌅',khaosan:'🎒',phrasumen:'🏰',iconsiam:'🛍️',joddfairs:'🌙',asiatique:'🎡',chatuchak:'🧺',jimthompson:'🧵',mahanakhon:'🏙️',erawanshrine:'🙏',centralworld:'🎆',lumphini:'🌳',yaowarat:'🏮',sealife:'🐠',bacc:'🖼️',flowermarket:'💐',talatnoi:'🎨'};
  const LSS = 'thai2026_story'; let pos = {}; try{ const v = JSON.parse(localStorage.getItem(LSS)); pos = v && typeof v === 'object' ? v : {}; }catch(e){}
  let deck = 'story', mode = 'card', timer = null, prevFocus = null, tx = null, items = [];
  const firstSent = t => { const m = String(t).match(/^[^.]*\./); return m ? m[0] : t; };
  const dayNo = () => { const k = new Date(Date.now() + 9 * 36e5); return Math.floor(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()) / 864e5); };
  function make(deck){
    if(deck === 'story'){ return STORY.map(c => ({e:c[0], t:c[1], b:c[2], trip:c[3], tag:c[4], one:firstSent(c[2])})); }
    let d = null; try{ d = window.__foodMapData(); }catch(e){}
    if(!d) return [];
    const city = deck === 'pat' ? 'pat' : 'bkk', list = deck === 'bkks' ? d.bkk.S : d[city].R;
    return list.map(r => ({e: r.sight ? (SE[r.id] || '🎡') : (GE[r.g] || '🍴'), t:r.ko, sub:r.en, tag:r.kind, b:(r.pros || []).slice(0, 2).join('\n'), meta:[r.price, r.star && r.star !== '—' ? '★ ' + r.star : '', r.hrs && r.sight ? r.hrs : ''].filter(Boolean).join(' · '),
      flags:[r.badge ? '🏅 ' + r.badge : '', r.val ? '💸 가성비' : '', r.must ? '📌 꼭 가볼 곳' : '', r.insta ? '📸 인스타 추천' : ''].filter(Boolean), trip:r.tip, one:(r.pros || [])[0] || r.kind, id:r.id, city}));
  }
  // 오늘의 추천: 날짜(한국 시간)로 매일 바뀌는 4장 — 이야기·방콕 맛집·방콕 볼거리·파타야 맛집
  function today(){
    const day = dayNo();
    return [['story', '오늘의 이야기', 1], ['bkk', '오늘의 방콕 맛집', 3], ['bkks', '오늘의 방콕 볼거리', 5], ['pat', '오늘의 파타야 맛집', 7]].map(([k, l, m]) => {
      const a = make(k); if(!a.length) return null; const it = a[(day * m) % a.length];
      return Object.assign({}, it, {tag: l + (it.tag ? ' · ' + it.tag : '')});
    }).filter(Boolean);
  }
  function build(){ items = deck === 'today' ? today() : make(deck); }
  const idx = () => Math.min(pos[deck] || 0, Math.max(0, items.length - 1));
  function save(){ try{ localStorage.setItem(LSS, JSON.stringify(pos)); }catch(e){} }
  function renderDecks(){ decksEl.innerHTML = DECKS.map(([k, n]) => `<button class="sy-chip" type="button" data-deck="${k}" aria-pressed="${k === deck}">${n}</button>`).join(''); }
  function render(){
    const list = mode === 'list';
    nav.hidden = list; autoBtn.hidden = list; viewBtn.textContent = list ? '🃏 카드로 보기' : '📃 한 줄 모음';
    if(!items.length){ sub.textContent = ''; card.innerHTML = '<p class="st-b">내용을 불러오지 못했어요. 새로고침 후 다시 열어주세요.</p>'; return; }
    if(list){
      sub.textContent = `한 줄 소개 ${items.length}개 · 누르면 카드로 열려요`;
      card.innerHTML = `<ul class="sy-list">${items.map((it, i) => `<li><button class="sy-li" type="button" data-i="${i}"><span class="sy-le" aria-hidden="true">${it.e}</span><span class="sy-lt"><b>${esc(it.t)}</b><span>${esc(it.one)}</span></span></button></li>`).join('')}</ul>`;
      card.scrollTop = 0; return;
    }
    const i = idx(), c = items[i];
    sub.textContent = `${i + 1} / ${items.length} · 넘겨서 읽어보세요`;
    card.innerHTML = `<div class="st-e" aria-hidden="true">${c.e}</div>` + (c.tag ? `<p class="st-tag">${esc(c.tag)}</p>` : '') + `<h3 class="st-t">${esc(c.t)}</h3>` + (c.sub ? `<p class="st-en">${esc(c.sub)}</p>` : '') +
      (c.flags && c.flags.length ? `<p class="st-flags">${c.flags.map(f => `<span>${esc(f)}</span>`).join('')}</p>` : '') + `<p class="st-b">${esc(c.b)}</p>` + (c.meta ? `<p class="st-meta">${esc(c.meta)}</p>` : '') +
      `<p class="st-trip"><b>이번 여행에서는</b> ${esc(c.trip)}</p>` + (c.id ? `<button class="st-go" type="button" data-go="${c.id}">🗺️ 지도에서 보기</button>` : '');
    card.scrollTop = 0;
  }
  function go(d){ pos[deck] = (idx() + d + items.length) % items.length; save(); render(); haptic('tap'); }
  function setAuto(on){
    if(timer){ clearInterval(timer); timer = null; }
    autoBtn.setAttribute('aria-pressed', String(on)); autoBtn.textContent = on ? '⏸ 멈추기' : '▶ 자동 넘김';
    if(on) timer = setInterval(() => go(1), 9000);
  }
  function setDeck(k){ deck = k; mode = 'card'; setAuto(false); build(); renderDecks(); render(); }
  decksEl.addEventListener('click', e => { const b = e.target.closest('[data-deck]'); if(!b) return; haptic('tap'); setDeck(b.dataset.deck); const f = decksEl.querySelector(`[data-deck="${deck}"]`); if(f) try{ f.focus({preventScroll:true}); }catch(err){} });
  viewBtn.addEventListener('click', () => { haptic('tap'); setAuto(false); mode = mode === 'list' ? 'card' : 'list'; render(); });
  card.addEventListener('click', e => {
    const li = e.target.closest('.sy-li'); if(li){ pos[deck] = +li.dataset.i; save(); mode = 'card'; haptic('tap'); render(); try{ nextBtn.focus({preventScroll:true}); }catch(err){} return; }
    const g = e.target.closest('[data-go]'); if(g){ const it = items.find(x => x.id === g.dataset.go); close(); if(it && typeof window.__foodMapFocus === 'function') setTimeout(() => window.__foodMapFocus(it.city, it.id), 60); }
  });
  prevBtn.addEventListener('click', () => { setAuto(false); go(-1); });
  nextBtn.addEventListener('click', () => { setAuto(false); go(1); });
  autoBtn.addEventListener('click', () => { haptic('tap'); setAuto(autoBtn.getAttribute('aria-pressed') !== 'true'); });
  card.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
  card.addEventListener('touchend', e => { if(tx == null || mode === 'list') return; const dx = e.changedTouches[0].clientX - tx; tx = null; if(Math.abs(dx) > 50){ setAuto(false); go(dx < 0 ? 1 : -1); } }, {passive:true});
  window.__storyInfo = () => ({ deck, n: items.length, idx: idx(), mode });
  function open(){
    prevFocus = document.activeElement; pos.today = 0; setDeck('today');
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ nextBtn.focus({preventScroll:true}); }catch(e){}
  }
  function close(){
    if(scrim.hidden) return;
    setAuto(false);
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openStory = open;
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
  addEventListener('keydown', e => {
    if(scrim.hidden) return;
    if(e.key === 'Escape') close();
    else if(mode === 'card' && e.key === 'ArrowRight'){ setAuto(false); go(1); } else if(mode === 'card' && e.key === 'ArrowLeft'){ setAuto(false); go(-1); }
  });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.sy-chip, #syCard, .sy-li, [data-go], #syPrev, #syNext, #syAuto, #syView, #syClose')].filter(x => x.offsetParent !== null), cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();
