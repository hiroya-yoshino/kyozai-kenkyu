# 6年理科 単元9・10 の図
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED, OUT
from gen_fig02 import box, arrow

def generator(x, y):
    s = f'<rect x="{x}" y="{y}" width="110" height="80" rx="14" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
    s += f'<line x1="{x+55}" y1="{y+40}" x2="{x+55}" y2="{y-20}" stroke="{INK}" stroke-width="5"/><circle cx="{x+55}" cy="{y-26}" r="8" fill="{INK}"/>'
    s += f'<path d="M{x+20},{y-40} A40,40 0 0 1 {x+90},{y-40}" fill="none" stroke="{ACC}" stroke-width="2.5" marker-end="url(#arr)"/>'
    s += text(x + 55, y + 48, '手回し', 12, INK, weight='bold') + text(x + 55, y + 64, '発電機', 12, INK, weight='bold')
    return s

def bulb(cx, cy, lit=True):
    s = f'<circle cx="{cx}" cy="{cy}" r="20" fill="{"#fff3b0" if lit else "#fff"}" stroke="{INK}" stroke-width="2"/><rect x="{cx-12}" y="{cy+18}" width="24" height="18" fill="{SOFT}"/>'
    if lit:
        for k in range(6):
            a = -math.pi / 2 + (k - 2.5) * 0.45
            s += f'<line x1="{cx+26*math.cos(a):.0f}" y1="{cy+26*math.sin(a):.0f}" x2="{cx+36*math.cos(a):.0f}" y2="{cy+36*math.sin(a):.0f}" stroke="#e0a800" stroke-width="2"/>'
    return s

def fig_09_2():
    b = text(340, 28, '手回し発電機で電気をつくる', 16, INK, weight='bold')
    b += generator(60, 140)
    b += f'<path d="M170,160 H300 V150 M170,200 H300 V210" stroke="{RED}" stroke-width="3" fill="none"/>'
    b += bulb(320, 160) + text(320, 236, '豆電球が光る', 13, INK, weight='bold')
    b += f'<rect x="460" y="140" width="80" height="60" rx="10" fill="#fff" stroke="{INK}" stroke-width="2.5"/>' + text(500, 176, 'モーター', 12, INK, weight='bold')
    b += f'<ellipse cx="500" cy="120" rx="40" ry="8" fill="#cfe3f3" stroke="{INK}"/><line x1="500" y1="140" x2="500" y2="120" stroke="{INK}" stroke-width="3"/>'
    b += text(500, 236, 'モーターが回る', 13, INK, weight='bold') + text(410, 176, 'または', 12, SOFT)
    b += f'<rect x="60" y="270" width="560" height="60" rx="8" fill="#f4fbf9" stroke="{ACC}"/>'
    b += text(340, 294, '速く回す → 豆電球が明るくなる・モーターが速く回る', 13, INK)
    b += text(340, 316, '回す向きを逆にする → 電流の向きが逆になり、モーターの回る向きが変わる', 13, INK)
    return svg(680, 344, b, '手回し発電機で豆電球やモーターに電気を流す')

def fig_09_4():
    b = text(340, 28, '光電池に当てる光の向きと発電', 16, INK, weight='bold')
    for i, (ang, lab, res) in enumerate([(0, '光に垂直', '速く回る'), (50, 'かたむける', 'ゆっくり回る'), (None, '一部をおおう', 'ゆっくり回る')]):
        x = 110 + i * 230
        rot = ang or 0
        b += f'<rect x="{x-50}" y="160" width="100" height="16" fill="#2f4b7c" stroke="{INK}" transform="rotate({-rot} {x} 168)"/>'
        if ang is None:
            b += f'<rect x="{x-50}" y="150" width="50" height="10" fill="#e6e6e6" stroke="{INK}"/>' + text(x - 25, 144, '紙', 11, SOFT)
        for k in range(4):
            b += arrow(x - 45 + k * 30, 70, x - 45 + k * 30, 140, '#e0a800', w=2)
        b += text(x, 248, lab, 14, INK, weight='bold') + text(x, 270, f'モーターが{res}', 13, ACC if i == 0 else SOFT, weight='bold')
    b += text(340, 310, '光を強く、光電池に垂直に近い向きで当てるほど、多くの電気がつくられる', 13, INK)
    return svg(680, 326, b, '光電池に当てる光の向きや当たり方と、つくられる電気の量')

