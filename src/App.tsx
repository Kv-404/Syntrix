import { useEffect } from 'react';
import { SynthConsole } from './components/SynthConsole';
import { AudioEngine } from './audio/AudioEngine';

function App() {
  useEffect(() => {
    // Initialize audio engine on mount
    AudioEngine.getInstance();
  }, []);

  return (
    <div className="w-full h-screen bg-[#121212] text-[#e5e5e5] overflow-hidden flex flex-col font-sans">
      <SynthConsole />
    </div>
  );
}

export default App;
