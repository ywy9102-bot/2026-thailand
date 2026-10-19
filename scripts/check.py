#!/usr/bin/env python3
"""배포 전 점검: 버전 문자열·조각 파일·서비스 워커 목록이 서로 맞는지, 자바스크립트 문법이 맞는지 확인해요.
사용법: python3 scripts/check.py   (문제가 있으면 종료 코드 1)"""
import json, re, shutil, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
errs = []
def read(p): return (root / p).read_text(encoding='utf-8')

html = read('index.html')
css_v = set(re.findall(r'style\.css\?v=([\w.]+)', html))
js_v = set(re.findall(r'app\.js\?v=([\w.]+)', html))
if len(css_v) != 1 or len(js_v) != 1: errs.append(f'index.html의 style.css?v= / app.js?v= 는 모두 같은 버전 하나여야 해요 (지금: {sorted(css_v)} / {sorted(js_v)})')
elif css_v != js_v: errs.append(f'버전 불일치: style.css?v={sorted(css_v)} / app.js?v={sorted(js_v)}')
else: print(f'버전 {next(iter(js_v))} — style.css, app.js 일치')

# 첫 화면용 스타일(critical)이 지금 style.css에서 만든 것인지 확인
import hashlib
sha = hashlib.sha1((root / 'style.css').read_bytes()).hexdigest()[:12]
m = re.search(r'/\* style\.css\(([0-9a-f]{12})\)', html)
if not m: errs.append('index.html의 <style id="critical">를 찾지 못했어요 — npm run critical 을 실행해 주세요')
elif m.group(1) != sha: errs.append(f'style.css가 바뀌었는데 첫 화면용 스타일이 옛것이에요({m.group(1)} → {sha}) — npm run critical 을 실행해 주세요')
else: print('첫 화면용 스타일(critical)이 style.css와 일치')

app = read('app.js')
if 'const APP_VER' not in app or 'currentScript' not in app: errs.append('app.js의 APP_VER는 app.js?v= 값에서 읽어야 해요')
chunks = set(re.findall(r"__loadChunk\('(\w+)'\)", app))
for c in sorted(chunks):
    if not (root / f'{c}.js').exists(): errs.append(f'조각 파일 없음: {c}.js')
sw = read('sw.js')
for c in ['app', 'style'] + sorted(chunks):
    ext = 'css' if c == 'style' else 'js'
    if f"'{c}.{ext}?v='" not in sw: errs.append(f'sw.js 저장 목록에 {c}.{ext} 가 없어요')
print('조각 파일:', ', '.join(sorted(chunks)))

try: json.loads(read('manifest.json')); print('manifest.json 문법 OK')
except Exception as e: errs.append(f'manifest.json 오류: {e}')

node = shutil.which('node')
if node:
    for f in ['app.js', 'sw.js'] + [f'{c}.js' for c in sorted(chunks)]:
        r = subprocess.run([node, '--check', str(root / f)], capture_output=True, text=True)
        if r.returncode: errs.append(f'{f} 문법 오류: {r.stderr.strip().splitlines()[0] if r.stderr else ""}')
    print('자바스크립트 문법 검사 완료')
else:
    print('node가 없어 문법 검사는 건너뜀')


# 홈 화면 "오늘의 이야기" 제목 목록(app.js)이 story.js의 STORY 제목과 같은지 확인
if node and (root / 'story.js').exists():
    story = read('story.js')
    m1 = re.search(r"const TITLES = (\[.*?\]);", app, re.S)
    m2 = re.search(r"const STORY = (\[\[.*?\]\]);", story, re.S)
    if not m1 or not m2: errs.append('TITLES(app.js) 또는 STORY(story.js)를 찾지 못했어요')
    else:
        js = f"const a={m1.group(1)};const s={m2.group(1)};console.log(JSON.stringify(a)===JSON.stringify(s.map(c=>c[1]))?'same':'diff')"
        r = subprocess.run([node, '-e', js], capture_output=True, text=True)
        if r.stdout.strip() != 'same': errs.append('홈 화면 이야기 제목(app.js TITLES)이 story.js STORY 제목과 달라요 — 제목을 고쳤다면 두 곳을 맞춰 주세요')
        else: print('이야기 제목 목록 일치')

if errs:
    print('\n문제 ' + str(len(errs)) + '건:'); [print(' -', e) for e in errs]; sys.exit(1)
print('모두 정상')
