# 5年理科 単元7〜9 の図（SVG）。文字はすべて <text>。
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED
from gen_fig02 import box, arrow

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'figures', 'rika', '5')
BLUE = '#3b5ba5'
WATER = '#cfe6f3'
COPPER = '#b8732e'


def stand(x, top, base):
    s = f'<rect x="{x-60}" y="{base}" width="120" height="12" rx="3" fill="#cfd6df" stroke="{INK}" stroke-width="2"/>'
    s += f'<line x1="{x-40}" y1="{base}" x2="{x-40}" y2="{top}" stroke="{INK}" stroke-width="4"/>'
    s += f'<line x1="{x-44}" y1="{top}" x2="{x+30}" y2="{top}" stroke="{INK}" stroke-width="4"/>'
    return s


def pendulum(px, py, length, angle_deg, bob=12, ghost=True):
    a = math.radians(angle_deg)
    bx, by = px + length * math.sin(a), py + length * math.cos(a)
    s = ''
    if ghost:
        gx, gy = px - length * math.sin(a), py + length * math.cos(a)
        s += f'<line x1="{px}" y1="{py}" x2="{gx:.0f}" y2="{gy:.0f}" stroke="{SOFT}" stroke-width="1.5" stroke-dasharray="5 4"/>'
        s += f'<circle cx="{gx:.0f}" cy="{gy:.0f}" r="{bob}" fill="none" stroke="{SOFT}" stroke-dasharray="4 3"/>'
    s += f'<line x1="{px}" y1="{py}" x2="{bx:.0f}" y2="{by:.0f}" stroke="{INK}" stroke-width="2"/>'
    s += f'<circle cx="{bx:.0f}" cy="{by:.0f}" r="{bob}" fill="#c9ced6" stroke="{INK}" stroke-width="2"/>'
    return s


def fig_07_1():
    b = text(360, 30, 'ふりこの長さ・ふれはば・1往復', 17, INK, weight='bold')
    px, py, L = 260, 70, 220
    b += stand(px + 10, py, py + L + 40)
    b += f'<line x1="{px}" y1="{py}" x2="{px}" y2="{py+L+20}" stroke="{SOFT}" stroke-dasharray="4 4"/>'
    b += pendulum(px, py, L, 25)
    a = math.radians(25)
    # ふれはば（角度）
    b += f'<path d="M{px},{py+70} A70,70 0 0 0 {px + 70*math.sin(a):.0f},{py + 70*math.cos(a):.0f}" fill="none" stroke="{RED}" stroke-width="2.5"/>'
    b += text(px + 40, py + 98, 'ふれはば', 13, RED, 'start', 'bold')
    # 長さ
    bx, by = px + L * math.sin(a), py + L * math.cos(a)
    b += f'<line x1="{px+14}" y1="{py-6}" x2="{bx+14:.0f}" y2="{by-6:.0f}" stroke="{ACC}" stroke-width="2" marker-end="url(#arr)" marker-start="url(#arr)"/>'
    b += text(px + 110, py + 120, 'ふりこの長さ', 13, ACC, 'start', 'bold') + text(px + 110, py + 138, '（支点からおもりの中心まで）', 12, SOFT, 'start')
    # 1往復
    gx = px - L * math.sin(a)
    b += f'<path d="M{bx:.0f},{by+28:.0f} Q{px},{by+70:.0f} {gx:.0f},{by+28:.0f}" fill="none" stroke="{BLUE}" stroke-width="2" marker-end="url(#arr)"/>'
    b += f'<path d="M{gx:.0f},{by+42:.0f} Q{px},{by+84:.0f} {bx:.0f},{by+42:.0f}" fill="none" stroke="{BLUE}" stroke-width="2" marker-end="url(#arr)"/>'
    b += text(px, by + 104, '1往復：はなした所にもどってくるまで', 13, BLUE, weight='bold')
    b += text(520, 120, '支点', 13, INK, 'start', 'bold') + f'<line x1="516" y1="116" x2="{px+4}" y2="{py}" stroke="{SOFT}"/>'
    b += text(520, 290, 'おもり', 13, INK, 'start', 'bold') + f'<line x1="516" y1="286" x2="{bx+14:.0f}" y2="{by:.0f}" stroke="{SOFT}"/>'
    return svg(720, 420, b, 'ふりこの長さ・ふれはば・1往復の意味')


