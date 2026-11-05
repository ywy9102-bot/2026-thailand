#!/usr/bin/env python3
"""방콕·파타야 중심 오늘의 태국 소식 5개를 골라 news.json으로 만들어요 (무료·규칙 기반).

- 구글 뉴스 한국어 RSS를 여러 검색어로 받아서, 날씨·환율·골프·교통·중요한 속보를 점수로 골라요.
- 인공지능 요약은 쓰지 않아요. 제목·매체·링크만 담아요.
- 사용: python3 scripts/build-news.py --out news.json      (GitHub Actions가 매일 실행)
       python3 scripts/build-news.py --selftest             (고르는 규칙 확인, 인터넷 필요 없음)
"""
import argparse, html, json, re, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

# (검색어, 기간) — 구글 뉴스 검색 문법(OR, when:)을 써요
QUERIES = [
    '방콕 OR 파타야 속보 when:2d',
    '방콕 OR 파타야 사고 OR 시위 OR 폭발 OR 사망 OR 경보 OR 테러 OR 화재 when:3d',
    '방콕 OR 파타야 날씨 OR 폭우 OR 폭염 OR 태풍 OR 홍수 OR 호우 OR 우기 when:3d',
    '태국 바트 환율 when:3d',
    '태국 여행경보 OR 특별여행주의보 OR 외교부 OR 안전공지 OR 입국 when:7d',
    '태국 경제 OR 물가 OR 관광세 OR 입국료 OR 항공권 OR 관광객 when:7d',
    '방콕 OR 파타야 골프 when:7d',
    '태국 골프 when:7d',
    '방콕 OR 수완나품 OR 돈므앙 공항 OR 항공 OR 결항 OR 지연 when:3d',
    '파타야 when:2d',
    '방콕 when:2d',
]
PLACE = re.compile(r'방콕|파타야|태국|수완나품|돈므앙|타이랜드|바트')
TARGET = re.compile(r'방콕|파타야|사타힙|촌부리|수완나품|돈므앙')            # 이번 여행 지역
FAR = re.compile(r'푸껫|푸켓|치앙마이|치앙라이|사무이|끄라비|핫야이|후아힌|코팡안|남부|북부|이산')   # 여행 지역이 아닌 곳
BLOCK_SRC = {'Vietnam.vn', 'IndexBox', '판다랭크'}                                          # 번역·자동 생성 느낌이 강한 곳
FEATURE = re.compile(r'\[글로벌 pick\]|기적|인생|화제|스토리|이야기|맛집|후기|추천|꿀팁')   # 소식이 아니라 읽을거리
NOT_CITY = re.compile(r'방콕\s*(문서|선언|합의|회의|포럼|프로세스|협약|성명|원칙|결의|공동선언)')   # 도시가 아니라 문서·회의 이름으로 쓰인 "방콕"
FEATURE2 = re.compile(r'투어|팁|가성비|매력|로컬|진짜|세계테마기행|구석구석')   # 골프 밖 분야에서는 홍보성 여행 읽을거리로 봄
OFFTOPIC = re.compile(r'학과|대학교|수료|졸업|훈련센터|파크골프|코스메틱|화장품|인-코스|인종차별|김치맨|관중|감독|우승|준우승|\d+위|마스터스|아마골프|대표팀')   # "골프"·"코스"가 들어 있어도 골프장 소식이 아님
RELEVANT = re.compile(r'여행|관광|항공|공항|입국|출국|비자|여권|한국인|교민|호텔|리조트|날씨|안전|교통|환전|택시|지하철|철도|렌터카')   # 일반 소식은 여행과 닿는 말이 있을 때만
PROMO = re.compile(r'회원권|프로모션|특가|분양|출시|할인|패키지|이벤트|출발\s*확정|핫플|\d성\s*호텔|\d+박\s*\d+일\s*(일정|여행)\s*(제안|추천)|관광청.{0,20}(제안|추천|소개|선정)')   # 상품·회원권·관광 홍보 기사는 골프 소식이어도 빼요
STORM = re.compile(r'낙뢰|벼락|번개|폭염|열사병')   # 골프장 안전에 닿는 말은 지역이 달라도 참고가 되므로 남겨요
EVENT = re.compile(r'새로 연|새로 오픈|신규 오픈|그랜드 오픈|개관|발대식|성료|협약|출범|탐방단|개최|오픈식|론칭')   # 기업·단체 행사 홍보
SLANG = re.compile(r'방콕\s*(하면|하다|하고|족|생활)|집콕|이정후|MLB|락아웃')   # "방콕"이 도시가 아니라 "집에 틀어박힘" 속어로 쓰인 기사
GOV = re.compile(r'해병대|사령관|국방|군사|정상회담|외교장관|대사 ')
CRIME = re.compile(r'살인|살해|피살|강도|절도|소매치기|사기|마약|성폭행|성범죄|성추행|체포|구속|검거|납치|흉기|총격|범죄|밀수|도박|폭행|실종')   # 범죄 기사는 빼요
NOISE = re.compile(r'NCT|콘서트|관객|팬미팅|월드투어|영상 확산|조회\s*\d|USDT|USDC|스테이블|토큰|블록체인|암호화폐|가상화폐|비트코인|코인|Binance|게임쇼|게임스컴|전시회|박람회|화보|드레스룩|공항패션|민니|축구|야구|농구|배구|연예|아이돌|팬미팅|드라마|걸그룹|가수|영화|K-?팝|BTS|주가|증시|코스피|부동산|분양|채용|모집')
CATS = [  # (id, 정규식, 기본 점수) — 위에서부터 먼저 맞는 것으로 분류
    ('breaking', re.compile(r'속보|사망|숨져|폭발|테러|시위|쿠데타|계엄|화재|붕괴|추락|대피|지진|공항\s*폐쇄'), 6),
    ('safety',   re.compile(r'여행경보|여행금지|특별여행주의보|여행주의보|외교부|영사|안전공지|안전\s*유의|입국\s*(금지|제한|규제)'), 5),
    ('weather',  re.compile(r'날씨|폭우|호우|폭염|태풍|홍수|침수|기온|우기|건기|미세먼지|스콜|열대성|기상|경보'), 4),
    ('fx',       re.compile(r'환율|바트|물가|환전'), 3),
    ('econ',     re.compile(r'경제|관광세|입국료|항공권|유가|금리|성장률|물가'), 2),
    ('golf',     re.compile(r'골프|라운드|티오프|그린피|캐디'), 4),
    ('travel',   re.compile(r'공항|항공|결항|지연|운항|수완나품|돈므앙|입국|비자|면세|교통|도로|열차|지하철'), 3),
]
CAP = {'breaking': 3}   # 한 종류가 너무 많이 몰리지 않게 (나머지는 2개)
UA = {'User-Agent': 'Mozilla/5.0 (compatible; thai2026-news/1.0)'}


