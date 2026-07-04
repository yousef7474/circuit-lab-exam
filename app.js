/* ============================================================
   CIRCUIT.LAB — Application Logic
============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'circuitlab.quiz.session';
  const CONFIG_KEY = 'circuitlab.teacher.config';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ========================================================
     STATE
  ======================================================== */
  const state = {
    screen: 'welcome',
    student: null,
    startedAt: null,
    submittedAt: null,
    currentIndex: 0,
    answers: {},
    timeRemaining: QUIZ_DATA.meta.durationSeconds,
    timerId: null,
    questions: QUIZ_DATA.getAllQuestions()
  };

  /* ========================================================
     PERSISTENCE
  ======================================================== */
  function saveSession() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          student: state.student,
          startedAt: state.startedAt,
          currentIndex: state.currentIndex,
          answers: state.answers,
          timeRemaining: state.timeRemaining
        })
      );
    } catch (e) { /* storage disabled */ }
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearSession() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function getTeacherConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      return raw ? JSON.parse(raw) : { email: '' };
    } catch (e) { return { email: '' }; }
  }

  function setTeacherConfig(cfg) {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  /* ========================================================
     SCREEN NAVIGATION
  ======================================================== */
  function showScreen(name) {
    ['welcome', 'quiz', 'results'].forEach((n) => {
      $(`#screen-${n}`).classList.toggle('hidden', n !== name);
    });
    state.screen = name;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ========================================================
     WELCOME SCREEN
  ======================================================== */
  function initWelcome() {
    // Date stamp
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    $('#date-stamp').textContent = `${y}.${m}.${d}`;

    // Resume detection
    const saved = loadSession();
    if (saved && saved.student && !saved.submittedAt) {
      $('#resume-row').hidden = false;
    }

    // Form submit
    $('#student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get('name') || '').trim();
      const grade = (fd.get('grade') || '').trim();
      if (!name || !grade) {
        toast('يرجى إدخال الاسم والصف', 'error');
        return;
      }
      state.student = {
        name,
        grade,
        id: (fd.get('id') || '').trim(),
        school: (fd.get('school') || '').trim()
      };
      state.startedAt = new Date().toISOString();
      state.currentIndex = 0;
      state.answers = {};
      state.timeRemaining = QUIZ_DATA.meta.durationSeconds;
      startQuiz();
    });

    // Resume
    $('#btn-resume').addEventListener('click', () => {
      const saved = loadSession();
      if (!saved) return;
      state.student = saved.student;
      state.startedAt = saved.startedAt;
      state.currentIndex = saved.currentIndex || 0;
      state.answers = saved.answers || {};
      state.timeRemaining = saved.timeRemaining || QUIZ_DATA.meta.durationSeconds;
      startQuiz();
    });

    // Clear saved
    $('#btn-clear-saved').addEventListener('click', () => {
      confirmModal({
        title: 'مسح النسخة المحفوظة؟',
        message: 'ستفقد الإجابات المحفوظة سابقاً على هذا الجهاز.',
        onConfirm: () => {
          clearSession();
          $('#resume-row').hidden = true;
          toast('تم مسح النسخة المحفوظة');
        }
      });
    });
  }

  /* ========================================================
     QUIZ FLOW
  ======================================================== */
  function startQuiz() {
    $('#total-count').textContent = state.questions.length;
    $('#student-badge').textContent = `${state.student.name} · ${state.student.grade}`;
    renderNav();
    renderQuestion();
    updateProgress();
    startTimer();
    showScreen('quiz');
  }

  function startTimer() {
    stopTimer();
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      state.timeRemaining--;
      updateTimerDisplay();
      if (state.timeRemaining % 10 === 0) saveSession();
      if (state.timeRemaining <= 0) {
        stopTimer();
        autoSubmit();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateTimerDisplay() {
    const t = Math.max(0, state.timeRemaining);
    const m = Math.floor(t / 60);
    const s = t % 60;
    $('#timer-value').textContent =
      `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    $('#timer').classList.toggle('timer--warn', t <= 300); // 5 min warning
  }

  function autoSubmit() {
    toast('انتهى الوقت! سيتم تسليم الإجابات تلقائياً', 'error');
    setTimeout(() => finishQuiz(true), 1200);
  }

  /* ========================================================
     NAVIGATION SIDEBAR
  ======================================================== */
  function renderNav() {
    const list = $('#section-list');
    list.innerHTML = '';
    let globalIdx = 0;
    QUIZ_DATA.sections.forEach((sec) => {
      const secEl = document.createElement('div');
      secEl.className = 'nav-section';

      const title = document.createElement('div');
      title.className = 'nav-section-title';
      title.innerHTML = `
        <span class="mono">${sec.code}</span>
        <span>${sec.title}</span>
      `;
      secEl.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'nav-questions';
      sec.questions.forEach(() => {
        const idx = globalIdx++;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-q-btn';
        btn.textContent = String(idx + 1);
        btn.dataset.index = idx;
        btn.addEventListener('click', () => goTo(idx));
        grid.appendChild(btn);
      });
      secEl.appendChild(grid);
      list.appendChild(secEl);
    });
    updateNavStates();
  }

  function updateNavStates() {
    $$('.nav-q-btn').forEach((btn) => {
      const idx = Number(btn.dataset.index);
      const q = state.questions[idx];
      const answered = hasAnswer(q.id);
      btn.classList.toggle('is-answered', answered);
      btn.classList.toggle('is-current', idx === state.currentIndex);
    });
  }

  function hasAnswer(qid) {
    const a = state.answers[qid];
    if (a === undefined || a === null) return false;
    if (typeof a === 'string') return a.trim().length > 0;
    if (typeof a === 'object') return Object.keys(a).length > 0;
    return true;
  }

  /* ========================================================
     QUESTION RENDERING
  ======================================================== */
  const TYPE_LABELS = {
    mcq: 'اختيار من متعدد',
    image_mcq: 'اختيار من متعدد + صورة',
    true_false: 'صح أو خطأ',
    matching: 'توصيل',
    short_text: 'إجابة قصيرة',
    long_text: 'إجابة مطولة',
    code_reading: 'قراءة كود'
  };

  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    const shell = $('#question-shell');
    shell.innerHTML = '';
    // Force re-animation
    void shell.offsetWidth;

    const head = document.createElement('div');
    head.className = 'q-head';
    head.innerHTML = `
      <div class="q-crumb">
        <span class="q-section-badge">
          <span class="mono">${q.sectionCode}</span>
          ${q.sectionTitle}
        </span>
        <span class="q-number">
          سؤال <strong class="mono">${String(state.currentIndex + 1).padStart(2, '0')}</strong>
          <span class="mono mono--dim"> / ${String(state.questions.length).padStart(2, '0')}</span>
        </span>
        <span class="q-type-badge">${TYPE_LABELS[q.type] || q.type}</span>
      </div>
      <div class="q-points mono">${q.points || 4} PTS</div>
    `;
    shell.appendChild(head);

    const title = document.createElement('h2');
    title.className = 'q-title';
    title.textContent = q.title;
    shell.appendChild(title);

    const body = document.createElement('div');
    body.className = 'q-body';

    // Optional image (top of body, before answer widget)
    if (q.image) {
      body.appendChild(renderImage(q.image));
    }
    // Optional code block
    if (q.code) {
      body.appendChild(renderCode(q.code, q.codeLang));
    }

    // Answer widget by type
    switch (q.type) {
      case 'mcq':
      case 'image_mcq':
        body.appendChild(renderMCQ(q));
        break;
      case 'true_false':
        body.appendChild(renderTrueFalse(q));
        break;
      case 'short_text':
        body.appendChild(renderTextInput(q, false));
        break;
      case 'long_text':
        body.appendChild(renderTextInput(q, true));
        break;
      case 'code_reading':
        body.appendChild(renderTextInput(q, true));
        break;
      case 'matching':
        body.appendChild(renderMatching(q));
        break;
      default:
        body.appendChild(document.createTextNode('نوع سؤال غير مدعوم'));
    }

    // Hint
    if (q.hint) {
      const hint = document.createElement('div');
      hint.className = 'q-hint';
      hint.innerHTML = `<strong>HINT //</strong> ${q.hint}`;
      body.appendChild(hint);
    }

    shell.appendChild(body);

    // Update nav buttons text/state
    $('#btn-prev').disabled = state.currentIndex === 0;
    const nextBtn = $('#btn-next');
    if (state.currentIndex === state.questions.length - 1) {
      nextBtn.innerHTML = 'إنهاء الاختبار <svg viewBox="0 0 24 24" width="16" height="16" class="btn__arrow"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      nextBtn.innerHTML = 'التالي <svg viewBox="0 0 24 24" width="16" height="16" class="btn__arrow"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    updateNavStates();
  }

  function renderImage(image) {
    const wrap = document.createElement('div');
    wrap.className = 'q-image';
    if (image.svg) {
      wrap.innerHTML = image.svg;
    } else if (image.url || (typeof image === 'string')) {
      const url = image.url || image;
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      wrap.appendChild(img);
    }
    if (image.caption) {
      const cap = document.createElement('span');
      cap.className = 'q-image__caption';
      cap.textContent = image.caption;
      wrap.appendChild(cap);
    }
    return wrap;
  }

  function renderCode(code, lang) {
    const wrap = document.createElement('div');
    wrap.className = 'q-code';
    wrap.innerHTML = `
      <div class="q-code__head">
        <div class="q-code__dots">
          <span class="q-code__dot q-code__dot--r"></span>
          <span class="q-code__dot q-code__dot--y"></span>
          <span class="q-code__dot q-code__dot--g"></span>
        </div>
        <span>${lang || 'code'}</span>
      </div>
      <pre class="q-code__body"><code>${code}</code></pre>
    `;
    return wrap;
  }

  function renderMCQ(q) {
    const list = document.createElement('div');
    list.className = 'opt-list';
    const current = state.answers[q.id];

    q.options.forEach((opt) => {
      const label = document.createElement('label');
      label.className = 'opt';
      if (current === opt.key) label.classList.add('is-selected');
      label.innerHTML = `
        <span class="opt__key">${opt.key}</span>
        <span class="opt__text">${opt.text}</span>
        <input type="radio" name="${q.id}" value="${opt.key}" ${current === opt.key ? 'checked' : ''}>
      `;
      label.addEventListener('click', () => {
        state.answers[q.id] = opt.key;
        list.querySelectorAll('.opt').forEach((el) => el.classList.remove('is-selected'));
        label.classList.add('is-selected');
        onAnswerChange();
      });
      list.appendChild(label);
    });
    return list;
  }

  function renderTrueFalse(q) {
    const list = document.createElement('div');
    list.className = 'opt-list opt-list--tf';
    const current = state.answers[q.id];
    const opts = [
      { key: 'صح', text: 'صح ✓' },
      { key: 'خطأ', text: 'خطأ ✗' }
    ];
    opts.forEach((opt) => {
      const el = document.createElement('label');
      el.className = 'opt opt-tf';
      if (current === opt.key) el.classList.add('is-selected');
      el.innerHTML = `
        <span class="opt__key opt-tf__key">${opt.key === 'صح' ? '✓' : '✗'}</span>
        <span class="opt__text">${opt.text}</span>
        <input type="radio" name="${q.id}" value="${opt.key}" ${current === opt.key ? 'checked' : ''}>
      `;
      el.addEventListener('click', () => {
        state.answers[q.id] = opt.key;
        list.querySelectorAll('.opt').forEach((n) => n.classList.remove('is-selected'));
        el.classList.add('is-selected');
        onAnswerChange();
      });
      list.appendChild(el);
    });
    return list;
  }

  function renderTextInput(q, multiline) {
    const el = multiline
      ? document.createElement('textarea')
      : document.createElement('input');
    if (!multiline) el.type = 'text';
    el.className = 'q-text-input';
    el.placeholder = q.placeholder || '';
    el.value = state.answers[q.id] || '';
    el.addEventListener('input', () => {
      state.answers[q.id] = el.value;
      onAnswerChange({ skipRerender: true });
    });
    return el;
  }

  function renderMatching(q) {
    const grid = document.createElement('div');
    grid.className = 'matching-grid';

    const col = document.createElement('div');
    col.className = 'matching-col';
    col.innerHTML = `<h4>ربط كل حساس بوظيفته</h4>`;

    const current = state.answers[q.id] || {};

    q.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'matching-item';
      const select = document.createElement('select');
      select.className = 'matching-select';
      select.innerHTML =
        `<option value="">— اختر —</option>` +
        q.choices
          .map(
            (c) =>
              `<option value="${c.value}" ${current[item.id] === c.value ? 'selected' : ''}>${c.label}</option>`
          )
          .join('');
      select.addEventListener('change', () => {
        const next = { ...(state.answers[q.id] || {}) };
        if (select.value) next[item.id] = select.value;
        else delete next[item.id];
        state.answers[q.id] = next;
        onAnswerChange({ skipRerender: true });
      });
      row.innerHTML = `
        <span class="matching-item__key">${item.letter} · ${item.label}</span>
      `;
      row.appendChild(select);
      col.appendChild(row);
    });

    grid.appendChild(col);
    return grid;
  }

  /* ========================================================
     ANSWER CHANGE / NAV
  ======================================================== */
  function onAnswerChange(opts) {
    opts = opts || {};
    saveSession();
    updateProgress();
    updateNavStates();
  }

  function updateProgress() {
    const total = state.questions.length;
    const answered = state.questions.filter((q) => hasAnswer(q.id)).length;
    $('#answered-count').textContent = answered;
    const pct = (answered / total) * 100;
    $('#progress-fill').style.width = `${pct}%`;
  }

  function goTo(index) {
    if (index < 0 || index >= state.questions.length) return;
    state.currentIndex = index;
    renderQuestion();
    saveSession();
  }

  /* ========================================================
     FINISH & EXPORT
  ======================================================== */
  function finishQuiz(isTimeUp) {
    stopTimer();
    state.submittedAt = new Date().toISOString();
    saveSession();
    renderResults(isTimeUp);
    showScreen('results');
    submitToBackend();
  }

  /* Auto-submit to Google Apps Script backend */
  function submitToBackend() {
    const cfg = QUIZ_DATA.meta.backend || {};
    if (!cfg.url) {
      setSyncStatus('offline', 'الحفظ التلقائي غير مُفعّل — استخدم أزرار التصدير أدناه');
      return;
    }

    setSyncStatus('syncing', 'جارٍ الإرسال إلى المعلم...');

    fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(buildResultPayload())
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data && data.ok) {
          setSyncStatus('success', 'تم إرسال إجاباتك للمعلم بنجاح ✓');
        } else {
          setSyncStatus('error', 'فشل الإرسال — استخدم أزرار التصدير أدناه كخطة بديلة');
        }
      })
      .catch(() => {
        setSyncStatus('error', 'تعذّر الاتصال بالخادم — استخدم أزرار التصدير أدناه');
      });
  }

  function setSyncStatus(kind, message) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.className = 'sync-status sync-status--' + kind;
    el.innerHTML = `
      <span class="sync-status__dot"></span>
      <span class="sync-status__text">${escapeHtml(message)}</span>
    `;
  }

  function timeSpentSeconds() {
    if (!state.startedAt) return 0;
    const start = new Date(state.startedAt).getTime();
    const end = state.submittedAt ? new Date(state.submittedAt).getTime() : Date.now();
    return Math.floor((end - start) / 1000);
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} ث`;
    return `${m} د ${s} ث`;
  }

  function renderResults() {
    const answered = state.questions.filter((q) => hasAnswer(q.id)).length;
    const total = state.questions.length;
    const spent = timeSpentSeconds();

    $('#results-summary').innerHTML = `
      <div class="summary-card">
        <span class="summary-card__label">STUDENT</span>
        <span class="summary-card__value">${escapeHtml(state.student.name)}</span>
      </div>
      <div class="summary-card">
        <span class="summary-card__label">GRADE / CLASS</span>
        <span class="summary-card__value">${escapeHtml(state.student.grade)}</span>
      </div>
      <div class="summary-card">
        <span class="summary-card__label">ANSWERED</span>
        <span class="summary-card__value summary-card__value--mono">${answered} / ${total}</span>
      </div>
      <div class="summary-card">
        <span class="summary-card__label">TIME SPENT</span>
        <span class="summary-card__value summary-card__value--mono">${formatDuration(spent)}</span>
      </div>
    `;

    // Prefill teacher email (from local config or bundled default)
    const cfg = getTeacherConfig();
    const bundledEmail = (QUIZ_DATA.meta && QUIZ_DATA.meta.teacherEmail) || '';
    const email = cfg.email || bundledEmail;
    if (email) $('#teacher-email').value = email;
  }

  function buildResultPayload() {
    const answered = state.questions.filter((q) => hasAnswer(q.id)).length;
    return {
      meta: {
        title: QUIZ_DATA.meta.title,
        version: QUIZ_DATA.meta.version,
        startedAt: state.startedAt,
        submittedAt: state.submittedAt || new Date().toISOString(),
        durationSeconds: timeSpentSeconds()
      },
      student: state.student,
      score: {
        answered,
        total: state.questions.length
      },
      answers: state.questions.map((q) => ({
        id: q.id,
        section: q.sectionTitle,
        type: q.type,
        question: q.title,
        answer: state.answers[q.id] ?? null,
        points: q.points
      }))
    };
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

  function fileStem() {
    const safeName = (state.student.name || 'student').replace(/[^\p{L}\p{N}]+/gu, '_');
    const date = new Date().toISOString().slice(0, 10);
    return `circuitlab_${safeName}_${date}`;
  }

  function downloadJSON() {
    const data = JSON.stringify(buildResultPayload(), null, 2);
    downloadFile(`${fileStem()}.json`, data, 'application/json;charset=utf-8');
    toast('تم تحميل ملف JSON');
  }

  function downloadCSV() {
    const p = buildResultPayload();
    const rows = [];
    // Metadata rows
    rows.push(['CIRCUIT.LAB — Diagnostic Exam Results']);
    rows.push([]);
    rows.push(['Student', p.student.name]);
    rows.push(['Grade', p.student.grade]);
    rows.push(['ID', p.student.id || '']);
    rows.push(['School / Teacher', p.student.school || '']);
    rows.push(['Started At', p.meta.startedAt]);
    rows.push(['Submitted At', p.meta.submittedAt]);
    rows.push(['Duration', formatDuration(p.meta.durationSeconds)]);
    rows.push(['Answered', `${p.score.answered} / ${p.score.total}`]);
    rows.push([]);
    // Answer table
    rows.push(['#', 'Section', 'Type', 'Question', 'Answer', 'Points']);
    p.answers.forEach((a, i) => {
      rows.push([
        i + 1,
        a.section,
        a.type,
        a.question,
        formatAnswerForText(a),
        a.points
      ]);
    });

    const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    const bom = '﻿'; // for Excel Arabic
    downloadFile(`${fileStem()}.csv`, bom + csv, 'text/csv;charset=utf-8');
    toast('تم تحميل ملف CSV');
  }

  function csvEscape(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function formatAnswerForText(a) {
    if (a.answer === null || a.answer === undefined) return '— لم يُجب —';
    if (typeof a.answer === 'string') return a.answer;
    if (typeof a.answer === 'object') {
      return Object.entries(a.answer)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ; ');
    }
    return String(a.answer);
  }

  function buildTextReport() {
    const p = buildResultPayload();
    const lines = [];
    lines.push('╔════════════════════════════════════════════════════╗');
    lines.push('║  CIRCUIT.LAB — نتائج الاختبار القبلي              ║');
    lines.push('╚════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push(`الطالب        : ${p.student.name}`);
    lines.push(`الصف/الشعبة   : ${p.student.grade}`);
    if (p.student.id) lines.push(`الرقم التعريفي: ${p.student.id}`);
    if (p.student.school) lines.push(`المعلم/المدرسة: ${p.student.school}`);
    lines.push(`تاريخ البدء   : ${p.meta.startedAt}`);
    lines.push(`تاريخ التسليم : ${p.meta.submittedAt}`);
    lines.push(`المدة المستغرقة: ${formatDuration(p.meta.durationSeconds)}`);
    lines.push(`الأسئلة المُجابة: ${p.score.answered} / ${p.score.total}`);
    lines.push('');
    lines.push('─'.repeat(54));
    lines.push('');
    p.answers.forEach((a, i) => {
      lines.push(`[${String(i + 1).padStart(2, '0')}] (${a.section})`);
      lines.push(`السؤال: ${a.question}`);
      lines.push(`الإجابة: ${formatAnswerForText(a)}`);
      lines.push(`الدرجة: ${a.points}`);
      lines.push('');
    });
    return lines.join('\n');
  }

  function downloadTXT() {
    downloadFile(`${fileStem()}.txt`, buildTextReport(), 'text/plain;charset=utf-8');
    toast('تم تحميل الملف النصي');
  }

  async function copyToClipboard() {
    const text = buildTextReport();
    try {
      await navigator.clipboard.writeText(text);
      toast('تم نسخ الإجابات إلى الحافظة');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('تم نسخ الإجابات إلى الحافظة');
    }
  }

  function emailResults() {
    const cfg = getTeacherConfig();
    const to = cfg.email || '';
    const subject = `اختبار قبلي — ${state.student.name} — ${state.student.grade}`;
    const body = buildTextReport();
    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  function restartAll() {
    confirmModal({
      title: 'اختبار جديد لطالب آخر؟',
      message: 'سيتم مسح الإجابات الحالية من الجهاز.',
      onConfirm: () => {
        clearSession();
        location.reload();
      }
    });
  }

  /* ========================================================
     MODAL
  ======================================================== */
  let modalOnConfirm = null;

  function confirmModal({ title, message, warning, onConfirm }) {
    $('#modal-title').textContent = title;
    $('#modal-message').textContent = message;
    const w = $('#modal-warning');
    if (warning) {
      w.textContent = warning;
      w.classList.remove('hidden');
    } else {
      w.classList.add('hidden');
    }
    modalOnConfirm = onConfirm;
    $('#modal-confirm').classList.remove('hidden');
    $('#modal-confirm').parentElement.classList.remove('hidden');
    $('#modal-confirm').closest('.modal').classList.remove('hidden');
  }

  function closeModal() {
    $('#modal-confirm').closest('.modal').classList.add('hidden');
    modalOnConfirm = null;
  }

  /* ========================================================
     TOAST
  ======================================================== */
  let toastTimer = null;
  function toast(message, type) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.toggle('toast--error', type === 'error');
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  /* ========================================================
     UTIL
  ======================================================== */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ========================================================
     EVENT WIRING
  ======================================================== */
  function bindGlobal() {
    // Nav buttons
    $('#btn-prev').addEventListener('click', () => goTo(state.currentIndex - 1));
    $('#btn-next').addEventListener('click', () => {
      if (state.currentIndex === state.questions.length - 1) {
        askFinish();
      } else {
        goTo(state.currentIndex + 1);
      }
    });
    $('#btn-finish').addEventListener('click', askFinish);

    // Results actions
    $('#btn-download-json').addEventListener('click', downloadJSON);
    $('#btn-download-csv').addEventListener('click', downloadCSV);
    $('#btn-download-txt').addEventListener('click', downloadTXT);
    $('#btn-copy').addEventListener('click', copyToClipboard);
    $('#btn-email').addEventListener('click', emailResults);
    $('#btn-restart').addEventListener('click', restartAll);

    // Teacher config
    $('#btn-save-email').addEventListener('click', () => {
      const email = $('#teacher-email').value.trim();
      setTeacherConfig({ email });
      toast(email ? 'تم حفظ بريد المعلم' : 'تم مسح البريد');
    });

    // Modal
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#modal-confirm').addEventListener('click', () => {
      const cb = modalOnConfirm;
      closeModal();
      if (cb) cb();
    });
    document.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
      // Keyboard nav in quiz
      if (state.screen === 'quiz' && !isTypingTarget(e.target)) {
        if (e.key === 'ArrowLeft') goTo(state.currentIndex + 1); // RTL: left = next
        if (e.key === 'ArrowRight') goTo(state.currentIndex - 1);
      }
    });
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const t = (el.tagName || '').toLowerCase();
    return t === 'input' || t === 'textarea' || t === 'select';
  }

  function askFinish() {
    const total = state.questions.length;
    const answered = state.questions.filter((q) => hasAnswer(q.id)).length;
    const unanswered = total - answered;
    confirmModal({
      title: 'إنهاء الاختبار وتسليم الإجابات؟',
      message: 'لن تستطيع تعديل إجاباتك بعد التسليم.',
      warning: unanswered > 0 ? `تنبيه: يوجد ${unanswered} سؤال لم يُجَب عليه بعد.` : '',
      onConfirm: () => finishQuiz(false)
    });
  }

  /* ========================================================
     BOOT
  ======================================================== */
  function init() {
    initWelcome();
    bindGlobal();
    showScreen('welcome');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
