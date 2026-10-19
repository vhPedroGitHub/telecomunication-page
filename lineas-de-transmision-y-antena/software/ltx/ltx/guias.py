"""Guías de onda rectangular y circular (Pozar 3.3, 3.4)."""
import math

C0 = 299792458.0
ETA0 = 376.730313
MU0 = 4e-7 * math.pi
# raíces de J'_n (TE) y J_n (TM): Pozar, tablas 3.3 y 3.4
P_TE = {(0, 1): 3.832, (0, 2): 7.016, (1, 1): 1.841, (1, 2): 5.331, (2, 1): 3.054, (2, 2): 6.706, (3, 1): 4.201}
P_TM = {(0, 1): 2.405, (0, 2): 5.520, (1, 1): 3.832, (1, 2): 7.016, (2, 1): 5.135, (2, 2): 8.417, (3, 1): 6.380}
SIGMA = {"cobre": 5.813e7, "laton": 2.564e7, "aluminio": 3.816e7, "plata": 6.173e7, "oro": 4.098e7}
WR = [("WR-650", 16.51, 8.255, 1.12, 1.70), ("WR-430", 10.922, 5.461, 1.70, 2.60), ("WR-284", 7.214, 3.404, 2.60, 3.95),
      ("WR-187", 4.755, 2.215, 3.95, 5.85), ("WR-137", 3.485, 1.580, 5.85, 8.20), ("WR-112", 2.850, 1.262, 7.05, 10.0),
      ("WR-90", 2.286, 1.016, 8.20, 12.4), ("WR-62", 1.580, 0.790, 12.4, 18.0), ("WR-42", 1.07, 0.43, 18.0, 26.5),
      ("WR-28", 0.711, 0.356, 26.5, 40.0)]   # Pozar, apéndice I (dimensiones interiores en cm, banda en GHz)


def fc_rect(a, b, m, n, er=1.0):
    """Frecuencia de corte (Hz) del modo mn; a, b en metros."""
    return C0 / (2 * math.sqrt(er)) * math.hypot(m / a, n / b)


def modos_rect(a, b, er=1.0, nmax=5, cuantos=6):
    """Lista ordenada [(fc, 'TE10'…)] con TE y TM (los TM necesitan m, n ≥ 1)."""
    out = []
    for m in range(nmax):
        for n in range(nmax):
            if m == n == 0:
                continue
            fc = fc_rect(a, b, m, n, er)
            out.append((fc, "TE%d%d" % (m, n)))
            if m and n:
                out.append((fc, "TM%d%d" % (m, n)))
    out.sort()
    return out[:cuantos]


def banda_monomodo_rect(a, b, er=1.0):
    """(fc TE10, fc del modo siguiente) en Hz."""
    m = [fc for fc, name in modos_rect(a, b, er, cuantos=10) if name != "TE10"]
    return fc_rect(a, b, 1, 0, er), min(m)


def fc_circ(radio, p, er=1.0):
    return p * C0 / (2 * math.pi * radio * math.sqrt(er))


def banda_monomodo_circ(radio, er=1.0):
    """TE11 … TM01."""
    return fc_circ(radio, P_TE[(1, 1)], er), fc_circ(radio, P_TM[(0, 1)], er)


def propagacion(f, fc, er=1.0):
    """β (rad/m), λg (m), vp, vg (m/s) y Z_TE (Ω) de un modo con corte fc."""
    k = 2 * math.pi * f * math.sqrt(er) / C0
    x = 1 - (fc / f) ** 2
    if x <= 0:
        alpha = k * math.sqrt(-x)
        return {"propaga": False, "alfa_Np_m": alpha, "alfa_dB_m": 8.686 * alpha}
    beta = k * math.sqrt(x)
    v = C0 / math.sqrt(er)
    eta = ETA0 / math.sqrt(er)
    return {"propaga": True, "beta": beta, "lambda_g": 2 * math.pi / beta, "vp": v / math.sqrt(x),
            "vg": v * math.sqrt(x), "Z_TE": eta / math.sqrt(x), "Z_TM": eta * math.sqrt(x)}


def rs(f, sigma):
    return math.sqrt(2 * math.pi * f * MU0 / (2 * sigma))


def atenuacion_te10(a, b, f, er=1.0, tand=0.0, sigma=5.813e7):
    """(αd, αc) en Np/m para el TE10, Pozar (3.29) y (3.96)."""
    k = 2 * math.pi * f * math.sqrt(er) / C0
    kc = math.pi / a
    beta = math.sqrt(k * k - kc * kc)
    eta = ETA0 / math.sqrt(er)
    ad = k * k * tand / (2 * beta)
    ac = rs(f, sigma) / (a ** 3 * b * beta * k * eta) * (2 * b * math.pi ** 2 + a ** 3 * k * k)
    return ad, ac


def atenuacion_te11_circ(radio, f, er=1.0, tand=0.0, sigma=5.813e7):
    """(αd, αc) en Np/m para el TE11 circular, Pozar (3.29) y (3.133)."""
    k = 2 * math.pi * f * math.sqrt(er) / C0
    p = P_TE[(1, 1)]
    kc = p / radio
    beta = math.sqrt(k * k - kc * kc)
    eta = ETA0 / math.sqrt(er)
    ad = k * k * tand / (2 * beta)
    ac = rs(f, sigma) / (radio * k * eta * beta) * (kc * kc + k * k / (p * p - 1))
    return ad, ac


def wr_para(f1, f2):
    """Guías WR del apéndice I de Pozar cuya banda recomendada cubre [f1, f2] GHz."""
    return [w for w in WR if w[3] <= f1 and f2 <= w[4]]
