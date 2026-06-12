import React from 'react';
import { useSynthStore } from '../store/useSynthStore';
import type { ModuleType } from '../store/useSynthStore';
import { AudioEngine } from '../audio/AudioEngine';
import { Trash2, Plus, VolumeX, Undo, Redo } from 'lucide-react';

export const ChassisActionStrip: React.FC = () => {
  const { addModule, clearCables, flushWorkbench, undo, redo, past, future } = useSynthStore();

  const handleSpawn = (type: ModuleType) => {
    // eslint-disable-next-line react-hooks/purity
    const id = `${type}-${Date.now()}`;
    // eslint-disable-next-line react-hooks/purity
    const x = 100 + Math.random() * 200;
    // eslint-disable-next-line react-hooks/purity
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
    <div className="bg-[#242424] border-b border-[#333] p-2 flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <span className="text-gray-400 text-sm mr-2">SPAWN MODULES:</span>
        {(['VCO', 'VCF', 'VCA', 'LFO', 'ADSR', 'Output'] as ModuleType[]).map(type => (
          <button
            key={type}
            onClick={() => handleSpawn(type)}
            className="flex items-center gap-1 bg-[#333] hover:bg-[#444] text-white px-3 py-1 rounded text-sm transition-colors border border-[#444] shadow-sm"
          >
            <Plus size={14} /> {type}
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => undo()}
          disabled={past.length === 0}
          className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => redo()}
          disabled={future.length === 0}
          className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <div className="w-px h-6 bg-[#444] mx-2"></div>
        <button
          onClick={() => AudioEngine.getInstance().panic()}
          className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-100 px-3 py-1 rounded text-sm transition-colors border border-red-700"
        >
          <VolumeX size={14} /> Panic Mute
        </button>
        <button
          onClick={() => clearCables()}
          className="flex items-center gap-1 bg-[#333] hover:bg-[#444] text-white px-3 py-1 rounded text-sm transition-colors border border-[#444]"
        >
          Clear Cables
        </button>
        <button
          onClick={() => flushWorkbench()}
          className="flex items-center gap-1 bg-[#333] hover:bg-red-900 text-white px-3 py-1 rounded text-sm transition-colors border border-[#444]"
        >
          <Trash2 size={14} /> Flush
        </button>
      </div>
    </div>
  );
};
