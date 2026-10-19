# Telecomunicaciones 4to año · 1er semestre — Monorepo web

> Este archivo es el **contrato general** del proyecto. Cada asignatura tiene además su propio
> `CLAUDE.md` con el contexto, el inventario de materiales y el **estado de avance**.
> **Regla de oro:** al terminar cualquier sesión de trabajo, actualiza el `CLAUDE.md` de la
> asignatura tocada (tabla de estado + bitácora) y, si cambió algo global, también este.

## 1. Objetivo

Convertir las conferencias, clases prácticas, laboratorios, evaluaciones y bibliografía de las
asignaturas del semestre en **sitios web didácticos** publicados en GitHub Pages.

No se trata de "subir" los materiales: hay que **estudiarlos como un profesor experimentado** y
producir algo mejor que el original para un estudiante universitario de Telecomunicaciones:

1. Contenido **organizado, bien explicado y completo**: no se puede omitir ningún tema que
   aparezca en conferencias, CP, laboratorios o evaluaciones.
2. **Animaciones e interactivos** (simuladores, gráficas manipulables, pasos animados).
3. **Ejemplos resueltos** paso a paso y **ejercicios propuestos con solución desplegable**.
4. **Guías** de cada clase práctica y laboratorio (qué se pide, cómo resolverlo, errores típicos).
5. **Bibliografía exacta**: libro + edición + capítulo + epígrafe + páginas donde se aborda cada tema.
6. **Enlaces complementarios**: artículos científicos/técnicos, documentación, normas (ITU-T, IEEE,
   RFC) y vídeos de YouTube.
7. **Software complementario** (Python, Go o Rust) con instrucciones de instalación y uso en la página.
8. **Sección de preguntas y respuestas (FAQ)** por tema y por asignatura.
9. **Prerrequisitos**: los profesores suelen dar por sabidos conceptos de matemática, física,
   probabilidad/estadística, circuitos o electrónica. Cada tema debe tener un recuadro breve
   "Antes de empezar" que **recuerde** esos conceptos (2–6 líneas + fórmula clave) y **remita** a la
   página de repaso correspondiente en `/repaso/`. No hace falta profundizar, solo refrescar.

## 2. Ubicaciones

| Qué | Ruta |
|---|---|
| Repo (este monorepo, se publica) | `/home/pedro/studies/Carrera/4to-1er-Semestre/telecomunication-page/` |
| Materiales fuente del semestre (NO se publican) | `/home/pedro/studies/Carrera/4to-1er-Semestre/<Asignatura>/` |
| Materiales de asignaturas básicas (prerrequisitos) | `/home/pedro/studies/Carrera/cursos/` |
| Respaldo de los antiguos repos git anidados | `/home/pedro/studies/Carrera/.git-backups/` |

### Asignatura → materiales → sitio

| Asignatura | Materiales fuente (`../`) | Carpeta web | Remitir prerrequisitos a |
|---|---|---|---|
| Fundamentos de las Comunicaciones I | `Fundamentos de las Comunicaciones 1/` | `fundamentos-comunicaciones-1/` | `cursos/02-Matemática`, `cursos/08-Probabilidad-Estadística`, `cursos/07-Circuito` |
| Líneas de Transmisión y Antenas | `Lineas de Transmision y Antena/` | `lineas-de-transmision-y-antena/` | `cursos/10-TC` (Electrodinámica, Radiopropagación), `cursos/02-Matemática`, `cursos/07-Circuito` |
| Microcontroladores (Microprocesadores I) | `Micro/` | `micro-controladores/` | `cursos/06-ElecD`, `cursos/05-ElecA`, `cursos/07-Circuito` |
| Redes 3 (Fibra óptica, acceso y transporte) | `Redes 3/` | `redes-3/` | `cursos/04-Redes`, `cursos/10-TC`, `cursos/09-FC` |
| Gestión y Seguridad de Redes | `Gestion y Seguridad/` | `gestion-y-seguridad/` | `cursos/04-Redes` |
| Estudios Sociales de la Ciencia y la Tecnología | `Estudios Sociales de la Ciencia y la Tecnologia/` (vacía aún) | `estudios-sociales-cyt/` | — |
| Repaso de prerrequisitos (transversal) | `/home/pedro/studies/Carrera/cursos/` | `repaso/` | — |

`Horario_4to_anno_por_semana.xlsx` (en la carpeta del semestre) contiene el horario general.

## 3. Estructura estándar de los materiales fuente

Cada carpeta de asignatura en `4to-1er-Semestre/` sigue este esquema (solo existen las
subcarpetas que tienen contenido). Si llegan materiales nuevos, **colócalos aquí** y anota el
cambio en el `CLAUDE.md` de la asignatura:

