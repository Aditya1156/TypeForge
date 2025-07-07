import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { isPremiumUser } from '../utils/isPremiumUser';

const DebugPanel: React.FC = () => {
  const { user, upgradeSubscription, redeemGiftCode } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [testCode, setTestCode] = useState('TYPEFORGE2024');
  const [lastUpdate, setLastUpdate] = useState<string>('Never');

  // Listen for premium status changes
  useEffect(() => {
    const handleUpdate = () => {
      setLastUpdate(new Date().toLocaleTimeString());
    };

    window.addEventListener('premiumStatusUpdated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'premiumStatusChanged') {
        handleUpdate();
      }
    });

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('premium-sync');
      channel.onmessage = handleUpdate;
      return () => {
        window.removeEventListener('premiumStatusUpdated', handleUpdate);
        channel.close();
      };
    }

    return () => {
      window.removeEventListener('premiumStatusUpdated', handleUpdate);
    };
  }, []);

  const handleTestUpgrade = async () => {
    try {
      console.log('🧪 Starting test upgrade...');
      await upgradeSubscription('premium');
      console.log('✅ Test upgrade successful');
    } catch (error) {
      console.error('❌ Test upgrade failed:', error);
    }
  };

  const handleTestGiftCode = async () => {
    try {
      console.log('🧪 Testing gift code:', testCode);
      await redeemGiftCode(testCode);
      console.log('✅ Gift code redeemed successfully');
    } catch (error) {
      console.error('❌ Gift code redemption failed:', error);
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    window.location.reload();
  };

  const handleForceSyncTest = () => {
    console.log('🧪 Testing sync mechanisms...');
    
    // Test localStorage
    localStorage.setItem('premiumStatusChanged', JSON.stringify({
      tier: 'premium',
      timestamp: Date.now(),
      userId: user?.uid,
      test: true
    }));
    
    // Test BroadcastChannel
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('premium-sync');
      channel.postMessage({
        tier: 'premium',
        timestamp: Date.now(),
        userId: user?.uid,
        test: true
      });
      channel.close();
    }
    
    // Test custom event
    window.dispatchEvent(new CustomEvent('premiumStatusUpdated', {
      detail: {
        tier: 'premium',
        timestamp: Date.now(),
        userId: user?.uid,
        test: true
      }
    }));
    
    console.log('✅ Sync test signals sent');
  };

  const handleForceFirestoreSync = async () => {
    if (!user || user.uid === 'guest') {
      console.log('❌ No valid user for Firestore sync');
      return;
    }
    
    try {
      console.log('🔄 Forcing Firestore sync for user:', user.uid);
      const latestUser = await userService.loadUserData(user.uid);
      if (latestUser) {
        console.log('✅ Got latest user data from Firestore:', {
          uid: latestUser.uid,
          tier: latestUser.subscription.tier,
          premium: latestUser.subscription.tier === 'premium' || latestUser.subscription.tier === 'pro'
        });
        
        // This is just for testing - normally the context should update automatically
        setLastUpdate(new Date().toLocaleTimeString() + ' (Manual)');
      } else {
        console.log('❌ No user data found in Firestore');
      }
    } catch (error) {
      console.error('❌ Firestore sync failed:', error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User ID:</strong> {user?.uid || 'None'}
        </div>
        <div>
          <strong>Current Tier:</strong> {user?.subscription?.tier || 'None'}
        </div>
        <div>
          <strong>Is Premium:</strong> {isPremiumUser(user) ? '✅ YES' : '❌ NO'}
        </div>
        <div>
          <strong>Last Update:</strong> {lastUpdate}
        </div>
        <div>
          <strong>Tab ID:</strong> {Math.random().toString(36).substr(2, 9)}
        </div>
      </div>

      {user && user.uid !== 'guest' && (
        <div className="mt-4 space-y-2">
          <button
            onClick={handleTestUpgrade}
            className="w-full bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
          >
            Test Upgrade to Premium
          </button>
          
          <button
            onClick={handleManualRefresh}
            className="w-full bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
          >
            🔄 Manual Refresh
          </button>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="flex-1 px-2 py-1 text-black rounded text-sm"
              placeholder="Gift code"
            />
            <button
              onClick={handleTestGiftCode}
              className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
            >
              Redeem
            </button>
          </div>
          
          <button
            onClick={handleManualRefresh}
            className="w-full bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
          >
            Manual Refresh Tab
          </button>
          
          <button
            onClick={handleForceSyncTest}
            className="w-full bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm"
          >
            Test Sync Signals
          </button>
          
          <button
            onClick={handleForceFirestoreSync}
            className="w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Force Firestore Sync
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
