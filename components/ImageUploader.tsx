import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  image: string | null;
  onImageUpload: (base64: string) => void;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageUpload, onClear }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (image) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center group">
        <img src={image} alt="Uploaded UI" className="max-w-full max-h-full object-contain" />
        <div className="absolute top-2 right-2">
           <button 
            onClick={onClear}
            className="p-2 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full shadow-sm transition-colors"
            title="清除图片"
           >
             <X size={20} />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">点击上传</span> 或拖拽图片到此处</p>
          <p className="text-xs text-gray-500">支持 PNG, JPG 或 WEBP (最大 5MB)</p>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};