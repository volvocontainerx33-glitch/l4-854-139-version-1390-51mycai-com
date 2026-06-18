(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var topButton = document.querySelector("[data-back-top]");
    if (topButton) {
      window.addEventListener("scroll", function () {
        topButton.classList.toggle("show", window.scrollY > 420);
      });
      topButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var root = panel.closest("main") || document;
      var search = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var empty = root.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var query = normalize(search && search.value);
        var yearValue = year ? year.value : "all";
        var typeValue = type ? type.value : "all";
        var regionValue = region ? region.value : "all";
        var visible = 0;

        root.querySelectorAll("[data-card]").forEach(function (card) {
          var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type].join(" ").toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (yearValue !== "all" && card.dataset.year !== yearValue) {
            ok = false;
          }
          if (typeValue !== "all" && card.dataset.type !== typeValue) {
            ok = false;
          }
          if (regionValue !== "all" && card.dataset.region !== regionValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, year, type, region].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
      apply();
    });
  });
})();
