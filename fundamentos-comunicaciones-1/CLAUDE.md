# Fundamentos de las Comunicaciones I (FC I)

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- **Coordinador:** Dr. C. Fidel Ernesto Hernández Montero (CUJAE). Profesores de atención directa:
  Dr. C. Camilo Guillén, MSc. Fernando Hernández.
- **Objetivo:** caracterizar sistemas de comunicación digitales en **banda base** (FC II verá
  modulaciones analógicas y digitales). 96 h de clase.
- **Curso actual (2026):** las conferencias se llaman "Actividad N". Hasta ahora llegaron las
  Actividades 1–6, que corresponden al **Tema II (Teoría de la señal y los sistemas)**. El orden
  del curso actual empieza por Tema II, no por Tema I.
- **Edición anterior:** hay un juego completo de conferencias 1–18 (falta la 14), CP 1–18
  (faltan 8 y 14), pruebas y vídeos "Recurso orientador". Es útil para cubrir los Temas I y III;
  coincide con `cursos/09-FC/01`.

## Materiales fuente (`/home/pedro/studies/Carrera/4to-1er-Semestre/Fundamentos de las Comunicaciones 1/`)

| Carpeta | Contenido |
|---|---|
| `00-Programa-y-Planificacion/` | Programa Analítico FCI (Plan E, 17-02-26) · Planificación.docx · horario cime.xlsx |
| `01-Conferencias/` | **Curso actual:** Actividad 1 Introducción · 2 Fasores y Series de Fourier · 3 Transformada de Fourier · 4 Potencia y Energía, Autocorrelación · 5 Sistemas LTI · 6 Señales aleatorias, Ruido |
| `01-Conferencias/Edicion-anterior/` | Conferencia 1 Introducción · 2 Modelo de sistema, Teoría de la información, Cod. de fuente · 3 Codificadores de fuente · 4 Codificación de canal · 5 Código lineal de bloque · 6 Código convolucional · 7 Fasores y SF · 8 TF · 9 Potencia y energía · 10 LTI · 11 Señales aleatorias · 12 PCM, MDT · 13 DPCM, Modulación Delta · 15 ISI 1er criterio de Nyquist · 16 ISI 2do criterio · 17 Ruido banda base (umbral óptimo) · 18 Ruido banda base (filtro óptimo) |
| `02-Clases-Practicas/` | CP 1–7, 9–13, 15–18 · Ejercicios de cantidad de información, entropía y cod. de fuente · Ejercicios de codificación Hamming |
| `03-Laboratorios/Lab Simulado 2/` | `Lab_Simulado_2.rtf` + `Grupo de Funciones 1.rar`, `Grupo de Funciones 2 y ejemplos.rar` (funciones MATLAB) |
| `04-Evaluaciones-y-Tareas/` | `Prueba Parcial 1/` (~90 variantes de la PP1, nombradas por ID) · Prueba Parcial 55604259 (versión distinta) · Ejemplos de Prueba Parcial 2 · Trabajo Práctico Tema 2 |
| `05-Bibliografia/` | Carlson *Communication Systems* · Sklar *Digital Communications* (2014) · Couch *Digital and Analog Communication Systems* (2012) · Haykin *Communication Systems* 4ª ed. (extracto) · MacKay *Information Theory, Inference and Learning Algorithms* |
| `07-Videos/` | 00 Introducción · 01–04 Recursos orientadores (teoría de la información, cod. de fuente, cod. de canal, código lineal de bloque) |
| `08-Complementarios/` | `Resumenes-y-Ejemplos-Resueltos/` (Ejemplos resueltos de fasores y SF, ER-1, ER-2, Resumen+ejemplo SF y TF) · *Fundamentos de los fundamentos.pdf* · lista de vídeos YouTube recomendados (conf. 2 y 3) |

**Bibliografía oficial del programa:** (1) Carlson, Crilly & Rutledge, *Communication Systems*, 4ª ed., McGraw-Hill, 2002.
(2) Sklar, *Digital Communications. Fundamentals and Applications*, 2ª ed., Prentice-Hall, 2001.
Ojo: el PDF de Sklar disponible es la edición 2014 (Sklar & Ray); verificar numeración de capítulos.

