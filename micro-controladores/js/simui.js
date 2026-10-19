// Interfaz del simulador 8051 (simulador.html)
(function () {
  "use strict";
  const S = window.Sim8051, $ = function (id) { return document.getElementById(id); };
  const h2 = S.hex2, h4 = S.hex4;

  // ---------------------------------------------------------------- Ejemplos
  const EX = [
    { name: "C4a · Interruptores con prioridad y display (P1 → LEDs P3, 7 seg P2)", seg: "2", src:
`; Programa lab1.asm (Conferencia C4a, MCU 8051 IDE)
; Conexiones:
; P2.0 - P2.6: Lampara de 7 segmentos (a, b,...g), anodo comun
; P1.3 - P1.0: Interruptores (+ .. -), cerrado = "0"
; P3.7 - P3.4: LEDs (+ .. -), activos en "0"
        ORG 0
        mov DPTR,#Tabla7seg   ; puntero a la tabla con codigos 7 seg
repite:
        call Demora           ; demora de un segundo
        mov A,P1              ; leer interruptores
        anl A,#0Fh            ; en A el hexad. del estado de los interr.
        movc A,@A+DPTR        ; obtener codigo 7 segmentos
        mov P2,A              ; mostrar en el display
; Encuestar el estado de los interruptores en orden de prioridad
        jnb P1.3,LED3         ; si SW3 activo, activar LED3
        jnb P1.2,LED2         ; ...si no, si SW2 activo, activar LED2
        jnb P1.1,LED1
        jnb P1.0,LED0
        orl P3,#0FFh          ; ...si ningun switch activo, apagar LEDs
        jmp repite
LED3:   mov P3,#7Fh           ; activar LED3 y apagar los restantes
        jmp repite
LED2:   mov P3,#0BFh
        jmp repite
LED1:   mov P3,#0DFh
        jmp repite
LED0:   mov P3,#0EFh
        jmp repite
; Demora de 1 segundo aproximadamente con ciclo de maquina de 1 us
Demora: mov R7,#10
d2:     mov R6,#200
d1:     mov R5,#250
        djnz R5,$             ; 250 x 2 us = 500 us
        djnz R6,d1            ; 500 us x 200 = 100 ms
        djnz R7,d2            ; 100 ms x 10 = 1 s
        ret
; Codigos 7 seg (anodo comun): segmento a -> bit 0 ... g -> bit 6
Tabla7Seg:
        db 40h,79h,24h,30h,19h,12h,02h,78h
        db 00h,18h,08h,03h,46h,21h,06h,0Eh
        END` },
    { name: "CP2 Ej. 1 · Subrutina Limpia_RAM (40h–7Fh) en 300h", seg: "-1", src:
`; Clase Practica 2, ejercicio 1: poner a 0 la RAM interna 40h..7Fh
; sin alterar los registros que usa el programa principal (A, PSW, R0...)
        ORG 0
        mov A,#5Ah            ; valores "del programa principal"
        mov R0,#11h
        call Limpia_RAM       ; observe el stack: se guarda la dir. de retorno
        sjmp $
        ORG 300h
Limpia_RAM:
        push ACC              ; salvar el contexto que se va a modificar
        push PSW
        push 00h              ; R0 del banco 0 (direccion 00h)
        mov R0,#40h           ; puntero al inicio de la zona
        clr A
lazo:   mov @R0,A             ; direccionado indirecto
        inc R0
        cjne R0,#80h,lazo     ; hasta 7Fh inclusive
        pop 00h               ; restaurar en orden inverso (LIFO)
        pop PSW
        pop ACC
        ret
        END` },
    { name: "C11 · Timer 0 modo 1: base de 50 ms × 20 = 1 s (parpadeo de P1.0)", seg: "-1", src:
`; Conferencia C11: dar una accion cada 1 segundo con ciclo de maquina de 1 us
; Base de tiempo de 50 000 ciclos: 65536 - 50000 = 15536 = 3CB0h
; Postescalador por software: Cont_1s = 20
Cont_1s EQU R5
LED     EQU P1.0
        ORG 0
        jmp Inicio
        ORG 0Bh
        jmp IT_T0
Inicio: mov TH0,#High(65536-50000)   ; tau para 50 ms
        mov TL0,#Low(65536-50000)
        mov Cont_1s,#20       ; multiplicador de 1 segundo
        mov TMOD,#00000001b   ; T0 modo 1 (16 bit), temporizador, disparo SW
        setb TR0              ; disparar Timer0
        mov IE,#10000010b     ; habilitar IT de Timer0
        sjmp $                ; el resto lo hace la interrupcion
IT_T0:  clr TR0               ; detencion temporal
        mov TH0,#3Ch          ; recargar Timer0 (modo 1 no tiene autorecarga)
        mov TL0,#0B0h
        setb TR0              ; redisparo
        djnz Cont_1s,aun      ; 1 segundo? no, retornar
        mov Cont_1s,#20
        cpl LED               ; accion a ejecutar cada 1 s
aun:    reti
        END` },
    { name: "C12 · Bocina a 2 kHz con Timer 1 modo 2 (P3.1)", seg: "-1", fpin: "25", src:
`; Conferencia C12: complementar la bocina cada 250 us -> 2 kHz
; Timer 1 en modo 2 (8 bit con recarga automatica): TH1 = 256 - 250 = 6
Bocina  EQU P3.1
        ORG 0
        sjmp Inicio
        ORG 1Bh
        cpl Bocina            ; ISR del Timer1: cabe en el propio vector
        reti
Inicio: mov TH1,#6
        mov TL1,#6
        mov TMOD,#00100000b   ; T1 modo 2, temporizador, disparo SW
        setb TR1
        mov IE,#10001000b     ; EA = 1, ET1 = 1
        sjmp $                ; mida la frecuencia de P3.1 en el frecuencimetro
        END` },
    { name: "C10 · IT externa 0 por flanco: contador BCD en display (P1 y P2)", seg: "12", src:
`; Basado en la Conferencia C10: cada flanco de caida en INT0/ (P3.2)
; incrementa un contador BCD que se muestra en dos lamparas (P1 decenas, P2 unidades).
; Pruebe: cierre y abra el interruptor P3.2 del panel de puertos.
Cont_BCD EQU R6
        ORG 0
        sjmp Inicio
        ORG 3
        sjmp IT_Ext0
Inicio: mov DPTR,#Tabla7Seg
        mov Cont_BCD,#0
        mov P1,#40h
        mov P2,#40h           ; display en 00
        setb IT0              ; INT0 activa por flanco de caida
        mov IE,#10000001b     ; EA = 1, EX0 = 1
        sjmp $
IT_Ext0: mov A,Cont_BCD
        add A,#1              ; (inc A no afecta AC: DA necesita ADD)
        da A                  ; ajuste decimal
        mov Cont_BCD,A
        anl A,#0Fh            ; aislar las unidades
        movc A,@A+DPTR
        mov P2,A
        mov A,Cont_BCD
        swap A                ; decenas al nibble bajo
        anl A,#0Fh
        movc A,@A+DPTR
        mov P1,A
        reti
Tabla7Seg: db 40h,79h,24h,30h,19h,12h,02h,78h,00h,18h
        END` },
    { name: "C13 · Transmitir una cadena ASCIIZ por la UART (1200 baudios)", seg: "-1", src:
`; Conferencia C13: transmision de una cadena por interrupcion del puerto serie
; Timer1 modo 2: TH1 = 256 - (fosc / (32 x 12 x BR)) = 229,96 -> 230 (1201,9 bps)
IndiceTx EQU R7
        ORG 0
        sjmp Inicio
        ORG 23h
        jnb RI,Tx             ; la Rx tiene mas prioridad
Rx:     clr RI
        reti
Tx:     mov A,IndiceTx
        movc A,@A+DPTR        ; leer caracter
        jz salir              ; el 0 NO se transmite
        mov SBUF,A            ; comenzar Tx
        inc IndiceTx
salir:  clr TI                ; limpiar solicitud de IT por Tx
        reti
Inicio: mov TMOD,#00100000b
        mov TH1,#230
        mov TL1,#230
        setb TR1
        mov SCON,#01010000b   ; modo 1, Rx habilitada
        mov DPTR,#Msg1
        mov IndiceTx,#0
        mov IE,#10010000b     ; EA = 1, ES = 1
        setb TI               ; solicitar IT por SW para Tx el 1er caracter
        sjmp $
Msg1:   db 'Bienvenidos al puerto serie.',0
        END` },
    { name: "C14 · Recibir el comando AAh y transmitir las muestras", seg: "-1", src:
`; Basado en la Conferencia C14. Escriba AAh en "Enviar al 8051".
        ORG 0
        sjmp Inicio
        ORG 23h
        sjmp IT_Serie
Inicio: mov R0,#30h           ; 5 "muestras" de ejemplo: '0'..'4'
        mov A,#'0'
llena:  mov @R0,A
        inc A
        inc R0
        cjne R0,#35h,llena
        mov TMOD,#20h         ; T1 modo 2 para el baud rate
        mov TH1,#230
        mov TL1,#230
        setb TR1
        mov SCON,#01010000b
        mov IE,#10010000b
        sjmp $
IT_Serie: jnb RI,Tx           ; si no es IT por Rx, atender la de Tx
        clr RI
        mov A,SBUF
        cjne A,#0AAh,fuera    ; comando de Tx? no, retornar
        mov R0,#30h
        setb TI               ; si, solicitar IT para Tx la primera muestra
fuera:  reti
Tx:     clr TI
        cjne R0,#35h,sigue    ; quedan muestras?
        reti
sigue:  mov A,@R0
        mov SBUF,A
        inc R0
        reti
        END` },
    { name: "C8 · Motor de paso: una vuelta en full step (P1.0–P1.3)", seg: "-1", src:
`; Conferencia C8: motor unipolar de 3,6 grados/paso, secuencia full step,
; 10 ms por paso -> 100 pasos = 1 revolucion por segundo.
        ORG 0
        mov DPTR,#FullStep
        mov R7,#100           ; 100 pasos x 3,6 = 360 grados
        mov R2,#0             ; indice en la tabla (0..3)
paso:   mov A,R2
        movc A,@A+DPTR
        mov P1,A              ; excitar las bobinas (al ULN2003)
        call Demora10ms
        inc R2
        mov A,R2
        anl A,#03h            ; indice modulo 4
        mov R2,A
        djnz R7,paso
        sjmp $
Demora10ms: mov R6,#20        ; 20 x 499 us = 9,98 ms (+ call/ret)
d1:     mov R5,#248
        djnz R5,$
        djnz R6,d1
        ret
FullStep: db 03h,06h,0Ch,09h  ; dos fases excitadas a la vez
        END` },
    { name: "Programa vacío", seg: "-1", src: "        ORG 0\n\n        sjmp $\n        END\n" }
  ];

  // ------------------------------------------------------------------ Estado
  const cpu = new S.CPU();
  let res = null, running = false, bps = new Set(), lineDivs = {}, prevI = cpu.iram.slice(), prevS = cpu.sfr.slice(), lastErrLines = new Set();
  let swBits = [0xFF, 0xFF, 0xFF, 0xFF]; // interruptores abiertos = 1
  let fm = { k: 25, cyc: 0, tog: 0, f: null };
  cpu.onTx = function (b) { const t = $("term"); t.textContent += (b >= 32 && b < 127) || b === 10 ? String.fromCharCode(b) : b === 13 ? "" : "[" + h2(b) + "]"; t.scrollTop = t.scrollHeight; };

  function setStatus(msg, cls) { const s = $("status"); s.textContent = msg; s.className = "status " + (cls || ""); }
  function applyExt() { const p0 = parseInt($("p0in").value, 16); cpu.ext[0] = (isNaN(p0) ? 0xFF : p0) & swBits[0]; for (let n = 1; n < 4; n++) cpu.ext[n] = swBits[n]; }

  function doAssemble() {
    stop();
    res = S.assemble($("src").value);
    cpu.reset(); applyExt();
    lastErrLines = new Set(res.errors.map(function (e) { return e.line; }));
    if (res.errors.length) {
      setStatus("✘ " + res.errors.length + " error(es). Línea " + res.errors[0].line + ": " + res.errors[0].msg, "err");
    } else {
      cpu.load(res);
      setStatus("✔ Ensamblado sin errores: " + res.size + " bytes de código (último byte en " + h4(Math.max(0, res.size - 1)) + "h). Recuerde: sin errores de «ortografía» no significa que el programa haga lo que usted quiere: simule.", "ok");
    }
    buildListing(); prevI = cpu.iram.slice(); prevS = cpu.sfr.slice(); fm.cyc = 0; fm.tog = 0; fm.f = null;
    render();
  }

  function buildListing() {
    const L = $("listing"); L.innerHTML = ""; lineDivs = {};
    if (!res) return;
    const errAt = {}; res.errors.forEach(function (e) { errAt[e.line] = errAt[e.line] || e.msg; });
    res.listing.forEach(function (e) {
      const d = document.createElement("div");
      const by = e.bytes.slice(0, 4).map(h2).join(" ") + (e.bytes.length > 4 ? "…" : "");
      d.innerHTML = '<span class="ad">' + (e.bytes.length ? h4(e.addr) : "    ") + "</span>  " + '<span class="by">' + by.padEnd(12) + "</span> " + esc(e.src.replace(/\t/g, "        "));
      if (errAt[e.line]) { d.classList.add("er"); d.title = errAt[e.line]; }
      if (e.bytes.length) { d.dataset.addr = e.addr; if (bps.has(e.addr)) d.classList.add("bp"); d.addEventListener("click", function () { const a = +d.dataset.addr; if (bps.has(a)) { bps.delete(a); d.classList.remove("bp"); } else { bps.add(a); d.classList.add("bp"); } }); }
      L.appendChild(d); lineDivs[e.line] = d;
    });
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  // ----------------------------------------------------------------- Render
  function render() {
    // registros
    const s = cpu.sfr, i = cpu.iram, bank = cpu.bank();
    const regs = [["A", h2(s[0xE0])], ["B", h2(s[0xF0])], ["PSW", h2(s[0xD0])], ["SP", h2(s[0x81])], ["DPTR", h2(s[0x83]) + h2(s[0x82])], ["PC", h4(cpu.pc)], ["Banco", String(bank)], ["Ciclos", String(cpu.cycles)]];
    for (let n = 0; n < 8; n++) regs.push(["R" + n, h2(i[bank * 8 + n])]);
    const chgS = function (a) { return s[a] !== prevS[a]; };
    const mapChg = { A: chgS(0xE0), B: chgS(0xF0), PSW: chgS(0xD0), SP: chgS(0x81), DPTR: chgS(0x82) || chgS(0x83) };
    for (let n = 0; n < 8; n++) mapChg["R" + n] = i[bank * 8 + n] !== prevI[bank * 8 + n];
    const mc = parseFloat($("mc").value);
    $("regs").innerHTML = regs.map(function (r) { return '<div class="' + (mapChg[r[0]] ? "chg" : "") + '"><b>' + r[0] + "</b>" + r[1] + "</div>"; }).join("") +
      '<div style="grid-column:1/-1"><b>Tiempo</b>' + fmtTime(cpu.cycles * mc * 1e-6) + "</div>";
    $("psw").innerHTML = ["CY", "AC", "F0", "RS1", "RS0", "OV", "–", "P"].map(function (n, k) { const b = (s[0xD0] >> (7 - k)) & 1; return '<span class="' + (b ? "on" : "") + '" title="PSW.' + (7 - k) + '">' + n + "</span>"; }).join("");
    // RAM
    let rh = '<div class="h"></div>';
    for (let c = 0; c < 16; c++) rh += '<div class="h">' + c.toString(16).toUpperCase() + "</div>";
    const sp = s[0x81];
    for (let r = 0; r < 16; r++) {
      rh += '<div class="h">' + h2(r * 16) + "</div>";
      for (let c = 0; c < 16; c++) {
        const a = r * 16 + c; let cls = a < 0x20 ? (Math.floor(a / 8) === bank ? "rb act" : "rb") : a < 0x30 ? "bt" : "";
        if (i[a] !== prevI[a]) cls += " chg"; if (a === sp) cls += " sp";
        rh += '<div class="' + cls + '" title="' + h2(a) + "h" + (a === sp ? " ← SP" : "") + '">' + h2(i[a]) + "</div>";
      }
    }
    $("ram").innerHTML = rh;
    // SFR
    const names = ["P0", "P1", "P2", "P3", "TCON", "TMOD", "TL0", "TH0", "TL1", "TH1", "SCON", "IE", "IP", "PCON"];
    $("sfrs").innerHTML = names.map(function (n) { const a = S.SFR[n]; return '<div class="' + (chgS(a) ? "chg" : "") + '"><b>' + n + "</b> " + h2(s[a]) + "</div>"; }).join("") +
      '<div><b>SBUF↑</b> ' + h2(cpu.sbufRx) + "</div>";
    renderPorts(); renderSegs(); renderTimers(); renderFreq();
    // línea actual
    document.querySelectorAll(".listing .cur").forEach(function (d) { d.classList.remove("cur"); });
    if (res && res.lineOfAddr[cpu.pc] && lineDivs[res.lineOfAddr[cpu.pc]]) {
      const d = lineDivs[res.lineOfAddr[cpu.pc]]; d.classList.add("cur");
      if (!running || $("speed").value !== "max") { const L = $("listing"); if (d.offsetTop < L.scrollTop || d.offsetTop > L.scrollTop + L.clientHeight - 20) L.scrollTop = d.offsetTop - 60; }
    }
  }
  function fmtTime(t) { return t < 1e-3 ? (t * 1e6).toFixed(1) + " µs" : t < 1 ? (t * 1e3).toFixed(3) + " ms" : t.toFixed(4) + " s"; }

  function renderPorts() {
    const box = $("ports");
    if (!box.firstChild) {
      for (let n = 0; n < 4; n++) {
        const row = document.createElement("div"); row.className = "port";
        row.innerHTML = '<span class="lbl">P' + n + "</span>" + [7, 6, 5, 4, 3, 2, 1, 0].map(function (b) { return '<span class="pin" id="pin' + n + b + '" title="P' + n + "." + b + '">' + b + "</span>"; }).join("");
        const sw = document.createElement("div"); sw.className = "port";
        sw.innerHTML = '<span class="lbl">sw</span>' + [7, 6, 5, 4, 3, 2, 1, 0].map(function (b) { return '<button class="sw" type="button" data-n="' + n + '" data-b="' + b + '" aria-label="Interruptor P' + n + "." + b + ' abierto" title="P' + n + "." + b + ': abierto (pulse para cerrar)">○</button>'; }).join("");
        box.appendChild(row); box.appendChild(sw);
      }
      box.querySelectorAll("button.sw").forEach(function (bt) {
        bt.addEventListener("click", function () {
          const n = +bt.dataset.n, b = +bt.dataset.b; swBits[n] ^= 1 << b; const closed = !((swBits[n] >> b) & 1);
          bt.classList.toggle("closed", closed); bt.textContent = closed ? "●" : "○"; bt.setAttribute("aria-label", "Interruptor P" + n + "." + b + (closed ? " cerrado" : " abierto")); bt.title = "P" + n + "." + b + (closed ? ": cerrado (pin a 0)" : ": abierto (pulse para cerrar)"); applyExt(); if (!running) { cpu.tickPeripherals(0); render(); }
        });
      });
    }
    for (let n = 0; n < 4; n++) { const p = cpu.pins(n); for (let b = 0; b < 8; b++) { const el = $("pin" + n + b); const hi = (p >> b) & 1; el.classList.toggle("hi", !!hi); el.textContent = hi ? "1" : "0"; } }
  }

  const SEGP = ["16,8 48,8 44,14 20,14", "50,10 56,16 54,46 48,50 46,16", "48,54 54,58 52,90 46,96 44,62", "14,94 46,94 42,100 10,100", "8,58 14,54 16,62 14,96 6,90", "10,16 16,10 18,16 16,50 10,46", "16,52 46,52 42,58 20,58"];
  function segSVG(code, pol) {
    let out = '<svg viewBox="0 0 64 104" role="img" aria-label="Lámpara de 7 segmentos">';
    for (let k = 0; k < 7; k++) { const on = ((code >> k) & 1) === pol; out += '<polygon points="' + SEGP[k] + '" class="' + (on ? "on" : "off") + '"/>'; }
    const dp = ((code >> 7) & 1) === pol; out += '<circle cx="58" cy="98" r="3.5" class="' + (dp ? "on" : "off") + '"/></svg>';
    return out;
  }
  function renderSegs() {
    const v = $("segport").value, pol = +$("segpol").value, box = $("segs");
    if (v === "-1") { box.innerHTML = '<span class="meta">sin display</span>'; return; }
    const ports = v === "12" ? [1, 2] : [+v];
    box.innerHTML = ports.map(function (n) { return '<div style="text-align:center">' + segSVG(cpu.sfr[0x80 + n * 0x10], pol) + '<div class="meta mono">P' + n + " = " + h2(cpu.sfr[0x80 + n * 0x10]) + "h</div></div>"; }).join("");
  }
  function renderTimers() {
    const s = cpu.sfr, tmod = s[0x89], tcon = s[0x88], ie = s[0xA8], ip = s[0xB8], scon = s[0x98];
    const t = function (n) { const c = (tmod >> (4 * n)) & 0xF; return "T" + n + ": modo " + (c & 3) + (c & 4 ? " contador" : " temporizador") + (c & 8 ? " GATE" : "") + "  TR" + n + "=" + ((tcon >> (4 + 2 * n)) & 1) + "  TF" + n + "=" + ((tcon >> (5 + 2 * n)) & 1) + "  TH:TL=" + h2(s[0x8C + n]) + h2(s[0x8A + n]); };
    const en = ["EX0", "ET0", "EX1", "ET1", "ES"].filter(function (_, k) { return (ie >> k) & 1; });
    $("timers").textContent = t(0) + "\n" + t(1) +
      "\nIE: EA=" + (ie >> 7) + "  habilitadas: " + (en.join(" ") || "—") + "   IP: " + (["PX0", "PT0", "PX1", "PT1", "PS"].filter(function (_, k) { return (ip >> k) & 1; }).join(" ") || "todas baja") +
      "\nSolicitudes: IE0=" + ((tcon >> 1) & 1) + " IE1=" + ((tcon >> 3) & 1) + " TF0=" + ((tcon >> 5) & 1) + " TF1=" + ((tcon >> 7) & 1) + " RI=" + (scon & 1) + " TI=" + ((scon >> 1) & 1) +
      "\nEn servicio (bits ocultos): L=" + cpu.inService[0] + " H=" + cpu.inService[1] +
      "\nUART: modo " + (scon >> 6) + "  REN=" + ((scon >> 4) & 1) + (cpu.tx ? "  transmitiendo " + h2(cpu.tx.byte) + "h" : "") + (cpu.rx ? "  recibiendo" : "") + (cpu.rxQueue.length ? "  en cola: " + cpu.rxQueue.length : "") +
      (scon >> 6 === 1 && !((tcon >> 6) & 1) && cpu.tx ? "\n¡TR1 = 0: no hay reloj de baudios, la transmisión no termina!" : "");
  }
  function renderFreq() {
    const k = fm.k, mc = parseFloat($("mc").value) * 1e-6;
    const tog = cpu.toggles[k] || 0, dc = cpu.cycles - fm.cyc;
    if (dc * mc >= 0.2) { fm.f = (tog - fm.tog) / 2 / (dc * mc); fm.cyc = cpu.cycles; fm.tog = tog; }
    $("freq").textContent = fm.f === null ? "—" : fm.f === 0 ? "0 Hz (sin cambios)" : fm.f >= 1000 ? (fm.f / 1000).toFixed(3) + " kHz" : fm.f.toFixed(2) + " Hz";
  }

  // --------------------------------------------------------------- Ejecución
  function step() {
    if (!res || res.errors.length) { doAssemble(); if (!res || res.errors.length) return; }
    prevI = cpu.iram.slice(); prevS = cpu.sfr.slice();
    cpu.step(true); render();
  }
  function back() { stop(); prevI = cpu.iram.slice(); prevS = cpu.sfr.slice(); if (!cpu.back()) setStatus("No hay más pasos para deshacer (el historial se guarda al ejecutar paso a paso).", ""); render(); }
  function run() {
    if (running) { stop(); return; }
    if (!res || res.errors.length) { doAssemble(); if (!res || res.errors.length) return; }
    running = true; $("b-run").textContent = "⏸ Pausa"; cpu.history = [];
    let first = true;
    function frame() {
      if (!running) return;
      prevI = cpu.iram.slice(); prevS = cpu.sfr.slice();
      const sp = $("speed").value, mc = parseFloat($("mc").value);
      let budgetI = sp === "rt" || sp === "max" ? Infinity : +sp;
      let budgetC = sp === "rt" ? Math.max(1, Math.round(1e6 / 60 / mc)) : sp === "max" ? 400000 : Infinity;
      let ni = 0, nc = 0;
      while (ni < budgetI && nc < budgetC) {
        if (!first && bps.has(cpu.pc)) { stop(); setStatus("■ Detenido en el punto de ruptura " + h4(cpu.pc) + "h", ""); render(); return; }
        first = false;
        nc += cpu.step(false); ni++;
      }
      render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function stop() { running = false; $("b-run").textContent = "▶▶ Ejecutar"; }

  // ----------------------------------------------------------------- Eventos
  const sel = $("ex");
  EX.forEach(function (e, k) { const o = document.createElement("option"); o.value = k; o.textContent = e.name; sel.appendChild(o); });
  const fp = $("fpin");
  for (let n = 0; n < 4; n++) for (let b = 0; b < 8; b++) { const o = document.createElement("option"); o.value = n * 8 + b; o.textContent = "P" + n + "." + b; fp.appendChild(o); }
  fp.value = "8"; fm.k = 8;
  function loadExample(k) {
    const e = EX[k]; $("src").value = e.src; $("segport").value = e.seg; if (e.fpin) { fp.value = e.fpin; fm.k = +e.fpin; }
    $("term").textContent = ""; bps.clear(); doAssemble();
  }
  sel.addEventListener("change", function () { loadExample(+sel.value); });
  $("b-asm").addEventListener("click", doAssemble);
  $("b-reset").addEventListener("click", function () { stop(); cpu.reset(); applyExt(); if (res && !res.errors.length) cpu.load(res); prevI = cpu.iram.slice(); prevS = cpu.sfr.slice(); setStatus("RESET: PC = 0000h, SP = 07h, puertos = FFh, SFR = 00h. La RAM conserva valores aleatorios.", ""); render(); });
  $("b-step").addEventListener("click", function () { stop(); step(); });
  $("b-back").addEventListener("click", back);
  $("b-run").addEventListener("click", run);
  $("segport").addEventListener("change", renderSegs); $("segpol").addEventListener("change", renderSegs);
  fp.addEventListener("change", function () { fm.k = +fp.value; fm.cyc = cpu.cycles; fm.tog = cpu.toggles[fm.k] || 0; fm.f = null; renderFreq(); });
  $("p0in").addEventListener("change", function () { applyExt(); if (!running) render(); });
  $("b-clr").addEventListener("click", function () { $("term").textContent = ""; });
  $("b-rx").addEventListener("click", function () {
    const v = $("rxin").value.trim(); if (!v) return;
    const m = /^([0-9a-f]{1,2})h$/i.exec(v) || /^0x([0-9a-f]{1,2})$/i.exec(v);
    if (m) cpu.rxQueue.push(parseInt(m[1], 16)); else for (const ch of v) cpu.rxQueue.push(ch.charCodeAt(0) & 0xFF);
    $("rxin").value = ""; if (!running) renderTimers();
  });
  $("b-hex").addEventListener("click", function () {
    if (!res || res.errors.length) { doAssemble(); if (!res || res.errors.length) return; }
    const blob = new Blob([S.toHex(res) + "\n"], { type: "text/plain" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "programa.hex"; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $("mc").addEventListener("change", function () { fm.cyc = cpu.cycles; fm.tog = cpu.toggles[fm.k] || 0; fm.f = null; render(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "F7" && ev.altKey) { ev.preventDefault(); back(); }
    else if (ev.key === "F7") { ev.preventDefault(); stop(); step(); }
    else if (ev.key === "F5") { ev.preventDefault(); run(); }
  });
  $("src").addEventListener("keydown", function (ev) { if (ev.key === "Tab") { ev.preventDefault(); const t = ev.target, a = t.selectionStart; t.value = t.value.slice(0, a) + "\t" + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = a + 1; } });

  // carga inicial (permite ?ej=N)
  const q = new URLSearchParams(location.search), k0 = Math.min(EX.length - 1, Math.max(0, parseInt(q.get("ej") || "0", 10) || 0));
  sel.value = k0; loadExample(k0);
})();
