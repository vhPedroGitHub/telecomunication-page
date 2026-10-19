# Líneas de Transmisión y Antenas

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- Disciplina **Comunicaciones Inalámbricas** (junto a Teoría del Campo EM, Radiopropagación y
  Sistemas de Radiocomunicaciones). Curso 2026-27, formato por **encuentros**, CUJAE.
- Idea rectora del profesor: *"De nada vale tener una antena con excelentes características si no
  existe un buen acoplamiento de impedancias con bajas pérdidas entre el transmisor/receptor y la antena."*
- Dos partes: **(1) Líneas de transmisión** (alimentadores: bifilar, coaxial, guías de onda, líneas
  planares —microcinta, coplanar—, balun y acopladores) y **(2) Antenas**.
- El programa pide explícitamente **desarrollar software libre de baja complejidad** para cálculos
  (guías de onda, microcinta, acopladores) → encaja con la sección de software (Python/Go/Rust + Octave).

## Materiales fuente (`/home/pedro/studies/Carrera/4to-1er-Semestre/Lineas de Transmision y Antena/`)

| Carpeta | Contenido |
|---|---|
| `01-Conferencias/` | 00-Generalidades (programa y objetivos por tema) · 01-Introducción Moodle · 02-Conf Problema Teórico Fundamental 2026-27 · 03-Carta de Smith 2026 · 03-Resumen de C. Smith · 04-Resumen C1 LTx · `CLASE GUIAS de ONDAS.pdf` · `G DE O.pdf` (guías de onda) |
| `01-Conferencias/Encuentro-2-Adaptacion-de-Impedancias/` | 2A Stub simple (pdf+pptx) · 2B Stub doble y Balun (pdf) · `Stub doble 2024 y Balun.ppt` · 2C Chebyshev y Exponencial |
| `04-Evaluaciones-y-Tareas/` | 1ra Evaluación · Introducción al formato de la Tarea · Tarea sobre Guías de Ondas · "Equipo 2 tarea una estudiante" (ejemplo de tarea entregada) |
| `05-Bibliografia/` | Pozar *Microwave Engineering* 4ª ed. (2012) · Balanis *Antenna Theory* 4ª ed. (2016) · Sófocles *Ondas electromagnéticas y antenas* · Wadell *Transmission Line Design Handbook* · Gupta *Microstrip Lines and Slotlines* 2ª ed. (1996) · Simons *Coplanar Waveguide Circuits, Components, and Systems* · Franco di Paulo *Líneas de transmisión planares* |
| `06-Software/` | PCAAD 5 (`.rar`, análisis de antenas) |
| `08-Complementarios/` | Carta de Smith para imprimir · Introducción a los metamateriales (.doc) · `Octave-Learning/` (manuales y tutoriales de GNU Octave) |

## Temario (de `00-Generalidades.pdf`)

**Parte 1 — Líneas de transmisión**
- **Tema I. Teoría general de las LTx:** expresiones de E y H, tipos de onda (TEM/TE/TM),
  distribución transversal y longitudinal del campo, parámetros (γ, Z₀), distribución de V e I
  según régimen, ROE y pérdidas de retorno, carta de Smith.
- **Tema II. Guías de ondas y líneas planares:** modos en guías rectangulares y circulares,
  selección de guías comerciales por ancho de banda, medición de λ, Z_L y ROE con detectores;
  **líneas planares**: campo, permitividad efectiva, Z₀, diseño por ecuaciones estáticas y
  dinámicas, análisis y síntesis, microcinta ancha/estrecha, influencia del grosor y εr, coplanar.
- **Tema III. Acoplamiento de impedancias:** stub simple y doble, transformador λ/4,
  transformador exponencial, Chebyshev, balun (simetrizadores). Ventajas/desventajas y simulación.

**Parte 2 — Antenas:** aún sin materiales en la carpeta. Cuando lleguen, ampliar temario
(usar Balanis como referencia principal y PCAAD como software).

## Prerrequisitos a repasar

- Fasores, números complejos, funciones hiperbólicas → `cursos/02-Matemática/`.
- Ecuaciones de Maxwell, ondas planas, vector de Poynting, condiciones de frontera, efecto
  pelicular → `cursos/10-TC/Electrodinamica/` y `cursos/10-TC/Radio_Propagacion/`.
- Circuitos en régimen sinusoidal, impedancia, potencia, máxima transferencia → `cursos/07-Circuito/`.
- Decibelios (dB, dBm), logaritmos.

## Estructura del sitio (2026-10-19)