## Temario (Programa Analítico)

- **Tema I — Teoría de la información y codificación:** cantidad de información, entropía de
  fuentes discretas sin memoria, canales, Shannon-Hartley, capacidad con AWGN, límite de Shannon;
  codificación de fuente (Shannon-Fano, Huffman, Lempel-Ziv); codificación de canal (ARQ/FEC,
  repetición, paridad, distancia de Hamming, códigos lineales de bloque, convolucionales).
  Lab simulado de codificación. Uso de MATLAB.
- **Tema II — Señales y sistemas:** representación de línea/fasores, series y transformada de
  Fourier, teoremas, espectro de señales discretas, potencia y energía, correlación, DEP,
  sistemas LTI y filtros, distorsión lineal y no lineal, ruido. Lab simulado (espectro de señales
  discretas) + lab real (representación espectral).
- **Tema III — Comunicación digital en banda base:** muestreo y aliasing, filtro restaurador, PCM,
  cuantificación y SNRq, MDT, DPCM, modulación delta, códigos de línea, repetidor regenerativo,
  ISI y criterios de Nyquist (coseno alzado, duobinario), probabilidad de error, función Q,
  umbral y filtro óptimos (filtro adaptado). Lab simulado de ISI y ruido.

## Prerrequisitos a repasar

- Números complejos, fórmula de Euler, trigonometría, integrales, series, función impulso/escalón
  → `cursos/02-Matemática/`.
- Probabilidad, variables aleatorias, distribuciones (gaussiana), esperanza, varianza, función Q
  → `cursos/08-Probabilidad-Estadística/` (Walpole + conferencias 1–6).
- Logaritmos (base 2), dB.
- Circuitos RC/RL, respuesta en frecuencia, filtros → `cursos/07-Circuito/`.
- Métodos numéricos/MATLAB-Octave → `cursos/03-Númerica/`.

## Ideas de interactivos / software

- Síntesis de señal por armónicos (series de Fourier) con fenómeno de Gibbs.
- Pares de TF animados (pulso ↔ sinc, escalado, desplazamiento, modulación).
- Constructor de árbol de Huffman, LZ78/LZW paso a paso, calculadora de entropía.
- Codificador/decodificador Hamming (7,4) y lineal de bloque con síndrome; trellis convolucional + Viterbi.
- Muestreo y aliasing en vivo; cuantificador PCM con SNRq; modulador delta (sobrecarga de pendiente).
- Diagrama de ojo con ISI y coseno alzado (roll-off); BER vs Eb/N0.
- Software Python: toolkit `fc1` (entropía, Huffman, Hamming, PCM, BER) equivalente a las funciones del Lab Simulado.

## Estructura del sitio

| Archivo | Contenido |
|---|---|
| `index.html` | portada: temas, plan (Actividades 2026 y ed. anterior), evaluación, profesores, bibliografía, software, prerrequisitos, FAQ |
| `temas/tema0-introduccion-y-repaso.html` + `js/tema0.js` | Tema 0 especial: qué es comunicar, mapa del curso y repaso de matemática, señales, probabilidad, circuitos y bits + 6 simuladores + autodiagnóstico, ejercicios, quiz, glosario, bibliografía y FAQ |
| `temas/tema1-teoria-informacion.html` + `js/tema1.js` | Tema I completo + 6 simuladores (entropía, Huffman, LZ78, capacidad, Hamming, Viterbi) + PP1 resuelta |
| `temas/tema2-senales-y-sistemas.html` + `js/tema2.js` | Tema II completo (11 secciones + glosario + 20 figuras SVG) + 8 simuladores (fasor, suma de hasta 5 fasores, síntesis de Fourier, explorador TF, convolución, RC, ruido, «foury» web) + Lab. Simulado 2 + guía del Trabajo Práctico |
| `temas/tema3-banda-base.html` + `js/tema3.js` | Tema III completo + 7 simuladores (muestreo, cuantificador, DM, códigos de línea, ojo, umbral/Pe, BER) |
| `software/fc1/` | paquete Python sin dependencias (CLI `python -m fc1`) + 10 pruebas que reproducen los ejemplos de la web |

