import os
import re

BASE = r"C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711"

files = [
    "history-cover.html",
    "history-detail.html",
    "museum-3d.html",
    "promotion-detail.html",
    "restoration-cover.html",
    "restoration-detail.html",
    "stone-cover.html",
    "stone-detail.html",
    "vessels-cover.html",
    "vessels-detail.html",
    "heritage-unified.html",
    "shanhe-pangui.html",
    "promotion-cover.html",
    "index.html",
    "dazu-rock-carvings.html",
    "museum-huniu.html",
    "museum-jiagu.html",
    "museum-niao.html",
    "museum-index.html",
    "pattern-atlas.html",
    "sanyangzun-3d.html",
    "song-painting.html",
]

# Strategy:
# 1. If nav has restoration-cover and promotion-cover, but no shanhe-pangui:
#    insert <li><a href="shanhe-pangui.html">山河盼归</a></li> BEFORE <li><a href="promotion-cover.html">推广</a></li>
# 2. If nav already has shanhe-pangui after promotion-cover, swap them

def find_nav_block(content):
    # Find first <nav ...>...</nav>
    m = re.search(r'<nav\b[^>]*>(.*?)</nav>', content, re.DOTALL | re.IGNORECASE)
    return m

for fn in files:
    p = os.path.join(BASE, fn)
    if not os.path.exists(p):
        print(f"NOT FOUND: {fn}")
        continue
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    
    has_shanhe = 'shanhe-pangui.html' in content
    has_promo = 'promotion-cover.html' in content
    has_restoration = 'restoration-cover.html' in content
    
    if not has_promo:
        # No nav, skip
        continue
    
    if has_shanhe and not has_restoration:
        # Order might already be correct after manual edit
        continue
    
    if has_shanhe and has_promo:
        # Both present, check order
        promo_pos = content.find('promotion-cover.html')
        shanhe_pos = content.find('shanhe-pangui.html')
        if shanhe_pos > 0 and promo_pos > 0 and shanhe_pos < promo_pos:
            # Already in correct order
            print(f"OK: {fn}")
            continue
    
    if has_shanhe and has_promo and has_restoration:
        # Need to swap shanhe/promo order
        # Use the new regex pattern: restoration - shanhe - promo
        old_pat = re.compile(
            r'(<li><a href="restoration-cover\.html">文物修复</a></li>\s*)'
            r'<li><a href="promotion-cover\.html">推广</a></li>(\s*)'
            r'<li><a href="shanhe-pangui\.html">山河盼归</a></li>',
            re.DOTALL
        )
        if old_pat.search(content):
            new_content = old_pat.sub(
                r'\1<li><a href="shanhe-pangui.html">山河盼归</a></li>\2<li><a href="promotion-cover.html">推广</a></li>',
                content
            )
            with open(p, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"SWAPPED: {fn}")
        else:
            print(f"NO SWAP PATTERN: {fn}")
        continue
    
    if not has_shanhe and has_promo and has_restoration:
        # Need to insert shanhe before promo
        old_pat = re.compile(
            r'(<li><a href="restoration-cover\.html">文物修复</a></li>\s*)'
            r'<li><a href="promotion-cover\.html">推广</a></li>',
            re.DOTALL
        )
        if old_pat.search(content):
            new_content = old_pat.sub(
                r'\1<li><a href="shanhe-pangui.html">山河盼归</a></li>            <li><a href="promotion-cover.html">推广</a></li>',
                content
            )
            with open(p, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"INSERTED: {fn}")
        else:
            print(f"NO INSERT PATTERN: {fn}")
        continue
    
    print(f"SKIPPED: {fn}")
