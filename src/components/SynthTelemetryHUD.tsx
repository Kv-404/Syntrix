import React from 'react';
import { useSynthStore } from '../store/useSynthStore';
import { Download } from 'lucide-react';

export const SynthTelemetryHUD: React.FC = () => {
  const { sampleRate, activeVoices, dspLatency, totalAudioNodes, modules, cables } = useSynthStore();

  const handleExport = () => {
    const data = JSON.stringify({ modules, cables }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patch-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4 items-center text-[10px] text-green-500 font-mono bg-black px-4 py-1.5 rounded border border-gray-800">
      <div className="flex flex-col">
        <span className="text-gray-500">SRATE</span>
        <span>{sampleRate} Hz</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">VOICES</span>
        <span>{activeVoices}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">NODES</span>
        <span>{totalAudioNodes}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">CABLES</span>
        <span>{cables.length}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">DSP LAT</span>
        <span>{dspLatency} ms</span>
      </div>
      <div className="w-px h-6 bg-gray-800 mx-1"></div>
      <button 
        onClick={handleExport}
        className="text-gray-400 hover:text-white transition-colors"
        title="Export Patch JSON"
      >
        <Download size={16} />
      </button>
    </div>
  );
};
