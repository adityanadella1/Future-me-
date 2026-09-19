"""Build every mascot frame on ONE canvas so no pose can change apparent size.

All frames derive from boy_a.png (200x215, a 24x32 sprite drawn at 6px/cell with
origin (25,6)). Poses are generated parametrically rather than hand-listed, so
in-between frames are cheap: widen a range and the animation gets smoother.
"""
from PIL import Image
import gear_art

SRC = 'C:/Future Me/assets/mascot/boy_a.png'
OUT = 'C:/Future Me/assets/mascot/'
OX, OY, CELL = 25, 6, 6

C = {
    'hood_md': (0x48, 0xC7, 0x74), 'hood_dk': (0x2E, 0x9E, 0x55),
    'hood_lt': (0x7E, 0xDB, 0x8F),
    'skin':    (0xF2, 0xC3, 0x9A), 'skin_lt': (0xF9, 0xD7, 0xB7),
    'skin_sh': (0xE5, 0x9F, 0x7F),
    'phone':   (0x0B, 0x0B, 0x0F), 'screen':  (0x8D, 0xB6, 0xE6),
    'screen2': (0xCF, 0xE3, 0xFF), 'screen3': (0xA7, 0xCB, 0xF2),
    'outline': (0x1A, 0x1A, 0x2E),
    'bubble':  (0xCF, 0xE3, 0xFF), 'dot':     (0x6B, 0x8F, 0xD6),
    'hp_dk':   (0x23, 0x23, 0x30), 'hp_md':   (0x3F, 0x3F, 0x56),
    'hp_lt':   (0x6B, 0x6B, 0x86), 'hp_glow': (0x8D, 0x6D, 0xB8),
    'note_a':  (0x8D, 0x6D, 0xB8), 'note_b':  (0x4B, 0x9F, 0xCC),
    'note_c':  (0xC5, 0x95, 0x2E),
    'spark':   (0xFF, 0xF3, 0xC4),
}


def cell(img, cx, cy, rgb):
    if not (0 <= cx < 24 and 0 <= cy < 32):
        return
    px = img.load()
    for y in range(OY + cy * CELL, OY + (cy + 1) * CELL):
        for x in range(OX + cx * CELL, OX + (cx + 1) * CELL):
            if 0 <= x < img.width and 0 <= y < img.height:
                px[x, y] = rgb + (255,)


def stamp(img, art, col, row, key):
    for dy, line in enumerate(art):
        for dx, ch in enumerate(line):
            if ch != '.':
                cell(img, col + dx, row + dy, C[key[ch]])


# --- arm ---------------------------------------------------------------------
# The idle sleeve is outline col 3, sleeve cols 4-5 rows 19-23, hand cols 4-5
# row 24. Every phone pose erases it and redraws the arm bent, so he never
# appears to grow a second one.
ARM_KEY = {'o': 'outline', 'G': 'hood_md', 'g': 'hood_dk',
           's': 'skin', 'S': 'skin_lt', 'h': 'skin_sh',
           '#': 'phone', 'c': 'screen', 'C': 'screen2', 'B': 'screen3'}
ARM_COL, ARM_ROW = 3, 17
PHONE_LEFT, PHONE_BOTTOM = 7, 23


def clear_arm(img):
    px = img.load()
    for r in range(19, 27):
        for c in range(3, 6):
            for y in range(OY + r * CELL, OY + (r + 1) * CELL):
                for x in range(OX + c * CELL, OX + (c + 1) * CELL):
                    px[x, y] = (0, 0, 0, 0)


