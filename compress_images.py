import os, sys
from PIL import Image

BASE = r'C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711\images'
MAX_WIDTH = 1600
QUALITY = 75

total_before = 0
total_after = 0
count = 0

for fname in os.listdir(BASE):
    if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    fpath = os.path.join(BASE, fname)
    orig_size = os.path.getsize(fpath)
    total_before += orig_size
    
    try:
        img = Image.open(fpath)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        w, h = img.size
        if w > MAX_WIDTH:
            ratio = MAX_WIDTH / w
            img = img.resize((MAX_WIDTH, int(h * ratio)), Image.LANCZOS)
        img.save(fpath, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
        new_size = os.path.getsize(fpath)
        total_after += new_size
        count += 1
        if orig_size - new_size > 1024:
            print(f'{fname}: {orig_size//1024}KB -> {new_size//1024}KB')
    except Exception as e:
        total_after += orig_size
        print(f'SKIP {fname}: {e}')

print(f'\n{count} images compressed')
print(f'Before: {total_before/1024/1024:.1f} MB')
print(f'After:  {total_after/1024/1024:.1f} MB')
print(f'Saved:  {(total_before-total_after)/1024/1024:.1f} MB ({(1-total_after/total_before)*100:.0f}%)')
