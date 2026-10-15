(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- fire: morph the two flames between a few shapes ----------
  var SHAPES = {
    "f-out": [
      "M100 8 C118 50 168 78 160 140 C154 186 126 206 100 206 C70 206 42 186 40 140 C34 90 80 62 100 8 Z",
      "M96 14 C104 56 164 70 162 136 C158 188 128 206 100 206 C72 206 40 190 38 136 C36 86 92 70 96 14 Z",
      "M104 2 C122 44 160 84 158 142 C152 184 124 206 100 206 C74 206 44 184 42 142 C40 96 88 56 104 2 Z"
    ],
    "f-in": [
      "M100 100 C110 122 128 134 126 158 C124 180 114 190 100 190 C86 190 76 180 74 158 C72 134 92 122 100 100 Z",
      "M98 108 C106 126 126 130 126 158 C124 180 114 190 100 190 C86 190 76 180 74 158 C74 130 94 124 98 108 Z",
      "M102 96 C112 120 124 138 124 160 C122 180 114 190 100 190 C86 190 78 180 76 160 C74 136 90 118 102 96 Z"
    ],
    "f-mid": [
      "M100 52 C114 84 146 104 142 146 C139 178 122 196 100 196 C78 196 60 178 58 146 C56 108 90 90 100 52 Z",
      "M98 58 C106 90 144 98 144 146 C141 180 122 196 100 196 C78 196 58 180 56 146 C56 104 94 94 98 58 Z",
      "M102 46 C118 80 140 108 140 148 C137 180 122 196 100 196 C78 196 62 180 60 148 C58 110 88 84 102 46 Z"
    ]
  };
  var DUR = { "f-out": "1.5s", "f-mid": "1.1s", "f-in": "0.9s", "f-mid2": "1.3s", "f-mid3": "1.7s" };
  var ALIAS = { "f-mid2": "f-mid", "f-mid3": "f-mid" };
  if (!reduce) {
    Object.keys(DUR).forEach(function (cls) {
      var p = document.querySelector("." + cls);
      if (!p) return;
      var v = SHAPES[ALIAS[cls] || cls];
      var a = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      a.setAttribute("attributeName", "d");
      a.setAttribute("dur", DUR[cls]);
      a.setAttribute("repeatCount", "indefinite");
      a.setAttribute("values", [v[0], v[1], v[2], v[1], v[0]].join(";"));
      a.setAttribute("calcMode", "spline");
      a.setAttribute("keyTimes", "0;0.25;0.5;0.75;1");
      a.setAttribute("keySplines", ".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1");
      p.appendChild(a);
    });
  }

  // ---------- mouse parallax for the hero objects ----------
  var scene = document.querySelector(".scene");
  if (scene && !reduce && window.matchMedia("(hover: hover)").matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!run) { run = true; requestAnimationFrame(step); }
    });
    var step = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      scene.style.setProperty("--mx", cx.toFixed(3));
      scene.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(step); else run = false;
    };
  }

  // ---------- light snow ----------
  var c = document.getElementById("snow");
  if (!c) return;
  var ctx = c.getContext("2d");
  var w = 0, h = 0, flakes = [], last = 0;
  var WIND = 0.12, BUCKETS = 3;

  function make(init, z) {
    z = z === undefined ? Math.random() : z;
    return {
      x: Math.random() * (w + 60) - 30, y: init ? Math.random() * h : -12, z: z,
      r: 0.9 + z * z * 2.4, vy: 24 + z * 46, ph: Math.random() * 6.28, sw: 8 + Math.random() * 22, f: 0.35 + Math.random() * 0.7
    };
  }
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(170, Math.max(70, (w * h) / 11000)));
    flakes = [];
    for (var i = 0; i < n; i++) flakes.push(make(true));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var b = 0; b < BUCKETS; b++) {
      var z = (b + 0.5) / BUCKETS;
      ctx.fillStyle = "rgba(244, 246, 248, " + (0.3 + z * 0.5).toFixed(3) + ")";
      ctx.beginPath();
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        if (Math.min(BUCKETS - 1, Math.floor(f.z * BUCKETS)) !== b) continue;
        var x = f.x + Math.sin(f.ph) * f.sw;
        ctx.moveTo(x + f.r, f.y);
        ctx.arc(x, f.y, f.r, 0, 6.2832);
      }
      ctx.fill();
    }
  }
  function tick(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.vy * dt; f.x += f.vy * dt * WIND; f.ph += f.f * dt;
      if (f.y - f.r > h) flakes[i] = make(false, f.z);
    }
    draw();
    requestAnimationFrame(tick);
  }
  size();
  window.addEventListener("resize", size);
  if (reduce) { draw(); } else { requestAnimationFrame(tick); }
})();