def fig_09_6():
    b = text(340, 28, 'コンデンサーに電気をためて使う', 16, INK, weight='bold')
    b += generator(40, 140)
    b += f'<path d="M150,160 H240 M150,200 H240" stroke="{RED}" stroke-width="3"/>'
    b += f'<rect x="240" y="140" width="70" height="80" rx="8" fill="#e8ecf6" stroke="{INK}" stroke-width="2.5"/>' + text(275, 186, 'コンデン', 11, INK, weight='bold') + text(275, 200, 'サー', 11, INK, weight='bold')
    b += text(232, 156, '＋', 14, RED, 'end', 'bold') + text(232, 214, '－', 14, INK, 'end', 'bold')
    b += text(170, 250, '① ためる（＋と－を正しくつなぐ）', 13, INK, weight='bold')
    b += arrow(330, 180, 400, 180, INK)
    b += f'<rect x="420" y="140" width="70" height="80" rx="8" fill="#e8ecf6" stroke="{INK}" stroke-width="2.5"/>' + text(455, 186, 'コンデン', 11, INK, weight='bold') + text(455, 200, 'サー', 11, INK, weight='bold')
    b += f'<path d="M490,160 H560 M490,200 H560" stroke="{RED}" stroke-width="3"/>' + bulb(585, 180)
    b += text(530, 250, '② 使う（豆電球やLEDにつなぐ）', 13, INK, weight='bold')
    b += f'<rect x="60" y="280" width="560" height="40" rx="8" fill="#fbecea" stroke="{RED}"/>' + text(340, 306, '⚠ ためたコンデンサーのたんしどうしを、直接つながない', 13, RED, weight='bold')
    return svg(680, 336, b, '手回し発電機でコンデンサーに電気をためて、豆電球で使う')

def fig_09_8():
    b = text(340, 28, '電気が変わるものと、電気製品の例', 16, INK, weight='bold')
    b += f'<circle cx="340" cy="190" r="56" fill="#fff3b0" stroke="#e0a800" stroke-width="3"/>' + text(340, 196, '電気', 20, INK, weight='bold')
    items = [(140, 80, '光', '照明・テレビの画面'), (540, 80, '音', 'スピーカー・ブザー'), (140, 300, '熱', 'アイロン・電気ストーブ'), (540, 300, '運動', 'せん風機・洗たく機')]
    for x, y, name, eg in items:
        b += box(x - 90, y - 34, 180, 68, name, eg, fill='#fff')
        b += arrow(340 + (-50 if x < 340 else 50), 190 + (-30 if y < 190 else 30), x + (80 if x < 340 else -80), y + (24 if y < 190 else -24), ACC)
    return svg(680, 360, b, '電気が光・音・熱・運動に変わることと電気製品の例')

def fig_09_10():
    b = text(340, 28, '人が近づくと明かりがつくプログラムの流れ', 16, INK, weight='bold')
    b += f'<rect x="270" y="50" width="140" height="40" rx="20" fill="#fff" stroke="{INK}" stroke-width="2"/>' + text(340, 75, 'はじめ', 14, INK, weight='bold')
    b += arrow(340, 90, 340, 116, INK)
    b += f'<polygon points="340,118 450,170 340,222 230,170" fill="#f4fbf9" stroke="{ACC}" stroke-width="2"/>' + text(340, 166, '人が', 13, INK, weight='bold') + text(340, 184, 'いるか？', 13, INK, weight='bold')
    b += f'<path d="M340,222 V250" stroke="{INK}" stroke-width="2.5" marker-end="url(#arr)"/>' + text(352, 242, 'はい', 12, ACC, 'start', 'bold')
    b += box(260, 252, 160, 44, '明かりをつける')
    b += arrow(340, 296, 340, 320, INK)
    b += box(260, 322, 160, 44, '10秒待つ')
    b += f'<path d="M450,170 H560 V384 H340 V366" fill="none" stroke="{INK}" stroke-width="2.5"/>' + text(470, 160, 'いいえ', 12, RED, 'start', 'bold')
    b += f'<path d="M560,170 H560" stroke="none"/>'
    b += box(480, 210, 160, 44, '明かりを消す', fill='#fff')
    b += f'<path d="M340,384 V400 H120 V170 H228" fill="none" stroke="{SOFT}" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arr)"/>' + text(124, 290, 'くり返す', 12, SOFT, 'start')
    return svg(680, 420, b, '人感センサーで明かりをつけたり消したりするプログラムのフローチャート')

def fig_10_2():
    b = text(340, 28, '人の生活と環境（空気・水・生物）とのかかわり', 16, INK, weight='bold')
    b += f'<circle cx="340" cy="200" r="60" fill="#fff" stroke="{INK}" stroke-width="2.5"/>' + text(340, 196, '人の', 15, INK, weight='bold') + text(340, 216, '生活', 15, INK, weight='bold')
    items = [(120, 90, '空気', '燃料を燃やす→二酸化炭素がふえる', '#eef6fb'), (560, 90, '水', '生活はい水→川や海がよごれる', '#eef6fb'), (340, 350, '生物', '開発→すみかが減る', '#e3f0dc')]
    for x, y, name, eff, col in items:
        b += box(x - 110, y - 36, 220, 72, name, eff, fill=col)
        b += f'<line x1="{340 + (x-340)*0.3:.0f}" y1="{200 + (y-200)*0.35:.0f}" x2="{x - (x-340)*0.15:.0f}" y2="{y + (36 if y < 200 else -36)}" stroke="{ACC}" stroke-width="2.5" marker-end="url(#arr)"/>'
    b += text(340, 420, '環境を守る取り組み：再生可能エネルギー、下水処理、森林や生物の保護 など', 12, SOFT)
    return svg(680, 436, b, '人の生活が空気・水・生物にあたえる影響と環境を守る取り組み')

if __name__ == '__main__':
    for name, fn in [('09-2', fig_09_2), ('09-4', fig_09_4), ('09-6', fig_09_6), ('09-8', fig_09_8), ('09-10', fig_09_10), ('10-2', fig_10_2)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
