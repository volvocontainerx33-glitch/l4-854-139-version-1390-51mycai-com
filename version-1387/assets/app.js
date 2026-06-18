(function() {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 420) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5000);
        }

        function resetAuto() {
            if (timer) {
                window.clearInterval(timer);
            }
            startAuto();
        }

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(current - 1);
                resetAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                showSlide(current + 1);
                resetAuto();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                resetAuto();
            });
        });

        showSlide(0);
        startAuto();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var search = scope.querySelector('[data-search-input]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var categoryFilter = scope.querySelector('[data-category-filter]');
        var empty = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(search ? search.value : '');
            var typeValue = normalize(typeFilter ? typeFilter.value : '');
            var categoryValue = normalize(categoryFilter ? categoryFilter.value : '');
            var visibleCount = 0;

            cards.forEach(function(card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
                var type = normalize(card.getAttribute('data-type'));
                var category = normalize(card.getAttribute('data-category'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && type !== typeValue) {
                    matched = false;
                }

                if (categoryValue && category !== categoryValue) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [search, typeFilter, categoryFilter].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });

    var playerFrame = document.querySelector('[data-player-frame]');

    if (playerFrame) {
        var video = playerFrame.querySelector('video');
        var overlay = playerFrame.querySelector('[data-player-overlay]');
        var hlsInstance = null;

        function startPlayer() {
            if (!video) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (!video.getAttribute('src')) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.setAttribute('src', stream);
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.setAttribute('src', stream);
                }
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.controls = true;
            var playPromise = video.play();

            if (playPromise && playPromise.catch) {
                playPromise.catch(function() {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayer);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    startPlayer();
                }
            });
        }

        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
