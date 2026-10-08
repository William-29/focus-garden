"""Build the game's OFL font derivative with a clearer, square-topped digit 5.

One-time utility install: python -m pip install --target .expo/font-tools fonttools
Run from the project folder: python scripts/build-garden-font.py
The app uses the committed TTF and needs no Python or font tools at runtime.
"""
from pathlib import Path
import sys

project = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project / '.expo' / 'font-tools'))
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont(project / 'assets' / 'fonts' / 'PixelifySans.ttf', recalcTimestamp=False)
instantiateVariableFont(font, {'wght': 400}, inplace=True)
glyph_name = font.getBestCmap()[ord('5')]
original_metrics = font['hmtx'][glyph_name]
other_digits = {font.getBestCmap()[ord(char)]: font['glyf'][font.getBestCmap()[ord(char)]].compile(font['glyf']) for char in '012346789'}
rows = ['11111', '10000', '10000', '11110', '00001', '00001', '11110']
pen = TTGlyphPen(None)
for row, pixels in enumerate(rows):
    column = 0
    while column < len(pixels):
        if pixels[column] != '1':
            column += 1
            continue
        end = column + 1
        while end < len(pixels) and pixels[end] == '1':
            end += 1
        left, right = 60 + column * 93, 60 + end * 93
        bottom, top = -12 + (6 - row) * 92, -12 + (7 - row) * 92
        pen.moveTo((left, bottom))
        pen.lineTo((left, top))
        pen.lineTo((right, top))
        pen.lineTo((right, bottom))
        pen.closePath()
        column = end
font['glyf'][glyph_name] = pen.glyph()
for record in font['name'].names:
    if record.nameID in (1, 4, 6, 16):
        name = 'FocusGardenPixel-Regular' if record.nameID == 6 else 'Focus Garden Pixel'
        record.string = name.encode(record.getEncoding())
    elif record.nameID == 3:
        record.string = 'FocusGardenPixel-Regular-1.0'.encode(record.getEncoding())
# Retain the source copyright and OFL license records. Only the primary family
# name and digit five change; all other glyphs keep the regular source outline.
assert font['hmtx'][glyph_name] == original_metrics
for name, outline in other_digits.items():
    assert font['glyf'][name].compile(font['glyf']) == outline
destination = project / 'assets' / 'fonts' / 'FocusGardenPixel.ttf'
font.save(destination)
with TTFont(destination) as checked:
    assert checked.getBestCmap()[ord('5')] == glyph_name
    assert checked['hmtx'][glyph_name] == original_metrics
    assert checked['glyf'][glyph_name].numberOfContours == 7
print(f'Built {destination.name}: clearer 5, unchanged digit spacing and other digits, preserved OFL license.')
