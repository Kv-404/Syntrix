import React from 'react';
import { useSynthStore } from '../store/useSynthStore';
import type { ModuleType, ModuleState, CableState } from '../store/useSynthStore';
import { AudioEngine } from '../audio/AudioEngine';
import { Trash2, Plus, VolumeX, Undo, Redo, HelpCircle, Zap } from 'lucide-react';

interface Props {
  onOpenTutorial?: () => void;
}

export const ChassisActionStrip: React.FC<Props> = ({ onOpenTutorial }) => {
  const { addModule, clearCables, flushWorkbench, undo, redo, past, future, loadPreset } = useSynthStore();

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

  const handleLoadBasicLead = () => {
    const modules: ModuleState[] = [
      { id: 'vco-1', type: 'VCO', x: 100, y: 100, parameters: { waveform: 'sawtooth', detune: 0 } },
      { id: 'vca-1', type: 'VCA', x: 400, y: 100, parameters: { gain: 0, envelopeAmount: 1 } },
      { id: 'adsr-1', type: 'ADSR', x: 250, y: 350, parameters: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.3 } },
      { id: 'out-1', type: 'Output', x: 700, y: 100, parameters: { masterGain: 0.8 } }
    ];
    const cables: CableState[] = [
      { id: 'c-vco-vca', sourceModuleId: 'vco-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'in' },
      { id: 'c-adsr-vca', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'cvIn' },
      { id: 'c-vca-out', sourceModuleId: 'vca-1', sourcePort: 'out', targetModuleId: 'out-1', targetPort: 'in' }
    ];
    loadPreset(modules, cables);
  };

  const handleLoadFatBass = () => {
    const modules: ModuleState[] = [
      { id: 'vco-1', type: 'VCO', x: 100, y: 100, parameters: { waveform: 'square', detune: -12 } },
      { id: 'vco-2', type: 'VCO', x: 100, y: 350, parameters: { waveform: 'sawtooth', detune: 12 } },
      { id: 'vcf-1', type: 'VCF', x: 400, y: 100, parameters: { filterType: 'lowpass', cutoff: 800, resonance: 4 } },
      { id: 'vca-1', type: 'VCA', x: 700, y: 100, parameters: { gain: 0, envelopeAmount: 1 } },
      { id: 'adsr-1', type: 'ADSR', x: 550, y: 350, parameters: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.1 } },
      { id: 'out-1', type: 'Output', x: 1000, y: 100, parameters: { masterGain: 0.8 } }
    ];
    const cables: CableState[] = [
      { id: 'c-vco1-vcf', sourceModuleId: 'vco-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-vco2-vcf', sourceModuleId: 'vco-2', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-vcf-vca', sourceModuleId: 'vcf-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'in' },
      { id: 'c-adsr-vca', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'cvIn' },
      { id: 'c-adsr-vcf', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'cvIn' },
      { id: 'c-vca-out', sourceModuleId: 'vca-1', sourcePort: 'out', targetModuleId: 'out-1', targetPort: 'in' }
    ];
    loadPreset(modules, cables);
  };

  const handleLoadDreamyPad = () => {
    const modules: ModuleState[] = [
      { id: 'vco-1', type: 'VCO', x: 100, y: 100, parameters: { waveform: 'triangle', detune: 0 } },
      { id: 'vcf-1', type: 'VCF', x: 400, y: 100, parameters: { filterType: 'lowpass', cutoff: 600, resonance: 2 } },
      { id: 'lfo-1', type: 'LFO', x: 100, y: 350, parameters: { waveform: 'sine', rate: 0.5, depth: 300 } },
      { id: 'vca-1', type: 'VCA', x: 700, y: 100, parameters: { gain: 0, envelopeAmount: 1 } },
      { id: 'adsr-1', type: 'ADSR', x: 550, y: 350, parameters: { attack: 0.5, decay: 1.0, sustain: 0.8, release: 2.0 } },
      { id: 'out-1', type: 'Output', x: 1000, y: 100, parameters: { masterGain: 0.8 } }
    ];
    const cables: CableState[] = [
      { id: 'c-vco-vcf', sourceModuleId: 'vco-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-lfo-vcf', sourceModuleId: 'lfo-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'cvIn' },
      { id: 'c-vcf-vca', sourceModuleId: 'vcf-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'in' },
      { id: 'c-adsr-vca', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'cvIn' },
      { id: 'c-vca-out', sourceModuleId: 'vca-1', sourcePort: 'out', targetModuleId: 'out-1', targetPort: 'in' }
    ];
    loadPreset(modules, cables);
  };

  const handleLoadPluck = () => {
    const modules: ModuleState[] = [
      { id: 'vco-1', type: 'VCO', x: 100, y: 100, parameters: { waveform: 'sawtooth', detune: 0 } },
      { id: 'vcf-1', type: 'VCF', x: 400, y: 100, parameters: { filterType: 'lowpass', cutoff: 200, resonance: 5 } },
      { id: 'vca-1', type: 'VCA', x: 700, y: 100, parameters: { gain: 0, envelopeAmount: 1 } },
      { id: 'adsr-1', type: 'ADSR', x: 250, y: 350, parameters: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.3 } },
      { id: 'out-1', type: 'Output', x: 1000, y: 100, parameters: { masterGain: 0.8 } }
    ];
    const cables: CableState[] = [
      { id: 'c-vco-vcf', sourceModuleId: 'vco-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-vcf-vca', sourceModuleId: 'vcf-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'in' },
      { id: 'c-adsr-vca', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'cvIn' },
      { id: 'c-adsr-vcf', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'cvIn' },
      { id: 'c-vca-out', sourceModuleId: 'vca-1', sourcePort: 'out', targetModuleId: 'out-1', targetPort: 'in' }
    ];
    loadPreset(modules, cables);
  };

  const handleLoadSpaceDrone = () => {
    const modules: ModuleState[] = [
      { id: 'vco-1', type: 'VCO', x: 100, y: 100, parameters: { waveform: 'square', detune: -5 } },
      { id: 'vco-2', type: 'VCO', x: 100, y: 350, parameters: { waveform: 'sawtooth', detune: 5 } },
      { id: 'lfo-1', type: 'LFO', x: 400, y: 350, parameters: { waveform: 'sine', rate: 0.2, depth: 400 } },
      { id: 'vcf-1', type: 'VCF', x: 400, y: 100, parameters: { filterType: 'lowpass', cutoff: 800, resonance: 8 } },
      { id: 'vca-1', type: 'VCA', x: 700, y: 100, parameters: { gain: 0, envelopeAmount: 1 } },
      { id: 'adsr-1', type: 'ADSR', x: 700, y: 350, parameters: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 4.0 } },
      { id: 'out-1', type: 'Output', x: 1000, y: 100, parameters: { masterGain: 0.8 } }
    ];
    const cables: CableState[] = [
      { id: 'c-vco1-vcf', sourceModuleId: 'vco-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-vco2-vcf', sourceModuleId: 'vco-2', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'in' },
      { id: 'c-lfo-vcf', sourceModuleId: 'lfo-1', sourcePort: 'out', targetModuleId: 'vcf-1', targetPort: 'cvIn' },
      { id: 'c-vcf-vca', sourceModuleId: 'vcf-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'in' },
      { id: 'c-adsr-vca', sourceModuleId: 'adsr-1', sourcePort: 'out', targetModuleId: 'vca-1', targetPort: 'cvIn' },
      { id: 'c-vca-out', sourceModuleId: 'vca-1', sourcePort: 'out', targetModuleId: 'out-1', targetPort: 'in' }
    ];
    loadPreset(modules, cables);
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'basic-lead') handleLoadBasicLead();
    if (val === 'fat-bass') handleLoadFatBass();
    if (val === 'dreamy-pad') handleLoadDreamyPad();
    if (val === 'pluck') handleLoadPluck();
    if (val === 'space-drone') handleLoadSpaceDrone();
    e.target.value = '';
  };

  return (
    <div className="chassis-action-strip">
      <div className="chassis-group">
        <span className="chassis-label"><Zap size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> PRESETS:</span>
        <select className="chassis-select" onChange={handlePresetSelect} defaultValue="">
          <option value="" disabled>Select a Preset...</option>
          <option value="basic-lead">Basic Lead</option>
          <option value="fat-bass">Fat Bass</option>
          <option value="dreamy-pad">Dreamy Pad</option>
          <option value="pluck">Pluck</option>
          <option value="space-drone">Space Drone</option>
        </select>
        
        <div className="chassis-divider" style={{ margin: '0 8px' }}></div>
        
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
        <div className="chassis-divider" style={{ margin: '0 8px' }}></div>
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="chassis-btn chassis-tutorial-btn"
          >
            <HelpCircle size={14} /> Tutorial
          </button>
        )}
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
