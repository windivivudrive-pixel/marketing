import os
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public/ep004/v01/crops"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_chroma_antialiased(img: Image.Image) -> Image.Image:
    """Removes green background with smooth feathering and spill suppression."""
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Distance to green
    greenness = g - np.maximum(r, b)
    
    # Smooth alpha ramp
    alpha = np.clip(1.0 - (greenness - 20) / 40.0, 0.0, 1.0)
    
    # Green spill suppression: clamp green channel to max(r, b) where alpha < 1
    spill_mask = greenness > 0
    arr[spill_mask, 1] = np.maximum(arr[spill_mask, 0], arr[spill_mask, 2])
    
    # Apply alpha
    arr[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    
    # Blur alpha slightly for buttery smooth edges
    alpha_channel = arr[:, :, 3].astype(np.uint8)
    alpha_smooth = cv2.GaussianBlur(alpha_channel, (3, 3), 0)
    arr[:, :, 3] = alpha_smooth
    
    result = Image.fromarray(arr.astype(np.uint8))
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
    return result

def crop_and_process(img_path: str, box: tuple, out_name: str):
    full_img = Image.open(img_path)
    w, h = full_img.size
    l, t, r, b = int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)
    cropped = full_img.crop((l, t, r, b))
    clean_img = clean_chroma_antialiased(cropped)
    out_path = OUT_DIR / out_name
    clean_img.save(out_path, "PNG")
    print(f"Refined antialiased asset: {out_name} ({clean_img.size})")

sheet1 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s01_durian_prices_1786786213807.jpg"
sheet2 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s02_durian_scene_1786786509987.jpg"
sheet3 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s03_supply_dessert_1786786702431.jpg"
sheet4 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s04_wisdom_closing_1786786766361.jpg"

print("Reprocessing sheet assets with anti-aliasing and spill reduction...")
crop_and_process(sheet1, (0.05, 0.05, 0.95, 0.50), "s01-durian-market.png")
crop_and_process(sheet1, (0.05, 0.50, 0.95, 0.95), "s02-durian-box-golden.png")

crop_and_process(sheet2, (0.05, 0.50, 0.52, 0.95), "s05-lottery-wheel.png")
crop_and_process(sheet2, (0.52, 0.50, 0.95, 0.95), "s06-durian-suong.png")

crop_and_process(sheet3, (0.05, 0.05, 0.52, 0.50), "s07-peeling-counter.png")
crop_and_process(sheet3, (0.52, 0.05, 0.95, 0.50), "s08-guarantee-seal.png")
crop_and_process(sheet3, (0.05, 0.50, 0.52, 0.95), "s09-freezer-unit.png")
crop_and_process(sheet3, (0.52, 0.50, 0.95, 0.95), "s10-fnb-desserts.png")

crop_and_process(sheet4, (0.05, 0.05, 0.52, 0.50), "s11-diamond-core.png")
crop_and_process(sheet4, (0.52, 0.05, 0.95, 0.50), "s12-no-sale-sign.png")
crop_and_process(sheet4, (0.05, 0.50, 0.52, 0.95), "s13-green-shield.png")
crop_and_process(sheet4, (0.52, 0.50, 0.95, 0.95), "s14-celebration-confetti.png")

print("All assets refined and anti-aliased!")
