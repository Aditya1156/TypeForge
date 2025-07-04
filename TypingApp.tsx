import React, { useState, useCallback, useMemo, useEffect } from 'react';
import useEngine from './hooks/useEngine';
import useProgress from './hooks/useProgress';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import { fetchAiAnalysis, fetchAiCustomDrill } from './services/geminiService';
import TypingTest from './components/TypingTest';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';
import AiCoachFeedback from './components/AiCoachFeedback';
import LessonSelector from './components/LessonSelector';
import KeyboardGuide from './components/KeyboardGuide';
import FingerGuideUI from './components/FingerGuideUI';
import LiveStats from './components/LiveStats';
import AppSidebar from './components/AppSidebar';
import Dashboard from './components/dashboard/Dashboard';
import type { AiAnalysis, Lesson, PracticeMode, ModalType } from './types';
import { calculateAccuracy } from './utils/helpers';
import { chapters } from './data/lessons';

const TypingApp = ({ onGoToLanding, onShowModal }: { onGoToLanding: () => void; onShowModal: (modal: ModalType) => void; }) => {
  const [view, setView] = useState<'lessons' | 'test' | 'guide' | 'dashboard'>('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { isSoundEnabled, caretStyle } = useSettings();
  const { state, words, typed, errors, errorDetails, wpm, accuracy, totalTyped, loadTest, restart, fingersToUse, liveWpm, consistency } = useEngine(view === 'test', isSoundEnabled);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);

  const { progress, saveDrillPerformance, resetProgress, isLoaded: isProgressLoaded } = useProgress(user);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [isAiDrillLoading, setIsAiDrillLoading] = useState(false);
  const [aiDrillError, setAiDrillError] = useState<string | null>(null);

  const isFinished = state === 'finish';
  const isTyping = state === 'run';

  useEffect(() => {
    if (isFinished && currentLesson && currentLesson.type !== 'guide' && currentLesson.id !== 'random' && currentLesson.id !== 'ai-drill') {
        saveDrillPerformance(currentLesson, currentDrillIndex, wpm, accuracy);
    }
  }, [isFinished, currentLesson, currentDrillIndex, wpm, accuracy, saveDrillPerformance]);

  const handleGetAiAnalysis = useCallback(async () => {
    if (errorDetails.length === 0) {
      setAiError("There were no errors to analyze. Great job!");
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const analysis = await fetchAiAnalysis(errorDetails);
      if(analysis) {
        setAiAnalysis(analysis);
      } else {
        setAiError("Sorry, the AI coach couldn't provide feedback at this time.");
      }
    } catch (err) {
      setAiError("An error occurred while fetching AI analysis.");
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  }, [errorDetails]);
  
  const resetAiState = () => {
    setAiAnalysis(null);
    setIsAiLoading(false);
    setAiError(null);
    setAiDrillError(null);
  };

  const handleRestart = useCallback(() => {
    restart();
    resetAiState();
  }, [restart]);

  const handleNavigate = (newView: 'lessons' | 'guide' | 'dashboard') => {
    setView(newView);
  };

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    resetAiState();
    setCurrentLesson(lesson);
    if (lesson.type === 'guide') {
      setView('guide');
      return;
    }
    
    setCurrentDrillIndex(0);
    loadTest(lesson.texts[0]);
    setView('test');
  }, [loadTest]);

  const handleSelectDrill = useCallback((lesson: Lesson, drillIndex: number) => {
    resetAiState();
    setCurrentLesson(lesson);
    setCurrentDrillIndex(drillIndex);
    loadTest(lesson.texts[drillIndex]);
    setView('test');
  }, [loadTest]);
  
  const handleStartFirstLesson = useCallback(() => {
    const firstRealLesson = chapters.find(c => c.id !== 'chapter-0')?.lessons[0];
    if (firstRealLesson) {
      handleSelectLesson(firstRealLesson);
    }
  }, [handleSelectLesson]);

  const handleSelectRandom = useCallback(() => {
    loadTest(); 
    setCurrentLesson({ id: 'random', name: "Random Word Challenge", texts: [] });
    setCurrentDrillIndex(0);
    setView('test');
    resetAiState();
  }, [loadTest]);

  const handleBackToMenu = useCallback(() => {
    setView('lessons');
    setCurrentLesson(null);
    resetAiState();
  }, []);

  const hasNextDrill = useMemo(() => {
    if (!currentLesson || currentLesson.id === 'random' || currentLesson.id === 'ai-drill' || currentLesson.type === 'guide') {
      return false;
    }
    return currentDrillIndex < currentLesson.texts.length - 1;
  }, [currentLesson, currentDrillIndex]);
  
  const { nextLesson, hasNextLesson } = useMemo(() => {
    if (hasNextDrill || !currentLesson || currentLesson.type === 'guide' || currentLesson.id === 'random' || currentLesson.id === 'ai-drill') {
      return { nextLesson: null, hasNextLesson: false };
    }

    let currentChapterIndex = -1;
    let currentLessonIndex = -1;

    for(let i=0; i < chapters.length; i++) {
        const lessonIndex = chapters[i].lessons.findIndex(l => l.id === currentLesson.id);
        if (lessonIndex !== -1) {
            currentChapterIndex = i;
            currentLessonIndex = lessonIndex;
            break;
        }
    }

    if(currentChapterIndex === -1) return { nextLesson: null, hasNextLesson: false };

    const currentChapter = chapters[currentChapterIndex];
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
        const next = currentChapter.lessons[currentLessonIndex + 1];
        return { nextLesson: next, hasNextLesson: true };
    } else if (currentChapterIndex < chapters.length - 1) {
        const next = chapters[currentChapterIndex + 1].lessons[0];
        return { nextLesson: next, hasNextLesson: true };
    }

    return { nextLesson: null, hasNextLesson: false };

  }, [currentLesson, hasNextDrill]);

  const handleNextDrill = useCallback(() => {
    if (!currentLesson || !hasNextDrill) return;

    const nextIndex = currentDrillIndex + 1;
    setCurrentDrillIndex(nextIndex);
    loadTest(currentLesson.texts[nextIndex]);
    resetAiState();
  }, [currentLesson, currentDrillIndex, hasNextDrill, loadTest]);

  const handleNextLesson = useCallback(() => {
    if (nextLesson) {
      handleSelectLesson(nextLesson);
    }
  }, [nextLesson, handleSelectLesson]);


  const handleGenerateAiDrill = useCallback(async (keys: string, practiceMode: PracticeMode) => {
    setIsAiDrillLoading(true);
    setAiDrillError(null);
    try {
      const drillText = await fetchAiCustomDrill(keys, practiceMode);
      loadTest(drillText);
      setCurrentLesson({ id: 'ai-drill', name: `AI Drill: ${keys}`, texts: [drillText] });
      setCurrentDrillIndex(0);
      setView('test');
    } catch (error: any) {
      setAiDrillError(error.message || "Failed to generate AI drill.");
    } finally {
      setIsAiDrillLoading(false);
    }
  }, [loadTest]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'lessons':
        return (
          <LessonSelector
            chapters={chapters}
            onSelectLesson={handleSelectLesson}
            onSelectDrill={handleSelectDrill}
            onSelectRandom={handleSelectRandom}
            onGenerateAiDrill={handleGenerateAiDrill}
            isAiDrillLoading={isAiDrillLoading}
            aiDrillError={aiDrillError}
            progress={progress}
            isProgressLoaded={isProgressLoaded}
            onResetProgress={resetProgress}
          />
        );
      case 'guide':
        return <KeyboardGuide onStartFirstLesson={handleStartFirstLesson} onBackToMenu={handleBackToMenu} />;
      case 'dashboard':
        return <Dashboard progress={progress} isProgressLoaded={isProgressLoaded} onSelectDrill={handleSelectDrill} />;
      case 'test':
        return (
          <div className="flex flex-col items-center justify-center flex-grow w-full">
            <header className="relative w-full max-w-5xl text-center mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                {currentLesson?.name}
              </h1>
              {currentLesson && currentLesson.id !== 'random' && currentLesson.id !== 'ai-drill' && currentLesson.type !== 'guide' && (
                <h2 className="text-lg text-text-secondary mt-1">Drill {currentDrillIndex + 1}</h2>
              )}
            </header>
            
            <main className="w-full max-w-5xl flex flex-col items-center gap-8">
              <div className="flex flex-col items-center justify-center min-h-[56px] w-full">
                {!isFinished && isTyping && (
                  <LiveStats liveWpm={liveWpm} accuracy={calculateAccuracy(typed.length, errors)} errors={errors} />
                )}
                {!isFinished && !isTyping && (
                  <div className="text-center">
                    <p className="text-lg text-accent animate-pulse mb-2">Start typing to begin...</p>
                  </div>
                )}
                {!isFinished && <FingerGuideUI fingers={fingersToUse} />}
              </div>
              
              <div className="w-full max-w-3xl">
                {isFinished ? (
                  <Results 
                    wpm={wpm} 
                    accuracy={accuracy}
                    consistency={consistency}
                    errors={errors}
                    onRestart={handleRestart}
                    onGetAiAnalysis={handleGetAiAnalysis}
                    isAiLoading={isAiLoading}
                    errorDetails={errorDetails}
                    onBackToMenu={handleBackToMenu}
                    hasNextDrill={hasNextDrill}
                    onNextDrill={handleNextDrill}
                    hasNextLesson={hasNextLesson}
                    onNextLesson={handleNextLesson}
                  />
                ) : (
                  <TypingTest words={words} typed={typed} totalTyped={totalTyped} caretStyle={caretStyle} />
                )}
              </div>

              {isAiLoading && <LoadingSpinner />}
              {aiError && <p className="text-danger bg-danger/10 p-3 rounded-md">{aiError}</p>}
              {aiAnalysis && <AiCoachFeedback aiAnalysis={aiAnalysis} />}
            </main>

            <footer className="text-center text-text-secondary mt-12 text-sm">
              <p>Press <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Tab</kbd> to restart the test after completion.</p>
            </footer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary font-mono">
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onGoToHome={onGoToLanding}
        onShowModal={onShowModal}
        onNavigate={handleNavigate}
        activeView={view}
      />

       {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-30"
          onClick={handleCloseSidebar}
        />
      )}

      <button 
        onClick={handleOpenSidebar}
        className="fixed top-5 left-5 z-20 p-2 rounded-md text-text-primary bg-secondary/50 hover:bg-tertiary/50 transition-colors"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6"></line><line x1="4" x2="20" y1="12"></line><line x1="4" x2="20" y1="18"></line></svg>
      </button>

      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default TypingApp;
