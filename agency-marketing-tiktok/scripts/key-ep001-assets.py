from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/ep001/v03/generated"
OUTPUT = ROOT / "public/ep001/v03/crops-v03"
OUTPUT.mkdir(parents=True, exist_ok=True)

SHEETS = {
    "s01-product-kit-green-v01.png": ["s01-a-bottle.png", "s01-b-box.png", "s01-c-phone.png"],
    "s02-coffee-story-green-v01.png": ["s02-a-morning.png", "s02-b-cold.png", "s02-c-warm.png"],
    "s03-customer-portraits-green-v01.png": ["s03-a-unsure.png", "s03-b-problem.png", "s03-c-compare.png"],
    "s04-marketing-props-green-v01.png": ["s04-a-bubbles.png", "s04-b-funnel.png", "s04-c-target.png"],
    "s05-content-actions-green-v01.png": ["s05-a-swipe.png", "s05-b-replace.png", "s05-c-merge.png"],
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
            # None of the approved subjects contain green. Use channel
            # dominance rather than one sampled hue so shadows and compressed
            # green spill are removed too.
            if dominance >= 82 and g >= 58:
                value = 0
            elif dominance <= 15 or g < 45:
                value = 255
            else:
                value = round(255 * (82 - dominance) / 67)
            a[x, y] = max(0, min(255, value))

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.65))
    rgba = rgb.convert("RGBA")
    out = Image.new("RGBA", rgba.size)
    src = rgba.load()
    dst = out.load()
    mask = alpha.load()
    for y in range(height):
        for x in range(width):
            r, g, b, _ = src[x, y]
            av = mask[x, y]
            # Despill semi-transparent and edge pixels without shifting the
            # approved subject palette.
            if g > max(r, b) + 4:
                g = min(g, round((r + b) / 2 + 4))
            dst[x, y] = (r, g, b, av)
    return out


def tight_crop(image: Image.Image, padding: int = 18) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("No foreground remained after chroma key")
    left, top, right, bottom = bbox
    return image.crop((max(0, left-padding), max(0, top-padding), min(image.width, right+padding), min(image.height, bottom+padding)))


for source_name, output_names in SHEETS.items():
    sheet = Image.open(SOURCE / source_name).convert("RGB")
    bounds = [0, round(sheet.height / 3), round(sheet.height * 2 / 3), sheet.height]
    for index, output_name in enumerate(output_names):
        region = sheet.crop((0, bounds[index], sheet.width, bounds[index + 1]))
        keyed = tight_crop(key_green(region))
        if output_name == "s05-c-merge.png":
            # The approved source has one detached dark corner/shadow island
            # above the semantic merge paths. Remove only that isolated patch.
            cleanup = keyed.load()
            for y in range(min(85, keyed.height)):
                for x in range(max(0, keyed.width - 95), keyed.width):
                    cleanup[x, y] = (*cleanup[x, y][:3], 0)
        destination = OUTPUT / output_name
        if destination.exists():
            raise FileExistsError(f"Refusing to overwrite {destination}")
        keyed.save(destination, "PNG", optimize=True)
        print(f"SAVED {destination.relative_to(ROOT)} {keyed.width}x{keyed.height}")
