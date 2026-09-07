from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/ep003/v02/generated"
OUTPUT = ROOT / "public/ep003/v02/crops"
OUTPUT.mkdir(parents=True, exist_ok=True)

SHEETS = {
    "s01-hook-thumbnail-green.png": ["s01-hook-thumbnail.png"],
    "s02-commission-badge-green.png": ["s02-commission-badge.png"],
    "s03-clickbait-kit-green.png": ["s03-a-megaphone-sale.png", "s03-b-fake-award.png"],
    "s04-return-box-green.png": ["s04-return-box.png"],
    "s05-penalty-flag-green.png": ["s05-penalty-flag.png"],
    "s06-coolmate-box-green.png": ["s06-coolmate-box.png"],
    "s07-coolmate-kit-green.png": ["s07-a-script-folder.png", "s07-b-coolmate-polo.png", "s07-c-verified-badge.png"],
    "s08-partnership-green.png": ["s08-partnership-handshake.png"],
}

def key_green(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    alpha = Image.new("L", rgb.size, 255)
    a = alpha.load()
    width, height = rgb.size
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            dominance = g - max(r, b)
            if dominance >= 60 and g >= 50:
                value = 0
            elif dominance <= 15 or g < 45:
                value = 255
            else:
                value = round(255 * (60 - dominance) / 45)
            a[x, y] = max(0, min(255, value))

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    rgba = rgb.convert("RGBA")
    out = Image.new("RGBA", rgba.size)
    src = rgba.load()
    dst = out.load()
    mask = alpha.load()
    for y in range(height):
        for x in range(width):
            r, g, b, _ = src[x, y]
            av = mask[x, y]
            if g > max(r, b) + 4:
                g = min(g, round((r + b) / 2 + 4))
            dst[x, y] = (r, g, b, av)
    return out

def tight_crop(image: Image.Image, padding: int = 12) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("No foreground remained after chroma key")
    left, upper, right, lower = bbox
    left = max(0, left - padding)
    upper = max(0, upper - padding)
    right = min(image.width, right + padding)
    lower = min(image.height, lower + padding)
    return image.crop((left, upper, right, lower))

def find_vertical_ranges(keyed_full: Image.Image, expected_count: int):
    alpha = keyed_full.getchannel("A")
    w, h = alpha.size
    row_has_content = []
    for y in range(h):
        row_has = any(alpha.getpixel((x, y)) > 20 for x in range(0, w, 4))
        row_has_content.append(row_has)
    
    ranges = []
    in_range = False
    start_y = 0
    for y, active in enumerate(row_has_content):
        if active and not in_range:
            in_range = True
            start_y = y
        elif not active and in_range:
            in_range = False
            if (y - start_y) > 30:
                ranges.append((start_y, y))
    if in_range and (h - start_y) > 30:
        ranges.append((start_y, h))
        
    return ranges

def main():
    print("Processing EP003 chroma key and dynamic vertical crops...")
    for sheet_name, crop_names in SHEETS.items():
        sheet_path = SOURCE / sheet_name
        if not sheet_path.exists():
            print(f"Skipping missing sheet {sheet_name}")
            continue
        print(f"Keying full sheet: {sheet_name}")
        img = Image.open(sheet_path)
        keyed_full = key_green(img)
        
        expected_count = len(crop_names)
        if expected_count == 1:
            cropped = tight_crop(keyed_full)
            output_path = OUTPUT / crop_names[0]
            cropped.save(output_path, "PNG")
            print(f"  Saved single crop: {crop_names[0]} ({cropped.width}x{cropped.height})")
        else:
            ranges = find_vertical_ranges(keyed_full, expected_count)
            if len(ranges) != expected_count:
                w, h = img.size
                h_part = h // expected_count
                ranges = [(i * h_part, (i + 1) * h_part) for i in range(expected_count)]
                
            for idx, (y_start, y_end) in enumerate(ranges[:expected_count]):
                y_start_margin = max(0, y_start - 10)
                y_end_margin = min(keyed_full.height, y_end + 10)
                section = keyed_full.crop((0, y_start_margin, keyed_full.width, y_end_margin))
                cropped = tight_crop(section)
                output_path = OUTPUT / crop_names[idx]
                cropped.save(output_path, "PNG")
                print(f"  Saved tight crop: {crop_names[idx]} ({cropped.width}x{cropped.height})")

    print("All EP003 cutouts processed!")

if __name__ == "__main__":
    main()