def fig_07_4():
    b = text(360, 30, 'ふりこが1往復する時間（実験結果の目安）', 17, INK, weight='bold')
    # 左：重さを変える
    b += text(180, 64, 'おもりの重さを変える', 15, ACC, weight='bold') + text(180, 84, '（長さ50cm・ふれはば15°）', 12, SOFT)
    for i, (w, r) in enumerate((('10g', 9), ('20g', 12), ('30g', 15))):
        x = 90 + i * 90
        b += f'<line x1="{x}" y1="104" x2="{x}" y2="214" stroke="{INK}" stroke-width="2"/><circle cx="{x}" cy="{214+r}" r="{r}" fill="#c9ced6" stroke="{INK}" stroke-width="2"/>'
        b += text(x, 266, w, 14, INK, weight='bold') + text(x, 288, '約1.4秒', 13, INK)
    b += text(180, 318, '変わらない', 15, SOFT, weight='bold')
    # 右：長さを変える
    b += text(540, 64, 'ふりこの長さを変える', 15, ACC, weight='bold') + text(540, 84, '（おもり10g・ふれはば15°）', 12, SOFT)
    for i, (lab, L, t) in enumerate((('25cm', 55, '約1.0秒'), ('50cm', 110, '約1.4秒'), ('100cm', 150, '約2.0秒'))):
        x = 450 + i * 90
        b += f'<line x1="{x}" y1="104" x2="{x}" y2="{104+L}" stroke="{INK}" stroke-width="2"/><circle cx="{x}" cy="{104+L+9}" r="9" fill="#c9ced6" stroke="{INK}" stroke-width="2"/>'
        b += text(x, 288, lab, 14, INK, weight='bold') + text(x, 308, t, 13, ACC, weight='bold')
    b += text(540, 338, '長いほど、1往復の時間が長くなる', 15, ACC, weight='bold')
    b += f'<line x1="360" y1="60" x2="360" y2="340" stroke="{SOFT}" stroke-dasharray="5 4"/>'
    b += text(360, 380, 'ふれはばを変えても、1往復する時間はほとんど変わらない', 13, SOFT)
    return svg(720, 400, b, 'おもりの重さやふりこの長さを変えたときの1往復する時間の目安')


def balance(x, y, reading):
    s = f'<rect x="{x-80}" y="{y}" width="160" height="40" rx="6" fill="#dde3ea" stroke="{INK}" stroke-width="2"/>'
    s += f'<rect x="{x-70}" y="{y-8}" width="140" height="8" rx="2" fill="#c3cbd5" stroke="{INK}" stroke-width="1.5"/>'
    s += f'<rect x="{x-38}" y="{y+12}" width="76" height="20" fill="#1f2a44"/>' + text(x, y + 28, reading, 14, '#7ee0a8', weight='bold')
    return s


