# 5年理科 単元4〜6 の図（SVG）。文字はすべて <text>。
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED
from gen_fig02 import box, arrow

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'figures', 'rika', '5')
GREEN = '#4f8a3c'
YEL = '#f6d34a'
SAND = '#e8d3b0'


def flower(cx, cy, female):
    s = ''
    for k in range(5):
        import math
        a = k * 2 * math.pi / 5 - math.pi / 2
        px, py = cx + 42 * math.cos(a), cy + 42 * math.sin(a)
        s += f'<ellipse cx="{px:.0f}" cy="{py:.0f}" rx="30" ry="22" transform="rotate({math.degrees(a):.0f} {px:.0f} {py:.0f})" fill="{YEL}" stroke="#b8921a" stroke-width="2"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="18" fill="#f9e9a6" stroke="#b8921a" stroke-width="1.5"/>'
    if female:
        s += f'<circle cx="{cx}" cy="{cy}" r="10" fill="#9cc66b" stroke="{GREEN}" stroke-width="2"/>'
    else:
        for dx, dy in ((-6, -5), (6, -5), (0, 6)):
            s += f'<circle cx="{cx+dx}" cy="{cy+dy}" r="5" fill="#e0a12a" stroke="#a46d0e"/>'
    return s


def fig_04_2():
    b = text(360, 30, 'ヘチマのめばなとおばな', 17, INK, weight='bold')
    # めばな：花の下にふくらみ（子房）
    b += text(190, 64, 'めばな', 17, INK, weight='bold')
    b += flower(190, 150, True)
    b += f'<ellipse cx="190" cy="250" rx="16" ry="44" fill="#cfe6bf" stroke="{GREEN}" stroke-width="2.5"/>'
    b += f'<line x1="190" y1="294" x2="190" y2="330" stroke="{GREEN}" stroke-width="4"/>'
    b += text(110, 154, 'めしべ', 14, RED, 'end', 'bold') + f'<line x1="114" y1="150" x2="178" y2="150" stroke="{RED}"/>'
    b += text(110, 254, 'めしべのもと', 14, RED, 'end', 'bold') + text(110, 272, '（ふくらんでいる）', 12, SOFT, 'end') + f'<line x1="114" y1="250" x2="172" y2="250" stroke="{RED}"/>'
    # おばな
    b += text(530, 64, 'おばな', 17, INK, weight='bold')
    b += flower(530, 150, False)
    b += f'<line x1="530" y1="200" x2="530" y2="330" stroke="{GREEN}" stroke-width="4"/>'
    b += text(610, 154, 'おしべ', 14, RED, 'start', 'bold') + f'<line x1="540" y1="150" x2="606" y2="150" stroke="{RED}"/>'
    b += text(610, 174, '先に花粉がある', 12, SOFT, 'start')
    b += text(360, 372, 'どちらの花にも、花びらとがくがある。めばなのめしべのもとが、やがて実になる', 13, SOFT)
    return svg(720, 392, b, 'ヘチマのめばなとおばなのつくり')


def bag_flower(x, top, pollinated):
    s = f'<line x1="{x}" y1="{top+150}" x2="{x}" y2="{top+260}" stroke="{GREEN}" stroke-width="4"/>'
    s += flower(x, top + 90, True)
    s += f'<ellipse cx="{x}" cy="{top+170}" rx="12" ry="26" fill="#cfe6bf" stroke="{GREEN}" stroke-width="2"/>'
    s += f'<path d="M{x-62},{top+30} Q{x},{top-10} {x+62},{top+30} L{x+54},{top+190} L{x-54},{top+190} z" fill="#ffffff" fill-opacity=".55" stroke="{SOFT}" stroke-width="2" stroke-dasharray="6 4"/>'
    s += f'<rect x="{x-14}" y="{top+186}" width="28" height="8" rx="3" fill="#8a6bbf"/>'
    if pollinated:
        for dx, dy in ((-4, -2), (4, 2), (0, 5), (-6, 4)):
            s += f'<circle cx="{x+dx}" cy="{top+90+dy}" r="3" fill="#e0a12a"/>'
    return s


