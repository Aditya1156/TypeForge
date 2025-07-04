# Timer Feature Documentation

## Overview
The Timer feature is a comprehensive time-tracking system that helps users monitor their daily typing practice sessions, set goals, and maintain consistent practice habits. It integrates with Firebase for cloud storage and syncing across devices.

## Features

### 🕒 Session Tracking
- **Automatic Session Start**: Starts timing automatically when user begins typing
- **Session Pause/Resume**: Allows pausing during breaks
- **Session End**: Stops timing when typing test is completed
- **Real-time Display**: Shows current session time while typing

### 📊 Statistics & Analytics
- **Daily Time Spent**: Tracks total time practiced each day
- **Weekly/Monthly Totals**: Aggregated time for longer periods
- **All-time Total**: Lifetime practice time tracking
- **Streak Counter**: Consecutive days of practice
- **Progress Percentage**: Visual indicator of daily goal completion

### 🎯 Goal Setting
- **Customizable Daily Goals**: Set practice time targets (5 minutes to 8 hours)
- **Visual Progress Bar**: Color-coded progress indicator
- **Goal Achievement**: Celebration when daily goal is reached
- **Time Remaining**: Shows how much time is needed to reach the goal

### 📱 Multi-Location Display
- **Compact Sidebar Widget**: Quick overview in the sidebar
- **Full Dashboard Widget**: Detailed timer controls and statistics
- **Main Screen Integration**: Timer functionality accessible from anywhere

## Components

### TimerContext (`context/TimerContext.tsx`)
Central state management for all timer functionality:
- Manages timer stats and session state
- Handles Firebase integration for data persistence
- Provides timer control functions
- Calculates streaks and progress metrics

### TimerWidget (`components/TimerWidget.tsx`)
Reusable timer display component with two modes:
- **Compact Mode**: Minimal display for sidebar
- **Full Mode**: Complete timer interface with controls

## Implementation Details

### Data Structure
```typescript
interface TimerStats {
  dailyTimeSpent: number;      // in seconds
  weeklyTimeSpent: number;     // in seconds  
  monthlyTimeSpent: number;    // in seconds
  totalTimeSpent: number;      // in seconds
  currentSessionTime: number;  // in seconds
  dailyGoal: number;          // in seconds (default 30 minutes)
  streak: number;             // consecutive days
  lastActiveDate: string;     // YYYY-MM-DD format
}
```

### Firebase Integration
- **Collection**: `userTimerStats`
- **Document ID**: User's UID
- **Real-time Sync**: Automatic cloud storage
- **Offline Support**: Works without internet connection

### Session Management
1. **Auto-start**: Timer begins when typing state changes to 'run'
2. **Auto-end**: Timer stops when typing state changes to 'finish'
3. **Manual Controls**: Start, pause, resume, and end buttons
4. **Data Persistence**: All session data saved to Firebase

### Daily Reset Logic
- **Midnight Reset**: Daily stats reset at start of new day
- **Streak Calculation**: Maintains streak for consecutive days
- **Weekly/Monthly Accumulation**: Longer period stats accumulate

## Usage

### For Users
1. **Automatic Tracking**: Timer starts automatically when typing begins
2. **Goal Setting**: Click "Set Goal" to customize daily target
3. **Progress Monitoring**: View progress in sidebar or dashboard
4. **Session Control**: Use pause/resume buttons during breaks

### For Developers
1. **Context Usage**: 
   ```tsx
   const { timerStats, startSession, endSession } = useTimer();
   ```

2. **Widget Integration**:
   ```tsx
   <TimerWidget compact={true} />          // Sidebar
   <TimerWidget showGoalSetting={true} />  // Dashboard
   ```

3. **Auto-integration**: Timer automatically integrates with typing sessions

## Features in Detail

### 🎨 Visual Design
- **Theme Awareness**: Adapts to all 6 app themes
- **Progress Bars**: Color-coded based on goal achievement
- **Icons**: Intuitive timer and goal icons
- **Responsive**: Works on all screen sizes

### 🔄 Synchronization
- **Cross-device Sync**: Access stats from any device
- **Real-time Updates**: Immediate sync to cloud
- **Conflict Resolution**: Handles multiple device usage

### 📈 Motivation Features
- **Streak Counter**: Encourages daily practice
- **Goal Achievement**: Visual celebration of goals
- **Progress Visualization**: Clear progress indicators
- **Statistics Overview**: Comprehensive time tracking

## Integration Points

### TypingApp Integration
- Auto-starts timer when typing begins (`isTyping` state)
- Auto-ends timer when test completes (`isFinished` state)
- No manual intervention required

### Dashboard Integration
- Full timer widget with goal setting
- Prominent placement for easy access
- Integration with other analytics

### Sidebar Integration
- Compact timer display
- Always visible timer status
- Quick access to current session info

## Future Enhancements

### Planned Features
- **Session History**: Detailed log of all sessions
- **Advanced Analytics**: Charts and trends
- **Challenge System**: Time-based challenges
- **Team Features**: Group time tracking
- **Reminders**: Practice time notifications

### Technical Improvements
- **Performance Optimization**: Reduce Firebase calls
- **Offline Mode**: Enhanced offline support
- **Export Features**: Data export capabilities
- **Integration**: Calendar and external app integration

## Best Practices

### For Users
1. Set realistic daily goals (start with 15-30 minutes)
2. Use pause feature for natural breaks
3. Check progress regularly for motivation
4. Maintain consistent daily practice

### For Developers
1. Always wrap components with `TimerProvider`
2. Use `useTimer` hook for timer functionality
3. Handle loading states for Firebase data
4. Test offline functionality

## Troubleshooting

### Common Issues
1. **Timer not starting**: Check if `TimerProvider` is properly wrapped
2. **Data not syncing**: Verify Firebase configuration
3. **Incorrect times**: Check timezone handling
4. **Performance issues**: Monitor Firebase calls

### Debug Information
- Timer state available through React DevTools
- Firebase calls logged in browser console
- Session timing logged for debugging

---

This timer feature provides a comprehensive time-tracking solution that encourages consistent practice and helps users achieve their typing improvement goals through gamification and detailed analytics.