def arm_art(phone_top=None, hand_row=24, glint=0):
    """Rows 17-26 x cols 3-13. phone_top=None leaves the phone stowed.

    The phone's bottom is pinned at row 23 and only its top rises, so it reads
    as sliding up out of his pocket instead of floating in front of him.
    """
    grid = [['.'] * 11 for _ in range(10)]

    def put(r, c, ch):
        ri, ci = r - ARM_ROW, c - ARM_COL
        if 0 <= ri < 10 and 0 <= ci < 11:
            grid[ri][ci] = ch

    for r in range(19, hand_row - 1):
        put(r, 3, 'o')
        put(r, 4, 'G')
        put(r, 5, 'G')
    put(hand_row - 1, 3, 'o')
    put(hand_row - 1, 4, 'G')
    put(hand_row - 1, 5, 'g')
    put(hand_row, 3, 'o')
    put(hand_row, 4, 'g')
    put(hand_row, 5, 'g')
    put(hand_row + 1, 4, 'o')
    put(hand_row + 1, 5, 'o')

    if phone_top is not None:
        right = PHONE_LEFT + 5
        for r in range(phone_top, PHONE_BOTTOM + 1):
            for c in range(PHONE_LEFT, right + 1):
                edge = r in (phone_top, PHONE_BOTTOM) or c in (PHONE_LEFT, right)
                put(r, c, '#' if edge else 'c')
        # a highlight that slides down the glass frame to frame, so the phone
        # looks lit rather than like a painted-on rectangle
        span = PHONE_BOTTOM - phone_top
        if span >= 3:
            gr = phone_top + 1 + (glint % (span - 1))
            put(gr, PHONE_LEFT + 2, 'C')
            put(gr + 1, PHONE_LEFT + 3, 'B')
        # fist beside it, fingers curling under, thumb on the glass
        put(hand_row - 2, 6, 's')
        put(hand_row - 1, 6, 's')
        put(hand_row - 1, 7, 's')
        if phone_top <= 21:
            put(21, PHONE_LEFT + 1, 'S')
            put(22, PHONE_LEFT + 1, 'S')
    else:
        put(hand_row, 4, 's')
        put(hand_row, 5, 'h')

    return [''.join(r) for r in grid]


def pose(phone_top=None, hand_row=24, glint=0, base=SRC):
    img = Image.open(base).convert('RGBA') if isinstance(base, str) else base.copy()
    clear_arm(img)
    stamp(img, arm_art(phone_top, hand_row, glint), ARM_COL, ARM_ROW, ARM_KEY)
    return img


# --- transforms --------------------------------------------------------------
def shift(img, dx=0, dy=0):
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (dx, dy), img)
    return out


def tap_foot(img, lift=CELL):
    """Lift his left shoe off the ground -- the foot tap."""
    out = img.copy()
    px, src = out.load(), img.load()
    for r in range(28, 32):
        for c in range(5, 11):
            for y in range(OY + r * CELL, OY + (r + 1) * CELL):
                for x in range(OX + c * CELL, OX + (c + 1) * CELL):
                    if not (0 <= x < img.width and 0 <= y < img.height):
                        continue
                    sy = y + lift
                    # anything shifted in from below the canvas must clear, or
                    # the old shoe stays behind and he ends up with two
                    px[x, y] = src[x, sy] if sy < img.height else (0, 0, 0, 0)
    return out


def with_headphones(img, row=0, glow=False):
    key = dict(gear_art.KEY)
    if glow:
        key['c'] = 'hp_glow'
    stamp(img, gear_art.HEADPHONES, 0, row, key)
    return img


def sprite(art, key):
    w, h = len(art[0]) * CELL, len(art) * CELL
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    px = img.load()
    for y, line in enumerate(art):
        for x, ch in enumerate(line):
            if ch != '.':
                for yy in range(y * CELL, (y + 1) * CELL):
                    for xx in range(x * CELL, (x + 1) * CELL):
                        px[xx, yy] = C[key[ch]] + (255,)
    return img


frames = {}
base = Image.open(SRC).convert('RGBA')
blink = Image.open(OUT + 'boy_blink.png').convert('RGBA')

# --- animation 1: idle breathing --------------------------------------------
# boy_a.png and boy_blink.png are this script's INPUTS (from make_boy_idle.py)
# and are deliberately not regenerated here. Writing them back would re-quantise
# an already-quantised image on every run, and since every other frame derives
# from them the whole set would drift a little further each time.
frames['boy_a2'] = shift(base, dy=2)
frames['boy_b'] = shift(base, dy=4)

