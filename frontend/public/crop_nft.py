import os
from PIL import Image

img_path = r'C:\Users\builder\Desktop\vibe\frontend\public\nft9.png'
out_dir = r'C:\Users\builder\Desktop\vibe\frontend\public\nft\images'

if not os.path.exists(out_dir):
    os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)
width, height = img.size
print(f"Loaded image: {width}x{height}")

# 3x3 grid
rows = 3
cols = 3

cell_w = width / cols
cell_h = height / rows

print(f"Cell size: {cell_w}x{cell_h}")

count = 0
for r in range(rows):
    for c in range(cols):
        left = int(c * cell_w)
        top = int(r * cell_h)
        right = int((c + 1) * cell_w)
        bottom = int((r + 1) * cell_h)
        
        cropped = img.crop((left, top, right, bottom))
        count += 1
        out_name = f"{count}.png"
        out_path = os.path.join(out_dir, out_name)
        cropped.save(out_path, "PNG")
        print(f"Saved {out_name}: ({left}, {top}, {right}, {bottom}) -> {cropped.size}")

print(f"Done! Created {count} individual NFT images in {out_dir}")
