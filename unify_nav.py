import re
import os

BASE = r'C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711'

STANDARD_CSS = """
/* ===== Unified Navigation ===== */
.nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    padding: 1.2rem 3rem;
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201, 169, 98, 0.15);
}
.nav-logo {
    font-family: 'Ma Shan Zheng', cursive;
    font-size: 1.6rem;
    color: #c9a962;
    text-decoration: none;
    letter-spacing: 0.1em;
}
.nav-links { display: flex; list-style: none; gap: 1.8rem; }
.nav-links a {
    color: #8a8578;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;
    position: relative;
    padding: 0.4rem 0;
}
.nav-links a::after {
    content: '';
    position: absolute; bottom: 0; left: 0;
    width: 0; height: 1px;
    background: #c9a962;
    transition: width 0.3s ease;
}
.nav-links a:hover, .nav-links a.active { color: #c9a962; }
.nav-links a:hover::after, .nav-links a.active::after { width: 100%; }
@media (max-width: 768px) {
    .nav { padding: 0.8rem 1.2rem; }
    .nav-logo { font-size: 1.3rem; }
    .nav-links { gap: 1rem; }
    .nav-links a { font-size: 0.78rem; }
}
"""

LINKS = [
    ('index.html', '首页'),
    ('heritage-unified.html', '文明长卷'),
    ('restoration-cover.html', '文物修复'),
    ('shanhe-pangui.html', '山河盼归'),
    ('promotion-cover.html', '推广'),
]

ACTIVE_MAP = {
    'index.html': '首页',
    'heritage-unified.html': '文明长卷',
    'vessels-cover.html': '文明长卷',
    'stone-cover.html': '文明长卷',
    'history-cover.html': '文明长卷',
    'vessels-detail.html': '文明长卷',
    'stone-detail.html': '文明长卷',
    'history-detail.html': '文明长卷',
    'dazu-rock-carvings.html': '文明长卷',
    'restoration-cover.html': '文物修复',
    'restoration-detail.html': '文物修复',
    'pattern-atlas.html': '文物修复',
    'shanhe-pangui.html': '山河盼归',
    'shanhe-detail.html': '山河盼归',
    'promotion-cover.html': '推广',
    'promotion-detail.html': '推广',
    'song-painting.html': '推广',
    'museum-3d.html': '推广',
}

NEEDS_BODY_PADDING = {
    'shanhe-detail.html', 'song-painting.html', 'pattern-atlas.html',
}

def build_nav_html(filename):
    active = ACTIVE_MAP.get(filename, '')
    nav_id = ' id="mainNav"' if filename == 'index.html' else ''
    items = ''
    for href, label in LINKS:
        if filename == 'index.html' and href == 'index.html':
            href = '#hero'
        cls = ' class="active"' if label == active else ''
        items += f'\n            <li><a href="{href}"{cls}>{label}</a></li>'
    return f'''<nav class="nav"{nav_id}>
    <a href="index.html" class="nav-logo">中华文物</a>
    <ul class="nav-links">{items}
    </ul>
</nav>'''


def process(filepath):
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    nav_html = build_nav_html(fname)

    # --- Replace nav HTML ---
    patterns = [
        (re.compile(r'<nav\b[^>]*>.*?</nav>', re.DOTALL), nav_html),
        (re.compile(r'<div\b[^>]*class="topbar"[^>]*>.*?</div>', re.DOTALL), nav_html),
        (re.compile(r'<a\b[^>]*class="back-btn"[^>]*>.*?</a>', re.DOTALL), nav_html),
    ]
    replaced = False
    for pat, repl in patterns:
        if pat.search(content):
            content = pat.sub(lambda m: repl, content, count=1)
            replaced = True
            break

    if not replaced:
        m = re.search(r'<body\b[^>]*>', content, re.IGNORECASE)
        if m:
            idx = m.end()
            content = content[:idx] + '\n' + nav_html + '\n' + content[idx:]

    # --- Remove old nav-related CSS ---
    css_remove_patterns = [
        r'/\*[\s\S]*?导航[\s\S]*?\*/',
        r'\.nav\b\s*\{[^}]*\}',
        r'\.nav\.scrolled\s*\{[^}]*\}',
        r'\.nav-logo\s*\{[^}]*\}',
        r'\.nav-links\s*\{[^}]*\}',
        r'\.nav-links\s+a\s*\{[^}]*\}',
        r'\.nav-links\s+a::after\s*\{[^}]*\}',
        r'\.nav-links\s+a:hover[^{]*\{[^}]*\}',
        r'\.nav-links\s+a\.active[^{]*\{[^}]*\}',
        r'\.nav-links\s+a:hover::after\s*\{[^}]*\}',
        r'\.nav-links\s+a\.active::after\s*\{[^}]*\}',
        r'\.nav-left\s*\{[^}]*\}',
        r'\.back-link\b[^{]*\{[^}]*\}',
        r'\.topbar\b[^{]*\{[^}]*\}',
        r'\.topbar-back\b[^{]*\{[^}]*\}',
        r'\.topbar-title\b[^{]*\{[^}]*\}',
        r'\.back-btn\b[^{]*\{[^}]*\}',
    ]
    for pat in css_remove_patterns:
        content = re.sub(pat, '', content)

    # --- Insert standard CSS before last </style> ---
    css_block = STANDARD_CSS
    if fname in NEEDS_BODY_PADDING:
        css_block += "\nbody { padding-top: 4.5rem; }\n"

    last_style_close = content.rfind('</style>')
    if last_style_close != -1:
        content = content[:last_style_close] + css_block + '\n' + content[last_style_close:]

    # Clean up excessive blank lines
    content = re.sub(r'\n{4,}', '\n\n\n', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {fname}')


FILES = [
    'index.html', 'heritage-unified.html', 'promotion-cover.html',
    'promotion-detail.html', 'restoration-cover.html', 'restoration-detail.html',
    'vessels-cover.html', 'stone-cover.html', 'history-cover.html',
    'vessels-detail.html', 'stone-detail.html', 'history-detail.html',
    'museum-3d.html', 'shanhe-pangui.html', 'shanhe-detail.html',
    'song-painting.html', 'pattern-atlas.html', 'dazu-rock-carvings.html',
]

for fn in FILES:
    fp = os.path.join(BASE, fn)
    if os.path.exists(fp):
        process(fp)
    else:
        print(f'MISSING: {fn}')
