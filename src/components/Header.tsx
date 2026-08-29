import React, { useState } from 'react';
import { Bell, Share2, LogOut, ChevronDown } from 'lucide-react';
import { ScreenType, UserRole, UserProfile, NotificationItem } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  role: UserRole;
  profile: UserProfile;
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenType) => void;
  onRoleToggle: () => void;
  onClearNotifications: () => void;
  onLogout?: () => void;
  variant?: 'standard' | 'profile' | 'plain';
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  role,
  profile,
  notifications,
  onNavigate,
  onRoleToggle,
  onClearNotifications,
  onLogout,
  variant = 'standard',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.organizationName} on NourishResq`,
        text: `Check out ${profile.organizationName}'s impact on NourishResq!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfaf5]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-black/[0.04] transition-all">
      {/* Left side: Avatar + Brand Title */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate(role === 'rescue' ? 'rescuer_map' : 'dashboard')}
      >
        {variant === 'profile' ? (
          <div className="w-10 h-10 rounded-full bg-[#0a3c1a] text-[#ccf148] font-bold flex items-center justify-center text-sm shadow-sm">
            NR
          </div>
        ) : (
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-gray-200 object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#ccf148] border-2 border-white rounded-full"></span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-bold text-xl text-[#0a3c1a] tracking-tight group-hover:text-[#125828] transition-colors">
            NourishResq
          </span>
          {role === 'rescue' && (
            <span className="text-[10px] font-semibold text-[#526600] bg-[#ccf148]/30 px-1.5 py-0.2 rounded-full w-max">
              Rescuer Mode
            </span>
          )}
        </div>
      </div>

      {/* Right side: Action controls */}
      <div className="flex items-center gap-2">
        {variant === 'profile' ? (
          <button
            onClick={handleShare}
            aria-label="Share Profile"
            className="p-2 text-[#0a3c1a] hover:bg-black/5 rounded-full transition-colors relative"
            title="Share Profile"
          >
            <Share2 className="w-5 h-5" />
            {copiedLink && (
              <span className="absolute -bottom-8 right-0 bg-[#0a3c1a] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in">
                Link copied!
              </span>
            )}
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="p-2 text-[#0a3c1a] hover:bg-black/5 rounded-full transition-colors relative"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ccf148] border-2 border-[#fdfaf5] rounded-full ring-2 ring-[#0a3c1a]"></span>
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0a3c1a]" />
                    <h4 className="font-bold text-sm text-[#0a3c1a]">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-[#ccf148] text-[#0a3c1a] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onClearNotifications();
                      setShowNotifications(false);
                    }}
                    className="text-xs text-gray-500 hover:text-[#0a3c1a] font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-2.5 px-2 rounded-xl transition-colors ${
                        !notif.read ? 'bg-[#f9faf4]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#0a3c1a]">{notif.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('donations');
                    }}
                    className="text-[#0a3c1a] font-semibold hover:underline"
                  >
                    View active listings →
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile / Logout menu */}
        {onLogout && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-[#0a3c1a] hover:bg-black/5 rounded-full transition-colors"
              aria-label="Menu"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRoleToggle();
                    if (role === 'donate') {
                      onNavigate('rescuer_map');
                    } else {
                      onNavigate('dashboard');
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Switch to {role === 'donate' ? 'Rescuer' : 'Donator'}
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
