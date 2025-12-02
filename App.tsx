import React, { useState, useMemo, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { RequirementTable } from './components/RequirementTable';
import { ApiKeyModal } from './components/ApiKeyModal';
import { analyzeScreenshot } from './services/geminiService';
import { RequirementItem } from './types';
import { Wand2, AlertCircle, Loader2, Settings, X } from 'lucide-react';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [items, setItems] = useState<RequirementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleImageUpload = (base64: string) => {
    setImage(base64);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    if (!apiKey && !process.env.API_KEY) {
      setShowApiModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const generatedItems = await analyzeScreenshot(image, apiKey || undefined);
      setItems(generatedItems);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API Key')) {
         setShowApiModal(true);
         setError("API Key 无效或未设置，请检查配置。");
      } else {
         setError("分析图片失败，请稍后重试或检查网络连接。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setItems([]);
    setError(null);
  };

  const handleUpdateItem = (id: string, field: keyof RequirementItem, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItemToRegion = (region: string) => {
    const newItem: RequirementItem = {
      id: crypto.randomUUID(),
      region: region,
      functionName: "",
      description: "",
      interaction: "",
      validation: "",
      scope: ""
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRenameRegion = (oldRegion: string, newRegion: string) => {
    if (oldRegion === newRegion) return;
    setItems(prev => prev.map(item => 
      item.region === oldRegion ? { ...item, region: newRegion } : item
    ));
  };

  // Reconstruct the master list when a specific region is reordered
  const handleReorderRegionItems = (regionName: string, reorderedRegionItems: RequirementItem[]) => {
    // We need to keep the global order of regions, but update items within this specific region
    
    // 1. Group current items to find region order
    const currentGroups: Record<string, RequirementItem[]> = {};
    const regionOrder: string[] = [];

    items.forEach(item => {
      const r = item.region || "未命名区域";
      if (!currentGroups[r]) {
        currentGroups[r] = [];
        regionOrder.push(r);
      }
      currentGroups[r].push(item);
    });

    // 2. Build new flat list
    let newFlatList: RequirementItem[] = [];
    
    regionOrder.forEach(r => {
      if (r === regionName) {
        newFlatList = [...newFlatList, ...reorderedRegionItems];
      } else {
        newFlatList = [...newFlatList, ...currentGroups[r]];
      }
    });

    setItems(newFlatList);
  };

  // Group items by region, preserving the order of appearance
  const groupedRegions = useMemo(() => {
    const groups: Record<string, RequirementItem[]> = {};
    const regionOrder: string[] = [];

    items.forEach(item => {
      const r = item.region || "未命名区域";
      if (!groups[r]) {
        groups[r] = [];
        regionOrder.push(r);
      }
      groups[r].push(item);
    });

    return regionOrder.map(region => ({
      name: region,
      items: groups[region]
    }));
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <ApiKeyModal 
        isOpen={showApiModal} 
        onClose={() => setShowApiModal(false)}
        onSave={handleSaveApiKey}
        savedKey={apiKey}
      />

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setPreviewImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain rounded-sm" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <Wand2 size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">UI 转 PRD 生成器</h1>
          </div>
          
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={16} />
            {apiKey ? 'API Key 已设置' : '设置 API Key'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Upload & Preview - Sticky on Desktop */}
          <div className="lg:w-1/3 lg:flex-shrink-0">
             <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">1. 上传设计图</h2>
                  <ImageUploader 
                    image={image} 
                    onImageUpload={handleImageUpload} 
                    onClear={handleClear} 
                  />
                  
                  {image && (
                    <div className="mt-2 text-right">
                       <button 
                         onClick={() => setPreviewImage(image)}
                         className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                       >
                         查看大图
                       </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={handleAnalyze}
                      disabled={!image || isLoading}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-all ${
                        image && !isLoading
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          正在识别功能...
                        </>
                      ) : (
                        <>
                          <Wand2 size={20} />
                          生成需求列表
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      基于 Gemini Vision 大模型。根据页面区域自动拆解功能。
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">使用说明</h3>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
                    <li>上传 Figma 导出图或界面截图。</li>
                    <li>点击 <strong>生成需求列表</strong>。</li>
                    <li>AI 将自动识别区域并生成对应的需求表格。</li>
                    <li>悬停序号可拖拽排序，支持导出纯文本到 Axure。</li>
                  </ol>
                </div>
             </div>
          </div>

          {/* Right Column: Data Tables */}
          <div className="lg:w-2/3 space-y-8 flex-grow">
             {items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                  <Wand2 size={48} className="mb-4 text-gray-200" />
                  <p>暂无数据，请上传设计图并点击生成。</p>
                </div>
             ) : (
               groupedRegions.map((group) => (
                 <RequirementTable
                   key={group.name}
                   regionName={group.name}
                   items={group.items}
                   onUpdate={handleUpdateItem}
                   onDelete={handleDeleteItem}
                   onAdd={() => handleAddItemToRegion(group.name)}
                   onRenameRegion={(newName) => handleRenameRegion(group.name, newName)}
                   onReorder={(newItems) => handleReorderRegionItems(group.name, newItems)}
                 />
               ))
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;