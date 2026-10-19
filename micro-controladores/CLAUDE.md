# Microcontroladores (Microprocesadores I) — microcontrolador 8051

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- **Profesor principal:** Alejandro J. Cabrera Sarmiento (Dpto. Automática y Computación, CUJAE).
  Colectivo: Granmel Suárez Alfonso, Alejandro González Barrero, Luís A. González Parets.
- **Modalidad 2026-27:** semipresencial por **encuentros** (12 semanas, 1 encuentro de 2 h/semana).
  Semanas impares: encuentro para **orientar** contenidos y ejercicios. Semanas pares: **debate**
  de soluciones (todos son evaluados; preguntas típicas: "¿Por qué?" y "¿Qué usted cree?").
- **Evaluación:** 5 encuentros de debate + prueba parcial (ver C0 para el detalle).
- **Objetivos:** dominar la estructura interna de un µP, el procesador del 8051, sus periféricos y
  herramientas de desarrollo, y desarrollar HW+SW de aplicaciones con el 8051.
- **Enfoque de la asignatura:** razonamiento lógico, "no hay fórmulas que memorizar", desarrollo de
  habilidades. Por eso el sitio debe priorizar **simuladores interactivos** (registros, memoria,
  flags, puertos, timers, UART) y ejercicios de programación paso a paso.

## Materiales fuente (`/home/pedro/studies/Carrera/4to-1er-Semestre/Micro/`)

| Carpeta | Contenido |
|---|---|
| `00-Programa-y-Planificacion/` | `C0_Asignatura_2026-27_12 semanas x ENCUENTROS.pdf` (presentación, sistema de evaluación) |
| `01-Conferencias/` | C1 Introducción a µPs · C2 Ejecución de instrucciones · C3 Familia 8051 · C4 Instrucciones · C4a MCU8051 (IDE) · C4a MCU8051+Proteus · C5 Señales y puertos · C6 ADC + conversión a UI · C7 Teclado y display · C8 Motor de paso · C9 Interrupción · C10 Sistema con IT · C11 Temporizadores · C12 Sistema con Timers · C13 Puerto serie · C14 Sistema con puerto serie · C15 Programación en C · C16 Sistema con programación en C |
| `02-Clases-Practicas/` | CP1 … CP8 (`.docx`) |
| `03-Laboratorios/` | LAB0 Entorno ISIS-Proteus 8 · LAB1 (docx+pdf) · LAB2 · LAB3 · LAB4 · LAB5 TIMER · LAB6 |
| `05-Bibliografia/` | Ver tabla de bibliografía abajo |
| `06-Software/` | MCU-8051 IDE 1.4.7 (setup .exe/.rar) · SDCC 3.2.0a (setup + página web guardada) |
| `07-Videos/` | Grabaciones C0–C16 + simulaciones C10a (IT externas), C12a (Timers), C14a (UART), C16a (C). **Falta el vídeo de C8 (Motor de paso).** |

## Temario a cubrir (verificar contra C0 y las conferencias)

1. Microprocesador (µP) y sistema con µP — C1
2. Ejecución de instrucciones (ciclo de búsqueda/ejecución, buses) — C2
3. Microcontrolador. Familia 8051. Organización de la memoria — C3
4. Repertorio de instrucciones y modos de direccionamiento — C4; herramientas MCU-8051 IDE y Proteus — C4a
5. Puertos de E/S. Señales del 8051 — C5
6. Aplicaciones: ADC y conversión a unidades de ingeniería — C6; teclado y display — C7; motor de paso — C8
7. Interrupciones (8051) — C9; sistema con interrupciones — C10
8. Temporizadores/contadores (8051) — C11; sistema con timers — C12
9. Puerto serie UART (8051) — C13; sistema con puerto serie — C14
10. Programación en C de µC (SDCC) — C15; sistema con programación en C — C16

Relacionar cada tema con su CP y LAB (leer los .docx para establecer el mapeo exacto).

## Bibliografía disponible (`05-Bibliografia/`)

- MacKenzie, *The 8051 Microcontroller* (inglés) y *Microcontrolador 8051*, 4ª ed. (2007, español).
- Mazidi, Mazidi & McKinlay, *The 8051 Microcontroller and Embedded Systems Using Assembly and C*.
- Intel, *MCS-51 Microcontroller Family User's Manual*.
- *Set de Instrucciones MCS-51* (referencia rápida).
- González Vázquez, *Introducción a los microcontroladores 8051 y 8052*.
- Ibrahim, *Microcontroller Projects in C for the 8051* (2000).
- *The Final Word on the 8051*.
- SDCC Compiler User Guide v3.2.1.
- Kernighan & Ritchie, *El lenguaje de programación C (ANSI C)*.
- R. Boys, *What is the 8051 doing in the year 2008*.

Citar siempre capítulo + epígrafe + páginas verificadas con `pdftotext`.

## Prerrequisitos a repasar (recuadros "Antes de empezar")

- Sistemas de numeración (binario, hexadecimal, BCD), complemento a 2, aritmética binaria.
- Lógica combinacional y secuencial: flip-flops, registros, contadores, multiplexores, memorias,
  buses tri-estado → `cursos/06-ElecD/`.
- Transistor como interruptor, drivers, pull-up, niveles TTL/CMOS → `cursos/05-ElecA/`.
- Ley de Ohm, divisores, RC (antirrebote, reset) → `cursos/07-Circuito/`.
- Lógica de programación y C básico.

## Ideas de interactivos / software

