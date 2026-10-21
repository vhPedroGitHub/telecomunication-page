// Interactivos del curso de Cálculo: límites, derivadas e integrales.
// Depende de assets/js/course.js (Course.Plot y Course.onRedraw).
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ---------------------------------------------------------------- límites
  function initLimites() {
    const canvas = document.getElementById("lim-canvas");
    if (!canvas || !window.Course) return;
    const sel = document.getElementById("lim-fn");
    const slider = document.getElementById("lim-x");
    const out = document.getElementById("lim-out");
    const note = document.getElementById("lim-note");

    const presets = {
      racional: {
        f: function (x) { return (x * x - 1) / (x - 1); },
        a: 1, lim: 2, xmin: -1, xmax: 3, ymin: -1, ymax: 4.5,
        expr: "(x² − 1)/(x − 1)", note: "En x = 1 la función no está definida (0/0), pero al acercarse por ambos lados el valor se acerca a 2."
      },
      sinx: {
        f: function (x) { return Math.abs(x) < 1e-12 ? NaN : Math.sin(x) / x; },
        a: 0, lim: 1, xmin: -6, xmax: 6, ymin: -0.45, ymax: 1.35,
        expr: "sen x / x", note: "Límite fundamental trigonométrico: sen x / x → 1 cuando x → 0 (en radianes)."
      },
      raiz: {
        f: function (x) { return (Math.sqrt(x + 1) - 1) / x; },
        a: 0, lim: 0.5, xmin: -0.9, xmax: 3, ymin: -0.1, ymax: 1.4,
        expr: "(√(x + 1) − 1)/x", note: "Multiplicar por el conjugado convierte la indeterminación 0/0 en un cociente manejable."
      },
      cos: {
        f: function (x) { return Math.abs(x) < 1e-9 ? 0.5 : (1 - Math.cos(x)) / (x * x); },
        a: 0, lim: 0.5, xmin: -4, xmax: 4, ymin: -0.2, ymax: 1.1,
        expr: "(1 − cos x)/x²", note: "También vale 1/2 por ambos lados; compara con sen x / x."
      },
      abss: {
        f: function (x) { return Math.abs(x) < 1e-12 ? NaN : Math.abs(x) / x; },
        a: 0, lim: null, xmin: -3, xmax: 3, ymin: -2, ymax: 2,
        expr: "|x| / x", note: "Límites laterales distintos: por la izquierda −1, por la derecha +1. El límite no existe."
      },
      cuad: {
        f: function (x) { return (x * x - 4) / (x - 2); },
        a: 2, lim: 4, xmin: 0, xmax: 4, ymin: -1, ymax: 8,
        expr: "(x² − 4)/(x − 2)", note: "Factorizar el numerador elimina el factor común (x − 2); la gráfica es una recta con un hueco."
      }
    };

    let p = presets[sel ? sel.value : "racional"] || presets.racional;
    let plot = new Course.Plot(canvas, {
      xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax,
      xlabel: "x", ylabel: "f(x)", aspect: 0.46
    });

    function draw() {
      const x = p.a + parseFloat(slider.value);
      plot.set({ xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax });
      plot.clear();
      plot.fn(p.f, "--s1", 2.2, [], 900);
      plot.vline(p.a, "--muted", [5, 4], "x = a");
      if (p.lim !== null) {
        const ys = [p.lim];
        plot.points([p.a], ys, "--s2", 4);
        plot.hline(p.lim, "--s2", [3, 3], "L = " + Course.M.fmt(p.lim));
      }
      let fx = p.f(x);
      if (!isFinite(fx)) fx = NaN;
      if (isFinite(fx)) plot.points([x], [fx], "--s3", 4);
      const fxTxt = isFinite(fx) ? Course.M.fmt(fx) : "no definida";
      const limTxt = p.lim === null ? "no existe" : Course.M.fmt(p.lim);
      out.textContent =
        "f(x) = " + p.expr + "\n" +
        "a = " + Course.M.fmt(p.a) + "     x = " + Course.M.fmt(x) + "     f(x) = " + fxTxt + "\n" +
        "límite por la izquierda ≈ " + (p.lim === null ? "−1" : Course.M.fmt(p.lim)) +
        "     por la derecha ≈ " + (p.lim === null ? "+1" : Course.M.fmt(p.lim)) + "\n" +
        "L = " + limTxt;
      note.textContent = p.note;
    }

    function reset() {
      p = presets[sel.value] || presets.racional;
      slider.value = "0";
      plot.set({ xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax });
      draw();
    }
    sel.addEventListener("change", reset);
    slider.addEventListener("input", draw);
    Course.onRedraw(draw);
    draw();
  }

  // -------------------------------------------------------------- derivadas
  function initDerivadas() {
    const canvas = document.getElementById("der-canvas");
    if (!canvas || !window.Course) return;
    const sel = document.getElementById("der-fn");
    const aSlider = document.getElementById("der-a");
    const hSlider = document.getElementById("der-h");
    const aOut = document.getElementById("der-ao");
    const hOut = document.getElementById("der-ho");
    const out = document.getElementById("der-out");

    const presets = {
      cuad: {
        f: function (x) { return x * x; }, df: function (x) { return 2 * x; },
        expr: "f(x) = x²", dexpr: "f′(x) = 2x", amin: -2.5, amax: 2.5, aval: 0.8,
        xmin: -3, xmax: 3, ymin: -2, ymax: 9
      },
      cubo: {
        f: function (x) { return x * x * x; }, df: function (x) { return 3 * x * x; },
        expr: "f(x) = x³", dexpr: "f′(x) = 3x²", amin: -1.8, amax: 1.8, aval: 0.7,
        xmin: -2, xmax: 2, ymin: -8, ymax: 8
      },
      seno: {
        f: Math.sin, df: Math.cos,
        expr: "f(x) = sen x", dexpr: "f′(x) = cos x", amin: -3, amax: 3, aval: 0.6,
        xmin: -3.4, xmax: 3.4, ymin: -1.8, ymax: 1.8
      },
      exp: {
        f: Math.exp, df: Math.exp,
        expr: "f(x) = eˣ", dexpr: "f′(x) = eˣ", amin: -2, amax: 2, aval: 0.5,
        xmin: -2.4, xmax: 2.4, ymin: -1, ymax: 8
      },
      log: {
        f: function (x) { return x > 0 ? Math.log(x) : NaN; },
        df: function (x) { return x > 0 ? 1 / x : NaN; },
        expr: "f(x) = ln x", dexpr: "f′(x) = 1/x", amin: 0.3, amax: 4.5, aval: 1.5,
        xmin: 0.05, xmax: 5, ymin: -2.5, ymax: 2.5
      }
    };

    let p = presets[sel ? sel.value : "cuad"] || presets.cuad;
    let plot = new Course.Plot(canvas, {
      xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax,
      xlabel: "x", ylabel: "y", aspect: 0.46
    });

    function draw() {
      p = presets[sel.value] || presets.cuad;
      const a = parseFloat(aSlider.value);
      let h = parseFloat(hSlider.value);
      if (Math.abs(h) < 0.02) h = h < 0 ? -0.02 : 0.02;
      const fa = p.f(a), fb = p.f(a + h);
      const sec = (fb - fa) / h;
      const tan = p.df(a);

      plot.set({ xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax }).clear();
      plot.fn(p.f, "--s1", 2.2, [], 900);
      if (isFinite(fa)) {
        const m1 = (p.f(a + 0.0005) - p.f(a - 0.0005)) / 0.001;
        if (isFinite(m1)) plot.fn(function (x) { return fa + m1 * (x - a); }, "--s2", 1.8, [7, 4], 200);
      }
      if (isFinite(fa) && isFinite(fb)) {
        const m2 = (fb - fa) / h;
        plot.fn(function (x) { return fa + m2 * (x - a); }, "--s3", 1.6, [3, 4], 200);
        plot.points([a, a + h], [fa, fb], "--s3", 4);
      }
      if (isFinite(fa)) plot.points([a], [fa], "--s2", 4);
      plot.vline(a, "--muted", [4, 4], "a");

      aOut.textContent = Course.M.fmt(a);
      hOut.textContent = Course.M.fmt(h);
      out.textContent =
        p.expr + "     " + p.dexpr + "\n" +
        "a = " + Course.M.fmt(a) + "     h = " + Course.M.fmt(h) + "\n" +
        "cociente incremental [f(a+h) − f(a)]/h = " + Course.M.fmt(sec) + "\n" +
        "derivada exacta f′(a) = " + Course.M.fmt(tan) +
        "     diferencia = " + Course.M.fmt(Math.abs(sec - tan));
    }

    function reset() {
      p = presets[sel.value] || presets.cuad;
      aSlider.min = p.amin; aSlider.max = p.amax; aSlider.step = "0.01"; aSlider.value = p.aval;
      hSlider.value = "0.8";
      plot.set({ xmin: p.xmin, xmax: p.xmax, ymin: p.ymin, ymax: p.ymax });
      draw();
    }
    sel.addEventListener("change", reset);
    aSlider.addEventListener("input", draw);
    hSlider.addEventListener("input", draw);
    Course.onRedraw(draw);
    reset();
  }

  // -------------------------------------------------------------- integrales
  function initIntegrales() {
    const canvas = document.getElementById("int-canvas");
    if (!canvas || !window.Course) return;
    const sel = document.getElementById("int-fn");
    const nSlider = document.getElementById("int-n");
    const method = document.getElementById("int-met");
    const nOut = document.getElementById("int-no");
    const out = document.getElementById("int-out");

    const presets = {
      cuad: {
        f: function (x) { return x * x; }, a: 0, b: 2, F: 8 / 3,
        expr: "f(x) = x² en [0, 2]", anti: "F(x) = x³/3", ymin: 0, ymax: 4.4
      },
      seno: {
        f: Math.sin, a: 0, b: Math.PI, F: 2,
        expr: "f(x) = sen x en [0, π]", anti: "F(x) = −cos x", ymin: 0, ymax: 1.25
      },
      raiz: {
        f: Math.sqrt, a: 0, b: 4, F: 16 / 3,
        expr: "f(x) = √x en [0, 4]", anti: "F(x) = 2x^(3/2)/3", ymin: 0, ymax: 2.5
      },
      inversa: {
        f: function (x) { return 1 / x; }, a: 1, b: 3, F: Math.log(3),
        expr: "f(x) = 1/x en [1, 3]", anti: "F(x) = ln x", ymin: 0, ymax: 1.25
      },
      exp: {
        f: Math.exp, a: 0, b: 2, F: Math.exp(2) - 1,
        expr: "f(x) = eˣ en [0, 2]", anti: "F(x) = eˣ", ymin: 0, ymax: 7.8
      }
    };

    let p = presets[sel ? sel.value : "cuad"] || presets.cuad;
    let plot = new Course.Plot(canvas, {
      xmin: p.a - 0.15, xmax: p.b + 0.15, ymin: p.ymin, ymax: p.ymax,
      xlabel: "x", ylabel: "y", aspect: 0.46
    });

    function sample(mode, i, h) {
      if (mode === "left") return p.a + i * h;
      if (mode === "right") return p.a + (i + 1) * h;
      return p.a + (i + 0.5) * h;
    }

    function draw() {
      p = presets[sel.value] || presets.cuad;
      const n = parseInt(nSlider.value, 10);
      const mode = method.value;
      const h = (p.b - p.a) / n;
      let sum = 0;
      const xs = [], y1 = [], y2 = [];

      for (let i = 0; i < n; i++) {
        const xi = sample(mode, i, h);
        const y = p.f(xi);
        sum += y * h;
        xs.push(p.a + i * h, p.a + (i + 1) * h);
        y1.push(0, 0); y2.push(y, y);
      }

      plot.set({ xmin: p.a - 0.15, xmax: p.b + 0.15, ymin: p.ymin, ymax: p.ymax }).clear();
      plot.fillBetween(xs, y1, y2, "--s3", 0.18);
      for (let i = 0; i < n; i++) {
        const x0 = p.a + i * h, x1 = x0 + h;
        plot.line([x0, x0], [0, p.f(sample(mode, i, h))], "--s3", 1);
        plot.line([x1, x1], [0, p.f(sample(mode, i, h))], "--s3", 1);
      }
      plot.fn(p.f, "--s1", 2.3, [], 900);
      plot.vline(p.a, "--muted", [4, 4]); plot.vline(p.b, "--muted", [4, 4]);

      const err = sum - p.F;
      nOut.textContent = String(n);
      out.textContent =
        p.expr + "\n" +
        p.anti + "   ⇒   integral exacta = " + Course.M.fmt(p.F) + "\n" +
        "n = " + n + "     Δx = " + Course.M.fmt(h) + "     método: " +
        (mode === "left" ? "extremo izquierdo" : mode === "right" ? "extremo derecho" : "punto medio") + "\n" +
        "suma de Riemann = " + Course.M.fmt(sum) +
        "     error = " + Course.M.fmt(err) +
        "     |error| = " + Course.M.fmt(Math.abs(err));
    }

    function reset() {
      p = presets[sel.value] || presets.cuad;
      nSlider.value = "6";
      plot.set({ xmin: p.a - 0.15, xmax: p.b + 0.15, ymin: p.ymin, ymax: p.ymax });
      draw();
    }
    sel.addEventListener("change", reset);
    nSlider.addEventListener("input", draw);
    method.addEventListener("change", draw);
    Course.onRedraw(draw);
    reset();
  }

  ready(function () {
    initLimites();
    initDerivadas();
    initIntegrales();
  });
})();
