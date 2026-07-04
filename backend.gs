/**
 * ============================================================
 * CIRCUIT.LAB — Google Apps Script Backend
 * ============================================================
 *
 * كيفية الاستخدام:
 * 1) افتح https://sheets.google.com وأنشئ ورقة جديدة
 * 2) من القائمة: Extensions → Apps Script
 * 3) احذف الكود الافتراضي والصق هذا الملف بالكامل
 * 4) غيّر قيمة TEACHER_TOKEN إلى كلمة مرور من اختيارك (لا تخبر بها الطلاب)
 * 5) اضغط Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - اضغط Deploy وامنح الأذونات
 * 6) انسخ الرابط (Web app URL) والصقه في ملف questions.js:
 *      meta.backend.url = 'PASTE_HERE'
 *      meta.backend.teacherToken = 'YOUR_TOKEN'  // نفس TEACHER_TOKEN
 */

// ⚙️ غيّر هذه إلى كلمة مرور قوية (12+ حرفاً موصى بها)
const TEACHER_TOKEN = 'Khh@8956';

// اسم الورقة داخل الملف (يُنشأ تلقائياً)
const SHEET_NAME = 'Results';

// ============================================================
// نقطة الاستقبال — POST
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'submit';

    if (action === 'delete')      return handleDelete(data);
    if (action === 'clear')       return handleClear(data);
    if (action === 'grade')       return handleGrade(data);
    return handleSubmit(data); // Default: student submission
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ============================================================
// نقطة القراءة — GET
// ============================================================
function doGet(e) {
  const token = (e.parameter && e.parameter.token) || '';
  if (token !== TEACHER_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized' });
  }
  return handleList();
}

// ============================================================
// معالجات
// ============================================================

function handleSubmit(data) {
  if (!data.student || !data.student.name) {
    return jsonResponse({ ok: false, error: 'Invalid payload' });
  }

  const sheet = getOrCreateSheet();
  const rowId = sheet.getLastRow() + 1;

  const row = [
    new Date(),
    data.student.name || '',
    data.student.grade || '',
    data.student.id || '',
    data.student.school || '',
    (data.score && data.score.answered) || 0,
    (data.score && data.score.total) || 0,
    (data.meta && data.meta.durationSeconds) || 0,
    (data.meta && data.meta.startedAt) || '',
    (data.meta && data.meta.submittedAt) || '',
    JSON.stringify(data)
  ];

  sheet.appendRow(row);
  return jsonResponse({ ok: true, rowId: rowId });
}

function handleList() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({ ok: true, results: [] });

  const values = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  const results = [];

  for (let i = 0; i < values.length; i++) {
    const raw = values[i][10]; // Payload column
    if (!raw) continue;
    try {
      const payload = JSON.parse(raw);
      payload._rowId = i + 2; // Sheet row index (1-based, +1 header)
      payload._receivedAt = values[i][0];
      results.push(payload);
    } catch (e) {
      // skip corrupt rows
    }
  }

  return jsonResponse({ ok: true, results: results });
}

function handleDelete(data) {
  if (data.token !== TEACHER_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized' });
  }
  const rowId = parseInt(data.rowId, 10);
  if (!rowId || rowId < 2) {
    return jsonResponse({ ok: false, error: 'Invalid rowId' });
  }
  const sheet = getOrCreateSheet();
  sheet.deleteRow(rowId);
  return jsonResponse({ ok: true });
}

function handleGrade(data) {
  if (data.token !== TEACHER_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized' });
  }
  const rowId = parseInt(data.rowId, 10);
  if (!rowId || rowId < 2) {
    return jsonResponse({ ok: false, error: 'Invalid rowId' });
  }
  const sheet = getOrCreateSheet();
  const cell = sheet.getRange(rowId, 11); // Payload column
  let payload;
  try {
    payload = JSON.parse(cell.getValue());
  } catch (e) {
    return jsonResponse({ ok: false, error: 'Corrupt payload' });
  }
  payload.grades = data.grades || {};
  payload.gradedAt = new Date().toISOString();
  cell.setValue(JSON.stringify(payload));
  return jsonResponse({ ok: true });
}

function handleClear(data) {
  if (data.token !== TEACHER_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized' });
  }
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  return jsonResponse({ ok: true });
}

// ============================================================
// مساعدات
// ============================================================

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Received At',
      'Name',
      'Grade',
      'ID',
      'School',
      'Answered',
      'Total',
      'Duration (s)',
      'Started At',
      'Submitted At',
      'Payload (JSON)'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:K1').setFontWeight('bold');
    sheet.setColumnWidth(11, 60); // hide payload column visually
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