def feed_url(q):
    return 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': q, 'hl': 'ko', 'gl': 'KR', 'ceid': 'KR:ko'})


def fetch(q, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(feed_url(q), headers=UA), timeout=20) as r:
                return r.read()
        except Exception as e:
            print(f'  받기 실패({i + 1}/{tries}) {q}: {e}', file=sys.stderr); time.sleep(2 * (i + 1))
    return None


def parse(xml_bytes):
    out = []
    for it in ET.fromstring(xml_bytes).iter('item'):
        title = html.unescape((it.findtext('title') or '').strip())
        src_el = it.find('source'); src = (src_el.text or '').strip() if src_el is not None and src_el.text else ''
        if src and title.endswith(' - ' + src): title = title[:-(len(src) + 3)].strip()
        elif ' - ' in title and not src: title, src = title.rsplit(' - ', 1)
        try: ts = parsedate_to_datetime(it.findtext('pubDate')).astimezone(timezone.utc)
        except Exception: continue
        link = (it.findtext('link') or '').strip()
        if title and link: out.append({'title': title, 'src': src, 'url': link, 'ts': ts})
    return out


def norm(t): return re.sub(r'[^0-9A-Za-z가-힣 ]', ' ', t).lower().split()


def similar(a, b):
    x, y = set(norm(a)), set(norm(b))
    if not (x and y): return False
    if len({t for t in x & y if len(t) >= 4}) >= 2: return True   # 같은 회사·행사 이름이 둘 이상 겹치면 같은 기사로 봐요
    return len(x & y) / len(x | y) >= 0.5


