const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { project, dist, qa } = require('./paths.cjs');
const { sourceSha256, animalOrder, cases, countsFor } = require('./scenarios.cjs');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(path.join(project,'src/data.js')), sourceSha256, 'Frozen content contract changed: require approved content review before refreshing it');
const expected = ['index.html','quiz-mc.html','assets/cover/intro-v051.webp','assets/cover/intro-v051.jpg', ...animalOrder.flatMap(k => [`assets/avatars/${k}-256.webp`,`assets/avatars/${k}-640.webp`,`assets/avatars/${k}-640.png`])];
const files = expected.map(relative => {
  const full = path.join(dist, relative);
  assert.ok(fs.statSync(full).size > 0, `Missing complete-dist file ${relative}`);
  if (relative.startsWith('assets/avatars/')) assert.equal(hash(full),hash(path.join(project,'assets/avatars/web',path.basename(full))),`Stale copied derivative ${relative}`);
  if (relative.startsWith('assets/cover/')) assert.equal(hash(full),hash(path.join(project,relative)),`Stale copied cover ${relative}`);
  return { file: relative, bytes: fs.statSync(full).size, sha256: hash(full) };
});
const evidence = {
  generatedAt: new Date().toISOString(), kind: 'static preflight, NOT browser acceptance',
  commit: process.env.GITHUB_SHA || null, node: process.version,
  sourceDataSha256: sourceSha256, files,
  scenarios: Object.fromEntries(Object.entries(cases).map(([name,answers]) => [name,{answers,counts:countsFor(answers)}])),
};
fs.mkdirSync(path.join(qa,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(qa,'artifacts/preflight.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(`Preflight: ${files.length} complete dist files; synthetic plans legal; no browser test run.`);
