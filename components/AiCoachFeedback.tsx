
import React from 'react';
import type { AiAnalysis } from '../types';

interface AiCoachFeedbackProps {
  aiAnalysis: AiAnalysis;
  onBack?: () => void;
}

const AiCoachFeedback = ({ aiAnalysis, onBack }: AiCoachFeedbackProps) => {
  return (
    <div className="w-full max-w-3xl p-6 bg-slate-800 rounded-lg shadow-lg text-slate-300 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          <h3 className="text-xl font-bold text-cyan-400">Aether AI™ Analysis</h3>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-md transition-colors"
            title="Back to results"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Back
          </button>
        )}
      </div>
      <p className="mb-6 text-slate-300 italic">"{aiAnalysis.analysis}"</p>
      
      <h4 className="text-lg font-semibold text-slate-200 mb-3">Custom "Weak Spot" Drill:</h4>
      <div className="p-4 bg-slate-900/70 rounded-md">
        <p className="text-emerald-400 font-medium tracking-wider text-lg">
          {aiAnalysis.drill.join(' ')}
        </p>
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Tip: Try typing these words in a text editor to build muscle memory for your problem keys.
      </p>
    </div>
  );
};

export default AiCoachFeedback;
