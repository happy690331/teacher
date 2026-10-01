const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../assets/multiplication.js');

test('all seven types keep exact operand digit counts, including minimum and maximum', () => {
    assert.equal(M.types.length, 7);
    for (const type of M.types) {
        for (const random of [() => 0, () => 0.999999999, Math.random]) {
            for (let i = 0; i < 100; i++) {
                const p = M.generate(type.id, random);
                assert.equal(String(p.a).length, type.a);
                assert.equal(String(p.b).length, type.b);
                assert.equal(p.result, p.a * p.b);
                assert.equal(p.partials.reduce((sum, row) => sum + row.shiftedValue, 0), p.result);
            }
        }
    }
});

test('right-aligned partial products handle internal zero, trailing zero, and long carry chains', () => {
    for (const [a, b] of [[9,9], [99,99], [302,104], [100,100], [999,999], [9999,9], [120,30], [10,10]]) {
        const p = M.problem(a,b);
        const valueOfSlots = slots => Number(slots.map(s => s.kind === 'blank' ? '' : s.value).join(''));
        assert.equal(valueOfSlots(M.slots(p.result,0,p.width)), a*b);
        for (const part of p.partials) {
            const slots = M.slots(part.value,part.shift,p.width);
            assert.equal(slots.length,p.width);
            assert.equal(valueOfSlots(slots),part.shiftedValue);
            assert.equal(slots.filter(s => s.kind === 'zero').length,part.shift);
            assert.equal(slots.filter(s => s.kind === 'answer').length,String(part.value).length);
        }
    }
    const p = M.problem(999,999);
    assert.match(p.partials[0].hints[0], /81.*寫 1.*進 8/);
    assert.match(p.partials[0].hints[1], /進位 8.*89.*寫 9.*進 8/);
    assert.match(p.partials[0].hints[3], /最後的進位 8/);
});

test('worksheet paginates 5/10/15/20 questions and uses identical questions for answer sheets', () => {
    for (const count of [5,10,15,20]) {
        const problems = Array.from({length:count}, (_,i) => M.problem(101+i,109));
        for (const answers of [false,true]) {
            const html = M.worksheet(problems,answers);
            assert.equal((html.match(/<section class="sheet">/g)||[]).length, Math.ceil(count/6)*(answers?2:1));
            assert.equal((html.match(/<table class="vertical">/g)||[]).length, count*(answers?2:1));
            for (const p of problems) assert(html.includes(`${p.a} × ${p.b} ＝ ____________`));
            if (answers) for (const p of problems) assert(html.includes(`${p.a} × ${p.b} ＝ ${p.result}`));
            else assert(!html.includes('直式乘法參考答案'));
        }
    }
});
