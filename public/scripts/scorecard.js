/* scorecard.js — Pass / Fail / N/A scoring + markdown export for requirements. */
(function () {
  'use strict';
  var STORAGE_KEY = 'scorecard-state-v1';
  var FILTER_KEY = 'scorecard-filter-v1';

  function loadState() {
    try {
      var val = localStorage.getItem(STORAGE_KEY);
      return val ? JSON.parse(val) : {};
    } catch (e) { return {}; }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadState();
  var filter = localStorage.getItem(FILTER_KEY) || 'all';
  var rows = Array.prototype.slice.call(document.querySelectorAll('.score-row'));

  rows.forEach(function (row) {
    var id = row.getAttribute('data-id');
    var status = state[id] || '';
    if (status) applyStatus(row, status, false);
    row.querySelectorAll('.score-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-v');
        if (state[id] === next) next = '';
        state[id] = next || undefined;
        if (!next) delete state[id];
        applyStatus(row, next, true);
        saveState();
        updateStats();
        applyFilter();
      });
    });
  });

  function applyStatus(row, status, animate) {
    row.setAttribute('data-status', status || '');
    row.querySelectorAll('.score-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-v') === status);
    });
    if (animate) row.classList.add('flash');
  }

  function updateStats() {
    var pass = 0, fail = 0, na = 0, total = rows.length;
    var bySection = {};
    rows.forEach(function (row) {
      var sid = row.getAttribute('data-section');
      if (!bySection[sid]) bySection[sid] = { pass: 0, fail: 0, na: 0, total: 0 };
      bySection[sid].total++;
      var st = row.getAttribute('data-status') || '';
      if (st === 'pass') { pass++; bySection[sid].pass++; }
      else if (st === 'fail') { fail++; bySection[sid].fail++; }
      else if (st === 'na') { na++; bySection[sid].na++; }
    });
    var answered = pass + fail + na;
    var applicable = total - na;
    var pct = applicable ? Math.round((pass / applicable) * 100) : 0;

    setText('stat-pass', String(pass));
    setText('stat-fail', String(fail));
    setText('stat-na', String(na));
    setText('stat-open', String(total - answered));
    setText('stat-pct', pct + '%');
    var bar = document.getElementById('global-bar');
    var lbl = document.getElementById('global-pct');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '%';

    Object.keys(bySection).forEach(function (sid) {
      var s = bySection[sid];
      var el = document.getElementById('sc-' + sid);
      if (el) el.innerHTML = '<strong>' + s.pass + '</strong> pass · ' + s.fail + ' fail · ' + (s.total - s.pass - s.fail - s.na) + ' open';
      var navA = document.querySelector('#sidebar .toc-nav a[data-id="' + sid + '"]');
      var sp = document.getElementById('sp-' + sid);
      if (sp) sp.textContent = s.pass + '/' + (s.total - s.na || s.total);
      if (navA) navA.classList.toggle('sec-done', s.pass + s.na === s.total && s.fail === 0 && s.total > 0);
    });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function applyFilter() {
    rows.forEach(function (row) {
      var st = row.getAttribute('data-status') || '';
      var hide = false;
      if (filter === 'open') hide = !!st;
      else if (filter === 'fail') hide = st !== 'fail';
      else if (filter === 'pass') hide = st !== 'pass';
      row.classList.toggle('is-hidden', hide);
    });
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
  }

  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.getAttribute('data-filter') || 'all';
      localStorage.setItem(FILTER_KEY, filter);
      applyFilter();
    });
  });

  var resetBtn = document.getElementById('reset-scorecard-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('Reset all scorecard progress?')) return;
      state = {};
      saveState();
      rows.forEach(function (row) { applyStatus(row, '', false); });
      updateStats();
      applyFilter();
    });
  }

  var exportBtn = document.getElementById('export-scorecard-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      var lines = [
        '# Theme Store Submission Scorecard',
        '',
        '_Exported ' + new Date().toISOString().slice(0, 10) + '_',
        ''
      ];
      var sections = Array.prototype.slice.call(document.querySelectorAll('.section[data-scorecard]'));
      sections.forEach(function (sec) {
        var title = sec.querySelector('h2');
        var num = sec.querySelector('.section-num');
        lines.push('## ' + (num ? num.textContent.trim() + ' ' : '') + (title ? title.textContent.trim() : sec.id));
        lines.push('');
        sec.querySelectorAll('.score-row').forEach(function (row) {
          var st = row.getAttribute('data-status') || 'open';
          var mark = st === 'pass' ? '[x]' : st === 'fail' ? '[!]' : st === 'na' ? '[-]' : '[ ]';
          var label = row.querySelector('.label');
          var detail = row.querySelector('.detail');
          lines.push('- ' + mark + ' **' + (label ? label.textContent.trim() : '') + '**' + (st === 'fail' ? ' — FAIL' : st === 'na' ? ' — N/A' : ''));
          if (detail && detail.textContent.trim()) lines.push('  - ' + detail.textContent.trim());
        });
        lines.push('');
      });
      lines.push('---');
      lines.push('Legend: `[x]` pass · `[!]` fail · `[-]` N/A · `[ ]` open');
      var blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'theme-store-scorecard.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  updateStats();
  applyFilter();
})();
