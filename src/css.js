const CSS = `
:root{
  --bg:#EEF0EA; --surface:#FFFFFF; --surface-2:#F6F5EF;
  --ink:#24291F; --ink-soft:#5C6154; --ink-faint:#626B59;
  --accent:#6F4E63; --accent-soft:#E4D8E0;
  --line:#DADDD2; --track:#E2E4DA;
  --shadow: 0 1px 2px rgba(36,41,31,.06), 0 6px 20px rgba(36,41,31,.06);
  color-scheme: light;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#1B1D18; --surface:#23261F; --surface-2:#2A2D24;
    --ink:#EDEFE7; --ink-soft:#AEB39F; --ink-faint:#A3AA97;
    --accent:#D2A9C4; --accent-soft:#3A2E36;
    --line:#33362B; --track:#2E3127;
    --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35);
    color-scheme: dark;
  }
}
:root[data-theme="dark"]{
  --bg:#1B1D18; --surface:#23261F; --surface-2:#2A2D24;
  --ink:#EDEFE7; --ink-soft:#AEB39F; --ink-faint:#A3AA97;
  --accent:#D2A9C4; --accent-soft:#3A2E36;
  --line:#33362B; --track:#2E3127;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35);
  color-scheme: dark;
}
*{box-sizing:border-box}
body{background:var(--bg); color:var(--ink); font-family:'Manrope',-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;}
.display{font-family:'Fraunces','Noto Serif SC',serif;}
.wrap{max-width:560px; margin:0 auto; padding:20px 20px 40px;}
.top{display:flex; align-items:center; gap:12px; padding-top:6px; margin-bottom:18px;}
.brand{font-size:13px; color:var(--ink-faint); letter-spacing:.04em;}
.progress-track{flex:1; height:6px; border-radius:99px; background:var(--track); overflow:hidden;}
.progress-fill{height:100%; background:var(--accent); border-radius:99px; transition:width .35s ease;}
.progress-num{font-size:12px; color:var(--ink-faint); font-variant-numeric:tabular-nums; min-width:40px; text-align:right;}

.card{background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:var(--shadow); padding:26px 22px;}

.hero{text-align:center; padding:10px 4px 6px;}
.hero-icon{width:88px; height:88px; margin:0 auto 18px;}
h1.title{font-size:26px; line-height:1.3; margin:0 0 10px; text-wrap:balance;}
.sub{font-size:15px; color:var(--ink-soft); line-height:1.7; margin:0 0 22px;}
.pill{display:inline-block; font-size:12px; color:var(--accent); background:var(--accent-soft); border-radius:99px; padding:4px 12px; margin-bottom:14px; letter-spacing:.02em;}

.btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:15px 20px; border-radius:14px; border:none; background:var(--accent); color:var(--surface); font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s ease, transform .1s ease;}
.btn:active{transform:scale(.98);}
.btn:disabled{opacity:.4; cursor:not-allowed;}
.btn-ghost{background:transparent; border:1px solid var(--line); color:var(--ink);}

.note{font-size:12.5px; color:var(--ink-faint); line-height:1.7; margin-top:18px; padding-top:16px; border-top:1px solid var(--line);}

.scene-eyebrow{font-size:12px; color:var(--ink-faint); letter-spacing:.06em; margin-bottom:10px;}
.scene{font-family:'Fraunces','Noto Serif SC',serif; font-size:20px; line-height:1.6; margin:0 0 22px; text-wrap:balance;}
.opt{display:block; width:100%; text-align:left; padding:15px 16px; margin-bottom:10px; border-radius:14px; border:1.5px solid var(--line); background:var(--surface-2); color:var(--ink); font-size:15px; line-height:1.55; cursor:pointer; font-family:inherit; transition:border-color .12s ease, background .12s ease;}
.opt:last-child{margin-bottom:0}
.opt:active{background:var(--accent-soft);}
.opt:hover{border-color:var(--accent);}

.likert-item{margin-bottom:0;}
.likert-text{font-family:'Fraunces','Noto Serif SC',serif; font-size:19px; line-height:1.6; margin:0 0 22px; text-wrap:balance;}
.likert-scale{display:flex; gap:8px;}
.likert-btn{flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 4px; border-radius:12px; border:1.5px solid var(--line); background:var(--surface-2); cursor:pointer; font-family:inherit;}
.likert-dot{width:16px; height:16px; border-radius:50%; border:1.5px solid var(--ink-faint); background:transparent;}
.likert-btn.sel .likert-dot{background:var(--accent); border-color:var(--accent);}
.likert-btn.sel{border-color:var(--accent); background:var(--accent-soft);}
.likert-label{font-size:10.5px; color:var(--ink-faint); text-align:center; line-height:1.3;}
.likert-ends{display:flex; justify-content:space-between; font-size:11.5px; color:var(--ink-faint); margin-top:8px;}

.nav-row{display:flex; gap:10px; margin-top:20px;}
.nav-row .btn{width:auto; flex:1;}

.result-hero{text-align:center; padding:26px 6px 20px;}
.self-ring{width:150px; height:150px; margin:0 auto 14px; position:relative;}
.self-pct{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;}
.self-pct .num{font-family:'Fraunces','Noto Serif SC',serif; font-size:34px; font-variant-numeric:tabular-nums;}
.self-pct .lbl{font-size:11.5px; color:var(--ink-faint); margin-top:2px;}
.self-desc{font-size:14px; color:var(--ink-soft); line-height:1.7; max-width:420px; margin:0 auto;}

.tier-card{display:flex; align-items:center; gap:14px; padding:18px 20px;}
.tier-icon{width:40px; height:40px; flex:none;}
.tier-name{font-family:'Fraunces','Noto Serif SC',serif; font-size:18px; margin:0 0 3px;}
.tier-desc{font-size:13px; color:var(--ink-soft); line-height:1.55; margin:0;}

.section-label{font-size:13px; color:var(--ink-faint); letter-spacing:.04em; margin:28px 0 12px;}

.protector-card{display:flex; gap:14px; padding:18px 20px; margin-bottom:12px;}
.protector-icon{width:56px; height:56px; flex:none;}
.protector-name{font-family:'Fraunces','Noto Serif SC',serif; font-size:17px; margin:0 0 2px;}
.protector-pct{font-size:12.5px; font-variant-numeric:tabular-nums; margin:0 0 6px;}
.protector-quote{font-size:13px; font-style:italic; color:var(--ink-soft); margin:0 0 6px;}
.protector-desc{font-size:13px; color:var(--ink-soft); line-height:1.6; margin:0;}

.bar-row{display:flex; align-items:center; gap:10px; margin-bottom:12px;}
.bar-icon{width:26px; height:26px; flex:none;}
.bar-name{font-size:13px; width:76px; flex:none;}
.bar-track{flex:1; height:9px; border-radius:99px; background:var(--track); overflow:hidden;}
.bar-fill{height:100%; border-radius:99px;}
.bar-pct{width:38px; text-align:right; font-size:12px; color:var(--ink-faint); font-variant-numeric:tabular-nums; flex:none;}

.toggle-link{background:none; border:none; color:var(--accent); font-size:14px; font-family:inherit; cursor:pointer; padding:4px 0; display:flex; align-items:center; gap:4px;}

.main-card{text-align:center; padding:30px 22px 26px; margin-top:10px;}
.main-icon{width:104px; height:104px; margin:0 auto 12px;}
.main-label{font-size:12.5px; color:var(--ink-faint); letter-spacing:.06em; margin:0 0 6px;}
.main-name{font-family:'Fraunces','Noto Serif SC',serif; font-size:24px; margin:0 0 6px;}
.main-card .protector-quote{font-size:14px; margin:0 0 12px;}
.main-desc{font-size:14.5px; color:var(--ink-soft); line-height:1.75; margin:0; text-align:left;}

[hidden]{display:none!important}
/* Phase 2: only the authorised persistent choice highlight changes question UI. */
.opt.sel{border-color:var(--accent); background:var(--accent-soft); box-shadow:inset 4px 0 0 var(--accent); font-weight:600;}
.opt:focus-visible,.btn:focus-visible{outline:3px solid var(--accent); outline-offset:4px;}

/* Gentle storybook results. The intro and quiz retain their original layout. */
:root{
  --story-paper:#F7F1DF; --story-card:#FFFCF3; --story-ink:#2D493C;
  --story-text:#536151; --story-muted:#5D6956; --story-line:#DBDCC8;
  --story-green:#355C47; --story-quote:#E4E8CB; --story-halo:#DFE4B9;
  --story-gold:#B28A25; --story-self:#EEE1A6; --story-self-ink:#65532C;
  --story-shadow:0 3px 0 rgba(87,104,66,.14);
  --role-anger:#A34024; --role-perfect:#69558E; --role-anxvig:#8A591D;
  --role-please:#9C5037; --role-avoid:#466F51; --role-numb:#795A3A;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --story-paper:#20271F; --story-card:#2A3328; --story-ink:#E7EAD7;
    --story-text:#D2D8C4; --story-muted:#BAC5AC; --story-line:#4C5845;
    --story-green:#B6CCA2; --story-quote:#3A4830; --story-halo:#455334;
    --story-gold:#DABD62; --story-self:#514B2E; --story-self-ink:#F4E5AB;
    --story-shadow:0 3px 0 rgba(0,0,0,.22);
    --role-anger:#F2A286; --role-perfect:#CCB6EF; --role-anxvig:#E8BC72;
    --role-please:#ECB193; --role-avoid:#B0D1A1; --role-numb:#DCBD98;
  }
}
:root[data-theme="dark"]{
  --story-paper:#20271F; --story-card:#2A3328; --story-ink:#E7EAD7;
  --story-text:#D2D8C4; --story-muted:#BAC5AC; --story-line:#4C5845;
  --story-green:#B6CCA2; --story-quote:#3A4830; --story-halo:#455334;
  --story-gold:#DABD62; --story-self:#514B2E; --story-self-ink:#F4E5AB;
  --story-shadow:0 3px 0 rgba(0,0,0,.22);
  --role-anger:#F2A286; --role-perfect:#CCB6EF; --role-anxvig:#E8BC72;
  --role-please:#ECB193; --role-avoid:#B0D1A1; --role-numb:#DCBD98;
}
:root[data-quiz-view="results"] body{
  margin:0; background-color:var(--story-paper); color:var(--story-ink);
  background-image:radial-gradient(rgba(118,100,58,.06) .6px, transparent .8px);
  background-size:13px 17px;
}
:root[data-quiz-view="results"] .wrap{max-width:560px; padding:30px 24px 44px;}
.result-page{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif; overflow-wrap:anywhere;}
.result-page .display,.result-page .section-label{font-family:'Noto Serif SC','Songti SC','STSong','SimSun',serif;}
.result-page [data-role="anger"]{--role:var(--role-anger)}
.result-page [data-role="perfect"]{--role:var(--role-perfect)}
.result-page [data-role="anxvig"]{--role:var(--role-anxvig)}
.result-page [data-role="please"]{--role:var(--role-please)}
.result-page [data-role="avoid"]{--role:var(--role-avoid)}
.result-page [data-role="numb"]{--role:var(--role-numb)}
.result-page .main-card{margin:0; padding:0; border:0; background:transparent; box-shadow:none; text-align:center;}
.result-page .main-label{margin:0 0 26px; font-size:14px; font-weight:600; color:var(--story-green); letter-spacing:.1em; line-height:1.7;}
.main-portrait{position:relative; width:280px; max-width:100%; margin:0 auto 22px; padding:12px 0 4px;}
.main-portrait:before{content:''; position:absolute; width:252px; max-width:96%; top:0; bottom:-8px; left:50%; transform:translateX(-50%) rotate(-5deg); background:var(--story-halo); border-radius:48% 52% 46% 54%;}
.result-page .main-icon{position:relative; width:224px; height:224px; max-width:100%; margin:0 auto;}
.avatar-picture{display:block; width:100%; height:100%;}
.avatar-picture img{display:block; width:100%; height:100%; object-fit:contain; border-radius:22%; background:#FFF4D8;}
.portrait-leaf,.portrait-star{position:absolute; pointer-events:none;}
.portrait-leaf{width:10px; height:19px; background:var(--story-green); opacity:.7; border-radius:90% 0 90% 0;}
.leaf-one{right:0; top:45px; transform:rotate(15deg)}
.leaf-two{left:7px; bottom:1px; transform:rotate(-48deg)}
.portrait-star{width:13px; height:13px; background:var(--story-gold); clip-path:polygon(50% 0,64% 35%,100% 50%,64% 65%,50% 100%,36% 65%,0 50%,36% 35%);}
.star-one{top:27px; left:2px}.star-two{right:2px; bottom:31px; width:10px; height:10px;}
.result-page .main-name{margin:0 0 10px; font-size:32px; font-weight:700; line-height:1.4; color:var(--story-ink); text-wrap:balance;}
.result-page .protector-pct{font-size:13px; line-height:1.75; font-weight:500; color:var(--role,var(--story-text)); margin:0; font-variant-numeric:tabular-nums;}
.result-page .main-card>.protector-pct{position:relative; padding-bottom:16px; margin:0 0 9px; font-size:14px;}
.result-page .main-card>.protector-pct:after{content:''; position:absolute; width:128px; height:6px; bottom:1px; left:50%; transform:translateX(-50%) rotate(-1deg); border-bottom:2px solid currentColor; border-radius:0 0 55% 55%; opacity:.4;}
.result-page .protector-quote{font-size:16px; font-style:normal; line-height:1.9; color:var(--story-text);}
.result-page .main-card>.protector-quote{padding:13px 17px; margin:0 0 13px; border-radius:20px; background:var(--story-quote); font-family:'Noto Serif SC','Songti SC','STSong','SimSun',serif; font-size:18px;}
.result-page .main-desc{font-size:16px; line-height:1.95; text-align:left; color:var(--story-text); margin:0;}
.result-page .section-label{font-size:20px; line-height:1.5; font-weight:700; color:var(--story-ink); letter-spacing:0; margin:36px 0 20px;}
.result-page .other-parts>.section-label{padding-bottom:13px; border-bottom:1px solid var(--story-line);}
.result-page .protector-card{display:block; padding:19px 17px 21px; margin:0 0 22px; border:1px solid var(--story-line); border-radius:22px; box-shadow:var(--story-shadow); background:var(--story-card);}
.protector-heading{display:flex; align-items:center; gap:14px; margin-bottom:14px;}
.result-page .protector-icon{width:76px; height:76px; flex:none;}
.protector-heading-text{flex:1; min-width:0;}
.result-page .protector-name{font-size:18px; line-height:1.5; color:var(--story-ink); font-weight:700; margin:0 0 5px;}
.result-page .protector-card>.protector-quote{border-left:2px solid var(--role,var(--story-gold)); padding-left:14px; margin:0 0 14px;}
.result-page .protector-desc{font-size:15px; line-height:1.95; color:var(--story-text); margin:0;}
.result-page .self-section>.section-label{margin-top:30px;}
.result-page .self-card{padding:23px 20px 26px; background:var(--story-self); border:0; border-radius:22px; box-shadow:none;}
.self-heading{display:flex; gap:12px; align-items:center; margin-bottom:14px;}
.result-page .self-heading .protector-icon{width:52px; height:52px;}
.result-page .self-heading .protector-name{font-size:22px; color:var(--story-self-ink); margin:0; flex:1; min-width:0;}
.result-page .self-card .protector-desc{color:var(--story-self-ink); font-size:16px;}
.result-page .result-restart{margin-top:30px; padding:16px 20px; min-height:52px; background:var(--story-green); color:var(--story-paper); border-radius:13px; font-size:17px;}
.result-page .result-restart:focus-visible{outline-color:var(--story-green);}
.result-page .note{font-size:13px; line-height:1.95; color:var(--story-muted); border:0; padding:0; margin:24px 0 0;}
.result-page.self-only .self-section>.section-label{margin-top:4px;}
@media (max-width:359px){
  :root[data-quiz-view="results"] .wrap{padding:24px 18px 36px;}
  .result-page .main-icon{width:192px; height:192px;}
  .main-portrait{width:244px;}
  .main-portrait:before{width:218px;}
  .result-page .main-name{font-size:28px;}
  .result-page .protector-icon{width:64px; height:64px;}
  .protector-heading{gap:11px;}
  .result-page .protector-card{padding:16px 15px 20px;}
  .result-page .protector-name{font-size:17px;}
  .result-page .self-heading .protector-name{font-size:20px;}
}
@media (prefers-reduced-motion:reduce){.opt,.btn,.progress-fill{transition:none}.btn:active{transform:none}}

`;
module.exports = { CSS };

