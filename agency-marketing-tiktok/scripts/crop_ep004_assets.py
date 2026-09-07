import os
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public/ep004/v01/crops"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def remove_chroma_green(img: Image.Image, tolerance=55) -> Image.Image:
    """Removes bright green background #00FF00 and makes it transparent alpha."""
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Distance to pure green (0, 255, 0)
    is_green = (g > 150) & (g > r + 35) & (g > b + 35)
    
    # Set alpha to 0 where green
    arr[:,:,3] = np.where(is_green, 0, 255)
    
    # Smooth alpha boundary
    result = Image.fromarray(arr.astype(np.uint8))
    return result

def crop_and_save(img_path: str, box: tuple, out_name: str):
    full_img = Image.open(img_path)
    w, h = full_img.size
    
    # box is in normalized coordinates (left, top, right, bottom)
    l, t, r, b = int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)
    cropped = full_img.crop((l, t, r, b))
    alpha_img = remove_chroma_green(cropped)
    
    # Auto-trim transparent borders
    bbox = alpha_img.getbbox()
    if bbox:
        alpha_img = alpha_img.crop(bbox)
        
    out_path = OUT_DIR / out_name
    alpha_img.save(out_path, "PNG")
    print(f"Saved: {out_path.name} ({alpha_img.size})")

sheet1 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s01_durian_prices_1786786213807.jpg"
sheet2 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s02_durian_scene_1786786509987.jpg"
sheet3 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s03_supply_dessert_1786786702431.jpg"
sheet4 = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/s04_wisdom_closing_1786786766361.jpg"

print("Cropping Sheet 1...")
crop_and_save(sheet1, (0.05, 0.05, 0.95, 0.50), "s01-durian-market.png")
crop_and_save(sheet1, (0.05, 0.50, 0.95, 0.95), "s02-durian-box-golden.png")

print("Cropping Sheet 2...")
crop_and_save(sheet2, (0.05, 0.05, 0.52, 0.50), "s03-ngoc-storefront.png")
crop_and_save(sheet2, (0.52, 0.05, 0.95, 0.50), "s04-customer-queue.png")
crop_and_save(sheet2, (0.05, 0.50, 0.52, 0.95), "s05-lottery-wheel.png")
crop_and_save(sheet2, (0.52, 0.50, 0.95, 0.95), "s06-durian-suong.png")

print("Cropping Sheet 3...")
crop_and_save(sheet3, (0.05, 0.05, 0.52, 0.50), "s07-peeling-counter.png")
crop_and_save(sheet3, (0.52, 0.05, 0.95, 0.50), "s08-guarantee-seal.png")
crop_and_save(sheet3, (0.05, 0.50, 0.52, 0.95), "s09-freezer-unit.png")
crop_and_save(sheet3, (0.52, 0.50, 0.95, 0.95), "s10-fnb-desserts.png")

print("Cropping Sheet 4...")
crop_and_save(sheet4, (0.05, 0.05, 0.52, 0.50), "s11-diamond-core.png")
crop_and_save(sheet4, (0.52, 0.05, 0.95, 0.50), "s12-no-sale-sign.png")
crop_and_save(sheet4, (0.05, 0.50, 0.52, 0.95), "s13-green-shield.png")
crop_and_save(sheet4, (0.52, 0.50, 0.95, 0.95), "s14-celebration-confetti.png")

print("All EP004 assets cropped and transparently keyed!")
