import React, { useState } from 'react';

export interface DeviceInfo {
  platform: string;
  browser: string;
  language: string;
  timestamp: number;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  deviceInfo: string;
  lastActivity: string;
  createdAt: string;
}

interface DeviceConflictModalProps {
  isOpen: boolean;
  activeSession: ActiveSession | null;
  userEmail: string;
  onRemoveOtherDevice: () => Promise<void>;
  onCancel: () => void;
}

const DeviceConflictModal: React.FC<DeviceConflictModalProps> = ({
  isOpen,
  activeSession,
  userEmail,
  onRemoveOtherDevice,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseDeviceInfo = (deviceInfoString: string): DeviceInfo | null => {
    try {
      return JSON.parse(deviceInfoString);
    } catch {
      return null;
    }
  };

  const formatLastActivity = (lastActivity: string): string => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getDeviceIcon = (platform: string) => {
    // Device type detection
    const isMobile = /Mobile|Android|iPhone|iPad/.test(platform);
    const isTablet = /iPad|Tablet/.test(platform);
    
    if (isMobile && !isTablet) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
        </svg>
      );
    }
    
    if (isTablet) {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      );
    }
    
    // Desktop/laptop
    return (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    );
  };

  const handleRemoveOtherDevice = async () => {
    setIsProcessing(true);
    try {
      await onRemoveOtherDevice();
    } catch (error) {
      console.error('Error removing other device:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !activeSession) return null;

  const deviceInfo = parseDeviceInfo(activeSession.deviceInfo);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md border border-tertiary">
        {/* Header */}
        <div className="p-6 border-b border-tertiary">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Account Already Active</h3>
                <p className="text-sm text-text-secondary">Another device is signed in</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-text-secondary text-sm mb-4">
              Your account <span className="font-medium text-text-primary">{userEmail}</span> is currently signed in on another device. 
              For security reasons, only one device can be signed in at a time.
            </p>

            {/* Active Device Info */}
            <div className="bg-tertiary rounded-lg p-4 border border-tertiary/50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {deviceInfo && getDeviceIcon(deviceInfo.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-text-primary">Current Active Device</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Online
                    </span>
                  </div>
                  {deviceInfo && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-text-secondary">
                        <span className="font-medium">Device:</span> {deviceInfo.platform}
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="font-medium">Browser:</span> {deviceInfo.browser}
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="font-medium">Last seen:</span> {formatLastActivity(activeSession.lastActivity)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRemoveOtherDevice}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-gradient-to-r from-accent to-accent/80 text-primary font-semibold rounded-lg hover:from-accent/90 hover:to-accent/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing out other device...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out other device & continue</span>
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-tertiary text-text-primary font-medium rounded-lg hover:bg-tertiary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel sign in
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-info mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-info">
                This security feature ensures your account can only be accessed from one device at a time, protecting your data and typing progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceConflictModal;
