import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebaseConfig';
import type { Progress, DrillPerformance, Lesson, User } from '../types';
import { getDrillId, getPerformanceTier } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  try {
    return db && typeof db.collection === 'function';
  } catch (error) {
    console.warn('Firebase not available:', error);
    return false;
  }
};

const useProgress = (user: User | null) => {
  const [progress, setProgress] = useState<Progress>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [firebaseAvailable] = useState(isFirebaseAvailable());
  const { addToast } = useToast();

  // Load progress from Firestore when user changes
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
          setProgress(docSnap.data() as Progress);
        } else {
          setProgress({});
        }
      } catch (error) {
        console.error("Failed to load progress from Firestore", error);
        setProgress({});
      } finally {
        setIsLoaded(true);
      }
    };

    loadProgress();
  }, [user, firebaseAvailable]);

  const saveDrillPerformance = useCallback((lesson: Lesson, drillIndex: number, wpm: number, accuracy: number) => {
    const drillId = getDrillId(lesson, drillIndex);
    const tier = getPerformanceTier(wpm, accuracy);
    const timestamp = Date.now();
    
    const newPerformance: DrillPerformance = { wpm, accuracy, tier, timestamp };
    const existingPerformance = progress[drillId];

    const isNewScoreBetter = !existingPerformance ||
      (tier === 'mastered' && existingPerformance.tier !== 'mastered') ||
      (tier === 'proficient' && existingPerformance.tier === 'needs-practice') ||
      (tier === existingPerformance.tier && wpm > existingPerformance.wpm);

    if (isNewScoreBetter) {
      const updatedProgress = { ...progress, [drillId]: newPerformance };
      setProgress(updatedProgress);
      
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
    }
  }, [user, progress, addToast, firebaseAvailable]);

  const resetProgress = useCallback(async () => {
    setProgress({});
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
  }, [user, addToast, firebaseAvailable]);

  return { progress, saveDrillPerformance, resetProgress, isLoaded };
};

export default useProgress;