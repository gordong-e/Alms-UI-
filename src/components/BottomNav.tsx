import React from 'react';
import { Home, HandHeart, TrendingUp, User, Plus, Map, Compass } from 'lucide-react';
import { ScreenType, UserRole } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  userRole: UserRole;
  onNavigate: (screen: ScreenType) => void;
  onOpenCreate: () => void;
  variant?: 'center-plus' | 'side-plus';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  userRole,
  onNavigate,
  onOpenCreate,
  variant = 'center-plus',
}) => {
  // Different nav items based on role
  const isDonator = userRole === 'donate';

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex items-center justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 max-w-md sm:max-w-lg w-full justify-center">
        {/* Main Floating Dark Pill Navigation Bar */}
        <nav
          className="bg-[#142318] text-white/70 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center justify-around shadow-2xl border border-white/10 backdrop-blur-lg flex-1 max-w-[340px] sm:max-w-[420px]"
          data-purpose="bottom-navigation"
        >
          {isDonator ? (
            <>
              {/* Donator Nav: Home | Donations | [+] | Impact | Profile */}
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  currentScreen === 'dashboard'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Home"
              >
                <Home className="w-5 h-5" strokeWidth={currentScreen === 'dashboard' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Home</span>
              </button>

              <button
                onClick={() => onNavigate('donations')}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  currentScreen === 'donations'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Donations"
              >
                <HandHeart className="w-5 h-5" strokeWidth={currentScreen === 'donations' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Donations</span>
              </button>

              <button
                onClick={onOpenCreate}
                className="w-11 h-11 -my-2 bg-[#ccf148] hover:bg-[#d8fc56] text-[#0a3c1a] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:scale-105"
                aria-label="Create New Donation"
                title="Add New Donation"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>

              <button
                onClick={() => onNavigate('impact')}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  currentScreen === 'impact'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Impact"
              >
                <TrendingUp className="w-5 h-5" strokeWidth={currentScreen === 'impact' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Impact</span>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  currentScreen === 'profile'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Profile"
              >
                <User className="w-5 h-5" strokeWidth={currentScreen === 'profile' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Profile</span>
              </button>
            </>
          ) : (
            <>
              {/* Rescuer Nav: Map | Impact | Profile */}
              <button
                onClick={() => onNavigate('rescuer_map')}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-full transition-all ${
                  currentScreen === 'rescuer_map' || currentScreen === 'rescuer_feed'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Map"
              >
                <Compass className="w-5 h-5" strokeWidth={currentScreen === 'rescuer_map' || currentScreen === 'rescuer_feed' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Explore</span>
              </button>


              <button
                onClick={() => onNavigate('profile')}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-full transition-all ${
                  currentScreen === 'profile'
                    ? 'text-[#ccf148] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Profile"
              >
                <User className="w-5 h-5" strokeWidth={currentScreen === 'profile' ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-tight">Profile</span>
              </button>
            </>
          )}
        </nav>


      </div>
    </div>
  );
};
