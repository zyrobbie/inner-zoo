// Reproduce resize -> new cached scene -> immediate save, BEFORE debounce.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const build=fs.readFileSync(require.resolve('../src/build-mc.js'),'utf8');
const sync=build.slice(build.indexOf('function displayedResultLayoutWidth(){'),build.indexOf('function start(){'));
const exportJs=fs.readFileSync(require.resolve('../src/result-export.js'),'utf8');
let domWidth=390, viewportWidth=390, paintedWidth=390, rendered=0;
const sandbox={document:{documentElement:{getAttribute:()=> 'results'}},app:{querySelector:()=>({getAttribute:()=>String(domWidth)})},resultLayoutWidth:()=>viewportWidth,renderResults:()=>{domWidth=viewportWidth;rendered++;},sharedResultScene:{width:390}};
vm.createContext(sandbox);vm.runInContext(sync,sandbox);
// The old failure: export cache is already updated, but DOM is still 390.
viewportWidth=297;sandbox.sharedResultScene={width:297};
assert.equal(sandbox.displayedResultLayoutWidth(),390);
sandbox.syncDisplayedResultScene();paintedWidth=viewportWidth;
assert.equal(domWidth,paintedWidth);assert.equal(rendered,1);
// Back to wide; even a changed cache cannot suppress a real DOM render.
viewportWidth=390;sandbox.sharedResultScene={width:390};sandbox.syncDisplayedResultScene();
assert.equal(domWidth,390);assert.equal(rendered,2);
sandbox.syncDisplayedResultScene();assert.equal(rendered,2,'Matching width should not rerender or reset state');
const body=exportJs.slice(exportJs.indexOf('async function openResultExport(){'));
assert(body.indexOf('syncDisplayedResultScene()')<body.indexOf('prepareResultExport(computeResults())'));
assert(build.includes('displayedResultLayoutWidth() !== resultLayoutWidth()'));
assert(!build.includes('sharedResultScene.width !== resultLayoutWidth()'));
console.log('PASS resize-immediate-save regression: actual rendered SVG governs synchronization, not mutable export cache');
