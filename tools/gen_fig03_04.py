# 6年理科 単元3・4 の図
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED, OUT
from gen_fig02 import box, arrow

GREEN = '#4f8a3c'; DYE = '#c2185b'

def leaf(cx, cy, rx=26, ry=12, rot=0, fill='#e3f0dc'):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="{fill}" stroke="{GREEN}" stroke-width="2"/>'

def fig_03_2():
    b = text(360, 28, '色水を吸わせたホウセンカと切り口', 16, INK, weight='bold')
    # フラスコと植物
    b += f'<path d="M110,300 L80,380 L200,380 L170,300 L170,250 L110,250 z" fill="#fde4ee" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<rect x="83" y="340" width="114" height="38" fill="#f4a6c5" opacity=".7"/>'
    b += text(140, 400, '色水', 13, DYE, weight='bold')
    b += f'<line x1="140" y1="370" x2="140" y2="90" stroke="{GREEN}" stroke-width="5"/>'
    for i, y in enumerate((120, 160, 200)):
        b += leaf(110 if i % 2 else 172, y, rot=-25 if i % 2 else 25)
    b += f'<path d="M140,370 l-14,10 M140,370 l12,12 M140,372 l0,14" stroke="{GREEN}" stroke-width="2"/>'
    b += text(140, 70, 'ホウセンカ', 14, INK, weight='bold')
    # 茎の横の切り口
    b += f'<circle cx="380" cy="150" r="60" fill="#f3f8ef" stroke="{GREEN}" stroke-width="2.5"/>'
    for k in range(8):
        import math
        a = k * math.pi / 4
        b += f'<circle cx="{380 + 38*math.cos(a):.1f}" cy="{150 + 38*math.sin(a):.1f}" r="7" fill="{DYE}"/>'
    b += text(380, 238, '茎（横に切る）', 14, INK, weight='bold') + text(380, 256, '輪のように染まる', 12, SOFT)
    # 茎の縦の切り口
    b += f'<rect x="545" y="90" width="70" height="130" fill="#f3f8ef" stroke="{GREEN}" stroke-width="2.5"/>'
    b += f'<line x1="562" y1="90" x2="562" y2="220" stroke="{DYE}" stroke-width="5"/><line x1="598" y1="90" x2="598" y2="220" stroke="{DYE}" stroke-width="5"/>'
    b += text(580, 238, '茎（縦に切る）', 14, INK, weight='bold') + text(580, 256, '管がすじのように続く', 12, SOFT)
    # 葉
    b += leaf(480, 340, 80, 34, 0, '#f3f8ef')
    b += f'<path d="M400,340 L560,340 M440,340 l20,-18 M440,340 l20,18 M490,340 l20,-20 M490,340 l20,20" stroke="{DYE}" stroke-width="3" fill="none"/>'
    b += text(480, 400, '葉（すじ＝葉脈が染まる）', 13, INK, weight='bold')
    b += text(360, 430, '色水で染まった部分が、根から吸い上げた水の通り道', 13, SOFT)
    return svg(720, 444, b, '色水を吸わせたホウセンカの茎と葉の切り口')

def plant_in_bag(x, with_leaves, drops):
    s = f'<path d="M{x+20},330 h80 l-10,40 h-60 z" fill="#d9b38c" stroke="{INK}" stroke-width="2"/>'
    s += f'<line x1="{x+60}" y1="330" x2="{x+60}" y2="150" stroke="{GREEN}" stroke-width="5"/>'
    if with_leaves:
        for i, y in enumerate((170, 205, 240, 275)):
            s += leaf(x + (35 if i % 2 else 85), y, rot=-25 if i % 2 else 25)
    s += f'<path d="M{x+60},120 C{x-10},130 {x-10},300 {x+30},310 L{x+90},310 C{x+130},300 {x+130},130 {x+60},120 z" fill="none" stroke="{SOFT}" stroke-width="2" stroke-dasharray="5 4"/>'
    for k in range(drops):
        s += f'<circle cx="{x + 15 + (k*23) % 90}" cy="{140 + (k*37) % 150}" r="4" fill="#9cc7e6"/>'
    return s

