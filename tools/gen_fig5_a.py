# 5年理科 単元1〜3 の図（SVG）。文字はすべて <text>。
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED
from gen_fig02 import box, arrow, BLUE

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'figures', 'rika', '5')
GREEN = '#4f8a3c'
SKY = '#e6f1f7'


def cloud(cx, cy, s=1.0, fill='#fff', stroke=SOFT):
    parts = [(-22, 6, 18), (0, -6, 22), (22, 4, 18), (8, 10, 16), (-10, 10, 16)]
    return ''.join(f'<circle cx="{cx + dx*s:.1f}" cy="{cy + dy*s:.1f}" r="{r*s:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>' for dx, dy, r in parts) + \
        ''.join(f'<circle cx="{cx + dx*s:.1f}" cy="{cy + dy*s:.1f}" r="{r*s-1.5:.1f}" fill="{fill}"/>' for dx, dy, r in parts)


def sky_panel(x, y, w, h, n_clouds, label, rng, weather):
    cid = f'sky{x}'
    s = f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/></clipPath>'
    s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{SKY}"/>'
    pos = [(0.3, 0.32), (0.72, 0.3), (0.5, 0.68), (0.22, 0.72), (0.8, 0.7), (0.5, 0.22), (0.12, 0.45), (0.9, 0.45), (0.35, 0.5), (0.65, 0.5), (0.1, 0.15), (0.9, 0.15), (0.1, 0.9), (0.9, 0.92), (0.5, 0.95)]
    n = n_clouds if n_clouds < 10 else len(pos)
    s += f'<g clip-path="url(#{cid})">'
    for i in range(n):
        px, py = pos[i]
        s += cloud(x + w*px, y + h*py, 0.95, '#fff' if weather != 'くもり' else '#e4e7ec')
    s += '</g>'
    s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="none" stroke="{INK}" stroke-width="2"/>'
    s += text(x + w/2, y + h + 30, label, 17, INK, weight='bold')
    s += text(x + w/2, y + h + 54, f'雲の量 {rng}', 14, SOFT)
    return s


def fig_01_2():
    b = text(360, 30, '雲の量と天気の決め方（空全体を10としたとき）', 17, INK, weight='bold')
    b += sky_panel(30, 60, 200, 160, 1, '快晴', '0〜1', '快晴')
    b += sky_panel(260, 60, 200, 160, 5, '晴れ', '2〜8', '晴れ')
    b += sky_panel(490, 60, 200, 160, 10, 'くもり', '9〜10', 'くもり')
    b += text(360, 310, '雨や雪が降っているときは、雲の量に関係なく「雨」「雪」とする', 13, SOFT)
    return svg(720, 330, b, '雲の量による快晴・晴れ・くもりの決め方')


def japan(ox, oy):
    # 日本列島の模式（本州は太い線、北海道・四国・九州は楕円）
    land = '#f4efe3'
    d = f'M{ox+45},{oy+170} Q{ox+95},{oy+150} {ox+130},{oy+120} T{ox+175},{oy+40}'
    s = f'<path d="{d}" stroke="{INK}" stroke-width="27" fill="none" stroke-linecap="round"/>'
    s += f'<path d="{d}" stroke="{land}" stroke-width="23" fill="none" stroke-linecap="round"/>'
    for cx, cy, rx, ry, rot in ((ox+190, oy+12, 24, 17, -10), (ox+28, oy+190, 13, 18, 10), (ox+78, oy+182, 14, 7, -15)):
        s += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="{land}" stroke="{INK}" stroke-width="1.5"/>'
    return s


def fig_01_4():
    b = text(360, 30, '日本付近の雲の動き（3日間の雲画像を並べたときの模式図）', 16, INK, weight='bold')
    days = [('1日目', 0), ('2日目', 1), ('3日目', 2)]
    for i, (lab, k) in enumerate(days):
        x = 20 + i * 235
        b += f'<clipPath id="d{i}"><rect x="{x}" y="56" width="220" height="250" rx="8"/></clipPath>'
        b += f'<rect x="{x}" y="56" width="220" height="250" rx="8" fill="#e8f1f7"/>'
        b += japan(x + 5, 90)
        cx = x + 45 + k * 65
        b += f'<g clip-path="url(#d{i})" opacity=".92">' + cloud(cx, 190 - k * 30, 1.2, '#fff', INK) + '</g>'
        b += f'<rect x="{x}" y="56" width="220" height="250" rx="8" fill="none" stroke="{SOFT}" stroke-width="1.5"/>'
        b += text(x + 110, 326, lab, 15, INK, weight='bold')
        b += text(x + 22, 76, '西', 13, SOFT) + text(x + 200, 76, '東', 13, SOFT)
    b += arrow(80, 360, 640, 360, ACC, w=3)
    b += text(360, 390, '雲はおよそ西から東へ動き、天気もおよそ西から東へ変わる', 14, ACC, weight='bold')
    return svg(720, 410, b, '日本付近の雲が西から東へ動く様子の模式図')


