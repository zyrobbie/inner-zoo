const { defineConfig } = require('@playwright/test');
const approvedURL = 'https://zyrobbie.github.io/inner-zoo/';
if (process.env.ZOO_LIVE_BASE_URL && process.env.ZOO_LIVE_BASE_URL !== approvedURL) throw Error('Live verification is restricted to the approved GitHub Pages URL');
process.env.ZOO_LIVE_BASE_URL = approvedURL;
const mobile = { viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true };
const desktop = { viewport:{width:1280,height:900},screen:{width:1280,height:900},deviceScaleFactor:1 };
module.exports = defineConfig({
  testDir:'./live-tests', testMatch:/live\.spec\.js/,
  outputDir:'./artifacts/live-test-results',
  timeout:120_000,globalTimeout:5*60_000,expect:{timeout:10_000},
  workers:2,fullyParallel:false,forbidOnly:true,retries:0,
  reporter:[['list'],['json',{outputFile:'./artifacts/live-results.json'}],['html',{outputFolder:'./artifacts/live-report',open:'never'}]],
  use:{
    baseURL:approvedURL,locale:'zh-CN',timezoneId:'UTC',colorScheme:'light',
    reducedMotion:'reduce',serviceWorkers:'block',screenshot:'only-on-failure',
    trace:'retain-on-failure',video:'off',actionTimeout:10_000,navigationTimeout:30_000,
  },
  projects:[
    {name:'live-chromium-desktop',use:{browserName:'chromium',...desktop}},
    {name:'live-chromium-mobile',use:{browserName:'chromium',...mobile}},
    {name:'live-webkit-desktop',use:{browserName:'webkit',...desktop}},
    {name:'live-webkit-mobile',use:{browserName:'webkit',...mobile}},
  ],
  metadata:{scope:'Read-only post-deployment checks of the approved public Pages URL; no baseline fixture or network-failure injection',mobileLimit:'Linux browser engines with mobile emulation, not actual mobile hardware'},
});
