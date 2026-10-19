# Gestión y Seguridad de Redes de Telecomunicaciones

> Lee primero el `CLAUDE.md` raíz (reglas generales, plantilla de tema, derechos de autor).
> **Actualiza este archivo al final de cada sesión**: tabla de estado, pendientes y bitácora.

## Contexto

- Asignatura centrada en la **gestión de redes** (por ahora; la parte de seguridad no tiene materiales aún).
- Evaluación con fuerte componente de **seminarios** y **ensayos críticos** (temas con "observación de
  partida" y preguntas guía, p. ej. "La paradoja del control", "La evolución de la gestión: ¿progreso
  técnico o huida hacia adelante?"). El sitio debe ayudar a argumentar, no solo a memorizar.

## Materiales fuente (`/home/pedro/studies/Carrera/4to-1er-Semestre/Gestion y Seguridad/`)

| Carpeta | Contenido |
|---|---|
| `01-Conferencias/` | Conf 1 Introducción (2025) · Conf 2 Funcionalidades de la GR · Conf 3 Áreas funcionales · Conf 4 Evolución · Conf 5–7 Gestión de Internet (1ra parte, 2da parte, final) · Conf 8 Tecnología de gestión (`Ver Conf 8 …`) |
| `03-Laboratorios/` | Lab 1 Paradigma gestor-agente · Lab 2 Exploración de MIB |
| `04-Evaluaciones-y-Tareas/Seminarios/` | Orientación Seminario 1 "Proyecto, organización y Sistema Integrado de Gestión de Redes (SIGR)" (caso real de una entidad) · Orientación Seminario 2 "Modelos de gestión normalizados o integrados" |
| `04-Evaluaciones-y-Tareas/Ensayos/` | Propuestas de ensayos parte I (clase 1) y parte II |

Sin bibliografía en la carpeta.

## Temario a cubrir (verificar con las conferencias)

1. Introducción: concepto de gestión de redes, proyecto de gestión, SIGR, procedimientos de trabajo.
2. Funcionalidades de la gestión de redes.
3. Áreas funcionales (modelo **FCAPS** de ISO/ITU-T: fallos, configuración, contabilidad, prestaciones, seguridad).
4. Evolución de la gestión: local, homogénea, heterogénea, integrada, autonómica.
5. Gestión de Internet: paradigma gestor-agente, **SNMP** (v1/v2c/v3), SMI, **MIB-II**, OIDs, RMON.
6. Tecnologías de gestión (TMN, CMIP, NETCONF/YANG, gNMI/telemetría…).
7. Seguridad de redes (pendiente de materiales).

## Prerrequisitos a repasar

- Modelo OSI/TCP-IP, UDP, direccionamiento IP → `cursos/04-Redes/`.
- Nociones de ASN.1 / estructuras de datos jerárquicas (árbol de OIDs).

## Ideas de interactivos / software

- Árbol MIB navegable (iso.org.dod.internet.mgmt.mib-2…) con OIDs y descripción.
- Simulación animada gestor ↔ agente (GET, GETNEXT, SET, TRAP) con PDUs.
- Software: mini-explorador SNMP en Python (`pysnmp`) o Go (`gosnmp`) + guía de `net-snmp`
  (snmpwalk/snmpget) y de un agente de prueba en Linux.
- Guía para estructurar ensayos y seminarios (rúbrica, fuentes RFC e ITU-T M.3000/X.700).

## Estado

| Tema | Teoría | Interactivo | Ejemplos | Ejercicios | LAB/Seminario | Biblio | Links | FAQ |
|---|---|---|---|---|---|---|---|---|
| 1 Introducción / SIGR | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ (Sem. 1) | ⬜ | ⬜ | ⬜ |
| 2 Funcionalidades | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 Áreas funcionales | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 Evolución | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ (Sem. 2) | ⬜ | ⬜ | ⬜ |
| 5 Gestión de Internet / SNMP / MIB | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ (Lab 1, 2) | ⬜ | ⬜ | ⬜ |
| 6 Tecnologías de gestión | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 Seguridad | ⛔ | | | | | | | |
| Ensayos (guía y temas) | ⬜ | | | | | | | |

## Pendientes y dudas

- Convertir las 8 `.ppt` a texto y extraer el temario real.
- Proponer bibliografía verificable (RFC 1157, 3411–3418, 1213; Stallings *SNMP, SNMPv2, SNMPv3 and RMON*;
  ITU-T M.3010, X.700) con secciones exactas.

## Bitácora

- **2026-10-18** — Reorganización: conferencias a `01-Conferencias/`, laboratorios a `03-Laboratorios/`,
  orientaciones de seminario y propuestas de ensayo a `04-Evaluaciones-y-Tareas/`.
