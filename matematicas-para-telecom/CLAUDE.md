# Matemáticas para Telecom (itinerario complementario)

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- **Itinerario complementario propio**, no ligado a una carpeta de materiales del semestre. Reúne
  los **10 cursos de matemáticas** que completan la formación después de Cálculo I, pedidos el
  2026-10-21: cálculo multivariable, álgebra lineal, ecuaciones diferenciales, variable compleja,
  series y transformadas, probabilidad y estadística, métodos numéricos, matemática discreta,
  optimización y ecuaciones en diferencias.
- **Público:** estudiantes de Ingeniería en Telecomunicaciones que necesitan estas herramientas
  para señales, campos, circuitos, comunicaciones, redes, control y procesamiento digital.
- **Enfoque:** cada curso es una página autónoma de nivel universitario inicial, con objetivos,
  prerrequisitos, teoría, teoremas, tablas, aplicaciones en telecom, ejemplos resueltos, ejercicios
  con respuesta, autoevaluación, bibliografía por capítulo/epígrafe, recursos abiertos y FAQ.
- **No hay materiales fuente locales:** todo el contenido es elaboración propia basada en el
  temario estándar de cada área. No se copian libros ni se inventan citas de páginas.

## Estructura

| Archivo | Curso | Contenido destacado | Interactivo |
|---|---|---|---|
| `index.html` | Hub | presentación, 10 cursos por fases, ruta, mapa curso→asignatura, método de estudio, bibliografía y FAQ | — |
| `cursos/calculo-multivariable.html` | 1 · Cálculo multivariable y vectorial | parciales, gradiente, optimización, integrales múltiples, campos, Green/Stokes/Gauss | — |
| `cursos/algebra-lineal.html` | 2 · Álgebra lineal | matrices, Gauss, espacios vectoriales, autovalores, diagonalización, ortogonalidad, SVD | Transformación 2×2 |
| `cursos/ecuaciones-diferenciales.html` | 3 · EDO | primer orden, segundo orden, sistemas, Laplace, estabilidad, circuitos RC/RL/RLC | Campo de pendientes y Euler |
| `cursos/variable-compleja.html` | 4 · Variable compleja | Euler, Cauchy–Riemann, contornos, Cauchy, Laurent, residuos, conformes | — |
| `cursos/series-transformadas.html` | 5 · Series y transformadas | series, Taylor, Fourier, espectro, Parseval, Fourier continua, muestreo, DFT/FFT, Laplace | Suma de armónicos |
| `cursos/probabilidad-estadistica.html` | 6 · Probabilidad y estadística | axiomas, Bayes, variables, distribuciones, CLT, estimación, contrastes, ruido/BER/colas | Normal interactiva |
| `cursos/metodos-numericos.html` | 7 · Métodos numéricos | errores, bisección, Newton, LU, iterativos, interpolación, Simpson, Euler/RK4 | — |
| `cursos/matematica-discreta.html` | 8 · Matemática discreta | lógica, conteo, recurrencias, grafos, Boole, modular, Hamming/CRC/RSA | — |
| `cursos/optimizacion.html` | 9 · Optimización | convexidad, Lagrange, KKT, LP y dualidad, gradiente/Newton, water-filling | Descenso de gradiente |
| `cursos/ecuaciones-diferencias.html` | 10 · Ecuaciones en diferencias | primer/segundo orden, no homogéneas, sistemas, estabilidad, transformada Z, filtros | — |

Interactivos compartidos en `../assets/js/mate.js` (cargado después de `course.js`):

| Simulador | Página | Controles |
|---|---|---|
| Transformación lineal 2×2 | álgebra lineal | matriz \(A\), vector, cuadrícula transformada |
| Campo de pendientes y Euler | EDO | ecuación predefinida, paso \(h\), solución aproximada |
| Series de Fourier | series y transformadas | onda cuadrada/diente/triangular, número de armónicos |
| Distribución normal | probabilidad | \(\mu\), \(\sigma\), valor \(x\), área acumulada |
| Descenso de gradiente | optimización | función, tasa \(\eta\), iteraciones |

## Bibliografía de referencia

