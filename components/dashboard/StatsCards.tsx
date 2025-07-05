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
    <div className="bg-secondary p-4 rounded-lg shadow-sm border border-border-primary hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
            {icon && <span className="text-2xl">{icon}</span>}
            {trend && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                    trend === 'up' ? 'bg-success/20 text-success' : 
                    trend === 'down' ? 'bg-danger/20 text-danger' : 
                    'bg-border-primary text-text-secondary'
                }`}>
                    {trend === 'up' ? '↗️ Up' : trend === 'down' ? '↘️ Down' : '→ Stable'}
                </span>
            )}
        </div>
        <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">
                {value}{unit}
            </div>
            <div className="text-sm font-medium text-text-primary mb-1">{label}</div>
            {subtitle && <div className="text-xs text-text-secondary">{subtitle}</div>}
        </div>
    </div>
);

const StatsCards = ({ performanceEntries }: StatsCardsProps) => {
    const totalEntries = performanceEntries.length;
    
    if (totalEntries === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Average WPM" value={0} icon="⚡" />
                <StatCard label="Average Accuracy" value="0%" icon="🎯" />
                <StatCard label="Personal Best" value={0} unit=" WPM" icon="🏆" />
                <StatCard label="Total Sessions" value={0} icon="📝" />
            </div>
        );
    }
    
    const avgWpm = Math.round(performanceEntries.reduce((sum, p) => sum + p.wpm, 0) / totalEntries);
    const avgAccuracy = Math.round(performanceEntries.reduce((sum, p) => sum + p.accuracy, 0) / totalEntries);
    const bestWpm = Math.max(...performanceEntries.map(p => p.wpm));
    const bestAccuracy = Math.max(...performanceEntries.map(p => p.accuracy));

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                label="Average WPM" 
                value={avgWpm} 
                icon="⚡"
                trend={getWpmTrend()}
                subtitle={recentSessions.length > 0 ? `Last: ${recentSessions[0].wpm} WPM` : undefined}
            />
            <StatCard 
                label="Accuracy" 
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
                subtitle="Top speed"
            />
            <StatCard 
                label="Total Sessions" 
                value={totalEntries} 
                icon="📝"
                subtitle={`${sessionsPerDay}/day avg`}
            />
        </div>
    );
};

export default StatsCards;
