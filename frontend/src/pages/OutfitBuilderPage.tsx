import { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { getWardrobeItems } from '../api/wardrobe.api';
import { getOutfitSuggestions, saveOutfit } from '../api/outfit.api';
import type { OutfitSuggestion } from '../api/outfit.api';
import type { ClothingItem } from '../types/clothing.types';

interface CanvasItem {
  uid: string;
  item: ClothingItem;
  x: number;
  y: number;
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 450;
const THUMBNAIL_SIZE = 100;

function DraggableThumbnail({
  canvasItem,
  onDragEnd,
  onRemove,
}: {
  canvasItem: CanvasItem;
  onDragEnd: (uid: string, x: number, y: number) => void;
  onRemove: (uid: string) => void;
}) {
  const [image] = useImage(canvasItem.item.imageUrl);

  return (
    <KonvaImage
      image={image}
      x={canvasItem.x}
      y={canvasItem.y}
      width={THUMBNAIL_SIZE}
      height={THUMBNAIL_SIZE}
      draggable
      onDragEnd={(e) => onDragEnd(canvasItem.uid, e.target.x(), e.target.y())}
      onDblClick={() => onRemove(canvasItem.uid)}
      onDblTap={() => onRemove(canvasItem.uid)}
    />
  );
}

function OutfitBuilderPage() {
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    getWardrobeItems().then(setWardrobeItems);
  }, []);

  function addToCanvas(item: ClothingItem) {
    const uid = crypto.randomUUID();
    const x = 20 + Math.random() * (CANVAS_WIDTH - THUMBNAIL_SIZE - 40);
    const y = 20 + Math.random() * (CANVAS_HEIGHT - THUMBNAIL_SIZE - 40);
    setCanvasItems((prev) => [...prev, { uid, item, x, y }]);
  }

  function handleDragEnd(uid: string, x: number, y: number) {
    setCanvasItems((prev) => prev.map((ci) => (ci.uid === uid ? { ...ci, x, y } : ci)));
  }

  function removeFromCanvas(uid: string) {
    setCanvasItems((prev) => prev.filter((ci) => ci.uid !== uid));
  }

  async function handleGetSuggestions() {
    setSuggestionMessage(null);
    const result = await getOutfitSuggestions();
    setSuggestions(result.suggestions);
    setSuggestionMessage(result.message ?? null);
  }

  async function handleSaveCanvas() {
    const uniqueIds = [...new Set(canvasItems.map((ci) => ci.item.id))];
    if (uniqueIds.length < 2) {
      setSaveMessage('En az 2 farklı kıyafet eklemelisiniz');
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveOutfit(uniqueIds);
      setSaveMessage('Kombin kaydedildi!');
      setCanvasItems([]);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.error ?? 'Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLikeSuggestion(suggestion: OutfitSuggestion) {
    try {
      await saveOutfit(suggestion.items.map((i) => i.id));
      setSuggestionMessage('Kombin beğenildi ve kaydedildi!');
    } catch (err: any) {
      setSuggestionMessage(err.response?.data?.error ?? 'Kaydetme başarısız');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kombin Oluştur</h1>

        <div className="flex gap-6 flex-wrap">
          <div className="w-48 bg-white rounded-lg shadow-sm p-3 max-h-[450px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Dolabım (tıkla, ekle)</h2>
            <div className="grid grid-cols-2 gap-2">
              {wardrobeItems.map((item) => (
                <button key={item.id} onClick={() => addToCanvas(item)} className="border rounded overflow-hidden">
                  <img src={item.imageUrl} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-2 inline-block">
              <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
                <Layer>
                  {canvasItems.map((ci) => (
                    <DraggableThumbnail
                      key={ci.uid}
                      canvasItem={ci}
                      onDragEnd={handleDragEnd}
                      onRemove={removeFromCanvas}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
            <p className="text-xs text-gray-400 mt-2">Sürükleyerek düzenle, çıkarmak için çift tıkla</p>

            {saveMessage && <p className="text-sm mt-2 text-blue-600">{saveMessage}</p>}

            <button
              onClick={handleSaveCanvas}
              disabled={isSaving}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kombini Kaydet'}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">AI Önerileri</h2>
            <button
              onClick={handleGetSuggestions}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 text-sm"
            >
              3 Kombin Öner
            </button>
          </div>

          {suggestionMessage && <p className="text-sm text-gray-500 mb-4">{suggestionMessage}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex gap-2 mb-3">
                  {s.items.map((item) => (
                    <img key={item.id} src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-2">Uyum skoru: {(s.score * 100).toFixed(0)}%</p>
                <button
                  onClick={() => handleLikeSuggestion(s)}
                  className="w-full bg-pink-600 text-white py-1.5 rounded-md hover:bg-pink-700 text-sm"
                >
                  ❤ Beğen ve Kaydet
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutfitBuilderPage;