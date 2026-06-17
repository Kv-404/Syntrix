# Syntrix — Modular Web Synthesizer

A fully browser-based modular audio synthesizer built with **React 19**, **Zustand**, and the native **Web Audio API**. No backend, no database — everything runs in-memory inside the browser.

Drag modules onto an infinite canvas, patch them together with virtual cables, and play the built-in keyboard to sculpt sound in real time.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Module Reference](#module-reference)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How Patching Works](#how-patching-works)
- [Technology Stack](#technology-stack)
- [Design Decisions](#design-decisions)

---

## Features

| Category | Details |
|---|---|
| **Modular Routing** | Drag-and-drop VCO, VCF, VCA, LFO, ADSR, and Output modules onto an infinite pannable/zoomable canvas |
| **Patch Cables** | Connect modules via SVG Bézier-curve cables by dragging from output jacks to input jacks |
| **Polyphonic Playback** | Play multiple notes simultaneously with independent per-note voice graphs |
| **Brickwall Limiter** | A transparent `DynamicsCompressorNode` prevents digital clipping during polyphonic playback |
| **ADSR Envelope** | Full Attack → Decay → Sustain → Release envelope shaping per voice |
| **Real-Time Telemetry** | Header HUD displays sample rate, active voice count, total audio nodes, cable count, and DSP latency |
| **Undo / Redo** | Full undo/redo history for module and cable operations |
| **Patch Export** | Export the current module + cable state as a downloadable JSON file |
| **Persistent State** | Workbench layout is automatically saved to `localStorage` via Zustand `persist` middleware |
| **Keyboard Input** | 25-key QWERTY keyboard mapping spanning two octaves (C3–C5) |
| **Panic Mute** | Instantly silence all active voices with one click |

---

## Architecture

```
┌───────────────────────────────────────────────────┐
│                   SynthConsole                    │
│  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ Telemetry   │  │   ChassisActionStrip     │   │
│  │ HUD         │  │   (Spawn / Undo / Panic) │   │
│  └─────────────┘  └──────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │            PatchBayStage                  │   │
│  │  ┌──────────┐  ┌──────────┐              │   │
│  │  │  VCO     │──│  VCF     │──→ ...       │   │
│  │  └──────────┘  └──────────┘              │   │
│  │         SvgCableLayerOverlay              │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │         GlobalKeyboardGrid                │   │
│  └───────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
         │                        ▲
         ▼                        │
   ┌───────────┐           ┌────────────┐
   │ AudioEngine│◀─────────│ useSynthStore│
   │ (Singleton)│           │  (Zustand)  │
   └───────────┘           └────────────┘
```

**Data flow:**
1. User interacts with the UI → Zustand store updates module/cable state.
2. On `noteOn`, the `AudioEngine` reads the current store snapshot and builds a fresh Web Audio graph for that voice.
3. Cables in the store determine how audio nodes are connected.
4. On `noteOff`, the ADSR release phase plays out, then the voice nodes are disconnected and garbage collected.

---

## Module Reference

### VCO — Voltage Controlled Oscillator
Generates a pitched waveform at the frequency of the played note.
- **Waveform**: Sine, Square, Sawtooth, Triangle
- **Detune**: ±1200 cents
- **Ports**: FM IN (input), OUT (output)

### VCF — Voltage Controlled Filter
Sculpts the harmonic content of a signal.
- **Type**: Lowpass, Highpass, Bandpass
- **Cutoff**: 20 Hz – 20,000 Hz
- **Resonance**: 0 – 20
- **Ports**: IN (input), CV IN (cutoff modulation), OUT (output)

### VCA — Voltage Controlled Amplifier
Controls the volume of a signal, typically driven by an ADSR envelope.
- **Initial Gain**: 0 – 1
- **Ports**: IN (input), CV IN (gain modulation), OUT (output)

### LFO — Low Frequency Oscillator
Produces a sub-audio-rate signal for modulating other parameters.
- **Waveform**: Sine, Square, Sawtooth, Triangle
- **Rate**: 0.1 – 50 Hz
- **Ports**: OUT (output)

### ADSR — Envelope Generator
Shapes the amplitude contour of a note over time.
- **Attack**: 0.01 – 5 seconds
- **Decay**: 0.01 – 5 seconds
- **Sustain**: 0.01 – 1 (level)
- **Release**: 0.01 – 5 seconds
- **Ports**: ENV OUT (output)

### Output — Master Output
The final destination that routes audio to the speakers.
- **Master Volume**: 0 – 1
- **VU Meter**: Visual feedback of the current gain level
- **Ports**: L/R IN (input)

---

## Keyboard Shortcuts

The on-screen piano keyboard maps to your QWERTY keyboard across two octaves:

### Lower Octave (C3 – B3)

| Note | Key | | Note | Key |
|------|-----|-|------|-----|
| C3   | Z   | | F#3  | G   |
| C#3  | S   | | G3   | B   |
| D3   | X   | | G#3  | H   |
| D#3  | D   | | A3   | N   |
| E3   | C   | | A#3  | J   |
| F3   | V   | | B3   | M   |

### Upper Octave (C4 – C5)

| Note | Key | | Note | Key |
|------|-----|-|------|-----|
| C4   | Q   | | F#4  | 5   |
| C#4  | 2   | | G4   | T   |
| D4   | W   | | G#4  | 6   |
| D#4  | 3   | | A4   | Y   |
| E4   | E   | | A#4  | 7   |
| F4   | R   | | B4   | U   |
|      |     | | C5   | I   |

> The piano keys display only the keyboard shortcut letter (not the note name) for quick visual reference.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (tested with v24)
- **npm** ≥ 9

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd synth-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in a modern browser (Chrome, Edge, or Firefox recommended for Web Audio API support).

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
synth-app/
├── index.html                  # Entry HTML with SEO metadata
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript project references
├── public/
│   ├── favicon.svg             # Browser tab icon
│   └── icons.svg               # UI icon sprites
└── src/
    ├── main.tsx                # React DOM entry point
    ├── App.tsx                 # Root component (initializes AudioEngine)
    ├── index.css               # Complete vanilla CSS stylesheet
    ├── audio/
    │   └── AudioEngine.ts      # Singleton Web Audio API engine
    ├── store/
    │   └── useSynthStore.ts    # Zustand state store with undo/redo
    └── components/
        ├── SynthConsole.tsx         # Top-level layout shell
        ├── SynthTelemetryHUD.tsx    # Real-time audio metrics display
        ├── ChassisActionStrip.tsx   # Toolbar (spawn, undo, panic, flush)
        ├── PatchBayStage.tsx        # Infinite canvas with pan & zoom
        ├── ModularEurorackChassis.tsx # Individual module UI panel
        ├── VectorPortJack.tsx       # Input/output jack connector
        ├── SvgCableLayerOverlay.tsx  # SVG Bézier patch cable renderer
        └── GlobalKeyboardGrid.tsx   # On-screen piano keyboard
```

---

## How Patching Works

1. **Spawn** modules from the toolbar (e.g., VCO → VCF → VCA → Output).
2. **Drag a cable** from any **output jack** (OUT, ENV OUT) by clicking and dragging.
3. **Drop it** on any **input jack** (IN, CV IN, FM IN, L/R IN) of another module.
4. A colored SVG Bézier cable appears connecting the two ports.
5. When you press a key, the `AudioEngine` reads all modules and cables from the Zustand store and builds a fresh Web Audio graph mirroring those connections.

### Recommended Starter Patch

```
VCO (OUT) → VCF (IN) → VCA (IN) → Output (L/R IN)
ADSR (ENV OUT) → VCA (CV IN)
```

This routes the oscillator through a filter, then through an amplifier controlled by the envelope, and finally to the speakers.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 19 | Component rendering and event handling |
| **State** | Zustand 5 | Centralized in-memory state with persistence and undo/redo |
| **Audio** | Web Audio API | Real-time audio graph construction and DSP |
| **Styling** | Vanilla CSS | 12pt Times New Roman typography, hardware-inspired dark theme |
| **Icons** | Lucide React | Lightweight SVG icon library |
| **Bundler** | Vite 8 | Fast HMR development server and optimized production builds |
| **Language** | TypeScript 6 | Static typing across all source files |

---

## Design Decisions

- **No Tailwind CSS.** All styling uses vanilla CSS to maintain strict control over the 12pt Times New Roman typography requirement across every UI element.
- **Per-note voice allocation.** Each `noteOn` creates a completely independent Web Audio graph. This is more expensive than sharing oscillators, but it correctly models how real modular synthesizers work — each voice is a separate signal path.
- **Brickwall limiter on master output.** A `DynamicsCompressorNode` with a `-0.5 dB` threshold and `20:1` ratio acts as a transparent safety net against digital clipping when multiple voices sum together.
- **No external audio libraries.** The entire audio engine is built directly on the browser's native `AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`, `ConstantSourceNode`, and `DynamicsCompressorNode`.
- **DOM-based port position tracking.** `SvgCableLayerOverlay` uses a `requestAnimationFrame` loop to read port jack DOM positions and convert them to canvas coordinates, rather than manually computing positions from module state. This keeps cable endpoints perfectly synchronized even during drag operations.
