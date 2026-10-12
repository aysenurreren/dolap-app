import hashlib
import random
from collections import Counter
from pathlib import Path

from PIL import Image, ImageOps

SRC_ROOT = Path("data/extra_carousell/Clothes_Dataset")
OUT_DIR = Path("data/processed/train")
MAX_SIDE = 512
SEED = 42

LABEL_MAPPING = {
    "Kaos": "TSHIRT",
    "Kemeja": "SHIRT",
    "Sweter": "SWEATER",
    "Hoodie": "SWEATER",
    "Jeans": "PANTS",
    "Celana_Panjang": "PANTS",
    "Celana_Pendek": "SHORTS",
    "Rok": "SKIRT",
    "Gaun": "DRESS",
    "Jaket": "JACKET",
    "Jaket_Denim": "JACKET",
    "Jaket_Olahraga": "JACKET",
    "Blazer": "JACKET",
    "Mantel": "JACKET",
}

MAX_PER_SOURCE_LABEL = {
    "Jaket": 200,
    "Jaket_Denim": 200,
    "Jaket_Olahraga": 200,
    "Blazer": 200,
    "Mantel": 200,
}


def file_hash(path):
    return hashlib.md5(path.read_bytes()).hexdigest()


def main():
    rng = random.Random(SEED)
    seen_hashes = set()
    counts = Counter()
    skipped_dupes = 0

    for source_label, category in LABEL_MAPPING.items():
        class_dir = SRC_ROOT / source_label
        if not class_dir.is_dir():
            print(f"Klasör yok: {class_dir}")
            continue

        files = sorted(class_dir.glob("*.jpg"))
        cap = MAX_PER_SOURCE_LABEL.get(source_label)
        if cap and len(files) > cap:
            files = rng.sample(files, cap)

        dst_dir = OUT_DIR / category
        dst_dir.mkdir(parents=True, exist_ok=True)

        for src in files:
            digest = file_hash(src)
            if digest in seen_hashes:
                skipped_dupes += 1
                continue
            seen_hashes.add(digest)

            dst = dst_dir / f"cr_{source_label}_{src.stem}.jpg"
            try:
                img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
                img.thumbnail((MAX_SIDE, MAX_SIDE))
                img.save(dst, "JPEG", quality=92)
                counts[(category, source_label)] += 1
            except Exception as e:
                print(f"Atlandı: {src.name} ({e})")

    print(f"\nBirebir kopya olduğu için atlanan: {skipped_dupes}")
    print("\nEklenen görseller (kategori, kaynak etiket, adet):")
    totals = Counter()
    for (category, source_label), n in sorted(counts.items()):
        print(f"  {category:8} {source_label:16} {n}")
        totals[category] += n
    print("\nKategori toplamları:")
    for category, n in sorted(totals.items()):
        print(f"  {category:8} {n}")


if __name__ == "__main__":
    main()