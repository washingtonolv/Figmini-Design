import React from 'react';
import { DesignElement } from '../types';
import { Layers, Square, Circle, Type } from 'lucide-react';

interface LeftSidebarProps {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ elements, selectedId, onSelect }) => {
  // Show in reverse order (top layer first)
  const reversedElements = [...elements].reverse();

  const getIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return <Square size={12} />;
      case 'circle': return <Circle size={12} />;
      case 'text': return <Type size={12} />;
      default: return <Square size={12} />;
    }
  };

  const getLabel = (el: DesignElement) => {
    if (el.type === 'text' && el.text) return el.text.substring(0, 15) + (el.text.length > 15 ? '...' : '');
    return el.type.charAt(0).toUpperCase() + el.type.slice(1);
  };

  return (
    <div className="w-48 bg-[#2c2c2c] border-r border-[#111] flex flex-col h-full">
      <div className="p-3 border-b border-[#444]">
        <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <Layers size={14} /> Camadas
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {reversedElements.length === 0 ? (
          <div className="text-center text-gray-600 text-xs mt-4 italic">Sem elementos</div>
        ) : (
          reversedElements.map((el) => (
            <div
              key={el.id}
              onClick={() => onSelect(el.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs cursor-pointer select-none transition-colors ${
                selectedId === el.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#383838] hover:text-gray-200'
              }`}
            >
              {getIcon(el.type)}
              <span className="truncate">{getLabel(el)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
