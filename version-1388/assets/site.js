(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = document.querySelector(panel.getAttribute("data-filter-panel")) || document;
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .ranking-item"));
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var typeMatch = !typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1;
          var yearMatch = !yearValue || haystack.indexOf(yearValue.toLowerCase()) !== -1;
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(typeMatch && yearMatch && queryMatch));
        });
      }
      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });

  window.startMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video) {
      return;
    }
    var initialized = false;
    function init() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      init();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