def fig_04_5():
    b = text(360, 30, '受粉させる花とさせない花を比べる', 17, INK, weight='bold')
    b += text(360, 56, 'さく前のつぼみにふくろをかぶせておく（ほかの花粉がつかないように）', 13, SOFT)
    b += bag_flower(190, 80, True) + bag_flower(530, 80, False)
    b += text(190, 372, 'ア　花粉をつける（受粉させる）', 14, INK, weight='bold')
    b += text(530, 372, 'イ　花粉をつけない', 14, INK, weight='bold')
    # 結果
    b += f'<ellipse cx="190" cy="430" rx="22" ry="40" fill="#9cc66b" stroke="{GREEN}" stroke-width="2.5"/>' + text(250, 436, '実ができる', 14, ACC, 'start', 'bold')
    b += f'<ellipse cx="530" cy="440" rx="7" ry="16" fill="#d8cfa8" stroke="{SOFT}" stroke-width="2"/>' + text(560, 446, 'かれて落ちる', 14, SOFT, 'start', 'bold')
    b += text(80, 412, '数日後', 13, SOFT)
    return svg(720, 490, b, '受粉させた花とさせない花のめしべのもとの変化を比べる実験')


def fig_05_3():
    b = text(360, 30, '子宮の中の子どものようす（模式図）', 17, INK, weight='bold')
    # 子宮
    b += f'<path d="M180,90 C120,90 100,170 120,240 C140,310 200,340 260,340 C320,340 380,310 400,240 C420,170 400,90 340,90 C300,90 280,110 260,110 C240,110 220,90 180,90 z" fill="#fbe3e3" stroke="{INK}" stroke-width="3"/>'
    b += f'<path d="M195,110 C145,115 130,180 145,235 C160,295 205,320 260,320 C315,320 360,295 375,235 C390,180 375,115 325,110 C300,110 280,130 260,130 C240,130 220,110 195,110 z" fill="#dcecf6" stroke="#8fb3c9" stroke-width="2"/>'
    # たいばん
    b += f'<path d="M330,112 C370,125 385,160 382,195 C360,180 335,150 320,118 z" fill="#c75b6b" stroke="{INK}" stroke-width="2"/>'
    # 子ども（丸くなった姿）
    b += f'<circle cx="225" cy="190" r="34" fill="#f6d5bd" stroke="{INK}" stroke-width="2"/>'
    b += f'<path d="M205,222 C190,260 215,295 255,292 C295,290 305,250 285,220 C270,200 240,210 225,224 z" fill="#f6d5bd" stroke="{INK}" stroke-width="2"/>'
    b += f'<path d="M250,240 C290,230 320,200 345,165" fill="none" stroke="#b44a5c" stroke-width="5"/>'
    # ラベル
    b += text(470, 110, 'たいばん', 15, INK, 'start', 'bold') + f'<line x1="466" y1="106" x2="372" y2="150" stroke="{SOFT}"/>'
    b += text(470, 132, '母親から養分などを受け取り、', 12, SOFT, 'start') + text(470, 148, 'いらなくなったものをわたす', 12, SOFT, 'start')
    b += text(470, 196, 'へそのお', 15, INK, 'start', 'bold') + f'<line x1="466" y1="192" x2="318" y2="208" stroke="{SOFT}"/>'
    b += text(470, 218, 'たいばんと子どもをつなぐ', 12, SOFT, 'start')
    b += text(470, 266, '羊水', 15, INK, 'start', 'bold') + f'<line x1="466" y1="262" x2="350" y2="270" stroke="{SOFT}"/>'
    b += text(470, 288, '外からのしょうげきから子どもを守る', 12, SOFT, 'start')
    b += text(470, 330, '子宮', 15, INK, 'start', 'bold') + f'<line x1="466" y1="326" x2="392" y2="300" stroke="{SOFT}"/>'
    b += text(470, 352, '母親の体の中で子どもが育つところ', 12, SOFT, 'start')
    return svg(720, 380, b, '子宮の中の子ども・へそのお・たいばん・羊水の模式図')


