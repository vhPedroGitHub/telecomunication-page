// Simuladores del Tema I (teoría de la información y codificación)
(function () {
  "use strict";
  const C = window.Course, M = C.M, Plot = C.Plot;
  const $ = function (id) { return document.getElementById(id); };
  const on = function (ids, fn) { ids.forEach(function (id) { const e = $(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); };
  const esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
  const Hb = function (p) { return p <= 0 || p >= 1 ? 0 : -p * M.log2(p) - (1 - p) * M.log2(1 - p); };
  function parseProbs(txt) {
    const v = txt.split(/[\s,;]+/).map(function (x) { return x.includes("/") ? x.split("/").reduce(function (a, b) { return a / b; }) : parseFloat(x); }).filter(function (x) { return isFinite(x) && x > 0; });
    const s = v.reduce(function (a, b) { return a + b; }, 0);
    return { p: v.map(function (x) { return x / s; }), raw: s };
  }

  // ------------------------------------------------------------- Entropía
  (function () {
    if (!$("sim-ent")) return;
    const p1 = new Plot($("en-c1"), { xmin: 0.4, xmax: 4.6, ymin: 0, ymax: 4, aspect: 0.62, xstep: 1, xlabel: "símbolo k", ylabel: "I(sₖ) bit" });
    const p2 = new Plot($("en-c2"), { xmin: 0, xmax: 1, ymin: 0, ymax: 1.1, aspect: 0.62, xstep: 0.1, xlabel: "p", ylabel: "𝓗(p)" });
    function draw() {
      const P = parseProbs($("en-p").value).p, K = P.length;
      if (!K) { $("en-out").textContent = "Introduce al menos una probabilidad positiva."; return; }
      const I = P.map(function (p) { return -M.log2(p); }), H = P.reduce(function (a, p, i) { return a + p * I[i]; }, 0);
      p1.set({ xmin: 0.4, xmax: K + 0.6, ymax: Math.max(2, Math.max.apply(null, I) * 1.2) }).clear();
      const xs = P.map(function (_, i) { return i + 1; });
      p1.stems(xs, I, "--s1", { labels: P.map(function (p) { return "p=" + M.fmt(+p.toFixed(4)); }) }).hline(H, "--s2", [5, 4], "H = " + H.toFixed(3)).hline(M.log2(K), "--muted", [2, 4], "log₂K");
      const b = parseFloat($("en-b").value);
      p2.clear().fn(Hb, "--s1", 2).points([b], [Hb(b)], "--s2", 5).vline(b, "--muted");
      $("en-out").textContent = "K = " + K + "   H = " + H.toFixed(4) + " bit/símbolo   máximo log₂K = " + M.log2(K).toFixed(4) + "   redundancia 1 − H/log₂K = " + (K > 1 ? (1 - H / M.log2(K)).toFixed(4) : "—") +
        "\nInformación por símbolo: " + I.map(function (x, i) { return "I(s" + i + ") = " + x.toFixed(3); }).join("  ") +
        "\nFuente binaria con p = " + b.toFixed(2) + ":  𝓗(p) = " + Hb(b).toFixed(4) + " bit por dígito";
    }
    on(["en-p", "en-b"], draw);
    C.onRedraw(draw);
  })();

  // -------------------------------------------------------------- Huffman
  function huffman(P, pos, bits) {
    // nodos: {p, syms:[índices]}, columnas para la tabla
    let list = P.map(function (p, i) { return { p: p, syms: [i], id: "s" + (i + 1) }; });
    list.sort(function (a, b) { return b.p - a.p || a.syms[0] - b.syms[0]; });
    const code = P.map(function () { return ""; }), cols = [];
    const eps = 1e-12;
    while (list.length > 1) {
      const n = list.length, up = list[n - 2], lo = list[n - 1];
      cols.push(list.map(function (x, i) { return { p: x.p, mark: i === n - 2 ? bits[0] : i === n - 1 ? bits[1] : "", label: x.id }; }));
      up.syms.forEach(function (s) { code[s] = bits[0] + code[s]; });
      lo.syms.forEach(function (s) { code[s] = bits[1] + code[s]; });
      const node = { p: up.p + lo.p, syms: up.syms.concat(lo.syms), id: "Σ" };
      list = list.slice(0, n - 2);
      let k;
      if (pos === "hi") { k = list.findIndex(function (x) { return x.p <= node.p + eps; }); }
      else { k = list.findIndex(function (x) { return x.p < node.p - eps; }); }
      if (k < 0) k = list.length;
      list.splice(k, 0, node);
    }
    cols.push(list.map(function (x) { return { p: x.p, mark: "", label: "" }; }));
    if (P.length === 1) code[0] = "0";
    return { code: code, cols: cols };
  }
  (function () {
    if (!$("sim-huff")) return;
    function draw() {
      const P = parseProbs($("hf-p").value).p;
      if (P.length < 2) { $("hf-out").textContent = "Introduce al menos dos probabilidades."; $("hf-steps").innerHTML = ""; $("hf-code").innerHTML = ""; return; }
      if (P.length > 16) { $("hf-out").textContent = "Máximo 16 símbolos."; return; }
      const r = huffman(P, $("hf-pos").value, $("hf-bit").value);
      // tabla de columnas
      const rows = r.cols[0].length;
      let h = '<table class="compact htable"><thead><tr>' + r.cols.map(function (_, j) { return "<th>" + (j === 0 ? "Inicio" : "Paso " + j) + "</th>"; }).join("") + "</tr></thead><tbody>";
      for (let i = 0; i < rows; i++) {
        h += "<tr>" + r.cols.map(function (col, j) {
          const c = col[i]; if (!c) return "<td></td>";
          const lab = j === 0 ? '<span class="meta">' + c.label + "</span> " : "";
          return "<td>" + lab + (+c.p.toFixed(4)) + (c.mark ? ' <strong style="color:var(--s2)">→' + c.mark + "</strong>" : "") + "</td>";
        }).join("") + "</tr>";
      }
      $("hf-steps").innerHTML = h + "</tbody></table>";
      const L = P.reduce(function (a, p, i) { return a + p * r.code[i].length; }, 0);
      const H = P.reduce(function (a, p) { return a - p * M.log2(p); }, 0);
      const v = P.reduce(function (a, p, i) { return a + p * Math.pow(r.code[i].length - L, 2); }, 0);
      const kraft = r.code.reduce(function (a, c) { return a + Math.pow(2, -c.length); }, 0);
      const ord = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[b] - P[a] || a - b; });
      $("hf-code").innerHTML = '<table class="compact htable"><thead><tr><th>Símbolo</th><th>pₖ</th><th>Palabra</th><th>lₖ</th><th>I(sₖ)</th></tr></thead><tbody>' +
        ord.map(function (i) { return '<tr><td class="sym">s' + (i + 1) + "</td><td>" + (+P[i].toFixed(4)) + "</td><td>" + r.code[i] + "</td><td>" + r.code[i].length + "</td><td>" + (-M.log2(P[i])).toFixed(3) + "</td></tr>"; }).join("") + "</tbody></table>";
      $("hf-out").textContent = "H = " + H.toFixed(4) + " bit/símbolo   L̄ = " + L.toFixed(4) + "   η = H/L̄ = " + (H / L).toFixed(4) + "   σ² = " + v.toFixed(4) +
        "\nKraft: Σ2^(−lₖ) = " + kraft.toFixed(4) + "   ·   longitud fija necesaria: " + Math.ceil(M.log2(P.length)) + " bits (η = " + (H / Math.ceil(M.log2(P.length))).toFixed(4) + ")";
    }
    on(["hf-p", "hf-pos", "hf-bit"], draw);
    draw();
  })();

  // --------------------------------------------------------------- LZ78
  (function () {
    if (!$("sim-lz")) return;
    let st;
    function reset() {
      const s = $("lz-in").value.replace(/\s+/g, "");
      st = { s: s, i: 0, dict: { "": 0 }, list: [""], rows: [] };
      view();
    }
    function step() {
      if (st.i >= st.s.length) return false;
      let w = "", j = st.i;
      while (j < st.s.length && st.dict.hasOwnProperty(w + st.s[j])) { w += st.s[j]; j++; }
      if (j < st.s.length) {
        const sym = st.s[j], phrase = w + sym;
        st.dict[phrase] = st.list.length; st.list.push(phrase);
        st.rows.push({ phrase: phrase, idx: st.dict[phrase], pre: st.dict[w], sym: sym });
        st.i = j + 1;
      } else { // frase final ya conocida
        st.rows.push({ phrase: w, idx: "—", pre: st.dict[w], sym: "" });
        st.i = j;
      }
      return true;
    }
    function view() {
      const alpha = Array.from(new Set(st.s.split(""))), bs = Math.max(1, Math.ceil(M.log2(alpha.length)));
      let pos = 0, parts = [];
      st.rows.forEach(function (r) { parts.push(st.s.substr(pos, r.phrase.length + (r.sym ? 0 : 0))); pos += r.phrase.length; });
      $("lz-view").innerHTML = (parts.length ? '<span style="color:var(--accent)">' + parts.map(esc).join(" | ") + "</span>" : "") + (pos < st.s.length ? (parts.length ? " | " : "") + '<span style="color:var(--muted)">' + esc(st.s.slice(pos)) + "</span>" : "");
      let bitsOut = 0;
      const rows = st.rows.map(function (r, k) {
        const ib = Math.max(0, Math.ceil(M.log2(k + 1))), nb = ib + (r.sym ? bs : 0); bitsOut += nb;
        return "<tr><td>" + (k + 1) + "</td><td>" + esc(r.phrase) + "</td><td>" + r.idx + "</td><td>(" + r.pre + ", " + (r.sym ? esc(r.sym) : "—") + ")</td><td>" + nb + "</td></tr>";
      }).join("");
      $("lz-table").innerHTML = '<table class="compact htable"><thead><tr><th>Paso</th><th>Frase nueva</th><th>Índice</th><th>Salida (prefijo, símbolo)</th><th>Bits</th></tr></thead><tbody>' + rows + "</tbody></table>" +
        (st.i >= st.s.length && st.s.length ? '<p class="meta">Entrada: ' + st.s.length + " símbolos × " + bs + " bit = " + st.s.length * bs + " bits · Salida: " + bitsOut + " bits (el índice del paso k usa ⌈log₂k⌉ bits). En secuencias cortas LZ no comprime: su ventaja aparece en textos largos con repeticiones.</p>" : "");
    }
    $("lz-step").addEventListener("click", function () { step(); view(); });
    $("lz-all").addEventListener("click", function () { while (step()); view(); });
    $("lz-reset").addEventListener("click", reset);
    $("lz-in").addEventListener("change", reset);
    reset();
  })();

  // ----------------------------------------------------------- Capacidad
  (function () {
    if (!$("sim-cap")) return;
    const p1 = new Plot($("cp-c1"), { xmin: 0, xmax: 0.5, ymin: 0, ymax: 1.05, aspect: 0.62, xstep: 0.1, xlabel: "f", ylabel: "C (bit/uso)" });
    const p2 = new Plot($("cp-c2"), { xmin: -10, xmax: 50, ymin: 0, ymax: 17, aspect: 0.62, xstep: 10, xlabel: "S/N (dB)", ylabel: "C/B (bit/s/Hz)" });
    function draw() {
      const f = parseFloat($("cp-f").value), B = parseFloat($("cp-b").value) || 1, sdb = parseFloat($("cp-s").value);
      const Cb = 1 - Hb(f), pe3 = 3 * f * f * (1 - f) + f * f * f;
      p1.clear().fn(function (x) { return 1 - Hb(x); }, "--s1", 2).points([f], [Cb], "--s2", 5).hline(1 / 3, "--muted", [3, 4], "razón de R₃ = 1/3");
      const snr = Math.pow(10, sdb / 10), cB = M.log2(1 + snr);
      p2.clear().fn(function (d) { return M.log2(1 + Math.pow(10, d / 10)); }, "--s1", 2).points([sdb], [cB], "--s2", 5);
      $("cp-out").textContent = "BSC: f = " + f.toFixed(3) + "  →  C = 1 − 𝓗(f) = " + Cb.toFixed(4) + " bit/uso.  Con R₃: Pe = 3f²(1−f)+f³ = " + pe3.toExponential(3) +
        (Cb > 1 / 3 ? "  (R = 1/3 < C: Shannon garantiza códigos mejores)" : "  (R = 1/3 > C: ningún código de razón 1/3 da Pe → 0)") +
        "\nShannon-Hartley: B = " + B + " kHz, S/N = " + sdb + " dB (" + M.fmt(+snr.toPrecision(4)) + ")  →  C = " + (B * cB).toFixed(2) + " kbit/s   (" + cB.toFixed(3) + " bit/s/Hz)" +
        "\nLímite de Shannon (B → ∞): Eb/N0 ≥ ln 2 = 0,693 = −1,59 dB";
    }
    on(["cp-f", "cp-b", "cp-s"], draw);
    C.onRedraw(draw);
  })();

  // -------------------------------------------------------- Hamming (7,4)
  (function () {
    if (!$("sim-ham")) return;
    const P = [[1, 0, 1], [1, 1, 1], [1, 1, 0], [0, 1, 1]];
    const HT = P.concat([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    let m = [1, 0, 1, 0], e = [0, 0, 0, 0, 0, 0, 0];
    function enc(m) { const p = [0, 1, 2].map(function (j) { return (m[0] * P[0][j] + m[1] * P[1][j] + m[2] * P[2][j] + m[3] * P[3][j]) % 2; }); return m.concat(p); }
    function synd(r) { return [0, 1, 2].map(function (j) { let s = 0; for (let i = 0; i < 7; i++) s += r[i] * HT[i][j]; return s % 2; }); }
    function bit(v, cls, cb, title) {
      const b = document.createElement(cb ? "button" : "span"); b.className = "bit " + (cls || ""); b.textContent = v;
      if (cb) { b.type = "button"; b.addEventListener("click", cb); } if (title) b.title = title; return b;
    }
    function fill(id, arr) { const el = $(id); el.innerHTML = ""; el.style.display = "flex"; el.style.gap = "4px"; arr.forEach(function (b) { el.appendChild(b); }); }
    function draw() {
      const c = enc(m), r = c.map(function (x, i) { return x ^ e[i]; }), s = synd(r);
      const si = s.join("") === "000" ? -1 : HT.findIndex(function (row) { return row.join("") === s.join(""); });
      const x = r.slice(); if (si >= 0) x[si] ^= 1;
      fill("hm-m", m.map(function (v, i) { return bit(v, "", function () { m[i] ^= 1; draw(); }, "Pulsa para cambiar"); }));
      fill("hm-c", c.map(function (v, i) { return bit(v, i >= 4 ? "par" : ""); }));
      fill("hm-r", r.map(function (v, i) { return bit(v, e[i] ? "err" : (i >= 4 ? "par" : ""), function () { e[i] ^= 1; draw(); }, "Pulsa para meter/quitar un error"); }));
      fill("hm-s", s.map(function (v) { return bit(v); }));
      fill("hm-x", x.map(function (v, i) { return bit(v, i === si ? "fix" : ""); }));
      const ne = e.reduce(function (a, b) { return a + b; }, 0), ok = x.join("") === c.join("");
      $("hm-out").textContent = "Errores en el canal: " + ne + "   ·   síndrome " + s.join("") + (si >= 0 ? " = fila " + (si + 1) + " de Hᵀ → se invierte el bit " + (si + 1) : " → se acepta la palabra") +
        "\nMensaje entregado: " + x.slice(0, 4).join("") + (ok ? "  ✔ correcto" : "  ✘ ERROR (con " + ne + " errores el código no puede corregir; t = 1)");
    }
    draw();
  })();

  // ------------------------------------------------------ Convolucional
  (function () {
    if (!$("sim-vit")) return;
    const cv = $("vt-c");
    const parseG = function () {
      return ["vt-g1", "vt-g2", "vt-g3"].map(function (id) { return $(id).value.replace(/[^01]/g, ""); }).filter(function (g) { return g.length > 0; }).map(function (g) { return g.split("").map(Number); });
    };
    function setup() {
      const G = parseG(); if (!G.length) return null;
      const K = Math.max.apply(null, G.map(function (g) { return g.length; })), L = K - 1;
      const Gp = G.map(function (g) { return g.concat(new Array(K - g.length).fill(0)); });
      // estado: entero con bit0 = u[k-1], bit1 = u[k-2]...
      function step(s, b) {
        const reg = [b]; for (let i = 0; i < L; i++) reg.push((s >> i) & 1);
        const out = Gp.map(function (g) { let v = 0; for (let i = 0; i < K; i++) v ^= g[i] & reg[i]; return v; });
        let ns = 0; for (let i = 0; i < L; i++) ns |= reg[i] << i;
        return { ns: ns, out: out };
      }
      return { G: Gp, n: Gp.length, L: L, S: 1 << L, step: step };
    }
    function label(s, L) { let t = ""; for (let i = 0; i < L; i++) t += (s >> i) & 1; return t || "·"; }
    function encode() {
      const cfg = setup(); if (!cfg) return;
      let u = $("vt-in").value.replace(/[^01]/g, "").split("").map(Number);
      if ($("vt-tail").checked) u = u.concat(new Array(cfg.L).fill(0));
      let s = 0; const out = [];
      u.forEach(function (b) { const r = cfg.step(s, b); out.push(r.out.join("")); s = r.ns; });
      $("vt-rx").value = out.join(" ");
      draw();
    }
    function draw() {
      const cfg = setup(); if (!cfg) { $("vt-out").textContent = "Define al menos un generador."; return; }
      const rx = $("vt-rx").value.replace(/[^01]/g, "").split("").map(Number), n = cfg.n, T = Math.floor(rx.length / n), S = cfg.S;
      const INF = 1e9;
      let pm = new Array(S).fill(INF); pm[0] = 0;
      const surv = [], allE = [];
      for (let k = 0; k < T; k++) {
        const r = rx.slice(k * n, (k + 1) * n), npm = new Array(S).fill(INF), back = new Array(S).fill(null);
        for (let s = 0; s < S; s++) {
          if (pm[s] >= INF) continue;
          for (let b = 0; b <= 1; b++) {
            const t = cfg.step(s, b); let d = 0; for (let i = 0; i < n; i++) d += t.out[i] !== r[i] ? 1 : 0;
            allE.push({ k: k, s: s, ns: t.ns, b: b, out: t.out.join("") });
            if (pm[s] + d < npm[t.ns]) { npm[t.ns] = pm[s] + d; back[t.ns] = { s: s, b: b, out: t.out.join("") }; }
          }
        }
        surv.push(back); pm = npm;
      }
      // mejor camino
      let best = 0; for (let s = 0; s < S; s++) if (pm[s] < pm[best]) best = s;
      const path = [], bits = [], outs = []; let cur = best;
      for (let k = T - 1; k >= 0; k--) { const b = surv[k][cur]; path.unshift({ k: k, s: b.s, ns: cur }); bits.unshift(b.b); outs.unshift(b.out); cur = b.s; }
      // métricas por nivel (para etiquetar)
      const metrics = []; { let m = new Array(S).fill(INF); m[0] = 0; metrics.push(m.slice());
        for (let k = 0; k < T; k++) { const r = rx.slice(k * n, (k + 1) * n), nm = new Array(S).fill(INF);
          for (let s = 0; s < S; s++) { if (m[s] >= INF) continue; for (let b = 0; b <= 1; b++) { const t = cfg.step(s, b); let d = 0; for (let i = 0; i < n; i++) d += t.out[i] !== r[i] ? 1 : 0; nm[t.ns] = Math.min(nm[t.ns], m[s] + d); } }
          m = nm; metrics.push(m.slice()); } }
      // dibujo
      const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 700, rowH = S <= 4 ? 52 : S <= 8 ? 34 : 22, H = 40 + rowH * (S - 1) + 34;
      cv.style.height = H + "px"; cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const x0 = 46, dx = T > 0 ? (W - x0 - 24) / Math.max(T, 1) : 0, Y = function (s) { return 24 + s * rowH; }, X = function (k) { return x0 + k * dx; };
      ctx.font = "11px " + C.cssVar("--font-mono"); ctx.fillStyle = C.cssVar("--muted"); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (let s = 0; s < S; s++) ctx.fillText(label(s, cfg.L), x0 - 10, Y(s));
      ctx.textAlign = "center";
      for (let k = 0; k < T; k++) ctx.fillText(rx.slice(k * n, (k + 1) * n).join(""), (X(k) + X(k + 1)) / 2, H - 12);
      allE.forEach(function (e) {
        ctx.strokeStyle = C.cssVar("--border"); ctx.lineWidth = 1; ctx.setLineDash(e.b ? [4, 3] : []);
        ctx.beginPath(); ctx.moveTo(X(e.k), Y(e.s)); ctx.lineTo(X(e.k + 1), Y(e.ns)); ctx.stroke();
      });
      ctx.setLineDash([]);
      for (let k = 0; k < T; k++) for (let s = 0; s < S; s++) { const b = surv[k][s]; if (!b) continue; ctx.strokeStyle = C.cssVar("--muted"); ctx.lineWidth = 1.6; ctx.setLineDash(b.b ? [4, 3] : []); ctx.beginPath(); ctx.moveTo(X(k), Y(b.s)); ctx.lineTo(X(k + 1), Y(s)); ctx.stroke(); }
      ctx.setLineDash([]); ctx.strokeStyle = C.cssVar("--s2"); ctx.lineWidth = 3.2;
      path.forEach(function (p) { ctx.beginPath(); ctx.moveTo(X(p.k), Y(p.s)); ctx.lineTo(X(p.k + 1), Y(p.ns)); ctx.stroke(); });
      for (let k = 0; k <= T; k++) for (let s = 0; s < S; s++) {
        const m = metrics[k][s]; if (m >= INF) continue;
        ctx.fillStyle = C.cssVar("--surface"); ctx.strokeStyle = C.cssVar("--s1"); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(X(k), Y(s), 9, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.cssVar("--text"); ctx.fillText(String(m), X(k), Y(s) + 0.5);
      }
      const gs = cfg.G.map(function (g) { return g.join(""); }).join(", ");
      $("vt-out").textContent = (T ? "Generadores: " + gs + "  ·  razón 1/" + n + "  ·  " + S + " estados (memoria L = " + cfg.L + ")\nSecuencia decodificada: " + bits.join("") + "   ·   métrica final " + pm[best] + " (bits corregidos)\nPalabra más verosímil: " + outs.join(" ") + "\nLínea continua = entrada 0 · discontinua = entrada 1 · etiqueta del estado: bit más reciente a la izquierda" : "Codifica una secuencia o escribe bits recibidos (múltiplo de " + n + ").");
    }
    $("vt-enc").addEventListener("click", encode);
    $("vt-err").addEventListener("click", function () {
      const v = $("vt-rx").value.replace(/[^01]/g, "").split(""); if (!v.length) return;
      const i = Math.floor(Math.random() * v.length); v[i] = v[i] === "0" ? "1" : "0";
      const n = setup().n, g = []; for (let k = 0; k < v.length; k += n) g.push(v.slice(k, k + n).join(""));
      $("vt-rx").value = g.join(" "); draw();
    });
    on(["vt-rx", "vt-g1", "vt-g2", "vt-g3"], draw);
    encode();
    C.onRedraw(draw);
  })();
})();
