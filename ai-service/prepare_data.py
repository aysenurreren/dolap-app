import os
import shutil
import pandas as pd
from sklearn.model_selection import train_test_split

CATEGORY_MAPPING = {
    "Tshirts": "TSHIRT", "Tops": "TSHIRT",
    "Shirts": "SHIRT",
    "Sweaters": "SWEATER", "Sweatshirts": "SWEATER",
    "Jackets": "JACKET", "Waistcoat": "JACKET", "Blazers": "JACKET",
    "Rain Jacket": "JACKET", "Nehru Jackets": "JACKET",
    "Jeans": "PANTS", "Trousers": "PANTS", "Track Pants": "PANTS",
    "Capris": "PANTS", "Leggings": "PANTS", "Jeggings": "PANTS",
    "Patiala": "PANTS", "Churidar": "PANTS", "Salwar": "PANTS",
    "Shorts": "SHORTS", "Lounge Shorts": "SHORTS",
    "Skirts": "SKIRT",
    "Dresses": "DRESS", "Sarees": "DRESS", "Kurtas": "DRESS", "Kurtis": "DRESS",
    "Tunics": "DRESS", "Nightdress": "DRESS", "Night suits": "DRESS", "Kurta Sets": "DRESS",
    "Scarves": "SCARF", "Stoles": "SCARF", "Dupatta": "SCARF",
    "Earrings": "JEWELRY", "Necklace and Chains": "JEWELRY", "Pendant": "JEWELRY",
    "Ring": "JEWELRY", "Bangle": "JEWELRY", "Bracelet": "JEWELRY",
    "Watches": "ACCESSORY", "Belts": "ACCESSORY", "Handbags": "ACCESSORY",
    "Sunglasses": "ACCESSORY", "Socks": "ACCESSORY", "Wallets": "ACCESSORY",
    "Backpacks": "ACCESSORY", "Clutches": "ACCESSORY", "Caps": "ACCESSORY", "Ties": "ACCESSORY",
    "Casual Shoes": "SHOES", "Sports Shoes": "SHOES", "Heels": "SHOES",
    "Flip Flops": "SHOES", "Sandals": "SHOES", "Formal Shoes": "SHOES", "Flats": "SHOES",
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