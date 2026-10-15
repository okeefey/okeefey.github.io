(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wipe = document.querySelector(".wipe");

  // Slide the incoming colour panel away on arrival
  function enter() {
    if (!root.classList.contains("entering")) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.remove("entering"); });
    });
  }
  window.addEventListener("load", enter);
  setTimeout(enter, 1500); // safety net
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && wipe) wipe.classList.remove("on"); // back button
  });

  // Page transition: colour panel wipes up, then navigate
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-wipe]");
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var color = a.getAttribute("data-wipe");
    try { sessionStorage.setItem("wipe", color); } catch (err) {}
    wipe.style.setProperty("--wipe", color);
    wipe.classList.add("on");
    setTimeout(function () { window.location.href = a.href; }, 520);
  });

  // Reveal rows as they scroll into view
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Soft glow that follows the cursor on the home page
  var glow = document.querySelector(".glow");
  if (glow && !reduce && window.matchMedia("(hover: hover)").matches) {
    var tx = 0, ty = 0, x = 0, y = 0, running = false;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(tick); }
    });
    function tick() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      glow.style.setProperty("--x", x + "px");
      glow.style.setProperty("--y", y + "px");
      if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) requestAnimationFrame(tick);
      else running = false;
    }
  }
})();
