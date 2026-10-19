# Repaso de prerrequisitos (transversal)

> Lee primero el `CLAUDE.md` raíz. **Actualiza este archivo al final de cada sesión.**

## Propósito

Las asignaturas del semestre dan por sabidos conceptos de cursos anteriores. Esta sección reúne
**fichas de repaso cortas** a las que remiten los recuadros "Antes de empezar" de cada tema.
Cada ficha: definición, fórmula(s) clave, un ejemplo mínimo, un interactivo si aporta, y
**dónde estudiarlo** (material en `/home/pedro/studies/Carrera/cursos/` + bibliografía con
capítulo/páginas + un vídeo). No se trata de rehacer esas asignaturas: solo refrescar.

Convención de URL: `repaso/<area>.html#<ficha>` (p. ej. `repaso/matematica.html#euler`), para que
las asignaturas enlacen de forma estable. **No cambiar los `id` una vez publicados.**

## Fuentes (`/home/pedro/studies/Carrera/cursos/`)

| Carpeta | Contenido útil | Bibliografía principal |
|---|---|---|
| `02-Matemática/` | `curso_4/` (ejercicios + libro) | Stewart, *Cálculo de una variable*, 9ª ed. |
| `03-Númerica/` | conferencias, CP (con respuestas), autoevaluación | `bibliografia/` |
| `04-Redes/` | curso_1 (conferencias, seminario), curso_2 (conferencias, CP) | `Libros/` |
| `05-ElecA/` | diodo y fuente, BJT, FET y multietapa, realimentación y resp. en frecuencia, amp. operacional | `bibliografias/` |
| `06-ElecD/` | contenidos, temas 1–3, data sheets, tareas resueltas | `Bibliografia/` |
| `07-Circuito/` | curso 1 y 2 (conferencias, CP, labs), Proteus | Hayt, *Análisis de circuitos en ingeniería* (8ª y 10ª ed.) + solucionario |
| `08-Probabilidad-Estadística/` | conf. 1–11 (eventos → regresión), CP, tablas | Walpole, *Probabilidad y estadística para ingenieros y ciencias* |
| `09-FC/` | igual a la edición anterior de FC I | Carlson, Sklar, Couch, Haykin, MacKay |
| `10-TC/` | Electrodinámica (CP, formularios, orientaciones), Radiopropagación (conf., CP) | Dolukhanov, *Propagation of Radio Waves* (1995) |
| `12-ConmutacionTelefonica/` | teoría de tráfico (Erlang), SS7, SIP, NGN/IMS | — |

## Fichas planificadas

| Página | Fichas | Usada por |
|---|---|---|
| `matematica.html` | complejos y Euler · trigonometría · logaritmos y dB/dBm · derivadas/integrales clave · series · funciones hiperbólicas · impulso y escalón · convolución · vectores, gradiente/divergencia/rotacional | FC I, LTyA, Redes 3 |
| `fisica-em.html` | ecuaciones de Maxwell · ondas planas · Poynting · condiciones de frontera · efecto pelicular · reflexión/refracción (Snell) | LTyA, Redes 3 |
| `circuitos.html` | fasores e impedancia · potencia AC · máxima transferencia · RC/RL y filtros · respuesta en frecuencia | LTyA, FC I, Micro |
| `probabilidad.html` | eventos · v.a. discretas/continuas · gaussiana · media/varianza · función Q y erfc · procesos aleatorios (intro) | FC I |
| `electronica-digital.html` | numeración y complemento a 2 · lógica combinacional · flip-flops/registros/contadores · memorias y buses | Micro |
| `electronica-analogica.html` | transistor como interruptor · niveles lógicos · drivers y pull-up · ADC/DAC (intro) | Micro |
| `redes.html` | modelo OSI/TCP-IP · direccionamiento IP · UDP/TCP · Ethernet | Redes 3, Gestión |

## Estado

| Página | Estado |
|---|---|
| `index.html` (índice de repaso) | ✅ tarjetas |
| `matematica.html` | ✅ complejos · trig · logaritmos/dB · integrales · series · hiperbólicas · impulso · binario |
| `probabilidad.html` | ✅ discreta · va · gauss (+ calculadora Q) · procesos |
| `circuitos.html` | ✅ fasores · potencia · maxtrans · rc · filtros (+ Bode) |
| `electronica-digital.html` | ✅ numeracion · secuencial · tristate · memorias |
| `electronica-analogica.html` | ✅ transistor · niveles |
| `fisica-em.html`, `redes.html` | ⬜ |

Bibliografía verificada: Stewart (el PDF «…9naEd» es en realidad *Cálculo. Trascendentes tempranas*, 8ª ed., 2018; PDF = impresa + 31), Walpole 9ª 2012 (+22),
Hayt 8ª (+17), Tocci 10ª (+28), Boylestad 10ª (+19).

## Bitácora

- **2026-10-19** — Publicadas `matematica.html`, `probabilidad.html` y `circuitos.html` (ids: complejos, trig,
  logaritmos, integrales, series, hiperbolicas, impulso, binario · discreta, va, gauss, procesos · fasores,
  potencia, maxtrans, rc, filtros).
- **2026-10-18** — Creada la sección y la planificación de fichas.
