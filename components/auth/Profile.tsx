
import { useAuth } from '../../context/AuthContext';
import PremiumBadge from '../PremiumBadge';

interface ProfileProps {
  onClose: () => void;
}

const Profile = ({ onClose }: ProfileProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    onClose();
  };
  
  if (!user) return null;

  return (
    <div 
      className="fixed inset-0 bg-primary/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-secondary p-8 rounded-lg shadow-2xl w-full max-w-md border border-border-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-accent">Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-tertiary">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="space-y-6 text-text-primary">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent/80 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold">{user.name || 'User'}</h3>
                <PremiumBadge tier={user.subscription?.tier || 'free'} size="sm" />
              </div>
              <p className="text-text-secondary">{user.email}</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-text-secondary">Subscription</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold capitalize">{user.subscription?.tier || 'Free'}</span>
                {user.subscription?.endDate && (
                  <span className="text-xs text-text-secondary">
                    Until {new Date(user.subscription.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-text-secondary">Member Since</span>
              <span className="text-lg font-semibold">
                {new Date(user.subscription?.startDate || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSignOut} 
          className="w-full mt-8 flex justify-center items-center px-6 py-3 font-semibold text-white bg-danger rounded-md hover:bg-danger/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-danger transition-colors"
        >
          Sign Out
        </button>

      </div>
    </div>
  );
};

export default Profile;
