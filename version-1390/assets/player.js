(function() {
  function initStaticPlayer(playerId, streamUrl) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var loaded = false;
    var hlsInstance = null;

    function attachStream() {
      if (loaded || !video || !streamUrl) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attachStream();
      root.classList.add("is-playing");
      if (video) {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function() {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function() {
        if (!loaded) {
          start();
        }
      });
    }
    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initStaticPlayer = initStaticPlayer;
})();
