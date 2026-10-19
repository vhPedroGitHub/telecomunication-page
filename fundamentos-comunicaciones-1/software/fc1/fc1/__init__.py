"""fc1 — herramientas didácticas de Fundamentos de las Comunicaciones I.

Módulos:
    senales     equivalentes Python de foury.m, cuadpuls.m, triapuls.m y un_pulse.m (Lab. Simulado 2)
    info        cantidad de información, entropía, Huffman (mínima varianza) y LZ78
    canal       capacidad BSC / Shannon-Hartley, códigos lineales de bloque (Hamming) y convolucionales (Viterbi)
    bandabase   función Q, cuantificación y SNRq, modulación delta, Nyquist y probabilidad de error
"""
__version__ = "0.1.0"
from . import senales, info, canal, bandabase  # noqa: F401
