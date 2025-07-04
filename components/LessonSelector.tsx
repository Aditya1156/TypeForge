import React, { useState } from 'react';
import type { Chapter, Lesson, PracticeMode, Progress } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ProgressTick from './ProgressTick';
import { getDrillId } from '../utils/helpers';


interface LessonSelectorProps {
  chapters: Chapter[];
  onSelectLesson: (lesson: Lesson) => void;
  onSelectDrill: (lesson: Lesson, drillIndex: number) => void;
  onSelectRandom: () => void;
  onGenerateAiDrill: (keys: string, mode: PracticeMode) => void;
  isAiDrillLoading: boolean;
  aiDrillError: string | null;
  progress: Progress;
  isProgressLoaded: boolean;
  onResetProgress: () => void;
}

const LessonSelector = ({ chapters, onSelectLesson, onSelectDrill, onSelectRandom, onGenerateAiDrill, isAiDrillLoading, aiDrillError, progress, isProgressLoaded, onResetProgress }: LessonSelectorProps) => {
  const [difficultKeys, setDifficultKeys] = useState('');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('words');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const toggleLesson = (lessonId: string) => {
    setExpandedLessonId(prev => (prev === lessonId ? null : lessonId));
  };

  const handleGenerateClick = () => {
    if (difficultKeys.trim()) {
      onGenerateAiDrill(difficultKeys.trim(), practiceMode);
    }
  };

  const handleGenerateRandomClick = () => {
    const difficultKeysPool = ['q', 'z', 'x', 'p', ';', '[', ']', '\\', '/', 'v', 'b', 'g', 'h', ',', '.'];
    const shuffled = difficultKeysPool.sort(() => 0.5 - Math.random());
    const selectedKeys = shuffled.slice(0, 4).join(' ');
    setDifficultKeys(selectedKeys);
    onGenerateAiDrill(selectedKeys, practiceMode);
  };


  return (
    <div className="min-h-screen flex flex-col items-center text-text-primary p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary">
          Type<span className="text-accent">Forge</span>
        </h1>
        <p className="text-text-secondary mt-2">Craft your keystrokes. Forge your speed.</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-10">
        {/* AI Practice Zone */}
        <section className="w-full p-6 bg-secondary rounded-lg shadow-lg border border-accent/30">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            <h2 className="text-2xl font-bold text-accent">Aether AI™ Practice Zone</h2>
          </div>
          <p className="text-text-secondary mb-5">Target your weak spots. Enter keys you struggle with, or let our AI find them for you.</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <label htmlFor="difficult-keys" className="block text-sm font-medium text-text-secondary mb-1">Difficult Keys</label>
              <input
                id="difficult-keys"
                type="text"
                value={difficultKeys}
                onChange={(e) => setDifficultKeys(e.target.value)}
                placeholder="e.g., q z p ;"
                className="w-full px-4 py-2 bg-tertiary border border-border-primary rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mb-5">
              <span className="block text-sm font-medium text-text-secondary mb-2">Practice Mode</span>
              <div className="flex flex-wrap gap-2">
                {(['keys', 'words', 'paragraph', 'code'] as PracticeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPracticeMode(mode)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${practiceMode === mode ? 'bg-accent text-primary' : 'bg-tertiary text-text-primary hover:bg-border-primary'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-5">
            <button
              onClick={handleGenerateClick}
              disabled={!difficultKeys.trim() || isAiDrillLoading}
              className="flex-grow flex justify-center items-center gap-2 px-8 py-3 font-semibold text-primary bg-accent rounded-md hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent transition-all duration-300 transform hover:scale-105 disabled:bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAiDrillLoading && difficultKeys.trim() ? <LoadingSpinner /> : 'Generate AI Drill'}
            </button>
             <button
              onClick={handleGenerateRandomClick}
              disabled={isAiDrillLoading}
              title="Let AI pick difficult keys for you"
              className="flex justify-center items-center gap-2 px-5 py-3 font-semibold text-primary bg-success rounded-md hover:bg-success/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-success transition-colors disabled:bg-tertiary disabled:text-text-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.489 12.15a1 1 0 1 0-1.023 1.7c.13.08.24.19.34.3a2.5 2.5 0 0 1 0 3.536 1 1 0 0 0 1.414 1.414 4.5 4.5 0 0 0 0-6.364c-.1-.11-.21-.22-.33-.3z"/><path d="M18 10.025a1 1 0 1 0-1.023-1.7c-.13-.08-.24-.19-.34-.3a2.5 2.5 0 0 0-3.536 0 1 1 0 1 0 1.414 1.414 1.5 1.5 0 0 1 2.121 0c.1.11.21.22.33.3zM22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zM8.5 7.17a1 1 0 1 0-1.023 1.7c.13.08.24.19.34.3a1.5 1.5 0 0 1 0 2.121 1 1 0 1 0 1.414 1.414 3.5 3.5 0 0 0 0-4.95c-.1-.11-.21-.22-.33-.3z"/><path d="M12.489 8.5a1 1 0 1 0-1.023-1.7c-.13-.08-.24-.19-.34-.3a3.5 3.5 0 0 0-4.95 0 1 1 0 1 0 1.414 1.414 1.5 1.5 0 0 1 2.121 0c.1.11.21.22.33.3z"/></svg>
              Surprise Me
            </button>
          </div>

          {aiDrillError && <p className="text-danger text-sm mt-3 text-center">{aiDrillError}</p>}
        </section>

        <div className="w-full border-t border-border-primary"></div>

        <div className="w-full p-6 bg-secondary rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-accent mb-4">Random Word Challenge</h2>
            <p className="text-text-secondary mb-4">Test your speed and accuracy with a random set of words.</p>
            <button
                onClick={onSelectRandom}
                className="px-8 py-3 font-semibold text-primary bg-accent rounded-md hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent transition-all duration-300 transform hover:scale-105"
            >
                Start Random Test
            </button>
        </div>
        
        <div className="w-full border-t border-border-primary"></div>

        {chapters.map((chapter) => {
          const totalDrills = chapter.lessons.reduce((acc, lesson) => acc + (lesson.type === 'test' ? lesson.texts.length : 0), 0);
          const completedDrills = chapter.lessons.reduce((acc, lesson) => {
            if (lesson.type === 'test') {
              return acc + lesson.texts.filter((_, index) => progress[getDrillId(lesson, index)]).length;
            }
            return acc;
          }, 0);

          return (
            <section key={chapter.id} className="w-full p-6 bg-secondary rounded-lg shadow-lg">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl font-bold text-accent">{chapter.name}</h2>
                {isProgressLoaded && totalDrills > 0 && (
                  <span className="text-sm font-semibold text-text-secondary">
                    {completedDrills} / {totalDrills} Complete
                  </span>
                )}
              </div>
              <p className="text-text-secondary mb-6">{chapter.description}</p>
              <div className="flex flex-col gap-4">
                {chapter.lessons.map((lesson) => {
                  if (lesson.type === 'guide') {
                    return (
                       <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className="w-full p-4 text-left font-semibold text-text-primary bg-tertiary rounded-md hover:bg-border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent transition-colors flex justify-between items-center"
                        >
                         <span>{lesson.name}</span>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    )
                  }
                  return (
                    <div key={lesson.id} className="bg-tertiary/50 rounded-lg overflow-hidden transition-all duration-300">
                      <button 
                        onClick={() => toggleLesson(lesson.id)}
                        className="w-full p-4 text-left font-semibold text-text-primary bg-tertiary hover:bg-border-primary transition-colors flex justify-between items-center"
                        aria-expanded={expandedLessonId === lesson.id}
                      >
                        <span>{lesson.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform duration-200 ${expandedLessonId === lesson.id ? 'rotate-90' : 'rotate-0'}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                      {expandedLessonId === lesson.id && (
                        <div className="p-4 border-t border-border-primary/50 bg-primary/20">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {lesson.texts.map((drill, index) => {
                              const drillId = getDrillId(lesson, index);
                              const performance = progress[drillId];
                              return (
                                <button
                                  key={index}
                                  onClick={() => onSelectDrill(lesson, index)}
                                  className="flex items-center justify-between gap-2 p-3 text-sm text-left font-medium text-text-secondary bg-tertiary rounded-md hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent transition-all"
                                >
                                  <span className="flex-grow">Drill {index + 1}</span>
                                  {isProgressLoaded && <ProgressTick tier={performance?.tier} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="text-center text-text-secondary mt-12 text-sm">
        <p className="mb-4">Select a lesson or generate a custom drill to begin your training.</p>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all your progress? This action cannot be undone.")) {
              onResetProgress();
            }
          }}
          className="text-danger hover:text-danger/80 underline"
        >
          Reset Progress
        </button>
      </footer>
    </div>
  );
};

export default LessonSelector;
