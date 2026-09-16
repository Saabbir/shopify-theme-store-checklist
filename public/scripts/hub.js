/* hub.js — show last-run progress from LocalStorage on hub cards. */
(function () {
  'use strict';

  function scorecardPct() {
    try {
      var raw = localStorage.getItem('scorecard-state-v1');
      var state = raw ? JSON.parse(raw) : {};
      var rows = Object.keys(state);
      if (!rows.length) return null;
      var pass = 0, na = 0, fail = 0;
      rows.forEach(function (k) {
        if (state[k] === 'pass') pass++;
        else if (state[k] === 'na') na++;
        else if (state[k] === 'fail') fail++;
      });
      // Approximate using answered items only when total unknown on hub
      var answered = pass + fail + na;
      if (!answered) return 0;
      var applicable = pass + fail;
      return applicable ? Math.round((pass / applicable) * 100) : 100;
    } catch (e) { return null; }
  }

  function tickPct(key) {
    try {
      var raw = localStorage.getItem(key);
      var state = raw ? JSON.parse(raw) : {};
      var keys = Object.keys(state).filter(function (k) { return state[k]; });
      // Without totals on hub, show checked count as "N done"
      return keys.length ? keys.length + ' done' : null;
    } catch (e) { return null; }
  }

  var map = {
    scorecard: function () {
      var pct = scorecardPct();
      return pct === null ? 'Not started' : pct + '%';
    },
    checklist: function () {
      var v = tickPct('checklist-state-v2');
      return v || 'Not started';
    },
    packaging: function () {
      var v = tickPct('packaging-state-v1');
      return v || 'Not started';
    }
  };

  document.querySelectorAll('[data-hub-pct]').forEach(function (el) {
    var kind = el.getAttribute('data-hub-pct');
    if (map[kind]) el.textContent = map[kind]();
  });
})();
