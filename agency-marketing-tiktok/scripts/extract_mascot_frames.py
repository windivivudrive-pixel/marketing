import os
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
webm_dir = ROOT / "public/mascot/output_videos"
frames_base_dir = ROOT / "public/mascot/frames"
ffmpeg_bin = ROOT / "node_modules/ffmpeg-static/ffmpeg"

os.makedirs(frames_base_dir, exist_ok=True)

webm_files = [f for f in webm_dir.iterdir() if f.suffix.lower() == ".webm" and not f.name.startswith("temp_")]
print(f"Found {len(webm_files)} webm files in {webm_dir}")

for webm in webm_files:
    name = webm.stem
    target_dir = frames_base_dir / name
    os.makedirs(target_dir, exist_ok=True)
    
    # Extract 8 frames from webm
    cmd = [
        str(ffmpeg_bin), "-y",
        "-i", str(webm),
        "-vf", "fps=fps=2.857",
        "-vframes", "8",
        str(target_dir / "frame_%d.png")
    ]
    subprocess.run(cmd, capture_output=True)
    
    # Also ensure frame_0.png to frame_8.png exist
    f1 = target_dir / "frame_1.png"
    if f1.exists():
        # duplicate frame_1 as frame_0
        f0 = target_dir / "frame_0.png"
        f0.write_bytes(f1.read_bytes())
        
    extracted = list(target_dir.glob("*.png"))
    print(f"Extracted {len(extracted)} frames for '{name}' to {target_dir.name}")

print("\nAll mascot frames extracted successfully!")
