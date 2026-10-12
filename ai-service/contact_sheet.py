import csv
import random
from pathlib import Path
from PIL import Image, ImageOps

DATA_DIR = Path("data/extra_agrigorev")
OUT_DIR = Path("data/contact_sheets")
LABELS_TO_CHECK = ["Skirt", "Outwear", "Blazer", "Hoodie", "T-Shirt", "Shirt", "Longsleeve", "Dress"]
TILE = 200
COLS, ROWS = 4, 3
SAMPLES = COLS * ROWS


def make_sheet(ids):
    sheet = Image.new("RGB", (COLS * TILE, ROWS * TILE), "white")
    for idx, image_id in enumerate(ids):
        path = DATA_DIR / "images" / f"{image_id}.jpg"
        try:
            img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        except Exception as e:
            print(f"Açılamadı: {path.name} ({e})")
            continue
        img.thumbnail((TILE - 4, TILE - 4))
        x = (idx % COLS) * TILE + (TILE - img.width) // 2
        y = (idx // COLS) * TILE + (TILE - img.height) // 2
        sheet.paste(img, (x, y))
    return sheet


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    by_label = {}
    with open(DATA_DIR / "images.csv", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            by_label.setdefault(row["label"], []).append(row["image"])

    random.seed(7)
    for label in LABELS_TO_CHECK:
        ids = by_label.get(label, [])
        if not ids:
            print(f"{label}: bulunamadı")
            continue
        sample = random.sample(ids, min(SAMPLES, len(ids)))
        out_path = OUT_DIR / f"{label}.png"
        make_sheet(sample).save(out_path)
        print(f"{label}: {out_path}")


if __name__ == "__main__":
    main()