module.exports.CSS += `
/* V0.5: approved mobile storybook cover, live text and final portraits. */
:root[data-quiz-view="intro"] body{background:#F7F1DF;color:#536151}
:root[data-quiz-view="intro"] .wrap{max-width:390px;padding:0;margin:auto}
:root[data-quiz-view="intro"] .hero{border:0;border-radius:0;box-shadow:none;background:none;padding:max(33px,env(safe-area-inset-top)) 0 max(40px,env(safe-area-inset-bottom));text-align:center}
:root[data-quiz-view="intro"] .hero-icon{width:42px;height:42px;margin:0 auto}
:root[data-quiz-view="intro"] .hero-icon svg{width:100%;height:100%}
:root[data-quiz-view="intro"] .pill{display:block;margin:14px 28px 0;padding:0;border:0;background:none;color:#69745C;font-size:12px;line-height:18px}
:root[data-quiz-view="intro"] .title{font-size:32px;line-height:44px;margin:13px 16px 0;color:#2D493C}
.cover-gallery{height:290px;margin-top:26px;position:relative}
.cover-halo{position:absolute;left:9.5%;top:10px;width:81.5%;height:262px;border-radius:47% 54% 44% 51%;background:#E4E8CB;transform:rotate(-5deg)}
.cover-portrait{position:absolute;width:27.7%;padding:4px 4px 7px;background:#FFFCF3;border-radius:20px;box-shadow:1px 4px #D7DAC1;box-sizing:border-box}
.cover-portrait img{display:block;width:100%;height:auto;aspect-ratio:1;border-radius:16px}
.cover-position-0{left:7.44%;top:21px;transform:rotate(7deg)}.cover-position-1{left:37.18%;top:6px;transform:rotate(-3deg)}.cover-position-2{left:66.67%;top:29px;transform:rotate(-8deg)}
.cover-position-3{left:10%;top:152px;transform:rotate(-5deg)}.cover-position-4{left:38.72%;top:143px;transform:rotate(4deg)}.cover-position-5{left:67.44%;top:160px;transform:rotate(7deg)}
:root[data-quiz-view="intro"] .sub{margin:22px 28px 0;text-align:left;font-size:17px;line-height:29px;color:#536151}
:root[data-quiz-view="intro"] #startBtn{width:calc(100% - 56px);min-height:58px;margin:21px 28px 0;border-radius:17px;background:#355C47;color:#FFFCF3;font-size:18px;box-shadow:0 4px #D7DCC4}
:root[data-quiz-view="intro"] .note{margin:36px 28px 0;padding-top:25px;border-top:1px solid #D6D9C3;font-size:14px;line-height:24px;text-align:left;color:#69745C}
:root[data-quiz-view="results"] .wrap{padding-top:max(30px,env(safe-area-inset-top));padding-bottom:max(44px,env(safe-area-inset-bottom))}
:root[data-quiz-view="results"] .main-card{min-height:calc(100svh - 60px);box-sizing:border-box;display:flex;flex-direction:column;justify-content:center}
:root[data-quiz-view="results"] .protector-card{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;padding:14px;margin-bottom:12px;border-radius:20px;align-items:start}
:root[data-quiz-view="results"] .protector-card .protector-icon{width:64px;height:64px;border-radius:14px;margin:0}
:root[data-quiz-view="results"] .protector-card .protector-name{font-size:17px;line-height:1.35;margin:0}
:root[data-quiz-view="results"] .protector-card .protector-pct{font-size:12px;line-height:1.5;margin:5px 0 0}
:root[data-quiz-view="results"] .protector-card .protector-quote{font-size:14px;line-height:1.5;margin:7px 0 6px;padding:0;border:0;background:none}
:root[data-quiz-view="results"] .protector-card .protector-desc{font-size:14px;line-height:1.5;margin:0}
.save-caption,.version{font-size:13px;text-align:center;color:var(--story-muted,#5D6956);line-height:1.6}.result-save{width:100%;margin-top:28px}.test-qr{text-align:center;margin:28px auto;font-size:14px}.test-qr svg{width:132px;height:132px;background:white;border:1px solid #DBDCC8;border-radius:8px}.test-qr p{margin:10px 0}
.export-dialog{color:#2D493C;background:#F7F1DF;border:1px solid #DBDCC8;border-radius:20px;padding:18px;width:calc(100% - 32px);max-width:520px;max-height:90dvh;box-sizing:border-box;overflow:auto}.export-dialog::backdrop{background:#172b22b3}.export-dialog h2{font-size:20px;margin:0 0 12px}.export-dialog p{font-size:14px;line-height:1.6}.export-preview{overflow:auto;max-height:52dvh;border:1px solid #DBDCC8;border-radius:12px;background:white;-webkit-overflow-scrolling:touch}.export-preview img{display:block;width:100%;height:auto;max-height:none;touch-action:pan-y;-webkit-touch-callout:default;user-select:auto}.export-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.export-actions button,.export-actions a{font:600 14px/1.5 system-ui;padding:10px 14px;min-height:44px;border:1px solid #BEC8B5;border-radius:12px;background:#355C47;color:#fff;text-decoration:none;cursor:pointer}.export-actions .export-close{background:transparent;color:#355C47}.export-status{min-height:23px}.export-dialog [hidden]{display:none!important}
@media(max-width:359px){:root[data-quiz-view="results"] .wrap{padding-left:16px;padding-right:16px}:root[data-quiz-view="results"] .protector-card{grid-template-columns:52px minmax(0,1fr);gap:10px;padding:12px}:root[data-quiz-view="results"] .protector-card .protector-icon{width:52px;height:52px}}
`;
module.exports.CSS += `
/* The portrait floats beside the heading; the complete description regains the
   full row width below it, so four cards stay compact without shrinking text. */
:root[data-quiz-view="results"] .protector-card{display:flow-root;padding:12px 14px}
:root[data-quiz-view="results"] .protector-card .protector-icon{float:left;margin:0 12px 6px 0;width:56px;height:56px}
:root[data-quiz-view="results"] .protector-copy{display:contents}
:root[data-quiz-view="results"] .protector-card .protector-quote{clear:both}
`;

