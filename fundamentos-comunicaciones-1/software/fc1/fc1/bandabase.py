"""Transmisión digital en banda base: función Q, PCM, modulación delta, Nyquist y probabilidad de error."""
import math


def Q(z):
    """Q(z) = 0.5·erfc(z/√2)."""
    return 0.5 * math.erfc(z / math.sqrt(2))


def Qinv(p):
    """Inversa de Q por bisección."""
    lo, hi = -40.0, 40.0
    for _ in range(200):
        m = (lo + hi) / 2
        if Q(m) > p:
            lo = m
        else:
            hi = m
    return (lo + hi) / 2


def snrq_db(n_bits, A_sobre_mp=1.0):
    """SNRq de una sinusoide: 1.76 + 6.02 n + 20 log(A/mp) dB."""
    return 1.76 + 6.02 * n_bits + 20 * math.log10(A_sobre_mp)


def cuantifica(x, n_bits, mp=1.0):
    """Cuantificador uniforme de media contrahuella en [-mp, mp]."""
    L = 2 ** n_bits
    d = 2 * mp / L
    k = max(-L // 2, min(L // 2 - 1, math.floor(x / d)))
    return (k + 0.5) * d


def modulador_delta(muestras, delta):
    """Devuelve (bits, escalera) partiendo del acumulador en 0."""
    acc, bits, esc = 0.0, [], []
    for x in muestras:
        b = 1 if x >= acc else 0
        acc += delta if b else -delta
        bits.append(b)
        esc.append(acc)
    return bits, esc


def rs_max_coseno_alzado(B, r):
    """Máxima velocidad de símbolos sin ISI: 2B/(1+r)."""
    return 2 * B / (1 + r)


def pe_umbral(s0, s1, sigma, VT=None, p0=0.5):
    """Probabilidad de error binaria con ruido gaussiano y umbral VT (por defecto, el punto medio)."""
    if VT is None:
        VT = (s0 + s1) / 2
    return p0 * Q((VT - s0) / sigma) + (1 - p0) * Q((s1 - VT) / sigma)


def pe_filtro_adaptado(Ed, N0):
    """Pe = Q(sqrt(Ed / 2N0)), Ed = energía de la diferencia s1 - s0."""
    return Q(math.sqrt(Ed / (2 * N0)))


def duobinario(bits, precodifica=False, ref=0):
    """Muestras c_k/A del duobinario polar (a = ±1) con bit de referencia inicial."""
    if precodifica:
        d, prev = [], ref
        for b in bits:
            prev = b ^ prev
            d.append(prev)
        bits = d
    a = [1 if b else -1 for b in bits]
    prev = 1 if ref else -1
    c = []
    for ak in a:
        c.append(ak + prev)
        prev = ak
    return c