def fig_08_3():
    b = text(360, 30, '食塩をとかす前と後の重さを比べる', 17, INK, weight='bold')
    # 前
    b += text(190, 62, 'とかす前', 16, INK, weight='bold')
    b += f'<path d="M140,110 L140,190 L220,190 L220,110" fill="none" stroke="{INK}" stroke-width="2.5"/><rect x="142" y="140" width="76" height="48" fill="{WATER}"/>'
    b += f'<rect x="136" y="102" width="88" height="8" rx="2" fill="{INK}"/>'
    b += f'<path d="M232,186 l40,0 l-6,-8 l-28,0 z" fill="#fff" stroke="{INK}" stroke-width="1.5"/>'
    for dx in (242, 250, 258):
        b += f'<rect x="{dx}" y="172" width="5" height="5" fill="#eee" stroke="{SOFT}"/>'
    b += text(256, 166, '食塩', 12, SOFT)
    b += balance(200, 200, '105.0 g')
    b += text(200, 272, '水＋容器＋食塩＋薬包紙', 13, SOFT)
    # 後
    b += text(530, 62, 'とかした後', 16, INK, weight='bold')
    b += f'<path d="M480,110 L480,190 L560,190 L560,110" fill="none" stroke="{INK}" stroke-width="2.5"/><rect x="482" y="140" width="76" height="48" fill="{WATER}"/>'
    b += f'<rect x="476" y="102" width="88" height="8" rx="2" fill="{INK}"/>'
    b += f'<path d="M572,186 l40,0 l-6,-8 l-28,0 z" fill="#fff" stroke="{INK}" stroke-width="1.5"/>'
    b += balance(540, 200, '105.0 g')
    b += text(540, 272, '食塩水＋容器＋薬包紙', 13, SOFT)
    b += arrow(300, 150, 420, 150, INK) + text(360, 138, 'よくふって', 12, SOFT) + text(360, 172, 'とかす', 12, SOFT)
    b += text(360, 314, 'とかす前と後で、全体の重さは変わらない（数値は例）', 14, ACC, weight='bold')
    return svg(720, 334, b, '食塩を水にとかす前と後の重さを電子てんびんで比べる')


def fig_08_5():
    b = text(360, 30, 'メスシリンダーの目もりの読み方', 17, INK, weight='bold')
    # メスシリンダー拡大
    b += f'<rect x="120" y="60" width="90" height="240" fill="none" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<path d="M122,182 Q165,198 208,182 L208,298 L122,298 z" fill="{WATER}"/>'
    for i in range(11):
        y = 120 + i * 14
        w = 30 if i % 5 == 0 else 16
        b += f'<line x1="{210-w}" y1="{y}" x2="208" y2="{y}" stroke="{INK}" stroke-width="1.5"/>'
    b += text(222, 124, '55', 12, SOFT, 'start') + text(222, 194, '50', 12, SOFT, 'start') + text(222, 264, '45', 12, SOFT, 'start')
    b += f'<line x1="40" y1="190" x2="120" y2="190" stroke="{ACC}" stroke-width="2" stroke-dasharray="4 3"/>'
    b += f'<circle cx="38" cy="190" r="10" fill="#fff" stroke="{INK}" stroke-width="2"/><circle cx="40" cy="190" r="4" fill="{INK}"/>'
    b += text(14, 214, '目の高さを液面に', 12, ACC, 'start') + text(14, 230, '合わせる', 12, ACC, 'start')
    b += text(330, 166, 'へこんだ液面の下のところを読む', 14, INK, 'start', 'bold')
    b += f'<line x1="326" y1="160" x2="200" y2="190" stroke="{SOFT}"/>'
    b += text(330, 190, '→ この図は 50mL', 14, ACC, 'start', 'bold')
    steps = ['1　水平な所に置く', '2　目もりより少し少なめに水を入れる', '3　スポイトで少しずつ入れて合わせる']
    for i, st in enumerate(steps):
        b += text(330, 240 + i * 26, st, 13, INK, 'start')
    return svg(720, 330, b, 'メスシリンダーで水50mLをはかりとるときの目もりの読み方')


def beaker(x, y, w, h, fill=WATER, level=0.55):
    s = f'<path d="M{x},{y} L{x},{y+h} L{x+w},{y+h} L{x+w},{y}" fill="none" stroke="{INK}" stroke-width="2.5"/>'
    s += f'<rect x="{x+2}" y="{y + h*(1-level):.0f}" width="{w-4}" height="{h*level-2:.0f}" fill="{fill}"/>'
    return s


def thermometer(x, top, bottom):
    return f'<rect x="{x-4}" y="{top}" width="8" height="{bottom-top}" rx="4" fill="#fff" stroke="{INK}" stroke-width="1.5"/><circle cx="{x}" cy="{bottom}" r="7" fill="{RED}"/><line x1="{x}" y1="{bottom}" x2="{x}" y2="{top+30}" stroke="{RED}" stroke-width="3"/>'


