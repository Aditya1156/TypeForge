import { useState, useCallback, useEffect, useMemo } from 'react';
import { db } from '../firebaseConfig';
import type { Progress, DrillPerformance, Lesson, User } from '../types';
import { getDrillId, getPerformanceTier } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { memoize } from '../utils/performance';

// Check if Firebase is available
const isFirebaseAvailable = memoize(() => {
  try {
    return db && typeof db.collection === 'function';
  } catch (error) {
    console.warn('Firebase not available:', error);
    return false;
  }
});

const useProgress = (user: User | null) => {
  const [progress, setProgress] = useState<Progress>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const firebaseAvailable = useMemo(() => isFirebaseAvailable(), []);
  const { addToast } = useToast();

  // Load progress from Firestore when user changes - memoized to prevent unnecessary calls
  useEffect(() => {
    if (!user || user.uid === 'guest' || !firebaseAvailable) {
      // For guests or when Firebase is unavailable, use local state only
      setProgress({});
      setIsLoaded(true);
      return;
    }

    const loadProgress = async () => {
      setIsLoaded(false);
      try {
        const progressDocRef = db.collection('progress').doc(user.uid);
        const docSnap = await progressDocRef.get();
        if (docSnap.exists) {
          const newProgress = docSnap.data() as Progress;
          // Only update if the progress actually changed
          setProgress(prevProgress => {
            const progressChanged = JSON.stringify(prevProgress) !== JSON.stringify(newProgress);
            return progressChanged ? newProgress : prevProgress;
          });
        } else {
          setProgress(prevProgress => {
            return Object.keys(prevProgress).length > 0 ? {} : prevProgress;
          });
        }
      } catch (error) {
        console.error("Failed to load progress from Firestore", error);
        setProgress(prevProgress => {
          return Object.keys(prevProgress).length > 0 ? {} : prevProgress;
        });
      } finally {
        setIsLoaded(true);
      }
    };

    loadProgress();
  }, [user?.uid, firebaseAvailable]); // Only depend on user.uid, not the entire user object

  const saveDrillPerformance = useCallback((lesson: Lesson, drillIndex: number, wpm: number, accuracy: number) => {
    const drillId = getDrillId(lesson, drillIndex);
    const tier = getPerformanceTier(wpm, accuracy);
    const timestamp = Date.now();
    
    const newPerformance: DrillPerformance = { wpm, accuracy, tier, timestamp };
    
    setProgress(currentProgress => {
      const existingPerformance = currentProgress[drillId];

      const isNewScoreBetter = !existingPerformance ||
        (tier === 'mastered' && existingPerformance.tier !== 'mastered') ||
        (tier === 'proficient' && existingPerformance.tier === 'needs-practice') ||
        (tier === existingPerformance.tier && wpm > existingPerformance.wpm);

      if (isNewScoreBetter) {
        const updatedProgress = { ...currentProgress, [drillId]: newPerformance };
        
        // Only try to save to cloud if Firebase is available and user is authenticated
        if (firebaseAvailable && user && user.uid !== 'guest') {
          const progressDocRef = db.collection('progress').doc(user.uid);
          progressDocRef.set({ [drillId]: newPerformance }, { merge: true })
            .then(() => {
                addToast('New personal best saved!', 'success');
            })
            .catch(error => {
              console.error("Failed to save progress to Firestore", error);
              addToast('Personal best saved locally!', 'success');
            });
        } else {
          addToast('Personal best saved!', 'success');
        }
        
        return updatedProgress;
      }
      
      return currentProgress; // No change, return same reference
    });
  }, [user?.uid, addToast, firebaseAvailable]); // Only depend on user.uid

  const resetProgress = useCallback(async () => {
    setProgress(currentProgress => {
      // Only update if there's actually progress to reset
      if (Object.keys(currentProgress).length === 0) {
        return currentProgress;
      }
      return {};
    });
    
    addToast('Your progress has been reset.', 'info');
    
    // Only try to delete from cloud if Firebase is available and user is authenticated
    if (firebaseAvailable && user && user.uid !== 'guest') {
      try {
        const progressDocRef = db.collection('progress').doc(user.uid);
        await progressDocRef.delete();
      } catch (error) {
        console.error("Failed to reset progress in Firestore", error);
        // Progress is already reset locally, so we don't need to show error
      }
    }
  }, [user?.uid, addToast, firebaseAvailable]); // Only depend on user.uid

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    progress,
    saveDrillPerformance,
    resetProgress,
    isLoaded
  }), [progress, saveDrillPerformance, resetProgress, isLoaded]);

  return returnValue;
};

export default useProgress;