/* checklist.js — clickable QA checklist with persisted progress. */
(function () {
  'use strict';
  var STORAGE_KEY = 'checklist-state';
  var resetBtn = document.getElementById('reset-checks-btn');

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
  var itemCounter = {};

  document.querySelectorAll('.check-list.click-list[data-sec]').forEach(function (list) {
    var secId = list.getAttribute('data-sec');
    if (!itemCounter[secId]) itemCounter[secId] = 0;
    list.querySelectorAll('li').forEach(function (li) {
      var key = secId + ':' + (itemCounter[secId]++);
      allItems.push({ li: li, secId: secId, key: key });
      if (state[key]) li.classList.add('checked');
      li.addEventListener('click', function () {
        li.classList.toggle('checked');
        state[key] = li.classList.contains('checked');
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
        state[x.key] = false;
      });
      saveState();
      updateProgress();
    });
  }
})();
