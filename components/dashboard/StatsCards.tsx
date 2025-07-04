import React from 'react';
import type { DrillPerformance } from '../../types';

interface StatsCardsProps {
    performanceEntries: DrillPerformance[];
}

const StatCard = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-accent">{value}</span>
        <span className="text-sm text-text-secondary mt-1">{label}</span>
    </div>
);

const StatsCards = ({ performanceEntries }: StatsCardsProps) => {
    const totalEntries = performanceEntries.length;
    
    const avgWpm = totalEntries > 0 
        ? Math.round(performanceEntries.reduce((sum, p) => sum + p.wpm, 0) / totalEntries)
        : 0;

    const avgAccuracy = totalEntries > 0
        ? Math.round(performanceEntries.reduce((sum, p) => sum + p.accuracy, 0) / totalEntries)
        : 0;
        
    const bestWpm = totalEntries > 0
        ? Math.max(...performanceEntries.map(p => p.wpm))
        : 0;
        
    const masteredDrills = performanceEntries.filter(p => p.tier === 'mastered').length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard label="Average WPM" value={avgWpm} />
            <StatCard label="Average Accuracy" value={`${avgAccuracy}%`} />
            <StatCard label="Personal Best" value={bestWpm} unit="WPM" />
            <StatCard label="Drills Mastered" value={masteredDrills} />
        </div>
    );
};

export default StatsCards;
