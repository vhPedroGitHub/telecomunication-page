// Interactivos de Matemáticas para Telecom.
// Depende de assets/js/course.js (Course.Plot, Course.M, Course.onRedraw).
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function val(id) { const e = document.getElementById(id); return e ? parseFloat(e.value) : 0; }
  function fmt(x) { return window.Course ? Course.M.fmt(x) : String(x); }

  // ---------------------------------------------------- transformación lineal 2×2
  function initMatriz() {
    const canvas = document.getElementById("mat-canvas");
    if (!canvas || !window.Course) return;
    const out = document.getElementById("mat-out");
    const plot = new Course.Plot(canvas, {
      xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5, xlabel: "x", ylabel: "y", aspect: 0.48
    });

    function draw() {
      const a = val("mat-a"), b = val("mat-b"), c = val("mat-c"), d = val("mat-d");
      plot.set({ xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5 }).clear();
      // rejilla transformada
      for (let k = -3; k <= 3; k++) {
        plot.line([k, k], [-3, 3], "--plot-grid", 1);
        plot.line([-3, 3], [k, k], "--plot-grid", 1);
      }
      // ejes
      plot.hline(0, "--plot-axis", [], "");
      plot.vline(0, "--plot-axis", [], "");
      // cuadrado unitario original
      const ox = [0, 1, 1, 0, 0], oy = [0, 0, 1, 1, 0];
      plot.line(ox, oy, "--muted", 1.4, [5, 4]);
      // imagen del cuadrado unitario
      const tx = [], ty = [];
      for (let i = 0; i < ox.length; i++) {
        tx.push(a * ox[i] + b * oy[i]);
        ty.push(c * ox[i] + d * oy[i]);
      }
      plot.fillBetween(tx, new Array(tx.length).fill(0), ty, "--s2", 0.2);
      plot.line(tx, ty, "--s2", 2.2);
      plot.points(tx.slice(0, 4), ty.slice(0, 4), "--s2", 3);
      const det = a * d - b * c;
      out.textContent =
        "A = [ " + fmt(a) + "  " + fmt(b) + " ]\n" +
        "    [ " + fmt(c) + "  " + fmt(d) + " ]\n" +
        "det(A) = " + fmt(det) + "     " +
        (Math.abs(det) < 1e-9 ? "transformación singular (colapsa el plano)" :
          det > 0 ? "conserva la orientación" : "invierte la orientación") + "\n" +
        "El cuadrado unidad (discontinuo) se convierte en el paralelogramo rojo; su área es |det(A)| = " + fmt(Math.abs(det)) + ".";
    }
    ["mat-a", "mat-b", "mat-c", "mat-d"].forEach(function (id) {
      const e = document.getElementById(id);
      if (e) e.addEventListener("input", draw);
    });
    Course.onRedraw(draw);
    draw();
  }

  // ---------------------------------------------------- campo de direcciones / Euler
  function initEDO() {
    const canvas = document.getElementById("ode-canvas");
    if (!canvas || !window.Course) return;
    const sel = document.getElementById("ode-fn");
    const hSlider = document.getElementById("ode-h");
    const out = document.getElementById("ode-out");
    const plot = new Course.Plot(canvas, {
      xmin: -2, xmax: 4, ymin: -2, ymax: 4, xlabel: "x", ylabel: "y", aspect: 0.48
    });

    const presets = {
      logistico: { f: function (x, y) { return y * (1 - y); }, x0: 0, y0: 0.15, ymin: -0.5, ymax: 2.2, label: "y′ = y(1 − y)" },
      decaimiento: { f: function (x, y) { return -2 * y + 4; }, x0: 0, y0: 3, ymin: -0.5, ymax: 4.5, label: "y′ = −2y + 4" },
      mixta: { f: function (x, y) { return x - y; }, x0: 0, y0: 3, ymin: -2, ymax: 4, label: "y′ = x − y" },
      oscilador: { f: function (x, y) { return -0.8 * y; }, x0: 0, y0: 3, ymin: -0.5, ymax: 3.5, label: "y′ = −0,8y (relajación)" }
    };

    function draw() {
      const p = presets[sel.value] || presets.logistico;
      let h = val("ode-h");
      plot.set({ xmin: -2, xmax: 4, ymin: p.ymin, ymax: p.ymax }).clear();
      // campo de pendientes
      for (let x = -1.8; x <= 3.8; x += 0.45) {
        for (let y = p.ymin + 0.25; y <= p.ymax - 0.1; y += (p.ymax - p.ymin) / 11) {
          const m = p.f(x, y);
          if (!isFinite(m)) continue;
          const ang = Math.atan(m), L = 0.16;
          plot.line([x - L * Math.cos(ang), x + L * Math.cos(ang)],
                    [y - L * Math.sin(ang), y + L * Math.sin(ang)], "--muted", 1);
        }
      }
      // solución de Euler
      let x = p.x0, y = p.y0;
      const xs = [x], ys = [y];
      for (let i = 0; i < 300; i++) {
        y = y + h * p.f(x, y);
        x = x + h;
        if (!isFinite(y) || y < p.ymin - 4 || y > p.ymax + 4) break;
        xs.push(x); ys.push(y);
        if (x > 4) break;
      }
      plot.line(xs, ys, "--s1", 2.4);
      plot.points([p.x0], [p.y0], "--s2", 4);
      out.textContent =
        p.label + "     h = " + fmt(h) + "     pasos = " + (xs.length - 1) + "\n" +
        "condición inicial: y(" + fmt(p.x0) + ") = " + fmt(p.y0) + "\n" +
        "último punto: x = " + fmt(xs[xs.length - 1]) + "     y ≈ " + fmt(ys[ys.length - 1]) + "\n" +
        "Trapecios o RK4 dan mayor precisión con el mismo h; Euler es el método más simple.";
    }
    sel.addEventListener("change", draw);
    hSlider.addEventListener("input", draw);
    Course.onRedraw(draw);
    draw();
  }

  // ---------------------------------------------------- series de Fourier
  function initFourier() {
    const canvas = document.getElementById("fourier-canvas");
    if (!canvas || !window.Course) return;
    const nSlider = document.getElementById("fourier-n");
    const sel = document.getElementById("fourier-wave");
    const out = document.getElementById("fourier-out");
    const plot = new Course.Plot(canvas, {
      xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: -1.8, ymax: 1.8,
      xlabel: "x", ylabel: "f(x)", aspect: 0.44
    });

    function partial(kind, N, x) {
      let s = 0;
      if (kind === "cuadrada") {
        for (let k = 1; k <= N; k += 2) s += Math.sin(k * x) / k;
        return (4 / Math.PI) * s;
      }
      if (kind === "diente") {
        for (let k = 1; k <= N; k++) s += Math.pow(-1, k + 1) * Math.sin(k * x) / k;
        return (2 / Math.PI) * s;
      }
      for (let k = 1; k <= N; k += 2) s += Math.pow(-1, (k - 1) / 2) * Math.sin(k * x) / (k * k);
      return (8 / (Math.PI * Math.PI)) * s;
    }
    function target(kind, x) {
      if (kind === "cuadrada") return Math.sin(x) >= 0 ? 1 : -1;
      if (kind === "diente") {
        const t = ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        return t / Math.PI;
      }
      return 2 / Math.PI * Math.asin(Math.sin(x));
    }

    function draw() {
      const kind = sel.value, N = parseInt(nSlider.value, 10);
      plot.clear();
      plot.fn(function (x) { return target(kind, x); }, "--muted", 1.4, [5, 4], 1200);
      plot.fn(function (x) { return partial(kind, N, x); }, "--s1", 2.2, [], 1600);
      out.textContent =
        "Onda " + kind + " · armónicos hasta n = " + N + "\n" +
        "Serie: suma de senos de frecuencias enteras; al aumentar n la aproximación mejora, " +
        "salvo el sobreimpulso cerca de las discontinuidades (fenómeno de Gibbs).";
    }
    sel.addEventListener("change", draw);
    nSlider.addEventListener("input", draw);
    Course.onRedraw(draw);
    draw();
  }

  // ---------------------------------------------------- distribución normal
  function initNormal() {
    const canvas = document.getElementById("prob-canvas");
    if (!canvas || !window.Course) return;
    const muS = document.getElementById("prob-mu");
    const sigS = document.getElementById("prob-sigma");
    const zS = document.getElementById("prob-z");
    const out = document.getElementById("prob-out");
    const plot = new Course.Plot(canvas, {
      xmin: -5, xmax: 5, ymin: 0, ymax: 1.05, xlabel: "z", ylabel: "φ(z)", aspect: 0.4
    });

    function pdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
    function cdf(z) { return 0.5 * Course.M.erfc(-z / Math.SQRT2); }

    function draw() {
      const mu = val("prob-mu"), sigma = val("prob-sigma"), z = val("prob-z");
      const xmin = mu - 4.2 * sigma, xmax = mu + 4.2 * sigma;
      plot.set({ xmin: xmin, xmax: xmax, ymin: 0, ymax: 1.15, xlabel: "x", ylabel: "f(x)" }).clear();
      plot.fn(function (x) { const t = (x - mu) / sigma; return pdf(t) / sigma; }, "--s1", 2.3, [], 1200);
      // sombreado P(X ≤ x)
      const xs = [], y1 = [], y2 = [];
      const N = 300;
      for (let i = 0; i <= N; i++) {
        const xx = xmin + (xmax - xmin) * i / N;
        xs.push(xx); y1.push(0);
        y2.push(xx <= z ? pdf((xx - mu) / sigma) / sigma : 0);
      }
      plot.fillBetween(xs, y1, y2, "--s3", 0.22);
      plot.vline(z, "--s2", [4, 4], "x");
      const p = cdf((z - mu) / sigma);
      out.textContent =
        "X ~ N(μ = " + fmt(mu) + ", σ = " + fmt(sigma) + ")\n" +
        "x = " + fmt(z) + "     z = (x − μ)/σ = " + fmt((z - mu) / sigma) + "\n" +
        "P(X ≤ x) = " + fmt(p) + "     P(X ≥ x) = " + fmt(1 - p) + "\n" +
        "Regla 68–95–99,7: en μ ± σ, μ ± 2σ y μ ± 3σ está el 68,3 %, 95,4 % y 99,7 %.";
    }
    [muS, sigS, zS].forEach(function (e) { if (e) e.addEventListener("input", draw); });
    Course.onRedraw(draw);
    draw();
  }

  // ---------------------------------------------------- descenso de gradiente
  function initOptimizacion() {
    const canvas = document.getElementById("opt-canvas");
    if (!canvas || !window.Course) return;
    const sel = document.getElementById("opt-fn");
    const lrS = document.getElementById("opt-lr");
    const itS = document.getElementById("opt-it");
    const out = document.getElementById("opt-out");
    const plot = new Course.Plot(canvas, {
      xmin: -3, xmax: 3, ymin: -1, ymax: 9, xlabel: "x", ylabel: "f(x)", aspect: 0.44
    });

    const presets = {
      cuad: {
        f: function (x) { return x * x; },
        df: function (x) { return 2 * x; },
        x0: -2.6, ymin: -1, ymax: 9, expr: "f(x) = x²", grad: "f′(x) = 2x"
      },
      cuartica: {
        f: function (x) { return x * x * x * x - 3 * x * x + 2; },
        df: function (x) { return 4 * x * x * x - 6 * x; },
        x0: -2.2, ymin: -1, ymax: 4, expr: "f(x) = x⁴ − 3x² + 2", grad: "f′(x) = 4x³ − 6x"
      },
      barranco: {
        f: function (x) { return 0.1 * x * x + 0.5 * Math.sin(3 * x) + 1; },
        df: function (x) { return 0.2 * x + 1.5 * Math.cos(3 * x); },
        x0: -2.8, ymin: -0.5, ymax: 4, expr: "f(x) = 0,1x² + 0,5 sen(3x) + 1", grad: "f′(x) = 0,2x + 1,5 cos(3x)"
      }
    };

    function draw() {
      const p = presets[sel.value] || presets.cuad;
      const lr = val("opt-lr"), it = parseInt(itS.value, 10);
      let x = p.x0;
      const xs = [x], ys = [p.f(x)];
      for (let i = 0; i < it; i++) {
        x = x - lr * p.df(x);
        if (!isFinite(x) || Math.abs(x) > 1e4) break;
        xs.push(x); ys.push(p.f(x));
      }
      plot.set({ xmin: -3, xmax: 3, ymin: p.ymin, ymax: p.ymax }).clear();
      plot.fn(p.f, "--s1", 2.4, [], 900);
      plot.line(xs, ys, "--s2", 1.4, [3, 3]);
      plot.points(xs, ys, "--s2", 2.2);
      out.textContent =
        p.expr + "     " + p.grad + "\n" +
        "x₀ = " + fmt(p.x0) + "     tasa de aprendizaje η = " + fmt(lr) + "     iteraciones = " + it + "\n" +
        "x final = " + fmt(x) + "     f(x final) = " + fmt(p.f(x)) + "\n" +
        "Si η es demasiado grande el método diverge; si es muy pequeño, converge muy despacio.";
    }
    sel.addEventListener("change", draw);
    lrS.addEventListener("input", draw);
    itS.addEventListener("input", draw);
    Course.onRedraw(draw);
    draw();
  }

  ready(function () {
    initMatriz();
    initEDO();
    initFourier();
    initNormal();
    initOptimizacion();
  });
})();
