# Telecomunicaciones · 4to año, 1er semestre

Sitio de estudio interactivo con las asignaturas del semestre: teoría explicada, animaciones,
ejemplos resueltos, guías de clases prácticas y laboratorios, bibliografía con capítulo y página,
software complementario y preguntas frecuentes.

| Asignatura | Carpeta |
|---|---|
| Fundamentos de las Comunicaciones I | [`fundamentos-comunicaciones-1/`](fundamentos-comunicaciones-1/) |
| Líneas de Transmisión y Antenas | [`lineas-de-transmision-y-antena/`](lineas-de-transmision-y-antena/) |
| Microcontroladores (8051) | [`micro-controladores/`](micro-controladores/) |
| Redes 3 | [`redes-3/`](redes-3/) |
| Gestión y Seguridad de Redes | [`gestion-y-seguridad/`](gestion-y-seguridad/) |
| Estudios Sociales de la CyT | [`estudios-sociales-cyt/`](estudios-sociales-cyt/) |
| Repaso de prerrequisitos | [`repaso/`](repaso/) |

## Ver en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicación

Cada push a `main` publica el sitio con GitHub Actions (`.github/workflows/pages.yml`).
En GitHub: **Settings → Pages → Source: GitHub Actions**.

El material original de los profesores (libros, presentaciones, vídeos) no se incluye en el
repositorio; el sitio contiene explicaciones propias y cita sus fuentes.
