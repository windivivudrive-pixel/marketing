import sys
sys.path.insert(0, '/Users/win/Library/Python/3.9/lib/python/site-packages')

from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/ep007/v01/generated"
OUTPUT = SOURCE

ASSETS = [
    ("a01-card-contrast-green-v01.png", "a01-card-contrast-alpha-v01.png"),
    ("a02-ten-slot-kraft-card-green-v01.png", "a02-ten-slot-kraft-card-alpha-v01.png"),
    ("a03-two-cards-counter-green-v01.png", "a03-two-cards-counter-alpha-v01.png"),
    ("a04-stamp-action-green-v01.png", "a04-stamp-action-alpha-v01.png"),
    ("a05-happy-customer-wallet-green-v01.png", "a05-happy-customer-wallet-alpha-v01.png"),
    ("a06-progress-bar-green-v01.png", "a06-progress-bar-alpha-v01.png"),
    ("a07-mountain-climber-green-v01.png", "a07-mountain-climber-alpha-v01.png"),
    ("a08-research-chart-green-v01.png", "a08-research-chart-alpha-v01.png"),
    ("a09-phone-welcome-points-green-v01.png", "a09-phone-welcome-points-alpha-v01.png"),
]

def key_green(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    alpha = Image.new("L", rgb.size, 255)
    a = alpha.load()
    width, height = rgb.size
    
    # 1. Chroma Keying
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            dominance = g - max(r, b)
            if dominance >= 45 and g >= 40:
                value = 0
            elif dominance <= 10 or g < 35:
                value = 255
            else:
                value = round(255 * (45 - dominance) / 35)
            a[x, y] = max(0, min(255, value))

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    rgba = rgb.convert("RGBA")
    out = Image.new("RGBA", rgba.size)
    src = rgba.load()
    dst = out.load()
    mask = alpha.load()
    
    # 2. Despill and Edge Decontamination
    for y in range(height):
        for x in range(width):
            r, g, b, _ = src[x, y]
            av = mask[x, y]
            if g > max(r, b) + 2:
                g = min(g, round((r + b) / 2 + 2))
            dst[x, y] = (r, g, b, av)
    return out

def verify_corners(image: Image.Image, filename: str) -> bool:
    alpha = image.getchannel("A")
    w, h = alpha.size
    corners = [
        ("top-left", (0, 0)),
        ("top-right", (w - 1, 0)),
        ("bottom-left", (0, h - 1)),
        ("bottom-right", (w - 1, h - 1)),
    ]
    all_clear = True
    for name, pos in corners:
        val = alpha.getpixel(pos)
        if val > 0:
            print(f"WARNING: {filename} corner {name} is not fully transparent (alpha={val})")
            all_clear = False
    return all_clear

def main():
    print("Keying EP007 v01 Flow Agent assets...")
    for green_file, alpha_file in ASSETS:
        in_path = SOURCE / green_file
        out_path = OUTPUT / alpha_file
        if not in_path.exists():
            print(f"Missing input {green_file}")
            continue
        
        img = Image.open(in_path)
        keyed = key_green(img)
        keyed.save(out_path, "PNG")
        
        corners_ok = verify_corners(keyed, alpha_file)
        status = "PASS (corners transparent)" if corners_ok else "CHECK CORNERS"
        print(f"KEYED {green_file} -> {alpha_file} [{status}]")

    print("Finished keying all EP007 v01 assets.")

if __name__ == "__main__":
    main()
