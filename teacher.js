/* ============================================================
   CIRCUIT.LAB — Teacher Dashboard
============================================================ */

(function () {
  'use strict';

  const TOKEN_KEY = 'circuitlab.teacher.token';
  const AUTO_REFRESH_MS = 30000;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const state = {
    token: null,
    students: [],
    selectedRowId: null,
    filter: '',
    sort: 'latest',
    tab: 'student',
    autoRefreshId: null,
    modalCb: null
  };

  /* ========================================================
     BACKEND CONFIG
  ======================================================== */
  function getBackendUrl() {
    return (QUIZ_DATA.meta && QUIZ_DATA.meta.backend && QUIZ_DATA.meta.backend.url) || '';
  }

  /* ========================================================
     BOOT
  ======================================================== */
  function init() {
    if (!getBackendUrl()) {
      showAuthError('لم يتم إعداد الخادم بعد. راجع README.md → قسم "الحفظ التلقائي".');
    }

    // Try to auto-login from URL param, then localStorage
    const urlToken = new URL(location.href).searchParams.get('token');
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const token = urlToken || savedToken;

    if (token) {
      tryLogin(token, /*silent=*/true);
    }

    bindEvents();
  }

  /* ========================================================
     AUTH
  ======================================================== */
  function bindEvents() {
    $('#auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const token = $('#auth-token').value.trim();
      if (!token) return;
      tryLogin(token, false);
    });

    $('#btn-refresh').addEventListener('click', () => fetchResults());
    $('#btn-logout').addEventListener('click', logout);
    $('#btn-export-csv').addEventListener('click', exportCSV);
    $('#btn-export-json').addEventListener('click', exportJSON);

    $('#auto-refresh-toggle').addEventListener('change', (e) => {
      if (e.target.checked) startAutoRefresh();
      else stopAutoRefresh();
    });

    $('#students-search').addEventListener('input', (e) => {
      state.filter = e.target.value.toLowerCase();
      renderStudentsList();
    });

    $('#students-sort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderStudentsList();
    });

    $$('.details-tab').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Modal
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#modal-confirm-btn').addEventListener('click', () => {
      const cb = state.modalCb;
      closeModal();
      if (cb) cb();
    });
    $$('[data-close-modal]').forEach((el) =>
      el.addEventListener('click', closeModal)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function tryLogin(token, silent) {
    if (!getBackendUrl()) {
      if (!silent) showAuthError('لم يتم إعداد الخادم. راجع README.md');
      return;
    }

    hideAuthError();
    setConn('loading', 'جارٍ التحقق...');

    fetchResults(token)
      .then((ok) => {
        if (ok) {
          state.token = token;
          localStorage.setItem(TOKEN_KEY, token);
          showDashboard();
          startAutoRefresh();
        } else if (!silent) {
          showAuthError('كلمة المرور غير صحيحة أو الخادم لم يستجب');
        }
      })
      .catch(() => {
        if (!silent) showAuthError('تعذّر الاتصال بالخادم. تأكد من رابط Apps Script');
      });
  }

  function showAuthError(msg) {
    const el = $('#auth-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function hideAuthError() {
    $('#auth-error').classList.add('hidden');
  }

  function logout() {
    stopAutoRefresh();
    localStorage.removeItem(TOKEN_KEY);
    state.token = null;
    state.students = [];
    state.selectedRowId = null;
    location.href = 'teacher.html'; // Clear ?token= param
  }

  function showDashboard() {
    $('#screen-auth').classList.add('hidden');
    $('#screen-dashboard').classList.remove('hidden');
  }

  /* ========================================================
     DATA FETCH
  ======================================================== */
  function fetchResults(token) {
    token = token || state.token;
    if (!token) return Promise.resolve(false);

    const url = getBackendUrl() + '?token=' + encodeURIComponent(token);

    setConn('loading', 'جارٍ التحديث...');

    return fetch(url, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.ok) {
          setConn('err', 'خطأ في المصادقة');
          return false;
        }
        state.students = data.results || [];
        setConn('ok', 'متصل • ' + state.students.length + ' نتائج');
        renderAll();
        return true;
      })
      .catch((err) => {
        setConn('err', 'تعذّر الاتصال');
        console.error(err);
        return false;
      });
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    state.autoRefreshId = setInterval(fetchResults, AUTO_REFRESH_MS);
  }

  function stopAutoRefresh() {
    if (state.autoRefreshId) {
      clearInterval(state.autoRefreshId);
      state.autoRefreshId = null;
    }
  }

  function setConn(kind, text) {
    const el = $('#dash-conn');
    el.classList.remove('dash-conn--ok', 'dash-conn--err', 'dash-conn--loading');
    el.classList.add('dash-conn--' + kind);
    $('#dash-conn-text').textContent = text;
  }

  /* ========================================================
     RENDER
  ======================================================== */
  function renderAll() {
    renderStats();
    renderStudentsList();
    if (state.selectedRowId != null) {
      renderStudentDetail();
    }
    renderAnalytics();
  }

  function renderStats() {
    const list = state.students;
    $('#stat-count').innerHTML = `<span class="mono">${list.length}</span>`;

    if (!list.length) {
      $('#stat-avg-answered').innerHTML = '<span class="mono">—</span>';
      $('#stat-avg-duration').innerHTML = '<span class="mono">—</span>';
      $('#stat-last').innerHTML = '<span class="mono">—</span>';
      return;
    }

    const total = list[0].score.total;
    const avgAns =
      list.reduce((sum, s) => sum + s.score.answered, 0) / list.length;
    const avgDur =
      list.reduce((sum, s) => sum + s.meta.durationSeconds, 0) / list.length;

    $('#stat-avg-answered').innerHTML = `<span class="mono">${avgAns.toFixed(1)}</span><span class="dash-stat__unit">/ ${total}</span>`;
    $('#stat-avg-duration').innerHTML = `<span class="mono">${formatMinutes(avgDur)}</span>`;

    const last = list
      .map((s) => new Date(s.meta.submittedAt).getTime())
      .sort((a, b) => b - a)[0];
    $('#stat-last').innerHTML = `<span class="mono">${formatRelative(last)}</span>`;
  }

  function filteredSortedStudents() {
    let list = state.students.slice();

    if (state.filter) {
      const f = state.filter;
      list = list.filter((s) => {
        return (
          (s.student.name || '').toLowerCase().includes(f) ||
          (s.student.grade || '').toLowerCase().includes(f) ||
          (s.student.id || '').toLowerCase().includes(f)
        );
      });
    }

    switch (state.sort) {
      case 'latest':
        list.sort((a, b) => new Date(b.meta.submittedAt) - new Date(a.meta.submittedAt));
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.meta.submittedAt) - new Date(b.meta.submittedAt));
        break;
      case 'name':
        list.sort((a, b) => (a.student.name || '').localeCompare(b.student.name || '', 'ar'));
        break;
      case 'score-desc':
        list.sort((a, b) => b.score.answered - a.score.answered);
        break;
      case 'score-asc':
        list.sort((a, b) => a.score.answered - b.score.answered);
        break;
    }

    return list;
  }

  function renderStudentsList() {
    const list = filteredSortedStudents();
    const container = $('#students-list');
    $('#students-count').textContent = list.length + ' / ' + state.students.length;

    if (!list.length) {
      const emptyMsg = state.students.length
        ? 'لا توجد نتائج تطابق البحث'
        : 'لم يسلّم أي طالب بعد';
      container.innerHTML = `
        <div class="students-empty">
          <div class="students-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          </div>
          <p>${emptyMsg}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map((s, idx) => {
        const isSel = s._rowId === state.selectedRowId;
        return `
          <div class="student-row ${isSel ? 'is-selected' : ''}" data-row-id="${s._rowId}">
            <span class="student-row__num">${String(idx + 1).padStart(2, '0')}</span>
            <div class="student-row__info">
              <div class="student-row__name">${escapeHtml(s.student.name)}</div>
              <div class="student-row__meta">
                <span>${escapeHtml(s.student.grade)}</span>
                <span>·</span>
                <span>${formatRelative(new Date(s.meta.submittedAt).getTime())}</span>
              </div>
            </div>
            <span class="student-row__score">${s.score.answered}/${s.score.total}</span>
          </div>
        `;
      })
      .join('');

    container.querySelectorAll('.student-row').forEach((row) => {
      row.addEventListener('click', () => {
        state.selectedRowId = Number(row.dataset.rowId);
        renderStudentsList();
        renderStudentDetail();
        switchTab('student');
      });
    });
  }

  function renderStudentDetail() {
    const s = state.students.find((x) => x._rowId === state.selectedRowId);
    if (!s) return;

    $('#detail-empty').classList.add('hidden');
    const box = $('#detail-content');
    const startedAt = s.meta.startedAt ? new Date(s.meta.startedAt) : null;
    const submittedAt = new Date(s.meta.submittedAt);

    box.innerHTML = `
      <div class="detail-head">
        <div>
          <div class="detail-head__name">${escapeHtml(s.student.name)}</div>
          <div class="detail-head__meta">
            <span>${escapeHtml(s.student.grade)}</span>
            ${s.student.id ? `<span>ID: ${escapeHtml(s.student.id)}</span>` : ''}
            ${s.student.school ? `<span>${escapeHtml(s.student.school)}</span>` : ''}
            <span class="mono mono--muted">${submittedAt.toLocaleString('ar-EG')}</span>
          </div>
        </div>
        <div class="detail-head__actions">
          <button class="btn btn--ghost btn--sm" data-action="download-student">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            تحميل
          </button>
          <button class="btn btn--ghost btn--sm" data-action="delete-student" style="color: var(--red);">
            حذف
          </button>
        </div>
      </div>

      <div class="detail-summary">
        <div class="detail-summary__card">
          <span class="detail-summary__label">ANSWERED</span>
          <div class="detail-summary__value">
            <span class="mono">${s.score.answered}</span>
            <span style="color:var(--text-muted);font-size:14px"> / ${s.score.total}</span>
          </div>
        </div>
        <div class="detail-summary__card">
          <span class="detail-summary__label">DURATION</span>
          <div class="detail-summary__value">
            <span class="mono">${formatMinutes(s.meta.durationSeconds)}</span>
          </div>
        </div>
        <div class="detail-summary__card">
          <span class="detail-summary__label">COMPLETION</span>
          <div class="detail-summary__value">
            <span class="mono">${Math.round((s.score.answered / s.score.total) * 100)}%</span>
          </div>
        </div>
      </div>

      <div class="answer-list">
        ${s.answers.map((a, i) => renderAnswerItem(a, i, s)).join('')}
      </div>
    `;

    box.querySelector('[data-action="download-student"]').addEventListener('click', () => {
      downloadStudentJSON(s);
    });
    box.querySelector('[data-action="delete-student"]').addEventListener('click', () => {
      confirmDeleteStudent(s);
    });
  }

  function renderAnswerItem(a, i, student) {
    const isEmpty = a.answer === null || a.answer === undefined ||
      (typeof a.answer === 'string' && a.answer.trim() === '') ||
      (typeof a.answer === 'object' && Object.keys(a.answer).length === 0);

    let answerText;
    if (isEmpty) {
      answerText = 'لم يُجب على هذا السؤال';
    } else if (typeof a.answer === 'object') {
      answerText = Object.entries(a.answer)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    } else {
      answerText = String(a.answer);
    }

    return `
      <div class="answer-item ${isEmpty ? 'answer-item--empty' : ''}">
        <div class="answer-item__head">
          <span class="answer-item__num">Q ${String(i + 1).padStart(2, '0')} / ${a.points} PTS</span>
          <span class="answer-item__section">${escapeHtml(a.section)}</span>
        </div>
        <div class="answer-item__question">${escapeHtml(a.question)}</div>
        <div class="answer-item__answer ${isEmpty ? 'answer-item__answer--empty' : ''}">${escapeHtml(answerText)}</div>
      </div>
    `;
  }

  /* ========================================================
     QUESTION ANALYTICS
  ======================================================== */
  function renderAnalytics() {
    const box = $('#analytics-content');
    if (!state.students.length) {
      box.innerHTML = `
        <div class="detail-empty">
          <div class="detail-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="20" x2="12" y2="10"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </div>
          <h3>سيظهر تحليل الأسئلة عند وجود إجابات</h3>
        </div>
      `;
      return;
    }

    // Use the first student's answers to seed question metadata
    const templateAnswers = state.students[0].answers;
    const questions = QUIZ_DATA.getAllQuestions();

    const items = templateAnswers.map((a, i) => {
      const q = questions[i];
      return renderAnalyticsItem(q, i);
    });

    box.innerHTML = `<div class="analytics-list">${items.join('')}</div>`;
  }

  function renderAnalyticsItem(q, idx) {
    const answers = state.students
      .map((s) => s.answers[idx])
      .filter((a) => a);

    let bodyHtml;
    switch (q.type) {
      case 'mcq':
      case 'image_mcq':
        bodyHtml = renderMCQAnalytics(q, answers);
        break;
      case 'true_false':
        bodyHtml = renderTFAnalytics(answers);
        break;
      case 'matching':
        bodyHtml = renderMatchingAnalytics(q, answers);
        break;
      default:
        bodyHtml = renderTextAnalytics(answers);
    }

    return `
      <div class="analytics-item">
        <div class="analytics-item__head">
          <div>
            <div class="analytics-item__num">Q ${String(idx + 1).padStart(2, '0')} / ${q.sectionCode}</div>
            <div class="analytics-item__question">${escapeHtml(q.title)}</div>
          </div>
          <span class="analytics-item__type">${q.type}</span>
        </div>
        ${bodyHtml}
      </div>
    `;
  }

  function renderMCQAnalytics(q, answers) {
    const counts = {};
    q.options.forEach((o) => (counts[o.key] = 0));
    let emptyCount = 0;
    answers.forEach((a) => {
      if (!a.answer) { emptyCount++; return; }
      counts[a.answer] = (counts[a.answer] || 0) + 1;
    });
    const total = answers.length;

    const rows = q.options.map((opt) => {
      const c = counts[opt.key] || 0;
      const pct = total ? (c / total) * 100 : 0;
      return `
        <div class="bar-row">
          <div class="bar-row__label">
            <span class="opt__key" style="width:22px;height:22px;font-size:11px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border-hairline);color:var(--amber);font-family:var(--font-mono)">${opt.key}</span>
            <span class="bar-row__label__text">${escapeHtml(opt.text)}</span>
          </div>
          <span class="bar-row__count">${c} (${pct.toFixed(0)}%)</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join('');

    const emptyRow = emptyCount ? `
      <div class="bar-row" style="opacity:0.7">
        <div class="bar-row__label"><span class="bar-row__label__text" style="color:var(--text-muted);font-style:italic">لم يُجب</span></div>
        <span class="bar-row__count">${emptyCount}</span>
      </div>
    ` : '';

    return `<div class="bar-list">${rows}${emptyRow}</div>`;
  }

  function renderTFAnalytics(answers) {
    const t = answers.filter((a) => a.answer === 'صح').length;
    const f = answers.filter((a) => a.answer === 'خطأ').length;
    const total = t + f;
    const tPct = total ? (t / total) * 100 : 0;
    const fPct = total ? (f / total) * 100 : 0;

    return `
      <div class="bar-list">
        <div class="bar-row">
          <div class="bar-row__label"><span class="bar-row__label__text" style="color: var(--mint)">✓ صح</span></div>
          <span class="bar-row__count">${t} (${tPct.toFixed(0)}%)</span>
          <div class="bar-track"><div class="bar-fill" style="width:${tPct}%;background:var(--mint)"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-row__label"><span class="bar-row__label__text" style="color: var(--red)">✗ خطأ</span></div>
          <span class="bar-row__count">${f} (${fPct.toFixed(0)}%)</span>
          <div class="bar-track"><div class="bar-fill" style="width:${fPct}%;background:var(--red)"></div></div>
        </div>
      </div>
    `;
  }

  function renderMatchingAnalytics(q, answers) {
    // For matching, show distribution per item
    const summary = q.items.map((item) => {
      const counts = {};
      q.choices.forEach((c) => (counts[c.value] = 0));
      answers.forEach((a) => {
        const sel = a.answer && a.answer[item.id];
        if (sel && counts[sel] !== undefined) counts[sel]++;
      });
      const rows = q.choices.map((c) => {
        const cnt = counts[c.value];
        const pct = answers.length ? (cnt / answers.length) * 100 : 0;
        return `
          <div class="bar-row">
            <div class="bar-row__label"><span class="bar-row__label__text">${escapeHtml(c.label)}</span></div>
            <span class="bar-row__count">${cnt} (${pct.toFixed(0)}%)</span>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          </div>
        `;
      }).join('');
      return `
        <div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--border-hairline)">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--amber);margin-bottom:8px">▸ ${item.letter} · ${escapeHtml(item.label)}</div>
          <div class="bar-list">${rows}</div>
        </div>
      `;
    }).join('');
    return summary;
  }

  function renderTextAnalytics(answers) {
    const nonEmpty = answers.filter((a) => a.answer && String(a.answer).trim());
    if (!nonEmpty.length) {
      return `<p style="color: var(--text-muted); font-style: italic;">لم يُجب أحد على هذا السؤال</p>`;
    }
    const items = nonEmpty.slice(0, 20).map((a, i) => {
      const student = state.students.find((s) => s.answers.includes(a));
      const name = student ? student.student.name : '—';
      return `
        <div class="text-answer-list__item">
          <strong>${escapeHtml(name)}:</strong>
          ${escapeHtml(String(a.answer))}
        </div>
      `;
    }).join('');
    return `
      <p style="margin-bottom: 10px; font-size: 13px; color: var(--text-muted);">
        عدد المجيبين: <strong style="color: var(--amber);">${nonEmpty.length}</strong> من ${answers.length}
      </p>
      <div class="text-answer-list">${items}</div>
    `;
  }

  /* ========================================================
     TABS
  ======================================================== */
  function switchTab(name) {
    state.tab = name;
    $$('.details-tab').forEach((t) =>
      t.classList.toggle('is-active', t.dataset.tab === name)
    );
    $('#tab-student').classList.toggle('hidden', name !== 'student');
    $('#tab-analytics').classList.toggle('hidden', name !== 'analytics');
  }

  /* ========================================================
     EXPORT
  ======================================================== */
  function exportCSV() {
    if (!state.students.length) {
      toast('لا توجد بيانات للتصدير', 'error');
      return;
    }

    const rows = [];
    // Header
    const questions = state.students[0].answers;
    const header = ['#', 'الاسم', 'الصف', 'الرقم', 'المدرسة', 'الإجابات', 'المجموع', 'المدة (ث)', 'وقت البدء', 'وقت التسليم'];
    questions.forEach((q, i) => {
      header.push(`س${i + 1}: ${q.question.slice(0, 60)}`);
    });
    rows.push(header);

    // Data
    state.students.forEach((s, i) => {
      const row = [
        i + 1,
        s.student.name,
        s.student.grade,
        s.student.id || '',
        s.student.school || '',
        s.score.answered,
        s.score.total,
        s.meta.durationSeconds,
        s.meta.startedAt,
        s.meta.submittedAt
      ];
      s.answers.forEach((a) => {
        row.push(formatAnswerCell(a.answer));
      });
      rows.push(row);
    });

    const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    const bom = '﻿';
    downloadFile(fileStem() + '.csv', bom + csv, 'text/csv;charset=utf-8');
    toast('تم تحميل ملف CSV');
  }

  function exportJSON() {
    if (!state.students.length) {
      toast('لا توجد بيانات للتصدير', 'error');
      return;
    }
    const data = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        count: state.students.length,
        students: state.students
      },
      null,
      2
    );
    downloadFile(fileStem() + '.json', data, 'application/json;charset=utf-8');
    toast('تم تحميل ملف JSON');
  }

  function downloadStudentJSON(s) {
    const data = JSON.stringify(s, null, 2);
    const stem = `${(s.student.name || 'student').replace(/[^\p{L}\p{N}]+/gu, '_')}_${new Date().toISOString().slice(0, 10)}`;
    downloadFile(stem + '.json', data, 'application/json;charset=utf-8');
  }

  /* ========================================================
     DELETE
  ======================================================== */
  function confirmDeleteStudent(s) {
    confirmModal({
      title: 'حذف نتيجة الطالب؟',
      message: `سيتم حذف نتيجة الطالب "${s.student.name}" نهائياً من الخادم.`,
      onConfirm: () => deleteStudent(s)
    });
  }

  function deleteStudent(s) {
    fetch(getBackendUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', token: state.token, rowId: s._rowId })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok) {
          toast('تم حذف النتيجة');
          state.selectedRowId = null;
          $('#detail-content').innerHTML = '';
          $('#detail-empty').classList.remove('hidden');
          fetchResults();
        } else {
          toast('فشل الحذف', 'error');
        }
      })
      .catch(() => toast('تعذّر الاتصال', 'error'));
  }

  /* ========================================================
     MODAL / TOAST
  ======================================================== */
  function confirmModal({ title, message, onConfirm }) {
    $('#modal-title').textContent = title;
    $('#modal-message').textContent = message;
    state.modalCb = onConfirm;
    $('#modal-confirm').classList.remove('hidden');
  }

  function closeModal() {
    $('#modal-confirm').classList.add('hidden');
    state.modalCb = null;
  }

  let toastTimer = null;
  function toast(msg, type) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('toast--error', type === 'error');
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2400);
  }

  /* ========================================================
     UTILITIES
  ======================================================== */
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function csvEscape(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function formatAnswerCell(a) {
    if (a === null || a === undefined) return '';
    if (typeof a === 'object') {
      return Object.entries(a).map(([k, v]) => `${k}=${v}`).join(' | ');
    }
    return String(a);
  }

  function formatMinutes(seconds) {
    if (!seconds) return '0د';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}د ${s}ث`;
  }

  function formatRelative(ts) {
    if (!ts) return '—';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `قبل ${Math.floor(diff / 60)}د`;
    if (diff < 86400) return `قبل ${Math.floor(diff / 3600)}س`;
    return new Date(ts).toLocaleDateString('ar-EG');
  }

  function fileStem() {
    const d = new Date().toISOString().slice(0, 10);
    return `circuitlab_results_${d}`;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /* ========================================================
     BOOT
  ======================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
