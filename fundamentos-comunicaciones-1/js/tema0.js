// Simuladores del Tema 0 (introducción y repaso)
(function () {
  "use strict";
  const C = window.Course, M = C.M, Plot = C.Plot;
  const $ = function (id) { return document.getElementById(id); };
  const num = function (id) { return parseFloat($(id).value); };
  const on = function (ids, fn) {
    ids.forEach(function (id) {
      const e = $(id);
      if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); }
    });
  };
  const linspace = function (a, b, n) {
    const r = [];
    for (let i = 0; i < n; i++) r.push(a + (b - a) * i / (n - 1));
    return r;
  };
  const deg = function (r) { return r * 180 / Math.PI; };

  // ------------------------------------------------------- Fasor y senoide
  (function () {
    if (!$("sim-fasor0")) return;
    const pz = new Plot($("f0-c1"), {
      xmin: -11, xmax: 11, ymin: -11, ymax: 11, aspect: 1,
      pad: [12, 12, 22, 30], xstep: 5, ystep: 5
    });
    const pc = new Plot($("f0-c2"), {
      xmin: 0, xmax: 2000, ymin: -11, ymax: 11, aspect: 0.45,
      xlabel: "t (ms)", ylabel: "x(t)"
    });

    function arrow(ctx, x0, y0, x1, y1, col) {
      const X0 = pz.X(x0), Y0 = pz.Y(y0), X1 = pz.X(x1), Y1 = pz.Y(y1);
      const a = Math.atan2(Y1 - Y0, X1 - X0);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X1, Y1);
      ctx.lineTo(X1 - 9 * Math.cos(a - 0.4), Y1 - 9 * Math.sin(a - 0.4));
      ctx.lineTo(X1 - 9 * Math.cos(a + 0.4), Y1 - 9 * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
    }

    function draw() {
      const A = num("f0-A"), f = num("f0-f"), ph = num("f0-p") * Math.PI / 180;
      const T = 1 / f, Tms = 1000 * T;

      // Plano complejo
      pz.clear();
      const ctx = pz.ctx;
      const rx = Math.abs(pz.X(A) - pz.X(0));
      const ry = Math.abs(pz.Y(A) - pz.Y(0));
      ctx.strokeStyle = C.cssVar("--border"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(pz.X(0), pz.Y(0), rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();

      const tipx = A * Math.cos(ph), tipy = A * Math.sin(ph);
      ctx.strokeStyle = C.cssVar("--muted"); ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pz.X(tipx), pz.Y(tipy)); ctx.lineTo(pz.X(tipx), pz.Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pz.X(tipx), pz.Y(tipy)); ctx.lineTo(pz.X(0), pz.Y(tipy)); ctx.stroke();
      ctx.setLineDash([]);
      arrow(ctx, 0, 0, tipx, tipy, C.cssVar("--s1"));
      ctx.fillStyle = C.cssVar("--muted"); ctx.font = "12px sans-serif";
      ctx.fillText("Re", pz.X(9.2), pz.Y(0) - 8);
      ctx.fillText("Im", pz.X(0) + 7, pz.Y(9.2));
      ctx.fillText("A = " + M.fmt(A), pz.X(0) + 7, pz.Y(0) - 8);

      // Senoide
      const tmax = 2 * Tms;
      pc.set({
        xmin: 0, xmax: tmax, ymin: -A * 1.18, ymax: A * 1.18,
        xstep: Tms / 2, ystep: A / 2,
        xfmt: function (v) { return M.fmt(v); },
        yfmt: function (v) { return M.fmt(v); }
      }).clear();
      pc.fn(function (tms) {
        return A * Math.cos(2 * Math.PI * f * (tms / 1000) + ph);
      }, "--s1", 2.2, null, 900);
      pc.vline(0, "--muted", [4, 4]);

      const rms = A / Math.SQRT2, P = A * A / 2;
      $("f0-out").textContent =
        "x(t) = " + M.fmt(A) + "·cos(2π·" + M.fmt(f) + "·t + " + M.fmt(deg(ph)) + "°) V" +
        "\nT = 1/f = " + M.fmt(Tms) + " ms    ·    ω = 2πf = " + M.fmt(2 * Math.PI * f) + " rad/s" +
        "\n|X| = A = " + M.fmt(A) + " V    ·    fase = " + M.fmt(deg(ph)) + "°" +
        "\nRMS = A/√2 = " + M.fmt(rms) + " V    ·    P = A²/2 = " + M.fmt(P) + " W (1 Ω)";
    }

    on(["f0-A", "f0-f", "f0-p"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------------ dB / dBm
  (function () {
    if (!$("sim-db0")) return;
    function draw() {
      const db = num("db0-db");
      const pr = Math.pow(10, db / 10), vr = Math.pow(10, db / 20);
      $("db0-out").textContent =
        "G = " + M.fmt(db) + " dB" +
        "\nP₂/P₁ = 10^(G/10) = " + (pr < 0.01 ? pr.toExponential(3) : M.fmt(pr)) +
        "\nV₂/V₁ = 10^(G/20) = " + (vr < 0.01 ? vr.toExponential(3) : M.fmt(vr)) +
        "\nSi la entrada es 0 dBm (1 mW): salida = " + (pr < 0.01 ? pr.toExponential(3) : M.fmt(pr)) + " mW";
    }
    on(["db0-db"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------- Gaussiana y Q
  (function () {
    if (!$("sim-q0")) return;
    const p = new Plot($("f0q-c"), {
      xmin: -4, xmax: 5, ymin: 0, ymax: 0.45, aspect: 0.32,
      xlabel: "λ", ylabel: "p(λ)"
    });
    const g = function (x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); };
    function draw() {
      const z = num("f0q-z");
      const xs = linspace(z, 5, 160);
      const ys = xs.map(g);
      const zero = xs.map(function () { return 0; });
      p.clear().fn(g, "--s1", 2.2, null, 900)
        .fillBetween(xs, ys, zero, "--s2", 0.45)
        .vline(z, "--text", [4, 4], "z = " + M.fmt(z));
      $("f0q-out").textContent =
        "Q(" + M.fmt(z) + ") = " + M.Q(z).toExponential(4) +
        "\n2·Q(z) = " + (2 * M.Q(z)).toExponential(4) +
        "\nSi Pₑ = Q(A/σ), este valor corresponde a A/σ = " + M.fmt(z);
    }
    on(["f0q-z"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------- Información y entropía
  (function () {
    if (!$("sim-info0")) return;
    const p = new Plot($("f0i-c"), {
      xmin: 0, xmax: 1, ymin: 0, ymax: 1.05, aspect: 0.42,
      xlabel: "p", ylabel: "H (bits)"
    });
    function Hb(x) {
      if (x <= 0 || x >= 1) return 0;
      return -x * M.log2(x) - (1 - x) * M.log2(1 - x);
    }
    function draw() {
      const pr = Math.min(0.999, Math.max(0.001, num("f0i-p")));
      p.clear();
      p.fn(function (x) { return Hb(x); }, "--s1", 2.4, null, 900);
      p.points([pr], [Hb(pr)], "--s2", 5);
      p.vline(pr, "--muted", [3, 3]);
      p.hline(Hb(pr), "--muted", [3, 3], "H = " + Hb(pr).toFixed(3));
      $("f0i-out").textContent =
        "p = " + pr.toFixed(2) +
        "\nI(1) = −log₂p = " + M.log2(1 / pr).toFixed(3) + " bits" +
        "\nI(0) = −log₂(1−p) = " + M.log2(1 / (1 - pr)).toFixed(3) + " bits" +
        "\nH binaria = " + Hb(pr).toFixed(3) + " bits/símbolo";
    }
    on(["f0i-p"], draw);
    C.onRedraw(draw);
  })();

  // -------------------------------------------------------- Bode de un RC
  (function () {
    if (!$("sim-rc0")) return;
    const lg = { xfmt: function (v) { return v === Math.round(v) ? "10" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[v] : ""; } };
    const p1 = new Plot($("f0r-c1"), Object.assign({
      xmin: 1, xmax: 7, ymin: -60, ymax: 5, aspect: 0.55,
      xstep: 1, ystep: 10, xlabel: "f (Hz)", ylabel: "|H| (dB)"
    }, lg));
    const p2 = new Plot($("f0r-c2"), Object.assign({
      xmin: 1, xmax: 7, ymin: -95, ymax: 5, aspect: 0.55,
      xstep: 1, ystep: 15, xlabel: "f (Hz)", ylabel: "∠H (°)"
    }, lg));

    function draw() {
      const R = num("f0r-r") * 1e3, Cc = num("f0r-c") * 1e-9;
      const tau = R * Cc, fc = 1 / (2 * Math.PI * tau), lfc = Math.log10(fc);
      p1.clear()
        .fn(function (x) { const r = Math.pow(10, x) / fc; return -10 * Math.log10(1 + r * r); }, "--s1", 2.2)
        .fn(function (x) { return x < lfc ? 0 : -20 * (x - lfc); }, "--muted", 1.2, [4, 4])
        .vline(lfc, "--s2", [3, 3], "f_c")
        .hline(-3, "--s2", [3, 3], "−3 dB");
      p2.clear()
        .fn(function (x) { return -Math.atan(Math.pow(10, x) / fc) * 180 / Math.PI; }, "--s1", 2.2)
        .vline(lfc, "--s2", [3, 3])
        .hline(-45, "--s2", [3, 3], "−45°");
      const fstr = fc >= 1e6 ? (fc / 1e6).toFixed(3) + " MHz" : fc >= 1e3 ? (fc / 1e3).toFixed(3) + " kHz" : fc.toFixed(2) + " Hz";
      $("f0r-out").textContent =
        "τ = RC = " + (tau * 1e6).toFixed(2) + " µs    ·    f_c = 1/(2πRC) = " + fstr +
        "\n|H(f_c)| = 0,707 (−3,01 dB)    ·    ∠H(f_c) = −45°" +
        "\nAncho de banda equivalente de ruido: B_N = πf_c/2 = " + (Math.PI * fc / 2).toFixed(1) + " Hz";
    }
    on(["f0r-r", "f0r-c"], draw);
    C.onRedraw(draw);
  })();

  // --------------------------------------------- Bits, niveles y SNRq
  (function () {
    if (!$("sim-niv0")) return;
    function draw() {
      const n = Math.round(num("niv0-n"));
      const Mlev = Math.pow(2, n), snr = 6.02 * n + 1.76;
      $("niv0-out").textContent =
        "n = " + n + " bits    ·    M = 2^n = " + Mlev + " niveles" +
        "\nSNR_q ≈ 6,02·n + 1,76 = " + snr.toFixed(1) + " dB" +
        "\nResolución relativa: 1/" + Mlev + " = " + (100 / Mlev).toFixed(4) + " % del fondo de escala";
    }
    on(["niv0-n"], draw);
  })();
})();