# --- animation 2: phone out, texting ----------------------------------------
for i, hand in enumerate((24, 25, 26)):
    frames['reach_%d' % (i + 1)] = pose(hand_row=hand)

# the phone rises one row per frame instead of jumping in three big steps
for i, top in enumerate(range(22, 16, -1)):
    frames['rise_%d' % (i + 1)] = pose(phone_top=top, glint=i)

for i in range(4):
    frames['text_%d' % (i + 1)] = pose(phone_top=17, glint=i)
frames['text_blink'] = pose(phone_top=17, glint=1, base=blink)

# --- animation 3: headphones on, listening ----------------------------------
for i, row in enumerate(range(20, 2, -3)):
    img = pose(phone_top=17, glint=i)
    stamp(img, gear_art.HELD, 14, row, gear_art.KEY)
    frames['gear_%d' % (i + 1)] = img

for i, row in enumerate((-2, -1, 0)):
    frames['wear_%d' % (i + 1)] = with_headphones(pose(phone_top=17), row=row)

for i, top in enumerate(range(17, 23)):
    frames['hp_drop_%d' % (i + 1)] = with_headphones(pose(phone_top=top))
for i, hand in enumerate((26, 25, 24)):
    frames['hp_reach_%d' % (i + 1)] = with_headphones(pose(hand_row=hand))

# listening: sway + bob cycle, foot tapping the beat, cups pulsing on it
SWAY = [(0, 0, 0, 0), (1, 2, 0, 0), (2, 3, 1, 1), (1, 2, 0, 0),
        (0, 0, 0, 0), (-1, 2, 0, 0), (-2, 3, 1, 1), (-1, 2, 0, 0)]
for i, (dx, dy, foot, glow) in enumerate(SWAY):
    img = with_headphones(blink.copy(), glow=bool(glow))
    if foot:
        img = tap_foot(img)
    frames['listen_%d' % (i + 1)] = shift(img, dx=dx, dy=dy)

frames['off_1'] = with_headphones(base.copy(), row=-1)
for i, row in enumerate((4, 11, 18)):
    img = base.copy()
    stamp(img, gear_art.HELD, 14, row, gear_art.KEY)
    frames['off_%d' % (i + 2)] = img

# --- particles ---------------------------------------------------------------
for name, art, glyph in (('note_a', gear_art.NOTE, 'note_a'),
                         ('note_b', gear_art.NOTE_PAIR, 'note_b'),
                         ('note_c', gear_art.NOTE, 'note_c'),
                         ('spark', gear_art.SPARK, 'spark')):
    sprite(art, {'n': glyph, 's': glyph}).save(OUT + name + '.png')

# --- typing bubble -----------------------------------------------------------
# Dots only, never words: he still communicates by action, not speech.
BUBBLE_KEY = {'o': 'outline', 'w': 'bubble', 'd': 'dot'}
BUBBLE_ROWS = ['.oooooo.', 'owwwwwwo', 'oWWWWWWo', 'owwwwwwo', '.oooooo.', '..oo....']
for name, dots in (('bubble_1', 'owdwwwwo'), ('bubble_2', 'owdwdwwo'), ('bubble_3', 'owdwdwdo')):
    sprite([dots if r.startswith('oW') else r for r in BUBBLE_ROWS], BUBBLE_KEY).save(OUT + name + '.png')

# --- save --------------------------------------------------------------------
# Flat pixel art quantises to a tiny palette. Without this each frame is ~50KB
# of JPEG-derived noise, and this many frames would be megabytes of bundle.
for name, img in frames.items():
    # FASTOCTREE is the only method that keeps the alpha channel
    img.convert('RGBA').quantize(colors=64, method=Image.FASTOCTREE).save(
        OUT + name + '.png', optimize=True)
print('%d pose frames' % len(frames))
print(' '.join(sorted(frames)))
