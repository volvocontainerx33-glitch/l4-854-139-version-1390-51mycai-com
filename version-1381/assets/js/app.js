(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var forms = $all('[data-global-search]');
    if (!forms.length || !window.SITE_MOVIES) {
      return;
    }
    forms.forEach(function (form) {
      var input = $('input[type="search"]', form);
      var results = $('[data-search-results]', form.parentElement) || form.nextElementSibling;
      if (!input || !results) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          results.hidden = true;
          results.innerHTML = '';
          return;
        }
        var matches = window.SITE_MOVIES.filter(function (movie) {
          return movie.text.indexOf(query) !== -1;
        }).slice(0, 12);
        if (!matches.length) {
          results.hidden = false;
          results.innerHTML = '<p>没有找到匹配影片</p>';
          return;
        }
        results.hidden = false;
        results.innerHTML = matches.map(function (movie) {
          return '<a href="' + movie.url + '"><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span></a>';
        }).join('');
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
      input.addEventListener('input', render);
    });
  }

  function initFilters() {
    var boxes = $all('[data-filter-box]');
    boxes.forEach(function (box) {
      var scope = box.parentElement;
      var cards = $all('[data-card]', scope);
      var keyword = $('[data-filter-keyword]', box);
      var year = $('[data-filter-year]', box);
      var region = $('[data-filter-region]', box);
      var type = $('[data-filter-type]', box);
      var count = $('[data-filter-count]', scope);

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          if (r && card.dataset.region !== r) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      [keyword, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var trigger = document.getElementById('player-trigger');
    if (!video || !streamUrl) {
      return;
    }
    var hls = null;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }

    function play() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function toggleByVideo(event) {
      if (event.target !== video) {
        return;
      }
      if (video.paused) {
        play();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', toggleByVideo);
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initFilters();
  });
})();
