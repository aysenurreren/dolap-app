import csv
from collections import Counter
from pathlib import Path

from PIL import Image, ImageOps
from sklearn.model_selection import StratifiedGroupKFold

SRC_DIR = Path("data/extra_agrigorev")
OUT_DIR = Path("data/processed")
MAX_SIDE = 512

LABEL_MAPPING = {
    "T-Shirt": "TSHIRT",
    "Shirt": "SHIRT",
    "Hoodie": "SWEATER",
    "Outwear": "JACKET",
    "Blazer": "JACKET",
    "Pants": "PANTS",
    "Shorts": "SHORTS",
    "Skirt": "SKIRT",
    "Dress": "DRESS",
    "Shoes": "SHOES",
}


def main():
    rows = []
    with open(SRC_DIR / "images.csv", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            category = LABEL_MAPPING.get(row["label"])
            if category:
                rows.append({"id": row["image"], "sender": row["sender_id"], "category": category})

    print(f"Eşlenen görsel sayısı: {len(rows)}")

    labels = [r["category"] for r in rows]
    groups = [r["sender"] for r in rows]

    splitter = StratifiedGroupKFold(n_splits=7, shuffle=True, random_state=42)
    train_idx, val_idx = next(splitter.split(rows, labels, groups))
    split_of = {i: "train" for i in train_idx}
    split_of.update({i: "val" for i in val_idx})

    counts = Counter()
    for i, r in enumerate(rows):
        split = split_of[i]
        dst_dir = OUT_DIR / split / r["category"]
        dst_dir.mkdir(parents=True, exist_ok=True)
        src = SRC_DIR / "images" / f"{r['id']}.jpg"
        dst = dst_dir / f"ag_{r['id']}.jpg"
        try:
            img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            img.thumbnail((MAX_SIDE, MAX_SIDE))
            img.save(dst, "JPEG", quality=92)
            counts[(split, r["category"])] += 1
        except Exception as e:
            print(f"Atlandı: {src.name} ({e})")

    print("\nEklenen görseller (bölme, kategori, adet):")
    for (split, category), n in sorted(counts.items()):
        print(f"  {split:5} {category:10} {n}")


if __name__ == "__main__":
    main()