def fig_05_4():
    b = text(360, 30, '受精から生まれるまでの子どもの育ち（大きさは目安）', 17, INK, weight='bold')
    items = [(0, '受精卵', '約0.1mm', '母親の体内で受精する'),
             (4, '4週', '約0.4cm', '心臓が動き始める'),
             (8, '8週', '約3cm', '手や足の形がはっきり'),
             (16, '16週', '約16cm', '体の形や顔つきがわかる'),
             (24, '24週', '約30cm', '体を活発に動かす'),
             (38, '38週', '約50cm・約3kg', '生まれる')]
    x0, x1 = 60, 660
    b += f'<line x1="{x0}" y1="200" x2="{x1}" y2="200" stroke="{INK}" stroke-width="3"/>'
    for wk, lab, size, note in items:
        x = x0 + (x1 - x0) * wk / 38
        r = 5 + 30 * (wk / 38)
        b += f'<circle cx="{x:.0f}" cy="{200 - r - 8:.0f}" r="{r:.0f}" fill="#f6d5bd" stroke="{INK}" stroke-width="1.5"/>'
        b += f'<circle cx="{x:.0f}" cy="200" r="5" fill="{ACC}"/>'
    rows = [items[:3], items[3:]]
    for ri, row in enumerate(rows):
        for ci, (wk, lab, size, note) in enumerate(row):
            x = 130 + ci * 230
            y = 250 + ri * 78
            b += f'<rect x="{x-105}" y="{y-20}" width="210" height="64" rx="8" fill="#f7f5ef" stroke="#e1dccf"/>'
            b += text(x, y + 2, f'{lab}　{size}', 14, INK, weight='bold') + text(x, y + 26, note, 12, SOFT)
    b += text(360, 418, '週は受精してからの週数のめやす。子どもは約38週間、子宮の中で育つ', 12, SOFT)
    return svg(720, 436, b, '受精してから生まれるまでの子どもの大きさと体の変化の目安')


def fig_06_2():
    b = text(360, 30, '土の山に水を流して、流れる水のはたらきを調べる', 17, INK, weight='bold')
    b += f'<path d="M60,330 L250,90 L470,90 L660,330 z" fill="{SAND}" stroke="{INK}" stroke-width="2.5"/>'
    d = 'M330,90 C300,150 420,170 380,220 C340,270 250,270 300,330'
    b += f'<path d="{d}" stroke="#8fb3c9" stroke-width="18" fill="none" stroke-linecap="round"/>'
    b += f'<path d="{d}" stroke="#4d8fbf" stroke-width="3" fill="none" stroke-dasharray="10 8"/>'
    # 旗
    for x, y in ((410, 196), (350, 212), (300, 262), (250, 252)):
        b += f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y-26}" stroke="{INK}" stroke-width="2"/><path d="M{x},{y-26} l14,5 l-14,5 z" fill="{RED}"/>'
    b += f'<path d="M330,60 l0,24" stroke="#4d8fbf" stroke-width="3" marker-end="url(#arr)"/>' + text(330, 54, '水を流す', 13, SOFT)
    b += text(700, 140, '曲がっているところの外側', 13, INK, 'end', 'bold') + text(700, 158, '→ けずられる', 13, RED, 'end', 'bold') + f'<line x1="560" y1="164" x2="418" y2="198" stroke="{SOFT}"/>'
    b += text(140, 210, '内側', 13, INK, 'end', 'bold') + text(140, 228, '→ 土が積もる', 13, ACC, 'end', 'bold') + f'<line x1="144" y1="216" x2="238" y2="246" stroke="{SOFT}"/>'
    b += text(420, 300, 'ふもと（流れがゆるやか）', 13, INK, 'start', 'bold') + text(420, 318, '→ 土が積もる', 13, ACC, 'start', 'bold') + f'<line x1="416" y1="308" x2="318" y2="322" stroke="{SOFT}"/>'
    b += text(360, 362, '目印の旗のたおれ方や、土がけずられた所・積もった所を記録する', 13, SOFT)
    return svg(720, 380, b, '土の山に水を流す実験と、けずられる所・積もる所')


