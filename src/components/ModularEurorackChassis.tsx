/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { useSynthStore } from '../store/useSynthStore';
import type { ModuleState } from '../store/useSynthStore';
import { VectorPortJack } from './VectorPortJack';

interface Props {
  module: ModuleState;
  zoom: number;
  pan: { x: number; y: number };
  onPortDragStart: (port: string, x: number, y: number) => void;
  onPortDrop: (port: string) => void;
}

export const ModularEurorackChassis: React.FC<Props> = ({ module, zoom, onPortDragStart, onPortDrop }) => {
  const { updateModulePosition, updateModuleParameter, removeModule } = useSynthStore();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Check if clicking on an input/knob/button
    if ((e.target as HTMLElement).tagName.match(/INPUT|BUTTON|SELECT|TEXTAREA/)) return;
    if ((e.target as HTMLElement).closest('.port-jack')) return;

    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX / zoom - module.x,
      y: e.clientY / zoom - module.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const newX = e.clientX / zoom - dragOffset.current.x;
    const newY = e.clientY / zoom - dragOffset.current.y;
    // Snap to grid
    const snap = 20;
    updateModulePosition(module.id, Math.round(newX / snap) * snap, Math.round(newY / snap) * snap);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleParamChange = (param: string, value: any) => {
    updateModuleParameter(module.id, param, value);
  };

  const renderControls = () => {
    switch (module.type) {
      case 'VCO':
        return (
          <>
            <div className="flex flex-col mb-4">
              <label className="text-[10px] text-gray-400 mb-1">WAVEFORM</label>
              <select
                className="bg-[#111] border border-[#444] text-gray-300 text-xs p-1 rounded"
                value={module.parameters.waveform}
                onChange={(e) => handleParamChange('waveform', e.target.value)}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="flex flex-col mb-4 items-center">
              <label className="text-[10px] text-gray-400 mb-1">DETUNE</label>
              <input
                type="range" min="-1200" max="1200" step="1"
                value={module.parameters.detune}
                onChange={(e) => handleParamChange('detune', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-[10px]">{module.parameters.detune} cents</span>
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="in" label="FM IN" portId="fmIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'VCF':
        return (
          <>
            <div className="flex flex-col mb-2">
              <label className="text-[10px] text-gray-400 mb-1">TYPE</label>
              <select
                className="bg-[#111] border border-[#444] text-gray-300 text-xs p-1 rounded"
                value={module.parameters.filterType}
                onChange={(e) => handleParamChange('filterType', e.target.value)}
              >
                <option value="lowpass">Lowpass</option>
                <option value="highpass">Highpass</option>
                <option value="bandpass">Bandpass</option>
              </select>
            </div>
            <div className="flex flex-col mb-2 items-center">
              <label className="text-[10px] text-gray-400 mb-1">CUTOFF</label>
              <input
                type="range" min="20" max="20000" step="1"
                value={module.parameters.cutoff}
                onChange={(e) => handleParamChange('cutoff', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col mb-2 items-center">
              <label className="text-[10px] text-gray-400 mb-1">RESONANCE</label>
              <input
                type="range" min="0" max="20" step="0.1"
                value={module.parameters.resonance}
                onChange={(e) => handleParamChange('resonance', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="in" label="IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="in" label="CV IN" portId="cvIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'VCA':
        return (
          <>
            <div className="flex flex-col mb-4 items-center">
              <label className="text-[10px] text-gray-400 mb-1">INITIAL GAIN</label>
              <input
                type="range" min="0" max="1" step="0.01"
                value={module.parameters.gain}
                onChange={(e) => handleParamChange('gain', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="in" label="IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="in" label="CV IN" portId="cvIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'LFO':
        return (
          <>
            <div className="flex flex-col mb-2">
              <label className="text-[10px] text-gray-400 mb-1">WAVEFORM</label>
              <select
                className="bg-[#111] border border-[#444] text-gray-300 text-xs p-1 rounded"
                value={module.parameters.waveform}
                onChange={(e) => handleParamChange('waveform', e.target.value)}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="flex flex-col mb-2 items-center">
              <label className="text-[10px] text-gray-400 mb-1">RATE (Hz)</label>
              <input
                type="range" min="0.1" max="50" step="0.1"
                value={module.parameters.rate}
                onChange={(e) => handleParamChange('rate', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'ADSR':
        return (
          <>
            {['attack', 'decay', 'sustain', 'release'].map(param => (
              <div key={param} className="flex flex-col mb-2 items-center">
                <label className="text-[10px] text-gray-400 mb-1 uppercase">{param}</label>
                <input
                  type="range" min="0.01" max={param === 'sustain' ? "1" : "5"} step="0.01"
                  value={module.parameters[param]}
                  onChange={(e) => handleParamChange(param, parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="out" label="ENV OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'Output':
        return (
          <>
            <div className="flex flex-col mb-4 items-center">
              <label className="text-[10px] text-gray-400 mb-1">MASTER VOL</label>
              <input
                type="range" min="0" max="1" step="0.01"
                value={module.parameters.masterGain}
                onChange={(e) => handleParamChange('masterGain', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="h-8 w-full bg-[#111] border border-[#333] rounded overflow-hidden flex items-end p-0.5">
              <div
                className="w-full bg-green-500 transition-all duration-75"
                style={{ height: `${module.parameters.masterGain * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-[#444]">
              <VectorPortJack type="in" label="L/R IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
    }
  };

  return (
    <div
      className="absolute rack-panel w-40 flex flex-col items-center p-2 shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        transform: `translate(${module.x}px, ${module.y}px)`,
        zIndex: 10
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="w-full flex justify-between px-1 mb-2">
        <div className="screw"></div>
        <div className="screw"></div>
      </div>

      <div className="w-full flex justify-between items-center mb-4 border-b border-[#444] pb-1">
        <span className="font-bold tracking-widest text-sm text-gray-300">{module.type}</span>
        <button
          onClick={() => removeModule(module.id)}
          className="text-gray-600 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="w-full flex-grow flex flex-col">
        {renderControls()}
      </div>

      <div className="w-full flex justify-between px-1 mt-4">
        <div className="screw"></div>
        <div className="screw"></div>
      </div>
    </div>
  );
};