def fig_08_9():
    b = text(360, 30, '湯せんで水よう液をあたためる', 17, INK, weight='bold')
    b += f'<path d="M150,120 L170,300 L450,300 L470,120" fill="#fbe9dd" stroke="{INK}" stroke-width="2.5"/>'
    b += text(310, 322, '湯（約60℃・先生が用意する）', 13, SOFT)
    b += beaker(250, 110, 120, 170, '#eaf4fa', 0.6)
    for dx in (270, 300, 330):
        b += f'<rect x="{dx}" y="262" width="8" height="8" fill="#fff" stroke="{SOFT}"/>'
    b += text(242, 140, '水50mL＋', 13, INK, 'end', 'bold') + text(242, 158, 'とけ残り', 13, INK, 'end', 'bold')
    b += thermometer(345, 70, 250)
    b += f'<line x1="285" y1="60" x2="300" y2="250" stroke="{SOFT}" stroke-width="4"/>' + text(240, 66, 'ガラス棒', 12, SOFT, 'end')
    b += text(500, 160, '温度計で温度を確かめる', 13, INK, 'start')
    b += text(500, 186, 'ガラス棒でかき混ぜる', 13, INK, 'start')
    b += text(500, 212, '（温度計でかき混ぜない）', 12, RED, 'start')
    b += text(500, 252, 'とけたら、さらに1ぱい', 13, INK, 'start') + text(500, 272, 'ずつ加えて調べる', 13, INK, 'start')
    return svg(720, 340, b, '湯せんでとけ残りのある水よう液をあたためる方法')


def fig_08_10():
    b = text(360, 30, '水50mLにとける量と水の温度（目安）', 17, INK, weight='bold')
    x0, y0, hmax = 110, 320, 240
    vmax = 30
    b += f'<line x1="{x0}" y1="{y0}" x2="{x0+540}" y2="{y0}" stroke="{INK}" stroke-width="2"/><line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-hmax-10}" stroke="{INK}" stroke-width="2"/>'
    for v in (0, 10, 20, 30):
        y = y0 - hmax * v / vmax
        b += f'<line x1="{x0}" y1="{y:.0f}" x2="{x0+540}" y2="{y:.0f}" stroke="#e3e8ee"/>' + text(x0 - 10, y + 5, f'{v}g', 12, SOFT, 'end')
    data = [('10℃', 17.9, 3.8), ('30℃', 18.0, 8.3), ('60℃', 18.5, 28.7)]
    for i, (t, salt, alum) in enumerate(data):
        cx = x0 + 90 + i * 180
        for k, (v, color, lab) in enumerate(((salt, '#9aa7b8', '食塩'), (alum, ACC, 'ミョウバン'))):
            h = hmax * v / vmax
            bx = cx - 50 + k * 54
            b += f'<rect x="{bx}" y="{y0-h:.0f}" width="46" height="{h:.0f}" fill="{color}"/>'
            b += text(bx + 23, y0 - h - 6, f'{v}', 12, INK, weight='bold')
        b += text(cx, y0 + 22, t, 14, INK, weight='bold')
    b += f'<rect x="470" y="56" width="14" height="14" fill="#9aa7b8"/>' + text(490, 68, '食塩', 13, INK, 'start')
    b += f'<rect x="540" y="56" width="14" height="14" fill="{ACC}"/>' + text(560, 68, 'ミョウバン', 13, INK, 'start')
    b += text(360, 372, 'ミョウバンは温度が上がるととける量が大きく増える。食塩はほとんど変わらない', 13, SOFT)
    return svg(720, 392, b, '水50mLにとける食塩とミョウバンの量と水の温度の関係（目安）')


