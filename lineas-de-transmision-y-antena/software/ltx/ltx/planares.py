"""Líneas planares: microcinta (Pozar 3.8) y guía coplanar (Simons 2.2.3)."""
import math

C0 = 299792458.0
MU0 = 4e-7 * math.pi


def micro_eeff(er, w_d):
    """Permitividad efectiva cuasiestática, Pozar (3.195)."""
    return (er + 1) / 2 + (er - 1) / 2 / math.sqrt(1 + 12 / w_d)


def micro_z0(er, w_d):
    """Impedancia característica, Pozar (3.196)."""
    ee = micro_eeff(er, w_d)
    if w_d <= 1:
        return 60 / math.sqrt(ee) * math.log(8 / w_d + w_d / 4)
    return 120 * math.pi / (math.sqrt(ee) * (w_d + 1.393 + 0.667 * math.log(w_d + 1.444)))


def micro_sintesis(er, z0):
    """W/d para una Z0 dada, Pozar (3.197)."""
    A = z0 / 60 * math.sqrt((er + 1) / 2) + (er - 1) / (er + 1) * (0.23 + 0.11 / er)
    w = 8 * math.exp(A) / (math.exp(2 * A) - 2)
    if w < 2:
        return w
    B = 377 * math.pi / (2 * z0 * math.sqrt(er))
    return 2 / math.pi * (B - 1 - math.log(2 * B - 1) + (er - 1) / (2 * er) * (math.log(B - 1) + 0.39 - 0.61 / er))


def micro_eeff_f(er, w_d, d_cm, f_ghz):
    """Dispersión, Pozar (3.200): εe(f) = εr − (εr − εe(0))/(1 + G), G = g (f/fp)²."""
    e0 = micro_eeff(er, w_d)
    z0 = micro_z0(er, w_d)
    g = 0.6 + 0.009 * z0
    fp = z0 / (8 * math.pi * d_cm)
    return er - (er - e0) / (1 + g * (f_ghz / fp) ** 2)


def micro_perdidas(er, w_d, d, f, tand=0.0, sigma=5.813e7):
    """(αd, αc) en Np/m, Pozar (3.198) y (3.199); d en metros."""
    ee = micro_eeff(er, w_d)
    k0 = 2 * math.pi * f / C0
    ad = k0 * er * (ee - 1) * tand / (2 * math.sqrt(ee) * (er - 1))
    rs = math.sqrt(2 * math.pi * f * MU0 / (2 * sigma))
    ac = rs / (micro_z0(er, w_d) * w_d * d)
    return ad, ac


def _K(k):
    """Integral elíptica completa de 1.ª especie K(k) por la media aritmético-geométrica."""
    a, b = 1.0, math.sqrt(1 - k * k)
    for _ in range(40):
        a, b = (a + b) / 2, math.sqrt(a * b)
    return math.pi / (2 * a)


def cpw(er, S, W, h):
    """Coplanar convencional sobre sustrato de espesor h: (εeff, Z0), Simons (2.37)–(2.38)."""
    k1 = S / (S + 2 * W)
    k2 = math.sinh(math.pi * S / (4 * h)) / math.sinh(math.pi * (S + 2 * W) / (4 * h))
    kp = lambda k: math.sqrt(1 - k * k)
    ee = 1 + (er - 1) / 2 * _K(k2) * _K(kp(k1)) / (_K(kp(k2)) * _K(k1))
    z0 = 30 * math.pi / math.sqrt(ee) * _K(kp(k1)) / _K(k1)
    return ee, z0
