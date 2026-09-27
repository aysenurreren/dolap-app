import { useState } from 'react';
import { updateClothingItem, deleteClothingItem } from '../api/wardrobe.api';
import { CATEGORY_LABELS, SEASON_LABELS } from '../utils/labels';
import type { ClothingItem, ClothingCategory, ClothingSeason } from '../types/clothing.types';

interface EditClothingModalProps {
  item: ClothingItem;
  onClose: () => void;
  onUpdated: (updatedItem: ClothingItem) => void;
  onDeleted: (id: string) => void;
}

const ALL_SEASONS: ClothingSeason[] = ['YAZ', 'ILKBAHAR', 'SONBAHAR', 'KIS'];
const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [ClothingCategory, string][];

function EditClothingModal({ item, onClose, onUpdated, onDeleted }: EditClothingModalProps) {
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [color, setColor] = useState(item.color);
  const [seasons, setSeasons] = useState<ClothingSeason[]>(item.seasons);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSeason(season: ClothingSeason) {
    setSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateClothingItem(item.id, { category, color, seasons });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Güncelleme başarısız');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Bu kıyafeti silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await deleteClothingItem(item.id);
      onDeleted(item.id);
      onClose();
    } catch {
      setError('Silme başarısız');
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Kıyafeti Düzenle</h2>

        <img src={item.imageUrl} alt="" className="w-full h-40 object-cover rounded-md mb-4" />

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ClothingCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {ALL_CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-500">{color}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mevsimler</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SEASONS.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => toggleSeason(season)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  seasons.includes(season)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {SEASON_LABELS[season]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
          >
            Sil
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditClothingModal;