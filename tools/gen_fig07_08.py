# 6年理科 単元7・8 の図
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_fig01 import svg, text, INK, ACC, SOFT, RED, OUT
from gen_fig02 import box, arrow

PAT = '''<defs>
<pattern id="gravel" width="24" height="16" patternUnits="userSpaceOnUse"><rect width="24" height="16" fill="#e9dcc8"/><circle cx="6" cy="6" r="4" fill="#b8a07e"/><circle cx="17" cy="11" r="3.5" fill="#a88e6a"/></pattern>
<pattern id="sand" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f3e3b8"/><circle cx="2" cy="3" r="1" fill="#c9ae6e"/><circle cx="7" cy="7" r="1" fill="#c9ae6e"/></pattern>
<pattern id="mud" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#c9b8a6"/><path d="M0,5 h10" stroke="#a8957f" stroke-width="1"/></pattern>
<pattern id="ash" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#e6e6e6"/><path d="M2,2 l3,2 l-2,3 z" fill="#9aa3ad"/></pattern>
</defs>'''

def fig_07_2():
    b = PAT + text(360, 28, '地層のようす（模式図）', 16, INK, weight='bold')
    layers = [('どろの層', 'mud', 40), ('砂の層', 'sand', 46), ('火山灰の層', 'ash', 30), ('れきの層', 'gravel', 50), ('砂の層', 'sand', 44), ('どろの層', 'mud', 40)]
    y = 60
    for name, pat, h in layers:
        b += f'<path d="M40,{y} L420,{y-8} L420,{y-8+h} L40,{y+h} z" fill="url(#{pat})" stroke="{INK}" stroke-width="1"/>'
        b += text(440, y + h / 2, name, 14, INK, 'start', 'bold')
        y += h
    # 化石
    b += f'<path d="M150,{60+40+46+30+50+22} q12,-14 24,0 q-12,8 -24,0" fill="#fff" stroke="{INK}" stroke-width="1.5"/>'
    b += text(230, 60+40+46+30+50+28, '← 化石（貝など）', 12, INK, 'start', 'bold')
    b += text(260, 345, 'つぶの大きさや色のちがう層が重なり、横にも広がっている', 13, SOFT)
    return svg(720, 360, b, '地層のようすの模式図')

def fig_07_6():
    b = text(320, 28, 'つぶの形のちがい（けんび鏡で見たようす）', 16, INK, weight='bold')
    b += f'<circle cx="170" cy="170" r="110" fill="#fbf7ef" stroke="{INK}" stroke-width="2.5"/>'
    for (x, y, r) in [(130, 130, 22), (190, 120, 18), (150, 190, 26), (215, 180, 20), (120, 220, 14), (200, 235, 16)]:
        b += f'<circle cx="{x}" cy="{y}" r="{r}" fill="#e3cfa8" stroke="#8a6d43" stroke-width="1.5"/>'
    b += text(170, 312, '流れる水に運ばれたつぶ', 14, INK, weight='bold') + text(170, 332, '角がとれて丸みがある', 13, ACC, weight='bold')
    b += f'<circle cx="470" cy="170" r="110" fill="#f7f9fb" stroke="{INK}" stroke-width="2.5"/>'
    for pts, col in [('430,120 460,105 470,140 440,150', '#cfd6de'), ('480,130 520,120 510,160', '#ffffff'), ('420,180 455,170 465,210 425,215', '#6b7280'),
                     ('490,190 530,185 520,225 495,230', '#cfd6de'), ('460,235 485,225 480,255', '#ffffff')]:
        b += f'<polygon points="{pts}" fill="{col}" stroke="{INK}" stroke-width="1.5"/>'
    b += text(470, 312, '火山灰のつぶ', 14, INK, weight='bold') + text(470, 332, '角ばっている。とう明なつぶもある', 13, ACC, weight='bold')
    return svg(640, 350, b, '流れる水に運ばれたつぶと火山灰のつぶの形のちがい')