def classify(title):
    for cid, rx, base in CATS:
        if rx.search(title): return cid, base
    return 'news', 1


def score(item, now, hits):
    cid, base = classify(item['title'])
    s = base + (3 if re.search(r'방콕|파타야', item['title']) else 1 if '태국' in item['title'] else 0)
    if FAR.search(item['title']) and not TARGET.search(item['title']): s -= 4
    if FEATURE.search(item['title']): s -= 3
    if cid != 'golf' and FEATURE2.search(item['title']): s -= 3
    if cid == 'news' and GOV.search(item['title']): s -= 3
    age = (now - item['ts']).total_seconds() / 3600
    s += 3 if age < 6 else 2 if age < 24 else 1 if age < 48 else 0
    return cid, s + max(0, hits - 1)


def select(items, now, n=5):
    seen = {}   # 같은 기사(링크) 묶기
    for it in items:
        k = it['url']
        if k in seen: seen[k]['hits'] += 1
        else: seen[k] = {**it, 'hits': 1}
    pool = []
    for it in seen.values():
        if it['src'] in BLOCK_SRC or it['title'].endswith(' - 뉴스 및 통계') or NOT_CITY.search(it['title']): continue
        if CRIME.search(it['title']) or OFFTOPIC.search(it['title']) or SLANG.search(it['title']) or PROMO.search(it['title']): continue
        if not PLACE.search(it['title']) or (NOISE.search(it['title']) and '골프' not in it['title']): continue
        if (now - it['ts']).total_seconds() > 72 * 3600: continue
        cid, s = score(it, now, it['hits'])
        if cid == 'breaking' and not TARGET.search(it['title']): continue   # 속보도 방콕·파타야 기사만 ("폭발한" 같은 비유 표현 방지)
        if cid == 'golf' and not TARGET.search(it['title']) and not STORM.search(it['title']): continue   # 방콕·파타야 밖 골프장 소식(나콘사완 등)은 빼요
        if cid in ('news', 'econ') and s < 6: continue
        if cid == 'fx' and s < 5: continue
        if cid == 'news' and (not TARGET.search(it['title']) or not RELEVANT.search(it['title']) or EVENT.search(it['title'])): continue   # 일반 소식은 방콕·파타야 기사 중 점수가 충분한 것만(억지로 5개를 채우지 않아요)
        pool.append({**it, 'cat': cid, 'score': s})
    pool.sort(key=lambda x: (-x['score'], -x['ts'].timestamp()))
    picked, per_src, per_cat = [], {}, {}
    def ok(x, strict):
        if any(similar(x['title'], p['title']) for p in picked): return False
        if per_src.get(x['src'], 0) >= 2: return False
        return not strict or per_cat.get(x['cat'], 0) < CAP.get(x['cat'], 2)
    # 먼저 속보·날씨·안전·환율·골프·경제에서 하나씩(있으면) 골라 주제가 고르게 들어가게 해요
    for cid in ('breaking', 'weather', 'safety', 'fx', 'golf', 'econ'):
        for x in pool:
            if len(picked) >= n: break
            if x['cat'] == cid and (cid in ('fx', 'safety', 'econ') or TARGET.search(x['title'])) and ok(x, False):
                picked.append(x); per_src[x['src']] = per_src.get(x['src'], 0) + 1; per_cat[cid] = per_cat.get(cid, 0) + 1; break
    for strict in (True, False):
        for x in pool:
            if len(picked) >= n: break
            if x in picked or not ok(x, strict): continue
            picked.append(x); per_src[x['src']] = per_src.get(x['src'], 0) + 1; per_cat[x['cat']] = per_cat.get(x['cat'], 0) + 1
    picked.sort(key=lambda x: (-x['score'], -x['ts'].timestamp()))   # 가장 중요한 소식이 맨 위
    return picked


def build(items, now):
    kst = now + timedelta(hours=9)
    pk = select(items, now)
    return {'updated': now.isoformat(timespec='seconds'), 'date': kst.strftime('%Y-%m-%d'),
            'items': [{'cat': p['cat'], 'title': p['title'], 'src': p['src'], 'url': p['url'], 'ts': p['ts'].isoformat(timespec='seconds')} for p in pk]}


