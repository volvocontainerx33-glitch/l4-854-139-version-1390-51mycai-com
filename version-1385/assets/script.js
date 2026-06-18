(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = $('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  $all('[data-hero]').forEach(function (hero) {
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  $all('[data-search-scope]').forEach(function (scope) {
    var input = $('.movie-search-input', scope);
    var parent = scope.parentElement || document;
    var cards = $all('.movie-card', parent);
    var empty = $('[data-empty-state]', parent);
    var chips = $all('[data-filter-category]', scope);
    var activeCategory = 'all';

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function update() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesText = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchesCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
        var shouldShow = matchesText && matchesCategory;
        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-filter-category') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        update();
      });
    });

    update();
  });
})();
