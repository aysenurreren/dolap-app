import type { ClothingItem } from '../types/clothing.types';
import { CATEGORY_LABELS } from '../utils/labels';

interface ClothingCardProps {
  item: ClothingItem;
  onClick: () => void;
}

function ClothingCard({ item, onClick }: ClothingCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
    >
      <img
        src={item.imageUrl}
        alt={CATEGORY_LABELS[item.category]}
        className="w-full h-40 object-cover"
      />
      <div className="p-3">
        <p className="font-medium text-gray-800">{CATEGORY_LABELS[item.category]}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-500">{item.color}</span>
        </div>
      </div>
    </button>
  );
}

export default ClothingCard;