def selftest():
    now = datetime(2026, 12, 20, 0, 0, tzinfo=timezone.utc)
    def mk(title, src, h, u=None): return {'title': title, 'src': src, 'url': u or 'https://x/' + title, 'ts': now - timedelta(hours=h)}
    items = [
        mk('방콕 도심 시위 속보, 일부 도로 통제', '연합뉴스', 1), mk('파타야 해변 폭우로 침수 피해', '뉴시스', 2), mk('방콕 수완나품 공항 항공편 줄줄이 결항', '뉴스1', 3),
        mk('태국 바트 환율 5년 만에 최저', '한국경제', 5), mk('파타야 골프장 그린피 올랐다', '골프저널', 8), mk('방콕 시위 속보 도로 통제 중', 'YTN', 1.5),
        mk('방콕 사고 사망 소식', '연합뉴스', 2), mk('방콕 맛집 추천', '블로그', 4), mk('태국 대표팀 축구 승리', '스포츠', 1), mk('방콕 폭발 사고 부상', '연합뉴스', 4),
        mk('300㎏ 환자 긴급 이송 작전 방콕의 기적 [글로벌 pick]', '한국경제TV', 6), mk('태국 푸껫 갑작스러운 홍수 발생', '연합뉴스', 2), mk('방콕 직항 소식', 'Vietnam.vn', 1), mk('해병대사령관 방콕 방문', '연합뉴스', 3),
        mk('‘방콕 문서’와 DMZ가 묻는 생태 평화의 길', '가톨릭뉴스', 2), mk('아세안 방콕 선언 채택', '연합뉴스', 3),
        mk('외교부 태국 여행경보 상향 안내', '뉴시스', 4), mk('태국 경제 성장률 전망 하향', '한국경제', 7), mk('방콕서 한국인 관광객 소매치기 피해', '연합뉴스', 2), mk('파타야 한국인 마약 체포', '뉴스1', 2), mk('Binance CZ 방콕 블록체인 위크 참석', 'TU', 3), mk('태국 관광객, USDT를 바트로 바꿔 QR 결제', '토큰포스트', 3), mk('아이들 민니, 방콕이 발칵 드레스룩', 'Daum', 2), mk('게임스컴 아시아 태국게임쇼 개막', 'NSP통신', 2),
        mk('바스프, 인-코스메틱스 아시아 2026 방콕 참가', '주간신문', 2), mk('파크T 태국 파크골프빌리지 수출', '뷰어스', 2), mk('환율 내려 더 매력적인 태국 가성비 투어', '복지저널', 1), mk('진짜 방콕이 궁금해? 구석구석 가성비 투어 팁', '뉴스버즈', 1), mk('세계테마기행 태국 로컬 여행 관광객', '뉴스컬처', 2),
        mk('“김치맨” 조롱에 폭발한 박항서 감독, 태국 관중과 충돌', '데일리안', 1), mk('손제이 아태 아마골프 20위 태국 라오팍디 마스터스행', '톱스타뉴스', 2),
        mk('NCT 127, 일본에서 방콕 10만 관객 동원 콘서트', '비즈엔터', 2), mk('태국 노점상 칼로 발톱 손질 영상 확산 관광객 조회 82만회', '스페셜타임스', 2), mk('관광객은 줄고 객실은 늘고 태국 호텔 폐업 급증', '이데일리', 3),
        mk('하루 방콕하면 1억 증발 2027시즌 MLB 락아웃 이정후', '매니아리포트', 1), mk('아이랩미디어, 방콕 아이뮤지엄 개관 해외 전시 사업', '미디어데일', 2), mk('아이랩미디어, 방콕에 실감형 아이뮤지엄 열었다', '뉴스피어', 3), mk('추계예대 방콕 탐방단 발대식 개최', '한국대학신문', 2), mk('고은자락, 방콕서 한복 K-뷰티 문화교류 성료', '시민행정신문', 2),
        mk('오래된 방콕 소식', '연합뉴스', 100), mk('서울 부동산 소식', '연합뉴스', 1), mk('방콕 날씨 폭염 경보', '연합뉴스', 3, 'https://x/dup'), mk('방콕 날씨 폭염 경보', '연합뉴스', 3, 'https://x/dup'),
    ]
    items += [mk('[출발확정] 방콕/아유타야 5일 아유타야고대유적지 방콕 5성호텔 핫플카페', '판다랭크', 2), mk('태국관광청, 방콕 웰니스 여행 3박 4일 일정 제안', '디스커버리뉴스', 2),
        mk('극동대 항공운항서비스학과, 방콕 타이항공 훈련센터서 객실안전훈련 수료', '국제뉴스', 2), mk('HK그룹, 태국 나콘사완 지라프라왓CC 장기 체류형 골프 회원권 출시', '더쎈뉴스', 2),
        mk('애프터눈 티 원조 호텔이 방콕에 새로 연 곳', '매일경제', 2), mk('태국관광청, 방콕 3박4일 웰니스 여행 프로모션', '국제뉴스', 2), mk('태국 골프 유망주, 경기 중 낙뢰로 참변', '데일리안', 2)]
    out = build(items, now); titles = [i['title'] for i in out['items']]
    assert len(titles) == 5, titles
    assert not any('축구' in t or '부동산' in t or '오래된' in t for t in titles), titles          # 잡음·오래된 기사 제외
    assert sum('시위' in t for t in titles) == 1, titles                                              # 비슷한 제목은 하나만
    assert sum(i['cat'] == 'breaking' for i in out['items']) <= 3, out
    assert out['items'][0]['cat'] == 'breaking', out                                                   # 속보가 맨 위
    assert {'breaking', 'weather', 'fx', 'golf'} <= {i['cat'] for i in out['items']}, out                # 속보·날씨·환율·골프가 하나씩 들어감
    assert not any('기적' in t or '푸껫' in t or '해병대' in t or '방콕 문서' in t or '방콕 선언' in t for t in titles), titles                 # 읽을거리·먼 지역·군 소식·막은 매체 제외
    assert all(i['src'] != 'Vietnam.vn' for i in out['items']), out
    assert not any('소매치기' in t or '마약' in t or '블록체인' in t or 'USDT' in t or '민니' in t or '게임쇼' in t or '코스메틱' in t or '파크골프' in t or '가성비' in t or '로컬' in t or '김치맨' in t or '아마골프' in t or 'NCT' in t or '노점상' in t or '호텔 폐업' in t or 'MLB' in t or '아이뮤지엄' in t or '발대식' in t or '성료' in t for t in titles), titles                    # 범죄·가상화폐 제외
    assert not any('학과' in t or '회원권' in t or '새로 연' in t or '프로모션' in t or '출발확정' in t or '일정 제안' in t for t in titles), titles   # 학교 행사·회원권·신규 오픈·관광 홍보 제외
    assert {'safety'} <= {i['cat'] for i in out['items']}, out                                          # 여행경보는 들어감
    assert out['date'] == '2026-12-20' and out['updated'].startswith('2026-12-20'), out
    sample = b'<rss><channel><item><title>\xeb\xb0\xa9\xec\xbd\x95 \xeb\x82\xa0\xec\x94\xa8 - \xec\x97\xb0\xed\x95\xa9\xeb\x89\xb4\xec\x8a\xa4</title><link>https://n/1</link><pubDate>Sat, 19 Dec 2026 23:00:00 GMT</pubDate><source url="https://y">\xec\x97\xb0\xed\x95\xa9\xeb\x89\xb4\xec\x8a\xa4</source></item></channel></rss>'
    p = parse(sample); assert p and p[0]['title'] == '방콕 날씨' and p[0]['src'] == '연합뉴스', p
    print('news selftest OK')


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--out'); ap.add_argument('--selftest', action='store_true'); a = ap.parse_args()
    if a.selftest: selftest(); return 0
    now = datetime.now(timezone.utc); items = []
    for q in QUERIES:
        raw = fetch(q)
        if raw:
            try: items += parse(raw)
            except Exception as e: print('  해석 실패', q, e, file=sys.stderr)
    data = build(items, now)
    print(f"받은 기사 {len(items)}개 → 고른 기사 {len(data['items'])}개")
    for i in data['items']: print(' ', i['cat'], '|', i['title'], '|', i['src'])
    if not data['items']: print('고른 기사가 없어서 파일을 만들지 않아요', file=sys.stderr); return 2
    open(a.out or 'news.json', 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, indent=1))
    return 0


if __name__ == '__main__': sys.exit(main())
