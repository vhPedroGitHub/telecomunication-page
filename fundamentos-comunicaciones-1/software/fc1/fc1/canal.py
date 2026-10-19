"""Codificación de canal: capacidad, códigos lineales de bloque y convolucionales (Viterbi)."""
import math


def H_binaria(p):
    return 0.0 if p in (0, 1) else -p * math.log2(p) - (1 - p) * math.log2(1 - p)


def capacidad_bsc(f):
    """C = 1 - H(f) bit por uso del canal binario simétrico."""
    return 1 - H_binaria(f)


def shannon_hartley(B, snr_db):
    """C = B·log2(1 + S/N) en las unidades de B."""
    return B * math.log2(1 + 10 ** (snr_db / 10))


def pe_repeticion(f, n=3):
    """Probabilidad de error del código de repetición R_n (n impar) con voto mayoritario."""
    return sum(math.comb(n, k) * f ** k * (1 - f) ** (n - k) for k in range((n + 1) // 2, n + 1))


# ---------------------------------------------------------------- bloque
def _vm(v, Mx):
    return [sum(v[i] * Mx[i][j] for i in range(len(v))) % 2 for j in range(len(Mx[0]))]


class CodigoBloque:
    """Código lineal sistemático (n, k) con G = [I_k | P] (convención de Carlson)."""

    def __init__(self, P):
        self.P = [list(r) for r in P]
        self.k, self.q = len(P), len(P[0])
        self.n = self.k + self.q
        self.G = [[1 if i == j else 0 for j in range(self.k)] + self.P[i] for i in range(self.k)]
        self.HT = self.P + [[1 if i == j else 0 for j in range(self.q)] for i in range(self.q)]

    @classmethod
    def hamming74_cp3(cls):
        """El código de la CP 3: filas de P = 101, 111, 110, 011."""
        return cls([[1, 0, 1], [1, 1, 1], [1, 1, 0], [0, 1, 1]])

    def codifica(self, m):
        return _vm(list(m), self.G)

    def sindrome(self, r):
        return _vm(list(r), self.HT)

    def decodifica(self, r):
        """Corrige un error simple. Devuelve (palabra_corregida, posición_1based_o_None, síndrome)."""
        r = list(r)
        s = self.sindrome(r)
        if not any(s):
            return r, None, s
        for i, row in enumerate(self.HT):
            if row == s:
                r[i] ^= 1
                return r, i + 1, s
        return r, None, s  # síndrome sin fila: más de un error detectado

    def palabras(self):
        return [self.codifica([(m >> (self.k - 1 - i)) & 1 for i in range(self.k)]) for m in range(2 ** self.k)]

    def dmin(self):
        return min(sum(c) for c in self.palabras() if any(c))


# ----------------------------------------------------------- convolucional
def _bits(g):
    return [int(c) for c in g] if isinstance(g, str) else list(g)


class Convolucional:
    """Codificador convolucional de razón 1/n. Generadores como '111', '101' (el bit de la izquierda
    multiplica a la entrada actual, igual que g(D) = 1 + D + D^2)."""

    def __init__(self, *gens):
        self.g = [_bits(g) for g in gens]
        self.K = max(len(g) for g in self.g)
        self.g = [g + [0] * (self.K - len(g)) for g in self.g]
        self.L = self.K - 1
        self.n = len(self.g)

    def _paso(self, estado, b):
        reg = [b] + estado
        out = [sum(gi * ri for gi, ri in zip(g, reg)) % 2 for g in self.g]
        return reg[: self.L], out

    def codifica(self, u, cola=True):
        u = _bits(u) + ([0] * self.L if cola else [])
        st, out = [0] * self.L, []
        for b in u:
            st, o = self._paso(st, b)
            out.append("".join(map(str, o)))
        return out

    def viterbi(self, rx):
        """Decodificación de máxima verosimilitud (decisión dura). Devuelve (bits, métrica)."""
        rx = [int(c) for c in rx if c in "01"]
        T = len(rx) // self.n
        pm = {tuple([0] * self.L): (0, [])}
        for k in range(T):
            r = rx[k * self.n:(k + 1) * self.n]
            nuevo = {}
            for st, (m, path) in pm.items():
                for b in (0, 1):
                    ns, o = self._paso(list(st), b)
                    d = sum(x != y for x, y in zip(o, r))
                    ns = tuple(ns)
                    if ns not in nuevo or m + d < nuevo[ns][0]:
                        nuevo[ns] = (m + d, path + [b])
            pm = nuevo
        m, path = min(pm.values(), key=lambda v: v[0])
        return path, m
