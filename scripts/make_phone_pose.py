from PIL import Image

SRC = r'C:/Users/nadel/AppData/Local/Temp/claude/C--Future-Me/98771928-88ac-4be4-8b76-20e04741defe/images/15.webp'
OUT = 'C:/Future Me/assets/mascot/'

base = Image.open(SRC).convert('RGBA')
CHAR_BOX = (347, 322, 683, 756)

base.crop(CHAR_BOX).save(OUT + 'phone_a.png')

blink = base.copy()
bpx = blink.load()
SKIN = (254, 193, 136, 255)
EYES = [(442, 480, 473, 524), (535, 480, 565, 524)]
for x0, y0, x1, y1 in EYES:
    for y in range(y0, y1):
        for x in range(x0, x1):
            bpx[x, y] = SKIN
    mid = (y0 + y1) // 2
    for x in range(x0, x1):
        bpx[x, mid] = (60, 40, 30, 255)
        bpx[x, mid + 1] = (60, 40, 30, 255)

blink.crop(CHAR_BOX).save(OUT + 'phone_blink.png')

HEART_BOX = (274, 261, 375, 347)
STAR_BOX = (719, 354, 819, 454)
base.crop(HEART_BOX).save(OUT + 'heart.png')
base.crop(STAR_BOX).save(OUT + 'star.png')

print('done', base.crop(CHAR_BOX).size)
