import json
import subprocess
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

# Process truck
truck_file = GEN_DIR / "s03-ngoc-durian-truck-v02.png"
if truck_file.exists():
    clean_truck = key_magenta(Image.open(truck_file))
    clean_truck.save(CROPS_DIR / "s03.png")
    print(f"Saved: s03.png ({clean_truck.size})")

# Let's inspect all files in crops
for p in sorted(CROPS_DIR.glob("*.png")):
    img = Image.open(p)
    print(f"Crop available: {p.name} ({img.size})")