```
00-Programa-y-Planificacion   programa analítico, P1, cronogramas, presentación de la asignatura
01-Conferencias               conferencias / encuentros (Edicion-anterior/ si hay versiones viejas)
02-Clases-Practicas           CP y ejercicios
03-Laboratorios               guías de laboratorio (reales o simulados)
04-Evaluaciones-y-Tareas      pruebas parciales, tareas, seminarios, ensayos
05-Bibliografia               libros y manuales
06-Software                   instaladores y herramientas
07-Videos                     grabaciones de clases
08-Complementarios            resúmenes, ejemplos resueltos, apuntes, extras
```

## 4. Estructura del repo

```
telecomunication-page/
├── CLAUDE.md                     ← este archivo
├── README.md
├── index.html                    ← portal: tarjetas a cada asignatura + repaso
├── assets/css/base.css           ← tokens de diseño compartidos (claro/oscuro)
├── assets/js/                    ← utilidades compartidas (temas, quizzes, KaTeX, etc.)
├── repaso/                       ← páginas de repaso de prerrequisitos (matemática, física, probabilidad…)
├── <asignatura>/
│   ├── CLAUDE.md                 ← contexto + inventario + ESTADO de la asignatura
│   ├── index.html                ← página principal de la asignatura
│   ├── temas/                    ← (opcional) una página por tema si index.html crece demasiado
│   ├── css/ js/ img/             ← recursos propios de la asignatura
│   └── software/<herramienta>/   ← código Python/Go/Rust complementario
└── .github/workflows/pages.yml   ← CI/CD: publica en GitHub Pages en cada push a main
```

## 5. Cómo trabajar una asignatura (flujo)

1. **Leer el `CLAUDE.md` de la asignatura** para saber qué está hecho y qué falta.
2. **Extraer el texto** de los materiales (en el scratchpad, nunca dentro del repo):
   - PDF: `pdftotext -layout archivo.pdf -` (usar `-f N -l M` para rangos de páginas).
   - DOC/DOCX/PPT/RTF: `soffice --headless --convert-to txt:Text --outdir <scratch> archivo`
     (PPT/PPTX: `--convert-to pdf` y luego `pdftotext`).
   - PPTX rápido: `unzip -p archivo.pptx 'ppt/slides/*.xml' | sed 's/<[^>]*>/ /g'`.
   - RAR/ZIP: `7z x -o<scratch> archivo.rar`.
   - Imágenes y figuras: leerlas con la herramienta de lectura de imágenes cuando sean relevantes.
3. **Cubrir todo**: cruzar conferencias ↔ CP ↔ laboratorios ↔ evaluaciones ↔ programa analítico.
   Si un tema aparece en una prueba o CP pero no en una conferencia, igualmente se explica.
4. **Bibliografía**: buscar el tema en los PDF de `05-Bibliografia` con `pdftotext` + `grep`, y
   citar **capítulo, epígrafe (sección) y páginas impresas del libro** (no el número de página del
   visor PDF; si difieren, indicar ambos: "pp. 45–52 (PDF p. 67)"). Nunca inventar una cita: si no se
   verificó en el PDF, no se pone.
5. **Enlaces externos**: verificar que existen (WebFetch/WebSearch) antes de publicarlos. Preferir
   fuentes estables: MIT OCW, NPTEL, documentación oficial, IEEE Xplore/arXiv (DOI), normas ITU-T/RFC,
   canales de YouTube universitarios o reconocidos.
6. **Escribir la página** siguiendo la plantilla de tema (sección 6).
7. **Actualizar el `CLAUDE.md`** de la asignatura (tabla de estado + bitácora + pendientes).
8. Commit con mensaje claro; el push a `main` publica automáticamente.

## 6. Plantilla pedagógica de cada tema

Cada tema (sección o página) debe tener, en este orden:

1. **Objetivos** del tema (tomados del programa analítico cuando exista).
2. **Antes de empezar** (prerrequisitos): recordatorio breve + enlace a `/repaso/...`.
3. **Desarrollo teórico** con intuición física primero y luego el formalismo (fórmulas con KaTeX).
4. **Interactivo/animación**: al menos uno por tema cuando tenga sentido (canvas/SVG/JS).
5. **Ejemplos resueltos** paso a paso (incluir los de las conferencias y CP, mejor explicados).
6. **Ejercicios propuestos** con respuesta/solución desplegable (`<details>`).
7. **Guía de CP / laboratorio** asociada: objetivos, procedimiento, cálculos, errores típicos.
8. **Dónde estudiarlo** (bibliografía exacta) — tabla Libro | Cap. | Epígrafe | Páginas.
9. **Para profundizar**: artículos, normas, vídeos de YouTube (con duración y qué parte ver).
10. **Preguntas frecuentes** del tema.
11. **Origen**: qué materiales fuente se usaron (p. ej. "Conf. C11, CP5, LAB5").

Además, cada asignatura tiene: portada con el plan de la asignatura (cronograma/encuentros),
sistema de evaluación, índice de temas, sección de **software** (instalación paso a paso) y
**FAQ general**.

