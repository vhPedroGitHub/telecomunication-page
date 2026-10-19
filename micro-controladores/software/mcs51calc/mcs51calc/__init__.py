"""mcs51calc — calculadoras didácticas para el microcontrolador 8051."""
from .core import (timer_reload, timer_postscaler, baud_th1, baud_table, demora_ciclos,
                   seg7_tabla, ui_desde_uc, resistencia_led, parse_tiempo)

__version__ = "0.1.0"
__all__ = ["timer_reload", "timer_postscaler", "baud_th1", "baud_table", "demora_ciclos",
           "seg7_tabla", "ui_desde_uc", "resistencia_led", "parse_tiempo"]
