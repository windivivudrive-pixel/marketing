import os
from pathlib import Path
from PIL import Image

MASCOT_SRC = Path("/Users/win/Documents/marketing channel/mascot")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public/mascot/frames"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

files = [f for f in os.listdir(MASCOT_SRC) if f.endswith(".png") and not f.startswith("._")]
print(f"Found {len(files)} mascot PNG files.")

for filename in files:
    state_name = Path(filename).stem
    state_folder = OUTPUT_DIR / state_name
    state_folder.mkdir(parents=True, exist_ok=True)
    
    img_path = MASCOT_SRC / filename
    img = Image.open(img_path)
    w, h = img.size
    
    col_w = w // 4  # 418
    row_h = h // 2  # 470
    
    frame_idx = 0
    for row in range(2):
        for col in range(4):
            left = col * col_w
            top = row * row_h
            right = (col + 1) * col_w if col < 3 else w
            bottom = (row + 1) * row_h if row < 1 else h
            
            frame_crop = img.crop((left, top, right, bottom))
            frame_file = state_folder / f"frame_{frame_idx}.png"
            frame_crop.save(frame_file, "PNG")
            frame_idx += 1
            
    print(f"Processed 8 frames for '{state_name}' -> {state_folder}")

print("All mascot frames cropped successfully!")
