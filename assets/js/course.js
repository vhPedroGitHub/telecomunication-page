// Utilidades compartidas de las páginas de asignatura:
// - renderizado de fórmulas con KaTeX
// - índice lateral automático con resaltado de la sección visible
// - preguntas de autoevaluación (.quiz)
// - Plot: graficador en canvas que respeta el tema claro/oscuro
(function () {
  "use strict";

  // ---------- Colores desde variables CSS ----------
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }
  function color(c) {
    if (!c) return cssVar("--s1");
    return c.startsWith("--") ? cssVar(c) : c;
  }

  // ---------- Redibujado al cambiar tema o tamaño ----------
  const redrawers = [];
  function onRedraw(fn) { redrawers.push(fn); fn(); }
  function redrawAll() { redrawers.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  let rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(redrawAll, 120); });
  new MutationObserver(redrawAll).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redrawAll); } catch (e) {}

  // ---------- Graficador ----------
  function niceStep(range, target) {
    const raw = range / (target || 6);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }
  function fmt(v) {
    if (Math.abs(v) < 1e-12) return "0";
    const a = Math.abs(v);
    if (a >= 1e4 || a < 1e-3) return v.toExponential(0);
    return String(+v.toFixed(4));
  }

  function Plot(canvas, opt) {
    this.c = canvas;
    this.o = Object.assign({ xmin: -1, xmax: 1, ymin: -1, ymax: 1, xlabel: "", ylabel: "", pad: [14, 14, 30, 44], aspect: 0.42, grid: true }, opt || {});
    this.resize();
  }
  Plot.prototype.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    const w = this.c.clientWidth || this.c.parentElement.clientWidth || 600;
    const h = Math.round(w * (this.o.aspect));
    this.c.style.height = h + "px";
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    this.ctx = this.c.getContext("2d"); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.H = h;
    return this;
  };
  Plot.prototype.set = function (o) { Object.assign(this.o, o); return this; };
  Plot.prototype.X = function (x) { const p = this.o.pad; return p[3] + (x - this.o.xmin) / (this.o.xmax - this.o.xmin) * (this.W - p[1] - p[3]); };
  Plot.prototype.Y = function (y) { const p = this.o.pad; return p[0] + (this.o.ymax - y) / (this.o.ymax - this.o.ymin) * (this.H - p[0] - p[2]); };
  Plot.prototype.clear = function () {
    this.resize();
    const ctx = this.ctx, o = this.o, p = o.pad;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.font = "11px " + (cssVar("--font-mono") || "monospace");
    ctx.lineWidth = 1;
    // rejilla y marcas
    const sx = o.xstep || niceStep(o.xmax - o.xmin, Math.max(3, Math.floor(this.W / 90)));
    const sy = o.ystep || niceStep(o.ymax - o.ymin, Math.max(3, Math.floor(this.H / 50)));
    ctx.strokeStyle = cssVar("--plot-grid"); ctx.fillStyle = cssVar("--plot-axis");
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let x = Math.ceil(o.xmin / sx) * sx; x <= o.xmax + 1e-9; x += sx) {
      const X = this.X(x);
      if (o.grid) { ctx.beginPath(); ctx.moveTo(X, p[0]); ctx.lineTo(X, this.H - p[2]); ctx.stroke(); }
      ctx.fillText(o.xfmt ? o.xfmt(x) : fmt(x), X, this.H - p[2] + 4);
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let y = Math.ceil(o.ymin / sy) * sy; y <= o.ymax + 1e-9; y += sy) {
      const Y = this.Y(y);
      if (o.grid) { ctx.beginPath(); ctx.moveTo(p[3], Y); ctx.lineTo(this.W - p[1], Y); ctx.stroke(); }
      ctx.fillText(o.yfmt ? o.yfmt(y) : fmt(y), p[3] - 5, Y);
    }
    // ejes
    ctx.strokeStyle = cssVar("--plot-axis"); ctx.lineWidth = 1.2;
    const y0 = Math.min(Math.max(0, o.ymin), o.ymax), x0 = Math.min(Math.max(0, o.xmin), o.xmax);
    ctx.beginPath(); ctx.moveTo(p[3], this.Y(y0)); ctx.lineTo(this.W - p[1], this.Y(y0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.X(x0), p[0]); ctx.lineTo(this.X(x0), this.H - p[2]); ctx.stroke();
    ctx.fillStyle = cssVar("--muted"); ctx.font = "italic 12px serif";
    if (o.xlabel) { ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(o.xlabel, this.W - p[1], this.Y(y0) - 3); }
    if (o.ylabel) { ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(o.ylabel, this.X(x0) + 5, p[0]); }
    return this;
  };
  Plot.prototype.clip = function (fn) {
    const ctx = this.ctx, p = this.o.pad;
    ctx.save(); ctx.beginPath(); ctx.rect(p[3], p[0] - 2, this.W - p[1] - p[3], this.H - p[0] - p[2] + 4); ctx.clip();
    fn(ctx); ctx.restore();
  };
  Plot.prototype.line = function (xs, ys, c, w, dash) {
    const self = this;
    this.clip(function (ctx) {
      ctx.strokeStyle = color(c); ctx.lineWidth = w || 2; ctx.setLineDash(dash || []);
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i < xs.length; i++) {
        if (!isFinite(ys[i])) { pen = false; continue; }
        const X = self.X(xs[i]), Y = self.Y(ys[i]);
        pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true;
      }
      ctx.stroke(); ctx.setLineDash([]);
    });
    return this;
  };
  Plot.prototype.fn = function (f, c, w, dash, n) {
    n = n || Math.max(400, Math.round(this.W * 1.5));
    const xs = [], ys = [], o = this.o;
    for (let i = 0; i <= n; i++) { const x = o.xmin + (o.xmax - o.xmin) * i / n; xs.push(x); ys.push(f(x)); }
    return this.line(xs, ys, c, w, dash);
  };
  // escalera (señales muestreadas/cuantificadas, formas de onda digitales)
  Plot.prototype.steps = function (xs, ys, c, w) {
    const X = [], Y = [];
    for (let i = 0; i < xs.length; i++) {
      X.push(xs[i]); Y.push(ys[i]);
      if (i + 1 < xs.length) { X.push(xs[i + 1]); Y.push(ys[i]); }
    }
    return this.line(X, Y, c, w);
  };
  // rayas espectrales (punto en el extremo) o impulsos (flecha)
  Plot.prototype.stems = function (xs, ys, c, opts) {
    const self = this, o = opts || {};
    this.clip(function (ctx) {
      const col = color(c); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = o.width || 2;
      for (let i = 0; i < xs.length; i++) {
        if (!isFinite(ys[i])) continue;
        const X = self.X(xs[i]), Y0 = self.Y(o.base || 0), Y = self.Y(ys[i]);
        ctx.beginPath(); ctx.moveTo(X, Y0); ctx.lineTo(X, Y); ctx.stroke();
        if (o.arrow) {
          const d = ys[i] >= (o.base || 0) ? 1 : -1;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - 4, Y + 8 * d); ctx.lineTo(X + 4, Y + 8 * d); ctx.closePath(); ctx.fill();
        } else if (o.dot !== false) {
          ctx.beginPath(); ctx.arc(X, Y, 3, 0, 2 * Math.PI); ctx.fill();
        }
        if (o.labels && o.labels[i]) {
          ctx.font = "11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = ys[i] >= 0 ? "bottom" : "top";
          ctx.fillText(o.labels[i], X, Y + (ys[i] >= 0 ? -5 : 5));
        }
      }
    });
    return this;
  };
  Plot.prototype.points = function (xs, ys, c, r) {
    const self = this;
    this.clip(function (ctx) {
      ctx.fillStyle = color(c);
      for (let i = 0; i < xs.length; i++) { ctx.beginPath(); ctx.arc(self.X(xs[i]), self.Y(ys[i]), r || 3, 0, 2 * Math.PI); ctx.fill(); }
    });
    return this;
  };
  Plot.prototype.fillBetween = function (xs, y1, y2, c, alpha) {
    const self = this;
    this.clip(function (ctx) {
      ctx.globalAlpha = alpha == null ? 0.2 : alpha; ctx.fillStyle = color(c);
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) { const X = self.X(xs[i]), Y = self.Y(y1[i]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      for (let i = xs.length - 1; i >= 0; i--) ctx.lineTo(self.X(xs[i]), self.Y(y2[i]));
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    });
    return this;
  };
  Plot.prototype.vline = function (x, c, dash, label) {
    const ctx = this.ctx, p = this.o.pad;
    ctx.strokeStyle = color(c || "--muted"); ctx.setLineDash(dash || [4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(this.X(x), p[0]); ctx.lineTo(this.X(x), this.H - p[2]); ctx.stroke(); ctx.setLineDash([]);
    if (label) { ctx.fillStyle = color(c || "--muted"); ctx.font = "11px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(label, this.X(x) + 3, p[0]); }
    return this;
  };
  Plot.prototype.hline = function (y, c, dash, label) {
    const ctx = this.ctx, p = this.o.pad;
    ctx.strokeStyle = color(c || "--muted"); ctx.setLineDash(dash || [4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(p[3], this.Y(y)); ctx.lineTo(this.W - p[1], this.Y(y)); ctx.stroke(); ctx.setLineDash([]);
    if (label) { ctx.fillStyle = color(c || "--muted"); ctx.font = "11px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(label, this.W - p[1] - 2, this.Y(y) - 2); }
    return this;
  };
  Plot.prototype.text = function (x, y, s, c, align) {
    const ctx = this.ctx; ctx.fillStyle = color(c || "--text"); ctx.font = "12px sans-serif";
    ctx.textAlign = align || "left"; ctx.textBaseline = "middle"; ctx.fillText(s, this.X(x), this.Y(y));
    return this;
  };

  // ---------- Matemática auxiliar ----------
  const M = {
    sinc: function (x) { return Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x); },
    rect: function (x) { const a = Math.abs(x); return a < 0.5 ? 1 : a === 0.5 ? 0.5 : 0; },
    tri: function (x) { const a = Math.abs(x); return a < 1 ? 1 - a : 0; },
    // erfc con error relativo < 1.2e-7 en todo el eje (aproximación de Chebyshev, Numerical Recipes)
    erfc: function (x) {
      const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
      const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
        t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
      return x >= 0 ? r : 2 - r;
    },
    // Q(z) = ½·erfc(z/√2)
    Q: function (z) { return 0.5 * M.erfc(z / Math.SQRT2); },
    Qinv: function (p) { let lo = -10, hi = 40; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; M.Q(m) > p ? lo = m : hi = m; } return (lo + hi) / 2; },
    log2: function (x) { return Math.log(x) / Math.LN2; },
    fmt: fmt,
    // DFT de magnitud (para espectros numéricos de demostración)
    dft: function (x) {
      const N = x.length, re = new Array(N).fill(0), im = new Array(N).fill(0);
      for (let k = 0; k < N; k++) for (let n = 0; n < N; n++) { const a = -2 * Math.PI * k * n / N; re[k] += x[n] * Math.cos(a); im[k] += x[n] * Math.sin(a); }
      return { re: re, im: im };
    }
  };

  // ---------- KaTeX ----------
  function renderMath() {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false,
      ignoredClasses: ["no-math"],
      macros: {
        "\\sinc": "\\operatorname{sinc}",
        "\\rect": "\\Pi",
        "\\F": "\\mathcal{F}",
        "\\E": "\\mathbf{E}",
        "\\dB": "\\,\\text{dB}",
        "\\Hz": "\\,\\text{Hz}",
        "\\ang": "\\angle",
        "\\sen": "\\operatorname{sen}",
        "\\tg": "\\operatorname{tg}",
        "\\arcsen": "\\operatorname{arcsen}"
      }
    });
  }

  // ---------- Índice lateral ----------
  function buildToc() {
    const toc = document.querySelector("nav.toc ol[data-auto]");
    const content = document.querySelector("main.content");
    if (!toc || !content) return;
    let currentLi = null, sub = null;
    content.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      const a = document.createElement("a");
      a.href = "#" + h.id; a.textContent = h.dataset.toc || h.textContent.replace(/\s+/g, " ").trim();
      const li = document.createElement("li"); li.appendChild(a);
      if (h.tagName === "H2") { toc.appendChild(li); currentLi = li; sub = null; }
      else if (currentLi) { if (!sub) { sub = document.createElement("ol"); currentLi.appendChild(sub); } sub.appendChild(li); }
    });
    const links = Array.from(toc.querySelectorAll("a"));
    const map = new Map(links.map(function (a) { return [a.getAttribute("href").slice(1), a]; }));
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { links.forEach(function (l) { l.classList.remove("active"); }); const a = map.get(e.target.id); if (a) a.classList.add("active"); }
      });
    }, { rootMargin: "0px 0px -75% 0px" });
    content.querySelectorAll("h2[id], h3[id]").forEach(function (h) { obs.observe(h); });
  }

  // ---------- Quiz ----------
  function initQuiz() {
    document.querySelectorAll(".quiz .q").forEach(function (q) {
      q.querySelectorAll("button.opt").forEach(function (b) {
        b.addEventListener("click", function () {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          q.querySelectorAll("button.opt").forEach(function (o) { if (o.hasAttribute("data-ok")) o.classList.add("right"); });
          if (!b.hasAttribute("data-ok")) b.classList.add("wrong");
        });
      });
    });
  }

  // ---------- Controles con salida en vivo ----------
  function bindOutputs(root) {
    (root || document).querySelectorAll("input[type=range][data-out]").forEach(function (r) {
      const out = document.getElementById(r.dataset.out);
      const unit = r.dataset.unit || "";
      const upd = function () { if (out) out.textContent = r.value + unit; };
      r.addEventListener("input", upd); upd();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildToc(); initQuiz(); bindOutputs();
    if (window.renderMathInElement) renderMath();
    else window.addEventListener("load", renderMath);
  });

  window.Course = { Plot: Plot, M: M, onRedraw: onRedraw, cssVar: cssVar, color: color, renderMath: renderMath };
})();
