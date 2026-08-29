import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Eye, Smartphone, Monitor } from 'lucide-react';
import { ScreenType, UserRole } from '../types';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenType;
  role: UserRole;
  onSelectScreen: (screen: ScreenType) => void;
  onToggleRole: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  role,
  onSelectScreen,
  onToggleRole,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const screens: { id: ScreenType; label: string; tag: string }[] = [
    { id: 'role_selection', label: '1. Role Selection', tag: 'Screen 1' },
    { id: 'landing', label: '2. Landing Page', tag: 'Screen 2' },
    { id: 'dashboard', label: '3. Donator Home', tag: 'Screen 3' },
    { id: 'profile', label: '4. Donator Profile', tag: 'Screen 4' },
    { id: 'donations', label: '5. My Donations', tag: 'Screen 5' },
    { id: 'signup', label: '6. Sign Up Auth', tag: 'Screen 6' },
    { id: 'rescuer_feed', label: 'Rescuer Feed', tag: 'Rescue Mode' },
    { id: 'impact', label: 'Impact Analytics', tag: 'Stats' },
  ];

  return (
    <div className="sticky top-0 z-50 bg-[#0a2510] text-white text-xs border-b border-white/10 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Left side: Quick Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#b9f02c] animate-pulse"></div>
          <span className="font-bold text-[#b9f02c]">Reference Screens:</span>
          <span className="text-white/80 font-medium hidden sm:inline">
            {screens.find((s) => s.id === currentScreen)?.label || currentScreen}
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Quick toggle for mobile mockup frame */}
          <button
            onClick={onToggleMobileFrame}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold ${
              isMobileFrame
                ? 'bg-[#b9f02c] text-[#0a2510] border-[#b9f02c]'
                : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
            }`}
            title="Toggle Mobile Viewport Frame"
          >
            {isMobileFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mobile Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Full Width</span>
              </>
            )}
          </button>

          {/* Toggle Screen Switcher Menu */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/15 hover:bg-white/25 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#b9f02c]" />
            <span>Switch Screen</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Grid of Reference Screens */}
      {isExpanded && (
        <div className="bg-[#05170a] border-t border-white/10 px-4 py-3 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
            {screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => {
                  onSelectScreen(screen.id);
                  setIsExpanded(false);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  currentScreen === screen.id
                    ? 'bg-[#b9f02c] text-[#0a2510] border-[#b9f02c] font-bold shadow-sm scale-102'
                    : 'bg-white/5 text-white/90 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-[10px] opacity-75 uppercase tracking-wider">
                  {screen.tag}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">
                  {screen.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
