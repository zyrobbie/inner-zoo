const {test}=require('./helpers.cjs');
const {layoutRun,textResizeRun}=require('./layout.cjs');
for(const width of [360,390,430]) for(const color of ['light','dark']) {
  test(`Mobile ${width}px ${color}: real 20 answers, screenshot, no overflow and actual srcset`,async({page},info)=>layoutRun(page,info,width,color));
}
test('Mobile 360px: explicit 200% text-resize fixture, not device or browser zoom',async({page},info)=>textResizeRun(page,info,360));
