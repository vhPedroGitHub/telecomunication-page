# ltx — cálculos de Líneas de Transmisión

Paquete Python (≥ 3.9, sin dependencias) para los cálculos de la asignatura Líneas de Transmisión y
Antenas: coeficiente de reflexión, ROE, pérdidas de retorno, impedancia de entrada, γ y Z₀ a partir
de R, L, G, C, transformador λ/4 (también con cargas complejas) y su ancho de banda, stub simple
(paralelo/serie, corto/abierto), stub doble, transformadores binomial y de Chebyshev, sección
exponencial, guías rectangular y circular (modos, banda monomodo, λg, Z_TE, atenuación) y líneas
planares (microcinta: análisis, síntesis, dispersión, pérdidas; coplanar por transformación conforme).

Sirve de punto de partida para la tarea de software libre de la asignatura (el profesor recomienda
Octave o Scilab: las fórmulas de `ltx/*.py` se traducen casi línea a línea).

## Instalación

- **Linux / macOS**: `cd lineas-de-transmision-y-antena/software/ltx && python3 -m venv .venv && source .venv/bin/activate && pip install -e .`
- **Windows (PowerShell)**: `py -m venv .venv; .venv\Scripts\Activate.ps1; pip install -e .`
- Sin instalar: `python3 -m ltx …` desde esta carpeta.

## Uso (salidas reales)

```text
$ ltx carga 30+100j
z_L = 0.600 + j2.000   Γ = 0.7963∠49.97°   RL = 1.98 dB   ROE = 8.820
1.er máximo de |V| a 0.0694λ, 1.er mínimo a 0.3194λ de la carga
$ ltx carga 37.5+75j --z0 75 --l 0.32
z_L = 0.500 + j1.000   Γ = 0.6202∠82.87°   RL = 4.15 dB   ROE = 4.266
1.er máximo de |V| a 0.1151λ, 1.er mínimo a 0.3651λ de la carga
Z_in(0.3200λ) = 18.986 − j20.546 Ω
$ ltx rlgc 5 0.2e-6 0.01 300e-12 500e6
γ = 0.22592 + j24.3347  (α = 1.9624 dB/m)   Z0 = 25.820 + j0.034 Ω
$ ltx cuarto 10 --gm 0.2
a 0.0000λ de la carga: R = 10.00 Ω → Z_T = 22.36 Ω
a 0.2500λ de la carga: R = 250.00 Ω → Z_T = 111.80 Ω
Δf/f0 = 29.3 % (|Γ| ≤ 0.2)
$ ltx cuarto 300+100j --z0 550
a 0.2104λ de la carga: R = 1054.91 Ω → Z_T = 761.71 Ω
a 0.4604λ de la carga: R = 286.75 Ω → Z_T = 397.13 Ω
$ ltx stub 15+10j
solución 1: d = 0.0440λ, l = 0.1473λ (el stub aporta +1.329j)
solución 2: d = 0.3874λ, l = 0.3527λ (el stub aporta -1.329j)
$ ltx doble 60-80j
solución 1: b1 = -0.114 → l1 = 0.2319λ;  b2 = -1.380 → l2 = 0.0998λ
solución 2: b1 = +1.314 → l1 = 0.3965λ;  b2 = +3.380 → l2 = 0.4542λ
$ ltx cheb 60 120 --n 2 --gm 0.05
θm = 59.86°
Z1 = 73.16 Ω  Z2 = 98.42 Ω
Δf/f0 = 67.0 %
$ ltx binomial 50 100 --n 3
Z1 = 54.53 Ω  Z2 = 70.71 Ω  Z3 = 91.70 Ω
Δf/f0 = 70.3 %
$ ltx guia 1.07 0.43 --er 2.08 --f 15 --tand 0.0004
TE10  f_c =   9.713 GHz
TE20  f_c =  19.427 GHz
TE01  f_c =  24.171 GHz
TE11  f_c =  26.050 GHz
TM11  f_c =  26.050 GHz
TE30  f_c =  29.140 GHz
banda monomodo: 9.713 – 19.427 GHz
TE10 a 15 GHz: β = 345.50 rad/m, λg = 1.819 cm, Z_TE = 342.8 Ω, αd = 1.0336 dB/m, αc = 0.4331 dB/m (cobre)
$ ltx circular 1.2
TE11 7.320 GHz · TM01 9.563 GHz → banda monomodo 7.320 – 9.563 GHz
$ ltx micro --er 4.4 --h 1.6 --z 50 --f 2.4 --tand 0.02
W/h = 1.9119  W = 3.059 mm  εeff = 3.330  Z0 = 50.23 Ω  λg = 68.45 mm  αd = 7.220 dB/m  αc = 0.722 dB/m
$ ltx cpw --er 9.8 --s 0.25 --w 0.1 --h 0.635
εeff = 5.304  Z0 = 49.11 Ω
```

Impedancias complejas como `30+100j` (o `inf` para un circuito abierto); dimensiones de guía en cm,
de microcinta en mm, frecuencias de guía y microcinta en GHz.

## Pruebas

`python3 -m unittest discover -s tests` — comparan con los ejemplos de las conferencias (TI 4,
problema 2 de Smith, stub del encuentro 2A, Chebyshev del encuentro 2C) y de Pozar, 4.ª ed.
(ej. 3.1, 3.7, 5.2, 5.4, 5.5, 5.6).
