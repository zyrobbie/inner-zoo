const fs = require("fs");
const LAYOUT_JS = fs.readFileSync(require("path").join(__dirname, "result-layout.js"), "utf8");
const EXPORT_JS = fs.readFileSync(require("path").join(__dirname, "result-export.js"), "utf8");
const QR = require("./test-qr.json");
const { CSS } = require("./css.js");
const { MASCOTS } = require("./mascots.js");
const { AVATARS } = require("./avatar-assets.js");
const { CATS, MC_QUESTIONS, ANIMAL_ORDER, DISCLAIMER } = require("./data.js");

const catsJson = JSON.stringify(CATS);
const questionsJson = JSON.stringify(MC_QUESTIONS);
const animalOrderJson = JSON.stringify(ANIMAL_ORDER);
const mascotsJson = JSON.stringify(Object.fromEntries(ANIMAL_ORDER.concat(["self"]).map(k => [k, MASCOTS[k](CATS[k].color)])));
const disclaimerJson = JSON.stringify(DISCLAIMER);
const avatarsJson = JSON.stringify(AVATARS);

const html = `<title>内在动物园·选择题版</title>
<style>${CSS}</style>

<div class="wrap">
  <div class="top" id="topBar" hidden>
    <span class="brand">内在动物园</span>
    <div class="progress-track"><div class="progress-fill" id="progFill" style="width:0%"></div></div>
    <span class="progress-num" id="progNum">1/20</span>
  </div>
  <div id="app"></div>
</div>

<script>
const CATS = ${catsJson};
const QUESTIONS = ${questionsJson};
const ANIMAL_ORDER = ${animalOrderJson};
const MASCOTS = ${mascotsJson};
const DISCLAIMER = ${disclaimerJson};
const AVATARS = ${avatarsJson};
const TEST_QR = ${JSON.stringify(QR)};
${LAYOUT_JS}
${EXPORT_JS}

const state = { idx: 0, answers: new Array(QUESTIONS.length).fill(null), order: [] };

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

const app = document.getElementById("app");
const topBar = document.getElementById("topBar");
const progFill = document.getElementById("progFill");
const progNum = document.getElementById("progNum");

function renderIntro(){
  document.documentElement.setAttribute("data-quiz-view", "intro");
  topBar.hidden = true;
  app.innerHTML =
    '<div class="cover-single">' +
      '<picture><source type="image/webp" srcset="assets/cover/intro-v051.webp"><img id="coverImage" src="assets/cover/intro-v051.jpg" width="780" height="1778" alt="" fetchpriority="high" decoding="async"></picture>' +
      '<div class="sr-only"><span>选择题版 · 方案一</span><h1>你内在的动物园</h1><p>20个日常小场景，看看最近是哪几位“内在保护者”比较忙。每题选一个最像你当下反应的选项，凭第一感觉作答就好。</p><p>' + DISCLAIMER + '</p></div>' +
      '<button class="btn cover-start" id="startBtn">开始测试</button>' +
    '</div>';
  const coverImage = document.getElementById('coverImage');
  const showCover = () => coverImage.classList.add('is-ready');
  if(coverImage.complete && coverImage.naturalWidth) showCover();
  else { coverImage.onload = showCover; coverImage.onerror = () => { coverImage.closest('.cover-single').classList.add('cover-failed'); }; }
  document.getElementById("startBtn").onclick = () => { state.idx = 0; prefetchExportAvatars(); renderQuestion(); };
}

function renderQuestion(){
  document.documentElement.setAttribute("data-quiz-view", "question");
  topBar.hidden = false;
  const q = QUESTIONS[state.idx];
  if(!state.order[state.idx]) state.order[state.idx] = shuffle(q.opts.map((o,i)=>i));
  const order = state.order[state.idx];
  progFill.style.width = ((state.idx) / QUESTIONS.length * 100) + "%";
  progNum.textContent = (state.idx+1) + "/" + QUESTIONS.length;

  let optsHtml = "";
  order.forEach((origIdx, i) => {
    const [text, key] = q.opts[origIdx];
    const sel = state.answers[state.idx] === key ? " sel" : "";
    optsHtml += '<button class="opt' + sel + '" data-key="' + key + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' + text + '</button>';
  });

  app.innerHTML =
    '<div class="card">' +
      '<div class="scene-eyebrow">情景 ' + (state.idx+1) + ' / ' + QUESTIONS.length + '</div>' +
      '<p class="scene display">' + q.scene + '</p>' +
      optsHtml +
      '<div class="nav-row">' +
        (state.idx>0 ? '<button class="btn btn-ghost" id="backBtn">上一题</button>' : '') +
      '</div>' +
    '</div>';

  app.querySelectorAll(".opt").forEach(btn => {
    btn.onclick = () => {
      state.answers[state.idx] = btn.getAttribute("data-key");
      if(state.idx < QUESTIONS.length - 1){ state.idx++; renderQuestion(); }
      else { renderResults(); }
    };
  });
  const back = document.getElementById("backBtn");
  if(back) back.onclick = () => { state.idx--; renderQuestion(); };
}

function computeResults(){
  const counts = {}; ANIMAL_ORDER.concat(["self"]).forEach(k => counts[k]=0);
  state.answers.forEach(k => { if(k) counts[k]++; });
  const total = QUESTIONS.length;
  const selfPct = Math.round(counts.self/total*100);
  const animals = ANIMAL_ORDER.map((k,i) => ({ key:k, idx:i, count:counts[k], pct: Math.round(counts[k]/total*100) }))
    .sort((a,b)=> (b.count - a.count) || (a.idx - b.idx));
  return { selfPct, animals };
}

// The full-color paper background is intentional, including in dark mode.
// Decorative artwork has empty alt text; the adjacent live heading names it.
function avatarHtml(key, main){
  const a = AVATARS[key];
  const sizes = main ? '(max-width: 359px) 192px, 224px' : '(max-width: 359px) 64px, 76px';
  return '<picture class="avatar-picture" data-avatar="' + key + '">' +
    '<source type="image/webp" srcset="' + a.small + ' 256w, ' + a.large + ' 640w" sizes="' + sizes + '">' +
    '<img src="' + a.png + '" width="640" height="640" alt="" decoding="async" loading="' + (main ? 'eager' : 'lazy') + '">' +
  '</picture>';
}

function renderResults(){
  document.documentElement.setAttribute("data-quiz-view", "results");
  topBar.hidden = true;
  const { selfPct, animals } = computeResults();
  const main = animals[0];
  const mc = CATS[main.key];
  const tied = animals.slice(1).filter(a => a.count === main.count && a.count > 0).map(a => CATS[a.key].name);
  const tieNote = tied.length ? '（与「' + tied.join("」「") + '」并列）' : '';
  const others = animals.slice(1).filter(a => a.count > 0);

  // With no protector selections, no zero-percent "busiest" animal is shown.
  const mainHtml = main.count > 0 ?
    '<section class="main-card" aria-labelledby="mainName" data-protector="' + main.key + '">' +
      '<p class="main-label">最近最忙的一位</p>' +
      '<div class="main-portrait">' +
        '<div class="main-icon">' + avatarHtml(main.key, true) + '</div>' +
        '<span class="portrait-leaf leaf-one" aria-hidden="true"></span>' +
        '<span class="portrait-leaf leaf-two" aria-hidden="true"></span>' +
        '<span class="portrait-star star-one" aria-hidden="true"></span>' +
        '<span class="portrait-star star-two" aria-hidden="true"></span>' +
      '</div>' +
      '<h1 class="main-name display" id="mainName">' + mc.mascot + '</h1>' +
      '<p class="protector-pct" data-role="' + main.key + '">' + mc.name + ' · 出现在 ' + main.pct + '% 的选择里' + tieNote + '</p>' +
      '<p class="protector-quote">“' + mc.quote + '”</p>' +
      '<p class="main-desc">' + mc.desc + '</p>' +
    '</section>' : '';

  let othersHtml = "";
  if(others.length){
    othersHtml += '<section class="other-parts" aria-labelledby="othersTitle"><h2 class="section-label" id="othersTitle">其他也在活动的部分</h2>';
    others.forEach(a => {
      const c = CATS[a.key];
      othersHtml += '<article class="card protector-card" data-protector="' + a.key + '">' +
        '<div class="protector-icon">' + avatarHtml(a.key, false) + '</div>' +
          '<div class="protector-copy">' +
            '<h3 class="protector-name display">' + c.mascot + '</h3>' +
            '<p class="protector-pct" data-role="' + a.key + '">' + c.name + ' · 出现在 ' + a.pct + '% 的选择里</p>' +
        '<p class="protector-quote" data-role="' + a.key + '">“' + c.quote + '”</p>' +
        '<p class="protector-desc">' + c.desc + '</p></div>' +
      '</article>';
    });
    othersHtml += '</section>';
  }

  const selfText = selfPct > 0
    ? '有 ' + selfPct + '% 的选择，是真我在直接回应当下。' + CATS.self.desc
    : '这次的选择里，真我没有直接出现。这并不代表它不在，它一直在，只是需要被留意。';
  const selfTitleTag = main.count > 0 ? 'h2' : 'h1';
  const selfHtml =
    '<section class="self-section" aria-labelledby="selfTitle">' +
    '<' + selfTitleTag + ' class="section-label" id="selfTitle">真我</' + selfTitleTag + '>' +
    '<div class="card self-card">' +
      '<div class="self-heading"><div class="protector-icon" aria-hidden="true">' + MASCOTS.self + '</div>' +
      '<p class="protector-name display">真我在场 · ' + selfPct + '%</p></div>' +
      '<p class="protector-desc">' + selfText + '</p>' +
    '</div></section>';

  let sharedScene = null;
  try { sharedScene = getResultScene({selfPct,animals}); } catch (_) {}
  app.innerHTML =
    '<main class="result-page' + (main.count > 0 ? '' : ' self-only') + '">' +
    (sharedScene ? '<div class="sr-only result-accessible">' + mainHtml + othersHtml + selfHtml + '<p>' + DISCLAIMER + '</p><p>V0.5</p></div>' + resultSceneSvg(sharedScene) : '<div class="result-layout-fallback">' + mainHtml + othersHtml + selfHtml + '<p>' + DISCLAIMER + '</p><p>V0.5</p></div>') +
    '<button class="btn result-save" id="saveResultBtn">保存结果图片</button>' +
    '<button class="btn result-restart" id="restartBtn">重新测一次</button>' +
    '</main>';

  prepareResultExport(computeResults()).catch(() => {});
  document.getElementById("saveResultBtn").onclick = () => openResultExport();
  document.getElementById("restartBtn").onclick = () => {
    closeResultExport();
    clearResultExportCache();
    state.idx = 0; state.answers = new Array(QUESTIONS.length).fill(null); state.order = [];
    renderIntro();
  };
}

let resultResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resultResizeTimer);
  resultResizeTimer = setTimeout(() => {
    if(document.documentElement.getAttribute('data-quiz-view') === 'results' && displayedResultLayoutWidth() !== null && displayedResultLayoutWidth() !== resultLayoutWidth()){
      closeResultExport(); clearResultExportCache(); renderResults();
    }
  },120);
});
function displayedResultLayoutWidth(){
  const svg = app.querySelector('.shared-result-scene');
  return svg ? Number(svg.getAttribute('width')) : null;
}
function syncDisplayedResultScene(){
  // The DOM is authoritative: generating a new cache entry must never stand in
  // for actually rendering that scene on the page. This runs before saving.
  if(document.documentElement.getAttribute('data-quiz-view') === 'results' && displayedResultLayoutWidth() !== resultLayoutWidth()) renderResults();
}
function start(){ renderIntro(); }
if (window.claude && window.claude.hot) {
  window.claude.hot.ready ? window.claude.hot.ready(start) : start();
} else {
  start();
}
</script>
`;

fs.writeFileSync("quiz-mc.html", html);
console.log("wrote quiz-mc.html", html.length, "bytes");
