/* site.js — shared across every page: theme, mobile nav, scrollspy, search, back-to-top, print. */
(function () {
  'use strict';
  var root = document.documentElement;

  var THEME_KEY = 'site-theme';
  function applyTheme(t) { root.setAttribute('data-theme', t); }
  var savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(cur);
      localStorage.setItem(THEME_KEY, cur);
    });
  }

  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  var menuBtn = document.getElementById('mobile-menu-btn');
  function openSidebar() { if (sidebar) sidebar.classList.add('open'); if (scrim) scrim.classList.add('open'); }
  function closeSidebar() { if (sidebar) sidebar.classList.remove('open'); if (scrim) scrim.classList.remove('open'); }
  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (scrim) scrim.addEventListener('click', closeSidebar);
  document.querySelectorAll('#sidebar .toc-nav a').forEach(function (a) { a.addEventListener('click', closeSidebar); });

  var progressBar = document.getElementById('reading-progress');
  function updateProgress() {
    var main = document.getElementById('main');
    if (!main || !progressBar) return;
    var scrollTop = window.scrollY;
    var docHeight = main.offsetHeight + main.offsetTop - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    progressBar.style.width = pct + '%';
  }

  var spyTargets = Array.prototype.slice.call(document.querySelectorAll('#main [id]'));
  var navGroups = Array.prototype.slice.call(document.querySelectorAll('.toc-nav, #page-toc-list'));

  function setActive(id) {
    navGroups.forEach(function (group) {
      group.querySelectorAll('a[data-id]').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-id') === id);
      });
    });
  }

  var backToTop = document.getElementById('back-to-top');
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        spy();
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 700);
        ticking = false;
      });
      ticking = true;
    }
  }

  function spy() {
    var offset = 120;
    var current = null;
    for (var i = 0; i < spyTargets.length; i++) {
      var rect = spyTargets[i].getBoundingClientRect();
      if (rect.top - offset <= 0) current = spyTargets[i].id;
    }
    if (!current && spyTargets.length) current = spyTargets[0].id;
    if (current) {
      setActive(current);
      var sidebarLink = document.querySelector('#sidebar .toc-nav a[data-id="' + current + '"]');
      if (sidebarLink && sidebar) {
        var lr = sidebarLink.getBoundingClientRect(), sr = sidebar.getBoundingClientRect();
        if (lr.top < sr.top || lr.bottom > sr.bottom) sidebarLink.scrollIntoView({ block: 'nearest' });
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('.toc-nav a[data-id], #page-toc-list a[data-id]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('data-id');
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      }
    });
  });

  if (backToTop) backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  function flashSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
  window.flashSection = flashSection;

  if (window.location.hash) {
    var hashId = window.location.hash.slice(1);
    setTimeout(function () {
      var el = document.getElementById(hashId);
      if (el) { el.scrollIntoView({ block: 'start' }); flashSection(hashId); }
    }, 60);
  }

  var printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      // Reveal filtered rows so the printout is a full snapshot
      document.querySelectorAll('.score-row.is-hidden, .reject-card.is-hidden').forEach(function (el) {
        el.classList.add('print-was-hidden');
        el.classList.remove('is-hidden');
      });
      window.print();
    });
  }
  window.addEventListener('afterprint', function () {
    document.querySelectorAll('.print-was-hidden').forEach(function (el) {
      el.classList.add('is-hidden');
      el.classList.remove('print-was-hidden');
    });
  });

  var overlay = document.getElementById('search-overlay');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var searchBtn = document.getElementById('search-open-btn');
  if (!overlay || !input || !resultsEl) return;

  var base = window.SITE_BASE || '/';
  var path = window.location.pathname;
  function pageLabel(page) {
    if (!page) return '';
    if (page.indexOf('checklist') !== -1) return 'Checklist';
    if (page.indexOf('packaging') !== -1) return 'Packaging';
    if (page.indexOf('rejection') !== -1) return 'Rejections';
    if (page.indexOf('scorecard') !== -1) return 'Scorecard';
    return 'Hub';
  }

  function openSearch() {
    overlay.classList.add('open');
    input.value = '';
    renderResults('');
    setTimeout(function () { input.focus(); }, 30);
  }
  function closeSearch() { overlay.classList.remove('open'); }
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });

  var selectedIdx = -1;
  var currentResults = [];
  function escapeHtml(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function samePage(page) {
    var normalized = (page || '').replace(/\/$/, '') || '/';
    var here = path.replace(/\/$/, '') || '/';
    return normalized === here || here.endsWith(normalized.replace(base.replace(/\/$/, ''), ''));
  }

  function renderResults(query) {
    query = query.trim().toLowerCase();
    selectedIdx = -1;
    var index = window.SEARCH_INDEX || [];
    if (!query) {
      resultsEl.innerHTML = '<div class="search-empty">Type to search across all ' + index.length + ' entries on this site…</div>';
      currentResults = [];
      return;
    }
    var matches = index.filter(function (item) {
      return item.text.indexOf(query) !== -1 || item.title.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 25);
    currentResults = matches;
    if (!matches.length) {
      resultsEl.innerHTML = '<div class="search-empty">No results for “' + escapeHtml(query) + '”</div>';
      return;
    }
    resultsEl.innerHTML = matches.map(function (m, i) {
      var idx = m.text.indexOf(query);
      var snippet = idx !== -1 ? m.text.slice(Math.max(0, idx - 40), idx + 80) : m.text.slice(0, 100);
      var reg = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      snippet = escapeHtml(snippet).replace(reg, '<mark>$1</mark>');
      return '<div class="search-result" data-idx="' + i + '">' +
        '<div class="sr-title">' + (m.num ? '<span class="sr-num">' + m.num + '</span>' : '') + escapeHtml(m.title) + '<span class="sr-page">' + pageLabel(m.page) + '</span></div>' +
        '<div class="sr-snippet">…' + snippet + '…</div></div>';
    }).join('');
    resultsEl.querySelectorAll('.search-result').forEach(function (el, i) {
      el.addEventListener('click', function () { goToResult(matches[i]); });
    });
  }

  function goToResult(m) {
    closeSearch();
    if (m.page && !samePage(m.page)) {
      window.location.href = m.page.replace(/\/?$/, '/') + '#' + m.id;
      return;
    }
    var el = document.getElementById(m.id);
    if (el) {
      setTimeout(function () { el.scrollIntoView({ block: 'start' }); flashSection(m.id); history.replaceState(null, '', '#' + m.id); }, 30);
    }
  }

  input.addEventListener('input', function () { renderResults(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, currentResults.length - 1); highlightSel(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, 0); highlightSel(); }
    if (e.key === 'Enter' && selectedIdx >= 0 && currentResults[selectedIdx]) { goToResult(currentResults[selectedIdx]); }
  });
  function highlightSel() {
    resultsEl.querySelectorAll('.search-result').forEach(function (el, i) {
      el.classList.toggle('sel', i === selectedIdx);
      if (i === selectedIdx) el.scrollIntoView({ block: 'nearest' });
    });
  }
}());
