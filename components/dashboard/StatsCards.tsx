import type { DrillPerformance } from '../../types';

interface StatsCardsProps {
    performanceEntries: DrillPerformance[];
}

const StatCard = ({ 
    label, 
    value, 
    unit, 
    subtitle, 
    trend, 
    icon 
}: { 
    label: string; 
    value: string | number; 
    unit?: string; 
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
}) => (
    <div className="bg-secondary p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <div className="flex items-center space-x-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <span className="text-4xl font-bold text-accent">{value}{unit}</span>
            {trend && (
                <span className={`text-sm ${
                    trend === 'up' ? 'text-green-400' : 
                    trend === 'down' ? 'text-red-400' : 
                    'text-text-secondary'
                }`}>
                    {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}
                </span>
            )}
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
        {subtitle && <span className="text-xs text-text-secondary mt-1">{subtitle}</span>}
    </div>
);

const StatsCards = ({ performanceEntries }: StatsCardsProps) => {
    const totalEntries = performanceEntries.length;
    
    if (totalEntries === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Average WPM" value={0} icon="⚡" />
                <StatCard label="Average Accuracy" value="0%" icon="🎯" />
                <StatCard label="Personal Best" value={0} unit=" WPM" icon="🏆" />
                <StatCard label="Drills Mastered" value={0} icon="✅" />
            </div>
        );
    }
    
    const avgWpm = Math.round(performanceEntries.reduce((sum, p) => sum + p.wpm, 0) / totalEntries);
    const avgAccuracy = Math.round(performanceEntries.reduce((sum, p) => sum + p.accuracy, 0) / totalEntries);
    const bestWpm = Math.max(...performanceEntries.map(p => p.wpm));
    const bestAccuracy = Math.max(...performanceEntries.map(p => p.accuracy));
    const masteredDrills = performanceEntries.filter(p => p.tier === 'mastered').length;
    const proficientDrills = performanceEntries.filter(p => p.tier === 'proficient').length;

    // Calculate trends (compare last 10 sessions with previous 10)
    const recentSessions = performanceEntries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, Math.min(10, totalEntries));
    
    const olderSessions = performanceEntries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(10, Math.min(20, totalEntries));

    const getWpmTrend = () => {
        if (olderSessions.length === 0) return 'neutral';
        const recentAvg = recentSessions.reduce((sum, p) => sum + p.wpm, 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((sum, p) => sum + p.wpm, 0) / olderSessions.length;
        const diff = recentAvg - olderAvg;
        return diff > 2 ? 'up' : diff < -2 ? 'down' : 'neutral';
    };

    const getAccuracyTrend = () => {
        if (olderSessions.length === 0) return 'neutral';
        const recentAvg = recentSessions.reduce((sum, p) => sum + p.accuracy, 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((sum, p) => sum + p.accuracy, 0) / olderSessions.length;
        const diff = recentAvg - olderAvg;
        return diff > 2 ? 'up' : diff < -2 ? 'down' : 'neutral';
    };

    // Calculate time-based stats
    const timeSpan = totalEntries > 1 ? 
        Math.ceil((Math.max(...performanceEntries.map(p => p.timestamp)) - 
                  Math.min(...performanceEntries.map(p => p.timestamp))) / (1000 * 60 * 60 * 24)) : 1;

    const sessionsPerDay = (totalEntries / Math.max(timeSpan, 1)).toFixed(1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    label="Average WPM" 
                    value={avgWpm} 
                    icon="⚡"
                    trend={getWpmTrend()}
                    subtitle={recentSessions.length > 0 ? `Last session: ${recentSessions[0].wpm} WPM` : undefined}
                />
                <StatCard 
                    label="Average Accuracy" 
                    value={`${avgAccuracy}%`} 
                    icon="🎯"
                    trend={getAccuracyTrend()}
                    subtitle={`Best: ${bestAccuracy}%`}
                />
                <StatCard 
                    label="Personal Best" 
                    value={bestWpm} 
                    unit=" WPM" 
                    icon="🏆"
                    subtitle="Highest speed achieved"
                />
                <StatCard 
                    label="Drills Mastered" 
                    value={masteredDrills} 
                    icon="✅"
                    subtitle={`${proficientDrills} proficient`}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    label="Total Sessions" 
                    value={totalEntries} 
                    icon="📝"
                    subtitle={`${sessionsPerDay} per day avg`}
                />
                <StatCard 
                    label="Practice Days" 
                    value={new Set(performanceEntries.map(p => new Date(p.timestamp).toDateString())).size} 
                    icon="📅"
                    subtitle={`Over ${timeSpan} days`}
                />
                <StatCard 
                    label="Improvement Rate" 
                    value={totalEntries > 1 ? Math.round(((bestWpm - (performanceEntries.sort((a, b) => a.timestamp - b.timestamp)[0]?.wpm || 0)) / Math.max(timeSpan, 1))) : 0} 
                    unit=" WPM/day" 
                    icon="📈"
                    subtitle="Average daily growth"
                />
                <StatCard 
                    label="Consistency Score" 
                    value={totalEntries > 0 ? Math.round(100 - (Math.sqrt(performanceEntries.reduce((sum, p) => sum + Math.pow(p.wpm - avgWpm, 2), 0) / totalEntries))) : 0} 
                    unit="%" 
                    icon="🎖️"
                    subtitle="Lower variance = higher score"
                />
            </div>
        </div>
    );
};

export default StatsCards;