Utilidades compartidas: `../assets/css/course.css` (cajas, ejemplos, simuladores, tablas) y
`../assets/js/course.js` (KaTeX con macros, índice lateral automático, quiz, graficador `Course.Plot`,
`Course.M` con sinc/Q/erfc/DFT).

## Bibliografía verificada (páginas impresas → PDF)

Desfases medidos (página PDF − página impresa): **Sklar 2014: +27** · **Couch 2012: +25** ·
**MacKay: +12** · **Haykin 4ª: +20** · **Carlson 4ª: +13 (cap. 2–3), +10 (cap. 6–7), +9→+7 (cap. 9),
+6 (cap. 11–13), +4 (cap. 14)** (el escaneo de Carlson pierde páginas; no tiene capa de texto útil, se
verificó por OCR de cabeceras). Las guías de CP citan otras ediciones (p. ej. "Sklar p. 711–731" =
Apéndice A, pp. 1069–1090 de la edición 2014; "Carlson p. 158-163" no corresponde a la 4ª ed.).

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | CP/LAB | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| 0. Introducción y repaso (especial) | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| I.1 Teoría de la información | ✅ | ✅ | ✅ | ✅ | ✅ CP1 | ✅ | ✅ | ✅ |
| I.2 Codificación de fuente | ✅ | ✅ | ✅ | ✅ | ✅ CP2 | ✅ | ✅ | ✅ |
| I.3 Codificación de canal / bloque | ✅ | ✅ | ✅ | ✅ | ✅ CP3 | ✅ | ✅ | ✅ |
| I.4 Código convolucional | ✅ | ✅ | ✅ | ✅ | 🟡 CP4 (enunciados en imagen) | ✅ | ✅ | ✅ |
| II.1 Fasores y series de Fourier | ✅ | ✅ | ✅ | ✅ | ✅ CP5 | ✅ | ✅ | ✅ |
| II.2 Transformada de Fourier | ✅ | ✅ | ✅ | ✅ | ✅ CP6–7 | ✅ | ✅ | ✅ |
| II.3 Potencia, energía, autocorrelación | ✅ | 🟡 (en series) | ✅ | ✅ | ✅ CP9 | ✅ | ✅ | ✅ |
| II.4 Sistemas LTI, filtros | ✅ | ✅ | ✅ | ✅ | ✅ CP10 | ✅ | ✅ | ✅ |
| II.5 Señales aleatorias, ruido | ✅ | ✅ | ✅ | ✅ | ✅ CP11 | ✅ | ✅ | ✅ |
| II Lab. Simulado 2 + Trabajo Práctico | ✅ | ✅ | ✅ | | ✅ | | | |
| III.1 Muestreo, PCM, MDT | ✅ | ✅ | ✅ | ✅ | ✅ CP12 | ✅ | ✅ | ✅ |
| III.2 DPCM, modulación delta | ✅ | ✅ | ✅ | ✅ | ✅ CP13 | ✅ | ✅ | ✅ |
| III.3 Códigos de línea, repetidor | ✅ | ✅ | 🟡 | 🟡 | — (falta Conf. 14) | ✅ | ✅ | ✅ |
| III.4 ISI y criterios de Nyquist | ✅ | ✅ | ✅ | ✅ | ✅ CP15–16 | ✅ | ✅ | ✅ |
| III.5 Ruido banda base, umbral y filtro óptimo | ✅ | ✅ | ✅ | ✅ | ✅ CP17–18 | ✅ | ✅ | ✅ |
| Pruebas parciales resueltas (PP1, PP2) | 🟡 PP1 (1 variante) | | | | | | | |

