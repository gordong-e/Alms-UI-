import React from 'react';
import { Heart, Truck, Check } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectionScreenProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  selectedRole,
  onSelectRole,
  onContinue,
}) => {
  return (
    <div className="bg-[#f9f9f8] text-[#0a2510] min-h-screen flex flex-col justify-between pt-12 pb-8 px-6 antialiased max-w-lg mx-auto">
      {/* Header Section */}
      <header className="text-center mb-8 flex-shrink-0" data-purpose="screen-header">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight tracking-tight text-[#0a2510]">
          How will you use<br />Alms?
        </h1>
        <p className="text-sm lg:text-base text-gray-600 px-4 leading-relaxed">
          Select your primary role to customize your experience. You can always change this later.
        </p>
      </header>

      {/* Role Selection Cards */}
      <main className="flex-grow flex flex-col gap-4" data-purpose="role-options">
        {/* Donate Food Card */}
        <label
          onClick={() => onSelectRole('donate')}
          className="block cursor-pointer group transition-transform active:scale-[0.99]"
        >
          <div
            className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all flex items-start gap-4 ${
              selectedRole === 'donate'
                ? 'border-[#bde535] shadow-md ring-1 ring-[#bde535]/50'
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedRole === 'donate' ? 'bg-[#bde535] text-[#0a2510]' : 'bg-[#e6e6e6] text-[#0a2510]'
              }`}
            >
              <svg className="text-[#0a2510]" fill="none" height="26" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="26" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5 9.04 7.96a2.1 2.1 0 0 0 0 2.97l2.46 2.47a1 1 0 0 0 1.42 0l2.46-2.47a2.1 2.1 0 0 0 0-2.97L12 5Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg mb-1 text-[#0a2510]">I want to donate food</h2>
                {selectedRole === 'donate' && (
                  <span className="w-5 h-5 rounded-full bg-[#0a2510] text-[#bde535] flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                I have surplus food from a restaurant, grocery store, or event to share with the community.
              </p>
            </div>
          </div>
        </label>

        {/* Rescue Food Card */}
        <label
          onClick={() => onSelectRole('rescue')}
          className="block cursor-pointer group transition-transform active:scale-[0.99]"
        >
          <div
            className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all flex items-start gap-4 ${
              selectedRole === 'rescue'
                ? 'border-[#bde535] shadow-md ring-1 ring-[#bde535]/50'
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedRole === 'rescue' ? 'bg-[#bde535] text-[#0a2510]' : 'bg-[#e6e6e6] text-[#0a2510]'
              }`}
            >
              <svg className="text-[#0a2510]" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <rect height="13" rx="2" width="16" x="2" y="6" />
                <rect height="8" rx="2" width="6" x="16" y="11" />
                <circle cx="8" cy="19" r="2" />
                <circle cx="17" cy="19" r="2" />
                <path d="M16 11h2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg mb-1 text-[#0a2510]">I want to rescue food</h2>
                {selectedRole === 'rescue' && (
                  <span className="w-5 h-5 rounded-full bg-[#0a2510] text-[#bde535] flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                I can transport surplus food to organizations or individuals in need.
              </p>
            </div>
          </div>
        </label>
      </main>

      {/* Footer Action */}
      <footer className="mt-8 flex-shrink-0" data-purpose="bottom-action">
        <button
          onClick={onContinue}
          className="w-full bg-[#0a2510] hover:bg-[#12361b] text-white font-semibold py-4 rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
        >
          Continue
        </button>
      </footer>
    </div>
  );
};
