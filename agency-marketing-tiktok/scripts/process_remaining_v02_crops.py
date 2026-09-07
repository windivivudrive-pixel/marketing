import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GEN_DIR = ROOT / "public/ep004/v02/generated"
CROPS_DIR = ROOT / "public/ep004/v02/crops"
CROPS_DIR.mkdir(parents=True, exist_ok=True)

def key_magenta(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    magentaness = np.minimum(r, b) - g
    alpha = np.clip(1.0 - (magentaness - 20) / 40.0, 0.0, 1.0)
    arr[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    alpha_smooth = cv2.GaussianBlur(arr[:, :, 3].astype(np.uint8), (3, 3), 0)
    arr[:, :, 3] = alpha_smooth
    res = Image.fromarray(arr.astype(np.uint8))
    bbox = res.getbbox()
    return res.crop(bbox) if bbox else res

def key_green(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1.0 - (greenness - 20) / 40.0, 0.0, 1.0)
    spill = greenness > 0
    arr[spill, 1] = np.maximum(arr[spill, 0], arr[spill, 2])
    arr[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    alpha_smooth = cv2.GaussianBlur(arr[:, :, 3].astype(np.uint8), (3, 3), 0)
    arr[:, :, 3] = alpha_smooth
    res = Image.fromarray(arr.astype(np.uint8))
    bbox = res.getbbox()
    return res.crop(bbox) if bbox else res

# Process s06, s10, s16
p_s06 = GEN_DIR / "s06-under-ripe-segment-green-v01.png"
if p_s06.exists():
    c_s06 = key_green(Image.open(p_s06))
    c_s06.save(CROPS_DIR / "s06.png")
    print(f"Saved: s06.png ({c_s06.size})")

p_s10 = GEN_DIR / "s10-tasting-counter-magenta-v01.png"
if p_s10.exists():
    c_s10 = key_magenta(Image.open(p_s10))
    c_s10.save(CROPS_DIR / "s10.png")
    print(f"Saved: s10.png ({c_s10.size})")

p_s16 = GEN_DIR / "s16-durian-desserts-green-v01.png"
if p_s16.exists():
    c_s16 = key_green(Image.open(p_s16))
    c_s16.save(CROPS_DIR / "s16.png")
    print(f"Saved: s16.png ({c_s16.size})")

print("\n--- Summary of all v02 crops ---")
for p in sorted(CROPS_DIR.glob("*.png")):
    img = Image.open(p)
    print(f"Crop: {p.name} ({img.size})")
