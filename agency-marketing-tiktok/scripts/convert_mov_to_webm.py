import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
mascot_dir = Path("/Users/win/Documents/marketing channel/mascot")
public_mascot_dir = ROOT / "public/mascot"
mov_dir = public_mascot_dir / "output_videos"
ffmpeg_bin = ROOT / "node_modules/ffmpeg-static/ffmpeg"

os.makedirs(mascot_dir / "output_videos", exist_ok=True)
os.makedirs(public_mascot_dir / "output_videos", exist_ok=True)
os.makedirs(public_mascot_dir / "frames", exist_ok=True)

mov_files = [f for f in mov_dir.iterdir() if f.suffix.lower() == ".mov"]
print(f"Found {len(mov_files)} .mov files in {mov_dir}")

# Mapping aliases to ensure both original name and standard emotion names exist
ALIASES = {
    "angry": ["angry"],
    "confuse": ["confuse", "scare"],
    "cry": ["cry", "sad cry"],
    "disconnect": ["disconnect", "disconect"],
    "happy drink milktea": ["happy drink milktea", "chill drink milk tea"],
    "hello": ["hello"],
    "laugh": ["laugh", "clap hand"],
    "new idea": ["new idea", "idea"],
    "reading book": ["reading book", "serious"],
    "search": ["search", "find"],
    "take photo": ["take photo", "camera"],
    "thinking": ["thinking"],
    "working": ["working", "working cool"]
}

for mov in mov_files:
    raw_name = mov.stem.strip()
    print(f"\nProcessing '{mov.name}' (raw_name: '{raw_name}')...")
    
    # 1. Convert .mov to transparent WebM with cyan chroma key
    webm_temp = mov_dir / f"temp_{raw_name}.webm"
    cmd_webm = [
        str(ffmpeg_bin), "-y",
        "-i", str(mov),
        "-vf", "colorkey=0x00fcfd:0.25:0.05,format=yuva420p",
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-auto-alt-ref", "0",
        "-b:v", "2M",
        str(webm_temp)
    ]
    res = subprocess.run(cmd_webm, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR converting {mov.name}: {res.stderr}")
        continue
    
    # Copy WebM to target names
    target_names = ALIASES.get(raw_name, [raw_name])
    for t_name in target_names:
        out1 = mascot_dir / "output_videos" / f"{t_name}.webm"
        out2 = public_mascot_dir / "output_videos" / f"{t_name}.webm"
        out1.write_bytes(webm_temp.read_bytes())
        out2.write_bytes(webm_temp.read_bytes())
        print(f" -> Saved WebM to {out1.name}")
        
        # 2. Extract 8 evenly spaced transparent PNG frames for Remotion frame stopmotion
        frames_dir = public_mascot_dir / "frames" / t_name
        os.makedirs(frames_dir, exist_ok=True)
        # Extract at 2.857 fps (0.35s/frame)
        cmd_frames = [
            str(ffmpeg_bin), "-y",
            "-i", str(mov),
            "-vf", "colorkey=0x00fcfd:0.25:0.05,format=rgba,fps=fps=2.857",
            "-vframes", "8",
            str(frames_dir / "frame_%d.png")
        ]
        subprocess.run(cmd_frames, capture_output=True)
        print(f" -> Extracted frames to frames/{t_name}")
    
    if webm_temp.exists():
        webm_temp.unlink()

print("\nALL .mov files successfully converted to transparent WebM and frames!")
