// Widgets interactivos de los temas de Microcontroladores
(function () {
  "use strict";
  const $ = function (id) { return document.getElementById(id); };
  const on = function (ids, fn) { ids.forEach(function (id) { const e = $(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); fn(); };
  const h2 = function (v) { return (v & 0xFF).toString(16).toUpperCase().padStart(2, "0"); };
  const h4 = function (v) { return (v & 0xFFFF).toString(16).toUpperCase().padStart(4, "0"); };
  const b8 = function (v) { return (v & 0xFF).toString(2).padStart(8, "0"); };
  const num = function (id) { return parseFloat($(id).value); };
  const parseN = function (s) { s = String(s).trim(); let m; if ((m = /^([0-9a-f]+)h$/i.exec(s))) return parseInt(m[1], 16); if ((m = /^0x([0-9a-f]+)$/i.exec(s))) return parseInt(m[1], 16); if ((m = /^([01]+)b$/i.exec(s))) return parseInt(m[1], 2); return parseInt(s, 10); };
  const fmtT = function (t) { return t < 1e-3 ? (t * 1e6).toFixed(2) + " µs" : t < 1 ? (t * 1e3).toFixed(4) + " ms" : t.toFixed(6) + " s"; };

  // ------------------------------------------------- Ciclo de búsqueda-ejecución
  (function () {
    if (!$("w-fetch")) return;
    const steps = [
      { i: 0, d: "RESET: el PC se carga con la dirección inicial 0000h. Los registros se ponen a 0 (en este µP genérico).", pc: 0x0000, ab: "—", db: "—", rd: 0, wr: 0, ir: "—", A: 0x05, B: 0x03 },
      { i: 0, d: "BÚSQUEDA: la UC pone el PC en el bus de direcciones y activa RD/. La ROM coloca el código 9Ch en el bus de datos y se guarda en el registro de instrucción (IR).", pc: 0x0000, ab: "0000h", db: "9Ch", rd: 1, wr: 0, ir: "9Ch" },
      { i: 0, d: "DECODIFICACIÓN: la UC interpreta 9Ch = add A,B. El PC se incrementa: apunta a la siguiente dirección.", pc: 0x0001, ab: "—", db: "—", rd: 0, wr: 0, ir: "9Ch" },
      { i: 0, d: "EJECUCIÓN: la UC pone A y B en las entradas de la ALU, ordena sumar, guarda el resultado en A y actualiza las banderas (no hay ciclo de bus).", pc: 0x0001, ab: "—", db: "—", rd: 0, wr: 0, ir: "9Ch", A: 0x08 },
      { i: 1, d: "BÚSQUEDA de mov [X],A: PC → bus de direcciones, RD/ activo, código hacia el IR.", pc: 0x0001, ab: "0001h", db: "70h", rd: 1, wr: 0, ir: "70h" },
      { i: 1, d: "DECODIFICACIÓN y PC+1.", pc: 0x0002, ab: "—", db: "—", rd: 0, wr: 0, ir: "70h" },
      { i: 1, d: "EJECUCIÓN: ciclo de ESCRITURA. El contenido de X (2000h) va al bus de direcciones, A al bus de datos y se activa WR/ (escribe en RAM).", pc: 0x0002, ab: "2000h", db: "08h", rd: 0, wr: 1, ir: "70h", mem: [0x2000, 0x08] },
      { i: 2, d: "BÚSQUEDA de mov A,9Ch (dos bytes).", pc: 0x0002, ab: "0002h", db: "3Eh", rd: 1, wr: 0, ir: "3Eh" },
      { i: 2, d: "DECODIFICACIÓN y PC+1: la UC sabe que falta leer un byte (el dato inmediato).", pc: 0x0003, ab: "—", db: "—", rd: 0, wr: 0, ir: "3Eh" },
      { i: 2, d: "EJECUCIÓN: ciclo de LECTURA del 2.º byte de la instrucción (PC = 0003h). El valor 9Ch se escribe en A y el PC se incrementa. Ojo: el mismo valor 9Ch que antes era una instrucción, aquí es un DATO: lo que decide es el momento en que se lee.", pc: 0x0004, ab: "0003h", db: "9Ch", rd: 1, wr: 0, ir: "3Eh", A: 0x9C },
      { i: 3, d: "BÚSQUEDA de jmp 1234h (tres bytes).", pc: 0x0004, ab: "0004h", db: "C3h", rd: 1, wr: 0, ir: "C3h" },
      { i: 3, d: "DECODIFICACIÓN y PC+1.", pc: 0x0005, ab: "—", db: "—", rd: 0, wr: 0, ir: "C3h" },
      { i: 3, d: "EJECUCIÓN: lee el 2.º byte (34h) a un registro temporal —no al PC, porque el PC todavía debe leer el 3.er byte—…", pc: 0x0006, ab: "0005h", db: "34h", rd: 1, wr: 0, ir: "C3h" },
      { i: 3, d: "…lee el 3.er byte (12h) y carga el PC con 1234h: TRANSFERENCIA DE CONTROL.", pc: 0x1234, ab: "0006h", db: "12h", rd: 1, wr: 0, ir: "C3h" },
      { i: 4, d: "BÚSQUEDA en 1234h de sub [Y],40h.", pc: 0x1234, ab: "1234h", db: "96h", rd: 1, wr: 0, ir: "96h" },
      { i: 4, d: "DECODIFICACIÓN, PC+1; lectura del dato inmediato 40h a la entrada de la ALU, PC+1.", pc: 0x1236, ab: "1235h", db: "40h", rd: 1, wr: 0, ir: "96h" },
      { i: 4, d: "Lectura de [Y] (Y = 3000h, contiene 40h) por el bus de datos hacia la otra entrada de la ALU.", pc: 0x1236, ab: "3000h", db: "40h", rd: 1, wr: 0, ir: "96h" },
      { i: 4, d: "La ALU resta (40h − 40h = 0): ciclo de ESCRITURA del resultado en [Y] y la bandera Z se pone a 1.", pc: 0x1236, ab: "3000h", db: "00h", rd: 0, wr: 1, ir: "96h", mem: [0x3000, 0x00], Z: 1 },
      { i: 5, d: "BÚSQUEDA de jz 5678h; decodificación; lectura del 2.º y 3.er byte (PC = 1239h).", pc: 0x1239, ab: "1238h", db: "56h", rd: 1, wr: 0, ir: "CAh" },
      { i: 5, d: "Como Z = 1 ([Y] era 40h), la UC carga el PC con 5678h. Si Z hubiera sido 0, el PC seguiría en 1239h.", pc: 0x5678, ab: "—", db: "—", rd: 0, wr: 0, ir: "CAh" }
    ];
    const prog = ["0000  9C        add A,B", "0001  70        mov [X],A", "0002  3E 9C     mov A,9Ch", "0004  C3 34 12  jmp 1234h", "1234  96 40     sub [Y],40h", "1236  CA 78 56  jz 5678h"];
    let k = 0;
    function draw() {
      let A = 0x05, B = 0x03, Z = 0, mem = { 0x2000: 0x00, 0x3000: 0x40 };
      for (let j = 0; j <= k; j++) { const s = steps[j]; if (s.A !== undefined) A = s.A; if (s.B !== undefined) B = s.B; if (s.Z !== undefined) Z = s.Z; if (s.mem) mem[s.mem[0]] = s.mem[1]; }
      const s = steps[k];
      $("fx-prog").innerHTML = prog.map(function (l, i) { return '<div class="' + (i === s.i ? "cur" : "") + '">' + l + "</div>"; }).join("");
      $("fx-regs").innerHTML = [["PC", h4(s.pc) + "h"], ["IR", s.ir], ["A", h2(A) + "h"], ["B", h2(B) + "h"], ["X", "2000h"], ["Y", "3000h"], ["Z", Z], ["[2000h]", h2(mem[0x2000]) + "h"], ["[3000h]", h2(mem[0x3000]) + "h"]].map(function (r) { return "<div><b>" + r[0] + "</b> " + r[1] + "</div>"; }).join("");
      $("fx-bus").innerHTML = '<div><b>Bus de direcciones</b> ' + s.ab + '</div><div><b>Bus de datos</b> ' + s.db + '</div><div class="' + (s.rd ? "act" : "") + '"><b>RD/</b> ' + (s.rd ? "activa (0)" : "inactiva (1)") + '</div><div class="' + (s.wr ? "act" : "") + '"><b>WR/</b> ' + (s.wr ? "activa (0)" : "inactiva (1)") + "</div>";
      $("fx-desc").textContent = (k + 1) + "/" + steps.length + " · " + s.d;
    }
    $("fx-next").addEventListener("click", function () { if (k < steps.length - 1) k++; draw(); });
    $("fx-prev").addEventListener("click", function () { if (k > 0) k--; draw(); });
    $("fx-rst").addEventListener("click", function () { k = 0; draw(); });
    draw();
  })();

  // ---------------------------------------------- Mapa de RAM y direcciones de bit
  (function () {
    if (!$("w-bits")) return;
    on(["bt-rs", "bt-byte", "bt-bit", "bt-addr"], function () {
      const rs = +$("bt-rs").value;
      $("bt-banks").textContent = "Banco " + rs + " (RS1 RS0 = " + (rs >> 1) + " " + (rs & 1) + "): " + [0, 1, 2, 3, 4, 5, 6, 7].map(function (n) { return "R" + n + "=" + h2(rs * 8 + n) + "h"; }).join("  ") + "\n" + "PSW con ese banco y el resto de bits a 0: " + h2(rs << 3) + "h";
      const by = parseN($("bt-byte").value), bi = +$("bt-bit").value;
      let out;
      if (by >= 0x20 && by <= 0x2F) out = h2(by) + "h." + bi + " → dirección de bit " + h2((by - 0x20) * 8 + bi) + "h";
      else if (by >= 0x80 && by <= 0xFF && (by & 7) === 0) out = h2(by) + "h." + bi + " → dirección de bit " + h2(by + bi) + "h (SFR direccionable bit a bit)";
      else out = h2(by) + "h no es direccionable bit a bit (solo 20h–2Fh y los SFR terminados en 0h u 8h)";
      const ad = parseN($("bt-addr").value);
      let inv = isNaN(ad) || ad < 0 || ad > 255 ? "—" : ad < 0x80 ? "bit " + h2(ad) + "h = byte " + h2(0x20 + (ad >> 3)) + "h, bit " + (ad & 7) : "bit " + h2(ad) + "h = SFR " + h2(ad & 0xF8) + "h, bit " + (ad & 7);
      $("bt-out").textContent = out + "\n" + inv;
    });
  })();

  // ------------------------------------------------- Codificador de instrucciones
  (function () {
    if (!$("w-enc") || !window.Sim8051) return;
    const S = window.Sim8051;
    on(["en-src"], function () {
      const lines = $("en-src").value.split("\n");
      const r = S.assemble(lines.join("\n"));
      const out = [];
      r.listing.forEach(function (e) {
        if (!e.src.trim()) return;
        const err = r.errors.find(function (x) { return x.line === e.line; });
        if (err) { out.push("✘ " + e.src.trim() + "   → " + err.msg); return; }
        if (!e.bytes.length) { out.push("  " + e.src.trim() + "   (directiva: no genera código)"); return; }
        const c = S.CYC[e.bytes[0]];
        out.push(h4(e.addr) + "  " + e.bytes.map(h2).join(" ").padEnd(10) + " " + e.src.trim().padEnd(26) + e.bytes.length + " byte" + (e.bytes.length > 1 ? "s" : " ") + ", " + c + " ciclo" + (c > 1 ? "s" : "") + " de máquina");
      });
      $("en-out").textContent = out.join("\n");
    });
  })();

  // ------------------------------------------------------- Calculadora de demoras
  (function () {
    if (!$("w-delay")) return;
    on(["dl-a", "dl-b", "dl-c", "dl-mc", "dl-lv"], function () {
      const a = num("dl-a"), b = num("dl-b"), c = num("dl-c"), mc = num("dl-mc") * 1e-6, lv = +$("dl-lv").value;
      const A = a === 0 ? 256 : a, B = b === 0 ? 256 : b, Cc = c === 0 ? 256 : c;
      let cyc, code;
      if (lv === 1) { cyc = 2 + 1 + 2 * A + 2; code = "Demora: mov R5,#" + a + "\n        djnz R5,$\n        ret"; }
      else if (lv === 2) { cyc = 2 + 1 + B * (1 + 2 * Cc + 2) + 2; code = "Demora: mov R6,#" + b + "\nd1:     mov R5,#" + c + "\n        djnz R5,$\n        djnz R6,d1\n        ret"; }
      else { cyc = 2 + 1 + A * (1 + B * (3 + 2 * Cc) + 2) + 2; code = "Demora: mov R7,#" + a + "\nd2:     mov R6,#" + b + "\nd1:     mov R5,#" + c + "\n        djnz R5,$\n        djnz R6,d1\n        djnz R7,d2\n        ret"; }
      $("dl-a").disabled = lv < 3; $("dl-b").disabled = lv < 2;
      $("dl-out").textContent = code + "\n\nCiclos (incluye call y ret): " + cyc + "  →  " + fmtT(cyc * mc) + " con ciclo de máquina de " + num("dl-mc") + " µs" + (a === 0 || b === 0 || c === 0 ? "\n(un contador cargado con 0 da 256 vueltas: djnz decrementa antes de comparar)" : "");
    });
  })();

  // ------------------------------------------------------- Lámpara de 7 segmentos
  (function () {
    if (!$("w-seg")) return;
    const P = ["16,8 48,8 44,14 20,14", "50,10 56,16 54,46 48,50 46,16", "48,54 54,58 52,90 46,96 44,62", "14,94 46,94 42,100 10,100", "8,58 14,54 16,62 14,96 6,90", "10,16 16,10 18,16 16,50 10,46", "16,52 46,52 42,58 20,58"];
    const DIG = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x67, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71]; // gfedcba, 1 = encendido
    let segs = 0x5B; // "2"
    const svg = $("sg-svg");
    function code(on, pol, order) {
      let v = 0;
      for (let k = 0; k < 8; k++) { const lit = (on >> k) & 1, bit = order === "a0" ? k : 7 - k; if ((pol === "ac" ? !lit : lit)) v |= 1 << bit; }
      if ($("sg-b7").value === "0") v &= order === "a0" ? 0x7F : 0xFE;   // bit del dp sin conectar
      return v;
    }
    function draw() {
      const pol = $("sg-pol").value, order = $("sg-ord").value;
      svg.innerHTML = P.map(function (p, k) { return '<polygon data-k="' + k + '" points="' + p + '" class="' + ((segs >> k) & 1 ? "on" : "off") + '" tabindex="0" role="button" aria-label="segmento ' + "abcdefg"[k] + '"/>'; }).join("") + '<circle data-k="7" cx="58" cy="98" r="4" class="' + ((segs >> 7) & 1 ? "on" : "off") + '" tabindex="0" role="button" aria-label="punto decimal"/>';
      svg.querySelectorAll("[data-k]").forEach(function (el) { const f = function () { segs ^= 1 << +el.dataset.k; draw(); }; el.addEventListener("click", f); el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } }); });
      const v = code(segs, pol, order);
      $("sg-out").textContent = "Segmentos encendidos: " + ("abcdefg".split("").filter(function (_, k) { return (segs >> k) & 1; }).join(", ") || "ninguno") + ((segs >> 7) & 1 ? ", dp" : "") + "\nCódigo = " + b8(v) + "b = " + h2(v) + "h";
      $("sg-tab").textContent = "Tabla7Seg: db " + DIG.map(function (d) { return (code(d, pol, order) > 0x9F ? "0" : "") + h2(code(d, pol, order)) + "h"; }).join(",") + "   ; 0..F";
    }
    on(["sg-pol", "sg-ord", "sg-b7"], draw);
    $("sg-dig").addEventListener("change", function () { const d = $("sg-dig").value; if (d !== "") segs = DIG[parseInt(d, 16)]; draw(); });
  })();

  // ------------------------------------------------------- Resistencia de un LED
  (function () {
    if (!$("w-led")) return;
    on(["ld-vcc", "ld-voh", "ld-vol", "ld-vd", "ld-i", "ld-imax"], function () {
      const vcc = num("ld-vcc"), voh = num("ld-voh"), vol = num("ld-vol"), vd = num("ld-vd"), i = num("ld-i") / 1000, imax = num("ld-imax") / 1000;
      const r1 = (voh - vd) / i, r0 = (vcc - vd - vol) / i;
      const ok = i <= imax;
      $("ld-out").textContent = "Activo en «1» (pin → R → LED → GND): R = (VOH − VLED)/ILED = (" + voh + " − " + vd + ")/" + (i * 1000) + " mA = " + r1.toFixed(0) + " Ω" +
        "\nActivo en «0» (Vcc → R → LED → pin): R = (Vcc − VLED − VOL)/ILED = (" + vcc + " − " + vd + " − " + vol + ")/" + (i * 1000) + " mA = " + r0.toFixed(0) + " Ω" +
        "\nValor comercial (E12) inmediato superior: " + e12(r1) + " Ω y " + e12(r0) + " Ω" +
        "\n" + (ok ? "✔ La corriente es menor que el máximo del pin (" + (imax * 1000) + " mA): conexión directa posible." : "✘ La corriente supera el máximo del pin: hace falta un transistor o driver (ULN2003, etc.).");
    });
    function e12(r) { const s = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]; let d = Math.pow(10, Math.floor(Math.log10(r))); for (let k = 0; k < 24; k++) { const v = s[k % 12] * d * (k >= 12 ? 10 : 1); if (v >= r - 1e-9) return +v.toPrecision(3); } return Math.round(r); }
  })();

  // ---------------------------------------------- Conversión a unidades de ingeniería
  (function () {
    if (!$("w-ui")) return;
    on(["ui-uc", "ui-min", "ui-max", "ui-n"], function () {
      const n = +$("ui-n").value, full = (1 << n) - 1, uc = Math.min(full, Math.max(0, Math.round(num("ui-uc")))), mn = num("ui-min"), mx = num("ui-max");
      $("ui-uc").max = full;
      const exact = uc * (mx - mn) / full + mn, approx = Math.floor(uc * (mx - mn) / (full + 1)) + mn;
      const prod = uc * (mx - mn);
      $("ui-out").textContent = "UI = UC·(UImax − UImin)/" + full + " + UImin = " + uc + "·" + (mx - mn) + "/" + full + " + " + mn + " = " + exact.toFixed(3) +
        "\nAproximando el denominador a 2^" + n + " = " + (full + 1) + ": UI ≈ ⌊UC·" + (mx - mn) + " / " + (full + 1) + "⌋ + " + mn + " = " + approx +
        (n === 8 ? "\n  En el 8051: mov A,#UC / mov B,#" + (mx - mn) + " / mul AB → B:A = " + h2(prod >> 8) + "h:" + h2(prod & 0xFF) + "h; tomar B (= byte alto = ÷256) = " + (prod >> 8) + ", y sumar " + mn : "") +
        "\nError de la aproximación: " + (approx - exact).toFixed(3) + " (resolución del conversor: " + ((mx - mn) / full).toFixed(4) + " por cuenta)";
    });
  })();

  // ----------------------------------------------------------- Teclado matricial
  (function () {
    if (!$("w-kp")) return;
    const keys = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["B", "0", "E"]];
    let sel = null;
    const box = $("kp-keys");
    keys.forEach(function (row, i) { row.forEach(function (k, j) { const b = document.createElement("button"); b.type = "button"; b.className = "btn ghost"; b.textContent = k; b.addEventListener("click", function () { sel = [i, j]; draw(); }); box.appendChild(b); }); });
    function draw() {
      const out = [];
      for (let i = 0; i < 4; i++) {
        const scan = (~(1 << i)) & 0x0F; let col = 0x0F;
        if (sel && sel[0] === i) col &= ~(1 << sel[1]) & 0x0F;
        col |= 0x08; // la 4.ª columna no existe: queda a 1 por el pull-up
        out.push("Fila " + i + ": P1 (filas) ← " + scan.toString(2).padStart(4, "0") + "b   P2 (columnas) → " + col.toString(2).padStart(4, "0") + "b" + (col !== 0x0F ? "   ← tecla en esta fila" : ""));
      }
      if (sel) out.push("\nTecla «" + keys[sel[0]][sel[1]] + "»: fila i = " + sel[0] + ", columna j = " + sel[1] + " → desplazamiento q·i + j = 3·" + sel[0] + " + " + sel[1] + " = " + (3 * sel[0] + sel[1]) + " → movc A,@A+DPTR devuelve Tabla_Teclas[" + (3 * sel[0] + sel[1]) + "]");
      else out.push("\nPulse una tecla del teclado de la izquierda.");
      $("kp-out").textContent = out.join("\n");
    }
    draw();
  })();

  // ------------------------------------------------------------- Motor de paso
  (function () {
    if (!$("w-step")) return;
    const SEQ = { wave: [1, 2, 4, 8], full: [3, 6, 12, 9], half: [1, 3, 2, 6, 4, 12, 8, 9] };
    let idx = 0, ang = 0, timer = null;
    const cv = $("st-cv");
    function draw() {
      const mode = $("st-mode").value, seq = SEQ[mode], v = seq[idx % seq.length];
      const ctx = cv.getContext("2d"), W = cv.width = cv.clientWidth * (window.devicePixelRatio || 1), H = cv.height = W;
      cv.style.height = cv.clientWidth + "px";
      const css = getComputedStyle(document.documentElement), cx = W / 2, cy = H / 2, R = W * 0.36;
      ctx.clearRect(0, 0, W, H);
      ["A", "B", "C", "D"].forEach(function (n, k) {
        const a = -Math.PI / 2 + k * Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), act = (v >> k) & 1;
        ctx.fillStyle = act ? "#e5322d" : css.getPropertyValue("--border"); ctx.beginPath(); ctx.arc(x, y, W * 0.07, 0, 7); ctx.fill();
        ctx.fillStyle = css.getPropertyValue("--text"); ctx.font = (W * 0.05) + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n, x, y);
      });
      // ángulo del rotor: promedio de las fases activas
      let sx = 0, sy = 0; for (let k = 0; k < 4; k++) if ((v >> k) & 1) { sx += Math.cos(-Math.PI / 2 + k * Math.PI / 2); sy += Math.sin(-Math.PI / 2 + k * Math.PI / 2); }
      const ra = Math.atan2(sy, sx);
      ctx.strokeStyle = css.getPropertyValue("--accent"); ctx.lineWidth = W * 0.03; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx - R * 0.55 * Math.cos(ra), cy - R * 0.55 * Math.sin(ra)); ctx.lineTo(cx + R * 0.55 * Math.cos(ra), cy + R * 0.55 * Math.sin(ra)); ctx.stroke();
      ctx.fillStyle = css.getPropertyValue("--accent"); ctx.beginPath(); ctx.arc(cx + R * 0.55 * Math.cos(ra), cy + R * 0.55 * Math.sin(ra), W * 0.03, 0, 7); ctx.fill();
      const deg = num("st-deg");
      $("st-out").textContent = "Secuencia " + mode + ": " + seq.map(function (s) { return h2(s) + "h"; }).join(", ") + "\nPaso actual: P1 = " + b8(v) + "b (DCBA = " + v.toString(2).padStart(4, "0") + ")   ángulo acumulado: " + ang.toFixed(1) + "°" +
        "\nResolución: " + deg + "°/paso" + (mode === "half" ? " → " + (deg / 2) + "° por medio paso" : "") + " · pasos por vuelta: " + Math.round(360 / (mode === "half" ? deg / 2 : deg));
    }
    function adv(d) { const mode = $("st-mode").value, n = SEQ[mode].length, deg = num("st-deg"); idx = (idx + d + n) % n; ang += d * (mode === "half" ? deg / 2 : deg); draw(); }
    $("st-cw").addEventListener("click", function () { adv(1); });
    $("st-ccw").addEventListener("click", function () { adv(-1); });
    $("st-run").addEventListener("click", function () { if (timer) { clearInterval(timer); timer = null; this.textContent = "▶ Girar"; } else { const dir = +$("st-dir").value; timer = setInterval(function () { adv(dir); }, 300); this.textContent = "⏸ Parar"; } });
    on(["st-mode", "st-deg"], function () { idx = 0; draw(); });
    window.addEventListener("resize", draw);
  })();

  // ------------------------------------------------------------- IE / IP / TMOD / SCON
  function regBuilder(id, bits, outId, extra) {
    if (!$(id)) return;
    const box = $(id);
    bits.forEach(function (b, k) { if (!b) return; const l = document.createElement("label"); l.innerHTML = '<input type="checkbox" data-b="' + (7 - k) + '"> ' + b; box.appendChild(l); });
    const f = function () { let v = 0; box.querySelectorAll("input").forEach(function (c) { if (c.checked) v |= 1 << +c.dataset.b; }); $(outId).textContent = "= " + b8(v) + "b = " + h2(v) + "h" + (extra ? "   " + extra(v) : ""); };
    box.addEventListener("change", f); f();
  }
  regBuilder("w-ie", ["EA", "", "", "ES", "ET1", "EX1", "ET0", "EX0"], "ie-out", function (v) { return (v & 0x80) ? "" : (v ? "(¡sin EA no se atiende ninguna!)" : ""); });
  regBuilder("w-ip", ["", "", "", "PS", "PT1", "PX1", "PT0", "PX0"], "ip-out");
  regBuilder("w-tcon", ["TF1", "TR1", "TF0", "TR0", "IE1", "IT1", "IE0", "IT0"], "tcon-out");
  (function () {
    if (!$("w-tmod")) return;
    on(["tm-g1", "tm-c1", "tm-m1", "tm-g0", "tm-c0", "tm-m0"], function () {
      const v = (($("tm-g1").checked ? 1 : 0) << 7) | (($("tm-c1").checked ? 1 : 0) << 6) | (+$("tm-m1").value << 4) | (($("tm-g0").checked ? 1 : 0) << 3) | (($("tm-c0").checked ? 1 : 0) << 2) | +$("tm-m0").value;
      $("tm-out").textContent = "mov TMOD,#" + b8(v) + "b   ; = " + h2(v) + "h";
    });
  })();
  (function () {
    if (!$("w-scon")) return;
    on(["sc-mode", "sc-ren", "sc-sm2"], function () {
      const v = (+$("sc-mode").value << 6) | (($("sc-sm2").checked ? 1 : 0) << 5) | (($("sc-ren").checked ? 1 : 0) << 4);
      $("sc-out").textContent = "mov SCON,#" + b8(v) + "b   ; = " + h2(v) + "h";
    });
  })();

  // --------------------------------------------------------- Mecanismo de prioridades
  (function () {
    if (!$("w-prio")) return;
    const ev = [
      { t: "Programa principal ejecutándose. L = H = 0. SP = 07h.", L: 0, H: 0, run: "PP", st: [] },
      { t: "Se activa IT1 (prioridad BAJA). Al terminar la instrucción en curso: como L = H = 0, se atiende. Se guarda PC1 en el stack (SP = 09h), PC ← vector de IT1 y L = 1.", L: 1, H: 0, run: "ISR IT1", st: ["PC1"] },
      { t: "Durante la ISR de IT1 se activa IT3 (prioridad BAJA). Como ya L = 1 (se atiende un nivel bajo), IT3 NO se atiende: su bandera de solicitud queda pendiente.", L: 1, H: 0, run: "ISR IT1", st: ["PC1"], pend: "IT3" },
      { t: "Se activa IT2 (prioridad ALTA). L = 1 y H = 0: una alta sí interrumpe a una baja (anidamiento). Se guarda PC2 (SP = 0Bh) y H = 1.", L: 1, H: 1, run: "ISR IT2", st: ["PC1", "PC2"], pend: "IT3" },
      { t: "RETI de la ISR de IT2: limpia el bit del nivel MÁS PRIORITARIO en servicio (H = 0) y saca PC2 del stack: se vuelve a la ISR de IT1.", L: 1, H: 0, run: "ISR IT1", st: ["PC1"], pend: "IT3" },
      { t: "RETI de la ISR de IT1: L = 0 y se vuelve a PC1. Tras ejecutar al menos una instrucción del PP, IT3 (aún pendiente) se atiende.", L: 0, H: 0, run: "PP", st: [], pend: "IT3" },
      { t: "Se atiende IT3: PC3 al stack, L = 1. (Si una ISR terminara con RET en vez de RETI, L quedaría a 1 y ninguna IT de prioridad baja volvería a atenderse).", L: 1, H: 0, run: "ISR IT3", st: ["PC3"] }
    ];
    let k = 0;
    function draw() {
      const e = ev[k];
      $("pr-out").textContent = (k + 1) + "/" + ev.length + " · " + e.t + "\n\nEjecutando: " + e.run + "    Bits ocultos: L = " + e.L + "  H = " + e.H + "    Pendiente: " + (e.pend || "—") +
        "\nStack: " + (e.st.length ? e.st.map(function (p, i) { return "[" + h2(8 + 2 * i) + "h–" + h2(9 + 2 * i) + "h] " + p; }).join("  ") + "   SP = " + h2(7 + 2 * e.st.length) + "h" : "vacío   SP = 07h");
    }
    $("pr-next").addEventListener("click", function () { if (k < ev.length - 1) k++; draw(); });
    $("pr-prev").addEventListener("click", function () { if (k > 0) k--; draw(); });
    draw();
  })();

  // ------------------------------------------------------- Calculadora de timers
  (function () {
    if (!$("w-tim")) return;
    on(["tc-t", "tc-u", "tc-mc", "tc-mode"], function () {
      const T = num("tc-t") * { us: 1e-6, ms: 1e-3, s: 1 }[$("tc-u").value], mc = num("tc-mc") * 1e-6, mode = +$("tc-mode").value;
      const N = Math.round(T / mc), max = mode === 1 ? 65536 : mode === 2 ? 256 : 8192;
      const lines = ["Ciclos de máquina a contar: N = T / Tcm = " + N.toLocaleString("es")];
      if (N <= max && N >= 1) {
        const r = max - N;
        lines.push("Cabe en el modo " + mode + " (máx. " + max + "): recarga = " + max + " − " + N + " = " + r + " = " + (mode === 1 ? h4(r) + "h → TH = " + h2(r >> 8) + "h, TL = " + h2(r) + "h" : h2(r) + "h → TH = TL = " + h2(r) + "h"));
        lines.push(mode === 1 ? "Modo 1 no tiene autorrecarga: recargar TH y TL en la ISR (detener, recargar, redisparar)." : mode === 2 ? "Modo 2: TL se recarga desde TH por hardware (tiempo exacto, sin intervención del SW)." : "Modo 0 (13 bits): compatibilidad con el 8048, no se usa.");
      } else {
        lines.push("No cabe en " + max + " cuentas: hace falta un postescalador por software (contador en la ISR).");
        const opts = [];
        for (let base = Math.min(max, N); base >= 1 && opts.length < 4; base--) { if (N % base === 0) { const k = N / base; if (k <= 255) opts.push([base, k]); } }
        if (!opts.length) lines.push("No hay una base exacta con postescalador ≤ 255: pruebe otra combinación.");
        opts.forEach(function (o) { const r = max - o[0]; lines.push("  base " + o[0].toLocaleString("es") + " ciclos (" + fmtT(o[0] * mc) + ") × " + o[1] + "  →  recarga " + (mode === 1 ? h4(r) + "h (TH=" + h2(r >> 8) + "h, TL=" + h2(r) + "h)" : h2(r) + "h") + ", contador por SW = " + o[1]); });
      }
      $("tc-out").textContent = lines.join("\n");
    });
  })();

  // ------------------------------------------------------ Calculadora de baudios
  (function () {
    if (!$("w-baud")) return;
    on(["bd-f", "bd-br", "bd-smod"], function () {
      const f = num("bd-f") * 1e6, br = num("bd-br"), smod = +$("bd-smod").value, k = smod ? 2 : 1;
      const x = 256 - k * f / (32 * 12 * br), th = Math.round(x), real = k * f / (32 * 12 * (256 - th)), err = (real - br) / br * 100;
      const lines = ["TH1 = 256 − 2^SMOD·fosc / (32·12·BR) = 256 − " + (k * f / (32 * 12 * br)).toFixed(2) + " = " + x.toFixed(2)];
      if (th < 0 || th > 255) lines.push("✘ Fuera de rango: no se puede con Timer 1 en modo 2 a esta frecuencia.");
      else lines.push("Con TH1 = " + th + " (" + h2(th) + "h): BR real = " + real.toFixed(1) + " bps, error = " + err.toFixed(2) + " %  " + (Math.abs(err) <= 2 ? "✔ aceptable (|error| ≲ 2 %)" : "✘ demasiado grande"));
      lines.push("\nTabla para fosc = " + num("bd-f") + " MHz, SMOD = " + smod + ":");
      [300, 1200, 2400, 4800, 9600, 19200].forEach(function (b) { const xx = 256 - k * f / (384 * b), t = Math.round(xx); if (t < 0 || t > 255) { lines.push("  " + String(b).padStart(5) + " bps: fuera de rango"); return; } const rr = k * f / (384 * (256 - t)); lines.push("  " + String(b).padStart(5) + " bps: TH1 = " + String(t).padStart(3) + " (" + h2(t) + "h)  real " + rr.toFixed(1).padStart(8) + "  error " + ((rr - b) / b * 100).toFixed(2).padStart(6) + " %"); });
      $("bd-out").textContent = lines.join("\n");
    });
  })();

  // ------------------------------------------------------------ Trama UART
  (function () {
    if (!$("w-frame")) return;
    const cv = $("fr-cv");
    on(["fr-ch", "fr-par", "fr-br"], function () {
      const s = $("fr-ch").value || "A", par = $("fr-par").value, br = num("fr-br");
      let byte = /^[0-9a-f]{2}h$/i.test(s) ? parseInt(s, 16) : s.charCodeAt(0) & 0xFF;
      const bits = [0]; for (let k = 0; k < 8; k++) bits.push((byte >> k) & 1);
      const ones = bits.slice(1).reduce(function (a, b) { return a + b; }, 0);
      if (par === "par") bits.push(ones % 2); else if (par === "impar") bits.push(1 - (ones % 2));
      bits.push(1);
      const W = cv.clientWidth, H = 110, d = window.devicePixelRatio || 1; cv.width = W * d; cv.height = H * d; cv.style.height = H + "px";
      const ctx = cv.getContext("2d"); ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, W, H);
      const css = getComputedStyle(document.documentElement), n = bits.length + 2, bw = (W - 20) / n, y1 = 25, y0 = 75;
      ctx.strokeStyle = css.getPropertyValue("--accent"); ctx.lineWidth = 2.5; ctx.beginPath();
      const all = [1].concat(bits, [1]); let x = 10; ctx.moveTo(x, all[0] ? y1 : y0);
      all.forEach(function (b) { const y = b ? y1 : y0; ctx.lineTo(x, y); x += bw; ctx.lineTo(x, y); });
      ctx.stroke();
      ctx.fillStyle = css.getPropertyValue("--muted"); ctx.font = "11px " + css.getPropertyValue("--font-mono"); ctx.textAlign = "center";
      const lab = ["reposo", "start"].concat([0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return "D" + k; }), par !== "no" ? ["P"] : [], ["stop", "reposo"]);
      lab.forEach(function (l, i) { ctx.fillText(l, 10 + bw * (i + 0.5), 98); ctx.fillText(String(all[i]), 10 + bw * (i + 0.5), 15); });
      const nb = bits.length, t = nb / br;
      $("fr-out").textContent = "Byte " + h2(byte) + "h = " + b8(byte) + "b (se transmite el LSB primero) · " + nb + " bits por carácter · a " + br + " bps: tbit = " + (1e3 / br).toFixed(3) + " ms, un carácter = " + (t * 1e3).toFixed(2) + " ms → máximo " + Math.floor(br / nb) + " caracteres/s";
    });
    window.addEventListener("resize", function () { $("fr-ch").dispatchEvent(new Event("input")); });
  })();
})();
