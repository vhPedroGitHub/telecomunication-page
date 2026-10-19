"""Interfaz de línea de órdenes: python -m fc1 <orden> ..."""
import argparse
import sys

from . import bandabase as bb
from . import canal, info, senales


def _probs(vals):
    out = []
    for v in vals:
        if "/" in v:
            a, b = v.split("/")
            out.append(float(a) / float(b))
        else:
            out.append(float(v))
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(prog="fc1", description="Herramientas de Fundamentos de las Comunicaciones I")
    sub = ap.add_subparsers(dest="orden", required=True)

    s = sub.add_parser("entropia", help="entropía de una fuente")
    s.add_argument("p", nargs="+")
    s = sub.add_parser("huffman", help="código de Huffman (mínima varianza por defecto)")
    s.add_argument("p", nargs="+")
    s.add_argument("--abajo", action="store_true", help="colocar la suma abajo en los empates")
    s = sub.add_parser("lz78", help="codificación Lempel-Ziv 78")
    s.add_argument("secuencia")
    s = sub.add_parser("hamming", help="codificar con el Hamming (7,4) de la CP 3, o decodificar 7 bits")
    s.add_argument("bits")
    s = sub.add_parser("conv", help="codificador convolucional")
    s.add_argument("--g", required=True, help="generadores separados por comas, p. ej. 111,101")
    s.add_argument("bits")
    s.add_argument("--sin-cola", action="store_true")
    s = sub.add_parser("viterbi", help="decodificador de Viterbi")
    s.add_argument("--g", required=True, help="generadores separados por comas, p. ej. 111,101")
    s.add_argument("rx")
    s = sub.add_parser("pe", help="probabilidad de error con umbral")
    s.add_argument("--s0", type=float, default=0.0)
    s.add_argument("--s1", type=float, required=True)
    s.add_argument("--sigma", type=float, required=True)
    s.add_argument("--vt", type=float)
    s = sub.add_parser("foury", help="espectro de una señal del Lab. Simulado 2")
    s.add_argument("senal", choices=["cuadpuls", "triapuls", "un_pulse"])
    s.add_argument("params", nargs="+", type=int)
    s.add_argument("--fs", type=float, required=True)
    s.add_argument("--plot", action="store_true")
    a = ap.parse_args(argv)

    if a.orden == "entropia":
        p = _probs(a.p)
        print(f"H = {info.entropia(p):.4f} bit/símbolo")
        t = sum(p)
        for i, x in enumerate(p):
            print(f"  I(s{i}) = {info.informacion(x / t):.4f} bit")
    elif a.orden == "huffman":
        p = _probs(a.p)
        code = info.huffman(p, minima_varianza=not a.abajo)
        for i in sorted(range(len(p)), key=lambda i: -p[i]):
            print(f"  s{i + 1}  p = {p[i]:<8.4g} {code[i]}")
        H, L, eta, var = info.medidas(p, code)
        print(f"H = {H:.4f}   L = {L:.4f}   eficiencia = {eta:.4f}   varianza = {var:.4f}")
    elif a.orden == "lz78":
        for k, (f, idx, ch) in enumerate(info.lz78(a.secuencia), 1):
            print(f"  {k:>3}  frase {f!r:<10} -> ({idx}, {ch or '—'})")
    elif a.orden == "hamming":
        c = canal.CodigoBloque.hamming74_cp3()
        b = [int(x) for x in a.bits if x in "01"]
        if len(b) == 4:
            print("palabra:", "".join(map(str, c.codifica(b))))
        elif len(b) == 7:
            x, pos, s = c.decodifica(b)
            print("síndrome:", "".join(map(str, s)), "| error en bit:", pos, "| corregida:", "".join(map(str, x)), "| mensaje:", "".join(map(str, x[:4])))
        else:
            sys.exit("Introduce 4 bits (codificar) o 7 bits (decodificar)")
    elif a.orden == "conv":
        print(" ".join(canal.Convolucional(*a.g.split(",")).codifica(a.bits, cola=not a.sin_cola)))
    elif a.orden == "viterbi":
        bits, m = canal.Convolucional(*a.g.split(",")).viterbi(a.rx)
        print("decodificado:", "".join(map(str, bits)), "| métrica:", m)
    elif a.orden == "pe":
        print(f"Pe = {bb.pe_umbral(a.s0, a.s1, a.sigma, a.vt):.4e}")
    elif a.orden == "foury":
        x = getattr(senales, a.senal)(*a.params)
        f, A = senales.foury(x, a.fs, plot=a.plot)
        print(f"N = {len(x)} muestras, fs = {a.fs} Hz, resolución = {a.fs / len(x):.4g} Hz")
        for fr, am in senales.picos(f, A):
            print(f"  {fr:>10.4g} Hz  ->  {am:.4f}")


if __name__ == "__main__":
    main()
