import os
import shutil
import pandas as pd
from sklearn.model_selection import train_test_split

CATEGORY_MAPPING = {
    "Tshirts": "TSHIRT", "Shirts": "TSHIRT", "Tops": "TSHIRT",
    "Jeans": "PANTS", "Track Pants": "PANTS", "Shorts": "PANTS", "Trousers": "PANTS", "Leggings": "PANTS",
    "Jackets": "JACKET", "Waistcoat": "JACKET", "Blazers": "JACKET",
    "Casual Shoes": "SHOES", "Formal Shoes": "SHOES", "Sports Shoes": "SHOES",
    "Flip Flops": "SHOES", "Sandals": "SHOES", "Flats": "SHOES", "Heels": "SHOES",
    "Watches": "ACCESSORY", "Belts": "ACCESSORY", "Handbags": "ACCESSORY",
    "Sunglasses": "ACCESSORY", "Bracelet": "ACCESSORY", "Socks": "ACCESSORY",
    "Dresses": "DRESS", "Kurtas": "DRESS", "Sarees": "DRESS",
    "Sweaters": "SWEATER", "Sweatshirts": "SWEATER",
}

df = pd.read_csv("data/styles.csv", on_bad_lines="skip")
df["category"] = df["articleType"].map(CATEGORY_MAPPING)
df = df.dropna(subset=["category"])

print(f"Eşlenen toplam görsel sayısı: {len(df)}")
print(df["category"].value_counts())

train_df, val_df = train_test_split(
    df, test_size=0.15, stratify=df["category"], random_state=42
)

def copy_images(dataframe, split_name):
    for _, row in dataframe.iterrows():
        src = f"data/images/{row['id']}.jpg"
        dst_dir = f"data/processed/{split_name}/{row['category']}"
        os.makedirs(dst_dir, exist_ok=True)
        dst = f"{dst_dir}/{row['id']}.jpg"
        if os.path.exists(src):
            shutil.copy(src, dst)

copy_images(train_df, "train")
copy_images(val_df, "val")

print("Veri hazırlama tamamlandı.")