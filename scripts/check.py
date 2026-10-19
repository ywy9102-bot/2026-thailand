#!/usr/bin/env python3
"""배포 전 점검: 버전 문자열·조각 파일·서비스 워커 목록이 서로 맞는지, 자바스크립트 문법이 맞는지 확인해요.
사용법: python3 scripts/check.py   (문제가 있으면 종료 코드 1)"""
import json, re, shutil, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
errs = []
def read(p): return (root / p).read_text(encoding='utf-8')

html = read('index.html')
css_v = re.findall(r'href="style\.css\?v=([\w.]+)"', html)
js_v = re.findall(r'src="app\.js\?v=([\w.]+)"', html)
if len(css_v) != 1 or len(js_v) != 1: errs.append('index.html에 style.css?v= 와 app.js?v= 가 각각 하나씩 있어야 해요')
elif css_v[0] != js_v[0]: errs.append(f'버전 불일치: style.css?v={css_v[0]} / app.js?v={js_v[0]}')
else: print(f'버전 {js_v[0]} — style.css, app.js 일치')

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

if errs:
    print('\n문제 ' + str(len(errs)) + '건:'); [print(' -', e) for e in errs]; sys.exit(1)
print('모두 정상')
