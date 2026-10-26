const {expect,cases,openIntro,start,finish,assertResult,decodedImages,noHorizontalOverflow,shot,attachJSON,doubleTextFixture}=require('./helpers.cjs');
async function layoutRun(page,info,width,color) {
  await page.setViewportSize({width,height:width>700?900:844});
  await page.emulateMedia({colorScheme:color});
  await openIntro(page); await noHorizontalOverflow(page,info,`${width}-${color}-intro`); await shot(page,info,`${width}-${color}-intro`);
  await start(page); await noHorizontalOverflow(page,info,`${width}-${color}-question`); await shot(page,info,`${width}-${color}-question`);
  await finish(page,cases.sixWayTie); await assertResult(page,cases.sixWayTie);
  const selections=await decodedImages(page,info,`${width}-${color}`);
  for(const image of selections) {
    expect(image.currentSrc,'Supported WebP is selected by real picture algorithm').toMatch(/\.webp$/);
    // Capture actual browser selection without asserting a spec-permitted
    // overfetch is a functional failure. The browser may select a larger source.
    const selectedWidth=Number(image.currentSrc.match(/-(\d+)\.webp$/)[1]);
    const expectedMinimum=Math.min(image.width*image.dpr,640);
    expect(selectedWidth+1,'Selected source has sufficient declared density').toBeGreaterThanOrEqual(expectedMinimum);
  }
  const theme=await page.evaluate(()=>({mediaDark:matchMedia('(prefers-color-scheme: dark)').matches,forcedTheme:document.documentElement.getAttribute('data-theme'),bodyBackground:getComputedStyle(document.body).backgroundColor,bodyColor:getComputedStyle(document.body).color,fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status}))}));
  expect(theme.mediaDark).toBe(color==='dark'); expect(theme.forcedTheme).toBeNull();
  expect(theme.bodyBackground).toBe(color==='dark'?'rgb(32, 39, 31)':'rgb(247, 241, 223)');
  await attachJSON(info,`${width}-${color}-theme.json`,theme);
  await noHorizontalOverflow(page,info,`${width}-${color}-results`); await shot(page,info,`${width}-${color}-results`);
}
async function textResizeRun(page,info,width) {
  await page.setViewportSize({width,height:900}); await openIntro(page);
  await doubleTextFixture(page,info,'intro'); await noHorizontalOverflow(page,info,'intro-text200'); await shot(page,info,'intro-text200');
  await start(page); await doubleTextFixture(page,info,'question'); await noHorizontalOverflow(page,info,'question-text200'); await shot(page,info,'question-text200');
  await finish(page,cases.sixWayTie); await assertResult(page,cases.sixWayTie);
  await decodedImages(page,info,'text200'); await doubleTextFixture(page,info,'results');
  await noHorizontalOverflow(page,info,'results-text200'); await shot(page,info,'results-text200');
  await page.getByRole('button',{name:'重新测一次',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  info.annotations.push({type:'fixture-not-native-zoom',description:'200% visible text sizes only. DPR and viewport unchanged. Not a native browser zoom or OS accessibility-font-size claim.'});
}
module.exports={layoutRun,textResizeRun};
