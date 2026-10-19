"""Teoría de la información: información, entropía, Huffman y Lempel-Ziv (LZ78)."""
import math


def informacion(p):
    """I = log2(1/p) en bits."""
    return -math.log2(p)


def entropia(probs):
    """H = sum p·log2(1/p) (bit/símbolo). Normaliza si las probabilidades no suman 1."""
    s = sum(probs)
    return sum(-(p / s) * math.log2(p / s) for p in probs if p > 0)


def huffman(probs, minima_varianza=True, bits="01"):
    """Código de Huffman por el método tabular del curso.

    minima_varianza=True coloca la suma lo más arriba posible en caso de empate.
    bits="01": 0 a la rama superior y 1 a la inferior.
    Devuelve la lista de palabras en el mismo orden que probs.
    """
    lista = sorted(([p, [i]] for i, p in enumerate(probs)), key=lambda x: (-x[0], x[1][0]))
    code = [""] * len(probs)
    if len(probs) == 1:
        return ["0"]
    eps = 1e-12
    while len(lista) > 1:
        up, lo = lista[-2], lista[-1]
        for s in up[1]:
            code[s] = bits[0] + code[s]
        for s in lo[1]:
            code[s] = bits[1] + code[s]
        nodo = [up[0] + lo[0], up[1] + lo[1]]
        lista = lista[:-2]
        if minima_varianza:
            k = next((i for i, x in enumerate(lista) if x[0] <= nodo[0] + eps), len(lista))
        else:
            k = next((i for i, x in enumerate(lista) if x[0] < nodo[0] - eps), len(lista))
        lista.insert(k, nodo)
    return code


def medidas(probs, code):
    """(H, L, eficiencia, varianza) de un código."""
    s = sum(probs)
    p = [x / s for x in probs]
    H = entropia(p)
    L = sum(pk * len(c) for pk, c in zip(p, code))
    var = sum(pk * (len(c) - L) ** 2 for pk, c in zip(p, code))
    return H, L, H / L, var


def lz78(seq):
    """Codificación LZ78: devuelve [(frase, índice_prefijo, símbolo)]."""
    dic = {"": 0}
    out, w = [], ""
    for ch in seq:
        if w + ch in dic:
            w += ch
        else:
            dic[w + ch] = len(dic)
            out.append((w + ch, dic[w], ch))
            w = ""
    if w:
        out.append((w, dic[w], ""))
    return out


def lz78_decodifica(pares):
    """Inverso de lz78: recibe [(índice_prefijo, símbolo)]."""
    frases, out = [""], []
    for idx, ch in pares:
        f = frases[idx] + ch
        frases.append(f)
        out.append(f)
    return "".join(out)
