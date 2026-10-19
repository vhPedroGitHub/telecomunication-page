"""Adaptación con stubs simples y dobles (Pozar 5.2 y 5.3). Longitudes en λ."""
import math
from .lineas import reflexion


def _len_stub(x, abierto):
    """Longitud (λ) de un stub de Z0 cuya admitancia (paralelo) o impedancia (serie)
    normalizada sea j·x. Para paralelo: abierto → jb = j tan βl; corto → −j cot βl."""
    if abierto:
        bl = math.atan(x)
    else:
        bl = math.atan2(-1, x) if x != 0 else math.pi / 2
    return (bl / (2 * math.pi)) % 0.5


def _transforma(y, d):
    """Admitancia normalizada vista a una distancia d (λ) hacia el generador."""
    t = math.tan(2 * math.pi * d)
    return (y + 1j * t) / (1 + 1j * y * t)


def _raices(f, a, b, n=4000):
    """Raíces de f en [a, b) por cambio de signo + bisección."""
    out, xs = [], [a + (b - a) * k / n for k in range(n + 1)]
    for x0, x1 in zip(xs, xs[1:]):
        f0, f1 = f(x0), f(x1)
        if f0 == 0:
            out.append(x0)
        elif f0 * f1 < 0:
            for _ in range(80):
                xm = (x0 + x1) / 2
                if f0 * f(xm) <= 0:
                    x1 = xm
                else:
                    x0, f0 = xm, f(xm)
            out.append((x0 + x1) / 2)
    return out


def stub_simple(zl, z0, paralelo=True, abierto=True):
    """Dos soluciones [(d, l, b)]: d = distancia carga→stub (λ), l = longitud del stub (λ),
    b = susceptancia (paralelo) o reactancia (serie) normalizada que aporta el stub."""
    w0 = z0 / complex(zl) if paralelo else complex(zl) / z0   # y o z normalizada
    tr = lambda d: _transforma(w0, d)                          # misma ley para y y para z
    sols = []
    for d in _raices(lambda d: tr(d).real - 1, 0.0, 0.5):
        need = -tr(d).imag
        l = _len_stub(need, abierto) if paralelo else _len_stub_serie(need, abierto)
        sols.append((d % 0.5, l, need))
    return sorted(sols)


def _len_stub_serie(x, abierto):
    """Stub serie: corto → z = j tan βl; abierto → z = −j cot βl."""
    if not abierto:
        bl = math.atan(x)
    else:
        bl = math.atan2(-1, x) if x != 0 else math.pi / 2
    return (bl / (2 * math.pi)) % 0.5


def stub_doble(zl, z0, d=0.125, abierto=False, dprima=0.0):
    """Doble stub en paralelo separado d (λ); el primero a d' de la carga (d' = 0: en la carga).
    Devuelve [(l1, l2, b1, b2)] (vacía si yL cae en la zona prohibida)."""
    y = _transforma(z0 / complex(zl), dprima) if dprima else z0 / complex(zl)
    f = lambda b1: _transforma(y + 1j * b1, d).real - 1
    # b1 = tan(u), u en (−π/2, π/2): se buscan los cambios de signo
    n = 20000
    us = [-math.pi / 2 + (k + 0.5) * math.pi / n for k in range(n)]
    out = []
    prev = f(math.tan(us[0]))
    for k in range(1, n):
        cur = f(math.tan(us[k]))
        if prev * cur < 0:
            lo, hi = us[k - 1], us[k]
            for _ in range(80):
                mid = (lo + hi) / 2
                if f(math.tan(lo)) * f(math.tan(mid)) <= 0:
                    hi = mid
                else:
                    lo = mid
            b1 = math.tan((lo + hi) / 2)
            b2 = -_transforma(y + 1j * b1, d).imag
            out.append((_len_stub(b1, abierto), _len_stub(b2, abierto), b1, b2))
        prev = cur
    return out
