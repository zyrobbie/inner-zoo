const fs = require('node:fs');
const path = require('node:path');
const repoRoot = path.resolve(__dirname, '../..');
const candidateRoot = path.resolve(__dirname, '../../work/project');
const project = path.resolve(process.env.ZOO_PROJECT_ROOT || (fs.existsSync(path.join(repoRoot, 'src/data.js')) ? repoRoot : candidateRoot));
module.exports = { project, dist: path.join(project, 'dist'), qa: path.resolve(__dirname, '..') };
