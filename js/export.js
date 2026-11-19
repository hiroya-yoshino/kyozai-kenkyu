// 評価規準を、Excelで開けるCSVにする。
export const HEADER = ['単元', '単元名', '時', '次', '記号', '観点', '評価方法', '評価規準'];
const VIEWPOINT = { 知: '知識・技能', 思: '思考・判断・表現', 態: '主体的に学習に取り組む態度' };
const LINE = /^\s*(\S+?)（(.+?)）：(.*)$/;

export function evaluationRows(unit) {
  const rows = [];
  for (const l of unit.lessons) {
    if (!l.evaluation) continue;
    for (const line of l.evaluation.split('\n')) {
      const m = line.match(LINE);
      const [code, how, text] = m ? [m[1], m[2], m[3]] : ['', '', line];
      rows.push([String(unit.no ?? ''), unit.title, String(l.n), l.stage ?? '', code, VIEWPOINT[code[0]] ?? '', how, text]);
    }
  }
  return rows;
}

const cell = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function toCSV(rows) {
  return '﻿' + rows.map((r) => r.map((v) => cell(String(v ?? ''))).join(',')).join('\r\n') + '\r\n';
}

export function downloadCSV(filename, rows) {
  const blob = new Blob([toCSV([HEADER, ...rows])], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
