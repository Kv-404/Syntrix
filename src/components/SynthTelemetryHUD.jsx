import React from "react";
import { useSynthStore } from "../store/useSynthStore";
import { Download } from "lucide-react";

export const SynthTelemetryHUD = () => {
  const {
    sampleRate,
    activeVoices,
    dspLatency,
    totalAudioNodes,
    modules,
    cables,
  } = useSynthStore();

  const handleExport = () => {
    const data = JSON.stringify({ modules, cables }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patch-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="telemetry-hud">
      <div className="telemetry-item">
        <span className="telemetry-label">SRATE</span>
        <span>{sampleRate} Hz</span>
      </div>
      <div className="telemetry-item">
        <span className="telemetry-label">VOICES</span>
        <span>{activeVoices}</span>
      </div>
      <div className="telemetry-item">
        <span className="telemetry-label">NODES</span>
        <span>{totalAudioNodes}</span>
      </div>
      <div className="telemetry-item">
        <span className="telemetry-label">CABLES</span>
        <span>{cables.length}</span>
      </div>
      <div className="telemetry-item">
        <span className="telemetry-label">DSP LAT</span>
        <span>{dspLatency} ms</span>
      </div>
      <div className="telemetry-divider"></div>
      <button
        onClick={handleExport}
        className="telemetry-export-btn"
        title="Export Patch JSON"
      >
        <Download size={16} />
      </button>
    </div>
  );
};
