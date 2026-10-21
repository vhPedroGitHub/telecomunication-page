# AGENTS.md

Instrucciones para agentes. El **contrato principal es `CLAUDE.md`** (raíz: objetivo, plantilla
pedagógica de tema §6, derechos de autor §9, CI/CD §10); cada carpeta de asignatura tiene su
`CLAUDE.md` con inventario, tabla de estado y bitácora. Este archivo solo añade lo que es fácil
equivocarse.

## Qué es este repo

- Sitio estático **HTML + CSS + JS en español** (`lang="es"`), publicado en GitHub Pages.
  **Sin build, sin package.json, sin linter/typecheck/formatter.** La única CI es
  `.github/workflows/pages.yml`.
- Una carpeta por asignatura (`fundamentos-comunicaciones-1/`, `lineas-de-transmision-y-antena/`,
  `micro-controladores/`, `redes-3/`, `gestion-y-seguridad/`, `estudios-sociales-cyt/`), más
  `repaso/` y el portal `index.html` raíz. El mapa carpeta↔asignatura está en `README.md`.

## Comandos

```bash
python3 -m http.server 8000   # servir desde la RAÍZ del repo: todas las rutas son relativas
```

Tests (solo los paquetes Python auxiliares; **unittest, no pytest**; ejecutar dentro de la
carpeta del paquete — los tests importan el paquete por nombre desde el cwd):

```bash
cd fundamentos-comunicaciones-1/software/fc1   && python3 -m unittest discover -s tests
cd lineas-de-transmision-y-antena/software/ltx && python3 -m unittest discover -s tests
cd micro-controladores/software/mcs51calc      && python3 -m unittest discover -s tests
```

- `uv` está instalado (`uv run python -m fc1 --help`); los paquetes no tienen dependencias
  obligatorias (`fc1` tiene extra opcional `plot`: numpy + matplotlib).
- No existe paso de lint/verificación automática de HTML: la convención registrada en las
  bitácoras es **Chromium headless** (errores de JS/KaTeX en consola + desborde a 390 px) y
  comprobar enlaces externos (YouTube por oEmbed) antes de publicar.

## Cableado y arquitectura

- Código compartido: `assets/css/base.css` (tokens claro/oscuro), `assets/css/course.css`,
  `assets/js/theme.js` (cargado primero en `<head>`, sin `defer`), `assets/js/course.js`.
- `course.js` aporta: render KaTeX (CDN fijado a `katex@0.16.11`, se carga por página), índice
  lateral automático desde `h2[id]`/`h3[id]` dentro de `main.content`, quizzes, enlace
  slider→salida y un graficador en canvas que se redibuja al cambiar de tema. Contratos de
  marcado:
  - quiz: `<div class="quiz"><div class="q"><button class="opt" data-ok>…`
  - lectura de slider: `<input type="range" data-out>`
  - el índice requiere un envoltorio `<main class="content">` e ids en los encabezados.
- Profundidad de rutas variable: `index.html` de asignatura → `../assets/...`;
  `temas/*.html` → `../../assets/...`. Siempre relativas (el sitio vive bajo
  `https://<usuario>.github.io/<repo>/`, no en la raíz del dominio).
- Widgets propios de cada asignatura en `<asignatura>/js/` (p. ej. `lta.js`, `micro.js`,
  `sim8051.js`).

## Reglas duras (del CLAUDE.md raíz)

- Repo **público**; `.gitignore` bloquea `*.pdf`, `*.ppt*`, `*.doc*`, vídeos y comprimidos.
  Nunca copiar material fuente al repo: citarlo. **Las rutas de material fuente de CLAUDE.md §2
  (`/home/pedro/...`) no son legibles desde esta máquina**: si no puedes verificar una cita en
  el archivo fuente, no la agregues ni la cambies (nunca inventar citas).
- Librerías externas solo desde CDN con **versión exacta fija**.
- Al terminar cada sesión: actualizar el `CLAUDE.md` de la asignatura tocada (tabla de estado +
  bitácora) y el raíz si el cambio es global.
- Un tema nuevo debe seguir la plantilla de 11 secciones (CLAUDE.md raíz §6).
- Enlaces externos: verificar que existen (WebFetch/WebSearch) antes de publicarlos.

## Despliegue

- Cada push a `main` publica el repo entero vía rsync hacia `_site/`, excluyendo `.git`,
  `.github`, `_site`, `CLAUDE.md` y `**/CLAUDE.md`, `AGENTS.md`, `**/target`,
  `**/__pycache__`, `**/.venv`. Si añades otro fichero interno de instrucciones, añádelo
  también a esa lista de exclusiones en `.github/workflows/pages.yml`.
