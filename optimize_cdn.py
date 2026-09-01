import os, re

BASE = r'C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711'
count = 0

for fname in os.listdir(BASE):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    # 1. Replace Google Fonts with loli.net mirror (China-accessible)
    content = content.replace('fonts.googleapis.com', 'fonts.loli.net')
    content = content.replace('fonts.gstatic.com', 'gstatic.loli.net')

    # 2. Replace unpkg with jsdelivr (better China CDN)
    content = content.replace(
        'https://unpkg.com/three@0.160.0/build/three.module.js',
        'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
    )
    content = content.replace(
        'https://unpkg.com/three@0.160.0/examples/jsm/',
        'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/'
    )

    # 3. Add loading="lazy" to img tags that don't have it
    content = re.sub(
        r'<img(?![^>]*loading=)([^>]*)src=',
        r'<img\1loading="lazy" src=',
        content
    )

    # 4. Add preconnect for font CDN (if not already present)
    if 'fonts.loli.net' in content and 'preconnect' not in content.split('fonts.loli.net')[0][-200:]:
        content = content.replace(
            '<link rel="preconnect"',
            '<link rel="preconnect" href="https://gstatic.loli.net" crossorigin>\n    <link rel="preconnect"',
            1
        ) if '<link rel="preconnect"' in content else content

    if content != orig:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'OK: {fname}')

print(f'\n{count} files optimized')