def seeds(x, y, n=5, sprout=False):
    s = ''
    for i in range(n):
        sx = x + i * 22
        s += f'<ellipse cx="{sx}" cy="{y}" rx="9" ry="6" fill="#c7a27a" stroke="{INK}" stroke-width="1.2"/>'
        if sprout:
            s += f'<path d="M{sx},{y-4} q-2,-14 6,-22" stroke="{GREEN}" stroke-width="2.5" fill="none"/>'
    return s


def cup(x, y, w=130, label='', water=True, under=False, sprout=False, cover=False):
    s = f'<path d="M{x},{y} L{x+12},{y+80} L{x+w-12},{y+80} L{x+w},{y}" fill="none" stroke="{INK}" stroke-width="2.5"/>'
    s += f'<rect x="{x+10}" y="{y+56}" width="{w-20}" height="20" fill="#fbfbf7" stroke="{SOFT}" stroke-dasharray="3 3"/>'
    if water and not under:
        s += f'<rect x="{x+10}" y="{y+62}" width="{w-20}" height="14" fill="#cfe6f3" opacity=".8"/>'
    if under:
        s += f'<path d="M{x+5},{y+20} L{x+12},{y+80} L{x+w-12},{y+80} L{x+w-5},{y+20} z" fill="#cfe6f3" opacity=".8"/>'
        s += seeds(x + 22, y + 60, 4, sprout)
    else:
        s += seeds(x + 22, y + 52, 4, sprout)
    if cover:
        s += f'<rect x="{x-12}" y="{y-40}" width="{w+24}" height="128" rx="6" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="8 5"/>'
    if label:
        s += text(x + w/2, y + 108, label, 14, INK, weight='bold')
    return s


def table_rows(x, y, rows, widths, head_fill='#eef3ee'):
    s = ''
    cy = y
    for r, row in enumerate(rows):
        cx = x
        for c, cell in enumerate(row):
            fill = head_fill if r == 0 else '#fff'
            s += f'<rect x="{cx}" y="{cy}" width="{widths[c]}" height="30" fill="{fill}" stroke="{SOFT}"/>'
            color = ACC if cell in ('変える', 'あり', 'あたえる', '当てる') and r > 0 and c > 0 else INK
            s += text(cx + widths[c]/2, cy + 20, cell, 13, color, weight='bold' if r == 0 or c == 0 else 'normal')
            cx += widths[c]
        cy += 30
    return s


def fig_02_2():
    b = text(360, 30, '発芽と水の関係を調べる', 17, INK, weight='bold')
    b += cup(90, 70, label='ア　水をあたえる', water=True)
    b += cup(300, 70, label='イ　水をあたえない', water=False)
    b += table_rows(470, 70, [['条件', 'ア', 'イ'], ['水', 'あり', 'なし'], ['空気', 'ふれる', 'ふれる'], ['温度', '室温', '室温'], ['置き場所', '同じ', '同じ']], [70, 80, 80])
    b += text(360, 250, '調べたい条件（水）だけを変え、ほかの条件はすべて同じにする', 14, ACC, weight='bold')
    return svg(720, 270, b, '発芽と水の関係を調べる実験の条件')


