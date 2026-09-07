import json
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "public/ep004/v02/generated"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

with open(ROOT / "creatorflow/ep004-v02-pink-sticker-generation.json") as f:
    config = json.load(f)

jobs = list(config["jobs"])

# Add extra specific assets needed for EP004 story
jobs.append({
    "id": "truck",
    "output": "public/ep004/v02/generated/s03-ngoc-durian-truck-flow.png",
    "prompt": "One iconic Vietnamese black Ford Ranger pickup truck converted into the famous mobile durian stall 'Ngọc Sầu Riêng' in District 7 Saigon. Prominent bright yellow signage reading 'NGỌC SẦU RIÊNG - KHÔNG ĂN THỬ LÀ KHÔNG BÁN', truck bed loaded with wooden crates of fresh green durians, tailgate open with scale, knife, opened durian showing creamy golden flesh in clear boxes. Isolated on perfectly uniform chroma magenta #FF00CC background with 12% empty margin. Complete crop-safe silhouette, crisp clean lighting.",
    "aspect": "portrait"
})

jobs.append({
    "id": "s10_peeling",
    "output": "public/ep004/v02/generated/s10-peeling-action.png",
    "prompt": "Skilled hands with knife carefully peeling open a whole fresh golden durian on a clean wooden counter, beautiful creamy durian segments visible. Uniform chroma magenta #FF00CC background. Complete crop-safe silhouette, no text, no logo.",
    "aspect": "portrait"
})

jobs.append({
    "id": "s16_desserts",
    "output": "public/ep004/v02/generated/s16-durian-desserts.png",
    "prompt": "Delicious assortment of Vietnamese durian desserts: one traditional durian pia cake sliced open showing egg yolk center, one cup of creamy durian ice cream, and one bowl of sweet durian coconut dessert soup. Isolated on uniform chroma green #00FF00 background. Complete crop-safe silhouette, no text, no logo.",
    "aspect": "portrait"
})

jobs.append({
    "id": "s06_suong",
    "output": "public/ep004/v02/generated/s06-under-ripe-segment.png",
    "prompt": "One single pale whitish under-ripe defective durian segment, hard texture, realistic fruit flaw. Isolated on uniform chroma green #00FF00 background. Complete crop-safe silhouette, no text, no logo.",
    "aspect": "portrait"
})

print(f"Total Flow Agent jobs to process: {len(jobs)}")

for idx, job in enumerate(jobs, 1):
    out_rel = job["output"]
    out_path = ROOT / out_rel
    prompt = job["prompt"]
    aspect = job.get("aspect", "portrait")
    
    if out_path.exists() and out_path.stat().st_size > 5000:
        print(f"[{idx}/{len(jobs)}] Skipping already generated: {out_path.name}")
        continue

    print(f"\n[{idx}/{len(jobs)}] Generating via Flow CLI: {out_path.name}")
    print(f"Prompt: {prompt[:90]}...")
    
    cmd = [
        "flow", "image",
        prompt,
        "--output", str(out_path),
        "--aspect", aspect
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"--> Success: {out_path.name} ({out_path.stat().st_size} bytes)")
    else:
        print(f"--> Error ({res.returncode}): {res.stderr or res.stdout}")
    
    time.sleep(1)

print("\nAll Flow Agent image jobs finished!")
