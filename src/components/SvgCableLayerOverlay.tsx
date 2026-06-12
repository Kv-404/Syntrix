import React, { useEffect, useState } from 'react';
import { useSynthStore } from '../store/useSynthStore';

interface Props {
  activeCable: {
    sourceModuleId: string;
    sourcePort: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

export const SvgCableLayerOverlay: React.FC<Props> = ({ activeCable }) => {
  const { cables, modules } = useSynthStore();
  const [portPositions, setPortPositions] = useState<Record<string, { x: number, y: number }>>({});

  // Use a rAF loop to continuously update port positions based on DOM.
  // This is easier than manually computing positions within each module's internal layout.
  useEffect(() => {
    let animationFrameId: number;
    const stageEl = document.querySelector('.patch-bay-stage') || document.querySelector('main > div');
    
    const updatePositions = () => {
      if (!stageEl) return;
      const stageRect = stageEl.getBoundingClientRect();
      const zoom = Number(stageEl.getAttribute('data-zoom')) || 1;
      const panX = Number(stageEl.getAttribute('data-pan-x')) || 0;
      const panY = Number(stageEl.getAttribute('data-pan-y')) || 0;

      const newPositions: Record<string, { x: number, y: number }> = {};
      const ports = document.querySelectorAll('.port-jack > div[id^="port-"]');
      
      ports.forEach((port) => {
        const rect = port.getBoundingClientRect();
        // Convert screen coordinates to canvas coordinates
        const x = (rect.left + rect.width / 2 - stageRect.left - panX) / zoom;
        const y = (rect.top + rect.height / 2 - stageRect.top - panY) / zoom;
        newPositions[port.id] = { x, y };
      });
      
      setPortPositions(newPositions);
      animationFrameId = requestAnimationFrame(updatePositions);
    };
    
    updatePositions();
    return () => cancelAnimationFrame(animationFrameId);
  }, [modules.length]); // Re-bind when modules change

  const renderCable = (startX: number, startY: number, endX: number, endY: number, color: string, id: string) => {
    const deltaY = Math.abs(endX - startX) * 0.25 + 50;
    const path = `M ${startX},${startY} C ${startX},${startY + deltaY} ${endX},${endY + deltaY} ${endX},${endY}`;
    
    return (
      <g key={id}>
        <path d={path} stroke="#000" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={path} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const getCableColor = (sourceModuleId: string) => {
    // Generate a consistent color based on the source module ID
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < sourceModuleId.length; i++) {
      hash = sourceModuleId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-20">
      {cables.map((cable) => {
        const srcId = `port-${cable.sourceModuleId}-${cable.sourcePort}`;
        const tgtId = `port-${cable.targetModuleId}-${cable.targetPort}`;
        const srcPos = portPositions[srcId];
        const tgtPos = portPositions[tgtId];
        
        if (!srcPos || !tgtPos) return null;
        
        return renderCable(srcPos.x, srcPos.y, tgtPos.x, tgtPos.y, getCableColor(cable.sourceModuleId), cable.id);
      })}
      
      {activeCable && renderCable(
        portPositions[`port-${activeCable.sourceModuleId}-${activeCable.sourcePort}`]?.x || activeCable.startX,
        portPositions[`port-${activeCable.sourceModuleId}-${activeCable.sourcePort}`]?.y || activeCable.startY,
        activeCable.endX,
        activeCable.endY,
        getCableColor(activeCable.sourceModuleId),
        'active-cable'
      )}
    </svg>
  );
};
