import { useEffect, useState } from 'react';
import { getWardrobeItems } from '../api/wardrobe.api';
import type { ClothingItem } from '../types/clothing.types';
import ClothingCard from '../components/ClothingCard';
import UploadModal from '../components/UploadModal';

function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setIsLoading(true);
    try {
      const data = await getWardrobeItems();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }

  function handleUploaded(newItem: ClothingItem) {
    setItems((prev) => [newItem, ...prev]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dolabım</h1>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Kıyafet Ekle
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Henüz kıyafet eklemediniz.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <ClothingCard key={item.id} item={item} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}

export default WardrobePage;