def fig_02_5():
    b = text(360, 30, '発芽と温度・空気の関係を調べる', 17, INK, weight='bold')
    b += text(185, 62, '温度を変える', 15, ACC, weight='bold') + text(535, 62, '空気を変える', 15, ACC, weight='bold')
    b += f'<line x1="360" y1="50" x2="360" y2="250" stroke="{SOFT}" stroke-dasharray="5 4"/>'
    # 冷蔵庫
    b += f'<rect x="40" y="80" width="140" height="140" rx="8" fill="#eaf2f8" stroke="{INK}" stroke-width="2"/>' + text(110, 98, '冷蔵庫の中', 12, SOFT)
    b += cup(50, 115, 120, water=True)
    b += text(110, 240, '約5℃（暗い）', 13, INK, weight='bold')
    b += cup(200, 115, 120, water=True, cover=True)
    b += text(260, 240, '室温（箱で暗くする）', 13, INK, weight='bold')
    b += cup(390, 115, 120, water=True)
    b += text(450, 240, '空気にふれる', 13, INK, weight='bold')
    b += cup(560, 115, 120, under=True)
    b += text(620, 240, '水にしずめる', 13, INK, weight='bold')
    b += text(360, 280, '温度を比べるときは明るさもそろえる（冷蔵庫の中は暗いので、室温のものに箱をかぶせる）', 13, SOFT)
    return svg(720, 300, b, '発芽と温度・空気の関係を調べる実験')


def bean_half(cx, cy, color, label, sub):
    s = f'<ellipse cx="{cx}" cy="{cy}" rx="70" ry="44" fill="{color}" stroke="{INK}" stroke-width="2.5"/>'
    s += f'<path d="M{cx-58},{cy-8} q14,-14 30,-6" stroke="{GREEN}" stroke-width="4" fill="none"/>'
    s += text(cx, cy + 74, label, 15, INK, weight='bold') + text(cx, cy + 96, sub, 13, SOFT)
    return s


def fig_02_7():
    b = text(360, 30, '子葉にヨウ素液をつけると', 17, INK, weight='bold')
    b += bean_half(190, 120, BLUE, '発芽前の種子', '青むらさき色に変わる')
    b += text(190, 240, '→ でんぷんがある', 14, ACC, weight='bold')
    b += f'<ellipse cx="530" cy="120" rx="50" ry="28" fill="#efe6c9" stroke="{INK}" stroke-width="2.5"/>'
    b += text(530, 194, '発芽後のしぼんだ子葉', 15, INK, weight='bold') + text(530, 216, 'ほとんど色が変わらない', 13, SOFT)
    b += text(530, 240, '→ でんぷんが使われた', 14, ACC, weight='bold')
    b += arrow(290, 120, 450, 120, INK, dash=True) + text(370, 108, '発芽して育つ', 12, SOFT)
    b += text(110, 70, '根・くき・葉になる部分', 12, GREEN)
    return svg(720, 260, b, '発芽前の種子としぼんだ子葉にヨウ素液をつけたときのちがい')


def plant(x, base, h, leaves, color=GREEN, pale=False):
    leaf_fill = '#f2f0c9' if pale else '#cfe6bf'
    s = f'<line x1="{x}" y1="{base}" x2="{x}" y2="{base-h}" stroke="{color}" stroke-width="{2.5 if pale else 4}"/>'
    for i in range(leaves):
        y = base - 20 - i * (h - 20) / max(leaves, 1)
        side = 1 if i % 2 else -1
        s += f'<ellipse cx="{x + side*18}" cy="{y:.0f}" rx="{16 if not pale else 10}" ry="8" transform="rotate({side*-20} {x + side*18} {y:.0f})" fill="{leaf_fill}" stroke="{color}" stroke-width="1.5"/>'
    return s


def pot(x, base):
    return f'<path d="M{x-40},{base} h80 l-8,40 h-64 z" fill="#d9b38c" stroke="{INK}" stroke-width="2"/>'


def fig_02_9():
    b = text(360, 30, '日光や肥料と植物の成長（1〜2週間後）', 17, INK, weight='bold')
    cols = [('ア', '日光：当てる', '肥料：あたえる', 170, 6, False, 'よく育つ'),
            ('イ', '日光：当てる', '肥料：あたえない', 110, 4, False, 'アほど育たない'),
            ('ウ', '日光：当てない', '肥料：あたえる', 180, 3, True, '葉が黄色く、ひょろ長い')]
    for i, (k, l1, l2, h, n, pale, res) in enumerate(cols):
        x = 130 + i * 230
        base = 280
        if pale:
            b += f'<rect x="{x-70}" y="{base-200}" width="140" height="240" rx="6" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="8 5"/>' + text(x, base - 206, '箱をかぶせる', 12, SOFT)
        else:
            b += f'<circle cx="{x+60}" cy="80" r="14" fill="#ffd166" stroke="#e08a00"/>'
        b += plant(x, base, h, n, pale=pale) + pot(x, base)
        b += text(x, 350, f'{k}　{l1}', 14, INK, weight='bold') + text(x, 372, l2, 14, INK, weight='bold')
        b += text(x, 398, res, 13, ACC if i == 0 else SOFT, weight='bold')
    b += text(360, 430, '土は肥料をふくまないもの（バーミキュライトなど）を使い、水は同じ量をあたえる', 13, SOFT)
    return svg(720, 450, b, '日光や肥料の条件を変えたインゲンマメのなえの育ち方')


