const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const { createHmac, randomUUID } = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(relative, dependencies = {}) {
  const filename = path.join(root, relative), mod = new Module(filename, module);
  mod.filename = filename; mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(dependencies, id) ? dependencies[id] : original(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, filename);
  return mod.exports;
}
test('verified sheet persistence', async t => {
  const env = { ...process.env }, fetch = global.fetch, error = console.error;
  t.after(() => { global.fetch = fetch; console.error = error; for (const k of Object.keys(process.env)) if (!(k in env)) delete process.env[k]; Object.assign(process.env, env); });
  const secret = 'test-only-sheet-secret-more-than-32-characters';
  process.env.RESOURCE_TOKEN_SECRET = 'test-only-resource-token-secret-long-enough';
  process.env.RESEND_API_KEY = 'test'; process.env.RESOURCE_FROM_EMAIL = 'test@example.org';
  process.env.RESOURCE_SHEET_SECRET = secret;
  process.env.RESOURCE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/test-deployment/exec';
  const resources = compile('lib/resources.ts');
  const persistence = compile('lib/resource-sheet.ts', { './resources': resources });
  const route = compile('app/api/resource-verify/route.ts', { '@/lib/resources': resources, '@/lib/resource-sheet': persistence });
  const data = { organization: '=HYPERLINK("https://invalid")', name: '테스트', email: 'test@example.org', resource: 'brochure', consent: true, proposal: true, marketing: false, id: randomUUID(), issuedAt: Date.now() };
  let savedPayload, sheetOk = true, mailOk = true, callCount = 0;
  global.fetch = async (url, options) => {
    callCount++;
    if (url === 'https://api.resend.com/emails') return Response.json({}, { status: mailOk ? 200 : 503 });
    assert.equal(url, process.env.RESOURCE_SHEET_WEBHOOK_URL);
    const envelope = JSON.parse(options.body);
    assert.equal(envelope.signature, createHmac('sha256', secret).update(envelope.timestamp + '.' + envelope.payload).digest('hex'));
    savedPayload = JSON.parse(envelope.payload);
    return Response.json(sheetOk ? { ok: true, id: data.id } : { ok: false });
  };
  const request = token => new Request('https://www.humanai-edu.kr/api/resource-verify', { method: 'POST', body: JSON.stringify({ token }) });
  const token = resources.seal('verify', data, 1800);
  await t.test('only a verified token saves, and consent and request ID survive', async () => {
    const invalid = await route.POST(request('bad'));
    assert.equal(invalid.status, 400); assert.equal(callCount, 0);
    const response = await route.POST(request(token));
    assert.equal(response.status, 200); assert.ok(response.headers.get('set-cookie'));
    assert.equal(savedPayload.id, data.id); assert.equal(savedPayload.marketing, false);
    assert.equal(savedPayload.consent, true); assert.equal(savedPayload.requestedAt, new Date(data.issuedAt).toISOString());
  });
  await t.test('sheet failure cannot silently grant a download; a retry preserves the ID', async () => {
    console.error = () => {};
    sheetOk = false;
    const failed = await route.POST(request(token));
    assert.equal(failed.status, 502); assert.equal(failed.headers.get('set-cookie'), null);
    sheetOk = true; mailOk = false;
    assert.equal((await route.POST(request(token))).status, 200, 'a persisted lead still permits download if owner mail fails');
    assert.equal(savedPayload.id, data.id); mailOk = true;
  });
  await t.test('incomplete or unsafe configuration fails closed', async () => {
    const url = process.env.RESOURCE_SHEET_WEBHOOK_URL;
    for (const bad of ['', 'https://evil.example/exec', 'https://script.google.com/macros/s/abc/exec?redirect=x']) {
      process.env.RESOURCE_SHEET_WEBHOOK_URL = bad;
      await assert.rejects(persistence.saveVerifiedResource(data));
    }
    delete process.env.RESOURCE_SHEET_SECRET;
    delete process.env.RESOURCE_SHEET_WEBHOOK_URL;
    assert.equal(await persistence.saveVerifiedResource(data), false);
    process.env.RESOURCE_SHEET_WEBHOOK_URL = url; process.env.RESOURCE_SHEET_SECRET = secret;
  });
  await t.test('Apps Script verifies signature/freshness, locks writes, deduplicates and escapes formulas', () => {
    const rows = [], script = fs.readFileSync(path.join(root, 'scripts/resource-sheet.gs'), 'utf8');
    let locked = false, flushes = 0;
    const context = vm.createContext({
      ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
      PropertiesService: { getScriptProperties: () => ({ getProperty: () => secret }) },
      Utilities: { Charset: { UTF_8: 'utf8' }, computeHmacSha256Signature: (value, key) => [...createHmac('sha256', key).update(value).digest()], formatDate: d => d.toISOString() },
      LockService: { getScriptLock: () => ({ tryLock: () => (locked = true), hasLock: () => locked, releaseLock: () => { locked = false; } }) },
      SpreadsheetApp: { flush: () => { flushes++; }, openById: () => ({ getSheetByName: () => ({
        getLastRow: () => rows.length + 1, getMaxRows: () => 1000,
        getRange: (r) => ({ getValues: () => [context.HEADERS],
          createTextFinder: id => ({ matchEntireCell: () => ({ useRegularExpression: () => ({ findNext: () => rows.find(row => row[0] === id) }) }) }),
          setNumberFormat: () => ({ setValues: value => { assert.equal(locked, true); rows.push(...value); } }),
        }),
      }) }) },
    });
    vm.runInContext(script, context);
    function post(payload, timestamp = String(Date.now()), signSecret = secret) {
      const text = JSON.stringify(payload);
      return context.doPost({ postData: { contents: JSON.stringify({ timestamp, payload: text, signature: createHmac('sha256', signSecret).update(timestamp + '.' + text).digest('hex') }) } });
    }
    assert.equal(context.doGet().ok, false);
    assert.equal(post(savedPayload, String(Date.now() - 600000)).ok, false);
    assert.equal(post(savedPayload, String(Date.now()), 'wrong-secret').ok, false);
    assert.equal(rows.length, 0);
    assert.equal(post(savedPayload).ok, true); assert.equal(rows.length, 1);
    assert.equal(rows[0][2][0], "'"); assert.equal(rows[0][7], '미동의');
    assert.equal(post(savedPayload).duplicate, true); assert.equal(rows.length, 1);
    assert.equal(flushes, 1); assert.equal(locked, false);
  });
});
