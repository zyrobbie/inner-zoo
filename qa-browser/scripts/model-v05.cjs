// Independent Node source/model test. NOT browser or device QA.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'zoo-v05');
const data=fs.readFileSync(path.join(root,'src/data.js'));
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),'47ff8dcbe58923401401b1a97be685e25db0ee031ab7a723cf74fbd7091bd885','Question/category/disclaimer source unchanged from approved d8830f1');
const {CATS,MC_QUESTIONS:QUESTIONS,ANIMAL_ORDER,DISCLAIMER}=require(path.join(root,'src/data.js'));
assert.equal(QUESTIONS.length,20);
const occurrences=Object.fromEntries([...ANIMAL_ORDER,'self'].map(k=>[k,0]));
QUESTIONS.forEach(q=>{assert.equal(q.opts.length,4);assert.equal(new Set(q.opts.map(o=>o[1])).size,4);q.opts.forEach(([text,key])=>{assert.ok(text&&CATS[key]);occurrences[key]++});});
assert.equal(occurrences.self,20);ANIMAL_ORDER.forEach(k=>assert.equal(occurrences[k],10));
const source=fs.readFileSync(path.join(root,'src/build-mc.js'),'utf8');
// Extract only the production scoring function; no mock DOM is reported as UI.
const compute=source.match(/function computeResults\(\)\s*\{[\s\S]*?\n\}/)?.[0];assert.ok(compute,'Production scoring function exists');
const ctx={QUESTIONS,ANIMAL_ORDER,state:{answers:[]}};vm.createContext(ctx);vm.runInContext(compute+';this.run=computeResults',ctx);
function check(answers){ctx.state.answers=answers;const actual=JSON.parse(JSON.stringify(ctx.run()));const counts=Object.fromEntries([...ANIMAL_ORDER,'self'].map(k=>[k,0]));answers.forEach((k,i)=>{assert.ok(QUESTIONS[i].opts.some(o=>o[1]===k));counts[k]++});const expected={selfPct:counts.self*5,animals:ANIMAL_ORDER.map((key,idx)=>({key,idx,count:counts[key],pct:counts[key]*5})).sort((a,b)=>b.count-a.count||a.idx-b.idx)};assert.deepEqual(actual,expected);assert.equal(actual.selfPct+actual.animals.reduce((s,a)=>s+a.pct,0),100);return actual;}
const fixture=require(path.join(root,'qa-browser/scripts/scenarios.cjs'));
for(const answers of Object.values(fixture.cases))check(answers);
assert.equal(check(fixture.solveTargets({anger:6,perfect:4,anxvig:3,please:3,numb:2,self:2})).animals.filter(a=>a.count>0).length,5);
const one=QUESTIONS.map(q=>q.opts.some(o=>o[1]==='anger')?'anger':'self');assert.equal(check(one).animals.filter(a=>a.count>0).length,1);
assert.equal(check(Array(20).fill('self')).animals.filter(a=>a.count>0).length,0);
assert.equal(check(fixture.cases.sixWayTie).animals.filter(a=>a.count>0).length,6);
// Seeded reachable answers exercise score/order without modifying production.
let seed=505;for(let n=0;n<5000;n++){const answers=QUESTIONS.map(q=>{seed=(1664525*seed+1013904223)>>>0;return q.opts[(seed>>>16)%4][1]});check(answers)}
assert.ok(source.includes(DISCLAIMER)||source.includes('disclaimerJson'),'Disclaimer still included');
console.log('PASS: approved content SHA; 20x4 options and balance; production computeResults; 5000 reachable samples plus all-self/zero-self/ties/one-animal/five-other edges. MODEL ONLY, not rendered layout or device saving.');
