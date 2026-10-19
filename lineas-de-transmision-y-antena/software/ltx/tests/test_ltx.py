import math
import unittest

from ltx import guias, lineas, multiseccion, planares, stubs


class T(unittest.TestCase):
    def test_lineas(self):
        g, z0 = lineas.gamma_z0(5, 0.2e-6, 0.01, 300e-12, 500e6)       # TI 4 de la Conferencia 1
        self.assertAlmostEqual(g.imag, 24.33, 2)
        self.assertAlmostEqual(z0.real, 25.82, 2)
        zi = lineas.zin(37.5 + 75j, 75, 2 * math.pi * 0.32)              # problema 2 de Smith
        self.assertAlmostEqual(zi.real, 18.98, 1)
        self.assertAlmostEqual(zi.imag, -20.55, 1)
        self.assertAlmostEqual(lineas.roe(lineas.reflexion(37.5 + 75j, 75)), 4.27, 2)
        self.assertAlmostEqual(lineas.cuarto_onda_bw(0.2, 10, 50), 0.293, 3)   # Pozar 5.5

    def test_stubs(self):
        s = stubs.stub_simple(15 + 10j, 50)                               # encuentro 2A
        self.assertAlmostEqual(s[0][0], 0.044, 3)
        self.assertAlmostEqual(s[0][1], 0.147, 3)
        self.assertAlmostEqual(s[1][1], 0.353, 3)
        s = stubs.stub_simple(60 - 80j, 50, abierto=False)                # Pozar 5.2
        self.assertAlmostEqual(s[0][0], 0.110, 3)
        self.assertAlmostEqual(s[0][1], 0.095, 3)
        d = stubs.stub_doble(60 - 80j, 50, 0.125, abierto=True)           # Pozar 5.4
        self.assertEqual(sorted(round(x[0], 3) for x in d), [0.146, 0.482])

    def test_multiseccion(self):
        Z, th, bw, _ = multiseccion.chebyshev(120, 60, 2, 0.05)          # encuentro 2C
        self.assertAlmostEqual(Z[0], 73.15, 1)
        self.assertAlmostEqual(bw, 0.67, 2)
        Z, bw = multiseccion.binomial(100, 50, 3, 0.05)                   # Pozar 5.6
        self.assertAlmostEqual(Z[1], 70.71, 2)
        self.assertAlmostEqual(bw, 0.70, 2)

    def test_guias(self):
        m = guias.modos_rect(0.0107, 0.0043, 2.08)                       # Pozar 3.1
        self.assertAlmostEqual(m[0][0] / 1e9, 9.72, 1)
        ad, ac = guias.atenuacion_te10(0.0107, 0.0043, 15e9, 2.08, 0.0004)
        self.assertAlmostEqual(8.686 * ad, 1.03, 2)
        self.assertAlmostEqual(8.686 * ac, 0.434, 2)
        self.assertAlmostEqual(guias.banda_monomodo_circ(0.012)[0] / 1e9, 7.32, 2)

    def test_planares(self):
        u = planares.micro_sintesis(9.9, 50)                              # Pozar 3.7
        self.assertAlmostEqual(u, 0.9654, 3)
        self.assertAlmostEqual(planares.micro_eeff(9.9, u), 6.665, 2)
        ee, z0 = planares.cpw(9.8, 0.25e-3, 0.1e-3, 0.635e-3)
        self.assertTrue(45 < z0 < 55 and 4 < ee < 6)


if __name__ == "__main__":
    unittest.main()
