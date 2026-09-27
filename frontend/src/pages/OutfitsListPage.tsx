import { useEffect, useState } from 'react';
import { getMyOutfits } from '../api/outfit.api';
import type { Outfit } from '../types/outfit.types';

function OutfitsListPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyOutfits()
      .then(setOutfits)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kombinlerim</h1>

        {isLoading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : outfits.length === 0 ? (
          <p className="text-gray-500">Henüz kaydedilmiş bir kombininiz yok.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {outfit.items.map((link) => (
                    <img
                      key={link.clothingItemId}
                      src={link.clothingItem.imageUrl}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(outfit.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutfitsListPage;