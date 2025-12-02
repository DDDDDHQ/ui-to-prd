import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  savedKey: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, savedKey }) => {
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue(savedKey || '');
    }
  }, [isOpen, savedKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(inputValue.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <Key size={18} className="text-blue-600" />
            <h3>设置 Gemini API Key</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 leading-relaxed">
            为了正常使用本工具，您需要配置自己的 Google Gemini API Key。
            <br />
            <span className="text-xs text-gray-400">Key 仅保存在您浏览器的本地缓存中，不会发送给服务器。</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline hover:text-blue-700"
            >
              获取免费 API Key <ExternalLink size={12} />
            </a>
            
            {savedKey && (
               <span className="text-green-600 flex items-center gap-1">
                 <Check size={12} /> 已保存
               </span>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};