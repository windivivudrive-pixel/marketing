import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

v02_dir = "public/ep003/v02/crops"
v03_dir = "public/ep003/v03/crops"
os.makedirs(v03_dir, exist_ok=True)

# 1. Copy over base assets
files_to_copy = [
    ("s02-commission-badge.png", "s02-commission-badge.png"),
    ("s03-a-megaphone-sale.png", "s03-a-megaphone-sale.png"),
    ("s03-b-fake-award.png", "s03-b-fake-award.png"),
    ("s04-return-box.png", "s04-a-return-box.png"),
    ("s05-penalty-flag.png", "s05-penalty-flag.png"),
    ("s06-coolmate-box.png", "s06-coolmate-box.png"),
    ("s07-a-script-folder.png", "s07-a-script-folder.png"),
    ("s07-b-coolmate-polo.png", "s07-b-coolmate-polo.png"),
    ("s07-c-verified-badge.png", "s07-c-verified-badge.png"),
    ("s08-partnership-handshake.png", "s08-partnership-handshake.png"),
]

for src, dst in files_to_copy:
    src_path = os.path.join(v02_dir, src)
    dst_path = os.path.join(v03_dir, dst)
    if os.path.exists(src_path):
        shutil.copyfile(src_path, dst_path)
        print(f"Copied {src} -> {dst}")

# 2. Split s01-hook-thumbnail.png into left (Coolmate Revenue) and right (Return Debt Box)
s01_path = os.path.join(v02_dir, "s01-hook-thumbnail.png")
if os.path.exists(s01_path):
    img = Image.open(s01_path).convert("RGBA")
    w, h = img.size
    # Left half: Coolmate revenue
    left_crop = img.crop((0, 0, int(w * 0.52), h))
    left_crop.save(os.path.join(v03_dir, "s01-a-coolmate-revenue.png"))
    # Right half: Return debt box
    right_crop = img.crop((int(w * 0.46), 0, w, h))
    right_crop.save(os.path.join(v03_dir, "s01-b-return-debt-box.png"))
    print("Extracted s01-a and s01-b from hook thumbnail!")

# 3. Create a dedicated Red [ HỦY ĐƠN / TRẢ HÀNG ] tactile button sticker
btn_w, btn_h = 420, 180
btn = Image.new("RGBA", (btn_w, btn_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(btn)

# Outer paper shadow / border
draw.rounded_rectangle([10, 10, btn_w - 10, btn_h - 10], radius=24, fill=(240, 42, 85, 255), outline=(15, 13, 13, 255), width=6)
# Inner highlight
draw.rounded_rectangle([18, 18, btn_w - 18, btn_h - 18], radius=18, fill=(255, 60, 100, 255))
# Text
try:
    font = ImageFont.truetype("public/fonts/SVN-Miller Banner.ttf", 36)
    subfont = ImageFont.truetype("public/fonts/SVN-Nexa Light.ttf", 22)
except:
    font = ImageFont.load_default()
    subfont = ImageFont.load_default()

draw.text((btn_w // 2, 60), "HỦY ĐƠN / TRẢ HÀNG", fill=(255, 255, 255, 255), font=font, anchor="mm")
draw.text((btn_w // 2, 110), "⚠ KHÔNG ĐÚNG MÔ TẢ", fill=(255, 240, 245, 255), font=subfont, anchor="mm")

btn.save(os.path.join(v03_dir, "s04-b-cancel-button.png"))
print("Generated s04-b-cancel-button.png!")

print("All V03 crop assets prepared successfully in public/ep003/v03/crops/!")
