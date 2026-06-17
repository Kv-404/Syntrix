import React from 'react';
import { ChassisActionStrip } from './ChassisActionStrip';
import { PatchBayStage } from './PatchBayStage';
import { GlobalKeyboardGrid } from './GlobalKeyboardGrid';
import { SynthTelemetryHUD } from './SynthTelemetryHUD';

export const SynthConsole: React.FC = () => {
  return (
    <div className="synth-console-container">
      <header className="synth-console-header">
        <h1 className="synth-console-title">Syntrix</h1>
        <SynthTelemetryHUD />
      </header>
      
      <ChassisActionStrip />
      
      <main className="synth-console-main">
        <PatchBayStage />
      </main>
      
      <GlobalKeyboardGrid />
    </div>
  );
};
