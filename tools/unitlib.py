# 単元データ（JSON）を作るための共通部品。
# 評価規準の文は、啓林館「単元の目標と評価の具体例（6年）」を NotebookLM で抜き出したもの
# （docs/notebooklm/20261108-rika6-hour-plan.md）をもとに、記号から組み立てる。
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

SOURCES = [
    {"title": "啓林館「わくわく理科」令和6年度 年間指導計画案（標準案）",
     "url": "https://www.shinko-keirin.co.jp/keirinkan/sho_r6/rika/file/rika_guidance_plan_standard.pdf",
     "note": "単元の順番・時数・実施月"},
    {"title": "啓林館「わくわく理科」6年 単元の目標と評価の具体例",
     "url": "https://www.shinko-keirin.co.jp/keirinkan/sho_r6/rika/file/rika_unit_example06.pdf",
     "note": "毎時間の配分・各次の問い・評価規準"},
    {"title": "小学校学習指導要領（平成29年告示）解説 理科編",
     "url": "https://www.mext.go.jp/content/20211020-mxt_kyoiku02-100002607_05.pdf",
     "note": None},
    {"title": "NotebookLM「理科（啓林館）」での抜き出し（2026-11-08）",
     "note": "docs/notebooklm/20261108-rika6-hour-plan.md"},
]


def sources(curriculum_note):
    out = []
    for s in SOURCES:
        s = dict(s)
        if s.get('note') is None:
            s['note'] = curriculum_note
        out.append(s)
    return out


def think_attitude(topic, think2_detail):
    """思①②・態①② は単元をこえて決まった形なので、主題と思②の中身から作る。"""
    return {
        '思①': f'{topic}について、問題を見いだし、予想や仮説をもとに、解決の方法を発想し、表現するなどして問題解決している。',
        '思②': f'{topic}について、{think2_detail}について、より妥当な考えをつくりだし、表現するなどして問題解決している。',
        '態①': f'{topic}についての事物・現象に進んで関わり、粘り強く、他者と関わりながら問題解決しようとしている。',
        '態②': f'{topic}について学んだことを学習や生活に生かそうとしている。',
    }


class Unit:
    def __init__(self, uid, title, hours, month, term, curriculum, criteria):
        self.d = {"id": uid, "title": title, "hours": hours, "month": month, "term": term,
                  "curriculum": curriculum, "lessons": []}
        self.criteria = criteria

    def ev(self, *pairs):
        """ev(('思①', '発言・記述分析'), ...) → 改行区切りの評価規準文"""
        return '\n'.join(f'{code}（{how}）：{self.criteria[code]}' for code, how in pairs)

    def goals(self):
        def join(prefix):
            items = sorted(k for k in self.criteria if k.startswith(prefix))
            return ''.join(f'{self.criteria[k][:-1]}（{k}）。' for k in items)
        self.d['goals'] = {"knowledge": join('知'), "thinking": join('思'), "attitude": join('態')}

    def intro(self, question, presentation):
        self.d['intro'] = {"question": question, "presentation": presentation}

    def lesson(self, stage, aim, activities, summary, evaluation=None, experiment=None, figure=None):
        n = len(self.d['lessons']) + 1
        l = {"n": n, "stage": stage, "aim": aim, "activities": activities, "summary": summary}
        if evaluation:
            l['evaluation'] = evaluation
        if figure:
            l['figure'] = figure
        if experiment:
            l['experiment'] = experiment
        self.d['lessons'].append(l)

    def save(self, curriculum_note):
        self.goals()
        self.d['sources'] = sources(curriculum_note)
        assert len(self.d['lessons']) == self.d['hours'], (self.d['id'], len(self.d['lessons']))
        p = os.path.join(ROOT, 'data', 'rika', '6', f"{self.d['id']}.json")
        with open(p, 'w', encoding='utf-8') as f:
            f.write(json.dumps(self.d, ensure_ascii=False, indent=2) + '\n')
        idx_p = os.path.join(ROOT, 'data', 'index.json')
        idx = json.load(open(idx_p, encoding='utf-8'))
        for it in idx['subjects'][0]['grades'][1]['items']:
            if it.get('id') == self.d['id']:
                it['status'] = 'ready'
        with open(idx_p, 'w', encoding='utf-8') as f:
            f.write(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')


def ex(materials, steps, safety, fig=None, caption=None):
    e = {"materials": materials, "steps": steps, "safety": safety}
    if fig:
        e['figure'] = {"src": f"figures/rika/6/{fig}.svg", "caption": caption}
    return e


def fig(name, caption):
    return {"src": f"figures/rika/6/{name}.svg", "caption": caption}
