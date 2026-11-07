/**
 * 외국인 유학생 설문 — Google Apps Script 백엔드
 * 1) Google Sheets 새 문서 → 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 * 2) 프로젝트 설정 → 스크립트 속성 → ADMIN_KEY 추가 (대시보드 비밀번호)
 * 3) 배포 → 새 배포 → 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → URL을 js/config.js ENDPOINT에 입력
 */
const SHEET_NAME = 'responses';
const BASE_COLS = ['timestamp', 'id', 'lang', 'device'];
const MAX_LEN = 1000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const answers = data.answers && typeof data.answers === 'object' ? data.answers : {};
    if (Object.keys(answers).length === 0) return json_({ ok: false, error: 'empty' });
    if (Object.keys(answers).length > 60) return json_({ ok: false, error: 'too_many_fields' });

    const sh = sheet_();
    let headers = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].filter(String) : [];
    if (!headers.length) headers = BASE_COLS.slice();
    Object.keys(answers).forEach(function (k) {
      const key = String(k).replace(/[^\w]/g, '').slice(0, 40);
      if (key && headers.indexOf(key) < 0) headers.push(key);
    });
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);

    const row = headers.map(function (h) {
      if (h === 'timestamp') return new Date();
      if (h === 'id') return clean_(data.id || Utilities.getUuid());
      if (h === 'lang') return clean_(data.lang);
      if (h === 'device') return clean_(data.device);
      const v = answers[h];
      return Array.isArray(v) ? clean_(v.join(' | ')) : clean_(v);
    });
    sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!adminKey || !e || !e.parameter || e.parameter.key !== adminKey) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  const values = sheet_().getDataRange().getValues();
  if (values.length < 2) return json_({ ok: true, rows: [] });
  const headers = values[0];
  const rows = values.slice(1).map(function (r) {
    const o = {};
    headers.forEach(function (h, i) {
      let v = r[i];
      if (v instanceof Date) v = v.toISOString();
      if (typeof v === 'string' && v.charAt(0) === "'") v = v.slice(1);
      o[h] = v;
    });
    return o;
  });
  return json_({ ok: true, rows: rows });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

// 길이 제한 + 시트 수식 주입 방지
function clean_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  let s = String(v).slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
