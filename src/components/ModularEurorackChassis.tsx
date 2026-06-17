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
            <div className="chassis-control-group">
              <label className="chassis-param-label">WAVEFORM</label>
              <select
                className="chassis-select"
                value={module.parameters.waveform}
                onChange={(e) => handleParamChange('waveform', e.target.value)}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">DETUNE</label>
              <input
                type="range" min="-1200" max="1200" step="1"
                value={module.parameters.detune}
                onChange={(e) => handleParamChange('detune', parseInt(e.target.value))}
                className="chassis-range"
              />
              <span className="chassis-param-value">{module.parameters.detune} cents</span>
            </div>
            <div className="chassis-ports-row">
              <VectorPortJack type="in" label="FM IN" portId="fmIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'VCF':
        return (
          <>
            <div className="chassis-control-group">
              <label className="chassis-param-label">TYPE</label>
              <select
                className="chassis-select"
                value={module.parameters.filterType}
                onChange={(e) => handleParamChange('filterType', e.target.value)}
              >
                <option value="lowpass">Lowpass</option>
                <option value="highpass">Highpass</option>
                <option value="bandpass">Bandpass</option>
              </select>
            </div>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">CUTOFF</label>
              <input
                type="range" min="20" max="20000" step="1"
                value={module.parameters.cutoff}
                onChange={(e) => handleParamChange('cutoff', parseInt(e.target.value))}
                className="chassis-range"
              />
            </div>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">RESONANCE</label>
              <input
                type="range" min="0" max="20" step="0.1"
                value={module.parameters.resonance}
                onChange={(e) => handleParamChange('resonance', parseFloat(e.target.value))}
                className="chassis-range"
              />
            </div>
            <div className="chassis-ports-row">
              <VectorPortJack type="in" label="IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="in" label="CV IN" portId="cvIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'VCA':
        return (
          <>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">INITIAL GAIN</label>
              <input
                type="range" min="0" max="1" step="0.01"
                value={module.parameters.gain}
                onChange={(e) => handleParamChange('gain', parseFloat(e.target.value))}
                className="chassis-range"
              />
            </div>
            <div className="chassis-ports-row">
              <VectorPortJack type="in" label="IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="in" label="CV IN" portId="cvIn" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'LFO':
        return (
          <>
            <div className="chassis-control-group">
              <label className="chassis-param-label">WAVEFORM</label>
              <select
                className="chassis-select"
                value={module.parameters.waveform}
                onChange={(e) => handleParamChange('waveform', e.target.value)}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">RATE (Hz)</label>
              <input
                type="range" min="0.1" max="50" step="0.1"
                value={module.parameters.rate}
                onChange={(e) => handleParamChange('rate', parseFloat(e.target.value))}
                className="chassis-range"
              />
            </div>
            <div className="chassis-ports-row">
              <VectorPortJack type="out" label="OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'ADSR':
        return (
          <>
            {['attack', 'decay', 'sustain', 'release'].map(param => (
              <div key={param} className="chassis-control-group center">
                <label className="chassis-param-label">{param}</label>
                <input
                  type="range" min="0.01" max={param === 'sustain' ? "1" : "5"} step="0.01"
                  value={module.parameters[param]}
                  onChange={(e) => handleParamChange(param, parseFloat(e.target.value))}
                  className="chassis-range"
                />
              </div>
            ))}
            <div className="chassis-ports-row">
              <VectorPortJack type="out" label="ENV OUT" portId="out" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
      case 'Output':
        return (
          <>
            <div className="chassis-control-group center">
              <label className="chassis-param-label">MASTER VOL</label>
              <input
                type="range" min="0" max="1" step="0.01"
                value={module.parameters.masterGain}
                onChange={(e) => handleParamChange('masterGain', parseFloat(e.target.value))}
                className="chassis-range"
              />
            </div>
            <div className="chassis-vu-meter">
              <div
                className="chassis-vu-level"
                style={{ height: `${module.parameters.masterGain * 100}%` }}
              ></div>
            </div>
            <div className="chassis-ports-row">
              <VectorPortJack type="in" label="L/R IN" portId="in" moduleId={module.id} onDragStart={onPortDragStart} onDrop={onPortDrop} />
            </div>
          </>
        );
    }
  };

  return (
    <div
      className="rack-panel-container"
      style={{
        transform: `translate(${module.x}px, ${module.y}px)`,
        zIndex: 10
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="rack-screws top">
        <div className="screw"></div>
        <div className="screw"></div>
      </div>

      <div className="rack-header">
        <span className="rack-title">{module.type}</span>
        <button
          onClick={() => removeModule(module.id)}
          className="rack-close-btn"
        >
          ×
        </button>
      </div>

      <div className="rack-body">
        {renderControls()}
      </div>

      <div className="rack-screws bottom">
        <div className="screw"></div>
        <div className="screw"></div>
      </div>
    </div>
  );
};