def fig_07_9():
    b = PAT + text(340, 28, '水のはたらきで地層ができるか調べる', 16, INK, weight='bold')
    b += f'<rect x="200" y="90" width="300" height="230" fill="url(#water)" stroke="{INK}" stroke-width="3"/>'
    b += f'<rect x="203" y="276" width="294" height="12" fill="url(#mud)"/><rect x="203" y="288" width="294" height="14" fill="url(#sand)"/><rect x="203" y="302" width="294" height="15" fill="url(#gravel)"/>'
    b += f'<line x1="60" y1="70" x2="250" y2="170" stroke="#8a6d43" stroke-width="10" stroke-linecap="round"/>' + text(120, 64, 'とい', 13, SOFT)
    b += f'<path d="M40,40 l40,10 l-6,20 l-40,-10 z" fill="#d9c7a4" stroke="{INK}"/>' + text(60, 30, '土と水を流しこむ', 12, INK)
    b += text(520, 284, 'どろ', 13, INK, 'start', 'bold') + text(520, 300, '砂', 13, INK, 'start', 'bold') + text(520, 316, 'れき', 13, INK, 'start', 'bold')
    b += text(350, 350, 'つぶの大きいもの（れき）から先にしずみ、層に分かれて積もる', 13, ACC, weight='bold')
    b += text(350, 370, 'もう一度流しこむと、その上に層が重なる', 12, SOFT)
    return svg(680, 386, b, '水そうに土を流しこんで地層のでき方を調べるモデル実験')

def fig_07_12():
    b = PAT + text(340, 28, '地震による大地の変化（断層の模式図）', 16, INK, weight='bold')
    def block(x0, shift):
        s = ''
        ys = [70, 110, 150, 190, 230]
        pats = ['mud', 'sand', 'ash', 'gravel']
        for i in range(4):
            s += f'<path d="M{x0},{ys[i]} L{x0+120},{ys[i]} L{x0+150},{ys[i]} L{x0+150},{ys[i+1]} L{x0},{ys[i+1]} z" fill="url(#{pats[i]})" stroke="{INK}" stroke-width="1"/>'
            s += f'<path d="M{x0+150},{ys[i]+shift} L{x0+270},{ys[i]+shift} L{x0+270},{ys[i+1]+shift} L{x0+150},{ys[i+1]+shift} z" fill="url(#{pats[i]})" stroke="{INK}" stroke-width="1"/>'
        return s
    b += block(30, 0) + text(165, 270, '地震の前', 14, INK, weight='bold')
    b += block(360, 30)
    b += f'<line x1="510" y1="60" x2="510" y2="270" stroke="{RED}" stroke-width="3"/>' + text(530, 56, '断層', 14, RED, 'start', 'bold')
    b += text(495, 290, '地震の後：大地がずれる', 14, INK, weight='bold')
    b += text(340, 320, '地震では、大地に大きな力がはたらいて断層ができ、土地がずれる', 12, SOFT)
    return svg(680, 336, b, '地震によって地層がずれてできる断層の模式図')

def lever(x1, x2, y, fulcrum, effort, load, labels=True):
    s = f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="#8a6d43" stroke-width="10" stroke-linecap="round"/>'
    s += f'<path d="M{fulcrum-16},{y+28} L{fulcrum},{y+6} L{fulcrum+16},{y+28} z" fill="{SOFT}"/>'
    if labels:
        s += f'<circle cx="{fulcrum}" cy="{y}" r="7" fill="{INK}"/>' + text(fulcrum, y + 46, '支点', 13, INK, weight='bold')
        s += f'<circle cx="{effort}" cy="{y}" r="7" fill="{ACC}"/>' + text(effort, y - 52, '力点', 13, ACC, weight='bold') + arrow(effort, y - 44, effort, y - 12, ACC)
        s += f'<circle cx="{load}" cy="{y}" r="7" fill="{RED}"/>' + text(load, y - 52, '作用点', 13, RED, weight='bold')
    return s

