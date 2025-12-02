import React, { useState, useRef } from 'react';
import { RequirementItem } from '../types';
import { Trash2, Plus, Download, Edit2, Check, GripVertical, Copy } from 'lucide-react';

interface RequirementTableProps {
  regionName: string;
  items: RequirementItem[];
  onUpdate: (id: string, field: keyof RequirementItem, value: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onRenameRegion: (newName: string) => void;
  onReorder: (newItems: RequirementItem[]) => void;
}

export const RequirementTable: React.FC<RequirementTableProps> = ({ 
  regionName, 
  items, 
  onUpdate, 
  onDelete, 
  onAdd,
  onRenameRegion,
  onReorder
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(regionName);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Refs for drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== regionName) {
      onRenameRegion(editedTitle);
    } else {
      setEditedTitle(regionName);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;

    const headers = ["功能", "描述", "交互", "校验", "影响范围"];
    const csvContent = [
      headers.join(","),
      ...items.map(item => {
        const safe = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          safe(item.functionName),
          safe(item.description),
          safe(item.interaction),
          safe(item.validation),
          safe(item.scope)
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${regionName || 'export'}_requirements.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyText = async () => {
    if (items.length === 0) return;

    const headers = ["功能", "描述", "交互", "校验", "影响范围"];
    // Using Tab (\t) separator is standard for copy-pasting to Excel/Axure tables
    // It prevents the "paste as image" issue in Axure that happens with rich text/HTML clipboard data
    const tsvContent = [
      headers.join("\t"),
      ...items.map(item => {
        // Helper to remove tabs/newlines from content to prevent breaking grid structure
        const clean = (str: string) => (str || "").replace(/[\t\n\r]/g, " ").trim();
        return [
          clean(item.functionName),
          clean(item.description),
          clean(item.interaction),
          clean(item.validation),
          clean(item.scope)
        ].join("\t");
      })
    ].join("\n");

    try {
        await navigator.clipboard.writeText(tsvContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error("Copy failed", err);
        alert("复制失败，请重试");
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, position: number, id: string) => {
    dragItem.current = position;
    setDraggedItemId(id);
    // Determine the row element and set effect
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    dragOverItem.current = position;
  };
  
  const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const copyListItems = [...items];
    const dragItemContent = copyListItems[dragItem.current!];
    
    // Remove item from old position
    copyListItems.splice(dragItem.current!, 1);
    
    // Insert item at new position
    copyListItems.splice(dragOverItem.current!, 0, dragItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedItemId(null);
    
    onReorder(copyListItems);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Table Header / Toolbar */}
      <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="px-2 py-1 text-lg font-bold text-gray-800 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleTitleBlur} className="text-green-600 hover:text-green-700">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h3 className="text-lg font-bold text-gray-800 border border-transparent rounded px-2 py-1 hover:border-gray-300 hover:bg-gray-100 transition-all">
                {regionName}
              </h3>
              <Edit2 size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm border ${
              isCopied 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
             {isCopied ? <Check size={14} /> : <Copy size={14} />}
             {isCopied ? "已复制" : "复制文本"}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Download size={14} />
            导出 CSV
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-amber-50/80 border-b border-gray-300">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 w-12 text-center whitespace-nowrap">#</th>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 min-w-[150px] whitespace-nowrap">功能</th>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 min-w-[200px] whitespace-nowrap">描述</th>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 min-w-[200px] whitespace-nowrap">交互</th>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 min-w-[150px] whitespace-nowrap">校验</th>
              <th scope="col" className="px-4 py-3 font-bold border-r border-gray-300 min-w-[100px] whitespace-nowrap">影响范围</th>
              <th scope="col" className="px-2 py-3 w-10 text-center whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={item.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index, item.id)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`bg-white border-b group transition-colors ${
                  draggedItemId === item.id ? 'bg-blue-50 opacity-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-2 text-center border-r border-gray-200 text-gray-400 font-mono text-xs whitespace-nowrap cursor-move relative">
                  <div className="group-hover:hidden">{index + 1}</div>
                  <div className="hidden group-hover:flex items-center justify-center text-gray-500">
                     <GripVertical size={16} />
                  </div>
                </td>
                <td className="p-0 border-r border-gray-200 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.functionName}
                    onChange={(e) => onUpdate(item.id, 'functionName', e.target.value)}
                    className="w-full h-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 font-medium text-gray-900 transition-colors"
                  />
                </td>
                <td className="p-0 border-r border-gray-200 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    className="w-full h-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </td>
                <td className="p-0 border-r border-gray-200 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.interaction}
                    onChange={(e) => onUpdate(item.id, 'interaction', e.target.value)}
                    className="w-full h-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </td>
                <td className="p-0 border-r border-gray-200 whitespace-nowrap">
                   <input
                    type="text"
                    value={item.validation}
                    onChange={(e) => onUpdate(item.id, 'validation', e.target.value)}
                    className="w-full h-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </td>
                <td className="p-0 border-r border-gray-200 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.scope}
                    onChange={(e) => onUpdate(item.id, 'scope', e.target.value)}
                    className="w-full h-full px-4 py-2.5 bg-transparent focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </td>
                <td className="px-2 py-2 text-center whitespace-nowrap">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded"
                    title="删除行"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Add Row */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 flex justify-center">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 rounded-full transition-colors"
        >
          <Plus size={14} />
          添加一行
        </button>
      </div>
    </div>
  );
};