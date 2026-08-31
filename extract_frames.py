import cv2
import os

video_path = r"C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711\reference.mp4"
out_dir = r"C:\Users\a0712\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a1e8f1a871f68dd8b293711\frames"
os.makedirs(out_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total / fps if fps else 0
print(f"FPS: {fps:.2f}, total frames: {total}, duration: {duration:.2f}s")

# extract 1 frame every 3 seconds
step = int(fps * 3) if fps > 0 else 30
saved = 0
i = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    if i % step == 0:
        h, w = frame.shape[:2]
        scale = 720 / w
        nh = int(h * scale)
        small = cv2.resize(frame, (720, nh), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(out_dir, f"frame_{saved:03d}.jpg"), small, [cv2.IMWRITE_JPEG_QUALITY, 85])
        saved += 1
    i += 1
cap.release()
print(f"Saved {saved} frames to {out_dir}")
