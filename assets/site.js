(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (button && menu) {
      button.addEventListener("click", function() {
        menu.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".slider-dot"));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener("click", function() {
          showSlide(dotIndex);
        });
      });

      showSlide(0);
      if (slides.length > 1) {
        window.setInterval(function() {
          showSlide(index + 1);
        }, 5200);
      }
    }

    var searchInput = document.querySelector("[data-site-search]");
    var searchResults = document.querySelector("[data-search-results]");
    if (searchInput && searchResults && Array.isArray(window.SITE_SEARCH_DATA)) {
      function renderResults(items) {
        searchResults.innerHTML = "";
        items.slice(0, 24).forEach(function(item) {
          var link = document.createElement("a");
          link.className = "search-result-card";
          link.href = item.link;
          link.innerHTML = [
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
            '<span><strong>' + escapeHtml(item.title) + '</strong><br>',
            '<small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</small></span>'
          ].join("");
          searchResults.appendChild(link);
        });
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function(ch) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
          }[ch];
        });
      }

      searchInput.addEventListener("input", function() {
        var value = searchInput.value.trim().toLowerCase();
        if (!value) {
          searchResults.innerHTML = "";
          return;
        }
        var found = window.SITE_SEARCH_DATA.filter(function(item) {
          return [item.title, item.year, item.region, item.type, item.genre, item.category]
            .join(" ")
            .toLowerCase()
            .indexOf(value) !== -1;
        });
        renderResults(found);
      });
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterYear = document.querySelector("[data-filter-year]");
    var filterType = document.querySelector("[data-filter-type]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (filterCards.length && (filterInput || filterYear || filterType)) {
      function applyFilters() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = filterYear ? filterYear.value : "";
        var type = filterType ? filterType.value : "";
        filterCards.forEach(function(card) {
          var text = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var okKeyword = !keyword || text.toLowerCase().indexOf(keyword) !== -1;
          var okYear = !year || cardYear === year;
          var okType = !type || cardType === type;
          card.classList.toggle("hidden-card", !(okKeyword && okYear && okType));
        });
      }

      [filterInput, filterYear, filterType].forEach(function(control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    }
  });
})();
