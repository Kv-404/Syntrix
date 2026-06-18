import React from "react";
import { X, Cable, Play, Plus, Zap } from "lucide-react";

export const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Syntrix Quick Start Guide</h2>

        <div className="tutorial-section">
          <h3>
            <Zap size={16} /> 1. Quick Presets
          </h3>
          <p>
            Don't want to patch cables? Use the <strong>PRESETS</strong> bar at
            the top to instantly load pre-programmed combinations like the Basic
            Lead or Fat Bass.
          </p>
        </div>

        <div className="tutorial-section">
          <h3>
            <Plus size={16} /> 2. Spawn Modules
          </h3>
          <p>
            If you want to build from scratch, use the{" "}
            <strong>SPAWN MODULES</strong> strip to add new components (VCO,
            VCF, VCA, ADSR, LFO) to the rack. Drag them by their empty spaces to
            organize your chassis.
          </p>
        </div>

        <div className="tutorial-section">
          <h3>
            <Cable size={16} /> 3. Patching Cables
          </h3>
          <p>
            Click and drag from an <strong>OUT</strong> port to an{" "}
            <strong>IN</strong> or <strong>CV IN</strong> port.
          </p>
          <ul>
            <li>
              <strong>Audio Path:</strong> VCO (OUT) &rarr; VCA (IN) &rarr;
              Output (L/R IN).
            </li>
            <li>
              <strong>Control Voltage (CV):</strong> ADSR (ENV OUT) &rarr; VCA
              (CV IN) to control volume with an envelope.
            </li>
          </ul>
        </div>

        <div className="tutorial-section">
          <h3>
            <Play size={16} /> 4. Play Notes
          </h3>
          <p>
            Once you have a valid audio path ending in the Output module, use
            your <strong>computer keyboard</strong> to play notes!
          </p>
          <ul>
            <li>
              <strong>Lower octave:</strong> Z, X, C, V, B, N, M (white keys) /
              S, D, G, H, J (black keys)
            </li>
            <li>
              <strong>Upper octave:</strong> Q, W, E, R, T, Y, U, I, O, P (white
              keys) / 2, 3, 5, 6, 7, 9, 0 (black keys)
            </li>
          </ul>
          <p>
            Make sure you have an envelope (ADSR) patched to your VCA so the
            sound doesn't drone forever.
          </p>
        </div>
      </div>
    </div>
  );
};
