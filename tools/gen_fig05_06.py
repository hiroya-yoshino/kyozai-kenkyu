# 6年理科 単元5・6 の図
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED, OUT
from gen_fig02 import box, arrow, tube

LIT = '#fff3b0'; DARK = '#5b6573'

def dish(cx, y, residue=None):
    s = f'<path d="M{cx-50},{y} Q{cx},{y+40} {cx+50},{y}" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
    if residue:
        s += f'<ellipse cx="{cx}" cy="{y+12}" rx="22" ry="5" fill="{residue}" stroke="{SOFT}"/>'
    return s

def fig_05_3():
    b = text(360, 28, '水よう液を蒸発させたときの結果', 16, INK, weight='bold')
    items = [('食塩水', '#ffffff', '白い固体が残る'), ('石灰水', '#ffffff', '白い固体が残る'), ('炭酸水', None, '何も残らない'),
             ('うすい塩酸', None, '何も残らない'), ('うすい\nアンモニア水', None, '何も残らない')]
    for i, (name, res, note) in enumerate(items):
        cx = 75 + i * 142
        b += dish(cx, 110, res)
        l = name.split('\n')
        b += text(cx, 76, l[0], 14, INK, weight='bold') + (text(cx, 94, l[1], 14, INK, weight='bold') if len(l) > 1 else '')
        b += text(cx, 180, note, 13, ACC if res else SOFT, weight='bold')
    b += f'<rect x="20" y="210" width="680" height="62" rx="8" fill="#f4fbf9" stroke="{ACC}"/>'
    b += text(360, 236, '固体が残る → 固体がとけている（食塩水・石灰水）', 13, INK)
    b += text(360, 258, '何も残らない → 気体などがとけている（炭酸水・塩酸・アンモニア水）', 13, INK)
    return svg(720, 290, b, '5種類の水よう液を蒸発させたときの結果')

def fig_05_4():
    b = text(320, 28, '炭酸水にとけている気体を調べる', 16, INK, weight='bold')
    b += f'<rect x="80" y="90" width="90" height="200" rx="18" fill="#eef6fb" stroke="{INK}" stroke-width="2.5"/><rect x="105" y="66" width="40" height="26" fill="{INK}"/>'
    for k in range(10):
        b += f'<circle cx="{95 + (k*29) % 60}" cy="{150 + (k*41) % 120}" r="4" fill="#fff" stroke="#3b8bc2"/>'
    b += text(125, 315, '①炭酸水をふる', 13, INK, weight='bold')
    b += arrow(190, 180, 260, 180, INK)
    b += f'<rect x="280" y="90" width="90" height="200" rx="18" fill="#f7f9fb" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<rect x="283" y="240" width="84" height="46" fill="#e6e6e6"/>' + text(325, 268, '白くにごる', 12, INK, weight='bold')
    b += text(325, 315, '②石灰水を入れてふる', 13, INK, weight='bold')
    b += f'<rect x="420" y="120" width="190" height="120" rx="10" fill="#f4fbf9" stroke="{ACC}" stroke-width="2"/>'
    b += text(515, 150, '気体検知管でも', 13, INK) + text(515, 172, '二酸化炭素が多い', 13, ACC, weight='bold')
    b += text(515, 210, '→ 二酸化炭素が', 14, INK, weight='bold') + text(515, 230, 'とけている', 14, INK, weight='bold')
    return svg(640, 340, b, '炭酸水から出てくる気体を石灰水で調べる')

def litmus(x, y, color, label):
    return f'<rect x="{x}" y="{y}" width="34" height="70" rx="3" fill="{color}" stroke="{INK}" stroke-width="1.5"/>' + text(x + 17, y + 88, label, 11, SOFT)

def fig_05_5():
    b = text(360, 28, 'リトマス紙の色の変化と仲間分け', 16, INK, weight='bold')
    BL, RD = '#7fa6d9', '#e08f9a'
    cols = [('酸性', '青→赤に変わる', [(BL, RD, '青'), (RD, RD, '赤')], 'うすい塩酸・炭酸水'),
            ('中性', 'どちらも変わらない', [(BL, BL, '青'), (RD, RD, '赤')], '食塩水'),
            ('アルカリ性', '赤→青に変わる', [(BL, BL, '青'), (RD, BL, '赤')], '石灰水・アンモニア水')]
    for i, (name, rule, papers, ex_) in enumerate(cols):
        x = 30 + i * 230
        b += f'<rect x="{x}" y="50" width="210" height="270" rx="10" fill="#fff" stroke="{INK}" stroke-width="2"/>'
        b += text(x + 105, 80, name, 17, INK, weight='bold') + text(x + 105, 102, rule, 12, SOFT)
        for j, (before, after, lab) in enumerate(papers):
            px = x + 30 + j * 90
            b += litmus(px, 120, after, f'{lab}色リトマス紙')
        b += text(x + 105, 270, '例', 12, SOFT) + text(x + 105, 292, ex_, 13, INK, weight='bold')
    b += text(360, 345, 'リトマス紙はピンセットで持ち、ガラス棒で1てきつける。1つ調べるごとにガラス棒を洗う', 12, SOFT)
    return svg(720, 360, b, 'リトマス紙の色の変化と、酸性・中性・アルカリ性の仲間分け')

