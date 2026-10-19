"""Transformadores multisección (binomial, Chebyshev) y exponencial (Pozar 5.5–5.8)."""
import cmath
import math


def _chebyshev_coef(N, sec_m):
    """Coeficientes c_k de T_N(sec θm · cos θ) = Σ c_k cos(kθ) (k = N, N−2, …)."""
    # muestreo y proyección de Fourier (exacta para un polinomio trigonométrico de grado N)
    M = 4 * N + 8
    c = {}
    for k in range(N, -1, -2):
        s = 0.0
        for i in range(M):
            th = math.pi * (i + 0.5) / M
            x = sec_m * math.cos(th)
            T = math.cos(N * math.acos(x)) if abs(x) <= 1 else math.cosh(N * math.acosh(abs(x))) * (1 if x > 0 or N % 2 == 0 else -1)
            s += T * math.cos(k * th)
        c[k] = s * (2 if k else 1) / M
    return c


def chebyshev(zl, z0, N, gm):
    """Transformador de Chebyshev de N secciones con |Γ| ≤ Γm en la banda.
    Devuelve (Z1…ZN, θm en grados, ancho de banda fraccional, Γ0…ΓN)."""
    sec_m = math.cosh(math.acosh(abs(math.log(zl / z0)) / (2 * gm)) / N)
    A = gm if zl > z0 else -gm
    c = _chebyshev_coef(N, sec_m)
    G = [0.0] * (N + 1)
    for n in range(0, N // 2 + 1):
        k = N - 2 * n
        if k == 0:
            G[n] = A * c[0]          # término central (N par): Γ_{N/2}
        else:
            G[n] = G[N - n] = A * c[k] / 2
    Z = [z0]
    for n in range(N):
        Z.append(Z[-1] * math.exp(2 * G[n]))
    th_m = math.degrees(math.acos(1 / sec_m))
    return Z[1:], th_m, 2 - 4 * th_m / 180, G


def binomial(zl, z0, N, gm=None):
    """Transformador binomial (máximamente plano). Devuelve (Z1…ZN, BW fraccional o None)."""
    A = 2.0 ** (-(N + 1)) * math.log(zl / z0)
    Z = [z0]
    for n in range(N):
        Cn = math.comb(N, n)
        Z.append(Z[-1] * math.exp(2 * A * Cn))
    bw = None
    if gm:
        x = 0.5 * (gm / abs(A)) ** (1 / N)
        bw = 2 - 4 / math.pi * math.acos(x) if x < 1 else 2.0
    return Z[1:], bw


def gamma_multiseccion(Zs, z0, zl, f_rel):
    """|Γ| exacto de una cascada de secciones λ/4 (a f0) para una frecuencia f/f0."""
    th = math.pi / 2 * f_rel
    z = complex(zl)
    for Zn in reversed(Zs):
        t = math.tan(th)
        z = Zn * (z + 1j * Zn * t) / (Zn + 1j * z * t)
    return abs((z - z0) / (z + z0))


def exponencial_gamma(zl, z0, bl):
    """|Γ(θ)| de la sección exponencial, Pozar (5.70): ½|ln(ZL/Z0)|·|sin βL / βL|."""
    if bl == 0:
        return abs(0.5 * math.log(zl / z0))
    return abs(0.5 * math.log(zl / z0) * math.sin(bl) / bl)


def exponencial(zl, z0, L):
    """Factor de ahusamiento a (1/m) y función Z(z) para una línea de longitud L (m)."""
    a = math.log(zl / z0) / L
    return a, (lambda z: z0 * math.exp(a * z))
