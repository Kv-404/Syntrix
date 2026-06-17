import React from 'react';
import { useSynthStore } from '../store/useSynthStore';
import type { ModuleType } from '../store/useSynthStore';
import { AudioEngine } from '../audio/AudioEngine';
import { Trash2, Plus, VolumeX, Undo, Redo } from 'lucide-react';

export const ChassisActionStrip: React.FC = () => {
  const { addModule, clearCables, flushWorkbench, undo, redo, past, future } = useSynthStore();

  const handleSpawn = (type: ModuleType) => {
    const id = `${type}-${Date.now()}`;
    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;
    addModule({
      id,
      type,
      x,
      y,
      parameters: getDefaultParams(type)
    });
  };

  const getDefaultParams = (type: ModuleType) => {
    switch (type) {
      case 'VCO': return { waveform: 'sine', detune: 0 };
      case 'VCF': return { filterType: 'lowpass', cutoff: 1000, resonance: 1 };
      case 'VCA': return { gain: 0, envelopeAmount: 1 };
      case 'LFO': return { waveform: 'sine', rate: 5, depth: 1 };
      case 'ADSR': return { attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2 };
      case 'Output': return { masterGain: 0.8 };
      default: return {};
    }
  };

  return (
    <div className="chassis-action-strip">
      <div className="chassis-group">
        <span className="chassis-label">SPAWN MODULES:</span>
        {(['VCO', 'VCF', 'VCA', 'LFO', 'ADSR', 'Output'] as ModuleType[]).map(type => (
          <button
            key={type}
            onClick={() => handleSpawn(type)}
            className="chassis-spawn-btn"
          >
            <Plus size={14} /> {type}
          </button>
        ))}
      </div>

      <div className="chassis-group">
        <button
          onClick={() => undo()}
          disabled={past.length === 0}
          className="chassis-icon-btn"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => redo()}
          disabled={future.length === 0}
          className="chassis-icon-btn"
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <div className="chassis-divider"></div>
        <button
          onClick={() => AudioEngine.getInstance().panic()}
          className="chassis-panic-btn"
        >
          <VolumeX size={14} /> Panic Mute
        </button>
        <button
          onClick={() => clearCables()}
          className="chassis-btn"
        >
          Clear Cables
        </button>
        <button
          onClick={() => flushWorkbench()}
          className="chassis-flush-btn"
        >
          <Trash2 size={14} /> Flush
        </button>
      </div>
    </div>
  );
};
