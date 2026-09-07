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

mov_files = [f for f in mov_dir.iterdir() if f.suffix.lower() == ".mov"]
print(f"Processing {len(mov_files)} MOV files with high precision chroma key...")

for mov in mov_files:
    raw_name = mov.stem.strip()
    target_names = ALIASES.get(raw_name, [raw_name])
    
    # 1. Convert to WebM with alpha
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
    subprocess.run(cmd_webm, check=True)
    
    # Copy WebM and extract transparent PNG frames for all target names
    for t_name in target_names:
        out1 = mascot_dir / "output_videos" / f"{t_name}.webm"
        out2 = public_mascot_dir / "output_videos" / f"{t_name}.webm"
        out1.write_bytes(webm_temp.read_bytes())
        out2.write_bytes(webm_temp.read_bytes())
        
        frames_dir = public_mascot_dir / "frames" / t_name
        os.makedirs(frames_dir, exist_ok=True)
        
        cmd_frames = [
            str(ffmpeg_bin), "-y",
            "-i", str(mov),
            "-vf", "colorkey=0x00fcfd:0.25:0.05,format=rgba,fps=fps=2.857",
            "-vframes", "8",
            str(frames_dir / "frame_%d.png")
        ]
        subprocess.run(cmd_frames, check=True)
        
        # Ensure frame_0.png exists
        f1 = frames_dir / "frame_1.png"
        if f1.exists():
            (frames_dir / "frame_0.png").write_bytes(f1.read_bytes())
            
        print(f"PASS: {t_name} WebM and frames extracted with alpha transparency")
        
    if webm_temp.exists():
        webm_temp.unlink()

print("\nAll 3D mascots processed with clean alpha transparency!")
