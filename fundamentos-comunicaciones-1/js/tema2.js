// Simuladores del Tema II (señales y sistemas)
(function () {
  "use strict";
  const C = window.Course, M = C.M, Plot = C.Plot;
  const $ = function (id) { return document.getElementById(id); };
  const num = function (id) { return parseFloat($(id).value); };
  const on = function (ids, fn) { ids.forEach(function (id) { const e = $(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); };
  const linspace = function (a, b, n) { const r = []; for (let i = 0; i < n; i++) r.push(a + (b - a) * i / (n - 1)); return r; };
  const deg = function (r) { return r * 180 / Math.PI; };

  // Ejecuta un bucle de animación solo mientras el elemento está visible
  function animator(el, step) {
    let running = true, visible = false, last = null, raf = null;
    function frame(ts) {
      if (last === null) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      step(dt);
      raf = (running && visible) ? requestAnimationFrame(frame) : null;
    }
    function kick() { if (running && visible && !raf) { last = null; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(el);
    return { toggle: function () { running = !running; kick(); return running; }, set: function (v) { running = v; kick(); }, get running() { return running; } };
  }

  // ---------------------------------------------------------------- Fasor
  (function () {
    if (!$("sim-fasor")) return;
    const pz = new Plot($("fz-c1"), { xmin: -1.15, xmax: 1.15, ymin: -1.15, ymax: 1.15, aspect: 1, pad: [10, 10, 10, 10], xfmt: function () { return ""; }, yfmt: function () { return ""; }, xstep: 0.5, ystep: 0.5 });
    const pa = new Plot($("fz-c2"), { xmin: -5, xmax: 5, ymin: 0, ymax: 1.2, aspect: 0.48, xstep: 1, xlabel: "f (Hz)", ylabel: "|Cₙ|" });
    const pf = new Plot($("fz-c3"), { xmin: -5, xmax: 5, ymin: -200, ymax: 200, aspect: 0.48, xstep: 1, ystep: 90, xlabel: "f (Hz)", ylabel: "fase (°)" });
    const pt = new Plot($("fz-c4"), { xmin: 0, xmax: 1, ymin: -2.1, ymax: 2.1, aspect: 0.25, xlabel: "t (s)", ylabel: "x(t)" });
    let t = 0;
    function draw() {
      const A = num("fz-A"), f = num("fz-f"), ph = num("fz-p") * Math.PI / 180, h = A / 2;
      const th = 2 * Math.PI * f * t + ph;
      // plano complejo (escala: radio 1 = amplitud 2)
      const s = 1 / 2;
      pz.clear();
      const ctx = pz.ctx;
      ctx.strokeStyle = C.cssVar("--border"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(pz.X(0), pz.Y(0), Math.abs(pz.X(h * s) - pz.X(0)), 0, 2 * Math.PI); ctx.stroke();
      function arrow(x0, y0, x1, y1, col, w) {
        const X0 = pz.X(x0), Y0 = pz.Y(y0), X1 = pz.X(x1), Y1 = pz.Y(y1), a = Math.atan2(Y1 - Y0, X1 - X0);
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.2;
        ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X1 - 9 * Math.cos(a - 0.4), Y1 - 9 * Math.sin(a - 0.4)); ctx.lineTo(X1 - 9 * Math.cos(a + 0.4), Y1 - 9 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
      }
      const ax = h * s * Math.cos(th), ay = h * s * Math.sin(th);
      arrow(0, 0, ax, ay, C.cssVar("--s1"));
      arrow(ax, ay, 2 * ax, 0, C.cssVar("--s2"));
      arrow(0, 0, 2 * ax, 0, C.cssVar("--s3"), 3.2);
      ctx.fillStyle = C.cssVar("--muted"); ctx.font = "12px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("Re", pz.X(1.0), pz.Y(0) - 6); ctx.fillText("Im", pz.X(0) + 6, pz.Y(1.05));
      // espectros
      pa.set({ ymax: Math.max(1.2, h * 1.25) }).clear().stems([-f, f], [h, h], "--s1", { labels: ["A/2=" + M.fmt(h), "A/2=" + M.fmt(h)] });
      pf.clear().stems([-f, f], [-deg(ph), deg(ph)], "--s2", { labels: [M.fmt(-deg(ph)) + "°", M.fmt(deg(ph)) + "°"] });
      // tiempo
      pt.clear().fn(function (x) { return A * Math.cos(2 * Math.PI * f * x + ph); }, "--s3");
      const tm = t % 1;
      pt.points([tm], [A * Math.cos(2 * Math.PI * f * tm + ph)], "--s3", 5).vline(tm, "--muted");
    }
    const an = animator($("sim-fasor"), function (dt) { t += dt * 0.25; draw(); });
    $("fz-play").addEventListener("click", function () { this.textContent = an.toggle() ? "⏸ Pausa" : "▶ Reanudar"; });
    on(["fz-A", "fz-f", "fz-p"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------- Suma de hasta cinco fasores
  (function () {
    if (!$("sim-fasores5")) return;
    const COLORS = ["--s1", "--s2", "--s3", "--s4", "--s5"];
    const WINDOW = 4;
    const pz = new Plot($("f5-c1"), {
      xmin: -2.35, xmax: 2.35, ymin: -2.35, ymax: 2.35, aspect: 1,
      pad: [10, 10, 10, 10], grid: false, xstep: 1, ystep: 1,
      xfmt: function () { return ""; }, yfmt: function () { return ""; }
    });
    const pt = new Plot($("f5-c2"), {
      xmin: -WINDOW, xmax: 0, ymin: -3, ymax: 3, aspect: 1,
      xlabel: "t (s)", ylabel: "x(t)"
    });
    let t = WINDOW;

    function arrow(ctx, x0, y0, x1, y1, col, w) {
      const X0 = pz.X(x0), Y0 = pz.Y(y0), X1 = pz.X(x1), Y1 = pz.Y(y1);
      const a = Math.atan2(Y1 - Y0, X1 - X0), head = 8;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.2;
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X1, Y1);
      ctx.lineTo(X1 - head * Math.cos(a - 0.4), Y1 - head * Math.sin(a - 0.4));
      ctx.lineTo(X1 - head * Math.cos(a + 0.4), Y1 - head * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
    }

    function draw() {
      const comps = [];
      for (let i = 1; i <= 5; i++) {
        if (!$("f5-on-" + i).checked) continue;
        const A = num("f5-A-" + i), f = num("f5-f-" + i), phd = num("f5-p-" + i);
        if (A <= 0) continue;
        comps.push({ i: i, A: A, f: f, ph: phd * Math.PI / 180, phd: phd, col: COLORS[i - 1] });
      }
      const sumA = comps.reduce(function (s, c) { return s + c.A; }, 0);
      const ymax = Math.max(1.2, sumA * 1.08);
      const fn = $("f5-fn").value;
      const shift = fn === "sin" ? -Math.PI / 2 : 0;
      const wave = function (c, x) { return c.A * Math.cos(2 * Math.PI * c.f * x + c.ph + shift); };

      // ---- plano complejo
      pz.clear();
      const ctx = pz.ctx;
      ctx.save();
      ctx.strokeStyle = C.cssVar("--border"); ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      [1, 2].forEach(function (r) {
        ctx.beginPath(); ctx.arc(pz.X(0), pz.Y(0), Math.abs(pz.X(r) - pz.X(0)), 0, 2 * Math.PI); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle = C.cssVar("--muted"); ctx.font = "11px sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText("Re", pz.X(2.12), pz.Y(0) - 4);
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("Im", pz.X(0) + 5, pz.Y(2.12));
      comps.forEach(function (c) {
        const th = 2 * Math.PI * c.f * t + c.ph + shift;
        const x = c.A * Math.cos(th), y = c.A * Math.sin(th);
        const col = C.cssVar(c.col);
        // proyección sobre el eje real: el valor instantáneo del coseno
        ctx.globalAlpha = 0.3; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(pz.X(x), pz.Y(y)); ctx.lineTo(pz.X(x), pz.Y(0)); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(pz.X(x), pz.Y(0), 2.5, 0, 2 * Math.PI); ctx.fill();
        arrow(ctx, 0, 0, x, y, col, 2.2);
        ctx.font = "600 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(c.i), pz.X(x * 0.82), pz.Y(y * 0.82));
      });
      ctx.restore();

      // ---- senoides individuales y suma
      pt.set({ xmin: t - WINDOW, xmax: t, ymin: -ymax, ymax: ymax });
      pt.clear();
      comps.forEach(function (c) {
        pt.fn(function (x) { return wave(c, x); }, c.col, 1.4, null, 600);
      });
      pt.fn(function (x) {
        let s = 0;
        comps.forEach(function (c) { s += wave(c, x); });
        return s;
      }, "--text", 2.8, null, 1200);
      pt.vline(t, "--muted");
      comps.forEach(function (c) {
        pt.points([t], [wave(c, t)], c.col, 3);
      });
      let total = 0;
      comps.forEach(function (c) { total += wave(c, t); });
      pt.points([t], [total], "--text", 4);

      // ---- lectura
      const terms = comps.map(function (c) {
        let s = M.fmt(c.A) + "·" + fn + "(2π·" + M.fmt(c.f) + "·t";
        if (Math.abs(c.phd) > 1e-9) s += (c.phd > 0 ? " + " : " − ") + M.fmt(Math.abs(c.phd)) + "°";
        return s + ")";
      });
      const n = comps.length;
      const estado = n === 0 ? "Sin fasores activos" : n === 1 ? "1 fasor activo" : n + " fasores activos";
      $("f5-out").textContent = (terms.length ? "x(t) = " + terms.join(" + ") : "x(t) = 0") +
        "\n" + estado + " · ventana móvil de " + WINDOW + " s · cada flecha: amplitud Aᵢ, frecuencia fᵢ y desfase φᵢ";
    }

    for (let i = 1; i <= 5; i++) {
      $("f5-on-" + i).addEventListener("change", function () {
        this.closest(".f5-row").classList.toggle("is-off", !this.checked);
        draw();
      });
    }
    const ids = [];
    for (let i = 1; i <= 5; i++) ids.push("f5-A-" + i, "f5-f-" + i, "f5-p-" + i);
    ids.push("f5-fn");
    on(ids, draw);

    const an = animator($("sim-fasores5"), function (dt) { t += dt * 0.6; draw(); });
    $("f5-play").addEventListener("click", function () {
      this.textContent = an.toggle() ? "⏸ Pausa" : "▶ Reanudar";
    });
    $("f5-reset").addEventListener("click", function () { t = WINDOW; draw(); });
    C.onRedraw(draw);
  })();

  // ---------------------------------------------------- Series de Fourier
  (function () {
    if (!$("sim-fs")) return;
    const p1 = new Plot($("fs-c1"), { xmin: -1.5, xmax: 1.5, ymin: -1.3, ymax: 1.3, xlabel: "t / T₀", ylabel: "x(t)" });
    const p2 = new Plot($("fs-c2"), { xmin: -16, xmax: 16, ymin: -0.05, ymax: 0.6, aspect: 0.32, xstep: 2, xlabel: "n (f = n f₀)", ylabel: "|Cₙ|" });
    function coef(w, d, n) { // devuelve {re, im}
      if (w === "rect") return { re: d * M.sinc(n * d), im: 0 };
      if (w === "tri") { const s = M.sinc(n * d / 2); return { re: d / 2 * s * s, im: 0 }; }
      if (n === 0) return { re: 0, im: 0 };
      return { re: 0, im: (n % 2 === 0 ? 1 : -1) / (Math.PI * n) };
    }
    function ideal(w, d, t) {
      const u = t - Math.round(t);
      if (w === "rect") return Math.abs(u) < d / 2 ? 1 : 0;
      if (w === "tri") { const a = Math.abs(u) / (d / 2); return a < 1 ? 1 - a : 0; }
      return 2 * u;
    }
    function draw() {
      const w = $("fs-w").value, d = num("fs-d"), N = Math.round(num("fs-n"));
      $("fs-d").disabled = w === "saw";
      const cs = []; for (let n = 0; n <= Math.max(N, 16); n++) cs.push(coef(w, d, n));
      const ymin = w === "saw" ? -1.3 : -0.25, ymax = w === "saw" ? 1.3 : 1.3;
      p1.set({ ymin: ymin, ymax: ymax }).clear();
      p1.fn(function (t) { return ideal(w, d, t); }, "--muted", 1.5, [5, 4], 1500);
      p1.fn(function (t) {
        let s = cs[0].re;
        for (let n = 1; n <= N; n++) { const a = 2 * Math.PI * n * t; s += 2 * (cs[n].re * Math.cos(a) - cs[n].im * Math.sin(a)); }
        return s;
      }, "--s1", 2, null, 900);
      const xs = [], ys = [], cols = [];
      for (let n = -16; n <= 16; n++) { const c = cs[Math.abs(n)]; xs.push(n); ys.push(Math.hypot(c.re, c.im)); }
      const ymx = Math.max(0.2, Math.max.apply(null, ys) * 1.2);
      p2.set({ ymax: ymx }).clear();
      if (w !== "saw") p2.fn(function (x) { return Math.hypot(coef(w, d, x).re, 0); }, "--muted", 1, [4, 4]);
      const inX = [], inY = [], outX = [], outY = [];
      xs.forEach(function (x, i) { (Math.abs(x) <= N ? inX : outX).push(x); (Math.abs(x) <= N ? inY : outY).push(ys[i]); });
      p2.stems(outX, outY, "--border").stems(inX, inY, "--s1");
      // potencia
      let PN = cs[0].re * cs[0].re; for (let n = 1; n <= N; n++) PN += 2 * (cs[n].re * cs[n].re + cs[n].im * cs[n].im);
      const P = w === "rect" ? d : w === "tri" ? d / 3 : 1 / 3;
      const zeros = w === "rect" ? "ceros de la envolvente en n = k/" + M.fmt(d) + " → f = k/τ" : w === "tri" ? "ceros en f = 2k/τ (envolvente sinc²)" : "Cₙ = j(−1)ⁿ/(πn): decae como 1/n";
      $("fs-out").textContent = "C₀ = " + M.fmt(cs[0].re) + "   |C₁| = " + M.fmt(Math.hypot(cs[1].re, cs[1].im)) +
        "\nPotencia total P = " + M.fmt(P) + " W   ·   en |n| ≤ " + N + ": " + M.fmt(PN) + " W (" + (100 * PN / P).toFixed(1) + " %)\n" + zeros;
    }
    on(["fs-w", "fs-d", "fs-n"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------ Explorador de la TF
  (function () {
    if (!$("sim-tf")) return;
    const p1 = new Plot($("tf-c1"), { xmin: -5, xmax: 5, ymin: -1.2, ymax: 1.2, aspect: 0.28, xlabel: "t (ms)", ylabel: "x(t)" });
    const p2 = new Plot($("tf-c2"), { xmin: -8, xmax: 8, ymin: 0, ymax: 1, aspect: 0.55, xstep: 2, xlabel: "f (kHz)", ylabel: "|X(f)| (V/kHz)" });
    const p3 = new Plot($("tf-c3"), { xmin: -8, xmax: 8, ymin: -200, ymax: 200, aspect: 0.55, xstep: 2, ystep: 90, xlabel: "f (kHz)", ylabel: "fase (°)" });
    function pulse(s, tau, t) {
      if (s === "rect") return Math.abs(t) < tau / 2 ? 1 : 0;
      if (s === "tri") return M.tri(t / (tau / 2));
      return Math.exp(-Math.PI * (t / tau) * (t / tau));
    }
    function P(s, tau, f) {
      if (s === "rect") return tau * M.sinc(f * tau);
      if (s === "tri") { const v = M.sinc(f * tau / 2); return tau / 2 * v * v; }
      return tau * Math.exp(-Math.PI * f * tau * f * tau);
    }
    function draw() {
      const s = $("tf-s").value, tau = num("tf-t"), td = num("tf-d"), fc = num("tf-f");
      p1.clear().fn(function (t) { const u = t - td; return pulse(s, tau, u) * (fc > 0 ? Math.cos(2 * Math.PI * fc * u) : 1); }, "--s1", 2, null, 1600);
      function X(f) { // compleja
        const g = fc > 0 ? 0.5 * (P(s, tau, f - fc) + P(s, tau, f + fc)) : P(s, tau, f);
        const a = -2 * Math.PI * f * td;
        return { re: g * Math.cos(a), im: g * Math.sin(a), g: g };
      }
      const peak = fc > 0 ? P(s, tau, 0) / 2 : P(s, tau, 0);
      p2.set({ ymax: peak * 1.15 }).clear().fn(function (f) { const z = X(f); return Math.hypot(z.re, z.im); }, "--s1", 2, null, 1400);
      if (s !== "gauss") { for (let k = 1; k <= 8; k++) { const z = k / (s === "rect" ? tau : tau / 2); if (fc === 0 && z < 8) { p2.vline(z, "--border"); p2.vline(-z, "--border"); } } }
      p3.clear().fn(function (f) { const z = X(f); return Math.abs(z.g) < peak * 0.01 ? NaN : deg(Math.atan2(z.im, z.re)); }, "--s2", 1.6, null, 1400);
    }
    on(["tf-s", "tf-t", "tf-d", "tf-f"], draw);
    C.onRedraw(draw);
  })();

  // --------------------------------------------------------- Convolución
  (function () {
    if (!$("sim-conv")) return;
    const p1 = new Plot($("cv-c1"), { xmin: -3, xmax: 5, ymin: -0.1, ymax: 1.3, aspect: 0.3, xlabel: "λ", ylabel: "" });
    const p2 = new Plot($("cv-c2"), { xmin: -3, xmax: 5, ymin: -0.05, ymax: 1.2, aspect: 0.3, xlabel: "t", ylabel: "(v∗w)(t)" });
    const F = {
      rect: function (t) { return Math.abs(t) < 0.5 ? 1 : 0; },
      rect2: function (t) { return Math.abs(t) < 1 ? 1 : 0; },
      exp: function (t) { return t >= 0 ? Math.exp(-t) : 0; },
      tri: function (t) { return M.tri(t); }
    };
    const dl = 0.005, L = linspace(-6, 8, Math.round(14 / dl) + 1);
    function convAt(a, b, t) { let s = 0; for (let i = 0; i < L.length; i++) s += F[a](L[i]) * F[b](t - L[i]); return s * dl; }
    let cache = null;
    function curve(a, b) {
      const key = a + b; if (cache && cache.key === key) return cache;
      const ts = linspace(-3, 5, 401), ys = ts.map(function (t) { return convAt(a, b, t); });
      cache = { key: key, ts: ts, ys: ys, max: Math.max.apply(null, ys) }; return cache;
    }
    function draw() {
      const a = $("cv-a").value, b = $("cv-b").value, t = num("cv-t"), cu = curve(a, b);
      const xs = linspace(-3, 5, 800), va = xs.map(F[a]), wb = xs.map(function (l) { return F[b](t - l); }), pr = xs.map(function (l, i) { return va[i] * wb[i]; });
      p1.clear().fillBetween(xs, pr, xs.map(function () { return 0; }), "--s3", 0.35).line(xs, va, "--s1", 2).line(xs, wb, "--s2", 2).vline(t, "--muted", [3, 3], "t");
      const yv = convAt(a, b, t);
      p2.set({ ymax: Math.max(1.05, cu.max * 1.15) }).clear();
      const k = cu.ts.filter(function (x) { return x <= t; }).length;
      p2.line(cu.ts, cu.ys, "--border", 1.5).line(cu.ts.slice(0, k), cu.ys.slice(0, k), "--s3", 2.4).points([t], [yv], "--s3", 5);
      p2.text(t + 0.1, yv + 0.08 * p2.o.ymax, "área = " + yv.toFixed(3), "--text");
    }
    let dir = 1;
    const an = animator($("sim-conv"), function (dt) {
      const r = $("cv-t"); let v = parseFloat(r.value) + dir * dt * 1.2;
      if (v > 4) { v = 4; dir = -1; } if (v < -3) { v = -3; dir = 1; }
      r.value = v.toFixed(2); $("cv-to").textContent = r.value; draw();
    });
    an.set(false);
    $("cv-play").addEventListener("click", function () { this.textContent = an.toggle() ? "⏸ Pausa" : "▶ Animar"; });
    on(["cv-a", "cv-b", "cv-t"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------------- Filtro RC
  (function () {
    if (!$("sim-rc")) return;
    const p1 = new Plot($("rc-c1"), { xmin: 0, xmax: 3, ymin: -0.2, ymax: 1.25, aspect: 0.3, xlabel: "t (ms)", ylabel: "v(t)" });
    const p2 = new Plot($("rc-c2"), { xmin: -15.5, xmax: 15.5, ymin: 0, ymax: 0.55, aspect: 0.3, xstep: 2, xlabel: "f (kHz)", ylabel: "|Cₙ|" });
    const NH = 399;
    function draw() {
      const fc = num("rc-f");
      const H = function (f) { const d = 1 + (f / fc) * (f / fc); return { re: 1 / d, im: -(f / fc) / d }; };
      const cn = function (n) { return 0.5 * M.sinc(n / 2); };
      const terms = [];
      for (let n = 1; n <= NH; n += 2) { const c = cn(n), h = H(n); terms.push([n, c * h.re, c * h.im]); }
      p1.clear().fn(function (t) { return (t % 1) < 0.25 || (t % 1) >= 0.75 ? 1 : 0; }, "--muted", 1.5, [5, 4], 1500);
      p1.fn(function (t) {
        let s = 0.5;
        for (let i = 0; i < terms.length; i++) { const a = 2 * Math.PI * terms[i][0] * t; s += 2 * (terms[i][1] * Math.cos(a) - terms[i][2] * Math.sin(a)); }
        return s;
      }, "--s1", 2.2, null, 700);
      const xs = [], yi = [], yo = [];
      let Po = 0.25;
      for (let n = -15; n <= 15; n++) { const c = Math.abs(cn(n)), h = H(n); xs.push(n); yi.push(c); yo.push(c * Math.hypot(h.re, h.im)); }
      for (let i = 0; i < terms.length; i++) Po += 2 * (terms[i][1] * terms[i][1] + terms[i][2] * terms[i][2]);
      p2.clear().stems(xs.map(function (x) { return x - 0.15; }), yi, "--border").stems(xs.map(function (x) { return x + 0.15; }), yo, "--s1");
      p2.fn(function (f) { return 0.5 * 1 / Math.sqrt(1 + (f / fc) * (f / fc)); }, "--s2", 1.2, [4, 4]);
      $("rc-out").textContent = "RC = " + (1 / (2 * Math.PI * fc)).toFixed(4) + " ms   |H(1 kHz)| = " + (1 / Math.sqrt(1 + 1 / (fc * fc))).toFixed(3) +
        "   ∠H(1 kHz) = " + deg(-Math.atan(1 / fc)).toFixed(1) + "°\nPotencia de entrada 0,500 W  →  salida " + Po.toFixed(3) + " W (la DC de 0,25 W pasa siempre: H(0) = 1)";
    }
    on(["rc-f"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------- Ruido blanco filtrado
  (function () {
    if (!$("sim-noise")) return;
    const p1 = new Plot($("nz-c1"), { xmin: 0, xmax: 0.5, ymin: -1, ymax: 1, aspect: 0.6, xlabel: "t (s)", ylabel: "y(t)" });
    const p2 = new Plot($("nz-c2"), { xmin: -1, xmax: 1, ymin: 0, ymax: 1, aspect: 0.6, xlabel: "y", ylabel: "p(y)" });
    const fs = 4000, N = 12000;
    let w = [];
    function regen() {
      w = [];
      for (let i = 0; i < N; i += 2) {
        const u1 = Math.random() || 1e-12, u2 = Math.random(), r = Math.sqrt(-2 * Math.log(u1));
        w.push(r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2));
      }
    }
    function draw() {
      const N0 = num("nz-n"), B = num("nz-b");
      const sx = Math.sqrt(N0 / 2 * fs), a = 1 - Math.exp(-2 * Math.PI * B / fs);
      const y = new Array(N); let s = 0;
      for (let i = 0; i < N; i++) { s += a * (sx * w[i] - s); y[i] = s; }
      const skip = 2000, ys = y.slice(skip);
      let m = 0, v = 0; ys.forEach(function (q) { m += q; }); m /= ys.length; ys.forEach(function (q) { v += (q - m) * (q - m); }); v /= ys.length;
      const vt = N0 * Math.PI * B / 2, sd = Math.sqrt(vt), lim = 4 * sd;
      const tt = [], yy = []; for (let i = 0; i < 2000; i++) { tt.push(i / fs); yy.push(ys[i]); }
      p1.set({ ymin: -lim, ymax: lim }).clear().line(tt, yy, "--s1", 1.2).hline(sd, "--s2", [4, 4], "+σ").hline(-sd, "--s2", [4, 4], "−σ");
      const nb = 40, h = new Array(nb).fill(0), bw = 2 * lim / nb;
      ys.forEach(function (q) { const k = Math.floor((q + lim) / bw); if (k >= 0 && k < nb) h[k]++; });
      const hx = [], hy = []; h.forEach(function (c, k) { hx.push(-lim + (k + 0.5) * bw); hy.push(c / (ys.length * bw)); });
      const gmax = 1 / (Math.sqrt(2 * Math.PI) * sd);
      p2.set({ xmin: -lim, xmax: lim, ymax: gmax * 1.35 }).clear().stems(hx, hy, "--s1", { dot: false, width: Math.max(2, p2.W / nb * 0.7) });
      p2.fn(function (x) { return gmax * Math.exp(-x * x / (2 * vt)); }, "--s2", 2);
      $("nz-out").textContent = "Varianza teórica  N₀·B_N = N₀·πB/2 = " + vt.toFixed(2) + " W\nVarianza medida   " + v.toFixed(2) + " W    (media medida " + m.toFixed(3) + ")";
    }
    $("nz-re").addEventListener("click", function () { regen(); draw(); });
    on(["nz-n", "nz-b"], draw);
    regen(); C.onRedraw(draw);
  })();

  // --------------------------------------------- Laboratorio: foury en web
  (function () {
    if (!$("sim-lab")) return;
    const p1 = new Plot($("lb-c1"), { xmin: 0, xmax: 10, ymin: -1.2, ymax: 1.2, aspect: 0.28, xlabel: "t (s)", ylabel: "señal" });
    const p2 = new Plot($("lb-c2"), { xmin: -50, xmax: 50, ymin: 0, ymax: 1, aspect: 0.34, xlabel: "Frecuencia (Hz)", ylabel: "Amplitud" });
    // réplicas de las funciones MATLAB del laboratorio
    function cuadpuls(n, hi, lo) { const s = []; for (let w = 0; w < n; w++) { const k = w % 2 === 0 ? hi : lo, v = w % 2 === 0 ? 1 : 0; for (let i = 0; i < k; i++) s.push(v); } return s; }
    function triapuls(n, up, dn, tot) {
      const s = [];
      for (let k = 0; k < n; k++) {
        for (let i = 0; i < up; i++) s.push(i / up);
        for (let i = dn; i >= 1; i--) s.push(i / dn);
        for (let i = 0; i < tot - up - dn; i++) s.push(0);
      }
      return s;
    }
    function unpulse(n, k) { const s = new Array(n).fill(0), o = n / 2 - Math.ceil(k / 2) - 1; for (let i = 0; i < k; i++) s[o + i] = 1; return s; }
    const defFs = { cos: 100, mix: 100, sq: 100, sqa: 100, tri: 100, tria: 20, pul: 100 };
    function signal(kind, fs) {
      if (kind === "cos" || kind === "mix") {
        const n = Math.round(10 * fs) + 1, x = [];
        for (let i = 0; i < n; i++) { const t = i / fs; x.push(kind === "cos" ? Math.cos(2 * Math.PI * t) : 3 + 2 * Math.cos(2 * Math.PI * t) + 5 * Math.cos(2 * Math.PI * 5 * t) + 4 * Math.cos(2 * Math.PI * 3 * t)); }
        return x;
      }
      if (kind === "sq") return cuadpuls(10, 100, 100);
      if (kind === "sqa") return cuadpuls(10, 50, 150);
      if (kind === "tri") return triapuls(10, 10, 10, 100);
      if (kind === "tria") return triapuls(10, 5, 15, 20);
      return unpulse(1000, 100);
    }
    function magHalf(x) { // |X_k|/N para k = 0..floor(N/2)-1
      const N = x.length, K = Math.floor(N / 2), cs = new Float64Array(N), sn = new Float64Array(N), out = [];
      for (let i = 0; i < N; i++) { cs[i] = Math.cos(2 * Math.PI * i / N); sn[i] = Math.sin(2 * Math.PI * i / N); }
      for (let k = 0; k < K; k++) {
        let re = 0, im = 0, idx = 0;
        for (let n = 0; n < N; n++) { re += x[n] * cs[idx]; im -= x[n] * sn[idx]; idx += k; if (idx >= N) idx -= N; }
        out.push(Math.hypot(re, im) / N);
      }
      return out;
    }
    let lastKind = $("lb-s").value;
    function draw() {
      const kind = $("lb-s").value;
      if (kind !== lastKind) { $("lb-fs").value = defFs[kind]; lastKind = kind; }
      let fs = Math.max(5, Math.min(kind === "cos" || kind === "mix" ? 400 : 2000, num("lb-fs") || defFs[kind]));
      $("lb-fs").value = fs;
      const x = signal(kind, fs), N = x.length, T = N / fs;
      const t = x.map(function (_, i) { return i / fs; });
      const mn = Math.min.apply(null, x), mx = Math.max.apply(null, x), pad = (mx - mn) * 0.1 || 0.2;
      p1.set({ xmin: 0, xmax: T, ymin: Math.min(0, mn) - pad, ymax: mx + pad }).clear().line(t, x, "--s1", 1.4);
      const R = magHalf(x), K = R.length, df = fs / N;
      const fx = [], fy = [];
      for (let k = K - 1; k >= 1; k--) { fx.push(-k * df); fy.push(R[k]); }
      for (let k = 0; k < K; k++) { fx.push(k * df); fy.push(R[k]); }
      const top = Math.max.apply(null, fy);
      p2.set({ xmin: -fs / 2, xmax: fs / 2, ymax: top * 1.15 }).clear().line(fx, fy, "--s2", 1.4);
      // picos principales (frecuencias positivas)
      const pk = [];
      for (let k = 0; k < K; k++) { const l = k > 0 ? R[k - 1] : -1, r = k + 1 < K ? R[k + 1] : -1; if (R[k] >= l && R[k] >= r && R[k] > top * 0.05) pk.push([k * df, R[k]]); }
      pk.sort(function (a, b) { return b[1] - a[1]; });
      $("lb-out").textContent = "N = " + N + " muestras   Fs = " + fs + " Hz   duración = " + M.fmt(T) + " s   resolución Δf = Fs/N = " + M.fmt(df) + " Hz\n" +
        "Líneas principales (f ≥ 0): " + pk.slice(0, 6).map(function (p) { return M.fmt(p[0]) + " Hz → " + p[1].toFixed(3); }).join(" · ");
    }
    on(["lb-s", "lb-fs"], draw);
    C.onRedraw(draw);
  })();
})();
