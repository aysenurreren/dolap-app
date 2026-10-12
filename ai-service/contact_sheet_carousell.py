import random
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path("data/extra_carousell/Clothes_Dataset")
OUT_DIR = Path("data/contact_sheets")
TILE = 200
COLS, ROWS = 4, 3
SAMPLES = COLS * ROWS


def make_sheet(paths):
    sheet = Image.new("RGB", (COLS * TILE, ROWS * TILE), "white")
    min_sides = []
    for idx, path in enumerate(paths):
        try:
            img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        except Exception as e:
            print(f"Açılamadı: {path.name} ({e})")
            continue
        min_sides.append(min(img.size))
        img.thumbnail((TILE - 4, TILE - 4))
        x = (idx % COLS) * TILE + (TILE - img.width) // 2
        y = (idx // COLS) * TILE + (TILE - img.height) // 2
        sheet.paste(img, (x, y))
    return sheet, min_sides


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    random.seed(7)
    for class_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
        files = sorted(class_dir.glob("*.jpg"))
        sample = random.sample(files, min(SAMPLES, len(files)))
        sheet, min_sides = make_sheet(sample)
        out_path = OUT_DIR / f"carousell_{class_dir.name}.png"
        sheet.save(out_path)
        smallest = min(min_sides) if min_sides else 0
        print(f"{class_dir.name}: {out_path} (örneklerde en küçük kenar: {smallest}px)")


if __name__ == "__main__":
    main()