const { test: base, expect } = require('@playwright/test');
const { CATS, questions, animalOrder, DISCLAIMER, countsFor, cases } = require('../scripts/scenarios.cjs');
const appURL = process.env.ZOO_LIVE_BASE_URL || 'http://127.0.0.1:4173/';
const origin = new URL(appURL).origin;
const avatarBase = new URL('assets/avatars/', appURL).href;
const toolchain = require('../fixtures/toolchain-contract.json');
const test = base.extend({
  audit: [async ({ page, context, browser }, use, testInfo) => {
    const audit = { requests: [], responses: [], failures: [], console: [], pageErrors: [], external: [], allowBrokenImages: false, allowLegacyBlockedFonts: false };
    page.on('request', r => audit.requests.push({url:r.url(),method:r.method(),type:r.resourceType()}));
    page.on('response', r => audit.responses.push({url:r.url(),status:r.status(),type:r.request().resourceType()}));
    page.on('requestfailed', r => audit.failures.push({url:r.url(),type:r.resourceType(),error:r.failure()?.errorText}));
    page.on('console', m => audit.console.push({type:m.type(),text:m.text(),location:m.location()}));
    page.on('pageerror', e => audit.pageErrors.push({name:e.name,message:e.message,stack:e.stack}));
    // This protects test runs from accidental third-party requests; no auth is used.
    await context.route('**/*', async route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      audit.external.push(route.request().url()); return route.abort('blockedbyclient');
    });
    try { await use(audit); }
    finally {
      const expectedImageFailure = url => audit.allowBrokenImages && url.startsWith(avatarBase);
      const expectedLegacyFont = url => audit.allowLegacyBlockedFonts && /^https:\/\/fonts\.(googleapis|gstatic)\.com(?:\/|$)/.test(url || '');
      const runtime = await page.evaluate(() => ({userAgent:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight},dpr:devicePixelRatio,colorScheme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})).catch(()=>null);
      await testInfo.attach('runtime-network-console.json', {body:Buffer.from(JSON.stringify({project:testInfo.project.name,browser:browser.version(),runtime,...audit},null,2)),contentType:'application/json'});
      expect.soft(browser.version(),'Installed engine matches the pinned official Playwright browser manifest').toBe(toolchain.engines[browser.browserType().name()].version);
      expect.soft(audit.pageErrors,'No uncaught runtime errors').toEqual([]);
      expect.soft(audit.external.filter(url=>!expectedLegacyFont(url)),'No third-party fonts/assets/scripts or outbound application requests').toEqual([]);
      expect.soft(audit.failures.filter(x=>!expectedImageFailure(x.url)&&!expectedLegacyFont(x.url)),'No unexpected failed requests').toEqual([]);
      expect.soft(audit.responses.filter(x=>x.status>=400 && !expectedImageFailure(x.url)&&!expectedLegacyFont(x.url)),'No unexpected HTTP errors').toEqual([]);
      const unexpectedErrors = audit.console.filter(x=>x.type==='error' && !(expectedImageFailure(x.location.url) && /Failed to load resource/.test(x.text)) && !(audit.allowLegacyBlockedFonts && /fonts\.googleapis\.com/.test(x.text) && /Content Security Policy|content security policy|Refused to load|violates/.test(x.text)));
      expect.soft(unexpectedErrors,'No unexpected console errors; injected image failure is separately recorded').toEqual([]);
    }
  }, {auto:true}],
});
async function attachJSON(testInfo,name,value) { await testInfo.attach(name,{body:Buffer.from(JSON.stringify(value,null,2)),contentType:'application/json'}); }
async function shot(page,testInfo,name) { const file=testInfo.outputPath(name+'.png'); await page.screenshot({path:file,fullPage:true,animations:'disabled'}); await testInfo.attach(name,{path:file,contentType:'image/png'}); }
async function openIntro(page) {
  const response=await page.goto('./'); expect(response.status()).toBe(200);
  await expect(page).toHaveURL(appURL); await expect(page).toHaveTitle('内在动物园·选择题版');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  await expect(page.getByRole('heading',{name:'你内在的动物园',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'开始测试',exact:true})).toHaveAccessibleName('开始测试');
  await expect(page.locator('.note')).toHaveText(DISCLAIMER);
  await expect(page.locator('#topBar')).toBeHidden();
  await expect(page.locator('vite-error-overlay, nextjs-portal, #webpack-dev-server-client-overlay')).toHaveCount(0);
}
async function start(page) { await page.getByRole('button',{name:'开始测试',exact:true}).click(); await assertQuestion(page,0); }
async function assertQuestion(page,index) {
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','question');
  await expect(page.locator('#progNum')).toHaveText(`${index+1}/20`);
  await expect(page.locator('.scene')).toHaveText(questions[index].scene);
  await expect(page.locator('.opt')).toHaveCount(4);
  for (const [text,key] of questions[index].opts) await expect(page.getByRole('button',{name:text,exact:true})).toHaveAttribute('data-key',key);
}
async function answer(page,index,key) {
  await assertQuestion(page,index);
  const option=questions[index].opts.find(o=>o[1]===key);
  expect(option,`Scenario ${index+1} permits ${key}`).toBeTruthy();
  await page.getByRole('button',{name:option[0],exact:true}).click();
}
async function finish(page,answers,from=0) {
  for (let i=from;i<20;i++) await answer(page,i,answers[i]);
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','results');
}
async function assertResult(page,answers) {
  const counts=countsFor(answers);
  const ranked=animalOrder.filter(k=>counts[k]>0).sort((a,b)=>counts[b]-counts[a]||animalOrder.indexOf(a)-animalOrder.indexOf(b));
  await expect(page.locator('[data-protector]')).toHaveCount(ranked.length);
  expect(await page.locator('[data-protector]').evaluateAll(es=>es.map(e=>e.dataset.protector))).toEqual(ranked);
  await expect(page.locator('#topBar')).toBeHidden();
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  await expect(page.locator('.note')).toHaveText(DISCLAIMER);
  await expect(page.getByRole('button',{name:'重新测一次',exact:true})).toHaveAccessibleName('重新测一次');
  await expect(page.locator('.self-card .protector-name')).toHaveText(`真我在场 · ${counts.self*5}%`);
  await expect(page.locator('.self-card .protector-desc')).toHaveText(counts.self
    ? `有 ${counts.self*5}% 的选择，是真我在直接回应当下。${CATS.self.desc}`
    : '这次的选择里，真我没有直接出现。这并不代表它不在，它一直在，只是需要被留意。');
  if (!ranked.length) {
    await expect(page.locator('.main-card,.other-parts,picture,img')).toHaveCount(0);
    await expect(page.getByText('最近最忙的一位',{exact:true})).toHaveCount(0);
    await expect(page.getByRole('heading',{level:1})).toHaveText('真我');
  } else {
    await expect(page.locator('.main-card')).toHaveAttribute('data-protector',ranked[0]);
    await expect(page.locator('#mainName')).toHaveText(CATS[ranked[0]].mascot);
    const ties=ranked.slice(1).filter(k=>counts[k]===counts[ranked[0]]);
    const tie=ties.length ? '（与「'+ties.map(k=>CATS[k].name).join('」「')+'」并列）' : '';
    for (const [i,key] of ranked.entries()) {
      const card=page.locator(`[data-protector="${key}"]`);
      await expect(card.locator('.protector-pct')).toHaveText(`${CATS[key].name} · 出现在 ${counts[key]*5}% 的选择里${i===0?tie:''}`);
      await expect(card.locator('.protector-quote')).toHaveText('“'+CATS[key].quote+'”');
      await expect(card.locator(i===0?'.main-desc':'.protector-desc')).toHaveText(CATS[key].desc);
    }
  }
  expect(counts.self*5+ranked.reduce((sum,k)=>sum+counts[k]*5,0)).toBe(100);
  return {counts,ranked};
}
async function noHorizontalOverflow(page,testInfo,label) {
  const report=await page.evaluate(()=>{
    const width=document.documentElement.clientWidth;
    return {width,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,
      offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>width+1||r.left < -1);}).map(e=>({tag:e.tagName,class:e.className,text:(e.textContent||'').slice(0,100),rect:{left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}}))};
  });
  await attachJSON(testInfo,label+'-overflow.json',report);
  expect(report.scrollWidth,label+' document must not overflow horizontally').toBeLessThanOrEqual(report.width+1);
  expect(report.bodyScrollWidth,label+' body must not overflow horizontally').toBeLessThanOrEqual(report.width+1);
  expect(report.offenders,label+' visible elements must remain within viewport').toEqual([]);
}
async function decodedImages(page,testInfo,label) {
  const images=page.locator('picture img');
  for(let i=0;i<await images.count();i++) {
    const image=images.nth(i); await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0),{message:'Real browser decodes '+i}).toBe(true);
  }
  const actual=await images.evaluateAll(es=>es.map(e=>({key:e.closest('picture').dataset.avatar,currentSrc:e.currentSrc,src:e.getAttribute('src'),source:e.previousElementSibling?.getAttribute('srcset'),sizes:e.previousElementSibling?.getAttribute('sizes'),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,dpr:devicePixelRatio,alt:e.getAttribute('alt')})));
  await attachJSON(testInfo,label+'-actual-image-selection.json',actual);
  for (const image of actual) {
    expect(image.alt).toBe(''); expect(image.currentSrc).toMatch(/\/assets\/avatars\/[a-z]+-(256|640)\.(webp|png)$/);
    expect(Math.abs(image.width-image.height)).toBeLessThanOrEqual(1);
  }
  return actual;
}
async function focusWithTabs(page,locator) {
  for(let i=0;i<12;i++) {
    await page.keyboard.press('Tab');
    if (await locator.evaluate(el=>el===document.activeElement)) { await expect(locator).toBeFocused(); return; }
  }
  throw Error('Real Tab navigation did not reach intended control in 12 key presses');
}
async function focusVisible(locator) {
  const visual=await locator.evaluate(e=>({focused:e===document.activeElement,visible:e.matches(':focus-visible'),outline:getComputedStyle(e).outlineStyle,width:parseFloat(getComputedStyle(e).outlineWidth)}));
  expect(visual.focused).toBe(true); expect(visual.visible).toBe(true); expect(visual.outline).not.toBe('none'); expect(visual.width).toBeGreaterThanOrEqual(2);
}
// Explicit accessibility stress fixture. This changes rendered text sizing, not
// game state, viewport, DPR, CSS zoom or transform. It is NOT native browser zoom.
async function doubleTextFixture(page,testInfo,label) {
  const proof=await page.evaluate(()=>{
    const metric={width:innerWidth,height:innerHeight,dpr:devicePixelRatio};
    const nodes=[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length && [...e.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()));
    // Snapshot every size BEFORE writes; inherited text is never doubled twice.
    const before=nodes.map(e=>Number(e.dataset.qaOriginalFontSize) || parseFloat(getComputedStyle(e).fontSize));
    nodes.forEach((e,i)=>{ e.dataset.qaOriginalFontSize=String(before[i]); e.style.setProperty('font-size',`${before[i]*2}px`,'important'); });
    return {method:'200% computed-font-size fixture; NOT browser zoom or system text scaling',beforeMetrics:metric,afterMetrics:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},text:nodes.map((e,i)=>({tag:e.tagName,text:e.textContent.slice(0,80),before:before[i],after:parseFloat(getComputedStyle(e).fontSize)}))};
  });
  expect(proof.afterMetrics).toEqual(proof.beforeMetrics);
  for(const item of proof.text) expect(item.after).toBeCloseTo(item.before*2,1);
  await attachJSON(testInfo,label+'-text200-fixture.json',proof);
}
module.exports={test,expect,CATS,questions,animalOrder,DISCLAIMER,cases,countsFor,attachJSON,shot,openIntro,start,assertQuestion,answer,finish,assertResult,noHorizontalOverflow,decodedImages,focusWithTabs,focusVisible,doubleTextFixture};
