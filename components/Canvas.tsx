import React, { useRef, useState, useEffect } from 'react';
import { Tool, DesignElement, Point } from '../types';

interface CanvasProps {
  tool: Tool;
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  addElement: (el: DesignElement) => void;
  updateElement: (id: string, changes: Partial<DesignElement>) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  tool,
  elements,
  selectedId,
  onSelect,
  addElement,
  updateElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport State (Pan)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  // Drawing/Dragging State
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [newElementId, setNewElementId] = useState<string | null>(null);
  
  // Element Dragging State
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [elementDragOffset, setElementDragOffset] = useState<Point>({ x: 0, y: 0 });

  const getMouseCoords = (e: React.MouseEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / scale,
      y: (e.clientY - rect.top - pan.y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getMouseCoords(e);
    setLastMousePos({ x: e.clientX, y: e.clientY });

    // Middle click or Hand tool = Pan
    if (e.button === 1 || tool === Tool.HAND) {
      setIsPanning(true);
      return;
    }

    // Creating shapes
    if (tool === Tool.RECTANGLE || tool === Tool.CIRCLE || tool === Tool.TEXT) {
      setIsDrawing(true);
      setDragStart(coords);
      const id = crypto.randomUUID();
      setNewElementId(id);

      const baseElement: DesignElement = {
        id,
        type: tool === Tool.RECTANGLE ? 'rectangle' : tool === Tool.CIRCLE ? 'circle' : 'text',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        fill: tool === Tool.TEXT ? '#ffffff' : '#D9D9D9',
        opacity: 1,
        text: tool === Tool.TEXT ? 'Texto' : undefined,
        fontSize: 24,
      };
      addElement(baseElement);
      onSelect(id);
      return;
    }

    // Selection Logic:
    // If we click on the canvas and tool is SELECT, we deselect.
    // Clicks on elements stop propagation, so they won't trigger this.
    if (tool === Tool.SELECT) {
        onSelect(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: DesignElement) => {
    if (tool !== Tool.SELECT) return;
    
    e.stopPropagation(); // Prevent canvas background click
    onSelect(el.id);
    setIsDraggingElement(true);
    
    const coords = getMouseCoords(e);
    setElementDragOffset({
      x: coords.x - el.x,
      y: coords.y - el.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getMouseCoords(e);

    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDrawing && newElementId && dragStart) {
      const width = coords.x - dragStart.x;
      const height = coords.y - dragStart.y;
      
      // Normalize negative width/height while drawing
      const x = width < 0 ? coords.x : dragStart.x;
      const y = height < 0 ? coords.y : dragStart.y;
      
      const newWidth = Math.abs(width);
      const newHeight = Math.abs(height);
      
      updateElement(newElementId, { x, y, width: newWidth, height: newHeight });
    }

    if (isDraggingElement && selectedId) {
      updateElement(selectedId, {
        x: coords.x - elementDragOffset.x,
        y: coords.y - elementDragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDrawing(false);
    setNewElementId(null);
    setIsDraggingElement(false);
    
    // If text was created with 0 size (just a click), give default size
    if (tool === Tool.TEXT && newElementId) {
        const el = elements.find(e => e.id === newElementId);
        if (el && el.width === 0) {
            updateElement(newElementId, { width: 100, height: 30 });
        }
    }
  };

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const zoomSpeed = 0.001;
          const newScale = Math.max(0.1, Math.min(5, scale - e.deltaY * zoomSpeed));
          setScale(newScale);
      } else {
        // Pan with wheel
         setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
  };

  return (
    <div 
      className={`flex-1 overflow-hidden relative bg-[#1e1e1e] ${tool === Tool.HAND || isPanning ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          transform: `translate(${pan.x % (20 * scale)}px, ${pan.y % (20 * scale)}px)`
        }}
      />

      <div 
        ref={containerRef}
        className="absolute w-full h-full origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        {elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.type === 'text' ? 'auto' : el.width, // Text auto-expands usually
              height: el.type === 'text' ? 'auto' : el.height,
              backgroundColor: el.type === 'text' ? 'transparent' : el.fill,
              color: el.fill,
              opacity: el.opacity,
              borderRadius: el.type === 'circle' ? '50%' : `${el.borderRadius || 0}px`,
              border: selectedId === el.id ? '2px solid #3b82f6' : '1px solid transparent',
              cursor: tool === Tool.SELECT ? 'move' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${el.fontSize || 16}px`,
              whiteSpace: 'pre',
              minWidth: el.type === 'text' ? '20px' : '0',
              minHeight: el.type === 'text' ? '20px' : '0'
            }}
          >
            {el.type === 'text' ? el.text : null}
            
            {/* Selection indicators (simple corner, MVP) */}
            {selectedId === el.id && (
              <>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500" />
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Status Bar */}
      <div className="absolute bottom-4 right-4 bg-[#2c2c2c] px-3 py-1 rounded-full text-xs text-gray-400 border border-[#444] shadow-lg">
        Zoom: {Math.round(scale * 100)}% | X: {Math.round(-pan.x)} Y: {Math.round(-pan.y)}
      </div>
    </div>
  );
};

export default Canvas;