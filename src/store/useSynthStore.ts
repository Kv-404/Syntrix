/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleType = 'VCO' | 'VCF' | 'VCA' | 'LFO' | 'ADSR' | 'Output';

export interface ModuleState {
  id: string;
  type: ModuleType;
  x: number;
  y: number;
  parameters: Record<string, any>;
}

export interface CableState {
  id: string;
  sourceModuleId: string;
  sourcePort: string;
  targetModuleId: string;
  targetPort: string;
}

export interface SynthState {
  modules: ModuleState[];
  cables: CableState[];
  
  // Telemetry
  sampleRate: number;
  activeVoices: number;
  dspLatency: number;
  totalAudioNodes: number;
  
  // Actions
  addModule: (module: ModuleState) => void;
  updateModulePosition: (id: string, x: number, y: number) => void;
  updateModuleParameter: (id: string, param: string, value: any) => void;
  removeModule: (id: string) => void;
  
  addCable: (cable: CableState) => void;
  removeCable: (id: string) => void;
  clearCables: () => void;
  
  setTelemetry: (telemetry: Partial<Pick<SynthState, 'sampleRate' | 'activeVoices' | 'dspLatency' | 'totalAudioNodes'>>) => void;
  
  // Undo/Redo history
  past: Pick<SynthState, 'modules' | 'cables'>[];
  future: Pick<SynthState, 'modules' | 'cables'>[];
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  flushWorkbench: () => void;
}

const initialModules: ModuleState[] = [
  { id: 'out-1', type: 'Output', x: 800, y: 100, parameters: { masterGain: 0.8 } }
];

export const useSynthStore = create<SynthState>()(
  persist(
    (set, get) => ({
      modules: initialModules,
      cables: [],
      sampleRate: 44100,
      activeVoices: 0,
      dspLatency: 0,
      totalAudioNodes: 0,
      
      past: [],
      future: [],
      
      saveHistory: () => {
        const { modules, cables, past } = get();
        set({ past: [...past, { modules: JSON.parse(JSON.stringify(modules)), cables: JSON.parse(JSON.stringify(cables)) }], future: [] });
      },
      
      undo: () => {
        const { past, future, modules, cables } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        set({
          modules: previous.modules,
          cables: previous.cables,
          past: newPast,
          future: [{ modules: JSON.parse(JSON.stringify(modules)), cables: JSON.parse(JSON.stringify(cables)) }, ...future]
        });
      },
      
      redo: () => {
        const { past, future, modules, cables } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        set({
          modules: next.modules,
          cables: next.cables,
          past: [...past, { modules: JSON.parse(JSON.stringify(modules)), cables: JSON.parse(JSON.stringify(cables)) }],
          future: newFuture
        });
      },

      addModule: (module) => {
        get().saveHistory();
        set((state) => ({ modules: [...state.modules, module] }));
      },
      
      updateModulePosition: (id, x, y) => {
        set((state) => ({
          modules: state.modules.map(m => m.id === id ? { ...m, x, y } : m)
        }));
      },
      
      updateModuleParameter: (id, param, value) => {
        set((state) => ({
          modules: state.modules.map(m => 
            m.id === id ? { ...m, parameters: { ...m.parameters, [param]: value } } : m
          )
        }));
      },
      
      removeModule: (id) => {
        get().saveHistory();
        set((state) => ({
          modules: state.modules.filter(m => m.id !== id),
          cables: state.cables.filter(c => c.sourceModuleId !== id && c.targetModuleId !== id)
        }));
      },
      
      addCable: (cable) => {
        get().saveHistory();
        set((state) => ({ cables: [...state.cables, cable] }));
      },
      
      removeCable: (id) => {
        get().saveHistory();
        set((state) => ({ cables: state.cables.filter(c => c.id !== id) }));
      },
      
      clearCables: () => {
        get().saveHistory();
        set({ cables: [] });
      },
      
      setTelemetry: (telemetry) => set((state) => ({ ...state, ...telemetry })),
      
      flushWorkbench: () => {
        get().saveHistory();
        set({ modules: initialModules, cables: [] });
      }
    }),
    {
      name: 'synth-workbench-storage',
      partialize: (state) => ({ modules: state.modules, cables: state.cables })
    }
  )
);