def fig_05_7():
    b = text(320, 28, '金属にうすい塩酸を加える', 16, INK, weight='bold')
    b += tube(150, 80, '#fff8e1', '鉄（スチールウール）') + tube(430, 80, '#fff8e1', 'アルミニウム')
    for cx in (166, 446):
        b += f'<path d="M{cx-10},228 q10,-10 20,0 q-10,10 -20,0" fill="#9aa3ad"/>'
        for k in range(7):
            b += f'<circle cx="{cx - 8 + (k*7) % 16}" cy="{215 - k*16}" r="{3 + k % 2}" fill="#fff" stroke="#3b8bc2"/>'
    b += text(320, 290, 'どちらも、あわを出してとけていく', 14, INK, weight='bold')
    b += f'<rect x="120" y="305" width="400" height="34" rx="8" fill="#fbecea" stroke="{RED}"/>' + text(320, 327, '⚠ 出てくる気体は燃えやすい。近くで火を使わない', 13, RED, weight='bold')
    return svg(640, 352, b, '鉄とアルミニウムにうすい塩酸を加えたときの変化')

def fig_05_9():
    b = text(320, 28, '金属がとけた液を蒸発させる', 16, INK, weight='bold')
    for i, (name, res, note) in enumerate([('鉄がとけた液', '#e7c873', '黄色っぽい固体'), ('アルミニウムがとけた液', '#ffffff', '白い固体')]):
        cx = 170 + i * 300
        b += dish(cx, 130, res)
        b += text(cx, 96, name, 14, INK, weight='bold')
        b += f'<path d="M{cx-40},175 h80 M{cx-30},175 l-10,40 M{cx+30},175 l10,40" stroke="{INK}" stroke-width="2.5"/>'
        b += f'<path d="M{cx-12},170 q12,-30 24,0 z" fill="#7fb3ff"/>'
        b += text(cx, 240, f'→ {note}', 14, ACC, weight='bold')
    b += text(320, 280, '液が少し残っているうちに火を止め、余熱で蒸発させる', 12, SOFT)
    b += text(320, 300, '出てきた固体は、もとの金属と色やつやがちがう', 13, INK)
    return svg(640, 320, b, '金属がとけた液を蒸発させて出てきた固体')

def phase(cx, cy, r, p):
    """p: 0=新月, 0.25=上弦, 0.5=満月, 0.75=下弦（北半球で見た形。満ちていくときは右側が光る）"""
    k = math.cos(2 * math.pi * p)
    rx = abs(k) * r
    s = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{DARK}"/>'
    if p < 0.02 or p > 0.98:
        return s + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{SOFT}"/>'
    right = p < 0.5
    sweep_outer = 1 if right else 0
    # 光っている側の半円
    path = f'M{cx},{cy-r} A{r},{r} 0 0 {sweep_outer} {cx},{cy+r} '
    # 明暗の境目（だ円の半分）
    gibbous = 0.25 < p < 0.75
    sweep_inner = (0 if right else 1) if not gibbous else (1 if right else 0)
    path += f'A{rx:.1f},{r} 0 0 {sweep_inner} {cx},{cy-r} z'
    return s + f'<path d="{path}" fill="{LIT}" stroke="{SOFT}" stroke-width="1"/>'

def fig_06_2():
    b = text(360, 28, '夕方（日の入りのころ）の月の形と位置', 16, INK, weight='bold')
    b += f'<path d="M30,300 H690" stroke="{INK}" stroke-width="3"/>'
    for x, lab in [(80, '東'), (360, '南'), (640, '西')]:
        b += text(x, 326, lab, 15, INK, weight='bold')
    b += f'<circle cx="660" cy="292" r="20" fill="#ffd166" stroke="#e08a00" stroke-width="2"/>' + text(660, 262, '太陽', 13, SOFT)
    moons = [(560, 230, 0.12, '三日月（数日後）'), (360, 110, 0.25, '半月（上弦の月）'), (110, 210, 0.5, '満月')]
    for x, y, p, lab in moons:
        b += phase(x, y, 26, p) + text(x, y + 50, lab, 13, INK, weight='bold')
    b += text(360, 360, '南を向いて見たようす。月の光っている側に太陽がある', 12, SOFT)
    b += text(360, 380, '日がたつにつれて、夕方の月は西→南→東へと位置が変わり、形も満ちていく', 12, SOFT)
    return svg(720, 396, b, '夕方に見える月の形と位置の変化')

