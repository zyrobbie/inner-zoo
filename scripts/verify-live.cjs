const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const base = 'https://zyrobbie.github.io/inner-zoo/';
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/build-meta.json'), 'utf8'));
assert.match(expected.commit, /^[0-9a-f]{40}$/, 'Live verification requires a recorded commit');
assert.equal(expected.commit, process.env.GITHUB_SHA, 'Only verify the checked-out commit');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function get(relative) {
  assert.ok(!relative.includes('..') && !relative.startsWith('/'));
  const url = new URL(relative, base);
  assert.equal(url.origin, 'https://zyrobbie.github.io');
  assert.ok(url.pathname.startsWith('/inner-zoo/'));
  url.searchParams.set('verify', expected.commit);
  const response = await fetch(url, { redirect: 'error', cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `${relative} HTTP status`);
  return Buffer.from(await response.arrayBuffer());
}
async function verify() {
  const actual = JSON.parse((await get('build-meta.json')).toString('utf8'));
  assert.deepEqual(actual, expected, 'Live build manifest must equal this tested commit');
  const files = [];
  for (const file of expected.files) {
    const bytes = await get(file.path);
    assert.equal(bytes.length, file.bytes, `${file.path} length`);
    assert.equal(hash(bytes), file.sha256, `${file.path} SHA-256`);
    files.push({ ...file, verified: true });
  }
  return { baseURL: base, commit: expected.commit, verifiedAt: new Date().toISOString(), files };
}
(async () => {
  // Pages CDN propagation has a five-minute observation window after deployment.
  const deadline = Date.now() + 5 * 60_000;
  for (;;) {
    try {
      const result = await verify();
      const output = path.join(__dirname, '../qa-browser/artifacts');
      fs.mkdirSync(output, { recursive: true });
      fs.writeFileSync(path.join(output, 'live-integrity.json'), JSON.stringify(result, null, 2) + '\n');
      console.log(`Verified live commit ${result.commit} and ${result.files.length} exact website files`);
      break;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
      console.log(`Waiting for matching Pages content: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
