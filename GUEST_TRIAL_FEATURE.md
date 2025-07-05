# Guest Trial Feature Implementation

## 🎯 **New Feature: 30-Minute Guest Trial**

### **What's New:**
- **Guest Trial Option**: Users can now try TypeForge for 30 minutes without creating an account
- **Persistent Timer**: Trial time is tracked across browser sessions using localStorage
- **Progressive Sign-up Prompts**: Gentle encouragement to sign up during and after trial
- **Seamless Integration**: Works with existing premium restrictions

## 🚀 **User Experience Flow**

### **1. Initial Landing**
When users visit without an account, they see:
- **Primary CTA**: "Sign Up / Sign In" (recommended)
- **Secondary Option**: "Try for 30 Minutes (No Account Required)"
- **Clear Benefits**: Progress tracking, themes, analytics for accounts

### **2. During Guest Trial**
- **Persistent Timer**: Shows remaining time in top banner
- **Limited Features**: Basic typing practice only
- **Sign-up Prompts**: Small "Sign Up Now" button in timer bar
- **Warning at 5 Minutes**: Timer turns red with urgency

### **3. Trial Expiration**
- **Graceful Block**: Clear message about trial ending
- **Benefits Reminder**: What they get with an account
- **Easy Sign-up**: Direct path to create account

## 🛠 **Technical Implementation**

### **New Components:**

#### **1. `useGuestTrial` Hook**
```typescript
// Location: hooks/useGuestTrial.ts
- Manages 30-minute trial state
- Persists trial start time in localStorage
- Provides remaining time and formatted display
- Auto-expires trial after 30 minutes
```

#### **2. `TrialTimer` Component**
```typescript
// Location: components/TrialTimer.tsx
- Fixed position timer bar at top of screen
- Shows remaining time with countdown
- Changes to warning state at 5 minutes
- Includes sign-up CTA button
```

#### **3. Enhanced `SessionLimitGuard`**
```typescript
// Location: components/SessionLimitGuard.tsx
- Now handles three states:
  1. No user, no trial (show options)
  2. Trial active (show content with timer)
  3. Trial expired (show sign-up prompt)
```

### **Integration Points:**

#### **1. Main App (`App.tsx`)**
- Added TrialTimer component globally
- Connects sign-in modal to trial timer

#### **2. Header Adjustment**
- Automatically adjusts position when trial timer is active
- Prevents overlap with fixed trial banner

#### **3. TypingApp Integration**
- Passes sign-in callback to SessionLimitGuard
- Maintains existing upgrade functionality

## 📊 **Trial Limitations**

### **What Guest Users Get:**
- ✅ 30 minutes of typing practice
- ✅ Basic lessons (first 5)
- ✅ Real-time WPM/accuracy
- ✅ All typing modes (keys, words, etc.)

### **What's Restricted:**
- ❌ Progress tracking/saving
- ❌ AI Coach features
- ❌ Advanced analytics
- ❌ Premium themes
- ❌ Account-specific features

## 🎨 **UI/UX Highlights**

### **Visual Design:**
- **Clean Options**: Clear choice between sign-up and trial
- **Progressive Disclosure**: Timer appears only during trial
- **Color Psychology**: Blue for normal, red for urgency
- **Consistent Branding**: Matches overall app aesthetic

### **User Psychology:**
- **Low Barrier Entry**: Removes sign-up friction
- **Value Demonstration**: Users experience the product first
- **Urgency Creation**: Time pressure encourages action
- **Social Proof**: Shows benefits of upgrading

## 🔄 **State Management**

### **localStorage Schema:**
```typescript
// Key: 'guestTrialStart'
// Value: timestamp (milliseconds)
// Expires: After 30 minutes or manual clear
```

### **Trial States:**
1. **No Trial**: Fresh visitor, show options
2. **Active Trial**: Timer running, show content
3. **Expired Trial**: Time up, encourage sign-up
4. **Signed Up**: Regular user flow

## 📈 **Conversion Strategy**

### **Gentle Approach:**
- Non-intrusive timer display
- Small sign-up buttons during trial
- Emphasis on benefits, not pressure

### **Urgency Building:**
- Visual countdown creates scarcity
- Red warning at 5 minutes
- Clear end-of-trial messaging

### **Value Demonstration:**
- Users experience core functionality
- See what they're missing (analytics, AI coach)
- Understand benefit of account creation

## 🚧 **Future Enhancements**

### **Analytics Integration:**
- Track trial-to-signup conversion rates
- Measure optimal trial duration
- A/B test different CTA messaging

### **Enhanced Restrictions:**
- Limit to specific lesson types
- Reduce available practice modes
- Add watermarks or reminders

### **Social Features:**
- "Share your score" requires account
- "Challenge friends" needs sign-up
- Leaderboard participation

## ✅ **Implementation Complete**

### **Files Modified:**
- ✅ `hooks/useGuestTrial.ts` (NEW)
- ✅ `components/TrialTimer.tsx` (NEW)
- ✅ `components/SessionLimitGuard.tsx` (UPDATED)
- ✅ `components/landing/Header.tsx` (UPDATED)
- ✅ `App.tsx` (UPDATED)
- ✅ `TypingApp.tsx` (UPDATED)

### **Ready for Testing:**
- Guest trial starts on button click
- Timer persists across page refreshes
- Graceful expiration handling
- Sign-up integration working

The guest trial feature provides a perfect balance between accessibility and conversion optimization, giving users a taste of TypeForge while encouraging account creation for the full experience!
