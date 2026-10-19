"""Fórmulas del curso de Microcontroladores (8051 original, salvo que se indique otra cosa)."""
import re

_UNIDADES = {"ns": 1e-9, "us": 1e-6, "µs": 1e-6, "ms": 1e-3, "s": 1.0}
_MAX = {0: 8192, 1: 65536, 2: 256}
# segmentos encendidos (bit 0 = a … bit 6 = g) para 0..F
DIGITOS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x67, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71]


def parse_tiempo(s):
    """'1s', '50ms', '250us', '1.0851us' → segundos."""
    m = re.fullmatch(r"\s*([0-9]*\.?[0-9]+(?:e-?\d+)?)\s*(ns|us|µs|ms|s)?\s*", str(s))
    if not m:
        raise ValueError("tiempo no válido: %r" % s)
    return float(m.group(1)) * _UNIDADES[m.group(2) or "s"]


def timer_reload(ciclos, modo=1):
    """Valor inicial para que el timer desborde tras `ciclos` ciclos de máquina."""
    mx = _MAX[modo]
    if not 1 <= ciclos <= mx:
        raise ValueError("%d ciclos no caben en el modo %d (máximo %d)" % (ciclos, modo, mx))
    return mx - ciclos


def timer_postscaler(t, cm, modo=1, max_post=255):
    """Combinaciones exactas (base, postescalador, recarga) para el tiempo t con ciclo de máquina cm."""
    n = round(t / cm)
    mx = _MAX[modo]
    if n <= mx:
        return [(n, 1, mx - n)]
    out = []
    for base in range(mx, 0, -1):
        if n % base == 0 and n // base <= max_post:
            out.append((base, n // base, mx - base))
            if len(out) == 4:
                break
    return out


def baud_th1(br, fosc_mhz=12.0, smod=0):
    """(TH1 exacto, TH1 redondeado, BR real, error %) con el Timer 1 en modo 2."""
    k = 2 if smod else 1
    x = 256 - k * fosc_mhz * 1e6 / (384 * br)
    th = round(x)
    if not 0 <= th <= 255:
        raise ValueError("TH1 fuera de rango (%.2f)" % x)
    real = k * fosc_mhz * 1e6 / (384 * (256 - th))
    return x, th, real, (real - br) / br * 100


def baud_table(fosc_mhz=12.0, smod=0, rates=(300, 1200, 2400, 4800, 9600, 19200)):
    out = []
    for b in rates:
        try:
            out.append((b,) + baud_th1(b, fosc_mhz, smod)[1:])
        except ValueError:
            out.append((b, None, None, None))
    return out


def demora_ciclos(*cargas):
    """Ciclos de la rutina de demora con 1, 2 o 3 lazos djnz (incluye call y ret).
    Una carga 0 equivale a 256 vueltas."""
    c = [256 if v == 0 else v for v in cargas]
    if len(c) == 1:
        return 2 + 1 + 2 * c[0] + 2
    if len(c) == 2:
        b, r5 = c
        return 2 + 1 + b * (1 + 2 * r5 + 2) + 2
    if len(c) == 3:
        a, b, r5 = c
        return 2 + 1 + a * (1 + b * (3 + 2 * r5) + 2) + 2
    raise ValueError("de 1 a 3 lazos")


def seg7_tabla(anodo=True, a_en_bit0=True, dp_conectado=False):
    """Tabla de códigos 0..F. Por defecto: ánodo común, a → bit 0, bit 7 a 0 (como en el curso)."""
    tab = []
    for d in DIGITOS:
        v = 0
        for k in range(8):
            lit = (d >> k) & 1
            bit = k if a_en_bit0 else 7 - k
            if (not lit) if anodo else lit:
                v |= 1 << bit
        if anodo and not dp_conectado:
            v &= 0x7F if a_en_bit0 else 0xFE
        tab.append(v)
    return tab


def ui_desde_uc(uc, ui_min, ui_max, bits=8):
    """(UI exacta, UI aproximada con denominador 2^n)."""
    full = (1 << bits) - 1
    exacta = uc * (ui_max - ui_min) / full + ui_min
    aprox = (uc * (ui_max - ui_min)) // (full + 1) + ui_min
    return exacta, aprox


def resistencia_led(vcc=5.0, vled=2.0, iled=6e-3, voh=4.6, vol=0.32):
    """(R activo en 1, R activo en 0)."""
    return (voh - vled) / iled, (vcc - vled - vol) / iled
