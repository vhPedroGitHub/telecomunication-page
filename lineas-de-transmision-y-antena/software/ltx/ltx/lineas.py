"""Teoría general de líneas de transmisión (Pozar, cap. 2)."""
import cmath
import math

C0 = 299792458.0


def gamma_z0(R, L, G, C, f):
    """γ = α + jβ y Z0 a partir de los parámetros por unidad de longitud (2.5), (2.7)."""
    w = 2 * math.pi * f
    zs, yp = complex(R, w * L), complex(G, w * C)
    g = cmath.sqrt(zs * yp)
    if g.real < 0:
        g = -g
    return g, cmath.sqrt(zs / yp)


def reflexion(zl, z0):
    """Γ = (ZL − Z0)/(ZL + Z0); ZL = inf → Γ = 1."""
    if zl == math.inf:
        return 1 + 0j
    return (zl - z0) / (zl + z0)


def rl_db(g):
    """Pérdidas de retorno RL = −20 log|Γ| (dB)."""
    m = abs(g)
    return math.inf if m == 0 else -20 * math.log10(m)


def roe(g):
    m = abs(g)
    return math.inf if m >= 1 else (1 + m) / (1 - m)


def gamma_desde_roe(s):
    return (s - 1) / (s + 1)


def zin(zl, z0, bl, al=0.0):
    """Impedancia de entrada de una línea de longitud eléctrica βl (rad) y pérdidas αl (Np)."""
    gl = complex(al, bl)
    if zl == math.inf:
        return z0 / cmath.tanh(gl)
    t = cmath.tanh(gl)
    return z0 * (zl + z0 * t) / (z0 + zl * t)


def z_desde_gamma(g, z0):
    return math.inf if g == 1 else z0 * (1 + g) / (1 - g)


def gamma_en(g_l, l_lambda):
    """Γ a una distancia l (en λ) de la carga, hacia el generador (sin pérdidas)."""
    return g_l * cmath.exp(-1j * 4 * math.pi * l_lambda)


def dist_max_min(g):
    """Distancias (en λ) desde la carga al primer máximo y al primer mínimo de |V|."""
    th = cmath.phase(g) % (2 * math.pi)
    dmax = th / (4 * math.pi)
    dmin = (dmax + 0.25) % 0.5
    return dmax, dmin


def carga_desde_roe_dmin(s, dmin_lambda, z0):
    """Carga a partir de la ROE y la distancia al primer mínimo (Pozar, ej. 2.4)."""
    m = gamma_desde_roe(s)
    th = math.pi + 4 * math.pi * dmin_lambda
    return z_desde_gamma(m * cmath.exp(1j * th), z0)


def cuarto_onda(zl, z0):
    """Transformador λ/4 para carga real o compleja: lista de soluciones
    (distancia desde la carga en λ, R vista, Z del transformador)."""
    g = reflexion(zl, z0)
    s = roe(g)
    if abs(g) < 1e-12:
        return [(0.0, z0, z0)]
    dmax, dmin = dist_max_min(g)
    return sorted([(dmax, s * z0, math.sqrt(s * z0 * z0)), (dmin, z0 / s, math.sqrt(z0 * z0 / s))])


def cuarto_onda_bw(gm, zl, z0):
    """Ancho de banda fraccional del transformador λ/4 (TEM), Pozar (5.33)."""
    x = (gm / math.sqrt(1 - gm * gm)) * 2 * math.sqrt(z0 * zl) / abs(zl - z0)
    if x >= 1:
        return 2.0
    return 2 - (4 / math.pi) * math.acos(x)


def lambda_m(f, er=1.0):
    return C0 / (f * math.sqrt(er))
