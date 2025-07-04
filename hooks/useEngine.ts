import { useCallback, useEffect, useState, useRef } from 'react';
import { State, ErrorDetail } from '../types';
import { generateWords } from '../utils/words';
import { isKeyboardCode, calculateWPM, calculateAccuracy, getFingersForChar, calculateConsistency, playSound } from '../utils/helpers';

const NUMBER_OF_WORDS = 30;

const useEngine = (isEnabled: boolean, isSoundEnabled: boolean) => {
  const [state, setState] = useState<State>("start");
  const [words, setWords] = useState<string>("");
  const [typed, setTyped] = useState<string>("");
  const [errors, setErrors] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentTestText, setCurrentTestText] = useState("");
  const [fingersToUse, setFingersToUse] = useState<string[]>([]);
  
  // New state for professional features
  const [liveWpm, setLiveWpm] = useState(0);
  const [consistency, setConsistency] = useState(0);
  const keystrokeTimestamps = useRef<number[]>([]);

  const totalTyped = typed.length;
  const wpm = startTime && endTime ? calculateWPM( (endTime - startTime) / 1000, totalTyped ) : 0;
  const accuracy = calculateAccuracy(totalTyped, errors);

  const loadTest = useCallback((text?: string) => {
    const newText = text || generateWords(NUMBER_OF_WORDS);
    setCurrentTestText(newText);
    setState("start");
    setWords(newText);
    setTyped("");
    setErrors(0);
    setErrorDetails([]);
    setStartTime(null);
    setEndTime(null);
    setLiveWpm(0);
    setConsistency(0);
    keystrokeTimestamps.current = [];
  }, []);
  
  const restart = useCallback(() => {
    loadTest(currentTestText);
  }, [loadTest, currentTestText]);


  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    
    const { key, code } = event;
    
    if (state === 'finish') {
      if (key === 'Tab') {
        event.preventDefault();
        restart();
      }
      return;
    }
    
    if (!words) {
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      setTyped((prev) => prev.slice(0, -1));
      if (isSoundEnabled) playSound('backspace');
      // Note: We don't remove timestamps on backspace to reflect the actual time taken.
      return;
    }

    if (isKeyboardCode(code)) {
      // More aggressive event prevention for better cross-browser compatibility
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      if (state === 'start') {
        setState('run');
        setStartTime(Date.now());
      }
      
      keystrokeTimestamps.current.push(Date.now());
      
      const currentCharacter = words[typed.length];
      if (key !== currentCharacter) {
        setErrors((prev) => prev + 1);
        setErrorDetails(prev => [...prev, { expected: currentCharacter, actual: key, index: typed.length}]);
        if (isSoundEnabled) playSound('error');
      } else {
        // Play different sounds for different key types
        if (isSoundEnabled) {
          if (key === ' ') {
            playSound('space');
          } else {
            playSound('correct');
          }
        }
      }
      setTyped((prev) => prev + key);
    }
  }, [state, words, typed, restart, isSoundEnabled]);

  // Effect for finishing the test
  useEffect(() => {
    if (state === 'run' && typed.length === words.length && words.length > 0) {
      setState('finish');
      setEndTime(Date.now());
      setConsistency(calculateConsistency(keystrokeTimestamps.current));
      if (isSoundEnabled) playSound('complete');
    }
  }, [state, typed, words, isSoundEnabled]);

  // Effect for main keydown listener
  useEffect(() => {
    if (isEnabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isEnabled, handleKeyDown]);

  // Effect for calculating live WPM
  useEffect(() => {
      let interval: number | undefined;
      if (state === 'run' && startTime) {
          interval = window.setInterval(() => {
              const timeElapsed = (Date.now() - startTime) / 1000;
              setLiveWpm(calculateWPM(timeElapsed, typed.length));
          }, 2000);
      }
      return () => {
          if (interval) {
              window.clearInterval(interval);
          }
      };
  }, [state, startTime, typed.length]);


  // Effect for finger guidance
  useEffect(() => {
    if (state === 'start' || state === 'run') {
        const nextChar = words[typed.length];
        if (nextChar) {
            const { fingers } = getFingersForChar(nextChar);
            setFingersToUse(fingers);
        } else {
            setFingersToUse([]);
        }
    } else {
        setFingersToUse([]);
    }
}, [typed, words, state]);

  return { state, words, typed, errors, errorDetails, wpm, accuracy, totalTyped, loadTest, restart, fingersToUse, liveWpm, consistency };
};

export default useEngine;