def medaka(x, y, male, s=1.0):
    body = f'<path d="M{x},{y} q{60*s},{-26*s} {130*s},0 q{-70*s},{26*s} {-130*s},0 z" fill="#f3e3c3" stroke="{INK}" stroke-width="2"/>'
    eye = f'<circle cx="{x+20*s}" cy="{y-3*s}" r="{4*s}" fill="{INK}"/>'
    tail = f'<path d="M{x+128*s},{y} l{24*s},{-16*s} l0,{32*s} z" fill="#f3e3c3" stroke="{INK}" stroke-width="2"/>'
    if male:
        dorsal = f'<path d="M{x+86*s},{y-14*s} l{14*s},{-12*s} l{10*s},{10*s}" fill="#f3e3c3" stroke="{RED}" stroke-width="2.5"/>'
        dorsal += f'<line x1="{x+96*s}" y1="{y-22*s}" x2="{x+100*s}" y2="{y-18*s}" stroke="{RED}" stroke-width="2"/>'
        anal = f'<path d="M{x+60*s},{y+12*s} L{x+66*s},{y+26*s} L{x+116*s},{y+18*s} L{x+112*s},{y+8*s}" fill="#f3e3c3" stroke="{RED}" stroke-width="2.5"/>'
    else:
        dorsal = f'<path d="M{x+88*s},{y-13*s} l{14*s},{-10*s} l{8*s},{8*s}" fill="#f3e3c3" stroke="{RED}" stroke-width="2.5"/>'
        anal = f'<path d="M{x+76*s},{y+10*s} L{x+82*s},{y+20*s} L{x+112*s},{y+16*s} L{x+110*s},{y+8*s}" fill="#f3e3c3" stroke="{RED}" stroke-width="2.5"/>'
    return tail + body + dorsal + anal + eye


def fig_03_1():
    b = text(360, 30, 'メダカのおすとめすの見分け方', 17, INK, weight='bold')
    b += text(190, 70, 'おす', 18, INK, weight='bold') + text(530, 70, 'めす', 18, INK, weight='bold')
    b += medaka(90, 150, True, 1.3) + medaka(430, 150, False, 1.3)
    b += text(190, 230, 'せびれに切れこみがある', 14, RED, weight='bold') + text(190, 252, 'しりびれが平行四辺形に近く、大きい', 14, RED, weight='bold')
    b += text(530, 230, 'せびれに切れこみがない', 14, RED, weight='bold') + text(530, 252, 'しりびれのうしろが短い', 14, RED, weight='bold')
    b += text(360, 290, '赤い線のひれ（せびれ・しりびれ）の形で見分ける', 13, SOFT)
    return svg(720, 310, b, 'メダカのおすとめすのせびれ・しりびれのちがい')


def fig_03_2():
    b = text(360, 30, 'かいぼうけんび鏡でメダカの卵を観察する', 17, INK, weight='bold')
    # けんび鏡
    b += f'<rect x="120" y="270" width="200" height="22" rx="4" fill="#cfd6df" stroke="{INK}" stroke-width="2"/>'
    b += f'<rect x="205" y="120" width="30" height="150" fill="#dde3ea" stroke="{INK}" stroke-width="2"/>'
    b += f'<rect x="130" y="190" width="170" height="14" fill="#eef1f4" stroke="{INK}" stroke-width="2"/>' + text(320, 202, 'ステージ', 13, SOFT, 'start')
    b += f'<rect x="150" y="110" width="90" height="16" fill="#dde3ea" stroke="{INK}" stroke-width="2"/>'
    b += f'<rect x="150" y="96" width="20" height="30" fill="#1f2a44"/>' + text(140, 92, 'レンズ', 13, SOFT, 'end')
    b += f'<ellipse cx="205" cy="186" rx="34" ry="6" fill="#cfe6f3" stroke="{INK}" stroke-width="1.5"/>' + text(120, 172, 'ペトリ皿', 12, SOFT, 'end') + f'<line x1="124" y1="174" x2="176" y2="184" stroke="{SOFT}"/>'
    b += f'<circle cx="250" cy="160" r="12" fill="#eef1f4" stroke="{INK}" stroke-width="2"/>' + text(268, 152, '調節ねじ', 12, SOFT, 'start')
    b += f'<path d="M170,250 l40,0 l-20,20 z" fill="#eef1f4" stroke="{INK}" stroke-width="2"/>' + text(160, 262, '反しゃ鏡', 12, SOFT, 'end')
    # 手順
    steps = ['1　卵を水草ごと、水を入れたペトリ皿に移す', '2　ステージにのせ、反しゃ鏡で明るくする', '3　横から見ながらレンズを卵に近づける', '4　のぞきながら、調節ねじでピントを合わせる', '5　観察後は卵をすぐ水そうにもどす']
    for i, st in enumerate(steps):
        b += text(380, 120 + i * 34, st, 14, INK, 'start')
    b += text(360, 320, '直射日光の当たらない、明るい場所で使う', 13, RED, weight='bold')
    return svg(720, 340, b, 'かいぼうけんび鏡のつくりとメダカの卵の観察の手順')


