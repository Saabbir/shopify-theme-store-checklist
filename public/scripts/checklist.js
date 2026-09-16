/* checklist.js — tick lists with stable ids, export, optional storage key override. */
(function () {
  'use strict';
  var meta = document.querySelector('[data-checklist-key]');
  var STORAGE_KEY = (meta && meta.getAttribute('data-checklist-key')) || 'checklist-state-v2';
  var TITLE = (meta && meta.getAttribute('data-checklist-title')) || 'Development Checklist';
  var resetBtn = document.getElementById('reset-checks-btn');
  var exportBtn = document.getElementById('export-checklist-btn');

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
  var allItems = [];

  document.querySelectorAll('.check-list.click-list[data-sec]').forEach(function (list) {
    var secId = list.getAttribute('data-sec');
    list.querySelectorAll('li[data-id]').forEach(function (li) {
      var key = li.getAttribute('data-id');
      allItems.push({ li: li, secId: secId, key: key });
      if (state[key]) li.classList.add('checked');
      li.addEventListener('click', function () {
        li.classList.toggle('checked');
        state[key] = li.classList.contains('checked');
        if (!state[key]) delete state[key];
        saveState();
        updateProgress();
      });
    });
  });

  function updateProgress() {
    var secs = {};
    allItems.forEach(function (x) { secs[x.secId] = true; });
    var totalAll = 0, doneAll = 0;

    Object.keys(secs).forEach(function (sid) {
      var items = allItems.filter(function (x) { return x.secId === sid; });
      var done = items.filter(function (x) { return x.li.classList.contains('checked'); }).length;
      var total = items.length;
      totalAll += total;
      doneAll += done;

      var sp = document.getElementById('sp-' + sid);
      var sc = document.getElementById('sc-' + sid);
      var navA = document.querySelector('#sidebar .toc-nav a[data-id="' + sid + '"]');
      if (sp) sp.textContent = total ? done + '/' + total : '';
      if (sc) sc.innerHTML = '<strong>' + done + '</strong> / ' + total + ' completed';
      if (navA) navA.classList.toggle('sec-done', done === total && total > 0);
    });

    var pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;
    var bar = document.getElementById('global-bar');
    var lbl = document.getElementById('global-pct');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '%';
  }

  updateProgress();

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('Reset all checklist progress?')) return;
      allItems.forEach(function (x) {
        x.li.classList.remove('checked');
        delete state[x.key];
      });
      saveState();
      updateProgress();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      var lines = ['# ' + TITLE, '', '_Exported ' + new Date().toISOString().slice(0, 10) + '_', ''];
      document.querySelectorAll('.section').forEach(function (sec) {
        var h2 = sec.querySelector('h2');
        var num = sec.querySelector('.section-num');
        if (!h2) return;
        lines.push('## ' + (num ? num.textContent.trim() + ' ' : '') + h2.textContent.trim());
        lines.push('');
        sec.querySelectorAll('li[data-id]').forEach(function (li) {
          var mark = li.classList.contains('checked') ? '[x]' : '[ ]';
          var text = li.querySelector('.item-text');
          lines.push('- ' + mark + ' ' + (text ? text.textContent.trim() : ''));
        });
        lines.push('');
      });
      var blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = TITLE.toLowerCase().replace(/\s+/g, '-') + '.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
})();
