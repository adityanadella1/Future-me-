"""Render preview GIFs of the mascot animations.

Mirrors the sequences in components/Mascot.tsx. The floating particles, typing
bubble and spark burst are React overlays in the app, so they are re-simulated
here just for the preview.
"""
from PIL import Image
import math
import random

OUT = 'C:/Future Me/assets/mascot/'
W, H = 200, 215
BG = (246, 239, 225, 255)

cache = {}


def load(name):
    if name not in cache:
        cache[name] = Image.open(OUT + name + '.png').convert('RGBA')
    return cache[name]


def hold(f, n):
    return [f] * n


def run(fs, each):
    return [f for f in fs for _ in range(each)]


RISE = ['rise_%d' % i for i in range(1, 7)]
GEAR = ['gear_%d' % i for i in range(1, 7)]
DROP = ['hp_drop_%d' % i for i in range(1, 7)]
LISTEN = ['listen_%d' % i for i in range(1, 9)]
TEXT_CYCLE = ['text_1', 'text_2', 'text_3', 'text_4']
BREATH = ['boy_a', 'boy_a2', 'boy_b', 'boy_a2']

IDLE = run(BREATH, 14) * 2 + hold('boy_a', 10) + hold('boy_blink', 7) + hold('boy_a', 12)

PHONE = (hold('reach_1', 5) + hold('reach_2', 6) + hold('reach_3', 10)
         + run(RISE, 5)
         + run(TEXT_CYCLE, 13) * 2
         + hold('text_1', 8) + hold('text_blink', 7) + hold('text_2', 10)
         + run(TEXT_CYCLE, 13)
         + run(list(reversed(RISE)), 5)
         + hold('reach_3', 10) + hold('reach_2', 6) + hold('reach_1', 5))

MUSIC = (hold('reach_1', 5) + hold('reach_2', 6) + hold('reach_3', 10)
         + run(RISE, 5) + hold('text_1', 12)
         + run(GEAR, 8)
         + hold('wear_1', 6) + hold('wear_2', 6) + hold('wear_3', 10)
         + run(DROP, 5)
         + hold('hp_reach_1', 8) + hold('hp_reach_2', 6) + hold('hp_reach_3', 6)
         + run(LISTEN, 11) * 3
         + hold('off_1', 8) + hold('off_2', 8) + hold('off_3', 8) + hold('off_4', 10))

TEXTING = set(TEXT_CYCLE) | {'text_blink'}


def render(names, path, seed=3):
    rng = random.Random(seed)
    live = []
    sparks = []
    out = []
    bub = [load('bubble_%d' % i).resize((73, 55)) for i in (1, 2, 3)]
    for i, name in enumerate(names):
        bg = Image.new('RGBA', (W, H), BG)
        bg.alpha_composite(load(name))

        if name in TEXTING:
            bg.alpha_composite(bub[(i // 19) % 3], (127, 18))
            if i % 30 == 0:
                live.append([load(rng.choice(['heart', 'star'])).resize((42, 42)),
                             70, 118, 0, rng.uniform(-6, 6), rng.uniform(0, 6.28)])
        if name in LISTEN and i % 20 == 0:
            live.append([load(rng.choice(['note_a', 'note_b', 'note_c'])).resize((44, 60)),
                         126, 118, 0, rng.uniform(-6, 6), rng.uniform(0, 6.28)])
        if name == 'wear_3' and not sparks:
            for ang in (-70, -35, 0, 35, 70, 110):
                sparks.append([load('spark').resize((30, 30)), ang, 0])

        for p in live:
            p[3] += 1
        live = [p for p in live if p[3] < 84]
        for img, x, y0, age, dx, ph in live:
            t = age / 84
            a = img.copy()
            a.putalpha(a.getchannel('A').point(lambda v, t=t: int(v * max(0.0, 1 - t))))
            ox = int(dx * age / 8 + math.sin(ph + t * 6.28) * 14)
            out_y = int(y0 - age * 1.5)
            bg.alpha_composite(a, (x + ox, out_y))

        for s in sparks:
            s[2] += 1
        sparks = [s for s in sparks if s[2] < 38]
        for img, ang, age in sparks:
            t = age / 38
            a = img.copy()
            a.putalpha(a.getchannel('A').point(lambda v, t=t: int(v * max(0.0, 1 - t))))
            rad = math.radians(ang)
            bg.alpha_composite(a, (int(72 + math.sin(rad) * 70 * t),
                                   int(18 - math.cos(rad) * 70 * t)))

        out.append(bg.convert('RGB'))

    out = out[::2]
    out[0].save(path, save_all=True, append_images=out[1:], duration=33, loop=0)
    print(path, len(out), 'frames')


render(IDLE + PHONE + IDLE, 'C:/Future Me/scripts/mascot_preview.gif')
render(IDLE[:60] + MUSIC + IDLE[:60], 'C:/Future Me/scripts/mascot_music.gif')
