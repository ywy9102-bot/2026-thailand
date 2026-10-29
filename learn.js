// ── 학습·기대 모듈(태국 역사·공부, 여행 예고편): play.js에서 분리해 눌렀을 때 불러와요 ──
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
  let view = 'list', ci = 0, flip = false;   // 연표 보기 방식(목록·카드)

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
  // [연표 제목, 같은 때 우리나라 한 줄] — 연표의 "같은 때 우리나라" 글을 줄였어요 (새 내용 없음)
  const KR_PAIRS = [
    ['수코타이 왕국','몽골에 맞서 수도를 강화도로 옮긴 고려'], ['치앙마이와 란나 왕국','원나라의 간섭을 받던 충렬왕 때의 고려'], ['아유타야 왕국','공민왕이 고려 왕이 됨'],
    ['나라의 틀을 세우다','세종대왕이 한글(훈민정음)을 만듦'], ['유럽 사람이 찾아왔어요','조선 중종 때, 삼포왜란'], ['나레수안 대왕과 독립','임진왜란과 이순신 장군'],
    ['아유타야가 무너졌어요','영조가 탕평책을 펼침'], ['방콕 시대의 시작','정조가 규장각을 세우고 수원 화성을 쌓음'], ['보링 조약','조선 철종 임금 때'],
    ['라마 5세 (출라롱꼰 대왕)','강화도 조약부터 한일병합까지'], ['프랑스와의 위기','동학농민운동과 갑오개혁'], ['태국의 첫 철도','한국 최초의 철도 경인선 개통'],
    ['제1차 세계대전에 참전','3·1운동과 대한민국 임시정부'], ['입헌혁명','이봉창·윤봉길 의사의 의거'], ['나라 이름이 바뀌었어요','창씨개명 강요'],
    ['제2차 세계대전','8월 15일 광복'], ['푸미폰 국왕 (라마 9세)','미군정을 거쳐 대한민국 정부 수립'], ['한국전쟁과 태국','6·25 전쟁과 정전협정'],
    ['한국과 태국의 수교','이승만 대통령 시절'], ['파타야가 커졌어요','한국군의 베트남 파병'], ['바트 위기','IMF 외환위기'], ['지금의 왕','3·1운동·임시정부 100주년'],
  ].map(([t, l]) => ({ e: TIMELINE.find(r => r[1] === t), l })).filter(x => x.e && yearOf(x.e));
  // 같은 때가 아닌(30년 넘게 떨어진) 한국 일을 오답으로 써서 헷갈리지 않게 해요
  function matchQs(n){
    return shuffle(KR_PAIRS).slice(0, n).map(x => {
      const far = KR_PAIRS.filter(y => y !== x && y.l !== x.l && Math.abs(yearOf(y.e) - yearOf(x.e)) >= 30);
      return { q: `태국의 "${x.e[1]}"(${x.e[0]}). 같은 때 우리나라에서는 무슨 일이 있었을까요?`, opts: shuffle([x.l, ...shuffle(far).slice(0, 3).map(y => y.l)]), a: x.l, why: x.e[4] };
    });
  }
  const makeKrRound = () => matchQs(QN);
  const makeRound = () => shuffle(shuffle(QUIZ).slice(0, QN - 3).map(([q, a, w, why]) => ({ q, opts: shuffle([a, ...w]), a, why })).concat(orderQs(2), matchQs(1)));
  let qz = null;
  function startDaily(){ qz = { qs: dailyRound(), i: 0, score: 0, picked: null, daily: true }; haptic('tap'); paintQuiz(); const f = body.querySelector('.hq-opt'); if(f) f.focus({preventScroll:true}); }
  const qMsg = s => s === QN ? '모두 맞혔어요! 태국 역사 박사예요' : s >= QN - 2 ? '대단해요! 거의 다 맞혔어요' : s >= 3 ? '좋아요! 연표를 읽고 다시 도전해 보세요' : '연표를 한 번 읽고 다시 도전해 봐요';
  function paintQuiz(){
    if(!qz){
      const done = dDone(), st = dStreak();
      body.innerHTML = `<div class="hq"><h3 class="hq-q">태국 역사 퀴즈</h3><p class="hs-b">연표와 여행지 이야기에서 문제를 내요. 풀고 나면 왜 그런지 바로 알려 줘요.</p>` +
        (done ? `<p class="hq-day">🎯 오늘의 한 문제를 ${dq.ok ? '맞혔어요' : '풀었어요'}${st > 1 ? ` · 연속 ${st}일` : ''}. 내일 새 문제가 나와요.</p>` : `<button class="hq-go" type="button" data-act="daily">🎯 오늘의 한 문제${st ? ` · 연속 ${st}일 이어가기` : ''}</button>`) +
        `${qBest ? `<p class="hq-best">6문제 최고 기록 ${qBest}/${QN}</p>` : ''}<button class="${done ? 'hq-go' : 'hq-alt'}" type="button" data-act="start">${QN}문제 퀴즈 시작하기</button><button class="hq-alt" type="button" data-act="kr">🇰🇷 같은 때 우리나라 맞히기</button></div>`;
    } else if(qz.i >= qz.qs.length && qz.daily){
      const st = dStreak();
      body.innerHTML = `<div class="hq"><h3 class="hq-q">${qz.score ? '오늘의 한 문제, 정답이에요!' : '오늘의 한 문제를 풀었어요'}</h3><p class="hs-b">${st > 1 ? `연속 ${st}일째예요. ` : ''}내일 새 문제가 나와요.</p><button class="hq-go" type="button" data-act="start">${QN}문제 퀴즈 하기</button><button class="hq-alt" type="button" data-act="read">연표 보러 가기</button></div>`;
    } else if(qz.i >= qz.qs.length){
      const nb = qz.score > qBest;
      body.innerHTML = `<div class="hq"><h3 class="hq-q">${qz.score} / ${QN} 맞혔어요</h3><p class="hs-b">${qMsg(qz.score)}</p><p class="hq-best">${nb ? '새 최고 기록이에요!' : `내 최고 기록 ${qBest}/${QN}`}</p><button class="hq-go" type="button" data-act="${qz.kr ? 'kr' : 'start'}">다시 하기</button><button class="hq-alt" type="button" data-act="${qz.kr ? 'start' : 'kr'}">${qz.kr ? '섞어서 6문제 풀기' : '🇰🇷 같은 때 우리나라 맞히기'}</button><button class="hq-alt" type="button" data-act="read">연표 보러 가기</button></div>`;
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
    const vb = e.target.closest('[data-view]');
    if(vb && body.contains(vb)){ view = vb.dataset.view; haptic('tap'); paint(); const f = body.querySelector(`[data-view="${view}"]`); if(f) f.focus({ preventScroll: true }); return; }
    const nv = e.target.closest('[data-nav]');
    if(nv && body.contains(nv)){ cardGo(+nv.dataset.nav, `[data-nav="${nv.dataset.nav}"]`); return; }
    if(body.contains(e.target) && (e.target.closest('[data-flip]') || e.target.closest('#hcFace'))){ cardFlip(e.target.closest('[data-flip]') ? '[data-flip]' : null); return; }
    const lk = e.target.closest('.hs-link');
    if(lk && body.contains(lk)){ mode = lk.dataset.go; if(mode === 'time') view = 'list'; haptic('tap'); paint(); jump(lk.dataset.t); return; }
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
    if(b.dataset.act === 'kr'){ qz = { qs: makeKrRound(), i: 0, score: 0, picked: null, kr: true }; haptic('tap'); paintQuiz(); const f = body.querySelector('.hq-opt'); if(f) f.focus({preventScroll:true}); return; }
    if(b.dataset.act === 'start'){ qz = { qs: makeRound(), i: 0, score: 0, picked: null }; haptic('tap'); paintQuiz(); const f = body.querySelector('.hq-opt'); if(f) f.focus({preventScroll:true}); return; }
    if(b.dataset.act === 'daily'){ startDaily(); return; }
    if(b.dataset.act === 'read'){ mode = 'time'; haptic('tap'); paint(); return; }
    if(b.dataset.act === 'next'){
      qz.i++; qz.picked = null; haptic('tap');
      if(qz.i >= qz.qs.length && !qz.daily && qz.score === QN) cel({ kicker: '🎉 만점', msg: '6문제를 모두 맞혔어요!', petals: true, n: 30, spread: 130, ms: 3600 });
      if(qz.i >= qz.qs.length && !qz.daily && !qz.kr && qz.score > qBest){ qBest = qz.score; try{ localStorage.setItem(LSQ, String(qBest)); }catch(err){} haptic('ok'); }
      paintQuiz(); const f = body.querySelector('.hq-opt, .hq-go'); if(f) f.focus({preventScroll:true}); return;
    }
    if(b.dataset.k != null && qz && qz.picked == null){
      const c = qz.qs[qz.i]; qz.picked = +b.dataset.k;
      if(c.opts[qz.picked] === c.a){
        qz.score++; qz.run = (qz.run || 0) + 1; haptic(qz.run >= 2 ? 'combo' : 'ok');
        if(qz.daily && !dDone()) cel({ n: 10, spread: 70, petals: true, at: b, dy: 6 });
      } else { qz.run = 0; haptic('wrong'); }
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
  const viewBar = () => `<div class="hs-view" role="group" aria-label="연표 보기 방식"><button type="button" data-view="list" aria-pressed="${view === 'list'}">📃 목록으로</button><button type="button" data-view="card" aria-pressed="${view === 'card'}">🃏 카드로</button></div>`;
  // 목록 맨 위에 붙어 다니는 연도 롤러: 스크롤하면 지금 보는 항목의 연도로 숫자가 넘어가요
  let rollIdx = -1, rollTick = 0;
  function roll(force){
    if(mode !== 'time' || view !== 'list') return;
    const bar = body.querySelector('.hs-roll'); if(!bar) return;
    const items = body.querySelectorAll('.hs-item'); if(!items.length) return;
    const top = body.getBoundingClientRect().top + bar.offsetHeight + 16;
    let idx = 0; if(body.scrollTop > 4) items.forEach((it, k) => { if(it.getBoundingClientRect().top <= top) idx = k; });
    if(!force && idx === rollIdx) return;
    const y = bar.querySelector('.hs-roll-y'), r = TIMELINE[idx], dir = idx >= rollIdx ? 1 : -1;
    rollIdx = idx;
    y.textContent = yearOf(r) ? yearOf(r) + '년' : r[0];
    bar.querySelector('.hs-roll-n').textContent = `${idx + 1} / ${TIMELINE.length}`;
    y.style.setProperty('--dy', (dir * 10) + 'px'); y.classList.remove('hs-roll-go'); void y.offsetWidth; y.classList.add('hs-roll-go');
  }
  body.addEventListener('scroll', () => { if(rollTick) return; rollTick = requestAnimationFrame(() => { rollTick = 0; roll(); }); }, { passive: true });
  // 카드로 보기: 앞면은 태국 이야기, 뒷면은 같은 때 우리나라
  function paintCard(){
    const r = TIMELINE[ci], N = TIMELINE.length;
    const front = `<p class="hs-year">${esc(r[0])}</p><h3 class="hs-t">${esc(r[1])}</h3><p class="hs-b">${esc(r[2])}</p>${r[3] ? `<p class="hs-trip"><b>🧳 이번 여행</b> ${esc(r[3])}</p>` : ''}`;
    const back = `<p class="hs-year">${esc(r[0])}</p><h3 class="hs-t">🇰🇷 같은 때 우리나라</h3><p class="hs-b">${esc(r[4])}</p><p class="hs-src">태국: ${esc(r[1])}</p>`;
    body.innerHTML = `${viewBar()}<div class="hc"><p class="hc-prog">${ci + 1} / ${N}</p><div class="hc-face${flip ? ' back' : ''}" id="hcFace" role="group" aria-label="${flip ? '같은 때 우리나라 면' : '태국 이야기 면'}" aria-live="polite">${flip ? back : front}</div>` +
      `<div class="hc-nav"><button type="button" data-nav="-1">◀ 이전</button><button type="button" data-flip="1">↻ 뒤집기</button><button type="button" data-nav="1">다음 ▶</button></div><p class="hc-hint">카드를 눌러도 뒤집혀요 · 좌우로 밀어서 넘겨요</p></div>`;
    body.scrollTop = 0; syncTabs();
  }
  function cardGo(d, sel){
    ci = (ci + d + TIMELINE.length) % TIMELINE.length; flip = false; haptic('tap'); paintCard();
    const f = body.querySelector('#hcFace'); f.style.setProperty('--dx', (d > 0 ? 28 : -28) + 'px'); f.classList.add('hc-in');
    const b = sel && body.querySelector(sel); if(b) b.focus({ preventScroll: true });
  }
  function cardFlip(sel){
    flip = !flip; haptic('tap'); paintCard(); body.querySelector('#hcFace').classList.add('hc-turn');
    const b = sel && body.querySelector(sel); if(b) b.focus({ preventScroll: true });
  }
  let sx = 0, sy = 0, sw = false;
  body.addEventListener('touchstart', e => { sw = !!e.target.closest('.hc'); if(sw){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
  body.addEventListener('touchend', e => {
    if(!sw) return; sw = false; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) cardGo(dx < 0 ? 1 : -1, null);
  }, { passive: true });
  body.addEventListener('keydown', e => {
    if(mode !== 'time' || view !== 'card' || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault(); cardGo(e.key === 'ArrowRight' ? 1 : -1, e.target.dataset && e.target.dataset.nav ? `[data-nav="${e.target.dataset.nav}"]` : null);
  });
  function paint(){
    tabsEl.querySelectorAll('.wh-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === mode)));
    if(mode === 'quiz'){ paintQuiz(); return; }
    if(mode === 'time' && view === 'card'){ paintCard(); return; }
    let rows = '';
    if(mode === 'time') rows = TIMELINE.map(r => item(r[0], r[1], r[2], r[3], '🧳 이번 여행', r[4])).join('');
    else if(mode === 'sight') rows = SIGHTS.map(r => item('', r[0], r[1], r[2], '💡').replace(/<\/li>$/, readBtn(r[0]) + '</li>')).join('');
    else rows = BASICS.map(r => item('', r[0], r[1], r[2], '💡')).join('');
    body.innerHTML = `${mode === 'time' ? `${viewBar()}<div class="hs-roll" aria-hidden="true"><span class="hs-roll-y"></span><span class="hs-roll-n"></span></div>` : ''}${mode === 'sight' ? `<p class="hs-prog">${readLine()}</p>` : ''}<ol class="hs-list">${rows}</ol><p class="hs-src">한국민족문화대백과사전, 우리역사넷, 위키백과, 브리태니커 같은 자료를 맞춰 보고 쉽게 풀어 쓴 거예요. 자료마다 다른 부분은 "전해져요", "알려져 있어요", "자료마다 달라요"로 적었어요.</p>`;
    body.scrollTop = 0; syncTabs(); if(mode === 'time') roll(true);
  }
  tabsEl.innerHTML = TABS.map(([id, l]) => `<button class="wh-tab" role="tab" type="button" data-id="${id}" aria-selected="${id === mode}">${l}</button>`).join('');
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.wh-tab'); if(!b) return; mode = b.dataset.id; haptic('tap'); paint(); });
  window.__historyInfo = () => ({ time: TIMELINE.length, sights: SIGHTS.length, basics: BASICS.length, quiz: QUIZ.length, kr: KR_PAIRS.length });
  let prevFocus = null;
  function open(m, t){
    prevFocus = document.activeElement;
    if(typeof m === 'string' && TABS.some(x => x[0] === m)) mode = m;
    if(t && mode === 'time') view = 'list';
    if(mode === 'quiz' && t === 'daily' && !dDone()) qz = { qs: dailyRound(), i: 0, score: 0, picked: null, daily: true };
    paint();
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on');
    try{ tabsEl.querySelector('[aria-selected="true"]').focus({preventScroll:true}); }catch(e){}
    roll(true);
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
  onKey(e => { if(e.key==='Escape' && !scrim.hidden) close(); });
  scrim.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const f = [...scrim.querySelectorAll('.wh-tab, #hsBody, #hsClose')].filter(x => x.tabIndex >= 0);
    const cur = f.indexOf(document.activeElement), n = f.length;
    if(cur === -1 || (!e.shiftKey && cur === n-1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n-1 : 0].focus(); }
  });
})();

// ── 여행 예고편: 18일을 한 장씩 넘겨 보며 기대를 키워요 (일정 데이터를 그대로 써요, 새 내용 없음) ──
(function(){
  const scrim = $('trailerScrim'); if(!scrim) return;
  const bars = $('trBars'), stage = $('trStage'), cnt = $('trCount'), prevB = $('trPrev'), nextB = $('trNext'), playB = $('trPlay'), closeB = $('trClose');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const MS = 7500, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 장면 사진: Wikimedia Commons 파일을 작은 크기로 연결해서 보여줘요 (집안 내부용). 못 불러오면 이모지 화면으로 바뀌어요.
  // [파일 이름, 사진 설명] — 실제 그 장소가 아니라 분위기를 보여 주는 사진은 "(분위기 사진)"이라고 적어요
  const GOLF_A = ['Royal_Hua_Hin_-_Par_3_5th_hole.jpg', '태국 골프장 (분위기 사진)'], GOLF_B = ['Santiburi_golf.jpg', '태국 골프장 (분위기 사진)'];
  const AIR = ['Suvarnabhumi_Airport_Terminal_Building_Departures_Level.jpg', '수완나품 공항'];
  const PHOTOS = {
    intro: ['Wat_Arun_from_Chao_Phraya_River_at_sunset.jpg', '방콕 왓 아룬의 해 질 녘'], outro: ['Sunset_on_Koh_Larn_-_panoramio_(1).jpg', '꼬란섬의 해 질 녘'],
    '12/16': AIR, '12/17': ['Khao_Chi_Chan_Amphoe_Sattahip_by_Don_Ramey_Logan.jpg', '카오치찬 (골프장 근처 명소)'], '12/18': GOLF_A, '12/19': ['Koh_Larn,Thailand.jpg', '꼬란섬'],
    '12/20': ['Sanctuary_of_Truth_Pattaya.jpg', '파타야 명소 (분위기 사진)'], '12/21': GOLF_B, '12/22': GOLF_A, '12/23': GOLF_B, '12/24': GOLF_A,
    '12/25': ['Pattaya,_Thailand_Skyline.jpg', '파타야 (분위기 사진)'], '12/26': ['Chao_Phraya_River_from_CAT_building_(8134954465).jpg', '방콕 짜오프라야강 (분위기 사진)'], '12/27': AIR,
    '12/28': ['Grand_Palace_Bangkok.jpg', '방콕 왕궁'], '12/29': GOLF_A, '12/30': ['CentralWorld.JPG', '센트럴월드'], '12/31': ['Bang_Pa-In_Royal_Palace_-_Bang_Pa-In.jpg', '방파인 궁전 (골프장 가까운 곳)'],
    '1/1': ['Nightshot_At_The_Chao_Phraya_River_(221664677).jpeg', '짜오프라야강 야경 (분위기 사진)'], '1/2': AIR,
  };
  const photoUrl = f => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f) + '?width=720';
  const photoHtml = (key, emo) => { const ph = PHOTOS[key]; if(!ph) return `<p class="tr-emo" aria-hidden="true">${emo}</p>`; return `<figure class="tr-photo"><img src="${photoUrl(ph[0])}" alt="사진: ${esc(ph[1])}" referrerpolicy="no-referrer" decoding="async"><span class="tr-badge" aria-hidden="true">${emo}</span><figcaption class="tr-cap">📷 ${esc(ph[1])} · Wikimedia Commons</figcaption></figure>`; };
  const LSH = 'thai2026_trhearts'; let hearts; try{ hearts = JSON.parse(localStorage.getItem(LSH)); }catch(e){} hearts = Array.isArray(hearts) ? hearts : [];
  const saveH = () => { try{ localStorage.setItem(LSH, JSON.stringify(hearts)); }catch(e){} if(typeof window.__dqRefresh === 'function') window.__dqRefresh(); };
  const days = () => [].concat(ITIN_A.map(x => ({ ...x, k: '12/' + x.d, m: 12 })), ITIN_B.map(x => ({ ...x, k: '12/' + x.d, m: 12 })), ITIN_C.filter(x => x.d !== '4').map(x => ({ ...x, k: '1/' + x.d, m: 1 })));
  const kToday = () => { const k = new Date(Date.now() + 9 * 36e5); return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); };
  const D = 864e5, START = Date.UTC(2026, 11, 16), END = Date.UTC(2027, 0, 2);
  function intro(){
    const t = kToday(), n = Math.round((START - t) / D);
    const line = n > 0 ? `출발까지 D-${n} · 잠 ${n}번` : t <= END ? (n === 0 ? '오늘 출발해요!' : `여행 ${-n + 1}일차예요`) : '다시 보는 우리 여행';
    return `${photoHtml('intro', '🎬')}<h3 class="tr-h">2026 태국 가족여행 예고편</h3><p class="tr-sub">${line}</p><p class="tr-note">3가족 9명 · 파타야 12/16~26 · 방콕 12/26~1/2<br>밀어서 넘기거나 아래 버튼을 눌러 보세요. 기대되는 날에는 ♥를 눌러 두세요</p>`;
  }
  let list = [], idx = 0, playing = !RM, timer = 0, prevFocus = null;
  const total = () => list.length + 2;
  function dayHtml(x){
    const kind = /→/.test(x.l) ? 'mv' : x.l === '파타야' ? 'pat' : 'bkk', place = kind === 'mv' ? '🚐 이동' : kind === 'pat' ? '🏝️ 파타야' : '🏙️ 방콕';
    const t = new Date(kToday()), isToday = t.getUTCMonth() + 1 === x.m && String(t.getUTCDate()) === x.d && t.getUTCFullYear() === (x.m === 12 ? 2026 : 2027);
    const on = hearts.includes(x.k);
    return { kind, html: `<p class="tr-date">${x.m}/${x.d} (${esc(x.w)})${isToday ? ' · 오늘' : ''}</p>${photoHtml(x.k, esc(x.e))}<h3 class="tr-h">${esc(x.t)}</h3><p class="tr-sub">${place}</p>${x.rec ? `<p class="tr-note">${esc(x.rec)}</p>` : ''}<button class="tr-heart" type="button" data-k="${esc(x.k)}" aria-pressed="${on}">${on ? '♥' : '♡'} 기대돼요</button>` };
  }
  function outro(){
    const picked = list.filter(x => hearts.includes(x.k));
    return `${photoHtml('outro', '🌴')}<h3 class="tr-h">${picked.length ? `기대되는 날 ${picked.length}일` : '기대되는 날을 골라 보세요'}</h3>` +
      (picked.length ? `<ul class="tr-picks">${picked.map(x => `<li>♥ ${x.m}/${x.d} ${esc(x.t)}</li>`).join('')}</ul>` : '<p class="tr-note">앞 장면에서 ♥를 누르면 여기에 모여요</p>') + '<p class="tr-sub">곧 만나요, 태국!</p>';
  }
  function draw(){
    const n = total(); let kind = 'intro', html;
    if(idx === 0) html = intro(); else if(idx === n - 1){ html = outro(); kind = 'intro'; } else { const d = dayHtml(list[idx - 1]); html = d.html; kind = d.kind; }
    stage.className = 'tr-stage tr-' + kind; stage.innerHTML = `<div class="tr-slide">${html}</div>`;
    const im = stage.querySelector('.tr-photo img'); if(im) im.addEventListener('error', () => im.parentNode.classList.add('fail'));
    if(idx + 1 < n){   // 다음 장면 사진을 미리 받아 둬요
      const nph = PHOTOS[idx + 1 === n - 1 ? 'outro' : list[idx].k];
      if(nph){ const pre = new Image(); pre.referrerPolicy = 'no-referrer'; pre.src = photoUrl(nph[0]); }
    }
    cnt.textContent = `${idx + 1} / ${n}`;
    bars.innerHTML = Array.from({ length: n }, (_, i) => `<i class="tr-bar${i < idx ? ' done' : ''}${i === idx ? ' cur' : ''}"><b></b></i>`).join('');
    bars.style.setProperty('--tr-ms', MS + 'ms'); bars.classList.toggle('paused', !playing);
    stage.setAttribute('aria-live', playing ? 'off' : 'polite');   // 자동으로 넘어가는 동안은 화면 낭독기가 계속 읽지 않게
    playB.textContent = playing ? '⏸ 멈춤' : '▶ 자동'; playB.setAttribute('aria-label', playing ? '자동 넘김 멈추기' : '자동으로 넘기기');
    clearTimeout(timer);
    if(playing && idx < n - 1) timer = setTimeout(() => go(1, true), MS); else if(playing){ playing = false; draw0(); }
    if(idx === n - 1 && !RM && typeof window.__celebrate === 'function' && !outro.done){ outro.done = true; window.__celebrate({ n: 16, spread: 110, petals: true, at: stage, dy: 30, haptic: 'ok' }); }
  }
  function draw0(){ playB.textContent = '▶ 자동'; playB.setAttribute('aria-label', '처음부터 자동으로 넘기기'); bars.classList.add('paused'); }
  function go(d, auto){
    const n = total(), j = idx + d; if(j < 0 || j > n - 1) return;
    idx = j; if(!auto) haptic('tap'); draw();
  }
  function openT(){
    list = days(); outro.done = false; prevFocus = document.activeElement; playing = !RM;
    const t = kToday(); idx = 0;
    if(t >= START && t <= END){ const k = new Date(t), key = `${k.getUTCMonth() + 1}/${k.getUTCDate()}`, i = list.findIndex(x => x.k === key); if(i >= 0) idx = i + 1; }
    draw(); scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    void scrim.offsetHeight; scrim.classList.add('on'); try{ nextB.focus({ preventScroll: true }); }catch(e){}
  }
  function closeT(){
    if(scrim.hidden) return; clearTimeout(timer);
    scrim.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, 340);
    try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
    haptic('tap');
  }
  window.__openTrailer = openT;
  window.__trailerInfo = () => ({ days: days().length, hearts: hearts.length });
  prevB.addEventListener('click', () => go(-1)); nextB.addEventListener('click', () => go(1));
  playB.addEventListener('click', () => { if(!playing && idx >= total() - 1) idx = 0; playing = !playing; haptic('tap'); draw(); });
  closeB.addEventListener('click', closeT);
  scrim.addEventListener('click', e => { if(e.target === scrim) closeT(); });
  stage.addEventListener('click', e => {
    const b = e.target.closest('.tr-heart'); if(!b) return;
    const k = b.dataset.k, on = !hearts.includes(k);
    hearts = on ? hearts.concat(k) : hearts.filter(x => x !== k); saveH();
    b.setAttribute('aria-pressed', String(on)); b.textContent = (on ? '♥' : '♡') + ' 기대돼요'; b.classList.toggle('pop', on); haptic(on ? 'ok' : 'tap');
    if(on && !RM && typeof window.__celebrate === 'function') window.__celebrate({ n: 7, spread: 60, petals: true, at: b, dy: 6, haptic: 'tap' });
  });
  let held = false;   // 장면을 누르고 있는 동안은 자동 넘김을 잠깐 멈춰요
  const hold = on => { if(!playing || scrim.hidden) return; if(on && !held){ held = true; clearTimeout(timer); bars.classList.add('paused'); } else if(!on && held){ held = false; draw(); } };
  stage.addEventListener('pointerdown', e => { if(!e.target.closest('.tr-heart')) hold(true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => stage.addEventListener(t, () => hold(false)));
  let sx = 0, sy = 0;
  stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => { const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); }, { passive: true });
  onKey(e => {
    if(scrim.hidden) return;
    if(e.key === 'Escape') closeT(); else if(e.key === 'ArrowRight') go(1); else if(e.key === 'ArrowLeft') go(-1);
    else if(e.key === 'Tab'){
      const f = [...scrim.querySelectorAll('button')].filter(x => x.tabIndex >= 0 && !x.disabled), n = f.length, cur = f.indexOf(document.activeElement);
      if(cur === -1 || (!e.shiftKey && cur === n - 1) || (e.shiftKey && cur === 0)){ e.preventDefault(); f[e.shiftKey ? n - 1 : 0].focus(); }
    }
  });
})();
