import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from collections import Counter

def main():
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Kullanılan cihaz: {DEVICE}")

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder("data/processed_256/train", transform=train_transform)
    val_dataset = datasets.ImageFolder("data/processed_256/val", transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2)

    print(f"Eğitim örnekleri: {len(train_dataset)}, Doğrulama örnekleri: {len(val_dataset)}")
    print(f"Sınıflar: {train_dataset.classes}")

    model = models.mobilenet_v3_small(weights="IMAGENET1K_V1")

    for param in model.parameters():
        param.requires_grad = False

    num_classes = len(train_dataset.classes)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    model = model.to(DEVICE)

    class_counts = Counter(train_dataset.targets)
    class_weights = torch.tensor(
        [1.0 / class_counts[i] for i in range(num_classes)],
        dtype=torch.float32
    ).to(DEVICE)

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.Adam(model.classifier[3].parameters(), lr=0.001)

    print("Model hazır, eğitilebilir parametre sayısı:")
    print(sum(p.numel() for p in model.parameters() if p.requires_grad))

    def train_one_epoch(epoch_idx):
        model.train()
        total_loss = 0
        correct = 0
        start = time.time()
        total_batches = len(train_loader)

        for batch_idx, (images, labels) in enumerate(train_loader, start=1):
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()

            if batch_idx % 50 == 0 or batch_idx == total_batches:
                elapsed = time.time() - start
                eta = elapsed / batch_idx * (total_batches - batch_idx)
                print(f"  Epoch {epoch_idx} | batch {batch_idx}/{total_batches} | geçen {elapsed:.0f}s | kalan ~{eta:.0f}s", flush=True)

        avg_loss = total_loss / len(train_loader)
        accuracy = correct / len(train_dataset)
        return avg_loss, accuracy

    def validate():
        model.eval()
        total_loss = 0
        correct = 0
        class_correct = Counter()
        class_total = Counter()

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)

                total_loss += loss.item()
                preds = outputs.argmax(1)
                correct += (preds == labels).sum().item()

                for label, pred in zip(labels, preds):
                    class_total[label.item()] += 1
                    if label == pred:
                        class_correct[label.item()] += 1

        avg_loss = total_loss / len(val_loader)
        accuracy = correct / len(val_dataset)

        print("Sınıf bazlı doğruluk:")
        for i, class_name in enumerate(train_dataset.classes):
            if class_total[i] > 0:
                acc = class_correct[i] / class_total[i]
                print(f"  {class_name}: {acc:.2%} ({class_correct[i]}/{class_total[i]})")

        return avg_loss, accuracy

    NUM_EPOCHS = 5
    for epoch in range(NUM_EPOCHS):
        train_loss, train_acc = train_one_epoch(epoch + 1)
        val_loss, val_acc = validate()
        print(f"Epoch {epoch+1}/{NUM_EPOCHS} — Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2%} | Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2%}")

    torch.save(model.state_dict(), "clothing_classifier_v2.pth")
    print("Model kaydedildi: clothing_classifier_v2.pth")


if __name__ == "__main__":
    main()