def fig_03_3():
    b = text(340, 28, '葉のある枝とない枝にふくろをかぶせる', 16, INK, weight='bold')
    b += plant_in_bag(100, True, 14) + plant_in_bag(440, False, 2)
    b += text(160, 100, '葉あり', 15, INK, weight='bold') + text(500, 100, '葉なし', 15, INK, weight='bold')
    b += f'<rect x="80" y="388" width="160" height="34" rx="8" fill="#e3f1ee"/>' + text(160, 410, '水てきが多くつく', 13, ACC, weight='bold')
    b += f'<rect x="420" y="388" width="160" height="34" rx="8" fill="#eef1f4"/>' + text(500, 410, 'ほとんどつかない', 13, SOFT, weight='bold')
    return svg(680, 440, b, '葉のある枝と葉のない枝にふくろをかぶせて蒸散を比べる')

def fig_03_4():
    b = text(340, 28, '植物の気体の出入りを調べる（日光に当てる）', 16, INK, weight='bold')
    b += plant_in_bag(60, True, 0)
    b += f'<circle cx="300" cy="80" r="24" fill="#ffd166" stroke="#e08a00" stroke-width="2"/>'
    for k in range(8):
        import math
        a = k * math.pi / 4
        b += f'<line x1="{300+32*math.cos(a):.0f}" y1="{80+32*math.sin(a):.0f}" x2="{300+42*math.cos(a):.0f}" y2="{80+42*math.sin(a):.0f}" stroke="#e08a00" stroke-width="3"/>'
    b += text(300, 132, '日光', 13, SOFT)
    rows = [('酸素', '約16%', '約20%'), ('二酸化炭素', '約3%', '約1%')]
    b += text(420, 190, 'はじめ', 13, SOFT) + text(560, 190, '約1時間後', 13, SOFT)
    y = 220
    for name, a, c in rows:
        b += text(320, y, name, 14, INK, 'start', 'bold') + text(420, y, a, 14, INK) + text(560, y, c, 14, ACC, weight='bold')
        b += f'<line x1="310" y1="{y+12}" x2="640" y2="{y+12}" stroke="#dce6ee"/>'
        y += 36
    b += text(480, 310, '息をふきこんだふくろ（数値は目安）', 12, SOFT)
    b += text(480, 340, '日光が当たると、二酸化炭素が減り', 13, INK) + text(480, 360, '酸素がふえる', 13, ACC, weight='bold')
    return svg(680, 400, b, '植物にふくろをかぶせて日光に当て、気体の出入りを調べる')

def fig_03_6():
    b = text(340, 28, '日光とでんぷん（ヨウ素液での比べ方）', 16, INK, weight='bold')
    cols = [('ア', '朝すぐ調べる', '#e3f0dc', '変化なし'), ('イ', '日光に当てる', '#3b5ba5', '青むらさき色'), ('ウ', 'はくをかぶせたまま', '#e3f0dc', '変化なし')]
    for i, (k, cond, color, res) in enumerate(cols):
        x = 70 + i * 200
        b += text(x + 70, 70, k, 18, INK, weight='bold') + text(x + 70, 92, cond, 13, SOFT)
        if k == 'イ':
            b += f'<circle cx="{x+70}" cy="130" r="14" fill="#ffd166" stroke="#e08a00"/>'
        else:
            b += f'<rect x="{x+40}" y="118" width="60" height="24" fill="#c9ced6" stroke="{SOFT}"/>' + text(x + 70, 135, 'はく', 11, INK)
        b += leaf(x + 70, 200, 60, 30, 0)
        b += arrow(x + 70, 240, x + 70, 270, INK)
        b += leaf(x + 70, 310, 60, 30, 0, color if k == 'イ' else '#f3f8ef')
        b += text(x + 70, 370, res, 14, '#3b5ba5' if k == 'イ' else SOFT, weight='bold')
    b += text(340, 400, 'たたき染めなどで葉の色をうつし、ヨウ素液にひたして比べる', 12, SOFT)
    return svg(680, 416, b, '日光に当てた葉と当てない葉のでんぷんを比べる')

