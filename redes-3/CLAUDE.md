# Redes 3 — Fibra óptica, redes de acceso y de transporte

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- Curso por **encuentros** (6), cada uno se repite en tres sedes (CIPEL-Cepero lunes, Cerro miércoles,
  Varona viernes). La **prueba parcial** se construye con una pregunta de cada uno de los encuentros 2, 3 y 4.

| Encuentro | Tema | Observación | Fechas |
|---|---|---|---|
| 1 | Introducción (presentación general y capa física) | | 05–09/10/2026 |
| 2 | Propagación sobre FO (cálculo de enlace óptico por atenuación y dispersión) | Pregunta 1 de la PP | 19–23/10/2026 |
| 3 | Redes de acceso (GPON, FTTH) | Pregunta 2 de la PP | 02–06/11/2026 |
| 4 | Redes de transporte (SDH, WDM, OTN) | Pregunta 3 de la PP | 16–20/11/2026 |
| 5 | Prueba parcial + Cableado estructurado y diseño top-down | PP en el primer turno | 30/11–04/12/2026 |
| 6 | Seminario de cableado estructurado y diseño top-down | | 14–18/12/2026 |

## Materiales fuente (`/home/pedro/studies/Carrera/4to-1er-Semestre/Redes 3/`)

| Carpeta | Contenido |
|---|---|
| `00-Programa-y-Planificacion/` | `Cronograma 11-10-2026.png` (tabla de arriba) |
| `01-Conferencias/Encuentro 2. Propagación sobre FO/Recomendada/` | T2.1 Propagación FO (teoría) · T2.2 Sistemas ópticos (método) · T2.3 Cálculo de enlace (ejercicios) |
| `01-Conferencias/Encuentro 2. Propagación sobre FO/Opcional/` | Apuntes 2H/4H · Apuntes unidades logarítmicas · Propagación FO (ejercicios) · Sistemas 2H/4H: magnitudes, estabilidad y eco (ejercicios) |
| `08-Complementarios/` | *Dispersión en la fibra óptica* (modal, cromática, PMD, ejemplos numéricos) · *Limitación en alcance por atenuación* (Curso1 mod1.2) · `Apuntes - Modos de propagacion en FO.doc` (notas propias, antes "Sin título 1.doc") |

**No hay aún:** materiales del Encuentro 1, 3, 4, 5, 6 ni bibliografía. Pedir/añadir cuando lleguen.

## Temario a cubrir

1. Introducción y capa física.
2. Fibra óptica: estructura, ley de Snell, apertura numérica, modos (mono/multimodo, V-number),
   atenuación (intrínseca/extrínseca, ventanas), dispersión (modal, cromática, PMD), cálculo de
   enlace por **potencia** (balance en dB/dBm) y por **ancho de banda/dispersión**; sistemas 2H/4H,
   unidades logarítmicas, estabilidad y eco.
3. Redes de acceso: PON, GPON (ITU-T G.984), FTTx/FTTH, splitters, presupuesto óptico de una ODN.
4. Redes de transporte: SDH (jerarquía STM-N, trama), WDM (CWDM/DWDM, grillas ITU-T G.694), OTN (G.709).
5. Cableado estructurado (TIA-568, ISO/IEC 11801) y diseño top-down (Oppenheimer).

## Prerrequisitos a repasar

- dB, dBm, logaritmos, suma de pérdidas → repaso transversal.
- Óptica geométrica (reflexión total interna, Snell), ondas EM → `cursos/10-TC/`.
- Ancho de banda, ISI, tasa de bits → `cursos/09-FC/` / FC I.
- Modelo OSI, capa física, Ethernet → `cursos/04-Redes/`.

## Ideas de interactivos / software

- Fibra animada: rayos con ángulo de aceptación (NA) y reflexión total; mono vs multimodo.
- Calculadora de enlace óptico: potencia Tx, sensibilidad Rx, atenuación/km, empalmes, conectores,
  margen; dispersión → longitud máxima limitada por BW. Versión web + CLI (Python/Go).
- Calculadora de presupuesto GPON (splitters 1:N, clases B+/C+).
- Visualizador de trama STM-1 y de la rejilla DWDM.

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|
| 1 Introducción / capa física | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 Propagación en FO + cálculo de enlace | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 Acceso GPON/FTTH | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 Transporte SDH/WDM/OTN | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 Cableado estructurado / top-down | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Preparación de la prueba parcial | ⬜ | | | | | | |

## Pendientes y dudas

- Sin bibliografía en la carpeta: proponer referencias abiertas (normas ITU-T gratuitas,
  Keiser *Optical Fiber Communications*, Agrawal *Fiber-Optic Communication Systems*) y verificar.
- Convertir los `.ppt/.doc` del Encuentro 2 a texto y resolver los ejercicios de cálculo de enlace.

## Bitácora

- **2026-10-18** — Reorganización: cronograma a `00-…`; `Encuentro 2. Propagación sobre FO.rar`
  extraído en `01-Conferencias/` (y eliminado el `.rar`); PDFs de dispersión/atenuación y
  "Sin título 1.doc" (renombrado) a `08-Complementarios/`.
