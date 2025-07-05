import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';

export const SessionManagerTest: React.FC = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSessionInfo = async () => {
    if (!user || user.uid === 'guest') return;
    
    setIsLoading(true);
    try {
      const info = await userService.getSessionInfo(user.uid);
      setSessionInfo(info);
    } catch (error) {
      console.error('Error getting session info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceEndSessions = async () => {
    if (!user || user.uid === 'guest') return;
    
    try {
      await userService.forceEndAllSessions(user.uid);
      await refreshSessionInfo();
    } catch (error) {
      console.error('Error ending sessions:', error);
    }
  };

  useEffect(() => {
    refreshSessionInfo();
  }, [user]);

  if (!user || user.uid === 'guest') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Session Manager (Test)</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to view session information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Session Manager (Test)</h3>
        <div className="space-x-2">
          <button
            onClick={refreshSessionInfo}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={forceEndSessions}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            End All Sessions
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Current Session ID:</label>
          <p className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded font-mono">
            {sessionService.currentSessionId || 'No active session'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Firestore Session Data:</label>
          <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40">
            {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'No session data'}
          </pre>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• Open this app in another browser/incognito window</p>
          <p>• Sign in with the same account</p>
          <p>• This session should be logged out automatically</p>
          <p>• The session conflict message will appear</p>
        </div>
      </div>
    </div>
  );
};

export default SessionManagerTest;
