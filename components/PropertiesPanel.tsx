import React, { useState } from 'react';
import { DesignElement } from '../types';
import { Sparkles, Trash2, AlignLeft, Type as TypeIcon } from 'lucide-react';
import { generateContentSuggestion, generateColorSuggestion } from '../services/geminiService';

interface PropertiesPanelProps {
  element: DesignElement | null;
  updateElement: (id: string, changes: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, updateElement, deleteElement }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  if (!element) {
    return (
      <div className="w-64 bg-[#2c2c2c] border-l border-[#111] flex flex-col p-4 text-xs text-gray-400">
        <span className="font-semibold mb-2">Propriedades</span>
        <p>Selecione um elemento para editar suas propriedades.</p>
      </div>
    );
  }

  const handleChange = (field: keyof DesignElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };

  const handleAiTextGen = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    const newText = await generateContentSuggestion(aiPrompt, element.text || '');
    updateElement(element.id, { text: newText });
    setAiLoading(false);
    setAiPrompt('');
  };

  const handleAiColorGen = async () => {
    setAiLoading(true);
    const newColor = await generateColorSuggestion(aiPrompt || "Modern UI Color");
    updateElement(element.id, { fill: newColor });
    setAiLoading(false);
  };

  return (
    <div className="w-64 bg-[#2c2c2c] border-l border-[#111] flex flex-col h-full overflow-y-auto">
      
      {/* Header */}
      <div className="p-3 border-b border-[#444] flex justify-between items-center">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          {element.type === 'text' ? 'Texto' : element.type === 'rectangle' ? 'Retângulo' : 'Círculo'}
        </span>
        <button 
          onClick={() => deleteElement(element.id)}
          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30"
          title="Deletar Elemento"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Alignment / Position */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-[#444]">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">X</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => handleChange('x', Number(e.target.value))}
            className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444] focus:border-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">Y</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => handleChange('y', Number(e.target.value))}
            className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444] focus:border-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">W</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => handleChange('width', Number(e.target.value))}
            className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444] focus:border-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 block">H</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444] focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="p-4 border-b border-[#444] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 mb-2">Aparência</h3>
        
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded border border-gray-600 overflow-hidden relative">
             <input 
              type="color" 
              value={element.fill} 
              onChange={(e) => handleChange('fill', e.target.value)}
              className="absolute -top-2 -left-2 w-10 h-10 p-0 m-0 border-0 cursor-pointer"
             />
           </div>
           <input
             type="text"
             value={element.fill.toUpperCase()}
             onChange={(e) => handleChange('fill', e.target.value)}
             className="flex-1 bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444]"
           />
           <span className="text-[10px] text-gray-500">{Math.round(element.opacity * 100)}%</span>
        </div>

        <div>
           <label className="text-[10px] text-gray-400 block mb-1">Opacidade</label>
           <input
             type="range"
             min="0"
             max="1"
             step="0.01"
             value={element.opacity}
             onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
             className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
           />
        </div>

        {element.type === 'rectangle' && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Arredondamento</label>
             <input
              type="number"
              value={element.borderRadius || 0}
              onChange={(e) => handleChange('borderRadius', Number(e.target.value))}
              className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444]"
            />
          </div>
        )}
      </div>

      {/* Text Properties */}
      {element.type === 'text' && (
        <div className="p-4 border-b border-[#444] space-y-3">
          <h3 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
            <TypeIcon size={12}/> Conteúdo
          </h3>
          <textarea
            value={element.text}
            onChange={(e) => handleChange('text', e.target.value)}
            rows={3}
            className="w-full bg-[#1e1e1e] text-gray-200 text-xs px-2 py-2 rounded border border-[#444] focus:border-blue-500 outline-none resize-none"
          />
           <div className="flex gap-2 items-center">
             <label className="text-[10px] text-gray-400">Tamanho</label>
             <input
              type="number"
              value={element.fontSize || 16}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-16 bg-[#1e1e1e] text-gray-200 text-xs px-2 py-1 rounded border border-[#444]"
            />
           </div>
        </div>
      )}

      {/* Gemini AI Assistant */}
      <div className="p-4 mt-auto bg-gradient-to-b from-[#2c2c2c] to-[#222]">
        <h3 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1">
          <Sparkles size={12} /> Gemini Assistant
        </h3>
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder={element.type === 'text' ? "Ex: Melhore este texto para vendas" : "Ex: Azul neon cyberpunk"}
            className="bg-[#1e1e1e] text-gray-200 text-xs px-2 py-2 rounded border border-[#444] placeholder-gray-600 focus:border-blue-500 outline-none"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
               if(e.key === 'Enter') {
                 if (element.type === 'text') handleAiTextGen();
                 else handleAiColorGen();
               }
            }}
          />
          <button 
            disabled={aiLoading || !aiPrompt}
            onClick={() => {
                 if (element.type === 'text') handleAiTextGen();
                 else handleAiColorGen();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 px-3 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {aiLoading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Sparkles size={12} />
            )}
            {element.type === 'text' ? 'Gerar Texto' : 'Gerar Cor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
