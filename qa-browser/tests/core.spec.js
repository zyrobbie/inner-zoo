const {test,expect,questions,CATS,cases,openIntro,start,finish,answer,assertQuestion,assertResult,decodedImages,noHorizontalOverflow,shot,attachJSON,focusWithTabs,focusVisible}=require('./helpers.cjs');

test('20 real answers: original 25/5/5/65 smoke, restart, all-self has no protector',async({page},info)=>{
  await openIntro(page); await noHorizontalOverflow(page,info,'intro'); await shot(page,info,'intro');
  await start(page); await noHorizontalOverflow(page,info,'question'); await shot(page,info,'question-one');
  await finish(page,cases.smoke);
  await assertResult(page,cases.smoke); await decodedImages(page,info,'smoke');
  await noHorizontalOverflow(page,info,'smoke'); await shot(page,info,'smoke-result');
  await page.getByRole('button',{name:'重新测一次',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  await expect(page.locator('.result-page')).toHaveCount(0);
  await start(page); await expect(page.locator('.opt[aria-pressed="true"],.opt.sel')).toHaveCount(0);
  await finish(page,cases.allSelf); await assertResult(page,cases.allSelf);
  await noHorizontalOverflow(page,info,'all-self'); await shot(page,info,'all-self-result');
});

test('Back preserves shuffled choices, selected styling and aria-pressed; editing changes outcome; reload resets existing progress',async({page},info)=>{
  await openIntro(page); await start(page);
  const originalOrder=await page.locator('.opt').evaluateAll(es=>es.map(e=>e.dataset.key));
  await answer(page,0,'perfect'); await page.getByRole('button',{name:'上一题',exact:true}).click();
  await assertQuestion(page,0);
  expect(await page.locator('.opt').evaluateAll(es=>es.map(e=>e.dataset.key))).toEqual(originalOrder);
  const selected=page.locator('.opt[data-key="perfect"]');
  await expect(selected).toHaveAttribute('aria-pressed','true'); await expect(selected).toHaveClass(/\bsel\b/);
  await expect(page.locator('.opt[aria-pressed="true"]')).toHaveCount(1);
  const styles=await page.locator('.opt').evaluateAll(es=>es.map(e=>({key:e.dataset.key,selected:e.classList.contains('sel'),background:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow})));
  expect(styles.find(s=>s.selected).background).not.toBe(styles.find(s=>!s.selected).background);
  expect(styles.find(s=>s.selected).shadow).not.toBe('none');
  await attachJSON(info,'back-selection.json',{originalOrder,styles}); await shot(page,info,'back-selected');
  await answer(page,0,'anger');
  await page.getByRole('button',{name:'上一题',exact:true}).click();
  await expect(page.locator('.opt[data-key="anger"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.opt[data-key="perfect"]')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.opt[data-key="perfect"]')).not.toHaveClass(/\bsel\b/);
  const edited=[...cases.allSelf]; edited[0]='anger';
  await finish(page,edited); await assertResult(page,edited);
  await page.getByRole('button',{name:'重新测一次',exact:true}).click(); await start(page);
  await answer(page,0,'perfect'); await assertQuestion(page,1);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
  await start(page); await expect(page.locator('.opt[aria-pressed="true"],.opt.sel')).toHaveCount(0);
  info.annotations.push({type:'existing-behavior',description:'Reload loses in-memory progress. This test documents existing behavior; it does not add persistence.'});
});

test('Keyboard-only completion; visible focus, accessible names, decorative images, limited DOM/ARIA reading order',async({page},info)=>{
  await openIntro(page);
  await focusWithTabs(page,page.getByRole('button',{name:'开始测试',exact:true}));
  await focusVisible(page.locator('#startBtn')); await shot(page,info,'keyboard-start-focus');
  await page.keyboard.press('Enter');
  for(let i=0;i<20;i++) {
    await assertQuestion(page,i);
    const [label]=questions[i].opts.find(o=>o[1]===cases.sixWayTie[i]);
    const button=page.getByRole('button',{name:label,exact:true});
    await expect(button).toHaveAccessibleName(label); await focusWithTabs(page,button); await focusVisible(button);
    if(i===0) await shot(page,info,'keyboard-option-focus');
    await page.keyboard.press(i%2?'Enter':'Space');
  }
  const {ranked}=await assertResult(page,cases.sixWayTie); await decodedImages(page,info,'keyboard-result');
  const headings=await page.locator('.result-page h1,.result-page h2,.result-page h3').allTextContents();
  expect(headings).toEqual([CATS[ranked[0]].mascot,'其他也在活动的部分',...ranked.slice(1).map(k=>CATS[k].mascot),'真我']);
  await expect(page.getByRole('region',{name:CATS[ranked[0]].mascot,exact:true})).toHaveCount(1);
  await expect(page.getByRole('region',{name:'其他也在活动的部分',exact:true})).toHaveCount(1);
  await expect(page.getByRole('region',{name:'真我',exact:true})).toHaveCount(1);
  // Empty alt avoids reading each decorative character image twice.
  await expect(page.getByRole('img')).toHaveCount(0);
  const snapshot=await page.locator('body').ariaSnapshot();
  await info.attach('result-aria-snapshot.yml',{body:Buffer.from(snapshot),contentType:'text/yaml'});
  await attachJSON(info,'limited-reading-order.json',{headings,scope:'DOM and Playwright ARIA snapshot, NOT VoiceOver/TalkBack or full WCAG certification'});
  await focusWithTabs(page,page.getByRole('button',{name:'重新测一次',exact:true}));
  await focusVisible(page.locator('#restartBtn')); await shot(page,info,'keyboard-restart-focus');
  await page.keyboard.press('Enter'); await expect(page.locator('html')).toHaveAttribute('data-quiz-view','intro');
});
