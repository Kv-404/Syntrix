import React, { useRef } from "react";

export const VectorPortJack = ({
  type,
  label,
  portId,
  moduleId,
  onDragStart,
  onDrop,
}) => {
  const ref = useRef(null);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (type === "out") {
      // Start dragging a cable from an output
      if (ref.current) {
        // We will pass the initial screen coordinates, which PatchBayStage will convert
        onDragStart(portId, e.clientX, e.clientY);
      }
    }
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (type === "in") {
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
        title={type === "in" ? "Input" : "Output"}
      >
        <div className="port-jack-hole"></div>
      </div>
    </div>
  );
};
