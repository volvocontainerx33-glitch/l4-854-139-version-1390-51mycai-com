
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scopeId = panel.getAttribute("data-filter-panel");
      var scope = document.querySelector('[data-filter-scope="' + scopeId + '"]');
      if (!scope) {
        return;
      }
      var input = panel.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector('[data-empty-state="' + scopeId + '"]');
      var activeType = "all";

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var typeMatched = activeType === "all" || type.indexOf(activeType) !== -1;
          var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
          var matched = typeMatched && keywordMatched;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeType = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function start() {
      if (cover) {
        cover.hidden = true;
      }
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== url) {
          video.setAttribute("src", url);
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (video.getAttribute("src") !== url) {
        video.setAttribute("src", url);
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
