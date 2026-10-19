// Interactivos de Líneas de Transmisión y Antenas.
// Cada widget se inicializa solo si su contenedor existe en la página.
(function () {
  "use strict";
  const C = window.Course;
  const $ = function (id) { return document.getElementById(id); };
  const num = function (id, d) { const e = $(id); if (!e) return d; const v = parseFloat(String(e.value).replace(",", ".")); return isFinite(v) ? v : d; };
  const on = function (ids, fn) { ids.forEach(function (id) { const e = $(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); };
  const PI = Math.PI, TAU = 2 * Math.PI, c0 = 299792458;
  const f2 = function (v, n) { if (!isFinite(v)) return v > 0 ? "∞" : "−∞"; return (+v.toFixed(n === undefined ? 3 : n)).toLocaleString("es-ES", { maximumFractionDigits: n === undefined ? 3 : n }); };

  // ---------- Complejos ----------
  const cx = function (r, i) { return { r: r, i: i || 0 }; };
  const add = function (a, b) { return cx(a.r + b.r, a.i + b.i); };
  const sub = function (a, b) { return cx(a.r - b.r, a.i - b.i); };
  const mul = function (a, b) { return cx(a.r * b.r - a.i * b.i, a.r * b.i + a.i * b.r); };
  const div = function (a, b) { const d = b.r * b.r + b.i * b.i; return cx((a.r * b.r + a.i * b.i) / d, (a.i * b.r - a.r * b.i) / d); };
  const cabs = function (a) { return Math.hypot(a.r, a.i); };
  const carg = function (a) { return Math.atan2(a.i, a.r); };
  const expj = function (t) { return cx(Math.cos(t), Math.sin(t)); };
  const ONE = cx(1, 0);
  const csqrt = function (a) { const m = Math.sqrt(cabs(a)), t = carg(a) / 2; return cx(m * Math.cos(t), m * Math.sin(t)); };
  const fz = function (z, n) { if (z === Infinity) return "∞"; const d = n === undefined ? 2 : n; return f2(z.r, d) + (z.i < 0 ? " − j" : " + j") + f2(Math.abs(z.i), d); };
  const fpol = function (z, n) { return f2(cabs(z), n === undefined ? 3 : n) + "∠" + f2(carg(z) * 180 / PI, 1) + "°"; };

  // Γ de una impedancia normalizada z (z = Infinity → Γ = 1)
  function G(z) { return z === Infinity ? ONE : div(sub(z, ONE), add(z, ONE)); }
  function Zof(g) { const d = sub(ONE, g); return cabs(d) < 1e-12 ? Infinity : div(add(ONE, g), d); }
  // impedancia (o admitancia) normalizada vista d longitudes de onda hacia el generador
  function tr(z, d) {
    if (z === Infinity) { const t = Math.tan(TAU * d); return Math.abs(t) < 1e-12 ? Infinity : cx(0, -1 / t); }
    const t = Math.tan(TAU * d);
    if (!isFinite(t) || Math.abs(t) > 1e12) return div(ONE, z);
    return div(add(z, cx(0, t)), add(ONE, mul(z, cx(0, t))));
  }
  const roe = function (m) { return m >= 1 - 1e-12 ? Infinity : (1 + m) / (1 - m); };
  const rl = function (m) { return m < 1e-12 ? Infinity : -20 * Math.log10(m); };
  function dmaxmin(g) { let th = carg(g); if (th < 0) th += TAU; const dmax = th / (4 * PI); return [dmax, (dmax + 0.25) % 0.5]; }

  // ---------- Carta de Smith en canvas ----------
  function Smith(canvas) { this.c = canvas; this.resize(); }
  Smith.prototype.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(this.c.parentElement.clientWidth || 420, 520);
    this.c.style.width = w + "px"; this.c.style.height = w + "px";
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(w * dpr);
    this.ctx = this.c.getContext("2d"); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.R = w / 2 - 22; this.cx = w / 2; this.cy = w / 2;
    return this;
  };
  Smith.prototype.P = function (g) { return [this.cx + g.r * this.R, this.cy - g.i * this.R]; };
  Smith.prototype.grid = function (adm) {
    this.resize();
    const ctx = this.ctx, R = this.R, X = this.cx, Y = this.cy, self = this;
    ctx.clearRect(0, 0, this.W, this.W);
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R, 0, TAU); ctx.clip();
    ctx.lineWidth = 0.8; ctx.strokeStyle = C.cssVar("--plot-grid");
    const s = adm ? -1 : 1;   // la carta de admitancias es la de impedancias girada 180°
    [0.2, 0.5, 1, 2, 5].forEach(function (r) {
      ctx.beginPath(); ctx.arc(X + s * R * r / (1 + r), Y, R / (1 + r), 0, TAU); ctx.stroke();
    });
    [0.2, 0.5, 1, 2, 5].forEach(function (x) {
      [x, -x].forEach(function (xx) { ctx.beginPath(); ctx.arc(X + s * R, Y - s * R / xx, R / Math.abs(xx), 0, TAU); ctx.stroke(); });
    });
    ctx.strokeStyle = C.cssVar("--plot-axis");
    ctx.beginPath(); ctx.moveTo(X - R, Y); ctx.lineTo(X + R, Y); ctx.stroke();
    ctx.beginPath(); ctx.arc(X + s * R / 2, Y, R / 2, 0, TAU); ctx.lineWidth = 1.1; ctx.stroke();   // r = 1 (o g = 1)
    ctx.restore();
    ctx.strokeStyle = C.cssVar("--plot-axis"); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(X, Y, R, 0, TAU); ctx.stroke();
    // rótulos
    ctx.fillStyle = C.cssVar("--muted"); ctx.font = "10px " + (C.cssVar("--font-mono") || "monospace");
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    [0.2, 0.5, 1, 2, 5].forEach(function (r) { const p = self.P(G(cx(r, 0))); const xx = adm ? 2 * X - p[0] : p[0]; ctx.fillText(String(r), xx, Y - 2); });
    [0.2, 0.5, 1, 2, 5].forEach(function (x) {
      [x, -x].forEach(function (xx) {
        const g = G(cx(0, xx)); const p = self.P(adm ? cx(-g.r, -g.i) : g);
        const ox = (p[0] - X) / R * 12, oy = (p[1] - Y) / R * 12;
        ctx.fillText((xx > 0 ? (adm ? "−" : "+") : (adm ? "+" : "−")) + "j" + x, p[0] + ox, p[1] + oy + 5);
      });
    });
    ctx.textAlign = "left"; ctx.fillText(adm ? "y = ∞ (CC)" : "z = 0 (CC)", 2, Y + 14);
    ctx.textAlign = "right"; ctx.fillText(adm ? "y = 0 (CA)" : "z = ∞ (CA)", this.W - 2, Y + 14);
    return this;
  };
  Smith.prototype.dot = function (g, color, label, r) {
    const ctx = this.ctx, p = this.P(g);
    ctx.fillStyle = C.color(color); ctx.beginPath(); ctx.arc(p[0], p[1], r || 4.5, 0, TAU); ctx.fill();
    if (label) { ctx.font = "600 12px " + (C.cssVar("--font-sans") || "sans-serif"); ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(label, p[0] + 6, p[1] - 3); }
    return this;
  };
  Smith.prototype.circle = function (center, rad, color, dash, w) {
    const ctx = this.ctx, p = this.P(center);
    ctx.strokeStyle = C.color(color); ctx.lineWidth = w || 1.5; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.arc(p[0], p[1], rad * this.R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    return this;
  };
  // arco a |Γ| constante girando "hacia el generador" (sentido horario) un ángulo 4πd
  Smith.prototype.rot = function (g, d, color, w) {
    const ctx = this.ctx, m = cabs(g), a0 = carg(g);
    ctx.strokeStyle = C.color(color); ctx.lineWidth = w || 3;
    ctx.beginPath();
    const n = Math.max(8, Math.ceil(d * 200));
    for (let k = 0; k <= n; k++) { const a = a0 - 4 * PI * d * k / n, p = this.P(cx(m * Math.cos(a), m * Math.sin(a))); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke();
    return this;
  };
  Smith.prototype.radial = function (g, color) {
    const ctx = this.ctx, p = this.P(g), q = this.P(cx(Math.cos(carg(g)), Math.sin(carg(g))));
    ctx.strokeStyle = C.color(color); ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(this.cx, this.cy); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.setLineDash([]);
    return this;
  };
  // trazo de una curva de puntos Γ
  Smith.prototype.path = function (gs, color, w, dash) {
    const ctx = this.ctx; ctx.strokeStyle = C.color(color); ctx.lineWidth = w || 2; ctx.setLineDash(dash || []);
    ctx.beginPath(); gs.forEach(function (g, k) { const p = this.P(g); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }, this); ctx.stroke(); ctx.setLineDash([]);
    return this;
  };

  // ============================================================
  // T1 · onda estacionaria animada
  // ============================================================
  function initStanding() {
    if (!$("sw-cv")) return;
    const P = new C.Plot($("sw-cv"), { xmin: -1.5, xmax: 0, ymin: -2.2, ymax: 2.2, aspect: 0.45, xlabel: "z/λ", ylabel: "v(z,t)/V₀⁺", xstep: 0.25, ystep: 1 });
    const pre = { acop: [50, 0], cc: [0, 0], ca: [1e9, 0], r2: [100, 0], r13: [50 / 3, 0], react: [0, 50], comp: [30, 100] };
    let t = 0, run = true, last = 0;
    $("sw-pre").addEventListener("change", function () { const p = pre[this.value]; if (!p) return; $("sw-z0").value = 50; $("sw-rl").value = p[0] >= 1e9 ? "inf" : p[0]; $("sw-xl").value = p[1]; info(); });
    $("sw-play").addEventListener("click", function () { run = !run; this.textContent = run ? "Pausar" : "Reanudar"; if (run) requestAnimationFrame(loop); });
    function load() {
      const z0 = num("sw-z0", 50), rv = String($("sw-rl").value).trim().toLowerCase();
      if (rv === "inf" || rv === "∞" || parseFloat(rv) >= 1e8) return { z0: z0, g: ONE };
      return { z0: z0, g: G(div(cx(num("sw-rl", 50), num("sw-xl", 0)), cx(z0, 0))) };
    }
    function info() {
      const L = load(), m = cabs(L.g), dm = dmaxmin(L.g);
      $("sw-out").textContent = "Γ_L = " + fpol(L.g) + "   ·   ROE = " + f2(roe(m), 2) + "   ·   RL = " + f2(rl(m), 2) + " dB   ·   potencia reflejada = " + f2(100 * m * m, 1) + " %" +
        (m > 1e-6 && m < 0.9999 ? "\nPrimer máximo de |V| a " + f2(dm[0], 3) + "λ de la carga, primer mínimo a " + f2(dm[1], 3) + "λ." : m >= 0.9999 ? "\nReflexión total: nodos (|V| = 0) cada λ/2." : "\nLínea acoplada: solo onda incidente, |V| constante (onda viajera).");
      draw();
    }
    function draw() {
      const L = load(), a = num("sw-a", 0) * 0.15;   // α en Np por longitud de onda
      const show = { inc: $("sw-i").checked, ref: $("sw-r").checked, tot: $("sw-t").checked, env: $("sw-e").checked };
      const wt = TAU * t;
      // V(z) = V0+ [e^{-γz} + Γ e^{γz}], z ≤ 0 (carga en z = 0); fasor por e^{jωt}
      const vin = function (z) { const b = TAU * z; return cx(Math.exp(-a * z) * Math.cos(-b), Math.exp(-a * z) * Math.sin(-b)); };
      const vre = function (z) { const b = TAU * z, e = Math.exp(a * z); return mul(L.g, cx(e * Math.cos(b), e * Math.sin(b))); };
      const inst = function (v) { return v.r * Math.cos(wt) - v.i * Math.sin(wt); };
      P.clear();
      if (show.env) { P.fn(function (z) { return cabs(add(vin(z), vre(z))); }, "--muted", 1.2, [4, 4]); P.fn(function (z) { return -cabs(add(vin(z), vre(z))); }, "--muted", 1.2, [4, 4]); }
      if (show.inc) P.fn(function (z) { return inst(vin(z)); }, "--s2", 1.5);
      if (show.ref) P.fn(function (z) { return inst(vre(z)); }, "--s3", 1.5);
      if (show.tot) P.fn(function (z) { return inst(add(vin(z), vre(z))); }, "--s1", 2.5);
      P.text(-0.02, 2.0, "carga", "--muted", "right"); P.text(-1.48, 2.0, "← hacia el generador", "--muted", "left");
    }
    function loop(ts) { if (!run) return; if (ts - last > 30) { t += 0.012 * num("sw-v", 1); last = ts; draw(); } requestAnimationFrame(loop); }
    on(["sw-z0", "sw-rl", "sw-xl"], info); on(["sw-a", "sw-i", "sw-r", "sw-t", "sw-e"], draw);
    C.onRedraw(info); requestAnimationFrame(loop);
  }

  // T1 · calculadora de γ y Z0
  function initGamma() {
    if (!$("gz-out")) return;
    function upd() {
      const R = num("gz-R", 0), L = num("gz-L", 0) * 1e-6, Gp = num("gz-G", 0), Cc = num("gz-C", 0) * 1e-12, f = num("gz-f", 1) * 1e6, w = TAU * f;
      const zs = cx(R, w * L), yp = cx(Gp, w * Cc);
      let g = csqrt(mul(zs, yp)); if (g.r < 0) g = cx(-g.r, -g.i);
      const z0 = csqrt(div(zs, yp)), b0 = w * Math.sqrt(L * Cc), z00 = Math.sqrt(L / Cc);
      const lowloss = R < 0.1 * w * L && Gp < 0.1 * w * Cc;
      $("gz-out").textContent =
        "Con pérdidas:  γ = α + jβ = " + f2(g.r, 4) + " Np/m + j" + f2(g.i, 3) + " rad/m   (α = " + f2(8.686 * g.r, 3) + " dB/m)\n" +
        "               Z₀ = " + fz(z0, 2) + " Ω = " + fpol(z0, 2) + " Ω\n" +
        "Sin pérdidas:  γ = j" + f2(b0, 3) + " rad/m,  Z₀ = √(L/C) = " + f2(z00, 2) + " Ω,  v_p = 1/√(LC) = " + f2(1 / Math.sqrt(L * Cc) / 1e8, 4) + "·10⁸ m/s,  λ = " + f2(TAU / b0, 4) + " m\n" +
        (lowloss ? "Pocas pérdidas (R ≪ ωL, G ≪ ωC):  α ≈ ½(R/Z₀ + G·Z₀) = " + f2(0.5 * (R / z00 + Gp * z00), 4) + " Np/m" : "Atención: R o G no son pequeños frente a ωL, ωC; la aproximación de pocas pérdidas no vale.");
    }
    on(["gz-R", "gz-L", "gz-G", "gz-C", "gz-f"], upd); upd();
  }

  // T1 · conversor |Γ| ↔ ROE ↔ RL
  function initConv() {
    if (!$("cv-g")) return;
    let busy = false;
    function set(m, src) {
      if (busy) return; busy = true;
      if (src !== "g") $("cv-g").value = f2(m, 4).replace(/\s/g, "");
      if (src !== "s") $("cv-s").value = m >= 1 ? "∞" : f2(roe(m), 3).replace(/\s/g, "");
      if (src !== "rl") $("cv-rl").value = m <= 0 ? "∞" : f2(rl(m), 2).replace(/\s/g, "");
      $("cv-out").textContent = "Potencia reflejada |Γ|² = " + f2(100 * m * m, 2) + " %  ·  potencia entregada a la carga 1 − |Γ|² = " + f2(100 * (1 - m * m), 2) + " %  ·  pérdida por desacoplo = " + f2(m >= 1 ? Infinity : -10 * Math.log10(1 - m * m), 3) + " dB";
      busy = false;
    }
    $("cv-g").addEventListener("input", function () { const m = num("cv-g", 0); if (m >= 0 && m <= 1) set(m, "g"); });
    $("cv-s").addEventListener("input", function () { const s = num("cv-s", 1); if (s >= 1) set((s - 1) / (s + 1), "s"); });
    $("cv-rl").addEventListener("input", function () { const r = num("cv-rl", 0); if (r >= 0) set(Math.pow(10, -r / 20), "rl"); });
    set(0.5, "");
  }

  // T1 · Zin frente a l/λ
  function initZin() {
    if (!$("zi-cv")) return;
    const P = new C.Plot($("zi-cv"), { xmin: 0, xmax: 1, ymin: -4, ymax: 4, aspect: 0.45, xlabel: "l/λ", ylabel: "z_in", xstep: 0.125, ystep: 1, xfmt: function (x) { const k = Math.round(x * 8); return ["0", "λ/8", "λ/4", "3λ/8", "λ/2", "5λ/8", "3λ/4", "7λ/8", "λ"][k] || ""; } });
    const pre = { cc: [0, 0], ca: ["inf", 0], acop: [50, 0], r2: [100, 0], comp: [30, 100] };
    $("zi-pre").addEventListener("change", function () { const p = pre[this.value]; if (!p) return; $("zi-rl").value = p[0]; $("zi-xl").value = p[1]; draw(); });
    function zl() { const z0 = num("zi-z0", 50), rv = String($("zi-rl").value).trim(); if (rv === "inf" || rv === "∞") return Infinity; return div(cx(num("zi-rl", 0), num("zi-xl", 0)), cx(z0, 0)); }
    function draw() {
      const z = zl(), z0 = num("zi-z0", 50), l = num("zi-l", 0.25);
      P.clear();
      P.fn(function (x) { const w = tr(z, x); return w === Infinity ? NaN : Math.abs(w.r) > 50 ? NaN : w.r; }, "--s1", 2);
      P.fn(function (x) { const w = tr(z, x); return w === Infinity ? NaN : Math.abs(w.i) > 50 ? NaN : w.i; }, "--s2", 2);
      P.vline(l, "--s3", [3, 3]);
      const w = tr(z, l);
      $("zi-out").textContent = "l = " + f2(l, 3) + "λ (βl = " + f2(360 * l, 1) + "°):  z_in = " + (w === Infinity ? "∞" : fz(w, 3)) + "   →   Z_in = " + (w === Infinity ? "∞ (circuito abierto)" : fz(mul(w, cx(z0, 0)), 1) + " Ω") +
        "\n— r = Re{z_in}   — x = Im{z_in}   (impedancias normalizadas a Z₀ = " + z0 + " Ω; se repite cada λ/2)";
    }
    on(["zi-z0", "zi-rl", "zi-xl", "zi-l"], draw); C.onRedraw(draw);
  }

  // T1 · 1.ª evaluación: ¿a qué antena alimenta el Tx?
  function initEval() {
    if (!$("ev-svg")) return;
    const st = { s1: false, s2: false };
    function upd() {
      // stub de λ/4: cerrado (corto en el extremo) → ∞ en a; abierto → 0 en a (corto sobre la línea)
      const za = st.s1 ? "Z₀" : "0", zaT = st.s1 ? "Z₀" : "∞";   // impedancia de la rama B vista desde el Tx
      const zb = st.s2 ? "Z₀" : "0", zbT = st.s2 ? "Z₀" : "∞";
      const feedsB = st.s1, feedsA = st.s2;
      let txt = "S1 " + (st.s1 ? "cerrado" : "abierto") + ": el stub de λ/4 " + (st.s1 ? "termina en cortocircuito → en a–b se ve ∞ (no carga la línea) → en a–b sigue viéndose Z_B = Z₀ → en el Tx, Z_B′ = Z₀." : "termina en circuito abierto → en a–b se ve 0 (cortocircuito sobre la línea) → λ/4 más allá, en el Tx, se ve ∞: la rama B queda desconectada.") + "\n";
      txt += "S2 " + (st.s2 ? "cerrado" : "abierto") + ": " + (st.s2 ? "en a′–b′ se ve ∞ → en el Tx, Z_A′ = Z₀." : "en a′–b′ se ve 0 → en el Tx se ve ∞: la rama A queda desconectada.") + "\n";
      txt += "Impedancia que ve el Tx: " + (feedsA && feedsB ? "Z₀ ∥ Z₀ = Z₀/2 (desacoplo: Γ = −1/3, ROE = 2)" : feedsA || feedsB ? "Z₀ (acoplado)" : "∞ ∥ ∞ = ∞ (circuito abierto)") + "\n";
      txt += "⇒ El Tx alimenta " + (feedsA && feedsB ? "a las DOS antenas (A y B), cada una con la mitad de la potencia." : feedsA ? "solo a la antena A." : feedsB ? "solo a la antena B." : "a NINGUNA antena (toda la potencia se refleja).");
      $("ev-out").textContent = txt;
      $("ev-s1").textContent = "S1: " + (st.s1 ? "cerrado" : "abierto"); $("ev-s2").textContent = "S2: " + (st.s2 ? "cerrado" : "abierto");
      $("ev-s1").setAttribute("aria-pressed", st.s1); $("ev-s2").setAttribute("aria-pressed", st.s2);
      document.querySelectorAll("#ev-svg .sw1").forEach(function (e) { e.setAttribute("transform", st.s1 ? "rotate(0)" : "rotate(-35)"); });
      document.querySelectorAll("#ev-svg .sw2").forEach(function (e) { e.setAttribute("transform", st.s2 ? "rotate(0)" : "rotate(-35)"); });
      $("ev-A").setAttribute("class", feedsA ? "ant on" : "ant"); $("ev-B").setAttribute("class", feedsB ? "ant on" : "ant");
      void za; void zaT; void zb; void zbT;
    }
    $("ev-s1").addEventListener("click", function () { st.s1 = !st.s1; upd(); });
    $("ev-s2").addEventListener("click", function () { st.s2 = !st.s2; upd(); });
    upd();
  }

  // T1/T3 · transformador λ/4: |Γ| frente a f/f0
  function initQW() {
    if (!$("qw-cv")) return;
    const P = new C.Plot($("qw-cv"), { xmin: 0, xmax: 2, ymin: 0, ymax: 1, aspect: 0.42, xlabel: "f/f₀", ylabel: "|Γ|", xstep: 0.25, ystep: 0.2 });
    function draw() {
      const z0 = num("qw-z0", 50), RL = num("qw-rl", 10), gm = num("qw-gm", 0.2), Zt = Math.sqrt(z0 * RL);
      const gam = function (x) { const t = Math.tan(PI / 2 * x); const zin = div(mul(cx(Zt, 0), add(cx(RL, 0), cx(0, Zt * t))), add(cx(Zt, 0), cx(0, RL * t))); return cabs(div(sub(zin, cx(z0, 0)), add(zin, cx(z0, 0)))); };
      P.clear().fn(gam, "--s1", 2.2).hline(gm, "--s3", [4, 4], "Γm = " + gm);
      const arg = gm / Math.sqrt(1 - gm * gm) * 2 * Math.sqrt(z0 * RL) / Math.abs(RL - z0);
      const bw = arg >= 1 ? 2 : 2 - 4 / PI * Math.acos(arg), th = arg >= 1 ? 0 : Math.acos(arg);
      if (arg < 1) { P.vline(2 * th / PI, "--s2", [3, 3]); P.vline(2 - 2 * th / PI, "--s2", [3, 3]); }
      $("qw-out").textContent = "Z_T = √(Z₀R_L) = " + f2(Zt, 2) + " Ω   ·   |Γ| ≤ " + gm + " (ROE ≤ " + f2(roe(gm), 2) + ") entre f/f₀ = " + f2(2 * th / PI, 3) + " y " + f2(2 - 2 * th / PI, 3) + "   ⇒   Δf/f₀ = " + f2(100 * bw, 1) + " %";
    }
    on(["qw-z0", "qw-rl", "qw-gm"], draw); C.onRedraw(draw);
  }

  // ============================================================
  // T1b · carta de Smith
  // ============================================================
  function initBilinear() {
    if (!$("bil-cv")) return;
    const S = new Smith($("bil-cv"));
    function draw() {
      const r = num("bil-r", 1), x = num("bil-x", 1);
      S.grid(false);
      S.circle(cx(r / (1 + r), 0), 1 / (1 + r), "--s2", [], 2.5);
      const ctx = S.ctx; ctx.save(); ctx.beginPath(); ctx.arc(S.cx, S.cy, S.R, 0, TAU); ctx.clip();
      if (Math.abs(x) > 1e-6) S.circle(cx(1, 1 / x), 1 / Math.abs(x), "--s3", [], 2.5);
      else { ctx.strokeStyle = C.color("--s3"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(S.cx - S.R, S.cy); ctx.lineTo(S.cx + S.R, S.cy); ctx.stroke(); }
      ctx.restore();
      const g = G(cx(r, x)); S.dot(g, "--s1", "z").radial(g, "--muted");
      $("bil-out").textContent = "z = " + fz(cx(r, x), 2) + "   →   Γ = (z − 1)/(z + 1) = " + fz(g, 3) + " = " + fpol(g) +
        "\nCircunferencia r = " + r + ": centro (" + f2(r / (1 + r), 3) + "; 0), radio " + f2(1 / (1 + r), 3) +
        "\nArco x = " + x + ": " + (Math.abs(x) > 1e-6 ? "centro (1; " + f2(1 / x, 3) + "), radio " + f2(1 / Math.abs(x), 3) : "eje real");
    }
    on(["bil-r", "bil-x"], draw); C.onRedraw(draw);
  }

  function initSmith() {
    if (!$("sm-cv")) return;
    const S = new Smith($("sm-cv"));
    function draw() {
      const z0 = num("sm-z0", 50), l = num("sm-l", 0), adm = $("sm-adm").checked;
      const zl = div(cx(num("sm-rl", 30), num("sm-xl", 100)), cx(z0, 0));
      const gL = G(zl), m = cabs(gL), gin = mul(gL, expj(-4 * PI * l)), zin = Zof(gin), dm = dmaxmin(gL);
      S.grid(false);
      S.circle(cx(0, 0), m, "--s2", [5, 4], 1.4);
      S.rot(gL, l, "--s3", 3.5);
      S.radial(gL, "--muted").dot(gL, "--s1", "z_L");
      if (l > 0) S.dot(gin, "--s3", "z_in");
      if (adm) { S.dot(cx(-gL.r, -gL.i), "--s4", "y_L"); }
      S.dot(cx(m, 0), "--muted", "", 3).dot(cx(-m, 0), "--muted", "", 3);
      const yl = div(ONE, zl);
      $("sm-out").textContent =
        "z_L = Z_L/Z₀ = " + fz(zl, 3) + (adm ? "   ·   y_L = 1/z_L = " + fz(yl, 3) : "") +
        "\nΓ_L = " + fpol(gL) + "   ·   ROE = " + f2(roe(m), 3) + " (se lee donde la circunferencia de |Γ| corta el eje real derecho)   ·   RL = " + f2(rl(m), 2) + " dB" +
        "\nGirando l = " + f2(l, 3) + "λ hacia el generador (sentido horario, 2βl = " + f2(720 * l, 1) + "°):  Γ_in = " + fpol(gin) + ",  z_in = " + fz(zin, 3) + ",  Z_in = " + (zin === Infinity ? "∞" : fz(mul(zin, cx(z0, 0)), 2) + " Ω") +
        "\nPrimer máximo de |V| a " + f2(dm[0], 4) + "λ (R_máx = ROE·Z₀ = " + f2(roe(m) * z0, 1) + " Ω); primer mínimo a " + f2(dm[1], 4) + "λ (R_mín = Z₀/ROE = " + f2(z0 / roe(m), 1) + " Ω).";
    }
    on(["sm-z0", "sm-rl", "sm-xl", "sm-l", "sm-adm"], draw); C.onRedraw(draw);
  }

  // ============================================================
  // T2 · guías de onda
  // ============================================================
  function rectModes(a, b, er, nmax) {
    const out = [];
    for (let m = 0; m < (nmax || 5); m++) for (let n = 0; n < (nmax || 5); n++) {
      if (!m && !n) continue;
      const fc = c0 / (2 * Math.sqrt(er)) * Math.hypot(m / a, n / b);
      out.push({ fc: fc, name: "TE" + m + n, m: m, n: n, te: true });
      if (m && n) out.push({ fc: fc, name: "TM" + m + n, m: m, n: n, te: false });
    }
    return out.sort(function (p, q) { return p.fc - q.fc || (p.te ? -1 : 1); });
  }
  function initModes() {
    if (!$("md-cv")) return;
    const P = new C.Plot($("md-cv"), { xmin: 0, xmax: 30, ymin: 0, ymax: 8, aspect: 0.5, xlabel: "f (GHz)", ylabel: "", grid: true, yfmt: function () { return ""; } });
    const P2 = $("md-cv2") ? new C.Plot($("md-cv2"), { xmin: 0, xmax: 30, ymin: 0, ymax: 3, aspect: 0.42, xlabel: "f (GHz)", ylabel: "", ystep: 0.5 }) : null;
    function draw() {
      const a = num("md-a", 2.286) / 100, b = num("md-b", 1.016) / 100, er = num("md-er", 1), f = num("md-f", 10) * 1e9;
      const ms = rectModes(a, b, er, 6).slice(0, 8), f10 = ms[0].fc, fnext = ms.find(function (q) { return q.fc > f10 * 1.0001; }).fc;
      const xmax = Math.max(1.2 * ms[ms.length - 1].fc / 1e9, f / 1e9 * 1.15);
      P.set({ xmax: xmax, ymax: ms.length + 0.5 }).clear();
      P.fillBetween([f10 / 1e9, fnext / 1e9], [0, 0], [ms.length + 0.5, ms.length + 0.5], "--ok", 0.15);
      ms.forEach(function (q, k) {
        const y = ms.length - k;
        P.line([q.fc / 1e9, xmax], [y, y], q.fc < f ? "--s1" : "--muted", 5);
        P.text(q.fc / 1e9, y + 0.32, q.name + " · " + f2(q.fc / 1e9, 2), q.fc < f ? "--s1" : "--muted", "left");
      });
      P.vline(f / 1e9, "--s3", [4, 3], "f");
      const prop = ms.filter(function (q) { return q.fc < f; }).map(function (q) { return q.name; });
      let txt = "Banda monomodo (solo TE₁₀): " + f2(f10 / 1e9, 3) + " – " + f2(fnext / 1e9, 3) + " GHz;  uso recomendado ≈ 1,25 f_c10 – 0,95 f_c(siguiente) = " + f2(1.25 * f10 / 1e9, 2) + " – " + f2(0.95 * fnext / 1e9, 2) + " GHz\n";
      txt += "A f = " + f2(f / 1e9, 3) + " GHz se propagan: " + (prop.length ? prop.join(", ") : "ningún modo (todos al corte: ondas evanescentes)");
      if (f > f10) {
        const k = TAU * f * Math.sqrt(er) / c0, x = 1 - Math.pow(f10 / f, 2), beta = k * Math.sqrt(x), eta = 376.73 / Math.sqrt(er);
        txt += "\nTE₁₀: β = " + f2(beta, 2) + " rad/m · λ_g = " + f2(TAU / beta * 100, 3) + " cm (λ = " + f2(c0 / (f * Math.sqrt(er)) * 100, 3) + " cm) · v_p = " + f2(1 / Math.sqrt(x), 3) + "·c/√εr · v_g = " + f2(Math.sqrt(x), 3) + "·c/√εr · Z_TE = " + f2(eta / Math.sqrt(x), 1) + " Ω";
      } else {
        const k = TAU * f * Math.sqrt(er) / c0, al = Math.sqrt(Math.pow(PI / a, 2) - k * k);
        txt += "\nTE₁₀ al corte: decae como e^(−αz) con α = " + f2(al, 1) + " Np/m = " + f2(8.686 * al, 0) + " dB/m.";
      }
      $("md-out").textContent = txt;
      if (P2) {
        P2.set({ xmax: xmax }).clear();
        const xi = function (fg) { return 1 - Math.pow(f10 / (fg * 1e9), 2); };
        P2.fn(function (fg) { const x = xi(fg); return x > 0 ? 1 / Math.sqrt(x) : NaN; }, "--s1", 2)
          .fn(function (fg) { const x = xi(fg); return x > 0 ? Math.sqrt(x) : NaN; }, "--s2", 2)
          .vline(f10 / 1e9, "--muted", [3, 3], "f_c10").hline(1, "--muted", [2, 3]).vline(f / 1e9, "--s3", [4, 3]);
      }
    }
    on(["md-a", "md-b", "md-er", "md-f"], draw);
    const ps = $("md-wr"); if (ps) ps.addEventListener("change", function () { const v = this.value.split(","); if (v.length > 1) { $("md-a").value = v[0]; $("md-b").value = v[1]; draw(); } });
    C.onRedraw(draw);
  }

  // campo transversal de un modo de la guía rectangular
  function initField() {
    if (!$("fd-cv")) return;
    const cv = $("fd-cv");
    function draw() {
      const m = Math.round(num("fd-m", 1)), n = Math.round(num("fd-n", 0)), te = $("fd-t").value === "TE", showH = $("fd-h").checked;
      const dpr = window.devicePixelRatio || 1, W = Math.min(cv.parentElement.clientWidth || 420, 560), H = Math.round(W * 0.5);
      cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const pad = 14, gw = W - 2 * pad, gh = H - 2 * pad, a = 2, b = 1;
      const ok = te ? (m + n > 0) : (m > 0 && n > 0);
      ctx.strokeStyle = C.cssVar("--fg"); ctx.lineWidth = 3; ctx.strokeRect(pad, pad, gw, gh);
      if (!ok) { $("fd-out").textContent = te ? "TE₀₀ no existe (todos los campos serían nulos)." : "TM" + m + n + " no existe: los TM necesitan m ≥ 1 y n ≥ 1 (E_z = B sen(mπx/a) sen(nπy/b) sería nulo)."; return; }
      // campos (fase común omitida): TE ⇒ Ex ∝ (n/b) cos(mπx/a) sin(nπy/b), Ey ∝ −(m/a) sin cos; Hx ∝ (m/a) sin cos, Hy ∝ (n/b) cos sin
      //                               TM ⇒ Ex ∝ (m/a) cos sin, Ey ∝ (n/b) sin cos;          Hx ∝ −(n/b) sin cos, Hy ∝ (m/a) cos sin
      const E = function (x, y) {
        const cxm = Math.cos(m * PI * x / a), sxm = Math.sin(m * PI * x / a), cyn = Math.cos(n * PI * y / b), syn = Math.sin(n * PI * y / b);
        return te ? [n / b * cxm * syn, -m / a * sxm * cyn] : [m / a * cxm * syn, n / b * sxm * cyn];
      };
      const Hf = function (x, y) {
        const cxm = Math.cos(m * PI * x / a), sxm = Math.sin(m * PI * x / a), cyn = Math.cos(n * PI * y / b), syn = Math.sin(n * PI * y / b);
        return te ? [m / a * sxm * cyn, n / b * cxm * syn] : [-n / b * sxm * cyn, m / a * cxm * syn];
      };
      // sombreado |E|
      const N = 60, M = 30; let mx = 0;
      for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { const e = E(a * i / N, b * j / M); mx = Math.max(mx, Math.hypot(e[0], e[1])); }
      const acc = C.cssVar("--s1");
      for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
        const e = E(a * (i + 0.5) / N, b * (j + 0.5) / M), v = Math.hypot(e[0], e[1]) / mx;
        ctx.globalAlpha = 0.55 * v; ctx.fillStyle = acc; ctx.fillRect(pad + gw * i / N, pad + gh * (M - j - 1) / M, gw / N + 0.6, gh / M + 0.6);
      }
      ctx.globalAlpha = 1;
      const arrow = function (x, y, v, col, sc) {
        const X = pad + gw * x / a, Y = pad + gh * (1 - y / b), L = Math.hypot(v[0], v[1]); if (L < 0.08) return;
        const ux = v[0] / L, uy = -v[1] / L, len = sc * Math.min(1, L);
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(X - ux * len / 2, Y - uy * len / 2); ctx.lineTo(X + ux * len / 2, Y + uy * len / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X + ux * len / 2, Y + uy * len / 2); ctx.lineTo(X + ux * len / 2 - 4 * ux + 2.5 * uy, Y + uy * len / 2 - 4 * uy - 2.5 * ux); ctx.lineTo(X + ux * len / 2 - 4 * ux - 2.5 * uy, Y + uy * len / 2 - 4 * uy + 2.5 * ux); ctx.fill();
      };
      const nx = 16, ny = 8, step = gw / nx * 0.8;
      let hm = 0; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const h = Hf(a * (i + 0.5) / nx, b * (j + 0.5) / ny); hm = Math.max(hm, Math.hypot(h[0], h[1])); }
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const x = a * (i + 0.5) / nx, y = b * (j + 0.5) / ny, e = E(x, y);
        arrow(x, y, [e[0] / mx, e[1] / mx], C.cssVar("--fg"), step);
        if (showH) { const h = Hf(x, y); arrow(x, y, [h[0] / hm * 0.7, h[1] / hm * 0.7], C.cssVar("--s2"), step); }
      }
      $("fd-out").textContent = (te ? "TE" : "TM") + m + n + ": " + m + " semiciclo(s) de variación a lo ancho (x, dimensión a) y " + n + " a lo alto (y, dimensión b). " +
        "Flechas negras: E transversal" + (showH ? "; azules: H transversal" : "") + ". Sombreado: |E_t|. " + (te ? "H_z ≠ 0, E_z = 0." : "E_z ≠ 0, H_z = 0.") +
        "\nEn las paredes el E tangencial se anula (condición de contorno de conductor perfecto).";
    }
    on(["fd-m", "fd-n", "fd-t", "fd-h"], draw); C.onRedraw(draw);
  }

  function initCirc() {
    if (!$("ci-out")) return;
    function upd() {
      const r = num("ci-r", 1.2) / 100, er = num("ci-er", 1), k = c0 / (TAU * r * Math.sqrt(er));
      const modes = [["TE11", 1.841], ["TM01", 2.405], ["TE21", 3.054], ["TE01", 3.832], ["TM11", 3.832], ["TE31", 4.201], ["TM21", 5.135]];
      $("ci-out").textContent = modes.map(function (q) { return q[0] + ": p = " + q[1] + " → f_c = " + f2(q[1] * k / 1e9, 3) + " GHz,  λ_c = " + f2(TAU / q[1], 2) + "·a"; }).join("\n") +
        "\nBanda monomodo (solo TE₁₁): " + f2(1.841 * k / 1e9, 3) + " – " + f2(2.405 * k / 1e9, 3) + " GHz   (2,61a < λ < 3,41a)";
    }
    on(["ci-r", "ci-er"], upd); upd();
  }

  // ============================================================
  // T2b · microcinta y coplanar
  // ============================================================
  const msE = function (er, u) { return (er + 1) / 2 + (er - 1) / 2 / Math.sqrt(1 + 12 / u); };
  const msZ = function (er, u) { const e = msE(er, u); return u <= 1 ? 60 / Math.sqrt(e) * Math.log(8 / u + u / 4) : 120 * PI / (Math.sqrt(e) * (u + 1.393 + 0.667 * Math.log(u + 1.444))); };
  function msSyn(er, z0) {
    const A = z0 / 60 * Math.sqrt((er + 1) / 2) + (er - 1) / (er + 1) * (0.23 + 0.11 / er);
    const u = 8 * Math.exp(A) / (Math.exp(2 * A) - 2);
    if (u < 2) return u;
    const B = 377 * PI / (2 * z0 * Math.sqrt(er));
    return 2 / PI * (B - 1 - Math.log(2 * B - 1) + (er - 1) / (2 * er) * (Math.log(B - 1) + 0.39 - 0.61 / er));
  }
  function initMicro() {
    if (!$("ms-out")) return;
    const P = new C.Plot($("ms-cv"), { xmin: -1, xmax: 1.3, ymin: 0, ymax: 200, aspect: 0.5, xlabel: "W/h", ylabel: "Z₀ (Ω)", xstep: 0.5, ystep: 25, xfmt: function (x) { const v = Math.pow(10, x); return v >= 1 ? f2(v, 1) : f2(v, 2); } });
    function upd() {
      const er = num("ms-er", 4.4), h = num("ms-h", 1.6) / 1000, w = num("ms-w", 3) / 1000, f = num("ms-f", 2.4) * 1e9, tand = num("ms-tand", 0.02), z0t = num("ms-z", 50);
      const u = w / h, ee = msE(er, u), z0 = msZ(er, u), k0 = TAU * f / c0, lam = c0 / (f * Math.sqrt(ee));
      const ad = k0 * er * (ee - 1) * tand / (2 * Math.sqrt(ee) * (er - 1)), Rs = Math.sqrt(PI * f * 4e-7 * PI / 5.813e7), ac = Rs / (z0 * w);
      const g = 0.6 + 0.009 * z0, fp = z0 / (8 * PI * h * 100), eef = er - (er - ee) / (1 + g * Math.pow(f / 1e9 / fp, 2));
      const us = msSyn(er, z0t), ees = msE(er, us);
      $("ms-out").textContent =
        "ANÁLISIS  W/h = " + f2(u, 3) + " (" + (u <= 1 ? "cinta estrecha, W/h ≤ 1" : "cinta ancha, W/h ≥ 1") + ")\n" +
        "  ε_eff (estática) = " + f2(ee, 3) + "   ε_eff(" + f2(f / 1e9, 2) + " GHz) ≈ " + f2(eef, 3) + " (dispersión, Pozar 3.200)\n" +
        "  Z₀ = " + f2(z0, 2) + " Ω   ·   λ_g = λ₀/√ε_eff = " + f2(lam * 1000, 2) + " mm   ·   λ_g/4 = " + f2(lam * 250, 2) + " mm\n" +
        "  α_d = " + f2(8.686 * ad, 4) + " dB/m   ·   α_c ≈ R_s/(Z₀W) = " + f2(8.686 * ac, 4) + " dB/m (cobre, R_s = " + f2(Rs * 1000, 2) + " mΩ)\n" +
        "SÍNTESIS  para Z₀ = " + z0t + " Ω:  W/h = " + f2(us, 4) + "  →  W = " + f2(us * h * 1000, 3) + " mm,  ε_eff = " + f2(ees, 3) + ",  comprobación Z₀(W) = " + f2(msZ(er, us), 2) + " Ω";
      P.clear();
      [[1, "--muted"], [2.2, "--s2"], [4.4, "--s1"], [10, "--s3"]].forEach(function (q) { P.fn(function (x) { return msZ(q[0], Math.pow(10, x)); }, q[1], q[0] === er ? 2.6 : 1.4); });
      P.fn(function (x) { return msZ(er, Math.pow(10, x)); }, "--s4", 2.6, [6, 3]);
      P.points([Math.log10(u)], [z0], "--s4", 5).hline(z0t, "--muted", [3, 3]);
    }
    on(["ms-er", "ms-h", "ms-w", "ms-f", "ms-tand", "ms-z"], upd); C.onRedraw(upd);
  }
  const ellK = function (k) { let a = 1, b = Math.sqrt(1 - k * k); for (let i = 0; i < 30; i++) { const t = (a + b) / 2; b = Math.sqrt(a * b); a = t; } return PI / (2 * a); };
  function initCPW() {
    if (!$("cp-out")) return;
    function upd() {
      const er = num("cp-er", 9.8), S = num("cp-s", 0.25), W = num("cp-w", 0.1), h = num("cp-h", 0.635);
      const k1 = S / (S + 2 * W), k2 = Math.sinh(PI * S / (4 * h)) / Math.sinh(PI * (S + 2 * W) / (4 * h)), kp = function (k) { return Math.sqrt(1 - k * k); };
      const ee = 1 + (er - 1) / 2 * ellK(k2) * ellK(kp(k1)) / (ellK(kp(k2)) * ellK(k1)), z0 = 30 * PI / Math.sqrt(ee) * ellK(kp(k1)) / ellK(k1);
      const eeInf = (er + 1) / 2;
      $("cp-out").textContent = "k₁ = S/(S+2W) = " + f2(k1, 4) + "   k₂ = " + f2(k2, 4) + "\nε_eff = " + f2(ee, 3) + "  (sustrato infinito: (εr+1)/2 = " + f2(eeInf, 3) + ")   ·   Z₀ = " + f2(z0, 2) + " Ω";
    }
    on(["cp-er", "cp-s", "cp-w", "cp-h"], upd); upd();
  }

  // ============================================================
  // T3 · stub simple
  // ============================================================
  function roots(f, a, b, n) {
    const out = []; n = n || 2000;
    let x0 = a, f0 = f(a);
    for (let k = 1; k <= n; k++) {
      const x1 = a + (b - a) * k / n, f1 = f(x1);
      if (isFinite(f0) && isFinite(f1) && f0 * f1 < 0) { let lo = x0, hi = x1, flo = f0; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2, fm = f(mid); if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; } } out.push((lo + hi) / 2); }
      x0 = x1; f0 = f1;
    }
    return out;
  }
  const lenOf = function (bl) { let l = bl / TAU; l = ((l % 0.5) + 0.5) % 0.5; return l; };
  // susceptancia normalizada de un stub en paralelo (abierto: j tan βl; corto: −j cot βl). Para serie es igual con reactancias pero intercambiado.
  function stubLen(x, paralelo, abierto) {
    const tanForm = paralelo ? abierto : !abierto;   // forma j·tan βl
    return tanForm ? lenOf(Math.atan(x)) : lenOf(Math.atan2(-1, x));
  }
  function stubVal(l, fr, paralelo, abierto) {
    const t = Math.tan(TAU * l * fr), tanForm = paralelo ? abierto : !abierto;
    return tanForm ? cx(0, t) : cx(0, -1 / t);
  }
  function stubDesign(zl, paralelo) {
    const w0 = paralelo ? div(ONE, zl) : zl, sols = [];
    roots(function (d) { const w = tr(w0, d); return w === Infinity ? NaN : w.r - 1; }, 0, 0.5).forEach(function (d) { const w = tr(w0, d); sols.push({ d: d, need: -w.i, w: w }); });
    return sols;
  }
  function initStub() {
    if (!$("st-sm")) return;
    const S = new Smith($("st-sm"));
    const P = new C.Plot($("st-cv"), { xmin: 0.5, xmax: 1.5, ymin: 0, ymax: 1, aspect: 0.45, xlabel: "f/f₀", ylabel: "|Γ|", xstep: 0.1, ystep: 0.2 });
    function draw() {
      const z0 = num("st-z0", 50), R = num("st-rl", 15), X = num("st-xl", 10), f0 = num("st-f0", 2);
      const paralelo = $("st-conf").value === "p", abierto = $("st-term").value === "ca", k = parseInt($("st-sol").value, 10) || 0;
      const zl = div(cx(R, X), cx(z0, 0)), sols = stubDesign(zl, paralelo);
      if (!sols.length) { $("st-out").textContent = "La carga ya está acoplada (z_L = 1)."; return; }
      const s = sols[Math.min(k, sols.length - 1)], l = stubLen(s.need, paralelo, abierto);
      // carta
      S.grid(paralelo);
      const wL = paralelo ? div(ONE, zl) : zl, gw = G(wL), gpt = function (w) { const g = G(w); return paralelo ? cx(-g.r, -g.i) : g; };
      S.circle(cx(0, 0), cabs(gw), "--s2", [5, 4], 1.3);
      const gp = gpt(wL); S.dot(gp, "--s1", paralelo ? "y_L" : "z_L");
      // giro d hacia el generador (en la carta de admitancias el giro es el mismo: horario)
      S.rot(gp, s.d, "--s3", 3.5); S.dot(gpt(s.w), "--s3", paralelo ? "y₁ = 1 " + (s.w.i >= 0 ? "+" : "−") + " j" + f2(Math.abs(s.w.i), 2) : "z₁");
      S.dot(cx(0, 0), "--ok", "1", 5);
      // stub: de y = ∞ (CC) o y = 0 (CA) girando l
      const g0 = gpt(abierto ? (paralelo ? cx(0, 0) : Infinity) : (paralelo ? Infinity : cx(0, 0)));
      S.rot(g0, l, "--s4", 2.5); S.dot(g0, "--s4", "", 3.5);
      // |Γ| frente a frecuencia (carga R + L o R + C)
      P.clear();
      const gam = function (fr, sol, ll) {
        const xf = X >= 0 ? X * fr : X / fr, z = div(cx(R, xf), cx(z0, 0));
        let w = tr(paralelo ? div(ONE, z) : z, sol.d * fr); if (w === Infinity) return 1;
        w = add(w, stubVal(ll, fr, paralelo, abierto));
        const zin = paralelo ? div(ONE, w) : w; return cabs(G(zin));
      };
      sols.forEach(function (so, i) { const ll = stubLen(so.need, paralelo, abierto); P.fn(function (fr) { return gam(fr, so, ll); }, i === 0 ? "--s1" : "--s2", i === k ? 2.6 : 1.3, i === k ? [] : [5, 3]); });
      P.hline(1 / 3, "--muted", [3, 3], "ROE = 2");
      // ancho de banda ROE ≤ 2 de la solución elegida
      let lo = 1, hi = 1; while (lo > 0.3 && gam(lo, s, l) <= 1 / 3) lo -= 0.001; while (hi < 2 && gam(hi, s, l) <= 1 / 3) hi += 0.001;
      const lam = c0 / (f0 * 1e9), elem = X >= 0 ? "L = " + f2(X / (TAU * f0 * 1e9) * 1e9, 3) + " nH" : "C = " + f2(-1 / (TAU * f0 * 1e9 * X) * 1e12, 3) + " pF";
      $("st-out").textContent = "z_L = " + fz(zl, 3) + (paralelo ? "  →  y_L = " + fz(div(ONE, zl), 3) : "") + "   (carga: R = " + R + " Ω en serie con " + elem + " a f₀ = " + f0 + " GHz)\n" +
        sols.map(function (so, i) { const ll = stubLen(so.need, paralelo, abierto); return "Solución " + (i + 1) + ": d = " + f2(so.d, 4) + "λ,  " + (paralelo ? "y₁ = 1 " : "z₁ = 1 ") + (so.w.i >= 0 ? "+ j" : "− j") + f2(Math.abs(so.w.i), 3) + ",  el stub aporta " + (so.need >= 0 ? "+j" : "−j") + f2(Math.abs(so.need), 3) + " → l = " + f2(ll, 4) + "λ"; }).join("\n") +
        "\nA f₀ (en aire, λ = " + f2(lam * 100, 2) + " cm): d = " + f2(s.d * lam * 100, 2) + " cm, l = " + f2(l * lam * 100, 2) + " cm.   Ancho de banda con ROE ≤ 2: " + f2(lo, 3) + "–" + f2(hi, 3) + " f₀ (" + f2(100 * (hi - lo), 1) + " %)";
    }
    on(["st-z0", "st-rl", "st-xl", "st-f0", "st-conf", "st-term", "st-sol"], draw); C.onRedraw(draw);
  }

  // T3 · doble stub
  function initDStub() {
    if (!$("ds-sm")) return;
    const S = new Smith($("ds-sm"));
    function draw() {
      const z0 = num("ds-z0", 50), R = num("ds-rl", 60), X = num("ds-xl", -80), d = num("ds-d", 0.125), abierto = $("ds-term").value === "ca";
      const yl = div(cx(z0, 0), cx(R, X)), t = Math.tan(TAU * d);
      const f = function (b1) { const w = tr(add(yl, cx(0, b1)), d); return w === Infinity ? NaN : w.r - 1; };
      const sols = [];
      roots(function (u) { return f(Math.tan(u)); }, -PI / 2 + 1e-6, PI / 2 - 1e-6, 4000).forEach(function (u) { const b1 = Math.tan(u), y2 = tr(add(yl, cx(0, b1)), d); sols.push({ b1: b1, b2: -y2.i, y1: add(yl, cx(0, b1)), y2: y2 }); });
      S.grid(true);
      const gp = function (w) { const g = G(w); return cx(-g.r, -g.i); };
      // circunferencia g = 1 girada d hacia la carga y zona prohibida g > 1/sen²(βd)
      const pts = [], fb = [];
      for (let k = 0; k <= 360; k++) { const b = Math.tan(-PI / 2 + PI * k / 360 * 0.999 + 0.0005); const w = tr(cx(1, b), -d); if (w !== Infinity) pts.push(gp(w)); }
      S.path(pts, "--s2", 2, [6, 3]);
      const gmax = 1 + 1 / (t * t);
      S.circle(cx(-gmax / (1 + gmax), 0), 1 / (1 + gmax), "--danger", [2, 3], 1.5);
      S.dot(gp(yl), "--s1", "y_L");
      sols.forEach(function (s, i) { S.dot(gp(s.y1), i ? "--s4" : "--s3", "y₁" + (i ? "′" : "")); S.dot(gp(s.y2), i ? "--s4" : "--s3", "y₂" + (i ? "′" : "")); });
      const len = function (b) { return abierto ? lenOf(Math.atan(b)) : lenOf(Math.atan2(-1, b)); };
      $("ds-out").textContent = "y_L = " + fz(yl, 3) + "   ·   separación d = " + d + "λ   ·   zona prohibida: g_L > 1 + cot²(βd) = " + f2(gmax, 3) + "\n" +
        (sols.length ? sols.map(function (s, i) { return "Solución " + (i + 1) + ": b₁ = " + f2(s.b1, 3) + " → l₁ = " + f2(len(s.b1), 4) + "λ;  y₂ = 1 " + (s.y2.i >= 0 ? "+ j" : "− j") + f2(Math.abs(s.y2.i), 3) + ", b₂ = " + f2(s.b2, 3) + " → l₂ = " + f2(len(s.b2), 4) + "λ"; }).join("\n") : "Sin solución: y_L está en la zona prohibida (circunferencia roja). Añade una línea entre la carga y el primer stub o reduce d.");
    }
    on(["ds-z0", "ds-rl", "ds-xl", "ds-d", "ds-term"], draw); C.onRedraw(draw);
  }

  // T3 · transformadores multisección
  function chebCoef(N, secm) {
    const Mn = 4 * N + 8, c = {};
    for (let k = N; k >= 0; k -= 2) {
      let s = 0;
      for (let i = 0; i < Mn; i++) { const th = PI * (i + 0.5) / Mn, x = secm * Math.cos(th); const T = Math.abs(x) <= 1 ? Math.cos(N * Math.acos(x)) : Math.cosh(N * Math.acosh(Math.abs(x))) * (x > 0 || N % 2 === 0 ? 1 : -1); s += T * Math.cos(k * th); }
      c[k] = s * (k ? 2 : 1) / Mn;
    }
    return c;
  }
  const comb = function (n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  function multi(type, N, z0, zl, gm) {
    const G = new Array(N + 1).fill(0);
    let th = null;
    if (type === "cheb") {
      const secm = Math.cosh(Math.acosh(Math.abs(Math.log(zl / z0)) / (2 * gm)) / N), A = zl > z0 ? gm : -gm, c = chebCoef(N, secm);
      for (let n = 0; n <= N / 2; n++) { const k = N - 2 * n; if (k === 0) G[n] = A * c[0]; else { G[n] = A * c[k] / 2; G[N - n] = G[n]; } }
      th = Math.acos(1 / secm);
    } else {
      const A = Math.pow(2, -(N + 1)) * Math.log(zl / z0);
      for (let n = 0; n <= N; n++) G[n] = A * comb(N, n);
      const x = 0.5 * Math.pow(gm / Math.abs(A), 1 / N); th = x < 1 ? Math.acos(x) : 0;
    }
    const Z = [z0]; for (let n = 0; n < N; n++) Z.push(Z[n] * Math.exp(2 * G[n]));
    return { Z: Z.slice(1), G: G, th: th };
  }
  function gamCascade(Zs, z0, zl, fr) {
    const t = Math.tan(PI / 2 * fr); let z = cx(zl, 0);
    for (let i = Zs.length - 1; i >= 0; i--) { const Zn = Zs[i]; z = div(mul(cx(Zn, 0), add(z, cx(0, Zn * t))), add(cx(Zn, 0), mul(cx(0, t), z))); }
    return cabs(div(sub(z, cx(z0, 0)), add(z, cx(z0, 0))));
  }
  function initMulti() {
    if (!$("mt-cv")) return;
    const P = new C.Plot($("mt-cv"), { xmin: 0, xmax: 2, ymin: 0, ymax: 0.4, aspect: 0.45, xlabel: "f/f₀", ylabel: "|Γ|", xstep: 0.25, ystep: 0.05 });
    function draw() {
      const type = $("mt-type").value, N = Math.max(1, Math.min(6, Math.round(num("mt-n", 2)))), z0 = num("mt-z0", 60), zl = num("mt-zl", 120), gm = num("mt-gm", 0.05);
      const r = multi(type, N, z0, zl, gm), g1 = Math.abs((zl - z0) / (zl + z0));
      P.set({ ymax: Math.max(0.1, Math.ceil(g1 * 1.1 * 20) / 20) }).clear();
      P.fn(function (x) { return gamCascade([Math.sqrt(z0 * zl)], z0, zl, x); }, "--muted", 1.3, [5, 3]);
      P.fn(function (x) { return gamCascade(r.Z, z0, zl, x); }, "--s1", 2.4);
      P.hline(gm, "--s3", [3, 3], "Γm");
      if (r.th) { P.vline(2 * r.th / PI, "--s2", [3, 3]); P.vline(2 - 2 * r.th / PI, "--s2", [3, 3]); }
      $("mt-out").textContent = (type === "cheb" ? "Chebyshev" : "Binomial") + ", N = " + N + ":  " + r.Z.map(function (z, i) { return "Z" + (i + 1) + " = " + f2(z, 2) + " Ω"; }).join(",  ") +
        "\nΓ_n = " + r.G.map(function (g) { return f2(g, 4); }).join("; ") + (r.th ? "\nθ_m = " + f2(r.th * 180 / PI, 2) + "°  ⇒  Δf/f₀ = 2 − 4θ_m/π = " + f2(100 * (2 - 4 * r.th / PI), 1) + " %  (línea discontinua: un solo λ/4)" : "");
    }
    on(["mt-type", "mt-n", "mt-z0", "mt-zl", "mt-gm"], draw); C.onRedraw(draw);
  }

  function initExp() {
    if (!$("ex-cv")) return;
    const P = new C.Plot($("ex-cv"), { xmin: 0, xmax: 6 * PI, ymin: 0, ymax: 0.5, aspect: 0.42, xlabel: "βL", ylabel: "|Γ|", xstep: PI, ystep: 0.1, xfmt: function (x) { const k = Math.round(x / PI); return k ? k + "π" : "0"; } });
    function draw() {
      const z0 = num("ex-z0", 50), zl = num("ex-zl", 100), gm = num("ex-gm", 0.05), g0 = 0.5 * Math.abs(Math.log(zl / z0));
      const gfun = function (x) { return x === 0 ? g0 : g0 * Math.abs(Math.sin(x) / x); };
      let x1 = 0; for (let x = 30 * PI; x > 0.01; x -= 0.001) if (gfun(x) > gm) { x1 = x; break; }
      P.set({ ymax: Math.max(0.1, Math.ceil(g0 * 1.1 * 20) / 20), xmax: Math.max(6 * PI, x1 * 3.3) }).clear();
      P.fn(gfun, "--s1", 2.2).hline(gm, "--s3", [3, 3], "Γm").vline(x1, "--s2", [3, 3]);
      $("ex-out").textContent = "Γ(θ) = ½·ln(Z_L/Z₀)·e^(−jβL)·sen(βL)/(βL)   ⇒   |Γ| máx = ½|ln(Z_L/Z₀)| = " + f2(g0, 4) +
        "\n|Γ| ≤ " + gm + " para βL ≥ " + f2(x1, 3) + " rad  ⇒  L ≥ " + f2(x1 / TAU, 3) + "λ (a la frecuencia más baja)." +
        "\nPara cubrir f₁…3f₁ (100 % de ancho de banda) se necesita L = " + f2(x1 / TAU, 3) + "λ₁ = " + f2(2 * x1 / TAU, 3) + "λ₀ (λ₀ a la frecuencia central f₀ = 2f₁)." +
        "\nFactor de ahusamiento: a·L = ln(Z_L/Z₀) = " + f2(Math.log(zl / z0), 4);
    }
    on(["ex-z0", "ex-zl", "ex-gm"], draw); C.onRedraw(draw);
  }

  document.addEventListener("DOMContentLoaded", function () {
    [initStanding, initGamma, initConv, initZin, initEval, initQW, initBilinear, initSmith, initModes, initField, initCirc, initMicro, initCPW, initStub, initDStub, initMulti, initExp].forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  });
  window.LTA = { G: G, Zof: Zof, tr: tr, multi: multi, gamCascade: gamCascade, msSyn: msSyn, msZ: msZ };
})();