- Stewart, *Cálculo de varias variables*, 8.ª ed.; OpenStax *Calculus Volume 3*.
- Lay, *Álgebra lineal y sus aplicaciones*, 5.ª ed.; OpenStax *Linear Algebra*; MIT 18.06.
- Boyce y DiPrima, *Ecuaciones diferenciales*, 10.ª ed.; Zill, 9.ª ed.; MIT 18.03.
- Churchill y Brown, *Variable compleja y aplicaciones*, 8.ª ed.; Kreyszig, 10.ª ed.; MIT 18.04.
- Oppenheim y Willsky, *Señales y sistemas*, 2.ª ed.; Proakis y Manolakis, 4.ª ed.
- Walpole, Myers y Myers, *Probabilidad y estadística para ingeniería*, 9.ª ed.; Papoulis y Pillai, 4.ª ed.; OpenStax *Introductory Statistics 2e*.
- Burden y Faires, *Análisis numérico*, 10.ª ed.; Chapra y Canale, 7.ª ed.
- Rosen, *Matemática discreta y sus aplicaciones*, 8.ª ed.; Levine, *Discrete Mathematics: An Open Introduction*.
- Boyd y Vandenberghe, *Convex Optimization*; Luenberger y Ye, 4.ª ed.
- Oppenheim y Schafer, *Discrete-Time Signal Processing*, 3.ª ed.; Elaydi, 3.ª ed.

## Estado

| Curso | Teoría | Teoremas | Tablas | Ejemplos | Ejercicios | Quiz | Biblio/FAQ |
|---|---|---|---|---|---|---|---|
| 1 Cálculo multivariable | ✅ | ✅ | ✅ | ✅ 9 | ✅ 10 | ✅ | ✅ |
| 2 Álgebra lineal | ✅ | ✅ | ✅ | ✅ 7 | ✅ 11 | ✅ | ✅ |
| 3 Ecuaciones diferenciales | ✅ | ✅ | ✅ | ✅ 8 | ✅ 10 | ✅ | ✅ |
| 4 Variable compleja | ✅ | ✅ | ✅ | ✅ 9 | ✅ 10 | ✅ | ✅ |
| 5 Series y transformadas | ✅ | ✅ | ✅ | ✅ 10 | ✅ 10 | ✅ | ✅ |
| 6 Probabilidad y estadística | ✅ | ✅ | ✅ | ✅ 7 | ✅ 10 | ✅ | ✅ |
| 7 Métodos numéricos | ✅ | ✅ | ✅ | ✅ 9 | ✅ 10 | ✅ | ✅ |
| 8 Matemática discreta | ✅ | ✅ | ✅ | ✅ 11 | ✅ 10 | ✅ | ✅ |
| 9 Optimización | ✅ | ✅ | ✅ | ✅ 9 | ✅ 10 | ✅ | ✅ |
| 10 Ecuaciones en diferencias | ✅ | ✅ | ✅ | ✅ 16 | ✅ 10 | ✅ | ✅ |
| Hub + interactivos | ✅ | | ✅ | | | | ✅ |

Leyenda: ✅ completo · 🟡 en progreso · ⬜ pendiente.

## Verificación

- Chromium headless (Playwright) sobre hub + 10 cursos: consola sin errores, KaTeX sin errores,
  sin desborde horizontal a 390 px y controles de los cinco interactivos respondiendo.
- Enlaces internos del hub y navegación entre cursos comprobados.
- Enlaces externos abiertos comprobados (HTTP 200): OpenStax Calculus 3, Linear Algebra,
  Introductory Statistics 2e y Calculus 2; MIT 18.03, 18.04 y 18.06; Discrete Mathematics: An Open
  Introduction; Boyd, *Convex Optimization*.
- Fecha de la sesión: 2026-10-21.

## Pendientes y dudas

- Añadir figuras SVG propias (campos vectoriales, contornos, espectros) para reducir dependencia de
  la prosa en los cursos 1, 4 y 5.
- Valorar más ejercicios de optimización con restricciones y de EDO no lineales.
- Algunos temas avanzados (procesos de Markov, programación entera) se mencionan como aplicaciones,
  no como epígrafes desarrollados; si se amplían, añadirlos a la tabla y a la página.
- Confirmar el nivel de rigor: hay demostraciones breves e ideas, pero no sustituye un curso formal
  de análisis ni de álgebra abstracta.

## Bitácora

- **2026-10-21** — Itinerario creado: hub + 10 cursos completos, 5 interactivos en
  `assets/js/mate.js`, acento `--c-mate`, tarjeta en el portal raíz, fila en `README.md` y
  actualización del `CLAUDE.md` raíz. Bibliografía por capítulo/epígrafe y recursos abiertos
  verificados. Verificado en Chromium headless (consola, KaTeX, 390 px y controles).
