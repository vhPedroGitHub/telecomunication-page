import unittest
from mcs51calc import core


class T(unittest.TestCase):
    def test_timer(self):
        self.assertEqual(core.timer_reload(50000, 1), 0x3CB0)
        self.assertEqual(core.timer_reload(250, 2), 6)
        self.assertEqual(core.timer_reload(24, 2), 232)
        self.assertIn((50000, 20, 0x3CB0), core.timer_postscaler(1.0, 1e-6, 1))

    def test_baud(self):
        x, th, real, err = core.baud_th1(1200, 12)
        self.assertEqual(th, 230)
        self.assertAlmostEqual(real, 1201.9, 1)
        self.assertEqual(core.baud_th1(9600, 11.0592)[1], 253)
        self.assertGreater(core.baud_th1(9600, 12)[3], 8)

    def test_demora(self):
        self.assertEqual(core.demora_ciclos(10, 200, 250), 1006035)   # verificado en el simulador
        self.assertEqual(core.demora_ciclos(123), 251)

    def test_seg7(self):
        self.assertEqual(core.seg7_tabla()[:10], [0x40, 0x79, 0x24, 0x30, 0x19, 0x12, 0x02, 0x78, 0x00, 0x18])
        self.assertEqual(core.seg7_tabla(dp_conectado=True)[2], 0xA4)
        self.assertEqual(core.seg7_tabla(anodo=False)[0], 0x3F)

    def test_ui(self):
        e, a = core.ui_desde_uc(255, 10, 70)
        self.assertAlmostEqual(e, 70)
        self.assertEqual(a, 69)


if __name__ == "__main__":
    unittest.main()