def egg(cx, cy, stage):
    s = f'<circle cx="{cx}" cy="{cy}" r="40" fill="#fbf6e6" stroke="{INK}" stroke-width="2"/>'
    if stage == 0:
        for dx, dy in ((-12, -8), (8, -14), (14, 6), (-6, 12), (0, 0)):
            s += f'<circle cx="{cx+dx}" cy="{cy+dy}" r="5" fill="#f0dc9c" stroke="{SOFT}"/>'
    elif stage == 1:
        s += f'<path d="M{cx-26},{cy+10} q26,-24 52,0" fill="none" stroke="#c49a52" stroke-width="7" stroke-linecap="round"/>'
    elif stage == 2:
        s += f'<path d="M{cx-26},{cy+14} q26,-36 52,0" fill="none" stroke="#c49a52" stroke-width="8" stroke-linecap="round"/>'
        s += f'<circle cx="{cx-18}" cy="{cy-2}" r="5" fill="{INK}"/>'
    elif stage == 3:
        s += f'<path d="M{cx-28},{cy+6} q28,-40 56,-4 q-10,26 -40,22" fill="none" stroke="#c49a52" stroke-width="9" stroke-linecap="round"/>'
        s += f'<circle cx="{cx-16}" cy="{cy-10}" r="6" fill="{INK}"/><circle cx="{cx+4}" cy="{cy+8}" r="4" fill="{RED}"/>'
    return s


def fig_03_4():
    b = text(360, 30, 'メダカの卵の育ち（水温25℃くらいのときの目安）', 17, INK, weight='bold')
    items = [(0, '受精直後', 'あわのようなものが\n見える'), (1, '約2日', '体のもとが\nできてくる'), (2, '約4日', '目がはっきりし\n血液が流れる'), (3, '約8日', '体ができて\nよく動く')]
    for i, (st, day, note) in enumerate(items):
        cx = 75 + i * 152
        b += egg(cx, 120, st)
        b += text(cx, 190, day, 15, INK, weight='bold')
        for j, line in enumerate(note.split('\n')):
            b += text(cx, 214 + j * 18, line, 12, SOFT)
        if i < 3:
            b += arrow(cx + 46, 120, cx + 102, 120, SOFT)
    # かえった子メダカ
    b += medaka(622, 124, False, 0.55)
    b += f'<ellipse cx="643" cy="134" rx="10" ry="7" fill="#f6d27a" stroke="{INK}" stroke-width="1.5"/>'
    b += arrow(586, 120, 612, 120, SOFT)
    b += text(664, 190, '約11日', 15, INK, weight='bold') + text(664, 214, 'かえる', 12, SOFT) + text(664, 232, 'はらにふくろ', 12, SOFT)
    b += text(360, 275, '日数は水温によって変わる。かえった子メダカは、はらのふくろの養分で2〜3日育つ', 13, SOFT)
    return svg(720, 295, b, 'メダカの卵が受精してからかえるまでの育ちの目安')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('01-2', fig_01_2), ('01-4', fig_01_4), ('02-2', fig_02_2), ('02-5', fig_02_5), ('02-7', fig_02_7), ('02-9', fig_02_9),
                     ('03-1', fig_03_1), ('03-2', fig_03_2), ('03-4', fig_03_4)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