Nota (2026-10-21): el Tema II se amplió con una sección 2 nueva («El espectro: qué es, para qué sirve»),
explicación paso a paso de fasores (3.1–3.3) y de los `C_n` (4.2), 9 figuras SVG generadas (dominio
tiempo/frecuencia, fasor, contra-rotativos, `C_n` como muestras, espectros de los ejercicios,
convolución, RC y R(τ)/G(f)), un glosario de 24 términos y 8 recursos externos verificados.
Después se añadieron 10 figuras de «datos del problema» (el enunciado dibujado con sus valores) en
los ejemplos y ejercicios con datos numéricos: 4.1, 4.5.4, 5.1, 5.2, 5.3, 9.2, 9.5.2, 10.1, 10.4.2
y 11.1; después se añadió el dibujo del espectro bilateral (amplitud y fase) del Ej. 4.1; total
20 figuras.

## Pendientes y dudas

- Faltan Conferencia 14 (códigos de línea / repetidor) y CP 8 y 14 de la edición anterior.
- Muchas figuras/enunciados de CP están como imágenes (CP 4, CP 6, CP 12 ej. 1 y 3, EI de las
  Actividades): resolverlos leyendo las diapositivas renderizadas cuando se amplíe cada tema.
- PP1: hay ~90 variantes; solo se publicó una variante representativa (sin datos personales). Agrupar
  el resto por tipo. «Ejemplos de Prueba Parcial 2» es un .docx casi vacío en texto (está en imágenes).
- Dudas de convención anotadas en la página: DEP «5·10⁻⁷ u²/Hz» de las CP 17–18 se tomó como bilateral;
  «1020 T₀» del EI de la Actividad 6 se interpretó como 10²⁰ T₀; RZ con Nyquist se tomó como R_s = 2R_b.
  Confirmar con el profesor.
- Vídeos «Recurso orientador» (07-Videos) no se revisaron.

## Bitácora

- **2026-10-24** — Tema II, §3.2: nuevo simulador `sim-fasores5` para sumar hasta cinco fasores
  con amplitud, frecuencia y desfase independientes, con selector coseno/seno. A la izquierda se
  dibujan los fasores girando en el plano complejo y su proyección sobre el eje real; a la derecha,
  las senoides de cada componente y la suma total (ventana móvil de 4 s). Se añadió el token `--s5` (claro/oscuro), los
  estilos `.f5-*` y la mención en la portada. Verificado en Chromium headless: consola sin errores, 0 `.katex-error`, sin
  desborde a 390 px; animación, pausa/reinicio y controles de los cinco fasores funcionando.
- **2026-10-24** — Tema 0 nuevo (`temas/tema0-introduccion-y-repaso.html` + `js/tema0.js`): 14
  secciones con introducción a las comunicaciones, mapa del curso, repaso de matemática, señales,
  probabilidad, circuitos y bits, 6 simuladores, autodiagnóstico con plan, ejercicios resueltos,
  quiz, glosario, bibliografía y FAQ. Enlazado desde la portada (pestaña, tarjeta, plan y
  prerrequisitos) y desde las pestañas de los Temas I–III. Verificado en Chromium headless:
  consola sin errores, 0 `.katex-error`, sin desborde a 390 px.
- **2026-10-22** — Tema II, ampliación didáctica (sin figuras nuevas; siguen 20): en 4.2 se añadió
  «De los \(C_n\) a la amplitud y la fase» (`h4#cn-amplitud-fase`) con la receta de tres cuentas
  (evaluar, separar real/imaginaria, módulo y `atan2`), tabla numérica de \(C_n=2\operatorname{sinc}(n/2)\)
  y tabla de fase con retardo \(T_0/4\); la tabla de propiedades de 4.3 incorpora linealidad y una
  columna «Ejemplo concreto» en las 8 propiedades, seguida de un ejemplo numérico sin volver a integrar
  (linealidad, par/impar, media onda, desplazamiento y Parseval). En 5.2 se añadió `h4#tf-ejemplos` con
  los 10 teoremas de la TF y un ejemplo por teorema, la caja «Cómo atacar un ejercicio con teoremas» y
  el «Ejemplo 5.4 — Cuatro transformadas combinando teoremas». §6 (delta) se amplió con definición
  límite/cribado, unidades, tabla de 10 operaciones con ejemplo numérico, ideas clave, errores típicos
  y un «Ejemplo 6.1» (el antiguo espectro del muestreo pasó a 6.2). §7 (convolución) se amplió con
  intuición de superposición/ecos, tabla de 10 propiedades con ejemplo, errores típicos y el
  «Ejemplo 7.2 — Rectángulo por exponencial» con los tres tramos y comprobaciones de continuidad/área.
  Corregidos los signos de \(C_{\pm1}\) y \(C_{\pm3}\) en el ejemplo de media onda y el ejemplo de la
  tabla (tren 0/4 V: \(|C_n|=4/(\pi|n|)\)). Verificado en Chromium headless: consola sin errores,
  0 nodos `.katex-error`, `scrollWidth` = 390 px a 390 px de ventana.

