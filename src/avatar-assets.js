// Paths are relative to dist/index.html (and dist/quiz-mc.html).
// Approved cream-paper originals are retained under assets/avatars/original.
const { ANIMAL_ORDER } = require('./data.js');
const AVATARS = Object.fromEntries(ANIMAL_ORDER.map(key => [key, {
  png: 'assets/avatars/' + key + '-640.png',
  small: 'assets/avatars/' + key + '-256.webp',
  large: 'assets/avatars/' + key + '-640.webp',
  width: 640,
  height: 640
}]));
module.exports = { AVATARS };
