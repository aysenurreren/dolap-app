from fastapi import FastAPI, UploadFile, File
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
from rembg import remove

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


def get_dominant_color(image: Image.Image) -> str:
    foreground = remove(image)

    pixels = foreground.getdata()
    non_transparent_pixels = [
        (r, g, b) for r, g, b, a in pixels if a > 200
    ]

    if not non_transparent_pixels:
        r, g, b = image.resize((1, 1), Image.LANCZOS).getpixel((0, 0))[:3]
        return f"#{r:02X}{g:02X}{b:02X}"

    avg_r = sum(p[0] for p in non_transparent_pixels) // len(non_transparent_pixels)
    avg_g = sum(p[1] for p in non_transparent_pixels) // len(non_transparent_pixels)
    avg_b = sum(p[2] for p in non_transparent_pixels) // len(non_transparent_pixels)

    return f"#{avg_r:02X}{avg_g:02X}{avg_b:02X}"


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

    return {
        "category": category,
        "categoryConfidence": round(category_confidence, 4),
        "color": dominant_color,
        "colorConfidence": 0.7,
        "seasons": ["YAZ"],
        "seasonsConfidence": 0.5,
    }