import React from 'react';
import { MousePointer2, Hand, Square, Circle, Type, LayoutGrid } from 'lucide-react';
import { Tool } from '../types';

interface ToolbarProps {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, setTool }) => {
  const tools = [
    { id: Tool.SELECT, icon: <MousePointer2 size={18} />, label: 'Mover' },
    { id: Tool.HAND, icon: <Hand size={18} />, label: 'Pan' },
    { type: 'separator' },
    { id: Tool.RECTANGLE, icon: <Square size={18} />, label: 'Retângulo' },
    { id: Tool.CIRCLE, icon: <Circle size={18} />, label: 'Círculo' },
    { id: Tool.TEXT, icon: <Type size={18} />, label: 'Texto' },
  ];

  return (
    <div className="h-12 bg-[#2c2c2c] border-b border-[#111] flex items-center justify-center space-x-1 px-4 select-none z-50 relative">
      <div className="absolute left-4 flex items-center gap-2 font-bold text-white">
        <LayoutGrid className="text-blue-500" />
        <span>Figmini</span>
      </div>
      
      <div className="flex bg-[#383838] rounded-lg p-1 gap-1">
        {tools.map((tool: any, idx) => {
          if (tool.type === 'separator') {
            return <div key={`sep-${idx}`} className="w-px h-6 bg-[#555] mx-1 self-center" />;
          }
          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              title={tool.label}
              className={`p-2 rounded md:hover:bg-blue-500/20 transition-colors ${
                currentTool === tool.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>
      
      <div className="absolute right-4 text-xs text-gray-500">
        Design Assistant Ready
      </div>
    </div>
  );
};

export default Toolbar;
