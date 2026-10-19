# mcs51calc — calculadoras para el 8051

Herramienta de línea de órdenes (Python ≥ 3.9, sin dependencias) para el trabajo previo de las
clases prácticas y laboratorios de Microcontroladores.

## Instalación

- **Linux / macOS**: `cd micro-controladores/software/mcs51calc && python3 -m venv .venv && source .venv/bin/activate && pip install -e .`
- **Windows (PowerShell)**: `py -m venv .venv; .venv\Scripts\Activate.ps1; pip install -e .`
- Sin instalar: `python3 -m mcs51calc …` desde esta carpeta.

## Uso (salidas reales)

```text
$ mcs51calc timer 1s --cm 1us
Ciclos a contar: 1000000
  base 62500 ciclos (62.5000 ms) × 16 → recarga 0BDCh (TH=0Bh, TL=DCh)
  base 50000 ciclos (50.0000 ms) × 20 → recarga 3CB0h (TH=3Ch, TL=B0h)
  …
$ mcs51calc baud 9600 --fosc 11.0592
TH1 = 253.00 → 253 (FDh): BR real 9600.0 bps, error +0.00 %
$ mcs51calc baud 9600
TH1 = 252.74 → 253 (FDh): BR real 10416.7 bps, error +8.51 %
$ mcs51calc demora 10 200 250
1006035 ciclos → 1.006035 s
$ mcs51calc seg7
Tabla7Seg: db 40h,79h,24h,30h,19h,12h,02h,78h,00h,18h,08h,03h,46h,21h,06h,0Eh
$ mcs51calc ui 128 10 70
UI exacta = 40.118 · aproximada (÷2^8) = 40
$ mcs51calc led --iled 6
Activo en 1: R = 433 Ω · activo en 0: R = 447 Ω
```

Opciones: `timer --modo 1|2|0`, `baud --smod 1`, `seg7 --catodo --a-bit7 --dp`, `ui --bits 10`,
`led --vcc --vled --iled --voh --vol`.

## Pruebas

`python3 -m unittest discover -s tests` — comprueban los valores de las conferencias (3CB0h,
TH1 = 230, la demora de 1 006 035 ciclos medida en el simulador, la tabla de 7 segmentos de la C4a).
