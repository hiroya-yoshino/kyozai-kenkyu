# 6年理科 単元2「ヒトや動物の体」の図（SVG）。文字はすべて <text>。
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED, OUT

BLUE = '#3b5ba5'   # 青むらさき（ヨウ素液の反応）
def box(x, y, w, h, label, sub=None, fill='#fff', stroke=INK, size=15):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
    if sub:
        s += text(x + w/2, y + h/2 - 3, label, size, INK, weight='bold') + text(x + w/2, y + h/2 + 17, sub, 12, SOFT)
    else:
        s += text(x + w/2, y + h/2 + 5, label, size, INK, weight='bold')
    return s
def arrow(x1, y1, x2, y2, color=ACC, dash=False, w=2.5):
    d = ' stroke-dasharray="7 5"' if dash else ''
    return f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{color}" stroke-width="{w}"{d} marker-end="url(#arr)" fill="none"/>'

def tube(x, top, liquid_fill, label):
    s = f'<path d="M{x},{top} L{x},{top+150} a16,16 0 0 0 32,0 L{x+32},{top}" fill="none" stroke="{INK}" stroke-width="2.5"/>'
    s += f'<path d="M{x+2},{top+70} L{x+2},{top+150} a14,14 0 0 0 28,0 L{x+30},{top+70} z" fill="{liquid_fill}"/>'
    s += text(x + 16, top - 10, label, 14, INK, weight='bold')
    return s

def fig_02_2():
    b = text(360, 28, 'だ液によるでんぷんの変化を調べる', 16, INK, weight='bold')
    # 左：湯につける
    b += f'<rect x="40" y="120" width="250" height="150" rx="6" fill="url(#water)" stroke="{INK}" stroke-width="2.5"/>'
    b += text(165, 292, '約40℃の湯（体温に近い温度）', 13, SOFT)
    b += tube(95, 70, '#fffbe6', 'A') + tube(205, 70, '#fffbe6', 'B')
    b += text(111, 340, 'でんぷん液', 12, INK) + text(111, 356, '＋だ液', 12, ACC, weight='bold')
    b += text(221, 340, 'でんぷん液', 12, INK) + text(221, 356, '＋水', 12, INK, weight='bold')
    b += arrow(310, 190, 400, 190, INK)
    b += text(355, 172, '数分後', 12, SOFT) + text(355, 215, 'ヨウ素液', 12, SOFT) + text(355, 231, 'を入れる', 12, SOFT)
    # 右：結果
    b += tube(450, 70, '#fffbe6', 'A') + tube(570, 70, BLUE, 'B')
    b += f'<rect x="420" y="300" width="96" height="44" rx="8" fill="#e3f1ee"/>' + text(468, 320, '色は', 13, ACC, weight='bold') + text(468, 337, '変わらない', 13, ACC, weight='bold')
    b += f'<rect x="540" y="300" width="96" height="44" rx="8" fill="#e8ecf6"/>' + text(588, 320, '青むらさき色', 13, BLUE, weight='bold') + text(588, 337, 'に変わる', 13, BLUE, weight='bold')
    b += text(360, 382, 'A：でんぷんがだ液で別のものに変わった　B：でんぷんが残っている', 13, INK)
    return svg(720, 400, b, 'だ液によるでんぷんの変化を調べる実験')

def fig_02_3():
    b = text(330, 28, '食べ物の通り道（消化管）と消化・吸収（模式図）', 16, INK, weight='bold')
    steps = [('口', 'だ液'), ('食道', ''), ('胃', '胃液'), ('小腸', '消化液／養分を吸収'), ('大腸', '主に水分を吸収'), ('こう門', '残りをはい出')]
    y = 52
    for i, (name, note) in enumerate(steps):
        b += box(60, y, 150, 44, name, fill='#fff')
        if note:
            b += text(230, y + 27, note, 13, ACC if '吸収' in note else SOFT, 'start', 'bold' if '吸収' in note else 'normal')
        if i < len(steps) - 1:
            b += arrow(135, y + 44, 135, y + 66, INK)
        y += 66
    b += box(440, 180, 170, 56, '肝臓', '養分をたくわえる', fill='#f4fbf9', stroke=ACC)
    b += arrow(385, 262, 460, 236, ACC, dash=True)
    b += text(470, 290, '小腸で吸収された養分は', 12, SOFT, 'start') + text(470, 306, '血液で肝臓へ運ばれる', 12, SOFT, 'start')
    return svg(660, 450, b, '食べ物の通り道と消化・吸収の模式図')

def fig_02_4():
    b = text(340, 28, '吸う空気とはき出した息のちがいを調べる', 16, INK, weight='bold')
    def bag(x, label, sub):
        s = f'<path d="M{x},90 q-10,90 10,170 h120 q20,-80 10,-170 z" fill="#f7f9fb" stroke="{INK}" stroke-width="2.5"/>'
        s += f'<rect x="{x+58}" y="72" width="24" height="20" fill="#fff" stroke="{INK}" stroke-width="2"/>'
        s += text(x + 70, 160, label, 15, INK, weight='bold') + text(x + 70, 182, sub, 12, SOFT)
        return s
    b += bag(70, '吸う空気', '（まわりの空気）') + bag(400, 'はき出した息', '（ストローで入れる）')
    rows = [('酸素', '約21%', '約17%'), ('二酸化炭素', '約0.04%', '約4%'), ('石灰水', 'ほとんどにごらない', '白くにごる')]
    y = 300
    b += text(140, y - 12, '吸う空気', 13, SOFT) + text(470, y - 12, 'はき出した息', 13, SOFT)
    for name, a, c in rows:
        b += text(305, y + 14, name, 14, INK, weight='bold')
        b += text(140, y + 14, a, 14, INK) + text(470, y + 14, c, 14, ACC, weight='bold')
        b += f'<line x1="40" y1="{y+26}" x2="640" y2="{y+26}" stroke="#dce6ee"/>'
        y += 34
    b += text(340, 420, '気体検知管の値は目安。はき出した息は酸素が減り、二酸化炭素がふえる', 12, SOFT)
    return svg(680, 436, b, '吸う空気とはき出した息のちがいを調べる実験と結果の目安')

def fig_02_5():
    b = text(320, 28, '肺のはたらき（模式図）', 16, INK, weight='bold')
    b += box(250, 50, 140, 44, '口・鼻')
    b += arrow(320, 94, 320, 124, INK)
    b += box(250, 124, 140, 44, '気管')
    b += arrow(300, 168, 190, 200, INK) + arrow(340, 168, 450, 200, INK)
    for x in (90, 390):
        b += f'<ellipse cx="{x+80}" cy="270" rx="90" ry="66" fill="#fbecea" stroke="{INK}" stroke-width="2.5"/>'
        b += text(x + 80, 266, '肺', 18, INK, weight='bold')
    b += text(170, 292, '（左）', 12, SOFT) + text(470, 292, '（右）', 12, SOFT)
    b += f'<rect x="130" y="360" width="380" height="64" rx="8" fill="#fff" stroke="{ACC}" stroke-width="2"/>'
    b += text(320, 384, '肺の中の血管で', 13, INK)
    b += text(320, 406, '酸素 → 血液へ ／ 血液から → 二酸化炭素', 13, ACC, weight='bold')
    return svg(640, 440, b, '肺のはたらきの模式図')

def fig_02_6():
    b = f'<defs><marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{RED}"/></marker><marker id="arrS" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{SOFT}"/></marker></defs>'
    b += text(320, 28, '血液のじゅんかん（模式図）', 16, INK, weight='bold')
    red = lambda x1, y1, x2, y2: f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{RED}" stroke-width="3" marker-end="url(#arrR)"/>'
    gray = lambda x1, y1, x2, y2: f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{SOFT}" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#arrS)"/>'
    b += box(250, 60, 140, 50, '肺', '酸素を受けとる', fill='#fbecea')
    b += box(250, 200, 140, 56, '心臓', 'ポンプで送り出す', fill='#fff', stroke=RED)
    b += box(250, 350, 140, 56, '全身', '酸素・養分をわたす', fill='#f7f9fb')
    # 肺↔心臓
    b += gray(290, 200, 290, 114) + red(350, 110, 350, 196)
    # 心臓↔全身
    b += red(350, 256, 350, 346) + gray(290, 350, 290, 260)
    b += f'<line x1="430" y1="420" x2="470" y2="420" stroke="{RED}" stroke-width="3"/>' + text(478, 425, '酸素が多い血液', 12, INK, 'start')
    b += f'<line x1="430" y1="442" x2="470" y2="442" stroke="{SOFT}" stroke-width="3" stroke-dasharray="7 5"/>' + text(478, 447, '二酸化炭素が多い血液', 12, INK, 'start')
    b += text(30, 230, '脈はく：心臓が', 13, SOFT, 'start') + text(30, 248, '血液を送り出す', 13, SOFT, 'start') + text(30, 266, 'ときの動きが', 13, SOFT, 'start') + text(30, 284, '血管に伝わる', 13, SOFT, 'start')
    return svg(640, 460, b, '血液のじゅんかんの模式図')

def fig_02_7():
    b = text(330, 28, '生命を支える臓器のつながり（模式図）', 16, INK, weight='bold')
    cx, cy = 330, 245
    b += f'<circle cx="{cx}" cy="{cy}" r="62" fill="#fbecea" stroke="{RED}" stroke-width="3"/>'
    b += text(cx, cy - 4, '血液', 18, RED, weight='bold') + text(cx, cy + 18, '（心臓が送る）', 12, SOFT)
    organs = [(30, 60, '肺', '酸素を取り入れ、二酸化炭素を出す'), (410, 60, '胃・小腸', '食べ物を消化し、養分を吸収'),
              (410, 370, 'じん臓', '不要なものをこしとり尿にする'), (30, 370, '肝臓', '養分をたくわえる')]
    for x, y, name, role in organs:
        b += box(x, y, 220, 60, name, role, fill='#fff')
        ix = x + 220 if x < cx else x
        iy = y + 60 if y < cy else y
        tx = cx + (-46 if x < cx else 46)
        ty = cy + (-42 if y < cy else 42)
        b += f'<line x1="{ix}" y1="{iy}" x2="{tx}" y2="{ty}" stroke="{ACC}" stroke-width="2.5"/>'
    return svg(660, 460, b, '生命を支える臓器と血液のつながりの模式図')

for name, fn in [('02-2', fig_02_2), ('02-3', fig_02_3), ('02-4', fig_02_4), ('02-5', fig_02_5), ('02-6', fig_02_6), ('02-7', fig_02_7)]:
    with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
        f.write(fn())
print('ok')
