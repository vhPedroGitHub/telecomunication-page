import math
import unittest

from fc1 import bandabase as bb
from fc1 import canal, info, senales


class Pruebas(unittest.TestCase):
    def test_entropia(self):
        self.assertAlmostEqual(info.entropia([1 / 3, 1 / 6, 1 / 4, 1 / 4]), 1.9591, places=4)
        self.assertAlmostEqual(info.entropia([1] * 8), 3)

    def test_huffman_ejercicio5(self):
        p = [0.4, 0.2, 0.2, 0.1, 0.1]
        self.assertEqual(info.huffman(p), ["00", "10", "11", "010", "011"])
        H, L, eta, var = info.medidas(p, info.huffman(p))
        self.assertAlmostEqual(L, 2.2)
        self.assertAlmostEqual(var, 0.16)
        self.assertAlmostEqual(info.medidas(p, info.huffman(p, minima_varianza=False))[3], 1.36)

    def test_huffman_pp1(self):
        p = [1 / 4, 1 / 2, 1 / 8, 1 / 16, 1 / 32, 1 / 32]
        self.assertEqual(info.huffman(p), ["01", "1", "001", "0001", "00000", "00001"])

    def test_lz78(self):
        pares = [(i, c) for _, i, c in info.lz78("ABABABA")]
        self.assertEqual(pares, [(0, "A"), (0, "B"), (1, "B"), (3, "A")])
        self.assertEqual(info.lz78_decodifica(pares), "ABABABA")

    def test_hamming_cp3(self):
        c = canal.CodigoBloque.hamming74_cp3()
        self.assertEqual(c.codifica([1, 0, 1, 0]), [1, 0, 1, 0, 0, 1, 1])
        self.assertEqual(c.dmin(), 3)
        x, pos, s = c.decodifica([1, 1, 1, 0, 1, 1, 0])
        self.assertEqual((pos, s), (6, [0, 1, 0]))
        self.assertEqual(x, [1, 1, 1, 0, 1, 0, 0])

    def test_convolucional(self):
        cc = canal.Convolucional("111", "101")
        self.assertEqual(cc.codifica("10011"), ["11", "10", "11", "11", "01", "01", "11"])
        self.assertEqual(cc.viterbi("0100010000"), ([0, 0, 0, 0, 0], 2))
        self.assertEqual(cc.viterbi("1100010000")[0], [1, 0, 0, 0, 0])

    def test_pp1_conv(self):
        cc = canal.Convolucional("101", "111", "111")
        out = cc.codifica("10010000000001", cola=False)
        self.assertEqual(" ".join(out), "111 011 111 111 011 111 000 000 000 000 000 000 000 111")
        self.assertEqual(cc.viterbi("001001001001"), ([0, 0, 0, 0], 4))

    def test_pe_cp17_cp18(self):
        s = math.sqrt(0.5)
        self.assertAlmostEqual(bb.pe_umbral(0, 2, s, 1.5), 0.12835, places=4)
        self.assertAlmostEqual(bb.pe_umbral(0, 2, s), 0.07865, places=4)
        self.assertAlmostEqual(bb.pe_filtro_adaptado(4e-5, 1e-6), 3.872e-6, places=8)
        self.assertAlmostEqual(2 * 0.1 * bb.Qinv(1e-8), 1.1224, places=3)

    def test_duobinario_cp16(self):
        self.assertEqual(bb.duobinario([1, 1, 0, 1, 0, 1, 0, 0]), [0, 2, 0, 0, 0, 0, 0, -2])
        self.assertEqual(bb.duobinario([1, 1, 0, 1, 0, 1, 0, 0], precodifica=True), [0, 0, -2, 0, 2, 0, -2, -2])

    def test_foury_coseno(self):
        fs = 100
        x = [math.cos(2 * math.pi * k / fs) for k in range(1000)]
        f, A = senales.foury(x, fs)
        top = senales.picos(f, A)[0]
        self.assertAlmostEqual(top[0], 1.0)
        self.assertAlmostEqual(top[1], 0.5, places=3)


if __name__ == "__main__":
    unittest.main()
