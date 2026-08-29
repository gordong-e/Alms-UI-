import React from 'react';
import { Home, HandHeart, TrendingUp, User, Plus } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenCreate: () => void;
  variant?: 'center-plus' | 'side-plus';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenCreate,
  variant = 'center-plus',
}) => {
  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex items-center justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 max-w-md w-full justify-center">
        {/* Main Floating Dark Pill Navigation Bar */}
        <nav
          className="bg-[#142318] text-white/70 px-4 py-2.5 rounded-full flex items-center justify-around shadow-2xl border border-white/10 backdrop-blur-lg flex-1 max-w-[340px]"
          data-purpose="bottom-navigation"
        >
          {/* Home */}
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

          {/* Donations */}
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

          {/* Center Action Button (if center-plus mode) */}
          {variant === 'center-plus' && (
            <button
              onClick={onOpenCreate}
              className="w-11 h-11 -my-2 bg-[#ccf148] hover:bg-[#d8fc56] text-[#0a3c1a] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:scale-105"
              aria-label="Create New Donation"
              title="Add New Donation"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Impact */}
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

          {/* Profile */}
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
        </nav>

        {/* Side Floating Add Button (Used on screens like Profile & My Donations matching exact screenshot style) */}
        {variant === 'side-plus' && (
          <button
            onClick={onOpenCreate}
            className="w-13 h-13 bg-[#ccf148] hover:bg-[#d8fc56] text-[#0a3c1a] rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-105 font-bold text-xs shrink-0"
            aria-label="Add Listing"
            title="Create New Donation"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
