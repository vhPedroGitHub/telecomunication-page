"""Señales del Laboratorio Simulado 2 y su espectro (equivalente a las funciones MATLAB del curso).

Solo usa la biblioteca estándar; si numpy está instalado, foury() lo usa para ir más rápido.
"""
import cmath
import math


def cuadpuls(n_pulse, n_alto, n_bajo):
    """Tren de n_pulse semiperíodos: n_alto muestras a 1 y n_bajo muestras a 0 (como cuadpuls.m)."""
    s = []
    for w in range(n_pulse):
        s += [1.0] * n_alto if w % 2 == 0 else [0.0] * n_bajo
    return s


def triapuls(n_pulse, n_pos, n_neg, n_total):
    """Tren de triángulos: n_pos muestras de subida, n_neg de bajada, n_total por período (como triapuls.m)."""
    sub = [k / n_pos for k in range(n_pos)]
    baj = [k / n_neg for k in range(n_neg, 0, -1)]
    ceros = [0.0] * (n_total - n_pos - n_neg)
    return (sub + baj + ceros) * n_pulse


def un_pulse(n_total, n_pulso):
    """Un pulso de n_pulso muestras centrado en n_total muestras (como un_pulse.m)."""
    s = [0.0] * n_total
    o = n_total // 2 - math.ceil(n_pulso / 2) - 1
    for k in range(n_pulso):
        s[o + k] = 1.0
    return s


def _dft_mag(x):
    try:
        import numpy as np
        return list(np.abs(np.fft.fft(np.asarray(x, dtype=float))) / len(x))
    except ImportError:
        N = len(x)
        out = []
        for k in range(N):
            acc = 0j
            for n, v in enumerate(x):
                acc += v * cmath.exp(-2j * math.pi * k * n / N)
            out.append(abs(acc) / N)
        return out


def foury(x, fs, plot=False):
    """Espectro de amplitud bilateral de x muestreada a fs, como foury.m.

    Devuelve (freq, amp) con frecuencias de -fs/2 a +fs/2 (|FFT|/N, centrado).
    Con plot=True dibuja con matplotlib (pip install "fc1[plot]").
    """
    mag = _dft_mag(x)
    N = len(x)
    tam = N // 2
    right = mag[:tam]
    fpos = [k * fs / N for k in range(tam)]
    left = right[::-1][:-1]
    fneg = [-f for f in fpos[::-1][:-1]]
    freq, amp = fneg + fpos, left + right
    if plot:
        import matplotlib.pyplot as plt
        plt.plot(freq, amp)
        plt.xlabel("Frecuencia (Hz)")
        plt.ylabel("Amplitud")
        plt.grid(True, alpha=.3)
        plt.show()
    return freq, amp


def picos(freq, amp, umbral=0.05, n=8):
    """Líneas espectrales principales (f >= 0) por encima de umbral·máximo."""
    top = max(amp)
    res = []
    for i in range(1, len(amp) - 1):
        if freq[i] >= 0 and amp[i] >= amp[i - 1] and amp[i] >= amp[i + 1] and amp[i] > umbral * top:
            res.append((freq[i], amp[i]))
    if freq[0] >= 0 and amp[0] > umbral * top:
        res.append((freq[0], amp[0]))
    # la componente de DC está en el centro del vector
    i0 = freq.index(0.0) if 0.0 in freq else None
    if i0 is not None and (0.0, amp[i0]) not in res and amp[i0] > umbral * top:
        res.append((0.0, amp[i0]))
    return sorted(res, key=lambda p: -p[1])[:n]


def coef_tren_pulsos(A, tau, T0, n):
    """C_n = (A·tau/T0)·sinc(n·tau/T0) del tren de pulsos rectangulares centrado."""
    x = n * tau / T0
    s = 1.0 if x == 0 else math.sin(math.pi * x) / (math.pi * x)
    return A * tau / T0 * s
