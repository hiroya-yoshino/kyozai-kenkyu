# 6年理科 単元1 の図（SVG）を生成する。文字はすべて <text>。
import os
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'figures', 'rika', '6')
INK, ACC, SOFT, GRID, RED = '#1f2a44', '#1e7f6e', '#5b6573', '#dce6ee', '#c8372d'
FONT = "'Hiragino Sans','Yu Gothic','Noto Sans JP',Meiryo,sans-serif"

def svg(w, h, body, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}" font-family="{FONT}">
<title>{title}</title>
<defs>
<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{ACC}"/></marker>
<pattern id="clay" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#efe7dc"/><path d="M0,8 L8,0" stroke="#b9a68c" stroke-width="1"/></pattern>
<pattern id="water" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#e6f1f7"/><path d="M0,3 q2.5,-2 5,0 t5,0" fill="none" stroke="#8fb3c9" stroke-width="1"/></pattern>
</defs>
<rect width="{w}" height="{h}" fill="#fff"/>
{body}
</svg>'''

def text(x, y, s, size=16, color=INK, anchor='middle', weight='normal'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}">{s}</text>'

def candle(cx, base, lit=True, weak=False):
    s = f'<rect x="{cx-8}" y="{base-52}" width="16" height="52" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    s += f'<line x1="{cx}" y1="{base-52}" x2="{cx}" y2="{base-60}" stroke="{INK}" stroke-width="2"/>'
    if lit:
        ry = 10 if weak else 16
        s += f'<ellipse cx="{cx}" cy="{base-60-ry+4}" rx="{5 if weak else 7}" ry="{ry}" fill="#ffd166" stroke="#e08a00" stroke-width="1.5"/>'
    else:
        s += f'<path d="M{cx},{base-62} q-6,-10 0,-18 q6,-8 0,-18" fill="none" stroke="{SOFT}" stroke-width="1.5" stroke-dasharray="3 3"/>'
    return s

def bottomless_bottle(x, top, bottom, w=140, lid=False):
    nx1, nx2 = x + w/2 - 30, x + w/2 + 30
    s = f'<path d="M{nx1},{top} L{nx1},{top+30} Q{x},{top+40} {x},{top+70} L{x},{bottom} M{nx2},{top} L{nx2},{top+30} Q{x+w},{top+40} {x+w},{top+70} L{x+w},{bottom}" fill="none" stroke="{INK}" stroke-width="3"/>'
    if lid:
        s += f'<rect x="{nx1-8}" y="{top-10}" width="{76}" height="10" rx="2" fill="{INK}"/>'
    return s

def fig_01_2():
    body = ''
    panels = [('ア', '下にすき間・上はあける', True, False, '燃え続ける'),
              ('イ', '下のすき間なし・上はあける', False, False, 'やがて消える'),
              ('ウ', '下にすき間・上にふた', True, True, 'やがて消える')]
    for i, (k, label, gap, lid, result) in enumerate(panels):
        ox = 20 + i * 240
        x, top, bottom = ox + 50, 70, 290
        body += text(ox + 120, 34, f'{k}　{label}', 15, INK, weight='bold')
        if gap:
            body += f'<rect x="{x-20}" y="{bottom}" width="70" height="22" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
            body += f'<rect x="{x+90}" y="{bottom}" width="70" height="22" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
            body += f'<rect x="{x+50}" y="{bottom+6}" width="40" height="16" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
        else:
            body += f'<rect x="{x-20}" y="{bottom}" width="180" height="22" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
        body += bottomless_bottle(x, top, bottom + (0 if not gap else 0), lid=lid)
        body += candle(x + 70, bottom + 6 if gap else bottom, lit=True, weak=(result != '燃え続ける'))
        if gap:
            body += f'<path d="M{x-40},{bottom+4} L{x-6},{bottom+4}" stroke="{ACC}" stroke-width="2.5" marker-end="url(#arr)"/>'
            body += f'<path d="M{x+180},{bottom+4} L{x+146},{bottom+4}" stroke="{ACC}" stroke-width="2.5" marker-end="url(#arr)"/>'
        if not lid:
            body += f'<path d="M{x+70},{top+20} L{x+70},{top-26}" stroke="{ACC}" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arr)"/>'
        color = ACC if result == '燃え続ける' else SOFT
        body += f'<rect x="{ox+60}" y="330" width="120" height="30" rx="15" fill="{"#e3f1ee" if color == ACC else "#eef1f4"}"/>'
        body += text(ox + 120, 351, result, 15, color, weight='bold')
    body += text(360, 392, '矢印（→）は空気の入る向き・出る向き', 13, SOFT)
    return svg(720, 404, body, '底のないびんでの空気の通り道とろうそくの燃え方')

def fig_01_3():
    x, top, bottom = 150, 90, 300
    body = text(240, 28, '線香のけむりで空気の流れを見る', 16, INK, weight='bold')
    body += f'<rect x="{x-20}" y="{bottom}" width="70" height="22" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
    body += f'<rect x="{x+90}" y="{bottom}" width="70" height="22" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
    body += f'<rect x="{x+50}" y="{bottom+6}" width="40" height="16" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
    body += bottomless_bottle(x, top, bottom)
    body += candle(x + 70, bottom + 6)
    # 線香
    body += f'<line x1="{x-90}" y1="{bottom+40}" x2="{x-40}" y2="{bottom+8}" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>'
    body += f'<circle cx="{x-40}" cy="{bottom+8}" r="3" fill="{RED}"/>'
    body += text(x - 95, bottom + 62, '火のついた線香', 13, SOFT)
    # けむりの流れ
    body += f'<path d="M{x-36},{bottom+4} C{x-5},{bottom} {x+30},{bottom-10} {x+55},{bottom-70} S{x+68},{top+60} {x+70},{top+20} L{x+70},{top-34}" fill="none" stroke="{SOFT}" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#arr)"/>'
    body += text(x + 205, 150, 'けむりは下のすき間から', 14, INK, 'start')
    body += text(x + 205, 172, '入り、ほのおに引きこまれ、', 14, INK, 'start')
    body += text(x + 205, 194, '上の口から出ていく', 14, INK, 'start')
    body += f'<line x1="{x+200}" y1="180" x2="{x+110}" y2="225" stroke="{SOFT}" stroke-width="1"/>'
    return svg(500, 380, body, '線香のけむりを使って空気の流れを調べるようす')

def fig_01_4():
    body = text(300, 28, '気体を集気びんに集める（水上置換）', 16, INK, weight='bold')
    # 水そう
    body += f'<rect x="40" y="190" width="360" height="130" fill="url(#water)"/>'
    body += f'<path d="M40,80 L40,320 L400,320 L400,80" fill="none" stroke="{INK}" stroke-width="3"/>'
    body += text(110, 342, '水そう', 13, SOFT)
    # 逆さにした集気びん：底が上、口が下（水の中）
    bx, btop = 170, 96
    outline = f'M{bx},{btop} L{bx+100},{btop} L{bx+100},{btop+150} Q{bx+100},{btop+180} {bx+70},{btop+186} L{bx+70},{btop+210} M{bx},{btop} L{bx},{btop+150} Q{bx},{btop+180} {bx+30},{btop+186} L{bx+30},{btop+210}'
    body += f'<rect x="{bx}" y="{btop}" width="100" height="94" fill="#f4fbf9"/>'
    body += f'<path d="M{bx},{btop+94} L{bx+100},{btop+94} L{bx+100},{btop+150} Q{bx+100},{btop+180} {bx+70},{btop+186} L{bx+70},{btop+210} L{bx+30},{btop+210} L{bx+30},{btop+186} Q{bx},{btop+180} {bx},{btop+150} z" fill="url(#water)"/>'
    body += f'<path d="{outline}" fill="none" stroke="{INK}" stroke-width="3"/>'
    body += text(bx + 50, btop + 52, '集めた気体', 13, ACC, weight='bold')
    body += text(bx + 50, btop + 72, '（水をおし出す）', 12, ACC)
    # 泡
    for (cx, cy, r) in [(bx+50, btop+170, 5), (bx+46, btop+148, 4), (bx+54, btop+126, 3)]:
        body += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff" stroke="{ACC}" stroke-width="2"/>'
    # ボンベとチューブ（びんの口の下へ）
    body += f'<rect x="470" y="110" width="70" height="170" rx="20" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
    body += f'<rect x="490" y="90" width="30" height="22" fill="{INK}"/>'
    body += text(505, 190, '気体', 14, INK)
    body += text(505, 210, 'ボンベ', 14, INK)
    body += f'<path d="M505,90 C505,60 440,56 420,70 C400,84 405,200 380,280 C360,330 260,330 {bx+50},{btop+216}" fill="none" stroke="{INK}" stroke-width="5"/>'
    body += text(300, 372, 'びんに水を満たして逆さに立て、口の下から気体を入れる。水の中でふたをしてとり出す', 13, SOFT)
    return svg(600, 388, body, '気体ボンベから水上置換で集気びんに気体を集めるようす')

def fig_01_5():
    body = text(360, 30, '気体検知管の使い方', 16, INK, weight='bold')
    steps = ['①両はしを折り、ゴムカバーをつける', '②採取器に矢印の向きに差しこむ', '③びんの中に入れ、ハンドルを引く', '④決められた時間待ち、目もりを読む']
    for i, s in enumerate(steps):
        body += text(40, 74 + i * 26, s, 14, INK, 'start')
    # 採取器と検知管
    body += f'<rect x="300" y="210" width="260" height="40" rx="8" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
    body += text(430, 236, '気体採取器', 14, INK)
    body += f'<rect x="560" y="222" width="60" height="16" fill="{INK}"/>'
    body += text(600, 270, 'ハンドル', 13, SOFT)
    body += f'<rect x="120" y="222" width="180" height="16" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    body += f'<rect x="150" y="224" width="70" height="12" fill="#d8c4e8"/>'
    for t in range(0, 7):
        body += f'<line x1="{150+t*25}" y1="222" x2="{150+t*25}" y2="214" stroke="{INK}" stroke-width="1.5"/>'
    body += f'<path d="M170,200 L250,200" stroke="{ACC}" stroke-width="2.5" marker-end="url(#arr)"/>'
    body += text(210, 192, '気体の流れる向き', 12, ACC)
    body += text(185, 270, '色が変わったさかい目の目もりを読む', 13, SOFT)
    body += f'<rect x="440" y="60" width="240" height="98" rx="8" fill="#fbecea" stroke="{RED}" stroke-width="2"/>'
    body += text(560, 86, '⚠ 注意', 14, RED, weight='bold')
    body += text(560, 110, '酸素用検知管は使った後', 13, INK)
    body += text(560, 130, 'とても熱くなるので、', 13, INK)
    body += text(560, 150, 'しばらくさわらない', 13, INK)
    return svg(720, 300, body, '気体検知管の使い方')

def fig_01_6():
    body = text(330, 30, 'ろうそくを燃やす前と後の空気（結果の目安）', 16, INK, weight='bold')
    base, scale = 280, 9
    data = [('燃やす前', 21, 0.04), ('燃やした後', 17, 3)]
    for i, (label, o2, co2) in enumerate(data):
        x = 120 + i * 260
        body += f'<rect x="{x}" y="{base-o2*scale}" width="60" height="{o2*scale}" fill="{ACC}"/>'
        body += text(x + 30, base - o2 * scale - 8, f'約{o2}%', 14, ACC, weight='bold')
        h = max(co2 * scale, 2)
        body += f'<rect x="{x+80}" y="{base-h}" width="60" height="{h}" fill="url(#clay)" stroke="{INK}" stroke-width="1.5"/>'
        body += text(x + 110, base - h - 8, '約0.04%' if co2 < 1 else f'約{co2}%', 14, INK, weight='bold')
        body += text(x + 70, base + 26, label, 15, INK, weight='bold')
    body += f'<line x1="90" y1="{base}" x2="600" y2="{base}" stroke="{INK}" stroke-width="2"/>'
    body += f'<rect x="440" y="52" width="16" height="16" fill="{ACC}"/>' + text(462, 65, '酸素', 14, INK, 'start')
    body += f'<rect x="510" y="52" width="16" height="16" fill="url(#clay)" stroke="{INK}"/>' + text(532, 65, '二酸化炭素', 14, INK, 'start')
    body += text(330, 334, '酸素は一部が使われて減り、二酸化炭素がふえる（ちっ素はほとんど変わらない）', 13, SOFT)
    return svg(660, 350, body, 'ろうそくを燃やす前と後の酸素と二酸化炭素の割合の目安')

if __name__ == "__main__":
  for name, fn in [("01-2", fig_01_2), ("01-3", fig_01_3), ("01-4", fig_01_4), ("01-5", fig_01_5), ("01-6", fig_01_6)]:
    with open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8') as f:
        f.write(fn())
