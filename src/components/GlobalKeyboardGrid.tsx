import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AudioEngine } from '../audio/AudioEngine';

const START_NOTE = 48; // C3
const NUM_KEYS = 30; // 2.5 octaves

/** Maps physical keyboard keys to MIDI note numbers (Ableton Standard) */
const keyMap: Record<string, number> = {
  // Lower Row (C3 - E4)
  'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
  ',': 60, 'l': 61, '.': 62, ';': 63, '/': 64,

  // Upper Row (C4 - F5)
  'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
  'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76, '[': 77, '=': 78, ']': 79
};

/** Reverse map: MIDI note number → keyboard key label */
const noteToKeyMap: Record<number, string> = {};
for (const [key, note] of Object.entries(keyMap)) {
  // Prefer the upper row mappings for display if duplicates exist (like C4 = ',' and 'q')
  if (!noteToKeyMap[note] || "qwertyuiop2356790[]".includes(key)) {
    noteToKeyMap[note] = key.toUpperCase();
  }
}

/** Pre-compute the visual key layout once */
const keys = Array.from({ length: NUM_KEYS }, (_, i) => {
  const noteNumber = START_NOTE + i;
  const isBlack = [1, 3, 6, 8, 10].includes(noteNumber % 12);
  return { note: noteNumber, isBlack };
});

export const GlobalKeyboardGrid: React.FC = () => {
  const activeNotesRef = useRef<Set<number>>(new Set());
  const [, forceRender] = useState(0);

  const handleNoteOn = useCallback((note: number) => {
    if (activeNotesRef.current.has(note)) return;
    AudioEngine.getInstance().noteOn(note);
    activeNotesRef.current.add(note);
    forceRender(n => n + 1);
  }, []);

  const handleNoteOff = useCallback((note: number) => {
    if (!activeNotesRef.current.has(note)) return;
    AudioEngine.getInstance().noteOff(note);
    activeNotesRef.current.delete(note);
    forceRender(n => n + 1);
  }, []);

  useEffect(() => {
    const handlePanic = () => {
      activeNotesRef.current.clear();
      forceRender(n => n + 1);
    };
    window.addEventListener('synth-panic', handlePanic);
    return () => window.removeEventListener('synth-panic', handlePanic);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // Don't trigger notes when focused on form controls
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const note = keyMap[key];
      if (note !== undefined) {
        e.preventDefault();
        handleNoteOn(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const note = keyMap[key];
      if (note !== undefined) handleNoteOff(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  return (
    <div className="keyboard-container">
      <div className="keyboard-grid">
        {keys.map((k) => {
          if (k.isBlack) return null;
          const isActive = activeNotesRef.current.has(k.note);
          return (
            <div
              key={k.note}
              onPointerDown={() => handleNoteOn(k.note)}
              onPointerUp={() => handleNoteOff(k.note)}
              onPointerLeave={() => handleNoteOff(k.note)}
              className={`keyboard-key-white ${isActive ? 'active' : ''}`}
            >
              <span className="keyboard-key-label">
                {noteToKeyMap[k.note] || ''}
              </span>
            </div>
          );
        })}

        {/* Black keys overlaid with absolute positioning */}
        <div className="keyboard-black-keys-layer">
          {keys.map((k, i) => {
            if (!k.isBlack) {
              return <div key={`spacer-${k.note}`} className="keyboard-key-spacer"></div>;
            }
            const isActive = activeNotesRef.current.has(k.note);
            const whiteKeysBefore = keys.slice(0, i).filter(key => !key.isBlack).length;
            // The width of a white key is 48px (3rem), offset is 1.5rem + 2px border
            return (
              <div
                key={k.note}
                onPointerDown={(e) => { e.stopPropagation(); handleNoteOn(k.note); }}
                onPointerUp={(e) => { e.stopPropagation(); handleNoteOff(k.note); }}
                onPointerLeave={(e) => { e.stopPropagation(); handleNoteOff(k.note); }}
                className={`keyboard-key-black ${isActive ? 'active' : ''}`}
                style={{ left: `calc(${whiteKeysBefore} * 48px - 14px)` }}
              >
                <span className="keyboard-black-key-label">
                  {noteToKeyMap[k.note] || ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
