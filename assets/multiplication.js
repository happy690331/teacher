/* Shared arithmetic and worksheet rendering. No external services required. */
(function (root) {
    'use strict';
    const types = [
        { id: '1x1', a: 1, b: 1, label: '一位數 × 一位數' },
        { id: '2x1', a: 2, b: 1, label: '二位數 × 一位數' },
        { id: '2x2', a: 2, b: 2, label: '二位數 × 二位數' },
        { id: '3x1', a: 3, b: 1, label: '三位數 × 一位數' },
        { id: '3x2', a: 3, b: 2, label: '三位數 × 二位數' },
        { id: '3x3', a: 3, b: 3, label: '三位數 × 三位數' },
        { id: '4x1', a: 4, b: 1, label: '四位數 × 一位數' },
    ];
    const places = ['個', '十', '百', '千', '萬', '十萬', '百萬'];
    function generate(typeId, random = Math.random) {
        const type = types.find(item => item.id === typeId);
        if (!type) throw new Error('請選擇有效題型');
        const number = digits => {
            const min = 10 ** (digits - 1);
            return min + Math.floor(random() * (10 ** digits - min));
        };
        return problem(number(type.a), number(type.b));
    }
    function problem(a, b) {
        if (![a, b].every(n => Number.isInteger(n) && n > 0)) throw new Error('乘數必須為正整數');
        const digitsA = String(a).split('').reverse().map(Number);
        const digitsB = String(b).split('').reverse().map(Number);
        const partials = digitsB.map((digit, shift) => {
            let carry = 0;
            const hints = digitsA.map((n, position) => {
                const incoming = carry;
                const value = n * digit + incoming;
                carry = Math.floor(value / 10);
                return `${n} × ${digit}${incoming ? ` ＋ 進位 ${incoming}` : ''} ＝ ${value}，在${places[position + shift]}位寫 ${value % 10}${carry ? `，向左進 ${carry}` : '，不需進位'}。`;
            });
            if (carry) hints.push(`最後的進位 ${carry}，寫在${places[digitsA.length + shift]}位。`);
            const value = a * digit;
            return { digit, shift, value, shiftedValue: value * 10 ** shift, hints };
        });
        return { a, b, result: a * b, width: String(a).length + String(b).length, partials };
    }
    // Slots are indexed from the units column; shifted zeros are provided as place-value scaffolding.
    function slots(value, shift, width) {
        const digits = String(value).split('').reverse();
        return Array.from({ length: width }, (_, col) => {
            const position = width - 1 - col;
            if (position < shift) return { kind: 'zero', value: 0, position };
            if (position - shift < digits.length) return { kind: 'answer', value: Number(digits[position - shift]), position };
            return { kind: 'blank', position };
        });
    }
    function worksheet(problems, includeAnswers) {
        const operand = (n, width, sign = '', line = false) => `<tr><td class="sign${line ? ' rule' : ''}">${sign}</td>${String(n).padStart(width, ' ').split('').map(d => `<td class="digit${line ? ' rule' : ''}">${d === ' ' ? '&nbsp;' : d}</td>`).join('')}</tr>`;
        const answerRow = (p, value, shift, answers, final) => `<tr><td class="sign${final ? ' sum' : ''}">${final ? '=' : ''}</td>${slots(value, shift, p.width).map(s => `<td class="digit work${final ? ' sum' : ''}">${s.kind === 'blank' ? '&nbsp;' : answers ? s.value : '<span class="empty">&nbsp;</span>'}</td>`).join('')}</tr>`;
        function question(p, index, answers) {
            let rows = operand(p.a, p.width) + operand(p.b, p.width, '×', true);
            if (p.partials.length > 1) rows += p.partials.map(part => answerRow(p, part.value, part.shift, answers, false)).join('');
            rows += answerRow(p, p.result, 0, answers, p.partials.length > 1);
            return `<td class="question"><p>${index + 1}. ${p.a} × ${p.b} ＝ ${answers ? p.result : '____________'}</p><table class="vertical">${rows}</table></td>`;
        }
        function pages(answers) {
            let html = '';
            // A4 一頁排成左右兩欄、上下五列，讓 10 題可在單面完成。
            for (let start = 0; start < problems.length; start += 10) {
                const chunk = problems.slice(start, start + 10);
                html += `<section class="sheet"><h1>直式乘法${answers ? '參考答案' : '學習單'}</h1><p class="identity">班級：____________　姓名：____________　日期：____________</p><p class="instructions">${answers ? '各列部分積須依位值對齊，再相加得到乘積。' : '由右往左計算。十位的部分積向左移一格，百位向左移兩格。'}</p><table class="questions">`;
                for (let i = 0; i < chunk.length; i += 2) html += `<tr>${question(chunk[i], start + i, answers)}${chunk[i + 1] ? question(chunk[i + 1], start + i + 1, answers) : '<td class="question"></td>'}</tr>`;
                html += `</table><footer>${answers ? '參考答案' : '練習題'} · 第 ${Math.floor(start / 10) + 1} 頁</footer></section>`;
            }
            return html;
        }
        return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><title>直式乘法學習單</title><style>
@page{size:A4 portrait;margin:6mm}*{box-sizing:border-box}body{margin:0;color:#111;background:white;font-family:"DFKai-SB","Noto Sans TC",sans-serif}.sheet{page-break-after:always;break-after:page}.sheet:last-child{page-break-after:auto;break-after:auto}h1{font-size:18px;margin:0 0 3px}.identity{font-size:10px;border-bottom:1px solid #222;padding-bottom:3px;margin:0}.instructions{font-size:9px;margin:3px 0}.questions{width:100%;table-layout:fixed;border-collapse:collapse}.questions>tbody>tr{page-break-inside:avoid}.question{width:50%;height:35mm;vertical-align:top;padding:2mm 2mm 1mm;border:1px solid #bbb}.question p{margin:0 0 2px;font-size:10px;line-height:1.15}.vertical{border-collapse:collapse;margin:0 auto}.digit{width:5mm;height:4.5mm;text-align:center;font:15px monospace;padding:0}.sign{width:5mm;font-size:14px;text-align:center}.rule{border-bottom:1px solid #222}.sum{border-top:1px solid #222}.empty{display:block;border:1px dotted #aaa;width:4mm;height:4mm;margin:auto}.work{height:5mm}footer{text-align:right;font-size:8px;padding-top:2px}.toolbar{padding:10px;background:#eef2ff;font-family:sans-serif}.toolbar button{padding:7px 16px;font-size:15px}@media print{.toolbar{display:none}}@media screen{body{max-width:800px;margin:auto;padding:10px}.sheet{margin-bottom:18px}}
</style></head><body>${pages(false)}${includeAnswers ? pages(true) : ''}</body></html>`;
    }
    const api = { types, places, generate, problem, slots, worksheet };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Multiplication = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
