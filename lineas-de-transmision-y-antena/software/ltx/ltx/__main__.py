"""python -m ltx <orden> …"""
import argparse
import cmath
import math

from . import guias, lineas, multiseccion, planares, stubs


def _z(s):
    s = s.replace(" ", "").lower()
    if s in ("inf", "∞"):
        return math.inf
    return complex(s.replace("i", "j"))


def _pol(z):
    return "%.4f∠%.2f°" % (abs(z), math.degrees(cmath.phase(z)))


def _fz(z):
    return "∞" if z == math.inf else "%.3f %s j%.3f" % (z.real, "−" if z.imag < 0 else "+", abs(z.imag))


def main(argv=None):
    ap = argparse.ArgumentParser(prog="ltx", description="Cálculos de Líneas de Transmisión")
    sub = ap.add_subparsers(dest="orden", required=True)
    s = sub.add_parser("carga", help="Γ, RL, ROE, máximos/mínimos y Zin de una carga")
    s.add_argument("zl", help="impedancia de carga, p. ej. 30+100j, inf")
    s.add_argument("--z0", type=float, default=50)
    s.add_argument("--l", type=float, default=0.0, help="longitud de línea en λ")
    s = sub.add_parser("rlgc", help="γ y Z0 a partir de R, L, G, C")
    s.add_argument("R", type=float); s.add_argument("L", type=float, help="H/m")
    s.add_argument("G", type=float); s.add_argument("C", type=float, help="F/m")
    s.add_argument("f", type=float, help="Hz")
    s = sub.add_parser("cuarto", help="transformador λ/4 (cargas reales o complejas)")
    s.add_argument("zl"); s.add_argument("--z0", type=float, default=50)
    s.add_argument("--gm", type=float, help="Γm para calcular el ancho de banda (carga real)")
    s = sub.add_parser("stub", help="stub simple")
    s.add_argument("zl"); s.add_argument("--z0", type=float, default=50)
    s.add_argument("--serie", action="store_true"); s.add_argument("--corto", action="store_true")
    s = sub.add_parser("doble", help="stub doble en paralelo")
    s.add_argument("zl"); s.add_argument("--z0", type=float, default=50)
    s.add_argument("--d", type=float, default=0.125); s.add_argument("--abierto", action="store_true")
    s = sub.add_parser("cheb", help="transformador de Chebyshev")
    s.add_argument("z0", type=float); s.add_argument("zl", type=float)
    s.add_argument("--n", type=int, default=2); s.add_argument("--gm", type=float, default=0.05)
    s = sub.add_parser("binomial", help="transformador binomial")
    s.add_argument("z0", type=float); s.add_argument("zl", type=float)
    s.add_argument("--n", type=int, default=2); s.add_argument("--gm", type=float, default=0.05)
    s = sub.add_parser("guia", help="modos de una guía rectangular (a, b en cm)")
    s.add_argument("a", type=float); s.add_argument("b", type=float)
    s.add_argument("--er", type=float, default=1.0); s.add_argument("--f", type=float, help="GHz")
    s.add_argument("--metal", default="cobre", choices=sorted(guias.SIGMA)); s.add_argument("--tand", type=float, default=0.0)
    s = sub.add_parser("circular", help="guía circular (radio en cm)")
    s.add_argument("radio", type=float); s.add_argument("--er", type=float, default=1.0)
    s = sub.add_parser("micro", help="microcinta: análisis (--w) o síntesis (--z)")
    s.add_argument("--er", type=float, required=True); s.add_argument("--h", type=float, required=True, help="mm")
    s.add_argument("--w", type=float, help="mm"); s.add_argument("--z", type=float, help="Ω")
    s.add_argument("--f", type=float, default=1.0, help="GHz"); s.add_argument("--tand", type=float, default=0.0)
    s = sub.add_parser("cpw", help="guía coplanar")
    s.add_argument("--er", type=float, required=True); s.add_argument("--s", type=float, required=True, help="mm")
    s.add_argument("--w", type=float, required=True, help="mm"); s.add_argument("--h", type=float, required=True, help="mm")
    a = ap.parse_args(argv)

    if a.orden == "carga":
        zl = _z(a.zl); g = lineas.reflexion(zl, a.z0)
        dmax, dmin = lineas.dist_max_min(g)
        print("z_L = %s   Γ = %s   RL = %.2f dB   ROE = %.3f" % (_fz(zl / a.z0 if zl != math.inf else zl), _pol(g), lineas.rl_db(g), lineas.roe(g)))
        print("1.er máximo de |V| a %.4fλ, 1.er mínimo a %.4fλ de la carga" % (dmax, dmin))
        if a.l:
            zi = lineas.zin(zl, a.z0, 2 * math.pi * a.l)
            print("Z_in(%.4fλ) = %s Ω" % (a.l, _fz(zi)))
    elif a.orden == "rlgc":
        g, z0 = lineas.gamma_z0(a.R, a.L, a.G, a.C, a.f)
        print("γ = %.5f + j%.4f  (α = %.4f dB/m)   Z0 = %s Ω" % (g.real, g.imag, 8.686 * g.real, _fz(z0)))
    elif a.orden == "cuarto":
        for d, R, zt in lineas.cuarto_onda(_z(a.zl), a.z0):
            print("a %.4fλ de la carga: R = %.2f Ω → Z_T = %.2f Ω" % (d, R, zt))
        zl = _z(a.zl)
        if a.gm and zl.imag == 0:
            print("Δf/f0 = %.1f %% (|Γ| ≤ %g)" % (100 * lineas.cuarto_onda_bw(a.gm, zl.real, a.z0), a.gm))
    elif a.orden == "stub":
        for i, (d, l, b) in enumerate(stubs.stub_simple(_z(a.zl), a.z0, not a.serie, not a.corto), 1):
            print("solución %d: d = %.4fλ, l = %.4fλ (el stub aporta %+.3fj)" % (i, d, l, b))
    elif a.orden == "doble":
        sols = stubs.stub_doble(_z(a.zl), a.z0, a.d, a.abierto)
        if not sols:
            print("sin solución: la carga está en la zona prohibida")
        for i, (l1, l2, b1, b2) in enumerate(sols, 1):
            print("solución %d: b1 = %+.3f → l1 = %.4fλ;  b2 = %+.3f → l2 = %.4fλ" % (i, b1, l1, b2, l2))
    elif a.orden in ("cheb", "binomial"):
        if a.orden == "cheb":
            Z, th, bw, _ = multiseccion.chebyshev(a.zl, a.z0, a.n, a.gm)
            print("θm = %.2f°" % th)
        else:
            Z, bw = multiseccion.binomial(a.zl, a.z0, a.n, a.gm)
        print("  ".join("Z%d = %.2f Ω" % (i, z) for i, z in enumerate(Z, 1)))
        print("Δf/f0 = %.1f %%" % (100 * bw))
    elif a.orden == "guia":
        A, B = a.a / 100, a.b / 100
        for fc, name in guias.modos_rect(A, B, a.er):
            print("%-5s f_c = %7.3f GHz" % (name, fc / 1e9))
        f1, f2 = guias.banda_monomodo_rect(A, B, a.er)
        print("banda monomodo: %.3f – %.3f GHz" % (f1 / 1e9, f2 / 1e9))
        if a.f:
            p = guias.propagacion(a.f * 1e9, f1, a.er)
            if p["propaga"]:
                ad, ac = guias.atenuacion_te10(A, B, a.f * 1e9, a.er, a.tand, guias.SIGMA[a.metal])
                print("TE10 a %g GHz: β = %.2f rad/m, λg = %.3f cm, Z_TE = %.1f Ω, αd = %.4f dB/m, αc = %.4f dB/m (%s)"
                      % (a.f, p["beta"], 100 * p["lambda_g"], p["Z_TE"], 8.686 * ad, 8.686 * ac, a.metal))
            else:
                print("TE10 al corte: α = %.1f dB/m" % p["alfa_dB_m"])
    elif a.orden == "circular":
        f1, f2 = guias.banda_monomodo_circ(a.radio / 100, a.er)
        print("TE11 %.3f GHz · TM01 %.3f GHz → banda monomodo %.3f – %.3f GHz" % (f1 / 1e9, f2 / 1e9, f1 / 1e9, f2 / 1e9))
    elif a.orden == "micro":
        u = a.w / a.h if a.w else planares.micro_sintesis(a.er, a.z)
        ee = planares.micro_eeff(a.er, u)
        z0 = planares.micro_z0(a.er, u)
        lam = planares.C0 / (a.f * 1e9 * math.sqrt(ee))
        ad, ac = planares.micro_perdidas(a.er, u, a.h / 1000, a.f * 1e9, a.tand)
        print("W/h = %.4f  W = %.3f mm  εeff = %.3f  Z0 = %.2f Ω  λg = %.2f mm  αd = %.3f dB/m  αc = %.3f dB/m"
              % (u, u * a.h, ee, z0, lam * 1000, 8.686 * ad, 8.686 * ac))
    elif a.orden == "cpw":
        ee, z0 = planares.cpw(a.er, a.s, a.w, a.h)
        print("εeff = %.3f  Z0 = %.2f Ω" % (ee, z0))


if __name__ == "__main__":
    main()
