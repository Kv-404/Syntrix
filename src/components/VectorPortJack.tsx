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

  return (
    <div className="port-jack-container port-jack">
      <span className="port-jack-label">{label}</span>
      <div
        ref={ref}
        id={`port-${moduleId}-${portId}`}
        className="port-jack-socket"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        data-module={moduleId}
        data-port={portId}
        title={type === 'in' ? 'Input' : 'Output'}
      >
        <div className="port-jack-hole"></div>
      </div>
    </div>
  );
};