def fig_06_4():
    b = text(360, 30, '流れる水の3つのはたらき', 17, INK, weight='bold')
    cols = [('しん食', '地面をけずる', 'M40,170 q60,-40 120,0'),
            ('運ぱん', '土や石を運ぶ', None),
            ('たい積', '土や石を積もらせる', None)]
    for i, (name, desc, _) in enumerate(cols):
        x = 30 + i * 230
        b += f'<rect x="{x}" y="60" width="210" height="190" rx="10" fill="#f6f9fb" stroke="#d5e1ea"/>'
        b += text(x + 105, 92, name, 20, ACC, weight='bold') + text(x + 105, 116, desc, 14, INK)
        b += f'<rect x="{x+20}" y="160" width="170" height="60" fill="{SAND}"/>'
        b += f'<path d="M{x+20},160 L{x+190},160" stroke="{INK}" stroke-width="1.5"/>'
        b += f'<path d="M{x+30},150 L{x+180},150" stroke="#4d8fbf" stroke-width="3" marker-end="url(#arr)"/>'
        if i == 0:
            b += f'<path d="M{x+60},160 q45,40 90,0 z" fill="#ffffff" stroke="{RED}" stroke-width="2" stroke-dasharray="4 3"/>'
        elif i == 1:
            for k, (dx, dy, r) in enumerate(((50, 140, 6), (90, 136, 5), (130, 142, 4), (160, 138, 3))):
                b += f'<circle cx="{x+dx}" cy="{dy}" r="{r}" fill="#a88b62" stroke="{INK}"/>'
        else:
            b += f'<path d="M{x+60},160 q45,-26 90,0 z" fill="#d8bf93" stroke="{ACC}" stroke-width="2"/>'
        b += text(x + 105, 238, '流れが速いほど大きい' if i < 2 else '流れがゆるやかな所で起こる', 12, SOFT)
    b += text(360, 280, '流れる水の量が増えると流れが速くなり、しん食や運ぱんのはたらきが大きくなる', 13, SOFT)
    return svg(720, 300, b, '流れる水のしん食・運ぱん・たい積のはたらき')


def stones(x, y, n, size, round_):
    s = ''
    import random
    rnd = random.Random(n * 7 + size)
    for i in range(n):
        cx = x + (i % 5) * (size * 2.2) + rnd.randint(-3, 3)
        cy = y + (i // 5) * (size * 1.9) + rnd.randint(-2, 2)
        if round_:
            s += f'<ellipse cx="{cx}" cy="{cy}" rx="{size}" ry="{size*0.75:.1f}" fill="#c9bba4" stroke="{INK}" stroke-width="1.2"/>'
        else:
            pts = [(cx - size, cy), (cx - size*0.3, cy - size*0.9), (cx + size, cy - size*0.4), (cx + size*0.7, cy + size*0.8), (cx - size*0.6, cy + size*0.7)]
            s += '<path d="M' + ' L'.join(f'{px:.0f},{py:.0f}' for px, py in pts) + f' z" fill="#b5a68e" stroke="{INK}" stroke-width="1.2"/>'
    return s


def fig_06_6():
    b = text(360, 30, '上流・中流・下流の川のようすと石のちがい', 17, INK, weight='bold')
    cols = [('上流', '山の中', '川はばがせまく、流れが速い', '大きく、角ばった石が多い', 10, 18, False, 60),
            ('中流', '平地に出た所', '川はばが広がり、川原ができる', '丸みのある石が多い', 10, 11, True, 110),
            ('下流', '海の近く', '川はばが広く、流れがゆるやか', '小さく丸い石や砂が多い', 15, 6, True, 170)]
    for i, (name, where, river, stone, n, size, rnd, width) in enumerate(cols):
        x = 30 + i * 230
        b += f'<rect x="{x}" y="56" width="210" height="300" rx="10" fill="#f6f9fb" stroke="#d5e1ea"/>'
        b += text(x + 105, 86, name, 20, ACC, weight='bold') + text(x + 105, 108, f'（{where}）', 13, SOFT)
        # 川のはば（上から見た図）
        b += f'<rect x="{x + 105 - width/2}" y="122" width="{width}" height="60" fill="#cfe6f3" stroke="#4d8fbf" stroke-width="2"/>'
        b += text(x + 105, 204, river, 12, INK)
        b += stones(x + 105 - (min(n, 5) - 1) * size * 1.1, 246, n, size, rnd)
        b += text(x + 105, 336, stone, 13, INK, weight='bold')
    b += arrow(60, 380, 660, 380, '#4d8fbf', w=3) + text(360, 404, '水の流れる向き（上流 → 下流）', 13, SOFT)
    return svg(720, 420, b, '上流・中流・下流の川はばと川原の石の大きさや形のちがい')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('04-2', fig_04_2), ('04-5', fig_04_5), ('05-3', fig_05_3), ('05-4', fig_05_4), ('06-2', fig_06_2), ('06-4', fig_06_4), ('06-6', fig_06_6)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
