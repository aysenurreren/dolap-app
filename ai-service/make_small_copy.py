from pathlib import Path
from PIL import Image

SRC = Path("data/processed")
DST = Path("data/processed_256")
MAX_SIDE = 256


def main():
    files = list(SRC.rglob("*.jpg"))
    print(f"Toplam görsel: {len(files)}")
    for i, src in enumerate(files, start=1):
        dst = DST / src.relative_to(SRC)
        if dst.exists():
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        try:
            with Image.open(src) as img:
                img = img.convert("RGB")
                img.thumbnail((MAX_SIDE, MAX_SIDE))
                img.save(dst, "JPEG", quality=92)
        except Exception as e:
            print(f"Atlandı: {src.name} ({e})")
        if i % 2000 == 0:
            print(f"  {i}/{len(files)}")
    print("Bitti.")


if __name__ == "__main__":
    main()