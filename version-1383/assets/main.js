(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        restart();
    }

    function setupSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector(".site-search");
            var select = scope.querySelector(".filter-select");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!input && !select) {
                return;
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var category = select ? select.value : "";
                cards.forEach(function (card) {
                    var haystack = card.getAttribute("data-search") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedCategory = !category || cardCategory === category;
                    card.classList.toggle("is-hidden-card", !(matchedText && matchedCategory));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector(".movie-player");
        var cover = document.querySelector(".player-cover");
        if (!video || !source) {
            return;
        }
        var attached = false;

        function bind() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            bind();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
