(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
    hydrateSearchFromUrl();
  });

  function initMobileMenu() {
    var button = document.querySelector(".js-mobile-menu");
    var nav = document.querySelector(".js-mobile-nav");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        activate(next);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var items = Array.prototype.slice.call(section.querySelectorAll(".js-filter-item"));
      var input = panel.querySelector(".js-search-input");
      var yearSelect = panel.querySelector(".js-year-filter");
      var regionSelect = panel.querySelector(".js-region-filter");
      var reset = panel.querySelector(".js-reset-filter");
      var count = panel.querySelector(".js-count");
      var empty = section.querySelector(".js-empty-state");

      populateSelect(yearSelect, uniqueValues(items, "year"), "全部年份");
      populateSelect(regionSelect, uniqueValues(items, "region"), "全部地区");

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-search"),
            item.getAttribute("data-year"),
            item.getAttribute("data-region"),
            item.getAttribute("data-category")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || item.getAttribute("data-year") === year;
          var matchRegion = !region || item.getAttribute("data-region") === region;
          var show = matchKeyword && matchYear && matchRegion;
          item.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function hydrateSearchFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (!q) {
      return;
    }

    var input = document.querySelector(".js-search-input");
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event("input"));
    }
  }

  function uniqueValues(items, key) {
    var seen = Object.create(null);
    items.forEach(function (item) {
      var value = item.getAttribute("data-" + key);
      if (value) {
        seen[value] = true;
      }
    });
    return Object.keys(seen).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function populateSelect(select, values, firstLabel) {
    if (!select) {
      return;
    }
    select.innerHTML = "";

    var first = document.createElement("option");
    first.value = "";
    first.textContent = firstLabel;
    select.appendChild(first);

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initPlayers() {
    var players = document.querySelectorAll(".js-player");
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-play-button");
      var src = box.getAttribute("data-src");
      var loaded = false;
      var hls = null;

      if (!video || !button || !src) {
        return;
      }

      function bindSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function playVideo() {
        bindSource();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          box.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
}());
