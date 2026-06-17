import React, { useState } from 'react';
import { ChassisActionStrip } from './ChassisActionStrip';
import { PatchBayStage } from './PatchBayStage';
import { GlobalKeyboardGrid } from './GlobalKeyboardGrid';
import { SynthTelemetryHUD } from './SynthTelemetryHUD';
import { TutorialModal } from './TutorialModal';

export const SynthConsole: React.FC = () => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div className="synth-console-container">
      <header className="synth-console-header">
        <h1 className="synth-console-title">Syntrix</h1>
        <SynthTelemetryHUD />
      </header>
      
      <ChassisActionStrip onOpenTutorial={() => setIsTutorialOpen(true)} />
      
      <main className="synth-console-main">
        <PatchBayStage />
      </main>
      
      <GlobalKeyboardGrid />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </div>
  );
};