def fig_08_2():
    b = text(340, 28, '棒を使ったてこ（支点・力点・作用点）', 16, INK, weight='bold')
    y = 170
    b += lever(60, 620, y, 230, 590, 100)
    b += f'<line x1="100" y1="{y}" x2="100" y2="{y+40}" stroke="{INK}" stroke-width="2"/><rect x="70" y="{y+40}" width="60" height="50" rx="8" fill="#d9c7a4" stroke="{INK}"/>' + text(100, y + 70, '砂ぶくろ', 12, INK)
    b += f'<path d="M260,{y+70} H580" stroke="{ACC}" stroke-width="2" marker-end="url(#arr)"/>' + text(420, y + 92, '支点から力点までを長くすると楽', 13, ACC, weight='bold')
    b += f'<path d="M220,{y+110} H112" stroke="{RED}" stroke-width="2" marker-end="url(#arr)"/>' + text(166, y + 132, '支点から作用点までを短くすると楽', 13, RED, weight='bold')
    return svg(680, 320, b, '棒を使ったてこの支点・力点・作用点')

def weight_stack(x, y, n, label):
    s = f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+30}" stroke="{INK}" stroke-width="1.5"/>'
    for k in range(n):
        s += f'<rect x="{x-12}" y="{y+30+k*18}" width="24" height="16" rx="3" fill="#9aa3ad" stroke="{INK}"/>'
    s += text(x, y + 30 + n * 18 + 18, label, 12, INK, weight='bold')
    return s

def fig_08_5():
    b = text(360, 28, '実験用てこがつり合うきまり', 16, INK, weight='bold')
    cx, y, step = 360, 110, 45
    b += f'<rect x="{cx-6}" y="{y}" width="12" height="190" fill="{SOFT}"/><rect x="{cx-60}" y="300" width="120" height="14" fill="{SOFT}"/>'
    b += f'<line x1="{cx-6*step}" y1="{y}" x2="{cx+6*step}" y2="{y}" stroke="{INK}" stroke-width="8"/>'
    for i in range(1, 7):
        for sgn in (-1, 1):
            b += f'<line x1="{cx+sgn*i*step}" y1="{y-8}" x2="{cx+sgn*i*step}" y2="{y+8}" stroke="#fff" stroke-width="2"/>' + text(cx + sgn * i * step, y - 14, str(i), 12, SOFT)
    b += weight_stack(cx - 2 * step, y, 3, '30g') + weight_stack(cx + 3 * step, y, 2, '20g')
    b += f'<rect x="80" y="330" width="560" height="62" rx="8" fill="#f4fbf9" stroke="{ACC}"/>'
    b += text(360, 354, '左：30g × 2 ＝ 60　　右：20g × 3 ＝ 60', 15, INK, weight='bold')
    b += text(360, 378, '（おもりの重さ）×（支点からのきょり）が左右で等しいとき、水平につり合う', 13, ACC, weight='bold')
    return svg(720, 404, b, '実験用てこが水平につり合うきまり（例：左30g×2、右20g×3）')

def fig_08_7():
    b = text(360, 28, 'てこを利用した道具（支点・力点・作用点の並び方）', 16, INK, weight='bold')
    rows = [('支点が間', 'はさみ・くぎぬき', 'P', 'S', 'L'), ('作用点が間', 'せんぬき', 'S', 'L', 'P'), ('力点が間', 'ピンセット・トング', 'S', 'P', 'L')]
    lab = {'S': ('支点', INK), 'P': ('力点', ACC), 'L': ('作用点', RED)}
    for i, (title, exs, a, m, c) in enumerate(rows):
        y = 90 + i * 110
        b += text(40, y + 4, title, 15, INK, 'start', 'bold') + text(40, y + 26, f'例：{exs}', 12, SOFT, 'start')
        b += f'<line x1="260" y1="{y}" x2="640" y2="{y}" stroke="#8a6d43" stroke-width="9" stroke-linecap="round"/>'
        for x, k in zip((280, 450, 620), (a, m, c)):
            name, col = lab[k]
            b += f'<circle cx="{x}" cy="{y}" r="9" fill="{col}"/>' + text(x, y + 32, name, 13, col, weight='bold')
    b += text(360, 420, '支点・力点・作用点の並び方で、力を大きくする道具と、細かい作業をしやすくする道具がある', 12, SOFT)
    return svg(720, 436, b, 'てこを利用した道具の支点・力点・作用点の並び方')

if __name__ == '__main__':
    for name, fn in [('07-2', fig_07_2), ('07-6', fig_07_6), ('07-9', fig_07_9), ('07-12', fig_07_12), ('08-2', fig_08_2), ('08-5', fig_08_5), ('08-7', fig_08_7)]:
        with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
