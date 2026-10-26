// Syntax, static wiring and synthetic-plan checks only. NEVER a browser pass.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const Module = require('node:module');
const { qa } = require('./paths.cjs');
const { cases,countsFor } = require('./scenarios.cjs');
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(['node_modules','artifacts'].includes(e.name)?[]:walk(path.join(dir,e.name))):[path.join(dir,e.name)]); }
const scripts=walk(qa).filter(p=>/\.(js|cjs)$/.test(p));
for(const file of scripts) execFileSync(process.execPath,['--check',file]);
for(const answers of Object.values(cases)) assert.equal(Object.values(countsFor(answers)).reduce((a,b)=>a+b,0),20);
const lock=require('../package-lock.json');
const toolchain=require('../fixtures/toolchain-contract.json');
for(const [name,pkg] of Object.entries(lock.packages).filter(([name])=>name)) {
  assert.ok(['node_modules/@playwright/test','node_modules/playwright','node_modules/playwright-core'].includes(name));
  assert.equal(pkg.version,toolchain.playwright);
  assert.ok(pkg.resolved.startsWith('https://registry.npmjs.org/'));
  assert.ok(pkg.integrity.startsWith('sha512-'));
}
assert.equal(Object.keys(lock.packages).length,4);
const provenance=require('../fixtures/baseline/provenance.json');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(qa,'fixtures/baseline/index.html'))).digest('hex'),provenance.sha256);
const workflow=fs.readFileSync(path.join(qa,'ci/phase3-browser.yml.draft'),'utf8');
assert.ok(workflow.includes('workflow_dispatch:') && !/\b(pull_request|schedule):/.test(workflow));
assert.ok(workflow.includes("branches: ['main']"));
assert.ok(workflow.includes("github.repository == 'zyrobbie/inner-zoo'"));
assert.ok(workflow.includes("github.ref == 'refs/heads/main'"));
assert.ok(workflow.includes('contents: read') && !/: write\b/.test(workflow));
assert.ok(workflow.includes('persist-credentials: false'));
assert.ok(workflow.includes('!github.event.repository.private'));
assert.ok(!workflow.includes('&& false'), 'Old private authorization switch must not block the approved public repository');
assert.ok(!/--host\s+0\.0\.0\.0|ngrok|cloudflared|deploy-pages/.test(workflow));
assert.ok(workflow.includes('npm ci --ignore-scripts'));
// Static declaration inventory: no browser/Playwright dependency is loaded.
const declared=[];
const fakeTest=(name,fn)=>declared.push({file:global.__declarationFile,name});
fakeTest.extend=()=>fakeTest;
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){ if(request==='@playwright/test') return {test:fakeTest,expect:{},defineConfig:x=>x}; return originalLoad.apply(this,arguments); };
let config, liveConfig;
const priorLiveURL=process.env.ZOO_LIVE_BASE_URL;
delete process.env.ZOO_LIVE_BASE_URL;
try {
  config=require('../playwright.config.cjs');
  liveConfig=require('../playwright.live.config.cjs');
  for(const file of scripts.filter(f=>f.endsWith('.spec.js'))) {global.__declarationFile=file; require(file);}
} finally {Module._load=originalLoad; delete global.__declarationFile; if(priorLiveURL===undefined) delete process.env.ZOO_LIVE_BASE_URL; else process.env.ZOO_LIVE_BASE_URL=priorLiveURL;}
const projects=config.projects.map(p=>({name:p.name,tests:declared.filter(t=>(Array.isArray(p.testMatch)?p.testMatch:[p.testMatch]).some(m=>m.test(t.file))).map(t=>t.name)}));
const total=projects.reduce((n,p)=>n+p.tests.length,0);
assert.equal(total,29);
const liveTests=declared.filter(t=>liveConfig.testMatch.test(t.file));
const liveTotal=liveConfig.projects.length*liveTests.length;
assert.equal(liveTotal,4);
assert.equal(liveConfig.use.baseURL,'https://zyrobbie.github.io/inner-zoo/');
assert.ok(!liveConfig.webServer, 'Live checks must not start or silently fall back to a local server');
fs.mkdirSync(path.join(qa,'artifacts'),{recursive:true});
const report={status:'STATIC DRAFT CHECK ONLY; NO BROWSER EXECUTED',scriptsParsed:scripts.length,syntheticPlans:Object.keys(cases),baselineHashVerified:true,officialRegistryLockVerified:true,declaredProjectTests:total,declaredLiveProjectTests:liveTotal,projects,liveProjects:liveConfig.projects.map(p=>({name:p.name,tests:liveTests.map(t=>t.name)}))};
fs.writeFileSync(path.join(qa,'artifacts/draft-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,scriptsParsed:scripts.length,declaredProjectTests:total,declaredLiveProjectTests:liveTotal},null,2));
