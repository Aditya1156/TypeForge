import React from 'react';
import { useAuth } from '../context/AuthContext';
import { refreshPremiumStatus } from '../utils/isPremiumUser';

interface PremiumStatusDebugProps {
  onRefresh?: () => void;
}

/**
 * Debug component to help diagnose premium feature inconsistencies
 * Shows current subscription status and provides refresh button
 */
const PremiumStatusDebug: React.FC<PremiumStatusDebugProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  
  if (!user || user.uid === 'guest') {
    return null;
  }

  const handleRefresh = async () => {
    console.log('🔄 Manually refreshing premium status...');
    try {
      const refreshed = await refreshPremiumStatus(user);
      console.log('✅ Premium status refreshed:', refreshed);
      
      // Also trigger the context refresh
      window.dispatchEvent(new CustomEvent('refreshPremiumStatus'));
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('❌ Failed to refresh premium status:', error);
    }
  };

  const handleFirestoreRefresh = () => {
    console.log('🔄 Triggering Firestore premium status refresh...');
    window.dispatchEvent(new CustomEvent('refreshPremiumStatus'));
  };

  return (
    <div className="fixed bottom-4 right-4 bg-secondary border border-border-primary rounded-lg p-4 text-xs z-50 max-w-xs">
      <div className="text-text-primary font-medium mb-2">Premium Status Debug</div>
      
      <div className="space-y-1 mb-3 text-text-secondary">
        <div>UID: {user.uid.slice(0, 8)}...</div>
        <div>Tier: <span className="text-accent">{user.subscription?.tier || 'unknown'}</span></div>
        <div>Start: {user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : 'N/A'}</div>
        {user.subscription?.endDate && (
          <div>End: {new Date(user.subscription.endDate).toLocaleDateString()}</div>
        )}
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleRefresh}
          className="w-full px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded text-xs font-medium transition-colors"
        >
          Refresh Status
        </button>
        
        <button
          onClick={handleFirestoreRefresh}
          className="w-full px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs font-medium transition-colors"
        >
          Sync Firestore
        </button>
      </div>
      
      <div className="text-xs text-text-secondary mt-2">
        Use these buttons if premium features aren't working correctly
      </div>
    </div>
  );
};

export default PremiumStatusDebug;
