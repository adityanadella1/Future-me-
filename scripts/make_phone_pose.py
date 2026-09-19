"""Extract the floating heart/star particles.

The character poses this file used to cut are gone: that second render was at a
different zoom than the idle sprite, which is what made the mascot change size
between animation 1 and animation 2. All poses now come from
make_mascot_frames.py, which paints onto the single idle canvas.
"""
from PIL import Image

SRC = r'C:/Users/nadel/AppData/Local/Temp/claude/C--Future-Me/98771928-88ac-4be4-8b76-20e04741defe/images/15.webp'
OUT = 'C:/Future Me/assets/mascot/'

base = Image.open(SRC).convert('RGBA')
base.crop((274, 261, 375, 347)).save(OUT + 'heart.png')
base.crop((719, 354, 819, 454)).save(OUT + 'star.png')
print('done')
