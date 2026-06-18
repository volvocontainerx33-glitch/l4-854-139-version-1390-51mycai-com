(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector("[data-play-overlay]");
      var button = box.querySelector("[data-play-button]");
      var stream = box.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          play();
        });
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("emptied", function () {
          if (hls && typeof hls.destroy === "function") {
            hls.destroy();
          }
          hls = null;
          attached = false;
        });
      }
    });
  });
})();
