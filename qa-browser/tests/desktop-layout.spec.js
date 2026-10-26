const {test}=require('./helpers.cjs');
const {layoutRun,textResizeRun}=require('./layout.cjs');
for(const color of ['light','dark']) {
  test(`Desktop 1280px ${color}: real 20 answers, screenshot, no overflow and actual srcset`,async({page},info)=>layoutRun(page,info,1280,color));
}
test('Desktop: explicit 200% text-resize fixture, not native browser zoom',async({page},info)=>textResizeRun(page,info,1280));
