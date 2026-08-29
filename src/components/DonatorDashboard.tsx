import React, { useEffect, useState } from 'react';
import { Plus, Clock, Utensils, Award, ChevronRight, X, User } from 'lucide-react';
import QRCode from 'react-qr-code';
import { DonationItem, UserProfile, ScreenType } from '../types';
import { api } from '../lib/api';

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
  
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [selectedQrClaim, setSelectedQrClaim] = useState<any | null>(null);

  useEffect(() => {
    const loadPending = async () => {
      const claims = await api.getPendingClaims(profile.id);
      setPendingClaims(claims);
    };
    loadPending();
  }, [profile.id]);

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
        {/* Total Impact Card */}
        <div 
          onClick={() => onNavigate('impact')}
          className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-gray-100/80 flex items-center justify-between cursor-pointer hover:border-gray-200 transition-colors"
        >
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              TOTAL IMPACT
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl lg:text-4xl font-bold text-[#0a3c1a]">
                120
              </span>
              <span className="text-gray-500 text-sm font-medium">meals</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#fdf2e9] text-[#e67e22] flex items-center justify-center shadow-inner">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
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

      {/* Pending Pickups Section */}
      {pendingClaims.length > 0 && (
        <section className="pt-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl lg:text-2xl font-bold text-[#e67e22] tracking-tight">Pending Pickups</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {pendingClaims.map((claim) => (
              <article
                key={claim.id}
                className="bg-white rounded-3xl p-5 shadow-sm border-2 border-orange-100 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#0a3c1a]">{claim.donation?.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      {claim.claimed_quantity} meals claimed
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex flex-shrink-0 items-center justify-center text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium leading-none mb-1">Rescuer</p>
                    <p className="text-sm font-bold text-gray-800 leading-none">{claim.rescuer?.name || 'Unknown'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedQrClaim(claim)}
                  className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3 rounded-2xl transition-colors text-sm shadow-sm"
                >
                  Show Pickup QR Code
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

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

      {/* QR Code Modal */}
      {selectedQrClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <button
              onClick={() => setSelectedQrClaim(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 text-center space-y-4">
              <h3 className="text-xl font-bold text-[#0a3c1a]">Pickup QR Code</h3>
              <p className="text-sm text-gray-500">Ask the rescuer to scan this code when they arrive to confirm the pickup.</p>
              
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block mt-4 mx-auto shadow-sm">
                <QRCode
                  value={JSON.stringify({ type: 'pickup', claimId: selectedQrClaim.id, donationId: selectedQrClaim.donation_id })}
                  size={200}
                  level="H"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mt-4 text-left border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Rescuer Info</p>
                <p className="text-sm font-bold text-gray-800">{selectedQrClaim.rescuer?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-600 mt-0.5">{selectedQrClaim.rescuer?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