| Archivo | Contenido |
|---|---|
| `index.html` | portada: temas, Parte 2 (sin materiales), plan, evaluación, tarea final, profesor, bibliografía, software (web, `ltx`, Octave, PCAAD), prerrequisitos, FAQ |
| `temas/t1-teoria-general.html` | C1 completa + TI 1–6 + 1.ª Evaluación (circuito interactivo) |
| `temas/t1b-carta-smith.html` | C2: bilineal, lectura, problemas 1–5, TI 2 |
| `temas/t2-guias-de-onda.html` | clase GO + 1.ª Tarea resuelta (P1–P3), WR, atenuación |
| `temas/t2b-lineas-planares.html` | microcinta (Pozar 3.8, Di Paolo cap. 2) y CPW (Simons 2.2.3) — sin conferencia aún |
| `temas/t3-acoplamiento.html` | 2A, 2B, 2C y balun |
| `js/lta.js`, `css/lta.css` | 17 widgets (ver ids en el código); clase `Smith` para cartas en canvas |
| `software/ltx/` | paquete Python + CLI (`carga`, `rlgc`, `cuarto`, `stub`, `doble`, `cheb`, `binomial`, `guia`, `circular`, `micro`, `cpw`) + 5 pruebas |

Verificado en Chromium (sin errores JS/KaTeX, 390 px sin desborde, widgets con valores del curso).
Ojo: `<`/`>` dentro de fórmulas deben escribirse `\lt`/`\gt` (si no, el HTML se rompe).

**Bibliografía verificada:** Pozar 4.ª ed. 2012 = impresa **+20** (2.1 p.48, 2.3 p.56, 2.4 Smith 63–72,
2.5 λ/4 72–76, 2.7 78–85, 3.1 p.96, 3.3 rect. 110–121, 3.4 circ. 121–130, 3.5 coax 130, 3.8 microcinta
147–153, 3.10 p.154, 5.1 p.229, 5.2 stub 234–241, 5.3 doble 241–246, 5.4 λ/4 246–250, 5.5 p.250,
5.6 binomial 252–256, 5.7 Chebyshev 256–261, 5.8 tapered 261–266, ap. F p.719 (latón 2,564·10⁷),
ap. G p.719 (teflón 2,08/0,0004), ap. I guías WR p.720, balun p.594). Orfanidis rev. 1-ago-2016 =
impresa **+37** (cap. 9 guías desde p.363, 9.4 p.374, 9.9 p.384; 11.1 p.535, 11.3 p.542, 11.6 p.553,
11.12 p.566, 11.14 Smith p.572; 13.3 Chebyshev p.617; 13.8 stub p.639; 13.9 p.643; 13.10 p.645).
Simons (CPW) = **+20**: 2.2.3 pp.20–21. Tocci/Boylestad no aplican.

**Soluciones calculadas con `ltx` (verificadas):**
- C1 TI4 (L = 0,2 µH/m): γ = 0,226 + j24,33, Z₀ = 25,82 + j0,034 Ω; sin pérdidas Z₀ = 25,82. TI5: ROE 3 → 75 %
  entregado. TI6.2: λ/4 = 25 cm → 300 MHz.
- C2: 30+j100/50: Γ = 0,796∠50°, RL 1,98 dB, ROE 8,82. TI2 75+j42,5/300: 0,607∠162,8°, ROE 4,09.
  P2: λ = 6,25 cm, l = 0,32λ, Zin = 18,99 − j20,55, ROE 4,27 (= curso). P3: Γ = 0,707∠45°, ROE 5,83,
  Zin = 58,1 − j162,3 Ω. P4: ZL = 55,6 + j102,6 Ω, Γ = 0,6∠80°, 1.er máx a 0,111λ, Zmáx = 400 Ω.
  P5 (300+j100, 550 Ω, 25 MHz): ROE 1,92; en Vmín (0,4604λ = 5,53 m) Zt = 397 Ω, D ≈ 5,5 cm (mejor);
  en Vmáx (0,2104λ) Zt = 762 Ω, D ≈ 1,14 m (impracticable); l = 3 m (1,5 m con εr = 4). Ej 3.8: 66,7/150 Ω.
- 1.ª Evaluación (interpretación: interruptor en el extremo de un stub λ/4): S1 cerr./S2 abierto → B;
  ambos abiertos → ninguna; ambos cerrados → A y B (Z₀/2); S1 abierto/S2 cerrado → A (el enunciado
  repite el caso 2 como 4, probable errata).
- 2A: 15+j10/50 stub paralelo CA d = 0,044λ l = 0,147λ / d = 0,387λ l = 0,353λ (= curso); CC: l = 0,397/0,103;
  serie CA: d = 0,137 l = 0,103 / d = 0,294 l = 0,397; coax εr4 2 GHz: d = 0,33 cm, l = 1,10 cm.
