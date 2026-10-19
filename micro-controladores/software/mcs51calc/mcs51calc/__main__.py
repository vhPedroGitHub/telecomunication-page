"""python -m mcs51calc <orden> …"""
import argparse

from . import core


def _t(s):
    v = core.parse_tiempo(s)
    return v


def fmt_t(t):
    return "%.3f µs" % (t * 1e6) if t < 1e-3 else "%.4f ms" % (t * 1e3) if t < 1 else "%.6f s" % t


def main(argv=None):
    ap = argparse.ArgumentParser(prog="mcs51calc", description="Calculadoras para el 8051")
    sub = ap.add_subparsers(dest="orden", required=True)
    s = sub.add_parser("timer", help="recarga del timer (con postescalador si hace falta)")
    s.add_argument("tiempo", help="p. ej. 1s, 50ms, 250us")
    s.add_argument("--cm", default="1us", help="ciclo de máquina (por defecto 1us)")
    s.add_argument("--modo", type=int, default=1, choices=[0, 1, 2])
    s = sub.add_parser("baud", help="TH1 para una razón de baudios")
    s.add_argument("br", type=float)
    s.add_argument("--fosc", type=float, default=12.0, help="MHz")
    s.add_argument("--smod", type=int, default=0, choices=[0, 1])
    s = sub.add_parser("demora", help="ciclos de una rutina de demora con djnz (1–3 cargas)")
    s.add_argument("cargas", type=int, nargs="+")
    s.add_argument("--cm", default="1us")
    s = sub.add_parser("seg7", help="tabla de códigos de 7 segmentos 0..F")
    g = s.add_mutually_exclusive_group()
    g.add_argument("--anodo", action="store_true", help="ánodo común (por defecto)")
    g.add_argument("--catodo", action="store_true")
    s.add_argument("--a-bit7", action="store_true", help="segmento a en el bit 7")
    s.add_argument("--dp", action="store_true", help="el bit del dp está conectado (apagado)")
    s = sub.add_parser("ui", help="unidades de conversión → unidades de ingeniería")
    s.add_argument("uc", type=int)
    s.add_argument("ui_min", type=float)
    s.add_argument("ui_max", type=float)
    s.add_argument("--bits", type=int, default=8)
    s = sub.add_parser("led", help="resistencia limitadora de un LED")
    s.add_argument("--vcc", type=float, default=5.0)
    s.add_argument("--vled", type=float, default=2.0)
    s.add_argument("--iled", type=float, default=6.0, help="mA")
    s.add_argument("--voh", type=float, default=4.6)
    s.add_argument("--vol", type=float, default=0.32)
    a = ap.parse_args(argv)

    if a.orden == "timer":
        t, cm = _t(a.tiempo), _t(a.cm)
        n = round(t / cm)
        print("Ciclos a contar: %d" % n)
        opts = core.timer_postscaler(t, cm, a.modo)
        if not opts:
            print("Sin combinación exacta con postescalador ≤ 255")
        for base, post, r in opts:
            rr = ("%04Xh (TH=%02Xh, TL=%02Xh)" % (r, r >> 8, r & 0xFF)) if a.modo != 2 else "%02Xh" % r
            print("  base %d ciclos (%s) × %d → recarga %s" % (base, fmt_t(base * cm), post, rr))
    elif a.orden == "baud":
        x, th, real, err = core.baud_th1(a.br, a.fosc, a.smod)
        print("TH1 = %.2f → %d (%02Xh): BR real %.1f bps, error %+.2f %%" % (x, th, th, real, err))
    elif a.orden == "demora":
        c = core.demora_ciclos(*a.cargas)
        print("%d ciclos → %s" % (c, fmt_t(c * _t(a.cm))))
    elif a.orden == "seg7":
        tab = core.seg7_tabla(anodo=not a.catodo, a_en_bit0=not a.a_bit7, dp_conectado=a.dp)
        print("Tabla7Seg: db " + ",".join(("0" if v >= 0xA0 else "") + "%02Xh" % v for v in tab))
    elif a.orden == "ui":
        e, ap_ = core.ui_desde_uc(a.uc, a.ui_min, a.ui_max, a.bits)
        print("UI exacta = %.3f · aproximada (÷2^%d) = %g" % (e, a.bits, ap_))
    elif a.orden == "led":
        r1, r0 = core.resistencia_led(a.vcc, a.vled, a.iled / 1000, a.voh, a.vol)
        print("Activo en 1: R = %.0f Ω · activo en 0: R = %.0f Ω" % (r1, r0))


if __name__ == "__main__":
    main()
