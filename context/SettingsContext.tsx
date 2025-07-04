import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Theme, CaretStyle, SettingsContextType } from '../types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [caretStyle, setCaretStyleState] = useState<CaretStyle>('line');

    useEffect(() => {
        const storedTheme = localStorage.getItem('typeforge-theme') as Theme | null;
        if (storedTheme) setThemeState(storedTheme);

        const storedSound = localStorage.getItem('typeforge-sound');
        if (storedSound) setIsSoundEnabled(JSON.parse(storedSound));

        const storedCaret = localStorage.getItem('typeforge-caret') as CaretStyle | null;
        if (storedCaret) setCaretStyleState(storedCaret);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('typeforge-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleSound = useCallback(() => {
        setIsSoundEnabled(prev => {
            const newState = !prev;
            localStorage.setItem('typeforge-sound', JSON.stringify(newState));
            return newState;
        });
    }, []);

    const setCaretStyle = (newStyle: CaretStyle) => {
        setCaretStyleState(newStyle);
        localStorage.setItem('typeforge-caret', newStyle);
    };
    
    // Apply theme on initial load
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);


    const value = {
        theme,
        setTheme,
        isSoundEnabled,
        toggleSound,
        caretStyle,
        setCaretStyle,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