def fig_04_2():
    b = text(340, 28, 'けんび鏡で水中の小さな生物を見る手順', 16, INK, weight='bold')
    steps = ['① 池の水を1てき\nスライドガラスに', '② カバーガラスを\n端からそっとかける', '③ 低い倍率で\nピントを合わせる', '④ 見つけたら\n倍率を上げる']
    for i, s in enumerate(steps):
        x = 20 + i * 165
        b += f'<rect x="{x}" y="60" width="150" height="180" rx="10" fill="#fff" stroke="{INK}" stroke-width="2"/>'
        l1, l2 = s.split('\n')
        b += text(x + 75, 210, l1, 13, INK, weight='bold') + text(x + 75, 228, l2, 13, INK, weight='bold')
        if i == 0:
            b += f'<rect x="{x+20}" y="140" width="110" height="20" fill="#eef4f8" stroke="{INK}"/><circle cx="{x+75}" cy="138" r="7" fill="#9cc7e6"/>'
            b += f'<path d="M{x+75},90 l0,30" stroke="{INK}" stroke-width="2"/><rect x="{x+70}" y="80" width="10" height="16" fill="{INK}"/>'
        elif i == 1:
            b += f'<rect x="{x+20}" y="150" width="110" height="20" fill="#eef4f8" stroke="{INK}"/>'
            b += f'<line x1="{x+55}" y1="150" x2="{x+100}" y2="118" stroke="{ACC}" stroke-width="4"/>'
        elif i == 2:
            b += f'<circle cx="{x+75}" cy="130" r="45" fill="#f4fbf9" stroke="{INK}" stroke-width="2"/>' + text(x + 75, 136, '×40〜100', 12, SOFT)
        else:
            b += f'<circle cx="{x+75}" cy="130" r="45" fill="#f4fbf9" stroke="{INK}" stroke-width="2"/>'
            b += f'<ellipse cx="{x+68}" cy="128" rx="22" ry="12" fill="none" stroke="{ACC}" stroke-width="2"/><line x1="{x+90}" y1="128" x2="{x+104}" y2="118" stroke="{ACC}" stroke-width="2"/>'
            b += text(x + 75, 112, '×100〜400', 11, SOFT)
        if i < 3:
            b += arrow(x + 150, 150, x + 164, 150, INK, w=2)
    b += text(340, 272, '直射日光の当たらない、明るい場所で使う', 12, RED)
    return svg(680, 290, b, 'けんび鏡で水中の小さな生物を観察する手順')

def fig_04_4():
    b = text(360, 28, '食べる・食べられるの関係（食物連鎖の例）', 16, INK, weight='bold')
    chains = [('池や川', ['植物プランクトン', 'ミジンコ', 'メダカ', 'ザリガニ']), ('草地', ['草', 'バッタ', 'カエル', 'ヘビ'])]
    for r, (place, items) in enumerate(chains):
        y = 70 + r * 130
        b += text(40, y + 30, place, 14, SOFT, 'start', 'bold')
        for i, name in enumerate(items):
            x = 120 + i * 150
            b += box(x, y, 130, 50, name, fill='#e3f0dc' if i == 0 else '#fff', stroke=GREEN if i == 0 else INK, size=14)
            if i < len(items) - 1:
                b += arrow(x + 130, y + 25, x + 148, y + 25, INK, w=2)
    b += text(360, 335, '→ は「食べられるもの → 食べるもの」の向き', 12, SOFT)
    b += text(360, 355, 'くさりのはじまりは、日光で養分をつくる植物', 13, GREEN, weight='bold')
    return svg(720, 372, b, '食べる・食べられるの関係（食物連鎖の例）')

def fig_04_5():
    b = text(340, 28, '空気や水を通した生物と環境のかかわり（模式図）', 16, INK, weight='bold')
    b += box(60, 120, 170, 64, '動物・ヒト', '呼吸をする', fill='#fff')
    b += box(450, 120, 170, 64, '植物', '呼吸／日光で養分をつくる', fill='#e3f0dc', stroke=GREEN)
    b += arrow(230, 140, 448, 140, ACC) + text(340, 130, '二酸化炭素', 13, INK, weight='bold')
    b += arrow(450, 168, 232, 168, ACC) + text(340, 190, '酸素', 13, INK, weight='bold')
    b += box(250, 290, 180, 56, '水', '雨・川・海・水蒸気', fill='#eef6fb', stroke='#3b8bc2')
    b += f'<line x1="145" y1="186" x2="255" y2="300" stroke="#3b8bc2" stroke-width="2.5" stroke-dasharray="7 5"/><line x1="535" y1="186" x2="425" y2="300" stroke="#3b8bc2" stroke-width="2.5" stroke-dasharray="7 5"/>'
    b += text(340, 380, '生物は水を取り入れ、はい出物や蒸散で水を出す。水は形を変えてめぐる', 12, SOFT)
    return svg(680, 396, b, '空気や水を通した生物と環境のかかわりの模式図')

if __name__ == '__main__':
    for name, fn in [('03-2', fig_03_2), ('03-3', fig_03_3), ('03-4', fig_03_4), ('03-6', fig_03_6), ('04-2', fig_04_2), ('04-4', fig_04_4), ('04-5', fig_04_5)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
