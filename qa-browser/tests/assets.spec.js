const {test,expect,animalOrder,cases,openIntro,start,finish,assertResult,decodedImages,noHorizontalOverflow,shot,attachJSON}=require('./helpers.cjs');

test('Every complete dist avatar resource returns HTTP 200 and expected MIME; no third-party font dependency',async({page,audit},info)=>{
  await openIntro(page); await start(page); await finish(page,cases.sixWayTie);
  await assertResult(page,cases.sixWayTie); await decodedImages(page,info,'local-only');
  const files=animalOrder.flatMap(k=>[`${k}-256.webp`,`${k}-640.webp`,`${k}-640.png`]);
  const statuses=[];
  for(const file of files) {
    const response=await page.request.get('/assets/avatars/'+file);
    const type=response.headers()['content-type'];
    statuses.push({file,status:response.status(),type,bytes:(await response.body()).length});
    expect(response.status()).toBe(200); expect(type).toBe(file.endsWith('webp')?'image/webp':'image/png');
    expect(statuses.at(-1).bytes).toBeGreaterThan(1000);
  }
  expect(audit.requests.filter(r=>r.type==='font')).toEqual([]);
  expect(audit.external).toEqual([]);
  const fonts=await page.evaluate(async()=>{await document.fonts.ready; return {status:document.fonts.status,downloaded:[...document.fonts].map(f=>f.family),body:getComputedStyle(document.body).fontFamily,result:getComputedStyle(document.querySelector('.result-page')).fontFamily};});
  expect(fonts.downloaded).toEqual([]);
  await attachJSON(info,'all-assets-http200-and-system-fonts.json',{statuses,fonts,scope:'All third-party network requests blocked. This verifies no external font dependency, NOT offline reload/service-worker support.'});
  await shot(page,info,'third-party-network-blocked-result');
});

test('All images fail: readable scores and original copy survive; layout and restart still usable',async({page,audit},info)=>{
  audit.allowBrokenImages=true;
  await page.route('**/assets/avatars/**',route=>route.abort('failed'));
  await openIntro(page); await start(page); await finish(page,cases.sixWayTie); await assertResult(page,cases.sixWayTie);
  const images=page.locator('picture img');
  for(let i=0;i<await images.count();i++) {
    await images.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(()=>images.nth(i).evaluate(e=>e.complete)).toBe(true);
    expect(await images.nth(i).evaluate(e=>e.naturalWidth)).toBe(0);
    const box=await images.nth(i).boundingBox(); expect(box.width).toBeGreaterThan(0); expect(Math.abs(box.width-box.height)).toBeLessThan(1);
  }
  await noHorizontalOverflow(page,info,'broken-images'); await shot(page,info,'injected-image-failures');
  await page.getByRole('button',{name:'重新测一次',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  expect(audit.failures.length).toBeGreaterThanOrEqual(6);
  info.annotations.push({type:'injected-network-failure',description:'Known image ERR_FAILED console entries are recorded and expected; JavaScript errors are never suppressed.'});
});

test('Controlled PNG fallback fixture: removing WebP sources leaves original PNG img usable',async({page},info)=>{
  await openIntro(page); await start(page); await finish(page,cases.sixWayTie); await assertResult(page,cases.sixWayTie);
  await decodedImages(page,info,'before-png-fixture');
  // Modern Chromium and WebKit support WebP. Aborting WebP does NOT reliably
  // trigger picture fallback, so do not pretend it does. Only source nodes are
  // removed; original img src, quiz answers and result HTML remain untouched.
  await page.locator('picture source[type="image/webp"]').evaluateAll(es=>es.forEach(e=>e.remove()));
  await expect.poll(()=>page.locator('picture img').evaluateAll(es=>es.every(e=>e.currentSrc.endsWith('.png')&&e.complete&&e.naturalWidth>0))).toBe(true);
  const selected=await decodedImages(page,info,'png-fixture');
  expect(selected).toHaveLength(6); for(const image of selected) expect(image.currentSrc).toMatch(/-640\.png$/);
  await assertResult(page,cases.sixWayTie); await noHorizontalOverflow(page,info,'png-fixture'); await shot(page,info,'controlled-png-fixture');
  info.annotations.push({type:'fixture-not-legacy-engine',description:'Tests original PNG fallback element decoding/layout after WebP source removal. It does not claim a genuine WebP-unsupported browser was exercised.'});
});
