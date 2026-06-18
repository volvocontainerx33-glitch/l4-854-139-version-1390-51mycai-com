(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
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
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initSearch() {
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var status = document.querySelector("[data-search-status]");
        var empty = document.querySelector("[data-empty-state]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
        var activeCategory = "";

        if (input) {
            input.value = keyword;
            input.addEventListener("input", function () {
                keyword = input.value.trim();
                filterCards();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeCategory = button.getAttribute("data-filter-category") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                filterCards();
            });
        });

        function haystack(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year")
            ].join(" ").toLowerCase();
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }
            var query = keyword.toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = haystack(card);
                var matchKeyword = !query || text.indexOf(query) !== -1;
                var matchCategory = !activeCategory || text.indexOf(activeCategory.toLowerCase()) !== -1;
                var show = matchKeyword && matchCategory;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (status) {
                if (keyword && activeCategory) {
                    status.textContent = "当前筛选：" + keyword + " · " + activeCategory;
                } else if (keyword) {
                    status.textContent = "当前筛选：" + keyword;
                } else if (activeCategory) {
                    status.textContent = "当前筛选：" + activeCategory;
                } else {
                    status.textContent = "浏览全部影片";
                }
            }
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        filterCards();
    }

    function initPlayer() {
        var box = document.querySelector("[data-player]");
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var overlay = box.querySelector("[data-play]");
        var source = box.getAttribute("data-source");
        var loaded = false;
        var hlsInstance = null;

        function attachSource() {
            if (loaded || !video || !source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initSearch();
        initPlayer();
    });
})();
