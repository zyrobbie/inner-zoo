const {test,expect,cases,animalOrder,openIntro,start,finish,assertResult,decodedImages,noHorizontalOverflow,shot,attachJSON}=require('../tests/helpers.cjs');
test('Published Pages: real 20-answer smoke, images and restart into all-self',async({page},info)=>{
  await openIntro(page); await noHorizontalOverflow(page,info,'live-intro'); await shot(page,info,'live-intro');
  await start(page); await finish(page,cases.smoke); await assertResult(page,cases.smoke);
  const images=await decodedImages(page,info,'live-smoke');
  for(const image of images) expect(new URL(image.currentSrc).pathname).toMatch(/^\/inner-zoo\/assets\/avatars\//);
  await noHorizontalOverflow(page,info,'live-smoke'); await shot(page,info,'live-smoke-result');
  // Read-only URL reachability, separate from publisher's exact-byte SHA check.
  if(info.project.name==='live-chromium-desktop') {
    const statuses=[];
    for(const file of ['index.html','quiz-mc.html',...animalOrder.flatMap(k=>[`assets/avatars/${k}-256.webp`,`assets/avatars/${k}-640.webp`,`assets/avatars/${k}-640.png`])]) {
      const url=new URL(file,process.env.ZOO_LIVE_BASE_URL).href;
      const response=await page.request.get(url);
      statuses.push({url,status:response.status(),bytes:(await response.body()).length});
      expect(response.status(),file+' published').toBe(200);
    }
    await attachJSON(info,'live-complete-dist-http200.json',{statuses,scope:'HTTP reachability only. Exact deployed bytes/commit must also pass the publisher SHA verifier.'});
  }
  await page.getByRole('button',{name:'重新测一次',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  await start(page); await expect(page.locator('.opt[aria-pressed="true"],.opt.sel')).toHaveCount(0);
  await finish(page,cases.allSelf); await assertResult(page,cases.allSelf);
  await noHorizontalOverflow(page,info,'live-all-self'); await shot(page,info,'live-all-self-result');
  await attachJSON(info,'live-scope.json',{url:process.env.ZOO_LIVE_BASE_URL,expectedCommit:process.env.ZOO_EXPECTED_COMMIT||null,scope:'Actual live browser interaction only. Candidate 29-test acceptance, exact asset hashes and screenshot review remain distinct checks.'});
});
