"""Reproduce the local QR matrix (development only: pip install qrcode==8.2).
qrcode: https://github.com/lincolnloop/python-qrcode (BSD-3-Clause).
No quiz responses are transmitted; this encodes only the public canonical URL.
"""
from pathlib import Path
import json
import qrcode
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
qr.add_data('https://zyrobbie.github.io/inner-zoo/')
qr.make(fit=True)
(Path(__file__).resolve().parents[1] / 'src/test-qr.json').write_text(json.dumps(qr.get_matrix(), separators=(',', ':')) + '\n')
