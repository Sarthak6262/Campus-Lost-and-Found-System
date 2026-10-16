import React, { useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { itemService } from '../../services/itemService';
import { getErrorMessage } from '../../services/api';
import { Item } from '../../types/item';

interface ItemImageUploadProps {
  itemId: number;
  currentImageUrl?: string | null;
  onSuccess: (updatedItem: Item) => void;
}

export const ItemImageUpload: React.FC<ItemImageUploadProps> = ({
  itemId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const updatedItem = await itemService.uploadImage(itemId, selectedFile);
      toast.success('Image uploaded successfully!');
      handleClear();
      onSuccess(updatedItem);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Upload Item Image</h4>
        <span className="text-xs text-slate-400">JPG, PNG up to 5MB</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-60">
          <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-60 object-contain" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-8 flex flex-col items-center justify-center text-center transition bg-slate-50/50 hover:bg-brand-50/30"
        >
          <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs text-brand-600 mb-2">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">Click to select an image</p>
          <p className="text-xs text-slate-400 mt-1">Clear photos help speed up verification and matching</p>
        </div>
      )}

      {selectedFile && (
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleClear} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Photo
          </Button>
        </div>
      )}
    </div>
  );
};
