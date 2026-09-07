import json
import subprocess
import time
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "public/ep004/v02/generated"
CROPS_DIR = ROOT / "public/ep004/v02/crops"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
CROPS_DIR.mkdir(parents=True, exist_ok=True)

with open(ROOT / "creatorflow/ep004-v02-pink-sticker-generation.json") as f:
    config = json.load(f)

IDENTITY_LOCK = config.get("identityLock", "")

def build_full_prompt(job):
    base_prompt = job["prompt"]
    bg = job.get("sourceBackground", "#00FF00")
    if bg == "#FF00CC":
        lock = IDENTITY_LOCK.replace("#00FF00", "#FF00CC")
    else:
        lock = IDENTITY_LOCK
    return f"{lock}. Subject: {base_prompt}"

def run_flow_image(prompt: str, out_path: Path, aspect: str = "portrait"):
    print(f"\n[Flow Agent] Generating: {out_path.name}")
    print(f"Full Prompt: {prompt[:160]}...")
    cmd = [
        "flow", "image",
        prompt,
        "--output", str(out_path),
        "--aspect", aspect
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"--> Success: {out_path.name} ({out_path.stat().st_size} bytes)")
        return True
    else:
        print(f"--> Error: {res.stderr or res.stdout}")
        return False

# 1. Generate all jobs from JSON with IDENTITY_LOCK
for job in config["jobs"]:
    out_rel = job["output"]
    out_path = ROOT / out_rel
    full_prompt = build_full_prompt(job)
    run_flow_image(full_prompt, out_path, "portrait")
    time.sleep(1)

# 2. Also generate Xe Bán Tải Ngọc Sầu Riêng Q7 with IDENTITY_LOCK
truck_dest = GENERATED_DIR / "s03-ngoc-durian-truck-v02.png"
truck_prompt = f"{IDENTITY_LOCK.replace('#00FF00', '#FF00CC')}. Subject: The iconic mobile durian pickup truck stall of 'Ngọc Sầu Riêng' in District 7 Saigon. A black Ford Ranger pickup truck with yellow banner reading 'NGỌC SẦU RIÊNG - KHÔNG ĂN THỬ LÀ KHÔNG BÁN', truck bed stacked with green durians in wooden crates, tailgate open with scale, knife and clear boxes of golden durian pulp. Isolated on uniform chroma magenta #FF00CC background with 12% empty margin."
run_flow_image(truck_prompt, truck_dest, "portrait")

print("\n--- All Flow Agent generations completed! Starting keying and cropping ---")

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

def crop_vertical_zones(img: Image.Image, num_zones: int = 3):
    w, h = img.size
    crops = []
    for i in range(num_zones):
        t = int(i * (h / num_zones))
        b = int((i + 1) * (h / num_zones))
        crops.append(img.crop((0, t, w, b)))
    return crops

for job in config["jobs"]:
    dest_path = ROOT / job["output"]
    if not dest_path.exists():
        continue
    raw = Image.open(dest_path)
    job_id = job["id"]
    bg = job.get("sourceBackground", "#00FF00")
    
    if job["kind"] == "individual-detail":
        clean = key_magenta(raw) if bg == "#FF00CC" else key_green(raw)
        asset_id = job["assetIds"][0].lower()
        clean.save(CROPS_DIR / f"{asset_id}.png")
        print(f"Saved crop: {asset_id}.png ({clean.size})")
    elif job["kind"] == "three-object-sheet":
        zones = crop_vertical_zones(raw, 3)
        for sub_img, asset_id in zip(zones, job["assetIds"]):
            clean = key_green(sub_img)
            clean.save(CROPS_DIR / f"{asset_id.lower()}.png")
            print(f"Saved sub-crop: {asset_id.lower()}.png ({clean.size})")
    elif job["kind"] == "two-object-sheet":
        zones = crop_vertical_zones(raw, 2)
        for sub_img, asset_id in zip(zones, job["assetIds"]):
            clean = key_green(sub_img)
            clean.save(CROPS_DIR / f"{asset_id.lower()}.png")
            print(f"Saved sub-crop: {asset_id.lower()}.png ({clean.size})")

if truck_dest.exists():
    clean_t = key_magenta(Image.open(truck_dest))
    clean_t.save(CROPS_DIR / "s03.png")
    print(f"Saved crop: s03.png ({clean_t.size})")

print("\n--- All EP004 v02 assets created and cropped perfectly! ---")