def fig_08_11():
    b = text(360, 30, 'ろ過のしかた', 17, INK, weight='bold')
    # ろうと台
    b += f'<line x1="200" y1="90" x2="200" y2="330" stroke="{INK}" stroke-width="4"/><rect x="150" y="330" width="120" height="10" fill="#cfd6df" stroke="{INK}"/>'
    b += f'<line x1="200" y1="150" x2="330" y2="150" stroke="{INK}" stroke-width="4"/>'
    # ろうと
    b += f'<path d="M290,140 L370,140 L336,200 L336,250 L324,250 L324,200 z" fill="#f4f7fa" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<path d="M298,144 L362,144 L330,196 z" fill="#fff" stroke="{SOFT}" stroke-dasharray="4 3"/>'
    # ビーカー（下）
    b += beaker(300, 240, 110, 90, WATER, 0.3)
    b += f'<line x1="330" y1="250" x2="330" y2="305" stroke="{SOFT}" stroke-dasharray="3 3"/>'
    # ガラス棒と注ぐビーカー
    b += f'<line x1="300" y1="70" x2="340" y2="170" stroke="{SOFT}" stroke-width="4"/>'
    b += f'<path d="M230,60 L240,110 L300,96 L290,48 z" fill="#eaf4fa" stroke="{INK}" stroke-width="2"/>'
    b += text(470, 100, 'ガラス棒に伝わらせて', 13, INK, 'start') + text(470, 118, '少しずつ注ぐ', 13, INK, 'start') + f'<line x1="466" y1="106" x2="320" y2="120" stroke="{SOFT}"/>'
    b += text(470, 170, 'ろ紙（水でぬらして', 13, INK, 'start') + text(470, 188, 'ろうとにつける）', 13, INK, 'start') + f'<line x1="466" y1="176" x2="350" y2="170" stroke="{SOFT}"/>'
    b += text(470, 250, 'ろうとの先の長い方を', 13, INK, 'start') + text(470, 268, 'ビーカーのかべにつける', 13, INK, 'start') + f'<line x1="466" y1="256" x2="338" y2="250" stroke="{SOFT}"/>'
    b += text(470, 316, 'ろ液（ろ紙を通った液）', 13, ACC, 'start', 'bold') + f'<line x1="466" y1="312" x2="400" y2="312" stroke="{SOFT}"/>'
    # ろ紙の折り方
    b += text(90, 150, 'ろ紙の折り方', 13, INK, weight='bold')
    b += f'<circle cx="90" cy="200" r="34" fill="#fff" stroke="{INK}" stroke-width="1.5"/><line x1="56" y1="200" x2="124" y2="200" stroke="{SOFT}"/><line x1="90" y1="166" x2="90" y2="234" stroke="{SOFT}"/>'
    b += text(90, 256, '4つ折りにして', 12, SOFT) + text(90, 272, '円すい形に開く', 12, SOFT)
    return svg(720, 360, b, 'ろうととろ紙を使ったろ過のしかた')


def fig_08_13():
    b = text(360, 30, '水よう液から水をじょう発させる', 17, INK, weight='bold')
    # こんろ
    b += f'<rect x="140" y="250" width="220" height="60" rx="8" fill="#dde3ea" stroke="{INK}" stroke-width="2"/>'
    b += f'<path d="M230,250 q20,-30 40,0" fill="#ffd166" stroke="#e08a00" stroke-width="1.5"/>'
    b += f'<rect x="170" y="226" width="160" height="8" fill="none" stroke="{SOFT}" stroke-width="2"/>' + text(150, 230, '金あみ', 12, SOFT, 'end')
    b += f'<path d="M200,212 Q250,240 300,212 z" fill="#eef1f4" stroke="{INK}" stroke-width="2"/>'
    for dx in (236, 248, 262):
        b += f'<rect x="{dx}" y="214" width="5" height="5" fill="#fff" stroke="{SOFT}"/>'
    b += text(250, 196, 'じょう発皿', 12, SOFT)
    b += f'<path d="M232,190 q-6,-14 2,-26 M254,186 q-6,-14 2,-26 M276,190 q-6,-14 2,-26" fill="none" stroke="#9cc7e6" stroke-width="2"/>'
    b += text(250, 140, '水じょう気', 12, SOFT)
    b += text(250, 336, '実験用ガスこんろ（弱火）', 13, SOFT)
    steps = [('1', 'じょう発皿に水よう液を少量とる'), ('2', '弱火でゆっくり熱する'), ('3', '少し液が残るうちに火を止める'), ('4', '余熱で水をじょう発させる'), ('5', '残ったつぶを虫めがねで見る')]
    for i, (n, st) in enumerate(steps):
        b += text(420, 120 + i * 32, f'{n}　{st}', 14, INK, 'start')
    b += text(420, 300, '真上から顔をのぞきこまない', 13, RED, 'start', 'bold')
    b += text(420, 320, '（液がはねることがある）', 12, RED, 'start')
    return svg(720, 356, b, '水よう液を加熱して水をじょう発させる手順')


