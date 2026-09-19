"""Headphones + music-note art for animation 3.

Anchored at sprite cell (0,0) over the 24x32 grid. '.' keeps the underlying
pixels. The head is: hair top row 0 cols 6-15, ears cols 2-3 / 19-20 rows 11-14,
face cols 4-18 rows 11-16 -- the band follows that silhouette down to the cups.
"""

KEY = {'k': 'hp_dk', 'K': 'hp_lt', 'c': 'hp_md'}

#        0123456789012345678901234
HEADPHONES = [
    '......KKKKKKKKKK........',  # 0  band over the hair
    '....KK..........KK......',  # 1
    '...K..............K.....',  # 2
    '..k................k....',  # 3
    '..k................k....',  # 4
    '..k................k....',  # 5
    '..k................k....',  # 6
    '..k................k....',  # 7
    '..k................k....',  # 8
    '..k................k....',  # 9
    '..k................k....',  # 10
    '.kkk..............kkk...',  # 11 ear cups
    '.kck..............kck...',  # 12
    '.kck..............kck...',  # 13
    '.kkk..............kkk...',  # 14
]

# Headphones held in his hand before they go on: band across the top, cups below.
HELD = [
    '.KKKK.',
    'kk..kk',
    'kc..ck',
    'kc..ck',
    '.k..k.',
]

# Music notes that float up while he listens.
NOTE = [
    '..nn',
    '..n.',
    '..n.',
    '..n.',
    'nnn.',
    'nnn.',
]
NOTE_PAIR = [
    '.nnnn',
    '.n..n',
    '.n..n',
    'nn.nn',
    'nn.nn',
    '.....',
]


# Burst drawn when the headphones land on his head.
SPARK = [
    '..s..',
    '..s..',
    's.s.s',
    '.sss.',
    's.s.s',
    '..s..',
]
