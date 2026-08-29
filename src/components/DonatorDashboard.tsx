import React from 'react';
import { Plus, Clock, Award, CalendarCheck } from 'lucide-react';
import { DonationItem, UserProfile, ScreenType } from '../types';

interface DonatorDashboardProps {
  profile: UserProfile;
  donations: DonationItem[];
  onOpenCreate: () => void;
  onEditListing: (item: DonationItem) => void;
  onViewDetails: (item: DonationItem) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const DonatorDashboard: React.FC<DonatorDashboardProps> = ({
  profile,
  donations,
  onOpenCreate,
  onEditListing,
  onViewDetails,
  onNavigate,
}) => {
  const activeListings = donations.filter((d) => d.status === 'available');

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-4 lg:space-y-6 pb-28 pt-2">
      {/* Hero Greeting Card */}
      <section className="bg-[#0a3c1a] text-white rounded-3xl p-6 sm:p-7 lg:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
            Good morning, {(profile.name || 'User').split(' ')[0]}.
          </h1>
          <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-6 max-w-md">
            Your food rescues are making a real difference in the local community today.
          </p>
          <button
            onClick={onOpenCreate}
            className="bg-[#b9f02c] hover:bg-[#c9fb40] text-[#0a3c1a] font-bold text-sm lg:text-base py-3 px-5 lg:py-3.5 lg:px-7 rounded-full inline-flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Listing
          </button>
        </div>
      </section>

      {/* Stats Section — side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {/* Bookings Card */}
        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-gray-100/80 flex items-center justify-between cursor-pointer hover:border-gray-200 transition-colors"
        >
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              BOOKINGS
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl lg:text-2xl font-bold text-[#0a3c1a]">
                View Pending
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
            <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Current Status Card */}
        <div 
          onClick={() => onNavigate('profile')}
          className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-gray-100/80 flex items-center justify-between cursor-pointer hover:border-gray-200 transition-colors"
        >
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              CURRENT STATUS
            </span>
            <div className="text-xl lg:text-2xl font-bold text-[#0a3c1a] mt-0.5">
              Silver Badge
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f4f4f6] text-gray-400 flex items-center justify-center shadow-inner">
            <Award className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <section className="pt-2 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl lg:text-2xl font-bold text-[#0a3c1a] tracking-tight">Active Listings</h2>
          <button
            onClick={() => onNavigate('donations')}
            className="text-xs lg:text-sm font-semibold text-gray-500 hover:text-[#0a3c1a] transition-colors"
          >
            View all
          </button>
        </div>

        {activeListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You have no active listings at the moment.</p>
            <button
              onClick={onOpenCreate}
              className="bg-[#0a3c1a] text-white text-xs font-bold py-2.5 px-5 rounded-full"
            >
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {activeListings.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/90 transition-all hover:shadow-md"
              >
                {/* Image Container with Badge */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-500"
                    onClick={() => onViewDetails(item)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                    Available Now
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3
                      onClick={() => onViewDetails(item)}
                      className="font-bold text-lg text-[#0a3c1a] hover:text-[#166534] cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-xs px-2.5 py-1 rounded-full shrink-0">
                      ~{item.availableQuantity} meals
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.expiresText}</span>
                    </div>
                    <button
                      onClick={() => onEditListing(item)}
                      className="font-bold text-[#0a3c1a] hover:underline px-2 py-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