def fig_06_3():
    b = text(320, 28, '電灯とボールのモデル実験', 16, INK, weight='bold')
    b += f'<rect x="20" y="170" width="60" height="60" rx="6" fill="#ffd166" stroke="#e08a00" stroke-width="2"/>' + text(50, 254, '電灯（太陽）', 12, INK, weight='bold')
    for k in range(5):
        b += f'<line x1="84" y1="{180+k*10}" x2="160" y2="{150+k*25}" stroke="#ffd166" stroke-width="2"/>'
    b += f'<circle cx="360" cy="200" r="34" fill="#fff" stroke="{INK}" stroke-width="2.5"/>' + text(360, 206, '自分', 13, INK, weight='bold') + text(360, 252, '（地球）', 12, SOFT)
    b += f'<circle cx="360" cy="200" r="130" fill="none" stroke="{SOFT}" stroke-dasharray="6 5"/>'
    for ang, p in [(180, 0.0), (270, 0.25), (0, 0.5), (90, 0.75)]:
        a = math.radians(ang)
        x, y = 360 + 130 * math.cos(a), 200 + 130 * math.sin(a)
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="18" fill="{DARK}"/><path d="M{x:.0f},{y-18:.0f} A18,18 0 0 0 {x:.0f},{y+18:.0f} z" fill="{LIT}"/>'
    b += text(360, 52, 'ボール（月）を持って、自分のまわりを回す', 12, SOFT)
    b += text(520, 200, '見え方', 13, INK, 'start', 'bold')
    for i, (p, lab) in enumerate([(0.0, '電灯側'), (0.25, '横'), (0.5, '反対側')]):
        b += phase(560, 230 + i * 0 + 0, 0, 0) if False else ''
    rows = [(0.0, '電灯の方：見えない（新月）'), (0.25, '横：半分光る（半月）'), (0.5, '反対側：まるく光る（満月）')]
    for i, (p, lab) in enumerate(rows):
        b += phase(530, 240 + i * 46, 16, p) + text(556, 245 + i * 46, lab, 12, INK, 'start')
    return svg(760, 380, b, '電灯とボールを使って月の見え方を調べるモデル実験')

def fig_06_4():
    b = text(380, 28, '太陽・月・地球の位置関係と月の見え方（北極の上から見た模式図）', 16, INK, weight='bold')
    cx, cy, R = 400, 270, 150
    b += f'<rect x="20" y="{cy-100}" width="40" height="200" fill="#ffd166"/>' + text(40, cy + 124, '太陽の光', 12, SOFT)
    for k in range(6):
        b += arrow(64, cy - 85 + k * 34, 120, cy - 85 + k * 34, '#e0a800', w=2)
    b += f'<circle cx="{cx}" cy="{cy}" r="30" fill="#cfe3f3" stroke="{INK}" stroke-width="2"/>' + text(cx, cy + 5, '地球', 13, INK, weight='bold')
    b += f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{SOFT}" stroke-dasharray="6 5"/>'
    # 月の公転の向き（北極側から見て反時計回り）
    b += f'<path d="M{cx-R*0.71:.0f},{cy+R*0.71:.0f} A{R},{R} 0 0 0 {cx+R*0.71:.0f},{cy+R*0.71:.0f}" fill="none" stroke="{ACC}" stroke-width="3" marker-end="url(#arr)" transform="translate(0,0)"/>'
    b += text(cx, cy + R - 14, '月の動く向き', 12, ACC, weight='bold')
    # 角度は数学の向き（右が0°、反時計回り）。画面では y を上向きに直す
    names = {180: ('新月', 0.0), 225: ('三日月', 0.125), 270: ('上弦の月', 0.25), 315: ('', 0.375),
             0: ('満月', 0.5), 45: ('', 0.625), 90: ('下弦の月', 0.75), 135: ('', 0.875)}
    for ang, (lab, p) in names.items():
        a = math.radians(ang)
        x, y = cx + R * math.cos(a), cy - R * math.sin(a)
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="14" fill="{DARK}"/><path d="M{x:.0f},{y-14:.0f} A14,14 0 0 0 {x:.0f},{y+14:.0f} z" fill="{LIT}"/>'
        ox, oy = cx + (R + 60) * math.cos(a), cy - (R + 50) * math.sin(a)
        b += phase(ox, oy, 14, p)
        if lab:
            b += text(ox, oy + 30, lab, 12, INK, weight='bold')
    b += text(400, 528, '内側の円：月（太陽側の半分がいつも光っている）　外側：地球（日本）から見た月の形', 12, SOFT)
    return svg(780, 544, b, '太陽・月・地球の位置関係と、地球から見た月の形')

if __name__ == '__main__':
    for name, fn in [('05-3', fig_05_3), ('05-4', fig_05_4), ('05-5', fig_05_5), ('05-7', fig_05_7), ('05-9', fig_05_9), ('06-2', fig_06_2), ('06-3', fig_06_3), ('06-4', fig_06_4)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
