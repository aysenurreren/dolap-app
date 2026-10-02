from fastapi import FastAPI, UploadFile, File
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
from rembg import remove
import onnxruntime
onnxruntime.preload_dlls()
import numpy as np
from sklearn.cluster import KMeans
import colorsys

app = FastAPI()

CLASS_NAMES = ['ACCESSORY', 'DRESS', 'JACKET', 'JEWELRY', 'PANTS', 'SCARF', 'SHIRT', 'SHOES', 'SHORTS', 'SKIRT', 'SWEATER', 'TSHIRT']
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.mobilenet_v3_small(weights=None)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(CLASS_NAMES))
model.load_state_dict(torch.load("clothing_classifier.pth", map_location=DEVICE))
model.to(DEVICE)
model.eval()

inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


from rembg import remove, new_session

rembg_session = new_session("u2netp", providers=["CPUExecutionProvider"])


def get_dominant_color(image: Image.Image) -> str:
    try:
        small = image.convert("RGB").resize((200, 200))
        foreground = remove(small, session=rembg_session)

        pixels = foreground.getdata()
        foreground_pixels = [(r, g, b) for r, g, b, a in pixels if a > 200]

        if len(foreground_pixels) < 50:
            raise ValueError("Segmentasyon yeterli piksel bulamadı")

        kmeans = KMeans(n_clusters=3, n_init=10, random_state=42)
        kmeans.fit(foreground_pixels)
        labels, counts = np.unique(kmeans.labels_, return_counts=True)
        dominant_idx = labels[np.argmax(counts)]
        r, g, b = kmeans.cluster_centers_[dominant_idx]
        return f"#{int(r):02X}{int(g):02X}{int(b):02X}"

    except Exception as e:
        print(f"[UYARI] Segmentasyon başarısız, basit yönteme dönülüyor: {e}")
        r, g, b = image.convert("RGB").resize((1, 1), Image.LANCZOS).getpixel((0, 0))[:3]
        return f"#{r:02X}{g:02X}{b:02X}"
    
@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    input_tensor = inference_transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, dim=1)

    category = CLASS_NAMES[predicted_idx.item()]
    category_confidence = confidence.item()
    dominant_color = get_dominant_color(image)

    SEASON_RULES = {
    "JACKET": ["KIS", "SONBAHAR"],
    "SWEATER": ["KIS", "SONBAHAR"],
    "SHORTS": ["YAZ", "ILKBAHAR"],
    "TSHIRT": ["YAZ", "ILKBAHAR", "SONBAHAR"],
    "SKIRT": ["YAZ", "ILKBAHAR", "SONBAHAR"],
}
    seasons = SEASON_RULES.get(category, ["YAZ", "ILKBAHAR", "SONBAHAR", "KIS"])

    return {
        "category": category,
        "categoryConfidence": round(category_confidence, 4),
        "color": dominant_color,
        "colorConfidence": 0.7,
        "seasons": seasons,
        "seasonsConfidence": 0.5,
    }