- 2B: Pozar 5.4 (60−j80, λ/8): b₁ = −0,114/1,314, b₂ = −1,38/3,38; CA l = 0,482/0,350 y 0,146/0,204;
  CC l = 0,232/0,100 y 0,396/0,454. Pozar 5.5: 10→50 Ω, ROE 1,5 → 29 %.
- 2C: Chebyshev 60→120, N=2, ROE 1,105: Z₁ = 73,15, Z₂ = 98,4 Ω, θm = 59,9°, BW 67 %. Rómbica 250→600:
  aL = 0,875; **errata del curso**: |Γ|máx = ½ln 2,4 = 0,438 (no 0,87). Exp 50→100, Γ ≤ 0,05 en 100 %:
  βL₁ = 5,39 → L = 1,72λ₀ (curso 1,75λ₀ leyendo la gráfica); Chebyshev N = 2,98 → 3 (0,75λ₀).
- Tarea GO: P1 Hz ∝ cos(200πx) → TE₂₀ (fc = 30 GHz), Ey = (ωµ/200π)H₀ sen(200πx) sen(ωt−βz),
  Hx = −(β/200π)H₀ sen(200πx) sen(ωt−βz). P2 bandas monomodo: guía1 3,75–7,49; guía2 6,25–11,53;
  guía3 6,25–12,49; circular r = 1,2 cm 7,32–9,56 GHz → 8–9 GHz: guías 2, 3, 4; comercial WR-90
  (2,286×1,016 cm, 8,2–12,4 GHz), latón a 9 GHz αc = 0,182 dB/m. P3 = Pozar ej. 3.1: 9,72/19,44/24,19 GHz,
  a 15 GHz αd = 1,03 dB/m, αc = 0,434 dB/m.
- Clase GO: tabla p′₂₁ «30.54» es errata de 3,054; TM₀₁ usa 2,405 (curso redondea 2,45 → λc = 2,61a).

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | CP/Tareas | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| I Teoría general LTx | ✅ | ✅ | ✅ | ✅ | ✅ 1.ª Eval. | ✅ | ✅ | ✅ |
| I Carta de Smith | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| II Guías de onda | ✅ | ✅ | ✅ | ✅ | ✅ Tarea GO | ✅ | ✅ | ✅ |
| II Líneas planares | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| III Stubs, λ/4, multisección, exponencial, balun | ✅ | ✅ | ✅ | ✅ | ✅ TI 2A–2C | ✅ | ✅ | ✅ |
| Parte 2 Antenas | ⛔ sin materiales | | | | | | | |
| Software `ltx` | ✅ | | | | | | | |

## Pendientes y dudas

- Parte 2 (Antenas): esperar materiales (Balanis 4.ª ed. ya está en `05-Bibliografia`).
- Duración de los vídeos de YouTube no comprobada (red inestable); solo título/canal por oEmbed.
- Enlaces de Orfanidis (Rutgers) y de la página de Pozar (UMass) no respondían: no se enlazan.
- No hay Octave instalado: no se publicaron scripts `.m` (la tarea los pide; se podrían añadir y probar).
- Metamateriales (`08-Complementarios`) sin tratar. PCAAD 5 sin guía de instalación.
- Gupta y Wadell son PDF escaneados: no se citan páginas.
- Erratas señaladas en las páginas: «0.2 H/m» (µH), p′₂₁ = 30.54 (3,054), ½ del exponencial (0,87→0,438),
  T₄ de Chebyshev, caso 4 de la 1.ª Evaluación repetido.

## Bitácora

- **2026-10-19** — Sitio reconstruido: el antiguo `index.html` (fórmulas con fracciones HTML hechas a mano)
  se sustituyó por portada + 5 temas con KaTeX, explicaciones ampliadas, problemas del curso recalculados,
  bibliografía verificada, vídeos verificados, `js/lta.js` (17 widgets) y `software/ltx`. Ficha `repaso/fisica-em.html`.

- **2026-10-18** — Reorganización: `Conferencias`→`01-Conferencias` (+ PDFs de guías de onda y
  Encuentros 2A/2B/2C), `Evaluaciones y Tareas`→`04-…`, `Libros` + 4 libros sueltos→`05-Bibliografia`,
  `Software`→`06-Software`, `Materiales` + metamateriales→`08-Complementarios`. El antiguo repo
  `html-learning-repo` se respaldó en `.git-backups/`; la carpeta ahora forma parte del monorepo.
