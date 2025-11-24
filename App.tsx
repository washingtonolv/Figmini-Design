import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/PropertiesPanel';
import Canvas from './components/Canvas';
import { Tool, DesignElement } from './types';

const App: React.FC = () => {
  const [elements, setElements] = useState<DesignElement[]>([
    {
      id: '1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#4f46e5',
      opacity: 1,
      borderRadius: 12
    },
    {
      id: '2',
      type: 'text',
      x: 120,
      y: 140,
      width: 160,
      height: 40,
      fill: '#ffffff',
      opacity: 1,
      text: 'Olá, Figmini!',
      fontSize: 24
    }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>(Tool.SELECT);

  const addElement = (el: DesignElement) => {
    setElements(prev => [...prev, el]);
  };

  const updateElement = (id: string, changes: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId) || null;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!selectedId && e.key !== 'z' && e.key !== 'y') return; 

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedId) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
          }
          break;
        case 'Escape':
          setSelectedId(null);
          setCurrentTool(Tool.SELECT);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (selectedId) {
            e.preventDefault();
            const shift = e.shiftKey ? 10 : 1;
            const dx = e.key === 'ArrowLeft' ? -shift : e.key === 'ArrowRight' ? shift : 0;
            const dy = e.key === 'ArrowUp' ? -shift : e.key === 'ArrowDown' ? shift : 0;
            
            setElements(prev => prev.map(el => {
                if (el.id === selectedId) {
                    return { ...el, x: el.x + dx, y: el.y + dy };
                }
                return el;
            }));
          }
          break;
        case 'd': // Duplicate (Ctrl + D)
          if ((e.ctrlKey || e.metaKey) && selectedId) {
            e.preventDefault();
            const newId = crypto.randomUUID();
            setElements(prev => {
              const existing = prev.find(el => el.id === selectedId);
              if (!existing) return prev;
              // Duplicate with slight offset
              return [...prev, { ...existing, id: newId, x: existing.x + 20, y: existing.y + 20 }];
            });
            setSelectedId(newId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1e1e] text-white overflow-hidden">
      <Toolbar currentTool={currentTool} setTool={setCurrentTool} />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          elements={elements} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
        />
        
        <Canvas 
          tool={currentTool}
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          addElement={addElement}
          updateElement={updateElement}
        />
        
        <RightSidebar 
          element={selectedElement} 
          updateElement={updateElement}
          deleteElement={deleteElement}
        />
      </div>
    </div>
  );
};

export default App;