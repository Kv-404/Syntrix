import { useEffect } from "react";
import { SynthConsole } from "./components/SynthConsole";
import { AudioEngine } from "./audio/AudioEngine";

function App() {
  useEffect(() => {
    // Initialize audio engine on mount
    AudioEngine.getInstance();
  }, []);

  return (
    <div className="app-container">
      <SynthConsole />
    </div>
  );
}

export default App;
