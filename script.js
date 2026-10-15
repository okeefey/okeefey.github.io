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

  // Reveal rows as they scroll into view (project pages)
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

  // Book home page: the right-hand plate follows the contents entry you point at
  var toc = document.querySelector(".toc");
  if (toc) {
    var rows = toc.querySelectorAll("a[data-plate]");
    var plates = document.querySelectorAll(".plate");
    var pgno = document.querySelector(".pgno");
    var single = window.matchMedia("(max-width: 820px), (hover: none)");

    function show(id, idx) {
      plates.forEach(function (p) { p.classList.toggle("on", p.id === id); });
      rows.forEach(function (r) { r.classList.toggle("on", r.getAttribute("data-plate") === id); });
      if (pgno && idx) pgno.textContent = "[ " + idx + " ]";
    }
    rows.forEach(function (r) {
      var go = function () { if (!single.matches) show(r.getAttribute("data-plate"), r.getAttribute("data-idx")); };
      r.addEventListener("mouseenter", go);
      r.addEventListener("focus", go);
      // About and Contact only change the page; on one-page layouts they scroll to their section instead
      if (r.getAttribute("href").charAt(0) === "#") {
        r.addEventListener("click", function (e) { if (!single.matches) { e.preventDefault(); go(); } });
      }
    });
    if (!single.matches) {
      var start = document.querySelector(".plate.on");
      var startRow = start && toc.querySelector('a[data-plate="' + start.id + '"]');
      if (startRow) show(start.id, startRow.getAttribute("data-idx"));
    }
  }
})();
