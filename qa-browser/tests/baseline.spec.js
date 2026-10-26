const {test,expect,cases,questions,DISCLAIMER,shot,attachJSON}=require('./helpers.cjs');
test('T02 original phase-one standalone HTML: one real 20-answer original smoke = 25/5/5/65',async({page,audit},info)=>{
  audit.allowLegacyBlockedFonts=true;
  const response=await page.goto('/baseline/index.html'); expect(response.status()).toBe(200);
  expect(response.headers()['content-security-policy']).toContain("font-src 'none'");
  await expect(page).toHaveTitle('内在动物园·选择题版');
  await expect(page.locator('.note')).toHaveText(DISCLAIMER);
  await page.getByRole('button',{name:'开始测试',exact:true}).click();
  for(let i=0;i<20;i++) {
    await expect(page.locator('#progNum')).toHaveText(`${i+1}/20`);
    await expect(page.locator('.scene')).toHaveText(questions[i].scene);
    const [label]=questions[i].opts.find(o=>o[1]===cases.smoke[i]);
    await page.getByRole('button',{name:label,exact:true}).click();
  }
  await expect(page.locator('.main-card .main-name')).toHaveText('猫头鹰警官');
  await expect(page.locator('.protector-pct')).toHaveText(['完美主义 · 出现在 25% 的选择里','焦虑·警惕 · 出现在 5% 的选择里','讨好 · 出现在 5% 的选择里']);
  await expect(page.getByText('真我在场 · 65%',{exact:true})).toBeVisible();
  await expect(page.locator('.note')).toHaveText(DISCLAIMER);
  await expect(page.getByRole('button',{name:'重新测一次',exact:true})).toBeVisible();
  await shot(page,info,'original-baseline-smoke-25-5-5-65');
  await attachJSON(info,'original-baseline-scope.json',{baselineSha256:'5865f5f1094b07a8857b3a2ded3acbb8b8b2dcf758d8bc00c0aabd4bcfbc9604',scope:'One original 20-answer smoke only; no claim that original mobile, accessibility or visual bugs are fixed',fontBehavior:'Original source bytes unchanged; legacy Google Fonts blocked by response-header CSP and external routing'});
  info.annotations.push({type:'baseline-fonts-blocked',description:'Original legacy Google Fonts are deliberately unavailable. Expected font CSP errors are isolated from app runtime errors.'});
});
