import React from 'react';
import { ChassisActionStrip } from './ChassisActionStrip';
import { PatchBayStage } from './PatchBayStage';
import { GlobalKeyboardGrid } from './GlobalKeyboardGrid';
import { SynthTelemetryHUD } from './SynthTelemetryHUD';

export const SynthConsole: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full select-none">
      <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">
        <h1 className="text-xl font-bold tracking-widest uppercase text-gray-300">Syntrix</h1>
        <SynthTelemetryHUD />
      </header>
      
      <ChassisActionStrip />
      
      <main className="flex-grow relative overflow-hidden bg-[#0f0f0f]">
        <PatchBayStage />
      </main>
      
      <GlobalKeyboardGrid />
    </div>
  );
};
