# Cálculo diferencial e integral (curso complementario)

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- **Curso complementario propio**, no ligado a una carpeta de materiales del semestre. Nace de la
  petición de crear un curso de matemática dividido en **límites, derivadas e integrales**, con
  teoría, teoremas y ejercicios con respuesta (2026-10-21).
- **Público:** estudiantes de ingeniería que necesitan el cálculo de una variable como base para
  las asignaturas del semestre (señales, campos, circuitos, probabilidad).
- **Enfoque:** una variable, nivel universitario inicial. Cada bloque sigue la plantilla de 11
  secciones del `CLAUDE.md` raíz adaptada a un curso sin materiales fuente: objetivos,
  prerrequisitos, teoría, interactivo, ejemplos resueltos, ejercicios con solución, guía de
  estudio, bibliografía, recursos, FAQ y origen.
- **No hay materiales fuente locales:** todo el contenido es elaboración propia basada en el
  temario estándar de cálculo. No se copian libros ni se inventan citas de páginas; la bibliografía
  se cita por capítulo y epígrafe.

## Estructura del sitio

| Archivo | Contenido |
|---|---|
| `index.html` | portada: los tres bloques, cómo estudiar, prerrequisitos, notación, autoevaluación de entrada, bibliografía y FAQ |
| `temas/limites.html` | límites: idea, laterales, ε–δ, álgebra, indeterminaciones, infinito, trigonométricos y \(e\), continuidad, Bolzano y Weierstrass, 12 ejercicios |
| `temas/derivadas.html` | derivadas: definición, derivabilidad/continuidad, reglas, tabla de derivadas comunes, cadena, implícita, logarítmica, inversa, Rolle/MVT/L'Hôpital/Taylor, aplicaciones, 15 ejercicios |
| `temas/integrales.html` | integrales: antiderivada, propiedades, tabla inmediata, teorema fundamental, sustitución, partes, trigonométricas, sustitución trigonométrica, fracciones parciales, impropias, numéricas, aplicaciones, 14 ejercicios |

Interactivos en `../assets/js/calculo.js` (cargado después de `course.js`):

| Simulador | Página | Qué muestra |
|---|---|---|
| Explorador de límites | límites | \(f(x)\) al acercarse a \(a\), hueco, laterales y límite inexistente |
| Secante → tangente | derivadas | cociente incremental frente a \(f'(a)\) al mover \(a\) y \(h\) |
| Sumas de Riemann | integrales | rectángulos izquierda/medio/derecha, suma, integral exacta y error |

## Bibliografía

- J. Stewart, *Cálculo de una variable: trascendentes tempranas*, 8.ª ed., Cengage, 2018.
  Cap. 2 (límites), 3 (derivadas), 4 (aplicaciones), 5 (integrales), 7 (técnicas).
- G. B. Thomas, *Cálculo: una variable*, 12.ª ed., Pearson, 2010.
- M. Spivak, *Calculus*, 4.ª ed., Publish or Perish, 2008.
- OpenStax, *Calculus Volume 1*, 2.ª ed., Rice University, 2023 (abierto).
- MIT OpenCourseWare, *18.01 Single Variable Calculus* (vídeos y apuntes).

## Estado

| Bloque | Teoría | Teoremas | Tablas/reglas | Interactivo | Ejemplos | Ejercicios | Biblio | Recursos | FAQ |
|---|---|---|---|---|---|---|---|---|---|
| 1 Límites y continuidad | ✅ | ✅ | ✅ | ✅ | ✅ 9 | ✅ 12 | ✅ | ✅ | ✅ |
| 2 Derivadas | ✅ | ✅ | ✅ | ✅ | ✅ 12 | ✅ 15 | ✅ | ✅ | ✅ |
| 3 Integrales | ✅ | ✅ | ✅ | ✅ | ✅ 10 | ✅ 14 | ✅ | ✅ | ✅ |
| Portada + autoevaluación | ✅ | | | | | | ✅ | | ✅ |

Leyenda: ✅ completo · 🟡 en progreso · ⬜ pendiente.

## Verificación

- Chromium headless (Playwright) sobre las 4 páginas: sin errores de consola, sin errores de KaTeX,
  sin desborde horizontal a 390 px y con los tres simuladores respondiendo a los controles.
- Enlaces externos comprobados: OpenStax, MIT OCW y Khan Academy.
- Fechas de la sesión: 2026-10-21.

## Pendientes y dudas

- Añadir más ejercicios de optimización y de integrales impropias con parámetros.
- Valorar un paquete Python `calculo` (derivación simbólica didáctica, sumas de Riemann y
  comprobación de primitivas) si se pide software complementario.
- Valorar figuras SVG propias para la interpretación ε–δ y para las áreas entre curvas.
- Confirmar el nivel de rigor deseado: la página incluye demostraciones breves e ideas, pero no
  sustituye un curso formal de análisis.

## Bitácora

- **2026-10-21** — Curso creado: portada + tres bloques completos, 3 simuladores en
  `assets/js/calculo.js`, acento `--c-calculo`, tarjeta en el portal raíz, fila en `README.md` y
  actualización del `CLAUDE.md` raíz. Verificado en Chromium headless (consola, KaTeX y 390 px).
  Bibliografía por capítulo y epígrafe; recursos abiertos verificados.
