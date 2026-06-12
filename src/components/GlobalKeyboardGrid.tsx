/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { AudioEngine } from '../audio/AudioEngine';

const START_NOTE = 48; // C3
const NUM_KEYS = 25; // 2 octaves

const keyMap: Record<string, number> = {
  // Lower Octave (C3 - B3)
  'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
  // Upper Octave (C4 - C5)
  'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, 'i': 72
};

const noteToKeyMap = Object.entries(keyMap).reduce((acc, [key, note]) => {
  acc[note] = key.toUpperCase();
  return acc;
}, {} as Record<number, string>);

const getNoteName = (noteNum: number) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(noteNum / 12) - 1;
  const note = notes[noteNum % 12];
  return `${note}${octave}`;
};

export const GlobalKeyboardGrid: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const handleNoteOn = (note: number) => {
    if (activeNotes.has(note)) return;
    AudioEngine.getInstance().noteOn(note);
    setActiveNotes(prev => new Set(prev).add(note));
  };

  const handleNoteOff = (note: number) => {
    if (!activeNotes.has(note)) return;
    AudioEngine.getInstance().noteOff(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note !== undefined) {
        handleNoteOn(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note !== undefined) {
        handleNoteOff(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNotes]);

  const keys = Array.from({ length: NUM_KEYS }, (_, i) => {
    const noteNumber = START_NOTE + i;
    const isBlack = [1, 3, 6, 8, 10].includes(noteNumber % 12);
    return { note: noteNumber, isBlack };
  });

  return (
    <div className="h-32 bg-[#1a1a1a] border-t border-[#333] flex justify-center p-2 select-none overflow-hidden shrink-0">
      <div className="flex relative h-full">
        {keys.map((k) => {
          if (k.isBlack) return null;
          const isActive = activeNotes.has(k.note);
          return (
            <div
              key={k.note}
              onPointerDown={() => handleNoteOn(k.note)}
              onPointerUp={() => handleNoteOff(k.note)}
              onPointerLeave={() => handleNoteOff(k.note)}
              className={`w-10 h-full border border-[#ccc] rounded-b transition-colors cursor-pointer flex items-end justify-center pb-2 ${isActive ? 'bg-gray-300' : 'bg-white'} z-0`}
            >
              <span className="text-[9px] text-gray-400 pointer-events-none font-sans font-bold select-none whitespace-nowrap overflow-hidden">
                {noteToKeyMap[k.note] ? `${getNoteName(k.note)} (${noteToKeyMap[k.note]})` : getNoteName(k.note)}
              </span>
            </div>
          );
        })}
        {/* Render black keys overlaid */}
        <div className="absolute top-0 left-0 w-full h-2/3 flex pointer-events-none">
          {keys.map((k, i) => {
            const isActive = activeNotes.has(k.note);
            if (!k.isBlack) {
              return <div key={`spacer-${k.note}`} className="w-10 opacity-0 shrink-0"></div>;
            }
            return (
              <div
                key={k.note}
                onPointerDown={(e) => { e.stopPropagation(); handleNoteOn(k.note); }}
                onPointerUp={(e) => { e.stopPropagation(); handleNoteOff(k.note); }}
                onPointerLeave={(e) => { e.stopPropagation(); handleNoteOff(k.note); }}
                className={`absolute w-6 h-full border border-black rounded-b cursor-pointer pointer-events-auto transition-colors flex items-end justify-center pb-1 ${isActive ? 'bg-gray-700' : 'bg-black'} z-10`}
                style={{
                  left: `calc(${keys.slice(0, i).filter(key => !key.isBlack).length} * 2.5rem - 0.75rem)`
                }}
              >
                <span className="text-[8px] text-gray-400 pointer-events-none font-sans font-bold select-none whitespace-nowrap overflow-hidden transform -rotate-90 origin-bottom pb-1">
                  {noteToKeyMap[k.note] ? `${getNoteName(k.note)} (${noteToKeyMap[k.note]})` : getNoteName(k.note)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
