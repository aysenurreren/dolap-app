import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { requestUploadUrl, uploadFileToS3, confirmUpload } from '../api/wardrobe.api';
import type { ClothingItem } from '../types/clothing.types';

interface UploadModalProps {
  onClose: () => void;
  onUploaded: (item: ClothingItem) => void;
}

function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { uploadUrl, imageKey } = await requestUploadUrl(file.name, file.type, file.size);
      await uploadFileToS3(uploadUrl, file);
      const newItem = await confirmUpload(imageKey);
      onUploaded(newItem);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Yükleme başarısız, tekrar deneyin');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Kıyafet Ekle</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm"
        />

        {file && <p className="text-sm text-gray-500 mb-4">Seçilen: {file.name}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            İptal
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;