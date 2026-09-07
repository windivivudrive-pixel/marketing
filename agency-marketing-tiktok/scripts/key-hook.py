from PIL import Image
import os

input_path = "public/ep002/generated/s08-hook-green.jpg"
output_path = "public/ep002/crops/s08-hook-thumbnail.png"

def key_out_green(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    # Tolerances for solid green #00FF00
    for item in data:
        r, g, b, a = item
        if g > 150 and r < 100 and b < 100:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")
    print(f"Saved {out_path}")

key_out_green(input_path, output_path)