- **2026-10-21** — Tema II, Ej. 4.1: añadida la figura `data-fig="espectro-p41"` con el espectro
  bilateral del tren de pulsos (A = 4 V, τ = 0,5 ms, T₀ = 1 ms): amplitud `|Cn| = 2|sinc(n/2)|`
  con las líneas en nf₀, la envolvente sinc, los ceros en los armónicos pares y las fases 0°/180°
  según el signo. Verificada en Chromium: sin errores de consola, sin desborde a 390 px.
- **2026-10-21** — Tema II: figuras de «datos del problema» (el enunciado dibujado, con los valores
  ubicados en los ejes) en Ej. 4.1 (tren de pulsos: A = 4 V, τ = 0,5 ms, T₀ = 1 ms), Ej. 4.5.4
  (restar el valor medio), Ej. 5.1 (pulso A, τ), 5.2 (trozo de coseno T₁, f₁), 5.3 (triángulo y su
  derivada), 9.2 (cadena impulsos → rectángulo → paso bajo con T₀, τ, B), 9.5.2 (canal de 5 kHz y voz
  de 3,4 kHz), 10.1 (a(t), c(t) y ruido), 10.4.2 (ruido blanco por paso banda) y 11.1 (AM 1 Hz/20 Hz).
  Las figuras sustituyen placeholders `<!--FIG:clave-->` mediante el generador `genfigs2.py` (análogo
  al de las 9 anteriores: `data-fig`, `--reset`). Verificado en Chromium: 19 figuras visibles, sin
  errores de consola ni de KaTeX, sin desborde de página a 390/768/1280 px.
- **2026-10-21** — Tema II ampliado tras revisión docente: sección 2 nueva sobre qué es el espectro y
  por qué importa (banda, multiplexación, filtros, diagnóstico); fasores reescritos en 3.1 (fasor y
  proyección), 3.2 (Euler con Taylor → frecuencias negativas) y 3.3 (amplitud vs fase); los `C_n` con
  receta de 5 pasos y errores típicos; 9 figuras SVG insertadas en teoría y ejercicios (4.5.1, 4.5.3,
  Ej. 7.1, 8.4.4, 9.5.1); glosario; enlaces nuevos a PySDR (ES), LibreTexts (Johnson, Wilson, Kirtley)
  y cinco vídeos (títulos comprobados por oEmbed). Secciones renumeradas 1–11 (anclas sin cambios) y
  referencias «§» actualizadas en `repaso/` y en el plan de la portada. Verificado en Chromium headless:
  sin errores de consola ni de KaTeX; a 390 px no hay desborde de página.
- **2026-10-19** — Sitio construido: portada + Temas I, II y III (teoría, 20 simuladores, ejemplos
  de conferencias y CP resueltos, ejercicios con solución, guías de CP/Lab, bibliografía verificada
  en los PDF, vídeos verificados, FAQ) y paquete `software/fc1` con pruebas. Repaso: fichas de
  matemática, probabilidad y circuitos.
- **2026-10-18** — Reorganización: las "Actividad 1–6" (curso actual) a `01-Conferencias/` con
  tildes corregidas en el nombre; el contenido de `01/` (edición anterior) repartido en
  `00…08`; `Lab Simulado 2.rar` extraído en `03-Laboratorios/`; `bibliografia`→`05-Bibliografia`.
  Eliminados 2 duplicados exactos (`Actividad 1 … (1).pptx`, `Ejemplos de Prueba Parcial 2.docx` de la raíz).
