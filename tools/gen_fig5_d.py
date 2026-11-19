# 5年理科 番号のない時間の図（SVG）。文字はすべて <text>。
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED
from gen_fig02 import box, arrow

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'figures', 'rika', '5')
GREEN = '#4f8a3c'
YEL = '#f6d34a'


def fig_11_1():
    b = text(360, 30, '問題解決の進め方', 17, INK, weight='bold')
    steps = ['問題', '予想', '計画', '観察・実験', '結果', '考察', '結論']
    for i, st in enumerate(steps):
        x = 14 + i * 100
        fill = '#e3f1ee' if st == '計画' else '#fff'
        b += box(x, 70, 84, 50, st, fill=fill, size=14)
        if i < len(steps) - 1:
            b += arrow(x + 86, 95, x + 98, 95, SOFT, w=2)
    b += f'<path d="M256,124 L256,150" stroke="{ACC}" stroke-width="2"/>'
    b += f'<rect x="120" y="150" width="480" height="96" rx="10" fill="#f3faf7" stroke="{ACC}" stroke-width="2"/>'
    b += text(360, 178, '5年で大切にすること：条件を制御する', 15, ACC, weight='bold')
    b += text(360, 206, '調べたい条件（変える条件）は1つだけにして、', 13, INK)
    b += text(360, 228, 'ほかの条件（変えない条件）はすべてそろえて比べる', 13, INK)
    return svg(720, 266, b, '問題解決の進め方と、5年で大切にする条件の制御')


def petal(cx, cy, ang, rx=26, ry=14, fill=YEL, stroke='#b8921a'):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({ang} {cx} {cy})" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'


def fig_12_1():
    b = text(360, 30, 'アブラナの花のつくり（外側から順に分けたところ）', 17, INK, weight='bold')
    # 花の絵（上から）
    cx, cy = 130, 150
    for k in range(4):
        a = k * 90 + 45
        r = math.radians(a)
        b += petal(cx + 26 * math.cos(r), cy + 26 * math.sin(r), a, 20, 9, '#bcd99a', GREEN)
    for k in range(4):
        a = k * 90
        r = math.radians(a)
        b += petal(cx + 34 * math.cos(r), cy + 34 * math.sin(r), a, 30, 18)
    for k in range(6):
        a = math.radians(k * 60)
        b += f'<circle cx="{cx + 12 * math.cos(a):.0f}" cy="{cy + 12 * math.sin(a):.0f}" r="4" fill="#e0a12a"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="5" fill="{GREEN}"/>'
    b += text(cx, 240, '上から見た花', 13, SOFT)
    # 分けた部品（紙にはった様子）
    b += f'<rect x="250" y="60" width="450" height="230" rx="6" fill="#fbfaf6" stroke="#e1dccf"/>'
    cols = [('がく', 4, '#bcd99a', GREEN), ('花びら', 4, YEL, '#b8921a'), ('おしべ', 6, None, None), ('めしべ', 1, None, None)]
    for i, (name, n, fill, stroke) in enumerate(cols):
        x = 300 + i * 110
        b += text(x, 88, name, 14, INK, weight='bold') + text(x, 270, f'{n}{"まい" if i < 2 else "本"}', 14, ACC, weight='bold')
        for j in range(n):
            y = 112 + j * (140 / max(n, 1)) if n > 1 else 170
            if i < 2:
                b += petal(x, y + 8, 90, 14 if i == 0 else 16, 8 if i == 0 else 11, fill, stroke)
            elif i == 2:
                b += f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+18}" stroke="{GREEN}" stroke-width="2"/><ellipse cx="{x}" cy="{y}" rx="4" ry="6" fill="#e0a12a"/>'
            else:
                b += f'<path d="M{x},120 L{x},220" stroke="{GREEN}" stroke-width="6" stroke-linecap="round"/><ellipse cx="{x}" cy="116" rx="6" ry="5" fill="#9cc66b" stroke="{GREEN}"/>'
                b += text(x + 14, 150, 'ここが', 11, SOFT, 'start') + text(x + 14, 164, '実になる', 11, SOFT, 'start')
    b += text(360, 320, 'おしべの先に花粉がある。めしべの先はべたべたしていて、花粉がつきやすい', 13, SOFT)
    return svg(720, 340, b, 'アブラナの花のがく・花びら・おしべ・めしべの数と形')


def fig_12_2():
    b = text(360, 30, 'アブラナのくきの上から下へ（つぼみ・花・実）', 17, INK, weight='bold')
    b += f'<path d="M140,60 L140,360" stroke="{GREEN}" stroke-width="6"/>'
    items = [(80, 'つぼみ', 'bud'), (140, 'さいている花', 'flower'), (210, '花びらが落ちた', 'young'), (290, '細長い実', 'fruit')]
    for y, label, kind in items:
        if kind == 'bud':
            b += f'<ellipse cx="160" cy="{y}" rx="10" ry="14" fill="#bcd99a" stroke="{GREEN}" stroke-width="2"/>'
        elif kind == 'flower':
            for a in (0, 90, 180, 270):
                r = math.radians(a)
                b += petal(170 + 18 * math.cos(r), y + 18 * math.sin(r), a, 16, 10)
            b += f'<circle cx="170" cy="{y}" r="5" fill="{GREEN}"/>'
        elif kind == 'young':
            b += f'<path d="M146,{y} L210,{y-30}" stroke="#9cc66b" stroke-width="7" stroke-linecap="round"/>'
        else:
            b += f'<path d="M146,{y} L250,{y-40}" stroke="#9cc66b" stroke-width="11" stroke-linecap="round"/>'
        b += f'<line x1="146" y1="{y}" x2="140" y2="{y}" stroke="{GREEN}" stroke-width="3"/>'
        b += text(300, y + 5, label, 15, INK, 'start', 'bold')
    b += arrow(270, 70, 270, 300, SOFT) + text(282, 340, '下ほど、早くさいた花', 12, SOFT, 'start')
    # 実の断面
    b += f'<rect x="470" y="150" width="200" height="40" rx="20" fill="#cfe6bf" stroke="{GREEN}" stroke-width="2.5"/>'
    for k in range(7):
        b += f'<circle cx="{495 + k*25}" cy="170" r="7" fill="#8a6b3a"/>'
    b += text(570, 220, '実を切ると、中に種子がある', 13, ACC, weight='bold')
    b += text(570, 132, '細長い実（めしべのもとが育ったもの）', 12, SOFT)
    return svg(720, 380, b, 'アブラナのくきについたつぼみ・花・実と、実の中の種子')


