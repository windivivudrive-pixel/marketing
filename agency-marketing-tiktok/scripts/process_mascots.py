import os
import subprocess
from PIL import Image

mascot_dir = "/Users/win/Documents/marketing channel/mascot"
public_mascot_dir = "/Users/win/Documents/marketing channel/agency-marketing-tiktok/public/mascot"
ffmpeg_bin = "/Users/win/Documents/marketing channel/agency-marketing-tiktok/node_modules/ffmpeg-static/ffmpeg"

os.makedirs(os.path.join(mascot_dir, "output_videos"), exist_ok=True)
os.makedirs(os.path.join(public_mascot_dir, "output_videos"), exist_ok=True)
os.makedirs(os.path.join(public_mascot_dir, "frames"), exist_ok=True)

files = sorted([f for f in os.listdir(mascot_dir) if f.endswith(".png") and not f.startswith(".")])

print(f"Found {len(files)} mascot images to process.")

FRAME_TIME = 0.35  # 0.35s per frame
FPS = 1.0 / FRAME_TIME  # ~2.857 fps

for f in files:
    name = os.path.splitext(f)[0]
    img_path = os.path.join(mascot_dir, f)
    im = Image.open(img_path).convert("RGBA")
    
    w, h = im.size
    fw = w // 4  # 418
    fh = h // 2  # 470
    
    frames_out_dir = os.path.join(public_mascot_dir, "frames", name)
    os.makedirs(frames_out_dir, exist_ok=True)
    
    extracted_frames = []
    # 4 columns x 2 rows
    for row in range(2):
        for col in range(4):
            idx = row * 4 + col
            box = (col * fw, row * fh, (col + 1) * fw, (row + 1) * fh)
            crop = im.crop(box)
            
            # Ensure background outside alpha is clean
            frame_path = os.path.join(frames_out_dir, f"frame_{idx}.png")
            crop.save(frame_path, "PNG")
            extracted_frames.append(frame_path)
            
    print(f"Extracted 8 frames for '{name}' to {frames_out_dir}")
    
    # Generate WebM with VP9 alpha at 0.35s per frame
    webm_out_1 = os.path.join(mascot_dir, "output_videos", f"{name}.webm")
    webm_out_2 = os.path.join(public_mascot_dir, "output_videos", f"{name}.webm")
    
    cmd = [
        ffmpeg_bin, "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(frames_out_dir, "frame_%d.png"),
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-auto-alt-ref", "0",
        "-lossless", "1",
        webm_out_1
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        # copy to public as well
        with open(webm_out_1, "rb") as src, open(webm_out_2, "wb") as dst:
            dst.write(src.read())
        print(f"Successfully generated WebM for '{name}' ({FPS:.3f} fps, 0.35s/frame)")
    else:
        print(f"Failed WebM for '{name}': {res.stderr}")

print("All mascots processed successfully!")
