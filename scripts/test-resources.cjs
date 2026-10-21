/* Tests use a local mail stub. They never send email or use production credentials. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(relative, dependencies = {}) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(dependencies, id) ? dependencies[id] : originalRequire(id);
  mod._compile(output, filename);
  return mod.exports;
}
test('verified resource flow and abuse controls', async t => {
  const savedEnv = { ...process.env }, originalFetch = global.fetch, originalError = console.error;
  process.env.RESOURCE_TOKEN_SECRET = 'test-only-resource-token-secret-32-characters';
  process.env.RESOURCE_FROM_EMAIL = '교육원 <materials@example.org>';
  process.env.RESEND_API_KEY = 'test-only-key';
  process.env.RESOURCE_BASE_URL = 'https://www.humanai-edu.kr';
  const lib = compile('lib/resources.ts');
  const deps = { '@/lib/resources': lib };
  const requestRoute = compile('app/api/resource-request/route.ts', deps);
  const verifyRoute = compile('app/api/resource-verify/route.ts', deps);
  const downloadRoute = compile('app/api/resource-download/route.ts', deps);
  const calls = [];
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    calls.push({ ...JSON.parse(options.body), idempotency: options.headers['Idempotency-Key'] });
    return Response.json({ id: 'mock-message' });
  };
  t.after(() => {
    global.fetch = originalFetch; console.error = originalError;
    for (const key of Object.keys(process.env)) if (!Object.hasOwn(savedEnv, key)) delete process.env[key];
    Object.assign(process.env, savedEnv);
  });
  let serial = 0;
  const input = () => ({ organization: '테스트 교육기관', name: '교육담당자', email: 'hrd' + (++serial) + '@example.org', resource: 'brochure', consent: true, marketing: false, proposal: false });
  const req = (route, data, headers = {}) => new Request('https://www.humanai-edu.kr/api/' + route, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.' + (++serial), ...headers }, body: JSON.stringify(data) });
  let token, grantCookie;
  await t.test('request sends only to applicant and gives no unverified download access', async () => {
    const data = input(), r = await requestRoute.POST(req('resource-request', data));
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { ok: true, retryAfter: 60 });
    assert.equal(calls.length, 1); assert.deepEqual(calls[0].to, [data.email]);
    assert.ok(!r.headers.get('set-cookie').includes(lib.ACCESS_COOKIE));
    token = calls[0].text.match(/#token=([A-Za-z0-9_-]+)/)[1];
    const plaintext = Buffer.from(token, 'base64url').toString();
    assert.ok(!plaintext.includes(data.email)); assert.ok(!plaintext.includes(data.name));
    const noGrant = await downloadRoute.GET(new Request('https://www.humanai-edu.kr/api/resource-download?resource=brochure'));
    assert.equal(noGrant.status, 401);
    const repeated = await requestRoute.POST(req('resource-request', input(), { cookie: r.headers.get('set-cookie').split(';')[0] }));
    assert.equal(repeated.status, 429); assert.ok(repeated.headers.get('Retry-After'));
  });
  await t.test('real mailbox proof is required before confirmed lead and scoped PDF', async () => {
    const r = await verifyRoute.POST(req('resource-verify', { token }));
    assert.equal(r.status, 200);
    assert.equal(calls.length, 2); assert.match(calls[1].subject, /이메일 확인 완료/);
    assert.match(calls[1].text, /미동의/);
    grantCookie = r.headers.get('set-cookie').split(';')[0];
    const result = await r.json(); assert.equal(result.downloadUrl, '/api/resource-download?resource=brochure');
    const file = await downloadRoute.GET(new Request('https://www.humanai-edu.kr' + result.downloadUrl, { headers: { cookie: grantCookie } }));
    assert.equal(file.status, 200); assert.equal(file.headers.get('Content-Type'), 'application/pdf');
    const bytes = Buffer.from(await file.arrayBuffer()); assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.equal(file.headers.get('Cache-Control'), 'private, no-store');
    const other = await downloadRoute.GET(new Request('https://www.humanai-edu.kr/api/resource-download?resource=method', { headers: { cookie: grantCookie } }));
    assert.equal(other.status, 401);
    const verifiedAgain = await verifyRoute.POST(req('resource-verify', { token }));
    assert.equal(verifiedAgain.status, 200);
    assert.deepEqual(calls[1], calls[2], 'same provider idempotency key and payload on replay');
  });
  await t.test('expired, tampered, wrong-purpose, oversized tokens do not authorize downloads', async () => {
    const data = lib.unseal(token, 'verify');
    for (const invalid of ['bad', token.slice(0, 50) + 'X' + token.slice(51), lib.seal('verify', data, 1, Date.now() - 5000), lib.seal('access', data, 900), 'a'.repeat(5000)]) {
      const r = await verifyRoute.POST(req('resource-verify', { token: invalid }));
      assert.equal(r.status, 400); assert.equal(r.headers.get('set-cookie'), null);
    }
    const expired = lib.seal('access', { resource: 'brochure' }, 1, Date.now() - 5000);
    const r = await downloadRoute.GET(new Request('https://www.humanai-edu.kr/api/resource-download?resource=brochure', { headers: { cookie: lib.ACCESS_COOKIE + '=' + expired } }));
    assert.equal(r.status, 401);
  });
  await t.test('invalid input, consent, unknown resource and cross-origin are rejected', async () => {
    for (const patch of [{ consent: false }, { email: 'not-email' }, { email: 'bad\r\n@foo.com' }, { organization: '' }, { name: 'x'.repeat(51) }, { resource: '../../etc/passwd' }]) {
      const r = await requestRoute.POST(req('resource-request', { ...input(), ...patch }));
      assert.equal(r.status, 400);
    }
    assert.equal((await requestRoute.POST(req('resource-request', input(), { origin: 'https://evil.example' }))).status, 403);
    assert.equal((await verifyRoute.POST(req('resource-verify', { token }, { origin: 'https://evil.example' }))).status, 403);
    assert.equal((await requestRoute.POST(new Request('https://www.humanai-edu.kr/api/resource-request', { method: 'POST', body: '{' }))).status, 400);
    assert.equal((await requestRoute.POST(req('resource-request', { ...input(), name: 'x'.repeat(9000) }))).status, 400);
  });
  await t.test('mail failure and unconfigured sender never return success or download cookie', async () => {
    console.error = () => {};
    const okFetch = global.fetch;
    global.fetch = async () => Response.json({ message: 'provider failure' }, { status: 403 });
    assert.equal((await requestRoute.POST(req('resource-request', input()))).status, 502);
    const failedVerification = await verifyRoute.POST(req('resource-verify', { token }));
    assert.equal(failedVerification.status, 502); assert.equal(failedVerification.headers.get('set-cookie'), null);
    global.fetch = okFetch;
    const sender = process.env.RESOURCE_FROM_EMAIL;
    process.env.RESOURCE_FROM_EMAIL = 'onboarding@resend.dev';
    assert.equal((await requestRoute.POST(req('resource-request', input()))).status, 503);
    process.env.RESOURCE_FROM_EMAIL = sender;
    console.error = originalError;
  });
  await t.test('60-second email throttle and 15-minute email quota', () => {
    const start = Date.now(), email = 'rate-only@example.org';
    assert.equal(lib.requestLimit(req('resource-request', {}), email, start), 0);
    assert.ok(lib.requestLimit(req('resource-request', {}), email, start + 1000) > 0);
    for (let i = 1; i < 4; i++) assert.equal(lib.requestLimit(req('resource-request', {}), email, start + i * 61000), 0);
    assert.ok(lib.requestLimit(req('resource-request', {}), email, start + 4 * 61000) > 0);
  });
  await t.test('private files, encrypted confirmation and optional consent', () => {
    for (const resource of Object.values(lib.RESOURCES)) {
      assert.equal(fs.existsSync(path.join(root, 'public', resource.file)), false);
      assert.ok(fs.existsSync(path.join(root, 'resources', resource.file)));
    }
    assert.ok(lib.verifiedMail({ ...lib.unseal(token, 'verify'), name: '<script>test</script>' }).html.includes('&lt;script&gt;'));
    const landing = fs.readFileSync(path.join(root, 'public/landing.html'), 'utf8');
    assert.ok(!landing.includes('hai_dl_ok')); assert.ok(!landing.includes('remember();download'));
    assert.ok(landing.includes('이메일로 자료 받기'));
    const verification = fs.readFileSync(path.join(root, 'public/resource-verify.html'), 'utf8');
    assert.ok(!verification.includes('googletagmanager')); assert.ok(verification.includes('no-referrer'));
  });
});
