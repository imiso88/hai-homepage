/** Private Google Apps Script web app. Deploy as owner / Anyone.
 * The spreadsheet stays private. Only signed server requests may append rows.
 * Set script property RESOURCE_SHEET_SECRET to the same random secret as Vercel.
 */
var SPREADSHEET_ID = '1siESTwaM76R_qbzHYAJ33aPawol8EKW7K6i8c59Lo6g';
var TAB_NAME = '자료 신청·이메일 확인 완료';
var HEADERS = ['신청 ID', '신청·동의 시각 (한국)', '기관·기업명', '이름', '확인된 이메일', '신청 자료', '제안서 요청', '교육 소식 수신 동의', '개인정보 동의', '동의 문구 버전', '이메일 확인 시각 (한국)', '유입 경로'];

function result_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return result_({ ok: false, error: 'POST required' }); }
function doPost(e) {
  var lock;
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 12000) return result_({ ok: false });
    var envelope = JSON.parse(raw);
    var secret = PropertiesService.getScriptProperties().getProperty('RESOURCE_SHEET_SECRET');
    if (!secret || secret.length < 32 || typeof envelope.payload !== 'string' || !/^\d{13}$/.test(envelope.timestamp) || !/^[a-f0-9]{64}$/.test(envelope.signature)) return result_({ ok: false });
    if (Math.abs(Date.now() - Number(envelope.timestamp)) > 300000) return result_({ ok: false });
    var expected = Utilities.computeHmacSha256Signature(envelope.timestamp + '.' + envelope.payload, secret, Utilities.Charset.UTF_8)
      .map(function(b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
    var difference = 0;
    for (var i = 0; i < 64; i++) difference |= expected.charCodeAt(i) ^ envelope.signature.charCodeAt(i);
    if (difference !== 0) return result_({ ok: false });
    var p = JSON.parse(envelope.payload);
    if (p.version !== 1 || !/^[a-f0-9-]{36}$/.test(p.id) || p.consent !== true ||
        !['brochure', 'privacy', 'method'].includes(p.resource) ||
        typeof p.proposal !== 'boolean' || typeof p.marketing !== 'boolean' ||
        !Number.isFinite(Date.parse(p.requestedAt)) ||
        !['organization', 'name', 'email', 'resourceLabel', 'consentVersion', 'source'].every(function(k) { return typeof p[k] === 'string' && p[k].length > 0 && p[k].length <= 200; })) return result_({ ok: false });
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return result_({ ok: false });
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TAB_NAME);
    if (!sheet) throw new Error('Missing destination');
    // Refuse a changed schema instead of corrupting existing columns.
    var header = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (HEADERS.some(function(v, index) { return header[index] !== v; })) throw new Error('Header mismatch');
    var last = sheet.getLastRow();
    if (last > 1 && sheet.getRange(2, 1, last - 1, 1).createTextFinder(p.id).matchEntireCell(true).useRegularExpression(false).findNext())
      return result_({ ok: true, id: p.id, duplicate: true });
    var koreanDate = function(date) { return Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); };
    var cells = [p.id, koreanDate(new Date(p.requestedAt)), p.organization, p.name, p.email, p.resourceLabel,
      p.proposal ? '요청함' : '요청 안 함', p.marketing ? '동의' : '미동의', '동의', p.consentVersion,
      koreanDate(new Date()), p.source];
    // User text must never execute as a spreadsheet formula, including CSV exports.
    cells = cells.map(function(v) { return /^[\s]*[=+@-]/.test(String(v)) ? "'" + v : String(v); });
    if (last >= sheet.getMaxRows()) sheet.insertRowsAfter(last, 100);
    sheet.getRange(last + 1, 1, 1, cells.length).setNumberFormat('@').setValues([cells]);
    SpreadsheetApp.flush();
    return result_({ ok: true, id: p.id });
  } catch (_) {
    return result_({ ok: false, error: 'Save failed' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
