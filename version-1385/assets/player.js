(function () {
  function loadPlayer(stage) {
    var video = stage.querySelector('video');
    var cover = stage.querySelector('.player-cover');
    var source = stage.getAttribute('data-video');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlay() {
      attachSource();
      stage.classList.add('is-playing');
      video.setAttribute('controls', 'controls');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          stage.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        startPlay();
      });
    }

    stage.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('button')) {
        return;
      }
      startPlay();
    });

    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      stage.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(loadPlayer);
})();
