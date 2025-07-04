import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { playSound } from '../utils/helpers';
import type { Theme, CaretStyle } from '../types';

interface SettingsProps {
  onClose: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const { 
    isSoundEnabled, 
    toggleSound,
    theme,
    setTheme,
    caretStyle,
    setCaretStyle
  } = useSettings();

  const SettingRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center p-4 bg-tertiary rounded-md">
      <label className="font-semibold text-text-primary">{label}</label>
      {children}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-primary/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-secondary p-8 rounded-lg shadow-2xl w-full max-w-md border border-border-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-accent">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-tertiary">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="space-y-6">
          <SettingRow label="Theme">
            <div className="flex gap-2">
              {(['dark', 'light', 'hacker'] as Theme[]).map(t => (
                <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1 text-sm font-semibold rounded-md capitalize transition-colors ${theme === t ? 'bg-accent text-slate-900' : 'bg-tertiary text-text-primary hover:bg-tertiary/50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Caret Style">
             <div className="flex gap-2">
                {(['line', 'block', 'underline'] as CaretStyle[]).map(s => (
                  <button key={s} onClick={() => setCaretStyle(s)} className={`px-3 py-1 text-sm font-semibold rounded-md capitalize transition-colors ${caretStyle === s ? 'bg-accent text-slate-900' : 'bg-tertiary text-text-primary hover:bg-tertiary/50'}`}>
                    {s}
                  </button>
                ))}
            </div>
          </SettingRow>

          <SettingRow label="Sound Effects">
            <div className="relative inline-block w-12 h-6">
                <input 
                    type="checkbox" 
                    id="sound-toggle"
                    checked={isSoundEnabled}
                    onChange={toggleSound}
                    className="absolute w-0 h-0 opacity-0"
                />
                <label 
                    htmlFor="sound-toggle" 
                    className={`block w-full h-full rounded-full cursor-pointer transition-colors ${isSoundEnabled ? 'bg-accent' : 'bg-tertiary'}`}
                >
                    <span 
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${isSoundEnabled ? 'translate-x-6' : ''}`}
                    ></span>
                </label>
            </div>
          </SettingRow>
          
          {isSoundEnabled && (
            <div className="p-4 bg-tertiary/50 rounded-md">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Test Sounds</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => playSound('correct')} className="px-3 py-2 bg-success/20 hover:bg-success/30 text-success text-sm rounded transition-colors">Correct Keystroke</button>
                <button onClick={() => playSound('error')} className="px-3 py-2 bg-danger/20 hover:bg-danger/30 text-danger text-sm rounded transition-colors">Error</button>
                <button onClick={() => playSound('complete')} className="px-3 py-2 bg-warning/20 hover:bg-warning/30 text-warning text-sm rounded transition-colors">Test Complete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;