- Simulador web del 8051 (registros, PSW, RAM interna, SFR) que ejecute paso a paso fragmentos de ASM.
- Visualizador del mapa de memoria (RAM interna, bancos, área bit-direccionable, SFR, externa).
- Calculadora de recarga de timers (modo 1/2) y de baud rate (SMOD, TH1) para un cristal dado.
- Simulador de teclado matricial + display 7 segmentos multiplexado; motor de paso (secuencias).
- Software (Python/Go/Rust): ensamblador/desensamblador didáctico, calculadora de timers/UART por CLI.
- Guía de instalación de MCU-8051 IDE, SDCC y Proteus (Windows y Linux/Wine).

## Estructura del sitio

| Archivo | Contenido |
|---|---|
| `index.html` | portada: temas, plan por encuentros, mapa C/CP/LAB, evaluación, uso de IA (C0), bibliografía, software (MCU 8051 IDE, SDCC, Proteus, mcs51calc), prerrequisitos, FAQ |
| `simulador.html` + `js/sim8051.js` + `js/simui.js` + `css/sim.css` | **simulador 8051**: ensamblador (ORG/EQU/DB/DW/END, HIGH/LOW, $, alias EQU de registros y bits; JMP/CALL → LJMP/LCALL), CPU completa (255 códigos, ciclos reales), timers 0/1 (modos 0–3), IT con 2 niveles y bits L/H, UART (temporización con TH1/SMOD), puertos latch AND externo, paso atrás, breakpoints, 7 seg, frecuencímetro, terminal, .hex. 9 ejemplos del curso (`?ej=N`). |
| `temas/t1…t8-*.html` + `js/micro.js` + `css/micro.css` | 8 temas con 15 widgets (fetch-execute, bits/bancos, codificador, demoras, LED, UC→UI, 7 seg, teclado, motor de paso, IE/IP/TMOD/SCON, prioridades, timers, baudios, trama UART) |
| `software/mcs51calc/` | CLI Python (timer, baud, demora, seg7, ui, led) + pruebas |

Pruebas del núcleo: en el scratchpad se ensamblaron los programas del curso y se compararon códigos
con el .lst de C4; se verificaron demoras (1 006 035 ciclos), Timer0 1 s, UART 1200 bps, INT0 por
flanco y las soluciones de la CP2.

## Bibliografía verificada (página impresa → PDF)

MacKenzie es 4ª ed. 2007: **+15** constante · Intel MCS-51 User's Manual: cap. 2 «2-n» = PDF 30+n,
cap. 3 «3-n» = PDF 108+n · SDCC 3.2.1: +1 · el PDF «Mazidi» son **diapositivas** de C.-P. Young
(NCKU) basadas en el libro (sin paginación del libro).

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | CP/LAB | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| 1 µP y ejecución | ✅ | ✅ | ✅ | ✅ | ✅ CP1 | ✅ | ✅ | ✅ |
| 2 Familia 8051 / memoria | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 Instrucciones + herramientas | ✅ | ✅ | ✅ | ✅ | ✅ CP2, LAB0–1 | ✅ | ✅ | ✅ |
| 4 Puertos, ADC, display, teclado, motor | ✅ | ✅ | ✅ | 🟡 | ✅ CP3–4, LAB2–3 | ✅ | ✅ | ✅ |
| 5 Interrupciones | ✅ | ✅ | ✅ | 🟡 | ✅ CP5, LAB4 | ✅ | ✅ | ✅ |
| 6 Temporizadores | ✅ | ✅ | ✅ | 🟡 | ✅ CP6, LAB5 | ✅ | ✅ | ✅ |
| 7 UART | ✅ | ✅ | ✅ | 🟡 | ✅ CP7, LAB6 | ✅ | ✅ | ✅ |
| 8 C con SDCC | ✅ | ⬜ | ✅ | 🟡 | ✅ CP8 | ✅ | ✅ | ✅ |
| Portada / software / simulador | ✅ | ✅ | | | | | | |

## Pendientes y dudas

- Las CP/LAB tienen figuras (hardware, teclados, tablas) solo en imagen: las guías describen la
  solución sin reproducir esas figuras; programas completos de CP3–CP8 aún no escritos (solo guías).
- Las Tabla7Seg de C10 y C16 (44h, 60h, 31h) no corresponden a la conexión a→bit0; se señaló en T4/T5/T8.
- C11: `mov IE,#1001000b` (7 bits) es una errata; se señaló.
- El simulador no implementa Timer 2 ni memoria externa con temporización; JMP/CALL siempre largos.
- Vídeos de clases (07-Videos) no revisados.

## Bitácora

- **2026-10-19** — Sitio construido: portada, simulador 8051 web, 8 temas (C1–C16, CP1–CP8, LAB0–LAB6),
  `software/mcs51calc`, fichas de repaso de electrónica digital y analógica.

- **2026-10-18** — Reorganización de materiales: `Conferencias pdf`→`01-Conferencias`, `CP`→`02-Clases-Practicas`,
  `Laboratorios`→`03-Laboratorios`, `Bibliografia`→`05-Bibliografia`, `MCU-8051_IDE`→`06-Software`,
  `Videos_de_clases`→`07-Videos`; C0 a `00-Programa-y-Planificacion`. Eliminado `sdccman.pdf` (duplicado exacto
  de `SDCC Compiler User Guide_v3.2.1.pdf`). Antiguo repo `microcontrolpage` respaldado en `.git-backups/`.
  Aún no hay contenido web.
