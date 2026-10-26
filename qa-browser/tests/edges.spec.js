const {test,cases,openIntro,start,finish,assertResult,decodedImages,noHorizontalOverflow,shot}=require('./helpers.cjs');
for(const [name,answers] of Object.entries({twoWayTie:cases.twoWayTie,sixWayTie:cases.sixWayTie,zeroSelf:cases.zeroSelf})) {
  test(`${name}: reachable 20-click scoring path and exact original result copy`,async({page},info)=>{
    await openIntro(page); await start(page); await finish(page,answers);
    await assertResult(page,answers); await decodedImages(page,info,name);
    await noHorizontalOverflow(page,info,name); await shot(page,info,name+'-result');
  });
}