def coil(x, y, w, turns, h=40):
    s = f'<rect x="{x-14}" y="{y-12}" width="{w+28}" height="24" rx="4" fill="#9aa1ab" stroke="{INK}" stroke-width="2"/>'
    for i in range(turns):
        cx = x + i * w / (turns - 1)
        s += f'<ellipse cx="{cx:.0f}" cy="{y}" rx="4" ry="{h/2}" fill="none" stroke="{COPPER}" stroke-width="2.5"/>'
    return s


def fig_09_2():
    b = text(360, 30, '電磁石のつくり方', 17, INK, weight='bold')
    b += coil(200, 150, 240, 16)
    b += text(320, 112, 'エナメル線を同じ向きに100回巻く（コイル）', 13, INK, weight='bold')
    b += text(320, 210, '鉄心（鉄くぎ・ボルト）', 13, INK) + f'<line x1="320" y1="194" x2="320" y2="164" stroke="{SOFT}"/>'
    b += f'<path d="M200,170 C170,220 120,230 90,250" fill="none" stroke="{COPPER}" stroke-width="2.5"/>'
    b += f'<path d="M440,170 C470,220 520,230 560,250" fill="none" stroke="{COPPER}" stroke-width="2.5"/>'
    b += f'<line x1="78" y1="256" x2="92" y2="250" stroke="#c9a46b" stroke-width="5"/><line x1="560" y1="250" x2="574" y2="256" stroke="#c9a46b" stroke-width="5"/>'
    b += text(90, 282, '両はし約2cmのエナメルを', 12, RED) + text(90, 298, '紙やすりではがす', 12, RED)
    b += text(560, 282, 'かん電池・スイッチに', 12, SOFT) + text(560, 298, 'つなぐ', 12, SOFT)
    b += text(360, 336, 'エナメル線は全部同じ向きに巻く。巻き終わりはセロハンテープでとめる', 13, SOFT)
    return svg(720, 356, b, 'エナメル線を巻いたコイルに鉄心を入れて電磁石をつくる')


def compass(cx, cy, north_left):
    s = f'<circle cx="{cx}" cy="{cy}" r="22" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    ang = 180 if north_left else 0
    a = math.radians(ang)
    nx, ny = cx + 16 * math.cos(a), cy + 16 * math.sin(a)
    sx, sy = cx - 16 * math.cos(a), cy - 16 * math.sin(a)
    s += f'<path d="M{nx:.0f},{ny:.0f} L{cx},{cy-5} L{cx},{cy+5} z" fill="{RED}"/><path d="M{sx:.0f},{sy:.0f} L{cx},{cy-5} L{cx},{cy+5} z" fill="#7f8a99"/>'
    return s


def fig_09_5():
    b = text(360, 30, '方位磁針で電磁石の極を調べる', 17, INK, weight='bold')
    for row, (y, label, left_pole, right_pole) in enumerate(((120, 'かん電池の向き：そのまま', 'N', 'S'), (270, 'かん電池の向きを逆にする', 'S', 'N'))):
        b += text(360, y - 52, label, 15, INK, weight='bold')
        b += coil(260, y, 200, 12)
        b += text(232, y + 6, left_pole, 18, RED if left_pole == 'N' else BLUE, 'end', 'bold')
        b += text(488, y + 6, right_pole, 18, RED if right_pole == 'N' else BLUE, 'start', 'bold')
        # 方位磁針：N極にはS（はりの青側）が向く→はりのN（赤）は電磁石から遠ざかる向き
        b += compass(170, y, north_left=(left_pole == 'N'))
        b += compass(570, y, north_left=(right_pole == 'S'))
    b += text(360, 352, '方位磁針の赤い側（N）が引きつけられた方が電磁石のS極。電流の向きを変えると極が入れかわる', 12, SOFT)
    return svg(720, 372, b, '方位磁針で電磁石の極を調べ、電流の向きを変えると極が入れかわる様子')


