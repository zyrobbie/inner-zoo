const assert = require('node:assert/strict');
const content = require('../fixtures/content-contract.json');
const { questions, animalOrder } = content;
const keys = [...animalOrder, 'self'];
function countsFor(answers) {
  assert.equal(answers.length, 20);
  const counts = Object.fromEntries(keys.map(k => [k, 0]));
  answers.forEach((key, i) => {
    assert.ok(questions[i].opts.some(o => o[1] === key), `Illegal answer for question ${i+1}: ${key}`);
    counts[key]++;
  });
  return counts;
}
function solveTargets(target) {
  const left = keys.map(k => target[k] || 0), memo = new Set();
  assert.equal(left.reduce((a,b) => a+b), 20);
  function dfs(i) {
    if (i === 20) return left.every(v => v === 0) ? [] : null;
    const sig = i + ':' + left.join(','); if (memo.has(sig)) return null;
    for (const [, key] of questions[i].opts) {
      const pos = keys.indexOf(key); if (!left[pos]) continue;
      left[pos]--; const rest = dfs(i + 1); left[pos]++;
      if (rest) return [key, ...rest];
    }
    memo.add(sig); return null;
  }
  const answers = dfs(0); assert.ok(answers, 'Target must be reachable by real choices');
  return answers;
}
const smokePattern = ['perfect','perfect','perfect','anxvig','please','self','self','perfect'];
const smoke = questions.map((q,i) => q.opts.some(o => o[1] === smokePattern[i%8]) ? smokePattern[i%8] : 'self');
const cases = {
  smoke,
  allSelf: Array(20).fill('self'),
  zeroSelf: questions.map(q => q.opts.find(o => o[1] !== 'self')[1]),
  twoWayTie: solveTargets({ anger:5, perfect:5, self:10 }),
  sixWayTie: solveTargets({ anger:3, perfect:3, anxvig:3, please:3, avoid:3, numb:3, self:2 }),
};
assert.deepEqual(countsFor(smoke), { anger:0, perfect:5, anxvig:3, please:0, avoid:0, numb:0, self:12 });
module.exports = { ...content, keys, countsFor, solveTargets, cases };
