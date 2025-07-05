import { useAuth } from '../../context/AuthContext';
import PremiumFeatureCard from '../PremiumFeatureCard';
import DashboardTabs from './DashboardTabs';
import LoadingSpinner from '../LoadingSpinner';
import TimerWidget from '../TimerWidget';
import StatsCards from './StatsCards';
import type { Progress, Lesson } from '../../types';

interface DashboardProps {
    progress: Progress;
    isProgressLoaded: boolean;
    onSelectDrill: (lesson: Lesson, drillIndex: number) => void;
    onUpgrade?: () => void;
}

const Dashboard = ({ progress, isProgressLoaded, onSelectDrill, onUpgrade }: DashboardProps) => {
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
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <header className="text-center">
                 <h1 className="text-3xl font-bold text-text-primary mb-2">Your Dashboard</h1>
                 <p className="text-text-secondary">Track your progress and unlock your potential.</p>
            </header>
            
            {/* Basic Stats - Available to all users */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Performance Overview</h2>
                <StatsCards performanceEntries={performanceEntries} />
            </section>
            
            {/* Timer Widget - Basic for all users */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Practice Timer</h2>
                <TimerWidget showGoalSetting={true} />
            </section>
            
            {/* Premium Features Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-text-primary">Premium Features</h2>
                    <span className="text-sm text-text-secondary">Upgrade to unlock advanced analytics</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Advanced Analytics - Premium */}
                    <div className="lg:col-span-2">
                        <PremiumFeatureCard
                            title="Advanced Analytics"
                            description="Deep insights into your typing performance with detailed charts and progress tracking"
                            icon={<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            requiredTier="premium"
                            onUpgrade={onUpgrade}
                        >
                            <DashboardTabs progress={progress} onSelectDrill={onSelectDrill} />
                        </PremiumFeatureCard>
                    </div>
                    
                    {/* AI Coach Insights */}
                    <PremiumFeatureCard
                        title="AI Coach Insights"
                        description="Get personalized feedback and improvement recommendations"
                        icon={<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                        requiredTier="premium"
                        onUpgrade={onUpgrade}
                    >
                        <div className="text-center py-6">
                            <p className="text-text-secondary text-sm">Complete lessons to receive AI-powered insights and personalized improvement recommendations.</p>
                        </div>
                    </PremiumFeatureCard>
                    
                    {/* Export & Data Management */}
                    <PremiumFeatureCard
                        title="Export & Data"
                        description="Download your progress data and statistics in multiple formats"
                        icon={<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        requiredTier="premium"
                        onUpgrade={onUpgrade}
                    >
                        <div className="text-center py-6">
                            <p className="text-text-secondary text-sm">Export your typing data in CSV, JSON, or PDF format for external analysis and progress tracking.</p>
                        </div>
                    </PremiumFeatureCard>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