module.exports.CSS += `
.cover-single{position:relative;width:100%;max-width:390px;margin:auto;background:#F7F1DF}
.cover-single picture{display:block}.cover-single img{display:block;width:100%;height:auto;opacity:0}.cover-single img.is-ready{opacity:1}
:root[data-quiz-view="intro"] #startBtn.cover-start{position:absolute;left:7.1795%;top:68.6164%;width:85.641%;height:6.5242%;min-height:44px;margin:0;border:0;border-radius:17px;background:#355C47;color:#FFFCF3;font-size:18px;font-weight:700;box-shadow:0 4px #D7DCC4}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cover-failed img{display:none}.cover-failed .sr-only{position:static;width:auto;height:auto;clip:auto;white-space:normal;margin:0;padding:32px 28px}:root[data-quiz-view="intro"] .cover-failed #startBtn.cover-start{position:static;width:calc(100% - 56px);margin:0 28px 40px;height:58px}
.result-save+.result-restart{margin-top:14px}.export-retry{background:#355C47}
`;

module.exports.CSS += `.export-fallback{display:block;position:fixed;z-index:10000;left:50%;top:50%;transform:translate(-50%,-50%);margin:0;box-shadow:0 0 0 100vmax #172b22b3}`;

module.exports.CSS += `
/* V0.5.2: one measured scene, rendered as live vector text and the same PNG. */
:root[data-quiz-view="results"] body{background:#F7F1DF;color:#2D493C;background-image:none}
:root[data-quiz-view="results"] .wrap{max-width:390px;padding:0 0 max(36px,env(safe-area-inset-bottom))}
.shared-result-scene{display:block;max-width:100%;height:auto;overflow:visible}
:root[data-quiz-view="results"] .result-save,:root[data-quiz-view="results"] .result-restart{display:block;width:calc(100% - 48px);min-height:54px;margin:4px 24px 0;border-radius:15px;background:#355C47;color:#FFFCF3;font-size:17px;line-height:24px;font-weight:700}
:root[data-quiz-view="results"] .result-restart{margin-top:14px;background:#F7F1DF;color:#2D493C;border:1px solid #8EAA90}
`;

module.exports.CSS += `:root[data-quiz-view="intro"] #startBtn.cover-start{top:var(--cover-top,68.6164%);height:var(--cover-height,6.5242%)}.result-layout-fallback{padding:16px}.result-layout-fallback .main-desc{font-size:16px;line-height:26px}`;