## 7. Software complementario (Python / Go / Rust)

- Va en `<asignatura>/software/<nombre-herramienta>/` con su propio `README.md`.
- Debe resolver una necesidad real del curso (p. ej. calculadora de carta de Smith, simulador de
  Huffman/Hamming, ensamblador/simulador 8051 didáctico, calculadora de presupuesto de enlace óptico,
  explorador SNMP/MIB).
- La página de la asignatura explica: qué hace, requisitos, **instalación paso a paso por SO**
  (Linux / Windows / macOS), ejemplo de uso con salida esperada.
- Python: `pyproject.toml` o `requirements.txt`, ejecutable con `python -m` o `uv run`.
- Go: módulo con `go.mod`, `go run .` / `go build`.
- Rust: `cargo` con `Cargo.toml`, `cargo run --release`.
- Cuando sea viable, ofrecer también una versión web (JS o WASM) para usarla sin instalar nada.

## 8. Reglas técnicas del sitio

- **HTML + CSS + JS sin paso de compilación** (GitHub Pages sirve los archivos tal cual).
- Español, `lang="es"`, UTF-8, diseño responsive (usable en móvil), modo claro/oscuro.
- Colores como variables CSS (`assets/css/base.css`); cada asignatura puede tener su color de acento.
- Librerías externas solo desde CDN con **versión exacta** (p. ej. `katex@0.16.11`,
  `chart.js@4.4.4`, `plotly.js-dist-min@2.35.2`, `mermaid@11.4.0`); nada sin versión fija.
- Fórmulas con KaTeX. Gráficas con canvas/SVG propio o Chart.js/Plotly.
- Rutas **relativas** (el sitio vive en `https://<usuario>.github.io/<repo>/`).
- Accesibilidad: textos alternativos, contraste suficiente, navegable con teclado.

## 9. Derechos de autor y tamaño — QUÉ NO SE SUBE

El repo es **público**. Los materiales fuente están **fuera** del repo a propósito:

- **Nunca** copiar al repo libros, PDFs de conferencias, vídeos de clase ni pruebas de otros
  estudiantes (derechos de autor + 3 GB+ de tamaño). El sitio se construye con contenido
  **propio** (explicaciones, figuras, código) y cita las fuentes.
- Se pueden reproducir fragmentos cortos (enunciados de ejercicios, una tabla) citando la fuente.
- Los datos personales de estudiantes (nombres, números en pruebas) no se publican.
- `.gitignore` bloquea `*.pdf`, `*.ppt*`, `*.doc*`, vídeos y archivos comprimidos por seguridad.
  Si alguna vez hace falta publicar un PDF propio, añadir una excepción explícita.

## 10. CI/CD

`.github/workflows/pages.yml` publica el contenido del repo en GitHub Pages en cada push a `main`
(y manualmente con *workflow_dispatch*). Requisito único en GitHub:
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## 11. Estado global

| Asignatura | Estado | Notas |
|---|---|---|
| Líneas de Transmisión y Antenas | 🟡 iniciada | `index.html` con Tema I (teoría general de LTx, carta de Smith interactiva, λ/4) |
| Microcontroladores | ⬜ pendiente | solo estructura |
| Fundamentos de las Comunicaciones I | 🟡 casi completa | Temas I–III con 20 simuladores + `software/fc1`; faltan Conf. 14, más variantes de PP |
| Redes 3 | ⬜ pendiente | solo estructura |
| Gestión y Seguridad de Redes | ⬜ pendiente | solo estructura |
| Estudios Sociales de la CyT | ⛔ sin materiales | carpeta fuente vacía |
| Repaso de prerrequisitos | 🟡 iniciada | matemática, probabilidad, circuitos |
| Portal raíz + CI/CD | ✅ hecho | `index.html`, `assets/css/base.css`, workflow |

Leyenda: ✅ completo · 🟡 en progreso · ⬜ pendiente · ⛔ bloqueado.

## 12. Bitácora global

- **2026-10-19** — Infraestructura común: `assets/css/course.css` y `assets/js/course.js` (KaTeX 0.16.11
  con macros, índice lateral automático, quiz, graficador canvas que respeta el tema). FC I completa
  (ver su CLAUDE.md). Fichas de repaso. Verificación: Chromium headless (errores JS/KaTeX, desborde en
  390 px) y comprobación de enlaces (YouTube por oEmbed).
- **2026-10-18** — Reformulación del proyecto: de una página única (Micro) a monorepo de todo el
  semestre. Se reorganizaron los materiales fuente con el esquema `00…08` (detalle en cada
  `CLAUDE.md`), se eliminaron duplicados exactos, se movieron los `.git` anidados de
  `lineas-de-transmision-y-antena/` y `micro-controladores/` a `/home/pedro/studies/Carrera/.git-backups/`
  y se inicializó el repo git en esta carpeta con el workflow de Pages.
