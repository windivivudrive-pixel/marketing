import json
import os
import urllib.request
import urllib.parse
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "public/ep004/v02/generated"
CROPS_DIR = ROOT / "public/ep004/v02/crops"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
CROPS_DIR.mkdir(parents=True, exist_ok=True)

FLOW_API = "http://127.0.0.1:8001/v1/images/generations"

def generate_via_flow(prompt: str, model: str = "gem_pix_2", size: str = "1024x1024") -> str:
    print(f"\n[Flow Agent] Generating with model={model}...")
    print(f"Prompt: {prompt[:120]}...")
    payload = {
        "prompt": prompt,
        "model": model,
        "n": 1,
        "size": size,
        "response_format": "url"
    }
    req = urllib.request.Request(
        FLOW_API,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        res_json = json.loads(resp.read().decode("utf-8"))
        url = res_json["data"][0]["url"]
        print(f"[Flow Agent] Success! URL: {url}")
        return url

def download_file(url: str, dest_path: Path):
    if url.startswith("/"):
        url = f"http://127.0.0.1:8001{url}"
    urllib.request.urlretrieve(url, dest_path)
    print(f"Saved: {dest_path.name}")

def key_chroma_magenta(img: Image.Image) -> Image.Image:
    """Keys out uniform magenta background #FF00CC with anti-aliasing."""
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    # Magenta has high R and B, low G
    magentaness = np.minimum(r, b) - g
    alpha = np.clip(1.0 - (magentaness - 20) / 40.0, 0.0, 1.0)
    arr[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    alpha_smooth = cv2.GaussianBlur(arr[:, :, 3].astype(np.uint8), (3, 3), 0)
    arr[:, :, 3] = alpha_smooth
    res = Image.fromarray(arr.astype(np.uint8))
    bbox = res.getbbox()
    return res.crop(bbox) if bbox else res

def key_chroma_green(img: Image.Image) -> Image.Image:
    """Keys out uniform green background #00FF00 with anti-aliasing & spill suppression."""
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

# Load JSON definition
with open(ROOT / "creatorflow/ep004-v02-pink-sticker-generation.json") as f:
    config = json.load(f)

# Execute jobs
for job in config["jobs"]:
    job_id = job["id"]
    prompt = job["prompt"]
    bg = job.get("sourceBackground", "#00FF00")
    dest_name = Path(job["output"]).name
    dest_path = GENERATED_DIR / dest_name
    
    if not dest_path.exists():
        url = generate_via_flow(prompt)
        download_file(url, dest_path)
    else:
        print(f"Skipping already generated: {dest_name}")

    # Process and crop
    raw_img = Image.open(dest_path)
    if job["kind"] == "individual-detail":
        clean = key_chroma_magenta(raw_img) if bg == "#FF00CC" else key_chroma_green(raw_img)
        asset_id = job["assetIds"][0].lower()
        clean.save(CROPS_DIR / f"{asset_id}-{job_id}.png")
        print(f"Saved crop: {asset_id}-{job_id}.png")
        
    elif job["kind"] == "three-object-sheet":
        zones = crop_vertical_zones(raw_img, 3)
        for sub_img, asset_id in zip(zones, job["assetIds"]):
            clean = key_chroma_green(sub_img)
            clean.save(CROPS_DIR / f"{asset_id.lower()}-{job_id}.png")
            print(f"Saved sub-crop: {asset_id.lower()}-{job_id}.png")
            
    elif job["kind"] == "two-object-sheet":
        zones = crop_vertical_zones(raw_img, 2)
        for sub_img, asset_id in zip(zones, job["assetIds"]):
            clean = key_chroma_green(sub_img)
            clean.save(CROPS_DIR / f"{asset_id.lower()}-{job_id}.png")
            print(f"Saved sub-crop: {asset_id.lower()}-{job_id}.png")

print("\n--- Generating Xe Bán Tải Ngọc Sầu Riêng Q7 with Flow Agent ---")
truck_dest = GENERATED_DIR / "s03-ngoc-durian-truck-flow.png"
if not truck_dest.exists():
    truck_prompt = "One iconic Vietnamese black Ford Ranger pickup truck converted into the famous mobile durian stall 'Ngọc Sầu Riêng' in District 7 Saigon. Prominent bright yellow signage reading 'NGỌC SẦU RIÊNG - KHÔNG ĂN THỬ LÀ KHÔNG BÁN', truck bed loaded with wooden crates of fresh green durians, tailgate open with scale, knife, opened durian showing creamy golden flesh in clear boxes. Isolated on perfectly uniform chroma magenta #FF00CC background with 12% empty margin. Complete crop-safe silhouette, crisp clean lighting, no blur, no text cut off."
    url = generate_via_flow(truck_prompt)
    download_file(url, truck_dest)
clean_truck = key_chroma_magenta(Image.open(truck_dest))
clean_truck.save(CROPS_DIR / "s03-storefront.png")
print("Saved clean truck: s03-storefront.png")

print("\nAll Flow Agent image generation and extraction complete!")
