import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebaseConfig';
import type { Progress, DrillPerformance, Lesson, User } from '../types';
import { getDrillId, getPerformanceTier } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

const useProgress = (user: User | null) => {
  const [progress, setProgress] = useState<Progress>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToast } = useToast();

  // Load progress from Firestore when user changes
  useEffect(() => {
    if (!user) {
      // For guests, we can use a local, non-persistent state or clear it.
      setProgress({});
      setIsLoaded(true);
      return;
    }

    const loadProgress = async () => {
      setIsLoaded(false);
      const progressDocRef = db.collection('progress').doc(user.uid);
      try {
        const docSnap = await progressDocRef.get();
        if (docSnap.exists) {
          setProgress(docSnap.data() as Progress);
        } else {
          setProgress({});
        }
      } catch (error) {
        console.error("Failed to load progress from Firestore", error);
        addToast('Could not load your progress.', 'error');
        setProgress({});
      } finally {
        setIsLoaded(true);
      }
    };

    loadProgress();
  }, [user, addToast]);

  const saveDrillPerformance = useCallback((lesson: Lesson, drillIndex: number, wpm: number, accuracy: number) => {
    if (!user) return; // Don't save for guests
    
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
      setProgress(updatedProgress); // Optimistic update
      
      const progressDocRef = db.collection('progress').doc(user.uid);
      progressDocRef.set({ [drillId]: newPerformance }, { merge: true })
        .then(() => {
            addToast('New personal best saved!', 'success');
        })
        .catch(error => {
          console.error("Failed to save progress to Firestore", error);
          addToast('Failed to save progress to the cloud.', 'error');
          setProgress(progress); // Revert optimistic update
        });
    }
  }, [user, progress, addToast]);

  const resetProgress = useCallback(async () => {
    if (!user) return; // No progress to reset for guests

    const progressDocRef = db.collection('progress').doc(user.uid);
    try {
      await progressDocRef.delete();
      setProgress({});
      addToast('Your progress has been reset.', 'info');
    } catch (error) {
      console.error("Failed to reset progress in Firestore", error);
      addToast('Could not reset your progress.', 'error');
    }
  }, [user, addToast]);

  return { progress, saveDrillPerformance, resetProgress, isLoaded };
};

export default useProgress;