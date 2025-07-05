
import { useAuth } from '../../context/AuthContext';

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
        
        <div className="space-y-4 text-text-primary">
            <div className="flex flex-col">
                <span className="text-sm text-text-secondary">Name</span>
                <span className="text-lg font-semibold">{user.name}</span>
            </div>
             <div className="flex flex-col">
                <span className="text-sm text-text-secondary">Email</span>
                <span className="text-lg font-semibold">{user.email}</span>
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
