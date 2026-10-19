// Núcleo didáctico del 8051: ensamblador (sintaxis tipo ASEM-51 / MCU 8051 IDE) y CPU con
// temporizadores 0/1, interrupciones (2 niveles de prioridad), puerto serie y puertos de E/S.
// Sin dependencias. Expone window.Sim8051 = { assemble, CPU, toHex, SFR, BITS }.
(function () {
  "use strict";

  // ------------------------------------------------------------------ SFR y bits
  const SFR = {
    P0: 0x80, SP: 0x81, DPL: 0x82, DPH: 0x83, PCON: 0x87, TCON: 0x88, TMOD: 0x89, TL0: 0x8A, TL1: 0x8B,
    TH0: 0x8C, TH1: 0x8D, P1: 0x90, SCON: 0x98, SBUF: 0x99, P2: 0xA0, IE: 0xA8, P3: 0xB0, IP: 0xB8,
    PSW: 0xD0, ACC: 0xE0, B: 0xF0
  };
  const BITS = {
    IT0: 0x88, IE0: 0x89, IT1: 0x8A, IE1: 0x8B, TR0: 0x8C, TF0: 0x8D, TR1: 0x8E, TF1: 0x8F,
    RI: 0x98, TI: 0x99, RB8: 0x9A, TB8: 0x9B, REN: 0x9C, SM2: 0x9D, SM1: 0x9E, SM0: 0x9F,
    EX0: 0xA8, ET0: 0xA9, EX1: 0xAA, ET1: 0xAB, ES: 0xAC, EA: 0xAF,
    RXD: 0xB0, TXD: 0xB1, INT0: 0xB2, INT1: 0xB3, T0: 0xB4, T1: 0xB5, WR: 0xB6, RD: 0xB7,
    PX0: 0xB8, PT0: 0xB9, PX1: 0xBA, PT1: 0xBB, PS: 0xBC,
    P: 0xD0, OV: 0xD2, RS0: 0xD3, RS1: 0xD4, F0: 0xD5, AC: 0xD6, CY: 0xD7
  };
  const BITADDR_SFR = [0x80, 0x88, 0x90, 0x98, 0xA0, 0xA8, 0xB0, 0xB8, 0xC0, 0xC8, 0xD0, 0xD8, 0xE0, 0xE8, 0xF0, 0xF8];

  // ---------------------------------------------------------------- Ensamblador
  // Tabla: [mnemónico, patrón de operandos, código base, codificación de bytes extra]
  // Patrones: A AB C DPTR @A+DPTR @A+PC @DPTR @Ri Rn #d #d16 dir bit /bit rel a11 a16
  const T = [];
  function op(m, pat, code, enc) { T.push({ m: m, pat: pat, code: code, enc: enc || "" }); }
  op("NOP", "", 0x00); op("AJMP", "a11", 0x01); op("LJMP", "a16", 0x02, "16"); op("RR", "A", 0x03);
  op("INC", "A", 0x04); op("INC", "dir", 0x05, "d"); op("INC", "@Ri", 0x06); op("INC", "Rn", 0x08); op("INC", "DPTR", 0xA3);
  op("JBC", "bit,rel", 0x10, "br"); op("ACALL", "a11", 0x11); op("LCALL", "a16", 0x12, "16"); op("RRC", "A", 0x13);
  op("DEC", "A", 0x14); op("DEC", "dir", 0x15, "d"); op("DEC", "@Ri", 0x16); op("DEC", "Rn", 0x18);
  op("JB", "bit,rel", 0x20, "br"); op("RET", "", 0x22); op("RL", "A", 0x23);
  ["ADD", "ADDC", "SUBB"].forEach(function (m, i) { const b = [0x20, 0x30, 0x90][i]; op(m, "A,#d", b + 4, "i"); op(m, "A,dir", b + 5, "d"); op(m, "A,@Ri", b + 6); op(m, "A,Rn", b + 8); });
  op("JNB", "bit,rel", 0x30, "br"); op("RETI", "", 0x32); op("RLC", "A", 0x33);
  op("JC", "rel", 0x40, "r"); op("JNC", "rel", 0x50, "r"); op("JZ", "rel", 0x60, "r"); op("JNZ", "rel", 0x70, "r");
  ["ORL", "ANL", "XRL"].forEach(function (m, i) {
    const b = [0x40, 0x50, 0x60][i];
    op(m, "dir,A", b + 2, "d"); op(m, "dir,#d", b + 3, "di"); op(m, "A,#d", b + 4, "i"); op(m, "A,dir", b + 5, "d"); op(m, "A,@Ri", b + 6); op(m, "A,Rn", b + 8);
  });
  op("ORL", "C,bit", 0x72, "b"); op("ORL", "C,/bit", 0xA0, "b"); op("ANL", "C,bit", 0x82, "b"); op("ANL", "C,/bit", 0xB0, "b");
  op("JMP", "@A+DPTR", 0x73);
  op("MOV", "A,#d", 0x74, "i"); op("MOV", "dir,#d", 0x75, "di"); op("MOV", "@Ri,#d", 0x76, "i"); op("MOV", "Rn,#d", 0x78, "i");
  op("SJMP", "rel", 0x80, "r"); op("MOVC", "A,@A+PC", 0x83); op("DIV", "AB", 0x84);
  op("MOV", "dir,dir", 0x85, "dd"); op("MOV", "dir,@Ri", 0x86, "d"); op("MOV", "dir,Rn", 0x88, "d");
  op("MOV", "DPTR,#d16", 0x90, "16"); op("MOV", "bit,C", 0x92, "b"); op("MOVC", "A,@A+DPTR", 0x93);
  op("MOV", "C,bit", 0xA2, "b"); op("MUL", "AB", 0xA4);
  op("MOV", "@Ri,dir", 0xA6, "d"); op("MOV", "Rn,dir", 0xA8, "d");
  op("CPL", "bit", 0xB2, "b"); op("CPL", "C", 0xB3); op("CPL", "A", 0xF4);
  op("CJNE", "A,#d,rel", 0xB4, "ir"); op("CJNE", "A,dir,rel", 0xB5, "dr"); op("CJNE", "@Ri,#d,rel", 0xB6, "ir"); op("CJNE", "Rn,#d,rel", 0xB8, "ir");
  op("PUSH", "dir", 0xC0, "d"); op("POP", "dir", 0xD0, "d");
  op("CLR", "bit", 0xC2, "b"); op("CLR", "C", 0xC3); op("CLR", "A", 0xE4);
  op("SETB", "bit", 0xD2, "b"); op("SETB", "C", 0xD3);
  op("SWAP", "A", 0xC4); op("XCH", "A,dir", 0xC5, "d"); op("XCH", "A,@Ri", 0xC6); op("XCH", "A,Rn", 0xC8);
  op("DA", "A", 0xD4); op("DJNZ", "dir,rel", 0xD5, "dr"); op("XCHD", "A,@Ri", 0xD6); op("DJNZ", "Rn,rel", 0xD8, "r");
  op("MOVX", "A,@DPTR", 0xE0); op("MOVX", "A,@Ri", 0xE2); op("MOVX", "@DPTR,A", 0xF0); op("MOVX", "@Ri,A", 0xF2);
  op("MOV", "A,dir", 0xE5, "d"); op("MOV", "A,@Ri", 0xE6); op("MOV", "A,Rn", 0xE8);
  op("MOV", "dir,A", 0xF5, "d"); op("MOV", "@Ri,A", 0xF6); op("MOV", "Rn,A", 0xF8);
  const MNEMS = new Set(T.map(function (e) { return e.m; }).concat(["JMP", "CALL"]));

  function parseNumber(s) {
    s = s.trim();
    let m;
    if ((m = /^0x([0-9a-f]+)$/i.exec(s))) return parseInt(m[1], 16);
    if ((m = /^([0-9][0-9a-f]*)h$/i.exec(s))) return parseInt(m[1], 16);
    if ((m = /^([01]+)b$/i.exec(s))) return parseInt(m[1], 2);
    if ((m = /^0b([01]+)$/i.exec(s))) return parseInt(m[1], 2);
    if ((m = /^([0-7]+)[oq]$/i.exec(s))) return parseInt(m[1], 8);
    if ((m = /^([0-9]+)d?$/i.exec(s))) return parseInt(m[1], 10);
    if ((m = /^'(.)'$/.exec(s))) return m[1].charCodeAt(0);
    return null;
  }

  // Evaluador de expresiones: + - * / MOD AND OR XOR NOT SHL SHR HIGH LOW, paréntesis, $ y símbolos
  function evalExpr(expr, sym, pc, pass) {
    const toks = [];
    const re = /\s*(\$|'[^']'|[0-9][0-9a-fA-F]*[hH]\b|0[xX][0-9a-fA-F]+|0[bB][01]+|[01]+[bB]\b|[0-9]+[dD]?\b|[A-Za-z_?][A-Za-z0-9_?]*|<<|>>|[()+\-*/%&|^~])/y;
    let m, i = 0;
    expr = expr.trim();
    while (i < expr.length) {
      re.lastIndex = i; m = re.exec(expr);
      if (!m) throw new Error("expresión no válida: «" + expr + "»");
      toks.push(m[1]); i = re.lastIndex;
      while (i < expr.length && expr[i] === " ") i++;
    }
    let p = 0;
    function peek() { return toks[p]; }
    function next() { return toks[p++]; }
    function prim() {
      const t = next();
      if (t === undefined) throw new Error("expresión incompleta: «" + expr + "»");
      if (t === "(") { const v = orx(); if (next() !== ")") throw new Error("falta «)»"); return v; }
      if (t === "-") return -prim();
      if (t === "+") return prim();
      if (t === "~" || /^not$/i.test(t)) return ~prim() & 0xFFFF;
      if (/^high$/i.test(t)) return (prim() >> 8) & 0xFF;
      if (/^low$/i.test(t)) return prim() & 0xFF;
      if (t === "$") return pc;
      const n = parseNumber(t);
      if (n !== null) return n;
      const k = t.toUpperCase();
      if (sym.hasOwnProperty(k)) { const s = sym[k]; if (s.kind === "num" || s.kind === "bit") return s.value; throw new Error("«" + t + "» no es un valor numérico"); }
      if (SFR.hasOwnProperty(k)) return SFR[k];
      if (BITS.hasOwnProperty(k)) return BITS[k];
      if (pass === 1) return 0;
      throw new Error("símbolo no definido: «" + t + "»");
    }
    function mul() { let v = prim(); for (;;) { const t = peek(); if (t === "*") { next(); v *= prim(); } else if (t === "/") { next(); const d = prim(); v = d ? Math.floor(v / d) : 0; } else if (t === "%" || /^mod$/i.test(t || "")) { next(); v %= prim(); } else return v; } }
    function add() { let v = mul(); for (;;) { const t = peek(); if (t === "+") { next(); v += mul(); } else if (t === "-") { next(); v -= mul(); } else return v; } }
    function sh() { let v = add(); for (;;) { const t = peek(); if (t === "<<" || /^shl$/i.test(t || "")) { next(); v <<= add(); } else if (t === ">>" || /^shr$/i.test(t || "")) { next(); v >>= add(); } else return v; } }
    function andx() { let v = sh(); while (peek() === "&" || /^and$/i.test(peek() || "")) { next(); v &= sh(); } return v; }
    function orx() { let v = andx(); for (;;) { const t = peek(); if (t === "|" || /^or$/i.test(t || "")) { next(); v |= andx(); } else if (t === "^" || /^xor$/i.test(t || "")) { next(); v ^= andx(); } else return v; } }
    const v = orx();
    if (p < toks.length) throw new Error("sobra «" + toks.slice(p).join(" ") + "» en la expresión");
    return v;
  }

  function splitOperands(s) {
    const out = []; let cur = "", q = false;
    for (const ch of s) {
      if (ch === "'" ) q = !q;
      if (ch === "," && !q) { out.push(cur.trim()); cur = ""; } else cur += ch;
    }
    if (cur.trim() !== "") out.push(cur.trim());
    return out;
  }
  function stripComment(line) {
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === "'" || c === '"') q = !q;
      else if (c === ";" && !q) return line.slice(0, i);
    }
    return line;
  }

  function assemble(src) {
    const lines = src.replace(/\r/g, "").split("\n");
    let sym = {}, errors = [], listing = [], code = null, used = null, lineOfAddr = {};
    for (let pass = 1; pass <= 2; pass++) {
      code = new Uint8Array(65536); used = new Uint8Array(65536);
      let pc = 0; errors = []; listing = []; lineOfAddr = {};
      let ended = false;
      for (let ln = 0; ln < lines.length && !ended; ln++) {
        const raw = lines[ln];
        let s = stripComment(raw).trim();
        const entry = { line: ln + 1, addr: pc, bytes: [], src: raw };
        try {
          if (!s) { listing.push(entry); continue; }
          // etiqueta
          let m = /^([A-Za-z_?][A-Za-z0-9_?]*)\s*:\s*(.*)$/.exec(s);
          if (m && !MNEMS.has(m[1].toUpperCase())) {
            const k = m[1].toUpperCase();
            if (pass === 1) { if (sym[k] && sym[k].kind !== "label?") throw new Error("etiqueta duplicada «" + m[1] + "»"); sym[k] = { kind: "num", value: pc, label: true }; }
            s = m[2].trim();
            if (!s) { listing.push(entry); continue; }
          }
          // símbolo EQU / BIT / DATA / CODE / SET
          m = /^([A-Za-z_?][A-Za-z0-9_?]*)\s+(EQU|BIT|DATA|IDATA|XDATA|CODE|SET)\s+(.+)$/i.exec(s);
          if (m) {
            const k = m[1].toUpperCase(), kind = m[2].toUpperCase(), val = m[3].trim();
            if (/^(R[0-7]|A|@R[01]|DPTR|C|AB)$/i.test(val)) sym[k] = { kind: "alias", text: val.toUpperCase() };
            else if (/\.\s*[0-7]$/.test(val) || kind === "BIT") sym[k] = { kind: "bit", value: bitAddr(val, sym, pc, pass) };
            else sym[k] = { kind: "num", value: evalExpr(val, sym, pc, pass) };
            listing.push(entry); continue;
          }
          m = /^([A-Za-z]+)\b\s*(.*)$/.exec(s);
          if (!m) throw new Error("línea no reconocida");
          let mn = m[1].toUpperCase(); const rest = m[2].trim();
          if (mn === "ORG") { pc = evalExpr(rest, sym, pc, pass) & 0xFFFF; entry.addr = pc; listing.push(entry); continue; }
          if (mn === "END") { listing.push(entry); ended = true; continue; }
          if (mn === "DB" || mn === "DW" || mn === "DS") {
            const vals = splitOperands(rest);
            if (mn === "DS") { pc += evalExpr(rest, sym, pc, pass); listing.push(entry); continue; }
            for (const v of vals) {
              const str = /^(['"])(.*)\1$/.exec(v);
              if (str && mn === "DB" && str[2].length !== 1) { for (const ch of str[2]) emit(ch.charCodeAt(0) & 0xFF); continue; }
              const n = evalExpr(v, sym, pc, pass);
              if (mn === "DB") emit(n & 0xFF); else { emit((n >> 8) & 0xFF); emit(n & 0xFF); }
            }
            listing.push(entry); continue;
          }
          if (/^(USING|NAME|\$\w*)$/i.test(mn)) { listing.push(entry); continue; }
          if (!MNEMS.has(mn)) throw new Error("instrucción desconocida «" + m[1] + "»");
          let ops = splitOperands(rest).map(function (o) { return expandAlias(o, sym); });
          if (mn === "JMP" && !(ops.length === 1 && /^@A\s*\+\s*DPTR$/i.test(ops[0]))) mn = "LJMP";
          if (mn === "CALL") mn = "LCALL";
          const enc = encode(mn, ops, sym, pc, pass);
          enc.forEach(emit);
          listing.push(entry);
        } catch (e) {
          errors.push({ line: ln + 1, msg: e.message, src: raw.trim() });
          listing.push(entry);
        }
        function emit(b) { if (pass === 2) { if (used[pc]) errors.push({ line: ln + 1, msg: "solapamiento en la dirección " + hex4(pc), src: raw.trim() }); code[pc] = b; used[pc] = 1; lineOfAddr[pc] = ln + 1; } entry.bytes.push(b); pc = (pc + 1) & 0xFFFF; }
      }
    }
    let size = 0; for (let a = 0; a < 65536; a++) if (used[a]) size = a + 1;
    return { code: code, used: used, size: size, listing: listing, errors: errors, symbols: sym, lineOfAddr: lineOfAddr };
  }

  function expandAlias(o, sym) {
    const k = o.toUpperCase();
    if (sym[k] && sym[k].kind === "alias") return sym[k].text;
    if (o[0] === "#" ) { const k2 = o.slice(1).trim().toUpperCase(); if (sym[k2] && sym[k2].kind === "alias") return "#" + sym[k2].text; }
    if (o[0] === "@") { const k3 = o.slice(1).trim().toUpperCase(); if (sym[k3] && sym[k3].kind === "alias") return "@" + sym[k3].text; }
    return o;
  }

  function bitAddr(s, sym, pc, pass) {
    s = s.trim();
    const m = /^(.+)\.\s*([0-7])$/.exec(s);
    if (m) {
      const base = m[1].trim(), n = +m[2];
      let a = base.toUpperCase() === "A" ? 0xE0 : evalExpr(base, sym, pc, pass);
      if (pass === 1 && !a) return 0;
      if (a >= 0x20 && a <= 0x2F) return (a - 0x20) * 8 + n;
      if (a >= 0x80 && (a & 7) === 0) return a + n;
      throw new Error("el byte " + hex2(a) + "h no es direccionable bit a bit");
    }
    const k = s.toUpperCase();
    if (sym[k] && sym[k].kind === "bit") return sym[k].value;
    if (BITS.hasOwnProperty(k)) return BITS[k];
    if (k === "C") return BITS.CY;
    const v = evalExpr(s, sym, pc, pass);
    if (v < 0 || v > 255) throw new Error("dirección de bit fuera de rango");
    return v;
  }

  function classify(o) {
    const u = o.toUpperCase().replace(/\s+/g, "");
    if (u === "A" || u === "ACC" && false) return { t: "A" };
    if (u === "AB") return { t: "AB" };
    if (u === "C") return { t: "C" };
    if (u === "DPTR") return { t: "DPTR" };
    if (u === "@A+DPTR") return { t: "@A+DPTR" };
    if (u === "@A+PC") return { t: "@A+PC" };
    if (u === "@DPTR") return { t: "@DPTR" };
    let m = /^@R([01])$/.exec(u); if (m) return { t: "@Ri", r: +m[1] };
    m = /^R([0-7])$/.exec(u); if (m) return { t: "Rn", r: +m[1] };
    if (o.trim()[0] === "#") return { t: "#", e: o.trim().slice(1) };
    if (o.trim()[0] === "/") return { t: "/bit", e: o.trim().slice(1) };
    return { t: "x", e: o.trim() };   // dirección directa, bit, rel o dirección de código: depende de la instrucción
  }

  function encode(mn, ops, sym, pc, pass) {
    const cs = ops.map(classify);
    const looksBit = function (o) { const u = o.toUpperCase().trim(); return /\.\s*[0-7]$/.test(u) || BITS.hasOwnProperty(u) || (sym[u] && sym[u].kind === "bit"); };
    if (mn === "MOV" && cs.length === 2 && cs[0].t === "x" && cs[1].t === "x" && (looksBit(ops[0]) || looksBit(ops[1])))
      throw new Error("no se puede mover de un bit a otro directamente: hágalo a través del acarreo (MOV C,bit y MOV bit,C)");
    const cands = T.filter(function (e) { return e.m === mn; });
    for (const e of cands) {
      const pat = e.pat ? e.pat.split(",") : [];
      if (pat.length !== cs.length) continue;
      let ok = true;
      for (let i = 0; i < pat.length && ok; i++) {
        const p = pat[i], c = cs[i];
        if (p === "A" || p === "AB" || p === "C" || p === "DPTR" || p === "@A+DPTR" || p === "@A+PC" || p === "@DPTR" || p === "@Ri" || p === "Rn") ok = c.t === p;
        else if (p === "#d" || p === "#d16") ok = c.t === "#";
        else if (p === "/bit") ok = c.t === "/bit";
        else ok = c.t === "x";
      }
      if (!ok) continue;
      // codificación
      let opc = e.code; const extra = [];
      const reg = cs.find(function (c) { return c.t === "Rn" || c.t === "@Ri"; });
      if (reg) opc += reg.r;
      const next = pc + size(e);
      const vals = [];
      for (let i = 0; i < pat.length; i++) {
        const p = pat[i], c = cs[i];
        if (p === "dir") { const v = evalExpr(c.e, sym, pc, pass); if (pass === 2 && (v < 0 || v > 255)) throw new Error("dirección directa fuera de rango: " + c.e); vals.push({ k: "d", v: v & 0xFF }); }
        else if (p === "#d") { const v = evalExpr(c.e, sym, pc, pass); if (pass === 2 && (v < -128 || v > 255)) throw new Error("valor inmediato de 8 bits fuera de rango: " + c.e); vals.push({ k: "i", v: v & 0xFF }); }
        else if (p === "#d16") vals.push({ k: "16", v: evalExpr(c.e, sym, pc, pass) & 0xFFFF });
        else if (p === "bit" || p === "/bit") vals.push({ k: "b", v: bitAddr(c.e, sym, pc, pass) & 0xFF });
        else if (p === "rel") { const t = evalExpr(c.e, sym, pc, pass); let r = t - next; if (pass === 2 && (r < -128 || r > 127)) throw new Error("salto relativo fuera de alcance (" + r + " bytes): use LJMP"); vals.push({ k: "r", v: r & 0xFF }); }
        else if (p === "a16") vals.push({ k: "16", v: evalExpr(c.e, sym, pc, pass) & 0xFFFF });
        else if (p === "a11") { const t = evalExpr(c.e, sym, pc, pass); if (pass === 2 && ((t & 0xF800) !== (next & 0xF800))) throw new Error("AJMP/ACALL fuera del bloque de 2 kB"); opc |= ((t >> 8) & 7) << 5; vals.push({ k: "lo", v: t & 0xFF }); }
      }
      // MOV dir,dir: el código lleva primero la fuente
      if (e.code === 0x85) return [opc, vals[1].v, vals[0].v];
      vals.forEach(function (x) { if (x.k === "16") { extra.push((x.v >> 8) & 0xFF, x.v & 0xFF); } else extra.push(x.v); });
      return [opc].concat(extra);
    }
    // ¿por qué falló? mensajes útiles
    if (mn === "MOV" && cs.length === 2 && cs[0].t === "Rn" && cs[1].t === "Rn") throw new Error("no existe MOV Rn,Rn: no se pueden codificar dos registros en una instrucción (use MOV A,Rn o direccionado directo)");
    if (cs.length === 2 && cs[0].t === "@Ri" && cs[1].t === "@Ri") throw new Error("no se admiten dos operandos con direccionado indirecto");
    if (["ADD", "ADDC", "SUBB"].indexOf(mn) >= 0 && cs[0] && cs[0].t !== "A") throw new Error(mn + " siempre tiene al acumulador A como destino");
    throw new Error("combinación de operandos no válida para " + mn + (ops.length ? " " + ops.join(", ") : ""));
  }
  function size(e) {
    let n = 1;
    for (const p of (e.pat ? e.pat.split(",") : [])) { if (p === "dir" || p === "#d" || p === "bit" || p === "/bit" || p === "rel" || p === "a11") n++; else if (p === "#d16" || p === "a16") n += 2; }
    return n;
  }

  function hex2(v) { return (v & 0xFF).toString(16).toUpperCase().padStart(2, "0"); }
  function hex4(v) { return (v & 0xFFFF).toString(16).toUpperCase().padStart(4, "0"); }

  function toHex(res) {
    const out = [];
    let a = 0;
    while (a < 65536) {
      if (!res.used[a]) { a++; continue; }
      const start = a, bytes = [];
      while (a < 65536 && res.used[a] && bytes.length < 16) bytes.push(res.code[a++]);
      let sum = bytes.length + (start >> 8) + (start & 0xFF);
      bytes.forEach(function (b) { sum += b; });
      out.push(":" + hex2(bytes.length) + hex4(start) + "00" + bytes.map(hex2).join("") + hex2((-sum) & 0xFF));
    }
    out.push(":00000001FF");
    return out.join("\n");
  }

  // ------------------------------------------------------------------------ CPU
  const CYC = new Uint8Array(256).fill(1);
  (function () {
    const two = [0x02, 0x10, 0x12, 0x20, 0x22, 0x30, 0x32, 0x40, 0x43, 0x50, 0x53, 0x60, 0x63, 0x70, 0x72, 0x73, 0x75, 0x76, 0x77, 0x80, 0x82, 0x83, 0x85, 0x86, 0x87, 0x90, 0x92, 0x93, 0xA0, 0xA2, 0xA3, 0xA6, 0xA7, 0xB0, 0xC0, 0xD0, 0xD5, 0xE0, 0xE2, 0xE3, 0xF0, 0xF2, 0xF3];
    two.forEach(function (o) { CYC[o] = 2; });
    for (let o = 0x01; o < 0x100; o += 0x20) CYC[o] = 2;            // AJMP
    for (let o = 0x11; o < 0x100; o += 0x20) CYC[o] = 2;            // ACALL
    for (let o = 0x88; o <= 0x8F; o++) CYC[o] = 2;                  // MOV dir,Rn
    for (let o = 0xA8; o <= 0xAF; o++) CYC[o] = 2;                  // MOV Rn,dir
    for (let o = 0xB4; o <= 0xBF; o++) CYC[o] = 2;                  // CJNE
    for (let o = 0xD8; o <= 0xDF; o++) CYC[o] = 2;                  // DJNZ Rn
    CYC[0x84] = 4; CYC[0xA4] = 4;                                   // DIV, MUL
  })();
  const RMW_PORTS = { 0x80: 1, 0x90: 1, 0xA0: 1, 0xB0: 1 };

  function CPU() {
    this.code = new Uint8Array(65536);
    this.xram = new Uint8Array(65536);
    this.onTx = null;        // callback(byte)
    this.reset();
  }
  CPU.prototype.reset = function () {
    this.iram = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.iram[i] = (i * 73 + 41) & 0xFF;   // la RAM no se inicializa con RESET
    this.sfr = new Uint8Array(256);
    this.sfr[0x81] = 7; this.sfr[0x80] = this.sfr[0x90] = this.sfr[0xA0] = this.sfr[0xB0] = 0xFF;
    this.ext = [0xFF, 0xFF, 0xFF, 0xFF];      // nivel que imponen los dispositivos externos a cada puerto (1 = no fuerza)
    this.pc = 0; this.cycles = 0; this.inService = [0, 0]; this.lastInt0 = 1; this.lastInt1 = 1; this.lastT0 = 1; this.lastT1 = 1;
    this.sbufRx = 0; this.tx = null; this.rx = null; this.rxQueue = []; this.noIntNext = false; this.halted = false;
    this.history = []; this.toggles = {};
  };
  CPU.prototype.load = function (res) { this.code = res.code.slice(); };
  // pines de los puertos = latch AND dispositivo externo
  CPU.prototype.pins = function (n) { return this.sfr[0x80 + n * 0x10] & this.ext[n]; };
  CPU.prototype.bank = function () { return (this.sfr[0xD0] >> 3) & 3; };
  CPU.prototype.R = function (n) { return this.iram[this.bank() * 8 + n]; };
  CPU.prototype.setR = function (n, v) { this.iram[this.bank() * 8 + n] = v & 0xFF; };
  CPU.prototype.parity = function () { let a = this.sfr[0xE0], p = 0; while (a) { p ^= a & 1; a >>= 1; } this.sfr[0xD0] = (this.sfr[0xD0] & 0xFE) | p; };
  CPU.prototype.rd = function (a, rmw) {          // lectura con direccionado directo
    if (a < 0x80) return this.iram[a];
    if (a === 0x99) return this.sbufRx;
    if (!rmw && RMW_PORTS[a]) return this.pins((a - 0x80) >> 4);
    return this.sfr[a];
  };
  CPU.prototype.wr = function (a, v) {
    v &= 0xFF;
    if (a < 0x80) { this.iram[a] = v; return; }
    if (a === 0x99) { this.startTx(v); return; }
    if (a === 0xA8 || a === 0xB8) this.noIntNext = true;
    if (RMW_PORTS[a]) {
      const n = (a - 0x80) >> 4, old = this.sfr[a], ch = old ^ v;
      for (let b = 0; b < 8; b++) if (ch & (1 << b)) { const k = n * 8 + b; this.toggles[k] = (this.toggles[k] || 0) + 1; }
    }
    this.sfr[a] = v;
    if (a === 0xE0) this.parity();
  };
  CPU.prototype.rdBit = function (b, rmw) {
    if (b < 0x80) return (this.iram[0x20 + (b >> 3)] >> (b & 7)) & 1;
    const a = b & 0xF8;
    return (this.rd(a, rmw) >> (b & 7)) & 1;
  };
  CPU.prototype.wrBit = function (b, v) {
    if (b < 0x80) { const a = 0x20 + (b >> 3), m = 1 << (b & 7); this.iram[a] = v ? this.iram[a] | m : this.iram[a] & ~m; return; }
    const a = b & 0xF8, m = 1 << (b & 7);
    const cur = this.sfr[a];
    this.wr(a, v ? cur | m : cur & ~m);
  };
  CPU.prototype.CY = function () { return this.sfr[0xD0] >> 7; };
  CPU.prototype.setCY = function (c) { this.sfr[0xD0] = c ? this.sfr[0xD0] | 0x80 : this.sfr[0xD0] & 0x7F; };
  CPU.prototype.push = function (v) { const sp = (this.sfr[0x81] + 1) & 0xFF; this.sfr[0x81] = sp; this.iram[sp] = v & 0xFF; };
  CPU.prototype.pop = function () { const sp = this.sfr[0x81], v = this.iram[sp]; this.sfr[0x81] = (sp - 1) & 0xFF; return v; };
  CPU.prototype.fetch = function () { const v = this.code[this.pc]; this.pc = (this.pc + 1) & 0xFFFF; return v; };
  CPU.prototype.rel = function (r) { this.pc = (this.pc + ((r << 24) >> 24)) & 0xFFFF; };
  CPU.prototype.addOp = function (v, withC, sub) {
    const a = this.sfr[0xE0], c = withC ? this.CY() : 0;
    let res, cy, ac, ov;
    if (!sub) { res = a + v + c; cy = res > 0xFF; ac = ((a & 0xF) + (v & 0xF) + c) > 0xF; ov = (~(a ^ v) & (a ^ res) & 0x80) !== 0; }
    else { res = a - v - c; cy = res < 0; ac = ((a & 0xF) - (v & 0xF) - c) < 0; ov = ((a ^ v) & (a ^ res) & 0x80) !== 0; }
    let psw = this.sfr[0xD0] & ~(0x80 | 0x40 | 0x04);
    if (cy) psw |= 0x80; if (ac) psw |= 0x40; if (ov) psw |= 0x04;
    this.sfr[0xD0] = psw;
    this.wr(0xE0, res & 0xFF);
  };
  CPU.prototype.snapshot = function () {
    return { iram: this.iram.slice(), sfr: this.sfr.slice(), pc: this.pc, cycles: this.cycles, inService: this.inService.slice(), sbufRx: this.sbufRx,
      tx: this.tx && Object.assign({}, this.tx), rx: this.rx && Object.assign({}, this.rx), rxQueue: this.rxQueue.slice(), lastInt0: this.lastInt0, lastInt1: this.lastInt1, xram: null };
  };
  CPU.prototype.restore = function (s) {
    this.iram = s.iram; this.sfr = s.sfr; this.pc = s.pc; this.cycles = s.cycles; this.inService = s.inService; this.sbufRx = s.sbufRx;
    this.tx = s.tx; this.rx = s.rx; this.rxQueue = s.rxQueue; this.lastInt0 = s.lastInt0; this.lastInt1 = s.lastInt1;
  };

  // --- periféricos
  CPU.prototype.bitCycles = function () {
    const scon = this.sfr[0x98], mode = scon >> 6, smod = this.sfr[0x87] >> 7;
    if (mode === 0) return 1;
    if (mode === 2) return smod ? 16 / 12 * 2 : 64 / 12 * 2;   // fosc/32 o fosc/64 → en ciclos de máquina
    const tmod = this.sfr[0x89] >> 4, tr1 = (this.sfr[0x88] >> 6) & 1;
    if (!tr1) return Infinity;
    const t1mode = tmod & 3;
    const per = t1mode === 2 ? 256 - this.sfr[0x8D] : t1mode === 1 ? 65536 : 8192;
    return per * (smod ? 16 : 32);
  };
  CPU.prototype.frameBits = function () { const mode = this.sfr[0x98] >> 6; return mode === 0 ? 8 : mode === 1 ? 10 : 11; };
  CPU.prototype.startTx = function (v) { this.tx = { byte: v, left: this.bitCycles() * this.frameBits() }; };
  CPU.prototype.tickPeripherals = function (n) {
    // temporizadores
    const tmod = this.sfr[0x89], tcon = this.sfr[0x88], p3 = this.pins(3);
    for (let t = 0; t < 2; t++) {
      const cfg = (tmod >> (t * 4)) & 0xF, mode = cfg & 3, ct = (cfg >> 2) & 1, gate = (cfg >> 3) & 1;
      const tr = (tcon >> (4 + t * 2)) & 1, intPin = (p3 >> (2 + t)) & 1;
      if (t === 1 && (tmod & 3) === 3) { /* T0 en modo 3 usa TR1/TF1 para TH0 */ }
      if (!tr || (gate && !intPin)) continue;
      let pulses;
      if (ct) { const pin = (p3 >> (4 + t)) & 1, last = t ? this.lastT1 : this.lastT0; pulses = (last === 1 && pin === 0) ? 1 : 0; } else pulses = n;
      if (t === 1 && mode === 3) continue;
      const TL = 0x8A + t, TH = 0x8C + t, TF = 0x20 << (t * 2);
      for (let k = 0; k < pulses; k++) {
        if (mode === 1) { let v = ((this.sfr[TH] << 8) | this.sfr[TL]) + 1; if (v > 0xFFFF) { v = 0; this.sfr[0x88] |= TF; } this.sfr[TH] = v >> 8; this.sfr[TL] = v & 0xFF; }
        else if (mode === 2) { let v = this.sfr[TL] + 1; if (v > 0xFF) { v = this.sfr[TH]; this.sfr[0x88] |= TF; } this.sfr[TL] = v; }
        else if (mode === 0) { let v = (((this.sfr[TH] << 5) | (this.sfr[TL] & 0x1F)) + 1); if (v > 0x1FFF) { v = 0; this.sfr[0x88] |= TF; } this.sfr[TH] = (v >> 5) & 0xFF; this.sfr[TL] = (this.sfr[TL] & 0xE0) | (v & 0x1F); }
        else { let v = this.sfr[TL] + 1; if (v > 0xFF) { v = 0; this.sfr[0x88] |= TF; } this.sfr[TL] = v; }
      }
    }
    this.lastT0 = (p3 >> 4) & 1; this.lastT1 = (p3 >> 5) & 1;
    // interrupciones externas
    const i0 = (p3 >> 2) & 1, i1 = (p3 >> 3) & 1;
    if (this.sfr[0x88] & 0x01) { if (this.lastInt0 === 1 && i0 === 0) this.sfr[0x88] |= 0x02; } else { this.sfr[0x88] = i0 ? this.sfr[0x88] & ~0x02 : this.sfr[0x88] | 0x02; }
    if (this.sfr[0x88] & 0x04) { if (this.lastInt1 === 1 && i1 === 0) this.sfr[0x88] |= 0x08; } else { this.sfr[0x88] = i1 ? this.sfr[0x88] & ~0x08 : this.sfr[0x88] | 0x08; }
    this.lastInt0 = i0; this.lastInt1 = i1;
    // puerto serie
    if (this.tx) { this.tx.left -= n; if (this.tx.left <= 0) { this.sfr[0x98] |= 0x02; const b = this.tx.byte; this.tx = null; if (this.onTx) this.onTx(b); } }
    const ren = (this.sfr[0x98] >> 4) & 1;
    if (!this.rx && ren && this.rxQueue.length) { const bc = this.bitCycles(); if (isFinite(bc)) this.rx = { byte: this.rxQueue.shift(), left: bc * this.frameBits() }; }
    if (this.rx) { this.rx.left -= n; if (this.rx.left <= 0) { if (!(this.sfr[0x98] & 1)) { this.sbufRx = this.rx.byte; this.sfr[0x98] |= 0x01; } this.rx = null; } }
  };
  CPU.prototype.checkInterrupts = function () {
    if (this.noIntNext) { this.noIntNext = false; return false; }
    const ie = this.sfr[0xA8];
    if (!(ie & 0x80)) return false;
    const tcon = this.sfr[0x88], scon = this.sfr[0x98], ip = this.sfr[0xB8];
    const srcs = [
      { req: tcon & 0x02, en: ie & 0x01, pr: ip & 0x01, vec: 0x03, clr: function (c) { if (c.sfr[0x88] & 0x01) c.sfr[0x88] &= ~0x02; } },
      { req: tcon & 0x20, en: ie & 0x02, pr: ip & 0x02, vec: 0x0B, clr: function (c) { c.sfr[0x88] &= ~0x20; } },
      { req: tcon & 0x08, en: ie & 0x04, pr: ip & 0x04, vec: 0x13, clr: function (c) { if (c.sfr[0x88] & 0x04) c.sfr[0x88] &= ~0x08; } },
      { req: tcon & 0x80, en: ie & 0x08, pr: ip & 0x08, vec: 0x1B, clr: function (c) { c.sfr[0x88] &= ~0x80; } },
      { req: scon & 0x03, en: ie & 0x10, pr: ip & 0x10, vec: 0x23, clr: function () {} }
    ];
    for (const lvl of [1, 0]) {
      if (this.inService[1]) return false;              // atendiendo nivel alto: nada interrumpe
      if (lvl === 0 && this.inService[0]) return false;   // atendiendo nivel bajo: solo interrumpe uno alto
      for (const s of srcs) {
        if (s.req && s.en && (s.pr ? 1 : 0) === lvl) {
          s.clr(this);
          this.push(this.pc & 0xFF); this.push(this.pc >> 8);
          this.pc = s.vec; this.inService[lvl] = 1; this.cycles += 2; this.tickPeripherals(2);
          this.lastInterrupt = s.vec;
          return true;
        }
      }
    }
    return false;
  };

  CPU.prototype.step = function (record) {
    if (record) { this.history.push(this.snapshot()); if (this.history.length > 3000) this.history.shift(); }
    const pc0 = this.pc, o = this.fetch();
    const A = 0xE0, me = this;
    function RN() { return o & 7; }
    function RI() { return me.R(o & 1); }
    let cyc = CYC[o];
    switch (o) {
      case 0x00: break;
      case 0x02: { const h = this.fetch(), l = this.fetch(); this.pc = (h << 8) | l; break; }
      case 0x03: { const a = this.sfr[A]; this.wr(A, (a >> 1) | ((a & 1) << 7)); break; }
      case 0x04: this.wr(A, this.sfr[A] + 1); break;
      case 0x05: { const d = this.fetch(); this.wr(d, this.rd(d, true) + 1); break; }
      case 0x06: case 0x07: { const r = RI(); this.iram[r] = (this.iram[r] + 1) & 0xFF; break; }
      case 0x10: { const b = this.fetch(), r = this.fetch(); if (this.rdBit(b, true)) { this.wrBit(b, 0); this.rel(r); } break; }
      case 0x12: { const h = this.fetch(), l = this.fetch(); this.push(this.pc & 0xFF); this.push(this.pc >> 8); this.pc = (h << 8) | l; break; }
      case 0x13: { const a = this.sfr[A], c = this.CY(); this.setCY(a & 1); this.wr(A, (a >> 1) | (c << 7)); break; }
      case 0x14: this.wr(A, this.sfr[A] - 1); break;
      case 0x15: { const d = this.fetch(); this.wr(d, this.rd(d, true) - 1); break; }
      case 0x16: case 0x17: { const r = RI(); this.iram[r] = (this.iram[r] - 1) & 0xFF; break; }
      case 0x20: { const b = this.fetch(), r = this.fetch(); if (this.rdBit(b)) this.rel(r); break; }
      case 0x22: { const h = this.pop(), l = this.pop(); this.pc = (h << 8) | l; break; }
      case 0x23: { const a = this.sfr[A]; this.wr(A, ((a << 1) | (a >> 7)) & 0xFF); break; }
      case 0x24: case 0x34: case 0x94: this.addOp(this.fetch(), o !== 0x24, o === 0x94); break;
      case 0x25: case 0x35: case 0x95: this.addOp(this.rd(this.fetch()), o !== 0x25, o === 0x95); break;
      case 0x26: case 0x27: case 0x36: case 0x37: case 0x96: case 0x97: this.addOp(this.iram[RI()], (o & 0xF0) !== 0x20, (o & 0xF0) === 0x90); break;
      case 0x30: { const b = this.fetch(), r = this.fetch(); if (!this.rdBit(b)) this.rel(r); break; }
      case 0x32: { const h = this.pop(), l = this.pop(); this.pc = (h << 8) | l; if (this.inService[1]) this.inService[1] = 0; else this.inService[0] = 0; this.noIntNext = true; break; }
      case 0x33: { const a = this.sfr[A], c = this.CY(); this.setCY(a >> 7); this.wr(A, ((a << 1) | c) & 0xFF); break; }
      case 0x40: { const r = this.fetch(); if (this.CY()) this.rel(r); break; }
      case 0x50: { const r = this.fetch(); if (!this.CY()) this.rel(r); break; }
      case 0x60: { const r = this.fetch(); if (!this.sfr[A]) this.rel(r); break; }
      case 0x70: { const r = this.fetch(); if (this.sfr[A]) this.rel(r); break; }
      case 0x42: case 0x52: case 0x62: { const d = this.fetch(), v = this.rd(d, true), a = this.sfr[A]; this.wr(d, o === 0x42 ? v | a : o === 0x52 ? v & a : v ^ a); break; }
      case 0x43: case 0x53: case 0x63: { const d = this.fetch(), i = this.fetch(), v = this.rd(d, true); this.wr(d, o === 0x43 ? v | i : o === 0x53 ? v & i : v ^ i); break; }
      case 0x44: case 0x54: case 0x64: { const i = this.fetch(), a = this.sfr[A]; this.wr(A, o === 0x44 ? a | i : o === 0x54 ? a & i : a ^ i); break; }
      case 0x45: case 0x55: case 0x65: { const v = this.rd(this.fetch()), a = this.sfr[A]; this.wr(A, o === 0x45 ? a | v : o === 0x55 ? a & v : a ^ v); break; }
      case 0x46: case 0x47: case 0x56: case 0x57: case 0x66: case 0x67: { const v = this.iram[RI()], a = this.sfr[A], g = o & 0xF0; this.wr(A, g === 0x40 ? a | v : g === 0x50 ? a & v : a ^ v); break; }
      case 0x72: { const b = this.fetch(); this.setCY(this.CY() | this.rdBit(b)); break; }
      case 0x82: { const b = this.fetch(); this.setCY(this.CY() & this.rdBit(b)); break; }
      case 0xA0: { const b = this.fetch(); this.setCY(this.CY() | (this.rdBit(b) ^ 1)); break; }
      case 0xB0: { const b = this.fetch(); this.setCY(this.CY() & (this.rdBit(b) ^ 1)); break; }
      case 0x73: this.pc = (this.sfr[A] + ((this.sfr[0x83] << 8) | this.sfr[0x82])) & 0xFFFF; break;
      case 0x74: this.wr(A, this.fetch()); break;
      case 0x75: { const d = this.fetch(), i = this.fetch(); this.wr(d, i); break; }
      case 0x76: case 0x77: { const r = RI(); this.iram[r] = this.fetch(); break; }
      case 0x80: this.rel(this.fetch()); break;
      case 0x83: this.wr(A, this.code[(this.sfr[A] + this.pc) & 0xFFFF]); break;
      case 0x84: { const a = this.sfr[A], b = this.sfr[0xF0]; let psw = this.sfr[0xD0] & ~0x84; if (b === 0) psw |= 0x04; else { this.wr(A, Math.floor(a / b)); this.sfr[0xF0] = a % b; } this.sfr[0xD0] = psw; this.parity(); break; }
      case 0x85: { const s = this.fetch(), d = this.fetch(); this.wr(d, this.rd(s)); break; }
      case 0x86: case 0x87: { const d = this.fetch(); this.wr(d, this.iram[RI()]); break; }
      case 0x90: { const h = this.fetch(), l = this.fetch(); this.sfr[0x83] = h; this.sfr[0x82] = l; break; }
      case 0x92: { const b = this.fetch(); this.wrBit(b, this.CY()); break; }
      case 0x93: this.wr(A, this.code[(this.sfr[A] + ((this.sfr[0x83] << 8) | this.sfr[0x82])) & 0xFFFF]); break;
      case 0xA2: { const b = this.fetch(); this.setCY(this.rdBit(b)); break; }
      case 0xA3: { const v = (((this.sfr[0x83] << 8) | this.sfr[0x82]) + 1) & 0xFFFF; this.sfr[0x83] = v >> 8; this.sfr[0x82] = v & 0xFF; break; }
      case 0xA4: { const r = this.sfr[A] * this.sfr[0xF0]; let psw = this.sfr[0xD0] & ~0x84; if (r > 0xFF) psw |= 0x04; this.sfr[0xD0] = psw; this.sfr[0xF0] = r >> 8; this.wr(A, r & 0xFF); break; }
      case 0xA5: break;   // código reservado
      case 0xA6: case 0xA7: { const d = this.fetch(); this.iram[RI()] = this.rd(d); break; }
      case 0xB2: { const b = this.fetch(); this.wrBit(b, this.rdBit(b, true) ^ 1); break; }
      case 0xB3: this.setCY(this.CY() ^ 1); break;
      case 0xB4: case 0xB5: { const v = o === 0xB4 ? this.fetch() : this.rd(this.fetch()), r = this.fetch(), a = this.sfr[A]; this.setCY(a < v); if (a !== v) this.rel(r); break; }
      case 0xB6: case 0xB7: { const i = this.fetch(), r = this.fetch(), v = this.iram[RI()]; this.setCY(v < i); if (v !== i) this.rel(r); break; }
      case 0xC0: { const d = this.fetch(); this.push(this.rd(d, true)); break; }
      case 0xD0: { const d = this.fetch(); this.wr(d, this.pop()); break; }
      case 0xC2: { const b = this.fetch(); this.wrBit(b, 0); break; }
      case 0xC3: this.setCY(0); break;
      case 0xD2: { const b = this.fetch(); this.wrBit(b, 1); break; }
      case 0xD3: this.setCY(1); break;
      case 0xC4: { const a = this.sfr[A]; this.wr(A, ((a << 4) | (a >> 4)) & 0xFF); break; }
      case 0xC5: { const d = this.fetch(), v = this.rd(d, true), a = this.sfr[A]; this.wr(d, a); this.wr(A, v); break; }
      case 0xC6: case 0xC7: { const r = RI(), v = this.iram[r]; this.iram[r] = this.sfr[A]; this.wr(A, v); break; }
      case 0xD4: { let a = this.sfr[A], c = this.CY(); const ac = (this.sfr[0xD0] >> 6) & 1; if ((a & 0xF) > 9 || ac) { a += 6; if (a > 0xFF) c = 1; } if (((a >> 4) & 0x1F) > 9 || c) { a += 0x60; if (a > 0xFF) c = 1; } this.setCY(c); this.wr(A, a & 0xFF); break; }
      case 0xD5: { const d = this.fetch(), r = this.fetch(), v = (this.rd(d, true) - 1) & 0xFF; this.wr(d, v); if (v) this.rel(r); break; }
      case 0xD6: case 0xD7: { const ri = RI(), v = this.iram[ri], a = this.sfr[A]; this.iram[ri] = (v & 0xF0) | (a & 0x0F); this.wr(A, (a & 0xF0) | (v & 0x0F)); break; }
      case 0xE0: this.wr(A, this.xram[(this.sfr[0x83] << 8) | this.sfr[0x82]]); break;
      case 0xE2: case 0xE3: this.wr(A, this.xram[(this.sfr[0xA0] << 8) | RI()]); break;
      case 0xF0: this.xram[(this.sfr[0x83] << 8) | this.sfr[0x82]] = this.sfr[A]; break;
      case 0xF2: case 0xF3: this.xram[(this.sfr[0xA0] << 8) | RI()] = this.sfr[A]; break;
      case 0xE4: this.wr(A, 0); break;
      case 0xE5: this.wr(A, this.rd(this.fetch())); break;
      case 0xE6: case 0xE7: this.wr(A, this.iram[RI()]); break;
      case 0xF4: this.wr(A, ~this.sfr[A]); break;
      case 0xF5: { const d = this.fetch(); this.wr(d, this.sfr[A]); break; }
      case 0xF6: case 0xF7: this.iram[RI()] = this.sfr[A]; break;
      default: {
        const hi = o & 0xF8, lo = o & 0x1F;
        if (lo === 0x01) { const l = this.fetch(); this.pc = (this.pc & 0xF800) | ((o >> 5) << 8) | l; break; }               // AJMP
        if (lo === 0x11) { const l = this.fetch(); this.push(this.pc & 0xFF); this.push(this.pc >> 8); this.pc = (this.pc & 0xF800) | ((o >> 5) << 8) | l; break; }   // ACALL
        switch (hi) {
          case 0x08: this.setR(RN(), this.R(RN()) + 1); break;
          case 0x18: this.setR(RN(), this.R(RN()) - 1); break;
          case 0x28: case 0x38: case 0x98: this.addOp(this.R(RN()), hi !== 0x28, hi === 0x98); break;
          case 0x48: case 0x58: case 0x68: { const v = this.R(RN()), a = this.sfr[A]; this.wr(A, hi === 0x48 ? a | v : hi === 0x58 ? a & v : a ^ v); break; }
          case 0x78: this.setR(RN(), this.fetch()); break;
          case 0x88: { const d = this.fetch(); this.wr(d, this.R(RN())); break; }
          case 0xA8: { const d = this.fetch(); this.setR(RN(), this.rd(d)); break; }
          case 0xB8: { const i = this.fetch(), r = this.fetch(), v = this.R(RN()); this.setCY(v < i); if (v !== i) this.rel(r); break; }
          case 0xC8: { const v = this.R(RN()); this.setR(RN(), this.sfr[A]); this.wr(A, v); break; }
          case 0xD8: { const r = this.fetch(), v = (this.R(RN()) - 1) & 0xFF; this.setR(RN(), v); if (v) this.rel(r); break; }
          case 0xE8: this.wr(A, this.R(RN())); break;
          case 0xF8: this.setR(RN(), this.sfr[A]); break;
          default: break;
        }
      }
    }
    this.parity();
    this.cycles += cyc;
    this.tickPeripherals(cyc);
    this.checkInterrupts();
    this.lastPC = pc0;
    return cyc;
  };
  CPU.prototype.back = function () { const s = this.history.pop(); if (s) { this.restore(s); return true; } return false; };

  // Desensamblador de una instrucción (para listados y la vista de memoria de código)
  const BYINFO = {};
  T.forEach(function (e) {
    const pats = e.pat ? e.pat.split(",") : [];
    const nreg = pats.indexOf("Rn") >= 0 ? 8 : pats.indexOf("@Ri") >= 0 ? 2 : 1;
    for (let r = 0; r < nreg; r++) BYINFO[e.code + r] = { e: e, r: r };
  });
  for (let o = 0x01; o < 0x100; o += 0x20) BYINFO[o] = { e: { m: "AJMP", pat: "a11" }, r: 0 };
  for (let o = 0x11; o < 0x100; o += 0x20) BYINFO[o] = { e: { m: "ACALL", pat: "a11" }, r: 0 };
  function bitName(b) {
    for (const k in BITS) if (BITS[k] === b) return k;
    if (b < 0x80) return hex2(0x20 + (b >> 3)) + "h." + (b & 7);
    for (const k in SFR) if (SFR[k] === (b & 0xF8)) return k + "." + (b & 7);
    return hex2(b) + "h";
  }
  function dirName(d) { if (d >= 0x80) for (const k in SFR) if (SFR[k] === d) return k; return hex2(d) + "h"; }
  function disasm(code, pc) {
    const o = code[pc], info = BYINFO[o];
    if (!info) return { text: "db " + hex2(o) + "h", len: 1 };
    const e = info.e, pats = e.pat ? e.pat.split(",") : [];
    let p = pc + 1; const parts = []; const raw = [];
    const sz = (function () { let n = 1; pats.forEach(function (q) { if (["dir", "#d", "bit", "/bit", "rel", "a11"].indexOf(q) >= 0) n++; else if (q === "#d16" || q === "a16") n += 2; }); return n; })();
    for (let i = 1; i < sz; i++) raw.push(code[(pc + i) & 0xFFFF]);
    let ri = 0;
    const getb = function () { return raw[ri++]; };
    const ordered = o === 0x85 ? (function () { const s = getb(), d = getb(); return [d, s]; })() : null;
    pats.forEach(function (q, i) {
      if (q === "Rn") parts.push("R" + info.r);
      else if (q === "@Ri") parts.push("@R" + info.r);
      else if (q === "dir") parts.push(dirName(ordered ? ordered[i] : getb()));
      else if (q === "#d") parts.push("#" + hex2(getb()) + "h");
      else if (q === "#d16") { const h = getb(), l = getb(); parts.push("#" + hex4((h << 8) | l) + "h"); }
      else if (q === "bit") parts.push(bitName(getb()));
      else if (q === "/bit") parts.push("/" + bitName(getb()));
      else if (q === "rel") { const r = getb(); parts.push(hex4(pc + sz + ((r << 24) >> 24)) + "h"); }
      else if (q === "a16") { const h = getb(), l = getb(); parts.push(hex4((h << 8) | l) + "h"); }
      else if (q === "a11") { const l = getb(); parts.push(hex4(((pc + 2) & 0xF800) | ((o >> 5) << 8) | l) + "h"); }
      else parts.push(q);
    });
    return { text: e.m.toLowerCase() + (parts.length ? " " + parts.join(", ") : ""), len: sz };
  }

  window.Sim8051 = { assemble: assemble, CPU: CPU, toHex: toHex, disasm: disasm, SFR: SFR, BITS: BITS, hex2: hex2, hex4: hex4, CYC: CYC };
})();
