from PIL import Image

SRC = r'C:/Users/nadel/AppData/Local/Temp/claude/C--Future-Me/98771928-88ac-4be4-8b76-20e04741defe/images/14.jpg'
OUT = 'C:/Future Me/assets/mascot/'
BBOX = (95, 90, 295, 305)

LOW, HIGH = 235, 250  # whiteness thresholds for background removal

def to_transparent(img_rgb):
    img_rgb = img_rgb.convert('RGB')
    w, h = img_rgb.size
    out = Image.new('RGBA', (w, h))
    src = img_rgb.load()
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            m = min(r, g, b)
            if m >= HIGH:
                a = 0
            elif m <= LOW:
                a = 255
            else:
                a = int(255 * (HIGH - m) / (HIGH - LOW))
            dst[x, y] = (r, g, b, a)
    return out

base = to_transparent(Image.open(SRC))
w, h = base.size

def save_cropped(img, name):
    img.crop(BBOX).save(OUT + name)

save_cropped(base, 'boy_a.png')

# Breathing exhale: paste onto a transparent canvas shifted down 3px.
shifted = Image.new('RGBA', (w, h), (0, 0, 0, 0))
shifted.paste(base, (0, 3), base)
save_cropped(shifted, 'boy_b.png')

# Blink: paint over both eye blobs with locally-sampled skin tone (opaque) + a lid line.
blink = base.copy()
bpx = blink.load()
src_rgb = Image.open(SRC).convert('RGB')

EYES = [
    {'box': (162, 163, 172, 183), 'skin_x': 152, 'skin_y': 173},
    {'box': (202, 163, 211, 183), 'skin_x': 220, 'skin_y': 173},
]

for eye in EYES:
    x0, y0, x1, y1 = eye['box']
    r, g, b = src_rgb.getpixel((eye['skin_x'], eye['skin_y']))
    for y in range(y0, y1):
        for x in range(x0, x1):
            bpx[x, y] = (r, g, b, 255)
    mid = (y0 + y1) // 2
    for x in range(x0, x1):
        bpx[x, mid] = (60, 40, 30, 255)
        bpx[x, mid + 1] = (60, 40, 30, 255)

save_cropped(blink, 'boy_blink.png')
print('done')
