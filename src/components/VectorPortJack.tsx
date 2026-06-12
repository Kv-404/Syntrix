import React, { useRef } from 'react';

interface Props {
  type: 'in' | 'out';
  label: string;
  portId: string;
  moduleId: string;
  onDragStart: (port: string, x: number, y: number) => void;
  onDrop: (port: string) => void;
}

export const VectorPortJack: React.FC<Props> = ({ type, label, portId, moduleId, onDragStart, onDrop }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (type === 'out') {
      // Start dragging a cable from an output
      if (ref.current) {
        // We will pass the initial screen coordinates, which PatchBayStage will convert
        onDragStart(portId, e.clientX, e.clientY);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (type === 'in') {
      onDrop(portId);
    }
  };

  const handlePointerEnter = () => {
    // Hover state could be added here
  };

  return (
    <div className="flex flex-col items-center port-jack">
      <span className="text-[9px] text-gray-400 mb-1 tracking-wider">{label}</span>
      <div
        ref={ref}
        id={`port-${moduleId}-${portId}`}
        className="w-6 h-6 rounded-full bg-[#111] border-2 border-[#555] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-crosshair hover:border-gray-300 transition-colors"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        data-module={moduleId}
        data-port={portId}
        title={type === 'in' ? 'Input' : 'Output'}
      >
        <div className="w-2 h-2 rounded-full bg-black"></div>
      </div>
    </div>
  );
};
