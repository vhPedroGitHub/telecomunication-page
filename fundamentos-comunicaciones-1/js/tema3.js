// Simuladores del Tema III (transmisión digital en banda base)
(function () {
  "use strict";
  const C = window.Course, M = C.M, Plot = C.Plot;
  const $ = function (id) { return document.getElementById(id); };
  const num = function (id) { return parseFloat($(id).value); };
  const on = function (ids, fn) { ids.forEach(function (id) { const e = $(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); };
  const sup = function (k) { return "10" + String(k).split("").map(function (c) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(c)] || (c === "-" ? "⁻" : c); }).join(""); };

  // -------------------------------------------------------------- Muestreo
  (function () {
    if (!$("sim-samp")) return;
    const p1 = new Plot($("sm-c1"), { xmin: 0, xmax: 2, ymin: -1.3, ymax: 1.3, aspect: 0.3, xlabel: "t (ms)", ylabel: "x(t)" });
    const p2 = new Plot($("sm-c2"), { xmin: -30, xmax: 30, ymin: 0, ymax: 0.7, aspect: 0.3, xstep: 5, xlabel: "f (kHz)", ylabel: "|X_δ(f)|/f_s" });
    function draw() {
      const f = num("sm-f"), fs = num("sm-s");
      let fa = f % fs; if (fa > fs / 2) fa = fs - fa;
      p1.clear().fn(function (t) { return Math.cos(2 * Math.PI * f * t); }, "--muted", 1.4, [4, 3], 1500);
      const ts = [], ys = []; for (let k = 0; k / fs <= 2 + 1e-9; k++) { ts.push(k / fs); ys.push(Math.cos(2 * Math.PI * f * k / fs)); }
      p1.stems(ts, ys, "--s1");
      const edge = Math.abs(fa - fs / 2) < 1e-9;
      if (!edge) p1.fn(function (t) { return Math.cos(2 * Math.PI * fa * t); }, "--s2", 2.2, null, 900);
      // espectro
      const xs = [], hs = [], cs = [];
      for (let n = -8; n <= 8; n++) [n * fs - f, n * fs + f].forEach(function (x) { if (x >= -30 && x <= 30) { xs.push(x); hs.push(0.5); } });
      p2.clear().fillBetween([-fs / 2, fs / 2], [0.65, 0.65], [0, 0], "--s3", 0.12).vline(fs / 2, "--s3", [4, 4], "f_s/2").vline(-fs / 2, "--s3", [4, 4]);
      p2.stems(xs, hs, "--s1", { arrow: true });
      p2.stems([-f, f], [0.5, 0.5], "--s2", { arrow: true });
      $("sm-out").textContent = "f = " + f + " kHz, f_s = " + fs + " kHz, f_s/2 = " + (fs / 2) + " kHz  →  " + (f < fs / 2 ? "sin aliasing: se reconstruye la señal original" : edge ? "caso límite f = f_s/2: ambiguo (depende de la fase)" : "ALIASING: el paso bajo reconstruye un coseno de " + M.fmt(+fa.toFixed(3)) + " kHz") +
        "\nFrecuencia de Nyquist para este coseno: 2f = " + M.fmt(2 * f) + " kHz";
    }
    on(["sm-f", "sm-s"], draw);
    C.onRedraw(draw);
  })();

  // ---------------------------------------------------------- Cuantificador
  (function () {
    if (!$("sim-q")) return;
    const p1 = new Plot($("qz-c1"), { xmin: 0, xmax: 1, ymin: -1.5, ymax: 1.5, aspect: 0.32, xlabel: "t / T", ylabel: "x, x_q" });
    const p2 = new Plot($("qz-c2"), { xmin: 0, xmax: 1, ymin: -0.6, ymax: 0.6, aspect: 0.2, xlabel: "t / T", ylabel: "q = x_q − x" });
    function Qz(x, n) { const L = 1 << n, d = 2 / L; let k = Math.floor(x / d); k = Math.max(-L / 2, Math.min(L / 2 - 1, k)); return (k + 0.5) * d; }
    function draw() {
      const n = Math.round(num("qz-n")), A = num("qz-a"), L = 1 << n, d = 2 / L;
      const x = function (t) { return A * Math.sin(2 * Math.PI * t); };
      p1.clear().fn(x, "--muted", 1.4).fn(function (t) { return Qz(x(t), n); }, "--s1", 2, null, 2000);
      for (let k = 0; k <= L; k++) p1.hline(-1 + k * d, "--plot-grid", [2, 3]);
      const e = function (t) { return Qz(x(t), n) - x(t); };
      p2.set({ ymin: -Math.max(d, 0.05) * 1.2, ymax: Math.max(d, 0.05) * 1.2 }).clear().fn(e, "--s2", 1.4, null, 2000).hline(d / 2, "--muted", [3, 3], "Δ/2").hline(-d / 2, "--muted", [3, 3]);
      let ps = 0, pq = 0; const N = 20000;
      for (let i = 0; i < N; i++) { const t = (i + 0.37) / N, v = x(t), q = Qz(v, n) - v; ps += v * v; pq += q * q; }
      const snr = 10 * Math.log10(ps / pq), th = 1.76 + 6.02 * n + 20 * Math.log10(A);
      $("qz-out").textContent = "L = " + L + " niveles   Δ = 2m_p/L = " + d.toFixed(4) + "   σ_q² = Δ²/12 = " + (d * d / 12).toExponential(3) +
        "\nSNRq medida = " + snr.toFixed(2) + " dB   ·   fórmula 1,76 + 6,02n + 20log(A/m_p) = " + th.toFixed(2) + " dB" + (A > 1 ? "   (¡saturación! la fórmula ya no vale)" : "");
    }
    on(["qz-n", "qz-a"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------ Modulador delta
  (function () {
    if (!$("sim-dm")) return;
    const p1 = new Plot($("dm-c1"), { xmin: 0, xmax: 2, ymin: -2.3, ymax: 2.3, aspect: 0.36, xlabel: "t (ms)", ylabel: "x(t), x_q(t)" });
    function draw() {
      const fm = num("dm-f"), A = num("dm-a"), fs = num("dm-s"), d = num("dm-d");
      const T = 2 / fm; // dos períodos (ms)
      const x = function (t) { return A * Math.cos(2 * Math.PI * fm * t); };
      const N = Math.floor(T * fs) + 1, ts = [], st = [], bits = [];
      let acc = 0;
      for (let k = 0; k < N; k++) { const t = k / fs, b = x(t) >= acc ? 1 : 0; acc += b ? d : -d; ts.push(t); st.push(acc); bits.push(b); }
      const yr = Math.max(1.2 * A, 1);
      p1.set({ xmax: T, ymin: -yr, ymax: yr }).clear();
      // zonas de sobrecarga: |x - escalera| > δ
      const xs = [], lo = [], hi = [];
      for (let i = 0; i <= 1200; i++) {
        const t = T * i / 1200, k = Math.min(N - 1, Math.floor(t * fs)), s = st[k], ov = Math.abs(x(t) - s) > d * 1.0001;
        xs.push(t); lo.push(ov ? -yr : 0); hi.push(ov ? yr : 0);
      }
      p1.fillBetween(xs, lo, hi, "--s2", 0.12);
      p1.fn(x, "--muted", 1.6).steps(ts.concat([T]), st.concat([st[st.length - 1]]), "--s1", 2);
      const ov = 2 * Math.PI * fm * A > d * fs;
      const shown = bits.slice(0, Math.min(bits.length, 64)).join("");
      $("dm-out").textContent = "Pendiente máx. de la señal 2πf_mA = " + (2 * Math.PI * fm * A).toFixed(2) + " /ms   ·   pendiente máx. de la escalera δf_s = " + (d * fs).toFixed(2) + " /ms  →  " + (ov ? "SOBRECARGA (zonas sombreadas)" : "sin sobrecarga (domina el ruido granular ±δ)") +
        "\nδ mínimo sin sobrecarga = " + (2 * Math.PI * fm * A / fs).toFixed(3) + "   ·   R_b = f_s = " + fs + " kbit/s" +
        "\nBits: " + shown + (bits.length > 64 ? "…" : "");
    }
    on(["dm-f", "dm-a", "dm-s", "dm-d"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------- Códigos de línea
  (function () {
    if (!$("sim-lc")) return;
    const p1 = new Plot($("lc-c1"), { xmin: 0, xmax: 10, ymin: -1.4, ymax: 1.4, aspect: 0.25, xstep: 1, xlabel: "t / T_b", ylabel: "v(t)" });
    const p2 = new Plot($("lc-c2"), { xmin: 0, xmax: 3, ymin: 0, ymax: 1.1, aspect: 0.3, xstep: 0.5, xlabel: "f / R_b", ylabel: "DEP · R_b/A²" });
    const S = function (x) { return M.sinc(x); };
    const psd = {
      unrz: function (f) { return 0.25 * S(f) * S(f); },
      pnrz: function (f) { return S(f) * S(f); },
      urz: function (f) { return S(f / 2) * S(f / 2) / 16; },
      prz: function (f) { return S(f / 2) * S(f / 2) / 4; },
      ami: function (f) { const s = Math.sin(Math.PI * f); return S(f) * S(f) * s * s; },
      man: function (f) { const s = Math.sin(Math.PI * f / 2); return S(f / 2) * S(f / 2) * s * s; },
      nrzi: function (f) { return S(f) * S(f); }
    };
    const lines = { unrz: [[0, 0.25]], urz: [[0, 1 / 16], [1, Math.pow(2 / Math.PI, 2) / 16], [3, Math.pow(2 / (3 * Math.PI), 2) / 16]] };
    const info = {
      unrz: ["sí (A²/4)", "R_b", "no: rachas de unos o ceros sin transiciones"],
      pnrz: ["no", "R_b", "no"], urz: ["sí", "2R_b", "raya espectral en R_b (ayuda a recuperar reloj)"],
      prz: ["no", "2R_b", "sí: transición en cada bit"], ami: ["no (nulo en f = 0)", "R_b", "parcial: rachas de ceros sin pulsos (→ HDB3)"],
      man: ["no", "2R_b", "sí: transición en mitad de cada bit"], nrzi: ["no (niveles ±A)", "R_b", "no: rachas de ceros sin transiciones"]
    };
    function wave(bits, c) {
      const X = [], Y = []; let amiSign = 1, lvl = -1;
      const seg = function (t0, t1, v) { X.push(t0, t1); Y.push(v, v); };
      bits.forEach(function (b, k) {
        if (c === "unrz") seg(k, k + 1, b);
        else if (c === "pnrz") seg(k, k + 1, b ? 1 : -1);
        else if (c === "urz") { seg(k, k + 0.5, b); seg(k + 0.5, k + 1, 0); }
        else if (c === "prz") { seg(k, k + 0.5, b ? 1 : -1); seg(k + 0.5, k + 1, 0); }
        else if (c === "ami") { if (b) { seg(k, k + 1, amiSign); amiSign = -amiSign; } else seg(k, k + 1, 0); }
        else if (c === "man") { seg(k, k + 0.5, b ? 1 : -1); seg(k + 0.5, k + 1, b ? -1 : 1); }
        else if (c === "nrzi") { if (b) lvl = -lvl; seg(k, k + 1, lvl); }
      });
      return { X: X, Y: Y };
    }
    function draw() {
      const bits = $("lc-b").value.replace(/[^01]/g, "").split("").map(Number).slice(0, 32), c = $("lc-c").value;
      if (!bits.length) return;
      const w = wave(bits, c);
      p1.set({ xmax: bits.length }).clear().line(w.X, w.Y, "--s1", 2.2);
      for (let k = 0; k < bits.length; k++) p1.text(k + 0.5, 1.25, String(bits[k]), "--muted", "center");
      const top = { unrz: 0.3, pnrz: 1.05, urz: 0.08, prz: 0.27, ami: 0.75, man: 0.75, nrzi: 1.05 }[c];
      p2.set({ ymax: top }).clear().fn(psd[c], "--s2", 2);
      if (lines[c]) p2.stems(lines[c].map(function (l) { return l[0]; }), lines[c].map(function (l) { return Math.min(l[1], top * 0.95); }), "--s1", { arrow: true });
      let tr = 0; for (let i = 1; i < w.Y.length; i++) if (w.Y[i] !== w.Y[i - 1]) tr++;
      const mean = w.Y.reduce(function (a, b, i) { return i % 2 ? a : a + b * (w.X[i + 1] - w.X[i]); }, 0) / bits.length;
      const I = info[c];
      $("lc-out").textContent = "Componente de DC (bits aleatorios): " + I[0] + "   ·   1.er nulo: " + I[1] + "   ·   autosincronismo: " + I[2] +
        "\nEsta secuencia: valor medio = " + mean.toFixed(3) + " A, " + tr + " transiciones en " + bits.length + " bits" + (lines[c] ? "\nFlechas = rayas espectrales (impulsos) de la DEP" : "");
    }
    on(["lc-b", "lc-c"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------- Diagrama de ojo
  (function () {
    if (!$("sim-eye")) return;
    const p1 = new Plot($("ey-c1"), { xmin: -4, xmax: 4, ymin: -0.35, ymax: 1.1, aspect: 0.7, xstep: 1, xlabel: "t / T", ylabel: "p(t)" });
    const p2 = new Plot($("ey-c2"), { xmin: -1, xmax: 1, ymin: -2.2, ymax: 2.2, aspect: 0.7, xstep: 0.5, xlabel: "t / T_s", ylabel: "" });
    const NB = 160; let bits = [], noise = [];
    function regen() { bits = []; noise = []; for (let i = 0; i < NB; i++) bits.push(Math.random() < 0.5 ? -1 : 1); for (let i = 0; i < NB * 40; i++) { const u = Math.random() || 1e-9, v = Math.random(); noise.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)); } }
    function rc(t, r) {
      const s = M.sinc(t);
      if (r === 0) return s;
      const den = 1 - 4 * r * r * t * t;
      if (Math.abs(den) < 1e-8) return (Math.PI / 4) * M.sinc(1 / (2 * r));
      return s * Math.cos(Math.PI * r * t) / den;
    }
    function draw() {
      const r = num("ey-r"), k = num("ey-k"), sg = num("ey-n"), kind = $("ey-p").value;
      const p = kind === "duo" ? function (t) { return M.sinc(t) + M.sinc(t - 1); } : function (t) { return rc(t, r); };
      $("ey-r").disabled = kind === "duo";
      const Ts = 1 / k; // separación real de símbolos en unidades del diseño
      p1.set({ ymax: kind === "duo" ? 1.15 : 1.1 }).clear().fn(p, "--s1", 2, null, 900);
      const sx = [], sy = []; for (let m = -4; m <= 4; m++) { sx.push(m * Ts); sy.push(p(m * Ts)); }
      p1.points(sx, sy, "--s2", 4);
      // señal y ojo
      const SPS = 40, y = new Array(NB * SPS).fill(0);
      for (let i = 0; i < NB * SPS; i++) {
        const t = i / SPS * Ts; let s = 0; const m0 = Math.floor(i / SPS);
        for (let m = Math.max(0, m0 - 12); m < Math.min(NB, m0 + 13); m++) s += bits[m] * p(t - m * Ts);
        y[i] = s + sg * noise[i];
      }
      const lim = kind === "duo" ? 3.2 : 2.2;
      p2.set({ ymin: -lim, ymax: lim }).clear();
      let worst = Infinity;
      const ctx = p2.ctx;
      p2.clip(function () {
        ctx.strokeStyle = C.cssVar("--s1"); ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
        for (let m = 12; m < NB - 12; m++) {
          ctx.beginPath();
          for (let j = -SPS; j <= SPS; j++) { const i = m * SPS + j, X = p2.X(j / SPS), Y = p2.Y(y[i]); j === -SPS ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
          ctx.stroke();
          if (kind !== "duo") worst = Math.min(worst, bits[m] * y[m * SPS]);
        }
        ctx.globalAlpha = 1;
      });
      p2.vline(0, "--s2", [4, 4], "muestreo");
      let isi = 0; for (let m = 1; m <= 12; m++) isi += Math.abs(p(m * Ts)) + Math.abs(p(-m * Ts));
      const B = kind === "duo" ? 0.5 : (1 + r) / 2;
      $("ey-out").textContent = (kind === "duo" ? "Duobinario: 3 niveles (−2, 0, +2) en el instante de muestreo; la ISI con el símbolo anterior es intencionada.\n" : "Apertura mínima del ojo en el instante de muestreo: " + (worst === Infinity ? "—" : worst.toFixed(3)) + " (1 = ojo perfecto)\n") +
        "ISI máxima de pico Σ|p(mT_s)| (m≠0) = " + isi.toFixed(3) + "   ·   ancho de banda del pulso B = " + B.toFixed(3) + "/T  →  R_s,máx sin ISI = 1/T (factor actual " + k.toFixed(2) + ")";
    }
    on(["ey-r", "ey-k", "ey-n", "ey-p"], draw);
    regen(); C.onRedraw(draw);
  })();

  // --------------------------------------------- Umbral y probabilidad de error
  (function () {
    if (!$("sim-pe")) return;
    const p1 = new Plot($("pe-c1"), { xmin: -4, xmax: 5, ymin: 0, ymax: 0.8, aspect: 0.36, xlabel: "r₀ (V)", ylabel: "p(r₀ | sᵢ)" });
    function draw() {
      const pol = $("pe-f").value === "p", A = num("pe-a"), s = num("pe-s"), VT = num("pe-t");
      const s0 = pol ? -A : 0, s1 = A;
      const g = function (m) { return function (x) { return Math.exp(-(x - m) * (x - m) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s); }; };
      const g0 = g(s0), g1 = g(s1), top = 0.5 / (Math.sqrt(2 * Math.PI) * s) * 2.3;
      p1.set({ xmin: Math.min(-1, s0 - 4 * s) , xmax: s1 + 4 * s, ymax: top }).clear();
      const xs0 = [], y0 = [], z0 = [], xs1 = [], y1 = [], z1 = [];
      for (let i = 0; i <= 300; i++) { const x = VT + (p1.o.xmax - VT) * i / 300; xs0.push(x); y0.push(0.5 * g0(x)); z0.push(0); }
      for (let i = 0; i <= 300; i++) { const x = p1.o.xmin + (VT - p1.o.xmin) * i / 300; xs1.push(x); y1.push(0.5 * g1(x)); z1.push(0); }
      p1.fillBetween(xs0, y0, z0, "--s1", 0.35).fillBetween(xs1, y1, z1, "--s2", 0.35);
      p1.fn(function (x) { return 0.5 * g0(x); }, "--s1", 2).fn(function (x) { return 0.5 * g1(x); }, "--s2", 2).vline(VT, "--text", [5, 4], "V_T");
      const pe = 0.5 * M.Q((VT - s0) / s) + 0.5 * M.Q((s1 - VT) / s), opt = (s0 + s1) / 2, peo = M.Q((s1 - s0) / (2 * s));
      $("pe-out").textContent = "P(error | 0) = Q((V_T − s₀)/σ) = " + M.Q((VT - s0) / s).toExponential(3) + "   ·   P(error | 1) = Q((s₁ − V_T)/σ) = " + M.Q((s1 - VT) / s).toExponential(3) +
        "\nPe = " + pe.toExponential(3) + "   ·   umbral óptimo V_T = " + opt.toFixed(2) + " V → Pe mín = Q(" + ((s1 - s0) / (2 * s)).toFixed(3) + ") = " + peo.toExponential(3) +
        "\n(Con los valores por defecto se reproduce la CP 17: A = 2 V, σ = 0,707 V)";
    }
    on(["pe-f", "pe-a", "pe-s", "pe-t"], draw);
    C.onRedraw(draw);
  })();

  // ------------------------------------------------------------------ BER
  (function () {
    if (!$("sim-ber")) return;
    const p1 = new Plot($("br-c1"), { xmin: -2, xmax: 16, ymin: -10, ymax: 0, aspect: 0.42, xstep: 2, ystep: 1, xlabel: "E_b/N₀ (dB)", ylabel: "P_e", yfmt: function (v) { return v === 0 ? "1" : sup(v); } });
    function draw() {
      const e = num("br-e"), lin = Math.pow(10, e / 10);
      const pu = function (d) { return Math.log10(Math.max(1e-300, M.Q(Math.sqrt(Math.pow(10, d / 10))))); };
      const pp = function (d) { return Math.log10(Math.max(1e-300, M.Q(Math.sqrt(2 * Math.pow(10, d / 10))))); };
      p1.clear().vline(-1.59, "--muted", [3, 3], "Shannon").fn(pu, "--s1", 2).fn(pp, "--s2", 2).vline(e, "--text", [4, 4]);
      p1.points([e, e], [pu(e), pp(e)], "--text", 4);
      p1.text(12.5, -1, "— unipolar", "--s1").text(12.5, -1.7, "— polar", "--s2");
      $("br-out").textContent = "E_b/N₀ = " + e.toFixed(1) + " dB (" + lin.toFixed(2) + ")   ·   unipolar Pe = Q(√(E_b/N₀)) = " + M.Q(Math.sqrt(lin)).toExponential(3) + "   ·   polar Pe = Q(√(2E_b/N₀)) = " + M.Q(Math.sqrt(2 * lin)).toExponential(3);
    }
    on(["br-e"], draw);
    C.onRedraw(draw);
  })();
})();
