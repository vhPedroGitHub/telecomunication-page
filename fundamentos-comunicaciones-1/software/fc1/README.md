# fc1 — herramientas de Fundamentos de las Comunicaciones I

Paquete Python didáctico que reproduce los cálculos de las clases prácticas y del Laboratorio
Simulado 2, para comprobar ejercicios a mano:

| Módulo | Qué hace |
|---|---|
| `fc1.senales` | `foury`, `cuadpuls`, `triapuls`, `un_pulse`: equivalentes de las funciones MATLAB del Lab. Simulado 2; coeficientes del tren de pulsos |
| `fc1.info` | información, entropía, Huffman (mínima varianza o no), eficiencia y varianza, LZ78 |
| `fc1.canal` | capacidad del BSC y de Shannon-Hartley, código de repetición, códigos lineales de bloque (Hamming (7,4) de la CP 3), codificador convolucional y Viterbi |
| `fc1.bandabase` | función Q y su inversa, cuantificación y SNRq, modulación delta, Nyquist, probabilidad de error con umbral y con filtro adaptado, duobinario |

No tiene dependencias obligatorias (solo la biblioteca estándar de Python ≥ 3.9). Para dibujar
espectros con `--plot` instala el extra `plot` (numpy + matplotlib).

## Instalación

### Linux / macOS

```bash
cd fundamentos-comunicaciones-1/software/fc1
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[plot]"      # o: pip install -e .   (sin gráficas)
```

Con [uv](https://docs.astral.sh/uv/) no hace falta crear el entorno: `uv run python -m fc1 --help`.

### Windows (PowerShell)

```powershell
cd fundamentos-comunicaciones-1\software\fc1
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[plot]"
```

Sin instalar nada también funciona desde la carpeta `fc1/`: `python -m fc1 ...`.

## Uso

```text
$ python -m fc1 huffman 0.4 0.2 0.2 0.1 0.1
  s1  p = 0.4      00
  s2  p = 0.2      10
  s3  p = 0.2      11
  s4  p = 0.1      010
  s5  p = 0.1      011
H = 2.1219   L = 2.2000   eficiencia = 0.9645   varianza = 0.1600

$ python -m fc1 entropia 1/3 1/6 1/4 1/4
H = 1.9591 bit/símbolo

$ python -m fc1 hamming 1010
palabra: 1010011

$ python -m fc1 hamming 1110110
síndrome: 010 | error en bit: 6 | corregida: 1110100 | mensaje: 1110

$ python -m fc1 conv --g 111,101 10011
11 10 11 11 01 01 11

$ python -m fc1 viterbi --g 111,101 0100010000
decodificado: 00000 | métrica: 2

$ python -m fc1 pe --s1 2 --sigma 0.7071 --vt 1.5
Pe = 1.2835e-01

$ python -m fc1 foury cuadpuls 10 100 100 --fs 100
N = 1000 muestras, fs = 100.0 Hz, resolución = 0.1 Hz
           0 Hz  ->  0.5000
         0.5 Hz  ->  0.3183
         1.5 Hz  ->  0.1061
...

$ python -m fc1 lz78 ABABABA
```

Desde Python:

```python
from fc1 import info, canal, bandabase as bb
info.huffman([1/4, 1/2, 1/8, 1/16, 1/32, 1/32])      # ['01', '1', '001', '0001', '00000', '00001']
canal.Convolucional("101", "111", "111").viterbi("001001001001")   # ([0, 0, 0, 0], 4)
bb.pe_filtro_adaptado(Ed=4e-5, N0=1e-6)               # 3.87e-06  (CP 18)
```

## Pruebas

```bash
python -m unittest discover -s tests -v
```

Las pruebas comprueban los resultados de los ejemplos resueltos de la página (CP 3, CP 16–18,
ejercicio de Huffman, modelo de PP1, Conferencia 6).
