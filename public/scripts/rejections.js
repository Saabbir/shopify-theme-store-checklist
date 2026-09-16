/* rejections.js — filter rejection cards by category. */
(function () {
  'use strict';
  var filter = 'all';
  var cards = Array.prototype.slice.call(document.querySelectorAll('.reject-card'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('#reject-filters .filter-btn'));

  function apply() {
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-category');
      card.classList.toggle('is-hidden', filter !== 'all' && cat !== filter);
    });
    buttons.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.getAttribute('data-filter') || 'all';
      apply();
    });
  });

  apply();
})();
