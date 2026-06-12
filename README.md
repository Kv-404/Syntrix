# Syntrix 🎛️
**Modular Desktop Audio Synthesizer**

Syntrix is a complete frontend-only ReactJS web application that emulates a professional Eurorack modular synthesizer environment inside the browser. It allows you to build complex audio signal paths, connect modules with virtual patch cables, and generate real-time polyphonic audio using the Web Audio API.

## Features ✨
* **Modular Interface**: Spawn VCO, VCF, VCA, LFO, ADSR, and Output modules.
* **Interactive Patch Bay**: A completely freeform, zoomable, and pannable stage to drag and drop your modules onto. 
* **Dynamic Patch Cables**: Connect any `OUT` port to an `IN` port to instantly route audio or CV signals. Cables naturally droop based on physics and are color-coded based on their source module.
* **True Polyphony**: Under the hood, Syntrix treats your visual layout as a "voice template". Every time you trigger a note, the engine clones your entire node graph to generate true polyphonic modular synthesis.
* **On-Screen Keyboard**: A fully interactive 2-octave keyboard grid mapped to your physical computer keyboard (Z-M for the lower octave, Q-I for the upper octave).
* **Telemetry & Export**: View real-time DSP Latency, Active Voices, and Node Counts. You can also export your current patch as a JSON template.
* **Persistent Layouts**: Thanks to Zustand and LocalStorage, your synthesizer layout and active cable connections are automatically saved and instantly restored upon reloading the page.

## Tech Stack 🛠️
* **React 19**
* **Vite** (Build Tool)
* **TypeScript**
* **Zustand** (State Management & Persistence)
* **Tailwind CSS v4** (Styling)
* **Web Audio API** (Core DSP Engine)

## Installation & Setup 🚀

Make sure you have Node.js installed. Then, follow these steps to run Syntrix locally:

1. Clone or download the repository.
2. Navigate to the project directory:
   ```bash
   cd synth-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

## Quick Start Guide 🎹
1. **Spawn Modules**: Click the module buttons in the top toolbar to add them to your rack. A good starting point is one **VCO**, one **ADSR**, one **VCA**, and an **Output**.
2. **Patch It Up**: 
   - Drag a cable from `VCO OUT` to `VCA IN`.
   - Drag a cable from `ADSR ENV OUT` to `VCA CV IN`.
   - Drag a cable from `VCA OUT` to `Output L/R IN`.
3. **Play**: Turn the `INITIAL GAIN` on your VCA down to 0 so it only opens when the envelope triggers. Use your computer keyboard (Z, X, C, etc.) to trigger notes polyphonically.
4. **Modulate**: Try spawning an **LFO** and patching its `OUT` into the `VCO FM IN` or `VCF CV IN` to hear dynamic frequency modulation!
