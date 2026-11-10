/* Velorapp site motion. Everything here is progressive: the page reads fine without it. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // Header: solid once the page moves.
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal.
  var revealables = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  // Hero cloud: tiles drift toward the pointer, deeper tiles further.
  var cloud = document.querySelector("[data-cloud]");
  if (cloud && !reduce && finePointer) {
    var tiles = Array.prototype.slice.call(cloud.querySelectorAll("[data-depth]"));
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function step() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      tiles.forEach(function (t) {
        var k = parseFloat(t.getAttribute("data-depth")) || 0;
        t.style.setProperty("--px", (cx * k * 46).toFixed(2) + "px");
        t.style.setProperty("--py", (cy * k * 46).toFixed(2) + "px");
      });
      raf = (Math.abs(tx - cx) > 0.0008 || Math.abs(ty - cy) > 0.0008) ? requestAnimationFrame(step) : 0;
    }
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  // App cards: a gentle 3D tilt and a light that follows the pointer.
  if (!reduce && finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
        card.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
        card.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  // Copy buttons for the support address.
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.textContent;
      function done() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1600); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    });
  });
})();
