import React, { useRef, useState, useEffect } from 'react';
import { useSynthStore } from '../store/useSynthStore';
import { ModularEurorackChassis } from './ModularEurorackChassis';
import { SvgCableLayerOverlay } from './SvgCableLayerOverlay';

export const PatchBayStage: React.FC = () => {
  const { modules, addCable } = useSynthStore();
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingStage = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // State for actively dragging a cable
  const [activeCable, setActiveCable] = useState<{
    sourceModuleId: string;
    sourcePort: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(Math.max(0.5, z - e.deltaY * 0.01), 2));
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };
    const el = stageRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (el) el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan if middle click or background is clicked
    if (e.button === 1 || e.target === stageRef.current) {
      isDraggingStage.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingStage.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    if (activeCable && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setActiveCable(prev => prev ? { ...prev, endX: mouseX, endY: mouseY } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingStage.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (activeCable) {
      setActiveCable(null);
    }
  };

  return (
    <div 
      ref={stageRef}
      className="patch-bay-stage"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-zoom={zoom}
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      style={{
        backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      <div 
        className="patch-bay-canvas"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <SvgCableLayerOverlay activeCable={activeCable} />
        
        {modules.map(mod => (
          <ModularEurorackChassis 
            key={mod.id} 
            module={mod} 
            zoom={zoom}
            pan={pan}
            onPortDragStart={(port, x, y) => setActiveCable({
              sourceModuleId: mod.id,
              sourcePort: port,
              startX: x, startY: y,
              endX: x, endY: y
            })}
            onPortDrop={(port) => {
              if (activeCable && activeCable.sourceModuleId !== mod.id) {
                addCable({
                  id: `cable-${Date.now()}`,
                  sourceModuleId: activeCable.sourceModuleId,
                  sourcePort: activeCable.sourcePort,
                  targetModuleId: mod.id,
                  targetPort: port
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
