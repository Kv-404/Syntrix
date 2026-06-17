/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSynthStore } from '../store/useSynthStore';

export class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext;
  private masterGain: GainNode;
  
  // Track voices by note number
  private activeVoices: Map<number, any> = new Map();
  private totalNodes = 0;

  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Add a transparent limiter to prevent clipping when playing polyphonically
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -0.5; // Only engage near clipping
    compressor.knee.value = 0.0; // Hard knee
    compressor.ratio.value = 20; // Brickwall
    compressor.attack.value = 0.001; // Fast attack
    compressor.release.value = 0.1; // Fast release
    
    this.masterGain = this.audioContext.createGain();
    
    this.masterGain.connect(compressor);
    compressor.connect(this.audioContext.destination);
    
    // Subscribe to master volume changes
    useSynthStore.subscribe((state) => {
      const outputModule = state.modules.find(m => m.type === 'Output');
      if (outputModule) {
        this.masterGain.gain.setTargetAtTime(outputModule.parameters.masterGain || 0.8, this.audioContext.currentTime, 0.05);
      }
    });

    setInterval(() => this.updateTelemetry(), 500);
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }
  
  public resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public panic() {
    this.activeVoices.forEach(voice => this.cleanupVoice(voice));
    this.activeVoices.clear();
    this.totalNodes = 0; // Hard reset after full purge
    
    // Immediately clamp master volume
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    
    // Restore master volume after 100ms
    setTimeout(() => {
      const state = useSynthStore.getState();
      const outputModule = state.modules.find(m => m.type === 'Output');
      this.masterGain.gain.setTargetAtTime(outputModule?.parameters.masterGain || 0.8, this.audioContext.currentTime, 0.05);
    }, 100);

    // Dispatch event to clear visual stuck keys in GlobalKeyboardGrid
    window.dispatchEvent(new Event('synth-panic'));
  }

  private updateTelemetry() {
    useSynthStore.getState().setTelemetry({
      sampleRate: this.audioContext.sampleRate,
      activeVoices: this.activeVoices.size,
      dspLatency: Math.round(this.audioContext.baseLatency * 1000) || 0,
      totalAudioNodes: this.totalNodes
    });
  }

  public noteOn(note: number) {
    this.resume();
    if (this.activeVoices.has(note)) return;

    const state = useSynthStore.getState();
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    
    const voiceContext = this.createVoiceGraph(state.modules, state.cables, frequency);
    this.activeVoices.set(note, voiceContext);
    
    // Trigger Attack for ADSR nodes in this voice
    const now = this.audioContext.currentTime;
    voiceContext.modules.forEach((modNode: any) => {
      if (modNode.type === 'ADSR') {
        const { attack, decay, sustain } = modNode.params;
        const gate = modNode.gateOutput as ConstantSourceNode;
        gate.offset.cancelScheduledValues(now);
        gate.offset.setValueAtTime(0, now);
        
        const a = attack || 0.01;
        const d = decay || 0.1;
        const s = sustain ?? 0.5;
        
        gate.offset.linearRampToValueAtTime(1, now + a);
        gate.offset.linearRampToValueAtTime(s, now + a + d);
      }
    });
  }

  public noteOff(note: number) {
    const voiceContext = this.activeVoices.get(note);
    if (!voiceContext) return;

    // Immediately remove from activeVoices to prevent new noteOn events
    // from overwriting the voiceContext while it's releasing.
    this.activeVoices.delete(note);

    const now = this.audioContext.currentTime;
    let maxRelease = 0.05;

    // Trigger Release
    voiceContext.modules.forEach((modNode: any) => {
      if (modNode.type === 'ADSR') {
        const release = modNode.params.release ?? 0.2;
        if (release > maxRelease) maxRelease = release;
        const gate = modNode.gateOutput as ConstantSourceNode;
        gate.offset.cancelScheduledValues(now);
        gate.offset.setValueAtTime(gate.offset.value, now);
        gate.offset.linearRampToValueAtTime(0, now + release);
      }
    });

    setTimeout(() => {
      this.cleanupVoice(voiceContext);
    }, maxRelease * 1000 + 100);
  }

  private cleanupVoice(voiceContext: any) {
    if (voiceContext.cleanedUp) return;
    voiceContext.cleanedUp = true;
    voiceContext.nodes.forEach((node: any) => {
      try { node.stop(); } catch(e) { /* node may not be stoppable */ }
      try { node.disconnect(); } catch(e) { /* already disconnected */ }
      this.totalNodes--;
    });
    if (this.totalNodes < 0) this.totalNodes = 0; // Safety clamp
  }

  private createVoiceGraph(modules: any[], cables: any[], frequency: number) {
    const nodes: AudioNode[] = [];
    const modMap = new Map();

    // 1. Create nodes for each module
    modules.forEach(m => {
      let audioNode: any;
      let auxNode: any; // e.g. a modulation input gain or constant source
      let params = m.parameters;

      switch(m.type) {
        case 'VCO':
          audioNode = this.audioContext.createOscillator();
          audioNode.type = (params.waveform || 'sine').toLowerCase();
          const detune = params.detune || 0;
          audioNode.frequency.value = frequency;
          audioNode.detune.value = detune;
          audioNode.start();
          
          // Allow FM: frequency modulation node
          auxNode = this.audioContext.createGain();
          auxNode.gain.value = 1000; // Modulation depth
          auxNode.connect(audioNode.frequency);
          
          modMap.set(m.id, { type: 'VCO', out: audioNode, fmIn: auxNode, node: audioNode });
          nodes.push(audioNode, auxNode);
          break;

        case 'VCF':
          audioNode = this.audioContext.createBiquadFilter();
          audioNode.type = (params.filterType || 'lowpass').toLowerCase();
          audioNode.frequency.value = params.cutoff || 1000;
          audioNode.Q.value = params.resonance || 1;
          
          // CV for cutoff
          auxNode = this.audioContext.createGain();
          auxNode.gain.value = 5000;
          auxNode.connect(audioNode.frequency);
          
          modMap.set(m.id, { type: 'VCF', in: audioNode, out: audioNode, cvIn: auxNode, node: audioNode });
          nodes.push(audioNode, auxNode);
          break;

        case 'VCA':
          audioNode = this.audioContext.createGain();
          audioNode.gain.value = params.gain ?? 0; // Starts silent, opens via CV
          
          auxNode = this.audioContext.createGain();
          auxNode.gain.value = params.envelopeAmount ?? 1;
          auxNode.connect(audioNode.gain);

          modMap.set(m.id, { type: 'VCA', in: audioNode, out: audioNode, cvIn: auxNode, node: audioNode });
          nodes.push(audioNode, auxNode);
          break;

        case 'LFO':
          audioNode = this.audioContext.createOscillator();
          audioNode.type = (params.waveform || 'sine').toLowerCase();
          audioNode.frequency.value = params.rate || 5;
          
          auxNode = this.audioContext.createGain();
          auxNode.gain.value = params.depth || 1;
          audioNode.connect(auxNode);
          audioNode.start();
          
          modMap.set(m.id, { type: 'LFO', out: auxNode, node: audioNode });
          nodes.push(audioNode, auxNode);
          break;

        case 'ADSR':
          // ADSR uses a ConstantSourceNode routed into targets
          audioNode = this.audioContext.createConstantSource();
          audioNode.offset.value = 0;
          audioNode.start();
          
          modMap.set(m.id, { type: 'ADSR', out: audioNode, gateOutput: audioNode, params, node: audioNode });
          nodes.push(audioNode);
          break;

        case 'Output':
          // The output connects to the master gain
          audioNode = this.audioContext.createGain();
          audioNode.gain.value = 1;
          audioNode.connect(this.masterGain);
          
          modMap.set(m.id, { type: 'Output', in: audioNode, node: audioNode });
          nodes.push(audioNode);
          break;
      }
    });

    this.totalNodes += nodes.length;

    // 2. Connect cables
    cables.forEach(cable => {
      const src = modMap.get(cable.sourceModuleId);
      const tgt = modMap.get(cable.targetModuleId);

      if (src && tgt) {
        let sourceNode = src.out;
        let targetNode = tgt.in;

        // Custom routing based on ports
        if (tgt.type === 'VCO' && cable.targetPort === 'fmIn') targetNode = tgt.fmIn;
        if (tgt.type === 'VCF' && cable.targetPort === 'cvIn') targetNode = tgt.cvIn;
        if (tgt.type === 'VCA' && cable.targetPort === 'cvIn') targetNode = tgt.cvIn;

        if (sourceNode && targetNode) {
          try {
            sourceNode.connect(targetNode);
          } catch(e) {
            console.warn('Failed to connect patch cable', e);
          }
        }
      }
    });

    return { modules: modMap, nodes, cleanedUp: false };
  }
}
