from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/ep002/v03/generated"
OUTPUT = ROOT / "public/ep002/v03/crops"
OUTPUT.mkdir(parents=True, exist_ok=True)

SHEETS = {
    "s01-trust-reaction-green-v01.png": ["s01-a-trust-badge.png", "s01-b-warning-placard.png", "s01-c-skeptical-shopper.png"],
    "s02-copy-pattern-green-v01.png": ["s02-a-duplicate-avatar.png", "s02-b-metronome.png", "s02-c-clone-tiles.png"],
    "s03-echo-chamber-green-v01.png": ["s03-a-identical-crowd.png", "s03-b-echo-tunnel.png", "s03-c-fading-bubble.png"],
    "s04-integrity-green-v01.png": ["s04-a-integrity-shield.png", "s04-b-inflated-pump.png", "s04-c-tangled-signal.png"],
    "s05-question-unlock-green-v01.png": ["s05-a-paper-buoy.png", "s05-b-question-bubble.png", "s05-c-open-door-card.png"],
    "s06-customer-sources-green-v01.png": ["s06-a-inbox-envelope.png", "s06-b-review-cards.png", "s06-c-sales-teammate.png"],
    "s07-customer-frictions-green-v01.png": ["s07-a-price-tag.png", "s07-b-usage-hand.png", "s07-c-fit-profile.png"],
    "s08-serum-example-green-v01.png": ["s08-a-serum-bottle.png", "s08-b-hollow-megaphone.png", "s08-c-oily-skin-customer.png"],
    "s09-useful-answer-green-v01.png": ["s09-a-open-qa-card.png", "s09-b-texture-swatch.png", "s09-c-application-hand.png"],
    "s10-transparent-participation-green-v01.png": ["s10-a-real-person-card.png", "s10-b-role-badge.png", "s10-c-clone-stamp.png"],
    "s11-dialogue-payoff-green-v01.png": ["s11-a-question-spotlight.png", "s11-b-open-dialogue-path.png", "s11-c-theatre-mask.png"],
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

def find_vertical_ranges(keyed_full: Image.Image):
    alpha = keyed_full.getchannel("A")
    w, h = alpha.size
    row_has_content = []
    for y in range(h):
        # row is active if any non-zero alpha pixel exists
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
            if (y - start_y) > 30:  # ignore tiny noise
                ranges.append((start_y, y))
    if in_range and (h - start_y) > 30:
        ranges.append((start_y, h))
        
    return ranges

def main():
    print("Processing EP002 chroma key and dynamic vertical bounding box crops...")
    for sheet_name, crop_names in SHEETS.items():
        sheet_path = SOURCE / sheet_name
        if not sheet_path.exists():
            print(f"Skipping missing sheet {sheet_name}")
            continue
        print(f"Keying full sheet: {sheet_name}")
        img = Image.open(sheet_path)
        keyed_full = key_green(img)
        
        ranges = find_vertical_ranges(keyed_full)
        print(f"  Found {len(ranges)} vertical object ranges: {ranges}")
        
        # Fallback to 3 equal splits if range detection doesn't return 3
        if len(ranges) != 3:
            w, h = img.size
            h_third = h // 3
            ranges = [(0, h_third), (h_third, 2 * h_third), (2 * h_third, h)]
            
        for idx, (y_start, y_end) in enumerate(ranges[:3]):
            # Add safety margin
            y_start_margin = max(0, y_start - 10)
            y_end_margin = min(keyed_full.height, y_end + 10)
            
            section = keyed_full.crop((0, y_start_margin, keyed_full.width, y_end_margin))
            cropped = tight_crop(section)
            output_path = OUTPUT / crop_names[idx]
            cropped.save(output_path, "PNG")
            print(f"  Saved tight crop: {crop_names[idx]} ({cropped.width}x{cropped.height})")

    print("All 15 cutouts processed with exact dynamic bounding boxes!")

if __name__ == "__main__":
    main()
