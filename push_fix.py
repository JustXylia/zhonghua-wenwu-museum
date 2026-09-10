import requests
import base64
import json
import os

REPO = "JustXylia/zhonghua-wenwu-museum"
BRANCH = "main"
FILE_PATH = "index.html"

token_env = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
if not token_env:
    for v in ["GH_TOKEN", "GITHUB_TOKEN"]:
        try:
            import subprocess
            r = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=10)
            token_env = r.stdout.strip()
            if token_env:
                break
        except:
            pass

if not token_env:
    print("ERROR: No GitHub token found")
    exit(1)

headers = {
    "Authorization": f"token {token_env}",
    "Accept": "application/vnd.github.v3+json"
}

# Get current file SHA
api_base = f"https://api.github.com/repos/{REPO}"
r = requests.get(f"{api_base}/contents/{FILE_PATH}?ref={BRANCH}", headers=headers, timeout=30)
if r.status_code == 404:
    sha = None
    print("File not found on GitHub, will create new")
else:
    r.raise_for_status()
    sha = r.json().get("sha")
    print(f"Got SHA: {sha[:12]}...")

# Read local file
local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), FILE_PATH)
with open(local_path, "r", encoding="utf-8") as f:
    content = f.read()

print(f"Local file size: {len(content)} chars")

# Push update
data = {
    "message": "fix: Canvas加载中卡死 - 添加onerror回调+移除crossOrigin",
    "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
    "branch": BRANCH
}
if sha:
    data["sha"] = sha

r = requests.put(f"{api_base}/contents/{FILE_PATH}", headers=headers, json=data, timeout=60)
if r.status_code in (200, 201):
    print(f"SUCCESS: pushed {FILE_PATH} to {REPO}:{BRANCH}")
    print(f"Commit: {r.json().get('commit', {}).get('sha', 'N/A')[:12]}")
else:
    print(f"FAILED: {r.status_code} {r.text[:200]}")
