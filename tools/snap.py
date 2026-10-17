"""シーンのコマ送り画像（コンタクトシート）を作る確認用スクリプト。

使い方:
  python3 tools/snap.py OUT_DIR id:kind [id:kind ...]
  例) python3 tools/snap.py /tmp/snaps bounce:2d take-off:3d
前提: リポジトリ直下で `python3 -m http.server 8765` を起動しておく。
"""
import sys, os, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

BASE = os.environ.get('PREVIEW_BASE', 'http://localhost:8765/tools/preview.html')
FRAMES = int(os.environ.get('FRAMES', '6'))


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    targets = [a.split(':') for a in sys.argv[2:]]
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={'width': 420, 'height': 340}, device_scale_factor=1)
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        for sid, kind in targets:
            errors.clear()
            pg.goto(f'{BASE}?id={sid}&kind={kind}')
            pg.wait_for_function('window.ready', timeout=20000)
            state = pg.evaluate('window.ready')
            dur = pg.evaluate('window.stage.duration')
            shots = []
            for i in range(FRAMES):
                t = dur * i / (FRAMES - 1)
                pg.evaluate(f'window.stage.seek({t})')
                png = pg.locator('#host').screenshot()
                label = pg.evaluate("document.getElementById('beat').textContent")
                shots.append((t, label, Image.open(io.BytesIO(png)).convert('RGB')))
            w, h = shots[0][2].size
            cols = 3
            rows = (len(shots) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * w, rows * (h + 22)), 'white')
            d = ImageDraw.Draw(sheet)
            for i, (t, label, im) in enumerate(shots):
                x, y = (i % cols) * w, (i // cols) * (h + 22)
                sheet.paste(im, (x, y))
                d.text((x + 6, y + h + 4), f't={t:.2f}s  {label}', fill=(40, 40, 40))
            path = os.path.join(out, f'{sid}.png')
            sheet.save(path)
            print(sid, state, f'dur={dur}', 'errors:' + ' | '.join(errors) if errors else 'ok', path)
        b.close()


if __name__ == '__main__':
    main()
