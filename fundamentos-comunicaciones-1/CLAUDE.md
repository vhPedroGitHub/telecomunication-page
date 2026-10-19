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

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | CP/LAB | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| I.1 Teoría de la información | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| I.2 Codificación de fuente | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| I.3 Codificación de canal / bloque | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| I.4 Código convolucional | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II.1 Fasores y series de Fourier | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II.2 Transformada de Fourier | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II.3 Potencia, energía, autocorrelación | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II.4 Sistemas LTI, filtros | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| II.5 Señales aleatorias, ruido | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III.1 Muestreo, PCM, MDT | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III.2 DPCM, modulación delta | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III.3 Códigos de línea, repetidor | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III.4 ISI y criterios de Nyquist | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| III.5 Ruido banda base, umbral y filtro óptimo | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Pruebas parciales resueltas (PP1, PP2) | ⬜ | | | | | | | |

**Prioridad sugerida:** Tema II (es lo que se está dando ahora con las Actividades 1–6).

## Pendientes y dudas

- Faltan Conferencia 14 (códigos de línea / repetidor) y CP 8 y 14 de la edición anterior.
- Mapear cada CP con su tema leyendo los `.doc`.
- Agrupar las ~90 variantes de la PP1 por tipo de pregunta y resolver modelos representativos
  (no publicar los ID de los estudiantes).
- Extraer las funciones MATLAB de los `.rar` del Lab Simulado 2 y portarlas a Python/Octave.

## Bitácora

- **2026-10-18** — Reorganización: las "Actividad 1–6" (curso actual) a `01-Conferencias/` con
  tildes corregidas en el nombre; el contenido de `01/` (edición anterior) repartido en
  `00…08`; `Lab Simulado 2.rar` extraído en `03-Laboratorios/`; `bibliografia`→`05-Bibliografia`.
  Eliminados 2 duplicados exactos (`Actividad 1 … (1).pptx`, `Ejemplos de Prueba Parcial 2.docx` de la raíz).
