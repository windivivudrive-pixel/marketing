import cv2
import numpy as np
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public/ep004/v01/crops"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_white_cutout(img_path: str, out_name: str, tolerance=15):
    """
    Cleans solid white background with flood fill and edge anti-aliasing.
    Preserves paper border drop shadows and avoids jagged clipping.
    """
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)
    
    # RGB channels
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    
    # White background threshold: close to 255 on all channels
    is_white = (r > 242) & (g > 242) & (b > 242)
    
    # We use flood fill from the 4 corners to only remove outer background (not inner whites)
    h, w = is_white.shape
    mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    mask_in = is_white.astype(np.uint8)
    
    # OpenCV floodFill
    cv2.floodFill(mask_in, mask, (0, 0), 2)
    cv2.floodFill(mask_in, mask, (w - 1, 0), 2)
    cv2.floodFill(mask_in, mask, (0, h - 1), 2)
    cv2.floodFill(mask_in, mask, (w - 1, h - 1), 2)
    
    outer_bg = (mask_in == 2)
    
    # Smooth edges with 3x3 gaussian blur for antialiasing
    alpha = np.where(outer_bg, 0, 255).astype(np.uint8)
    alpha_smooth = cv2.GaussianBlur(alpha, (3, 3), 0)
    
    arr[:, :, 3] = alpha_smooth
    
    result = Image.fromarray(arr)
    bbox = result.getbbox()
    if bbox:
        # Pad slightly
        l = max(0, bbox[0] - 4)
        t = max(0, bbox[1] - 4)
        r = min(w, bbox[2] + 4)
        b = min(h, bbox[3] + 4)
        result = result.crop((l, t, r, b))
        
    out_path = OUT_DIR / out_name
    result.save(out_path, "PNG")
    print(f"Processed clean cutout: {out_path.name} ({result.size})")

truck_path = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/ngoc_durian_truck_1786788086504.jpg"
queue_path = "/Users/win/.gemini/antigravity/brain/1e868252-e5d4-4463-8682-f8f73adb8a3e/ngoc_queue_scene_1786788108037.jpg"

clean_white_cutout(truck_path, "s03-ngoc-storefront.png")
clean_white_cutout(queue_path, "s04-customer-queue.png")