def fig_09_7():
    b = text(360, 30, '電磁石の強さを比べる実験の条件', 17, INK, weight='bold')
    rows = [['', '電流の大きさを変える', 'コイルの巻数を変える'],
            ['変える条件', 'かん電池1個 ／ 2個（直列）', '100回巻き ／ 200回巻き'],
            ['同じにする条件', '巻数・導線の長さ・鉄心', '電流の大きさ・導線の長さ・鉄心'],
            ['強さの比べ方', '引きつけるゼムクリップの数', '引きつけるゼムクリップの数']]
    widths = [150, 270, 270]
    y = 60
    for r, row in enumerate(rows):
        x = 15
        for c, cell in enumerate(row):
            fill = '#eef3ee' if r == 0 or c == 0 else '#fff'
            b += f'<rect x="{x}" y="{y}" width="{widths[c]}" height="46" fill="{fill}" stroke="{SOFT}"/>'
            col = ACC if r == 1 and c > 0 else INK
            b += text(x + widths[c]/2, y + 29, cell, 14, col, weight='bold' if r == 0 or c == 0 or r == 1 else 'normal')
            x += widths[c]
        y += 46
    b += text(360, 270, '巻数を比べるときは、エナメル線全体の長さをそろえ、あまった分は巻かずに束ねておく', 13, SOFT)
    return svg(720, 290, b, '電流の大きさとコイルの巻数を変えて電磁石の強さを比べる実験の条件')


def fig_09_8():
    b = text(360, 30, '電流計のつなぎ方', 17, INK, weight='bold')
    # 回路
    b += f'<rect x="120" y="80" width="480" height="200" rx="16" fill="none" stroke="{INK}" stroke-width="3"/>'
    # 電池
    b += f'<rect x="140" y="150" width="40" height="70" fill="#fff" stroke="{INK}" stroke-width="2"/><rect x="150" y="142" width="20" height="8" fill="{INK}"/>' + text(160, 240, 'かん電池', 12, SOFT)
    # スイッチ
    b += f'<rect x="280" y="62" width="70" height="36" rx="4" fill="#fff" stroke="{INK}" stroke-width="2"/>' + text(315, 86, 'スイッチ', 12, INK)
    # 電磁石
    b += f'<rect x="530" y="140" width="60" height="90" fill="#fff" stroke="none"/>' + coil(540, 185, 40, 6, 30) + text(560, 250, '電磁石', 12, SOFT)
    # 電流計
    b += f'<rect x="300" y="244" width="120" height="72" rx="8" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<path d="M320,290 A40,40 0 0 1 400,290" fill="none" stroke="{SOFT}"/><line x1="360" y1="300" x2="380" y2="262" stroke="{RED}" stroke-width="2"/>'
    b += text(360, 336, '電流計', 13, INK, weight='bold')
    b += text(312, 310, '＋', 13, RED, weight='bold') + text(412, 310, '−（5A）', 12, INK, 'end', 'bold')
    b += text(360, 180, '電流計は回路に直列につなぐ', 14, ACC, weight='bold')
    b += text(360, 372, '−たんしは、はじめに5Aにつなぎ、はりのふれが小さいときは500mA、50mAにつなぎかえる', 12, SOFT)
    b += text(360, 392, '電流計をかん電池だけに直接つないではいけない', 12, RED, weight='bold')
    return svg(720, 408, b, '電流計を回路に直列につなぐ方法と−たんしの使い方')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('07-1', fig_07_1), ('07-4', fig_07_4), ('08-3', fig_08_3), ('08-5', fig_08_5), ('08-9', fig_08_9), ('08-10', fig_08_10),
                     ('08-11', fig_08_11), ('08-13', fig_08_13), ('09-2', fig_09_2), ('09-5', fig_09_5), ('09-7', fig_09_7), ('09-8', fig_09_8)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
