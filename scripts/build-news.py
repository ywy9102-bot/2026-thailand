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
    '방콕 OR 파타야 골프 when:7d',
    '태국 골프 when:7d',
    '방콕 OR 수완나품 OR 돈므앙 공항 OR 항공 OR 결항 OR 지연 when:3d',
    '파타야 when:2d',
    '방콕 when:2d',
]
PLACE = re.compile(r'방콕|파타야|태국|수완나품|돈므앙|타이랜드|바트')
NOISE = re.compile(r'축구|야구|농구|배구|연예|아이돌|팬미팅|드라마|걸그룹|가수|영화|K-?팝|BTS|주가|증시|코스피|부동산|분양|채용|모집')
CATS = [  # (id, 정규식, 기본 점수) — 위에서부터 먼저 맞는 것으로 분류
    ('breaking', re.compile(r'속보|긴급|사망|숨져|폭발|테러|총격|시위|쿠데타|계엄|화재|붕괴|추락|경보|대피|지진|납치|피살|폐쇄'), 6),
    ('weather',  re.compile(r'날씨|폭우|호우|폭염|태풍|홍수|침수|기온|우기|건기|미세먼지|스콜|열대성|기상'), 4),
    ('fx',       re.compile(r'환율|바트|물가|환전'), 3),
    ('golf',     re.compile(r'골프|라운드|티오프|코스'), 4),
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
    return bool(x and y) and len(x & y) / len(x | y) >= 0.5


def classify(title):
    for cid, rx, base in CATS:
        if rx.search(title): return cid, base
    return 'news', 1


def score(item, now, hits):
    cid, base = classify(item['title'])
    s = base + (3 if re.search(r'방콕|파타야', item['title']) else 1 if '태국' in item['title'] else 0)
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
        if not PLACE.search(it['title']) or (NOISE.search(it['title']) and '골프' not in it['title']): continue
        if (now - it['ts']).total_seconds() > 72 * 3600: continue
        cid, s = score(it, now, it['hits'])
        pool.append({**it, 'cat': cid, 'score': s})
    pool.sort(key=lambda x: (-x['score'], -x['ts'].timestamp()))
    picked, per_src, per_cat = [], {}, {}
    def ok(x, strict):
        if any(similar(x['title'], p['title']) for p in picked): return False
        if per_src.get(x['src'], 0) >= 2: return False
        return not strict or per_cat.get(x['cat'], 0) < CAP.get(x['cat'], 2)
    # 먼저 속보·날씨·환율·골프에서 하나씩(있으면) 골라 주제가 고르게 들어가게 해요
    for cid in ('breaking', 'weather', 'fx', 'golf'):
        for x in pool:
            if x['cat'] == cid and ok(x, False):
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
        mk('오래된 방콕 소식', '연합뉴스', 100), mk('서울 부동산 소식', '연합뉴스', 1), mk('방콕 날씨 폭염 경보', '연합뉴스', 3, 'https://x/dup'), mk('방콕 날씨 폭염 경보', '연합뉴스', 3, 'https://x/dup'),
    ]
    out = build(items, now); titles = [i['title'] for i in out['items']]
    assert len(titles) == 5, titles
    assert not any('축구' in t or '부동산' in t or '오래된' in t for t in titles), titles          # 잡음·오래된 기사 제외
    assert sum('시위' in t for t in titles) == 1, titles                                              # 비슷한 제목은 하나만
    assert sum(i['cat'] == 'breaking' for i in out['items']) <= 3, out
    assert out['items'][0]['cat'] == 'breaking', out                                                   # 속보가 맨 위
    assert {'breaking', 'weather', 'fx', 'golf'} <= {i['cat'] for i in out['items']}, out                # 속보·날씨·환율·골프가 하나씩 들어감
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