def fig_13_1():
    b = text(360, 30, '台風の進み方の例（模式図）', 17, INK, weight='bold')
    b += f'<rect x="20" y="50" width="680" height="330" rx="8" fill="#e8f1f7"/>'
    land = '#f4efe3'
    d = 'M210,300 Q330,265 400,220 T470,130'
    b += f'<path d="{d}" stroke="{INK}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="{d}" stroke="{land}" stroke-width="26" fill="none" stroke-linecap="round"/>'
    for cx, cy, rx, ry in ((495, 106, 30, 20), (185, 322, 16, 22), (262, 312, 18, 9)):
        b += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{land}" stroke="{INK}" stroke-width="1.5"/>'
    b += text(470, 200, '日本', 14, SOFT, 'start', 'bold')
    path = [(560, 365), (480, 350), (400, 330), (330, 300), (300, 250), (340, 195), (420, 150), (540, 105)]
    pd = 'M' + ' L'.join(f'{x},{y}' for x, y in path)
    b += f'<path d="{pd}" fill="none" stroke="{RED}" stroke-width="3" stroke-dasharray="8 5" marker-end="url(#arr)"/>'
    for i, (x, y) in enumerate(path[:-1]):
        b += f'<circle cx="{x}" cy="{y}" r="7" fill="#fff" stroke="{RED}" stroke-width="2"/>'
        b += text(x - 12, y - 10, f'{i+1}日目', 11, INK, 'end')
    b += text(640, 360, '南の海上で発生', 13, RED, 'middle', 'bold')
    b += text(120, 120, 'はじめは西や北へ進み、', 13, INK) + text(120, 140, 'その後、北や東へ', 13, INK) + text(120, 160, '向きを変えることが多い', 13, INK)
    b += text(360, 400, '進み方は台風ごとにちがう。気象情報で進路の予想を確かめる', 12, SOFT)
    return svg(720, 412, b, '台風が南の海上で発生し、向きを変えながら日本付近に近づく進み方の例')


def fig_15_1():
    b = text(360, 30, '生命のつながり方を比べる', 17, INK, weight='bold')
    rows = [['', 'メダカ', 'ヘチマ（植物）', 'ヒト'],
            ['始まり', '受精（卵と精子）', '受粉して実と種子', '受精（卵と精子）'],
            ['育つ場所', '水中の卵の中', '実の中の種子→土', '母親の子宮の中'],
            ['育つための養分', '卵の中の養分', '種子（子葉）の養分', 'へそのおを通して母親から'],
            ['生まれるまで', '約11日（水温25℃）', '発芽まで数日〜', '約38週間']]
    widths = [140, 180, 190, 190]
    y = 56
    for r, row in enumerate(rows):
        x = 10
        for c, cell in enumerate(row):
            fill = '#eef3ee' if r == 0 or c == 0 else '#fff'
            b += f'<rect x="{x}" y="{y}" width="{widths[c]}" height="44" fill="{fill}" stroke="{SOFT}"/>'
            b += text(x + widths[c]/2, y + 28, cell, 13, INK, weight='bold' if r == 0 or c == 0 else 'normal')
            x += widths[c]
        y += 44
    b += text(360, 296, 'どれも、新しい生命が育ち、また次の生命につながっていく', 14, ACC, weight='bold')
    return svg(720, 314, b, 'メダカ・ヘチマ・ヒトの生命の始まり・育つ場所・養分・期間を比べる表')


def fig_16_1():
    b = text(360, 30, '理科室の安全の約束', 17, INK, weight='bold')
    items = [('立って実験する', 'いすは机の下に入れる'), ('机の上を片づける', '使わない物は置かない'), ('保護めがねをかける', '薬品や加熱のとき'),
             ('換気をする', '窓を開ける'), ('長い髪はまとめる', '火に近づけない'), ('すぐ先生に知らせる', 'けが・割れた・こぼした')]
    for i, (t1, t2) in enumerate(items):
        x = 20 + (i % 3) * 230
        y = 60 + (i // 3) * 110
        b += f'<rect x="{x}" y="{y}" width="210" height="90" rx="10" fill="#f6f9fb" stroke="#d5e1ea"/>'
        b += f'<circle cx="{x+30}" cy="{y+45}" r="16" fill="{ACC}"/>' + text(x + 30, y + 51, str(i + 1), 15, '#fff', weight='bold')
        b += text(x + 56, y + 42, t1, 14, INK, 'start', 'bold') + text(x + 56, y + 64, t2, 12, SOFT, 'start')
    b += text(360, 300, '消火器・救急箱・水道の場所を確かめておく', 13, RED, weight='bold')
    return svg(720, 320, b, '理科室を安全に使うための6つの約束')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('11-1', fig_11_1), ('12-1', fig_12_1), ('12-2', fig_12_2), ('13-1', fig_13_1), ('15-1', fig_15_1), ('16-1', fig_16_1)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
