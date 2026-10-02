import { useEffect, useState } from 'react';
import { getColorWheel, getColorScheme } from '../api/color.api';
import { hueToPosition } from '../utils/colorWheel.util';
import { CATEGORY_LABELS } from '../utils/labels';
import type { ColorWheelItem, SchemeResult, ColorScheme } from '../types/color.types';

const WHEEL_SIZE = 400;
const CENTER = WHEEL_SIZE / 2;
const MAX_RADIUS = WHEEL_SIZE / 2 - 30;

const SCHEME_LABELS: Record<ColorScheme, string> = {
  complementary: 'Tamamlayıcı (2 Renk)',
  analogous: 'Analog (Komşu Renkler)',
  triadic: 'Üçlü Uyum (3 Renk)',
  splitComplementary: 'Bölünmüş Tamamlayıcı (3 Renk)',
  tetradic: 'Dörtlü Uyum (4 Renk)',
};

const ALL_SCHEMES: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'splitComplementary', 'tetradic'];

function generateWheelGradientStops() {
  const stops = [];
  for (let hue = 0; hue <= 360; hue += 30) {
    stops.push(`hsl(${hue}, 80%, 55%) ${(hue / 360) * 100}%`);
  }
  return stops.join(', ');
}

function ColorWheelPage() {
  const [items, setItems] = useState<ColorWheelItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>('complementary');
  const [schemeResult, setSchemeResult] = useState<SchemeResult | null>(null);

  useEffect(() => {
    getColorWheel().then(setItems);
  }, []);

  useEffect(() => {
    if (selectedItemId) {
      getColorScheme(selectedItemId, selectedScheme).then(setSchemeResult);
    }
  }, [selectedItemId, selectedScheme]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Renk Kombinasyonları</h1>
        <p className="text-sm text-gray-500 mb-6">
          Dolabından bir kıyafet seç, sana uygun renk uyum şemalarını keşfet.
        </p>

        <div className="flex gap-8 flex-wrap">
          <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${generateWheelGradientStops()})`,
                opacity: 0.25,
              }}
            />

            <svg width={WHEEL_SIZE} height={WHEEL_SIZE} className="absolute inset-0">
              {schemeResult &&
                schemeResult.otherSlots.map((slot, idx) => {
                  if (!slot.item) return null;
                  const baseHsl = items.find((i) => i.id === schemeResult.baseItem.id);
                  if (!baseHsl) return null;
                  const p1 = hueToPosition(baseHsl.hue, baseHsl.saturation, MAX_RADIUS);
                  const p2 = hueToPosition(slot.item.hue, slot.item.saturation, MAX_RADIUS);
                  return (
                    <line
                      key={idx}
                      x1={CENTER + p1.x}
                      y1={CENTER + p1.y}
                      x2={CENTER + p2.x}
                      y2={CENTER + p2.y}
                      stroke="#1f2937"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                  );
                })}

              {items.map((item) => {
                const pos = hueToPosition(item.hue, item.saturation, MAX_RADIUS);
                const isSelected = item.id === selectedItemId;
                return (
                  <g key={item.id} onClick={() => setSelectedItemId(item.id)} className="cursor-pointer">
                    <circle
                      cx={CENTER + pos.x}
                      cy={CENTER + pos.y}
                      r={isSelected ? 12 : 9}
                      fill={item.color}
                      stroke={isSelected ? '#1f2937' : '#ffffff'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex-1 min-w-[280px]">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Şema Seç</h2>
            <div className="flex flex-col gap-2 mb-6">
              {ALL_SCHEMES.map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setSelectedScheme(scheme)}
                  disabled={!selectedItemId}
                  className={`text-left px-3 py-2 rounded-md text-sm border disabled:opacity-40 ${
                    selectedScheme === scheme
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {SCHEME_LABELS[scheme]}
                </button>
              ))}
            </div>

            {!selectedItemId && (
              <p className="text-sm text-gray-400">Çarktan bir kıyafet seç →</p>
            )}

            {schemeResult && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Seçilen Kombinasyon</h3>
                <div className="flex gap-2 flex-wrap">
                  <div className="text-center">
                    <img
                      src={schemeResult.baseItem.imageUrl}
                      alt=""
                      className="w-16 h-16 object-cover rounded-md border-2 border-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">{CATEGORY_LABELS[schemeResult.baseItem.category as keyof typeof CATEGORY_LABELS]}</p>
                  </div>
                  {schemeResult.otherSlots.map((slot, idx) =>
                    slot.item ? (
                      <div key={idx} className="text-center">
                        <img src={slot.item.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">{CATEGORY_LABELS[slot.item.category as keyof typeof CATEGORY_LABELS]}</p>
                      </div>
                    ) : (
                      <div key={idx} className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                        Yok
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorWheelPage;