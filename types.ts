
export type State = "start" | "run" | "finish";

export interface ErrorDetail {
  expected: string;
  actual: string;
  index: number;
}

export interface AiAnalysis {
  analysis: string;
  drill: string[];
}

export type PracticeMode = 'keys' | 'words' | 'paragraph' | 'code';

export interface Lesson {
  id: string;
  name:string;
  texts: string[]; // A lesson now contains multiple drills for variety
  type?: 'test' | 'guide';
}

export interface Chapter {
  id:string;
  name: string;
  description: string;
  lessons: Lesson[];
}

// Additions for progress tracking
export type PerformanceTier = 'mastered' | 'proficient' | 'needs-practice';

export interface DrillPerformance {
  wpm: number;
  accuracy: number;
  tier: PerformanceTier;
  timestamp: number;
}

export type Progress = Record<string, DrillPerformance>;

// Addition for authentication - Aligned with Firebase
export interface User {
  uid: string;
  name: string | null;
  email: string | null;
}

export type ModalType = 'signIn' | 'signUp' | 'profile' | 'settings';


// Additions for Toast Notifications
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
}

// Additions for Settings
export type Theme = 'dark' | 'light' | 'hacker' | 'ocean' | 'sunset' | 'forest';
export type CaretStyle = 'line' | 'block' | 'underline';

export interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isSoundEnabled: boolean;
    toggleSound: () => void;
    caretStyle: CaretStyle;
    setCaretStyle: (style: CaretStyle) => void;
}