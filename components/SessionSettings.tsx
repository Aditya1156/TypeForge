import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { SessionConfig } from '../services/enhancedSessionService';

const SessionSettings: React.FC = () => {
  const { getSessionConfig, updateSessionConfig, isDeviceTrusted, addTrustedDevice, getSessionTimeRemaining } = useAuth();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load current session configuration
    const currentConfig = getSessionConfig();
    setConfig(currentConfig);
  }, [getSessionConfig]);

  const handleConfigUpdate = async (updates: Partial<SessionConfig>) => {
    if (!config) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const newConfig = { ...config, ...updates };
      await updateSessionConfig(updates);
      setConfig(newConfig);
      setMessage({ type: 'success', text: 'Session settings updated successfully!' });
    } catch (error) {
      console.error('Failed to update session config:', error);
      setMessage({ type: 'error', text: 'Failed to update session settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrustDevice = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await addTrustedDevice();
      await handleConfigUpdate({ trustedDevice: true });
      setMessage({ type: 'success', text: 'Device added to trusted devices!' });
    } catch (error) {
      console.error('Failed to trust device:', error);
      setMessage({ type: 'error', text: 'Failed to add device to trusted devices.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  if (!config) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const timeRemaining = getSessionTimeRemaining();
  const deviceTrusted = isDeviceTrusted();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Session Management
        </h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Current Session Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Current Session</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Expired'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Device Status:</span>
            <span className={`font-medium ${deviceTrusted ? 'text-green-600' : 'text-yellow-600'}`}>
              {deviceTrusted ? '🔒 Trusted' : '⚠️ Not Trusted'}
            </span>
          </div>
        </div>
      </div>

      {/* Session Duration Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Session Duration</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Keep me logged in for:
            </label>
            <select
              value={config.sessionDuration}
              onChange={(e) => handleConfigUpdate({ sessionDuration: parseInt(e.target.value) })}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days (recommended)</option>
              <option value={10}>10 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-login Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Auto-login Settings</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.rememberMe}
              onChange={(e) => handleConfigUpdate({ rememberMe: e.target.checked })}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Remember me on this device
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.autoLogin}
              onChange={(e) => handleConfigUpdate({ autoLogin: e.target.checked })}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable automatic login
            </span>
          </label>
        </div>
      </div>

      {/* Device Trust Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Device Security</h4>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Trust this device
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trusted devices have enhanced security and longer session duration
              </p>
            </div>
            {!deviceTrusted && (
              <button
                onClick={handleTrustDevice}
                disabled={isLoading}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
              >
                {isLoading ? 'Adding...' : 'Trust Device'}
              </button>
            )}
            {deviceTrusted && (
              <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 dark:bg-green-900/20 dark:text-green-200 rounded-md">
                ✓ Trusted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          🔒 Security Information
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Sessions are automatically secured with device fingerprinting</li>
          <li>• You'll receive warnings 30 minutes before session expiration</li>
          <li>• Suspicious activity will automatically log you out</li>
          <li>• Session data is encrypted and stored securely</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionSettings;
