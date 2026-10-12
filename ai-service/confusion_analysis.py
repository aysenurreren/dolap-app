import sys
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np
from pathlib import Path


def main():
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_dataset = datasets.ImageFolder("data/processed/val", transform=val_transform)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2)
    class_names = val_dataset.classes

    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(class_names))
    model_path = sys.argv[1] if len(sys.argv) > 1 else "clothing_classifier.pth"
    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            preds = outputs.argmax(1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.numpy())

    cm = confusion_matrix(all_labels, all_preds)

    is_ag = np.array([Path(p).name.startswith("ag_") for p, _ in val_dataset.samples])
    labels_arr = np.array(all_labels)
    preds_arr = np.array(all_preds)
    print("\n=== Kaynağa Göre Doğruluk ===")
    for name, mask in [("Kaggle (eski veri)", ~is_ag), ("agrigorev (yeni veri)", is_ag)]:
        if mask.sum() > 0:
            acc = (labels_arr[mask] == preds_arr[mask]).mean()
            print(f"{name}: {mask.sum()} görsel, doğruluk {acc:.2%}")
    print("\nagrigorev görsellerinde sınıf bazlı doğruluk:")
    for i, name in enumerate(class_names):
        m = is_ag & (labels_arr == i)
        if m.sum() > 0:
            print(f"  {name}: {(preds_arr[m] == i).mean():.2%} ({m.sum()} görsel)")

    print("\n=== Karışıklık Matrisi ===")
    print("Satırlar: Gerçek kategori, Sütunlar: Modelin tahmini\n")
    header = "            " + "".join(f"{name[:8]:>9}" for name in class_names)
    print(header)
    for i, name in enumerate(class_names):
        row = f"{name[:11]:>11} " + "".join(f"{cm[i][j]:>9}" for j in range(len(class_names)))
        print(row)

    print("\n=== Detaylı Rapor ===")
    print(classification_report(all_labels, all_preds, target_names=class_names))

    print("\n=== En Çok Karıştırılan Çiftler (Top 10) ===")
    confusions = []
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            if i != j and cm[i][j] > 0:
                confusions.append((class_names[i], class_names[j], cm[i][j]))
    confusions.sort(key=lambda x: -x[2])
    for real, predicted, count in confusions[:10]:
        print(f"  Gerçek: {real:12} → Tahmin: {predicted:12} | {count} kez")


if __name__ == "__main__":
    main()