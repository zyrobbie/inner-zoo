// 把 dist/quiz-mc.html（为 Claude 页面托管生成的片段，没有 <!doctype>/<head>）
// 包成一个可以放到任意静态托管（GitHub Pages、OSS、公众号外链等）的完整网页。
// 用法：node src/build-standalone.js  → 生成 dist/index.html
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../dist/quiz-mc.html'), 'utf8');
const titleMatch = src.match(/<title>[\s\S]*?<\/title>/);
const title = titleMatch ? titleMatch[0] : '<title>内在动物园</title>';
const headParts = src.match(/<link[^>]*>|<style>[\s\S]*?<\/style>/g) || [];
let body = src.replace(title, '');
headParts.forEach(p => { body = body.replace(p, ''); });
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
${headParts.join('\n')}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, '../dist/index.html'), html);
console.log('wrote dist/index.html', html.length, 'bytes');
const avatarsFrom = path.join(__dirname, '../assets/avatars/web');
const avatarsTo = path.join(__dirname, '../dist/assets/avatars');
fs.mkdirSync(avatarsTo, { recursive: true });
for (const file of fs.readdirSync(avatarsFrom)) {
  if (/^(anger|perfect|anxvig|please|avoid|numb)-(256|640)\.(webp|png)$/.test(file)) {
    fs.copyFileSync(path.join(avatarsFrom, file), path.join(avatarsTo, file));
  }
}
console.log('copied local avatar derivatives to dist/assets/avatars');
const coverTo = path.join(__dirname, '../dist/assets/cover');
fs.mkdirSync(coverTo, { recursive: true });
for (const name of ['intro-v060.webp','intro-v060.jpg']) {
 fs.copyFileSync(path.join(__dirname, '../assets/cover', name), path.join(coverTo,name));
}
