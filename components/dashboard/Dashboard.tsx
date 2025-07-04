import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StatsCards from './StatsCards';
import PerformanceChart from './PerformanceChart';
import ProblemAreas from './ProblemAreas';
import LoadingSpinner from '../LoadingSpinner';
import type { Progress, Lesson, DrillPerformance } from '../../types';

interface DashboardProps {
    progress: Progress;
    isProgressLoaded: boolean;
    onSelectDrill: (lesson: Lesson, drillIndex: number) => void;
}

const Dashboard = ({ progress, isProgressLoaded, onSelectDrill }: DashboardProps) => {
    const { user } = useAuth();

    if (!isProgressLoaded) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }

    if (!user) {
        return (
            <div className="text-center p-8 bg-secondary rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-accent">Dashboard</h2>
                <p className="mt-2 text-text-secondary">Please sign in to view your personalized dashboard and track your progress.</p>
            </div>
        );
    }
    
    const performanceEntries = Object.values(progress);

    if (performanceEntries.length === 0) {
       return (
            <div className="text-center p-8 bg-secondary rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-accent">Welcome, {user.name || user.email}!</h2>
                <p className="mt-2 text-text-secondary">Your dashboard is ready. Complete some lessons to see your stats here.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <header>
                 <h1 className="text-4xl font-bold text-text-primary">Your Dashboard</h1>
                 <p className="text-text-secondary mt-1">An overview of your typing journey.</p>
            </header>
            <StatsCards performanceEntries={performanceEntries} />
            <PerformanceChart performanceEntries={performanceEntries} />
            <ProblemAreas progress={progress} onSelectDrill={onSelectDrill} />
        </div>
    );
};

export default Dashboard;
