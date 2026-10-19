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

## Estado

El `index.html` actual (~115 KB, de la etapa anterior) cubre: qué es una LTx, ondas TEM/TE/TM,
por qué no basta la teoría de circuitos, parámetros distribuidos y ecuaciones del telegrafista,
γ = α + jβ y Z₀, coeficiente de reflexión / pérdidas de retorno / ROE, Z(z), transformador λ/4,
construcción de la carta de Smith, **carta de Smith interactiva**, tarjetas de aprendizaje y
ejemplos resueltos. **Hay que revisarlo** contra la plantilla del `CLAUDE.md` raíz (bibliografía
exacta, prerrequisitos, FAQ, enlaces) y migrarlo a `../assets/css/base.css` si conviene.

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | CP/Tareas | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| I Teoría general LTx | 🟡 | 🟡 (Smith) | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| I Carta de Smith | 🟡 | 🟡 | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II Guías de onda | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ (Tarea GO) | ⬜ | ⬜ | ⬜ |
| II Líneas planares (microcinta, coplanar) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III Stub simple / doble | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III λ/4, exponencial, Chebyshev, balun | 🟡 (λ/4) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Parte 2 Antenas | ⛔ sin materiales | | | | | | | |
| Software (Octave/Python: guías, microcinta, stubs) | ⬜ | | | | | | | |
| Evaluaciones (1ra Evaluación, formato de tarea) | ⬜ | | | | | | | |

## Pendientes y dudas

- Leer `02-Conf_Problema_Teorico_Fundamental`, `04-Resumen_C1_LTx`, los PDF de guías de onda y
  los encuentros 2A/2B/2C para completar Temas I–III.
- Resolver/explicar la **1ra Evaluación** y la **Tarea sobre Guías de Ondas** como ejemplos guiados.
- Página de metamateriales como contenido complementario.
- Guía de instalación de GNU Octave y de PCAAD 5 (Windows/Wine).

## Bitácora

- **2026-10-18** — Reorganización: `Conferencias`→`01-Conferencias` (+ PDFs de guías de onda y
  Encuentros 2A/2B/2C), `Evaluaciones y Tareas`→`04-…`, `Libros` + 4 libros sueltos→`05-Bibliografia`,
  `Software`→`06-Software`, `Materiales` + metamateriales→`08-Complementarios`. El antiguo repo
  `html-learning-repo` se respaldó en `.git-backups/`; la carpeta ahora forma parte del monorepo.
