import React, { useEffect, useState } from 'react';
import { Clock, X, User, QrCode, Utensils, CalendarCheck, Package, RefreshCw, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

interface BookingsScreenProps {
  profile: UserProfile;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ profile }) => {
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [selectedQrClaim, setSelectedQrClaim] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmedClaim, setConfirmedClaim] = useState<any | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const claims = await api.getPendingClaims(profile.id);
      setPendingClaims(claims);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Subscribe to realtime updates on the claims table
    const channel = supabase
      .channel('claims_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'claims', filter: `status=eq.PICKED_UP` },
        (payload) => {
          // payload.new contains the updated row
          setPendingClaims((currentClaims) => {
            const updatedClaim = currentClaims.find(c => c.id === payload.new.id);
            if (updatedClaim) {
              // This claim was just picked up!
              setConfirmedClaim(updatedClaim);
              setSelectedQrClaim((currentSelected) => {
                // Close modal if this was the open one
                if (currentSelected?.id === payload.new.id) {
                  return null;
                }
                return currentSelected;
              });
              
              // Fire confetti
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#0a3c1a', '#b9f02c', '#ffffff'],
              });
              
              // Remove it from the pending list
              return currentClaims.filter(c => c.id !== payload.new.id);
            }
            return currentClaims;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  const getTimeAgo = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getETA = (createdAt: string) => {
    const booked = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - booked) / 60000);
    // Estimate: assume ~30min typical pickup window
    const remaining = Math.max(0, 30 - elapsed);
    if (remaining === 0) return 'Arriving any moment';
    return `~${remaining} min`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-32 pt-2">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a3c1a] tracking-tight mb-1">
            Bookings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Pending food pickups from rescuers
          </p>
        </div>
        <button
          onClick={loadBookings}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0a3c1a] hover:border-[#0a3c1a] transition-all active:scale-95"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#0a3c1a] text-white rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#b9f02c]/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#b9f02c] uppercase tracking-wider">
              ACTIVE BOOKINGS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {pendingClaims.length}
              </span>
              <span className="text-white/70 text-sm font-medium">
                pending pickup{pendingClaims.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <CalendarCheck className="w-7 h-7 text-[#b9f02c]" />
          </div>
        </div>
      </div>

      {/* Success Banner (Realtime Update) */}
      {confirmedClaim && (
        <div className="bg-[#eaf8d1] border border-[#b9f02c]/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300 shadow-sm">
          <CheckCircle className="w-6 h-6 text-[#0a3c1a] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0a3c1a]">Collection Confirmed!</p>
            <p className="text-xs text-[#4d6600]">
              <span className="font-bold">{confirmedClaim.rescuer?.name || 'A rescuer'}</span> just picked up <span className="font-bold">{confirmedClaim.claimed_quantity} meals</span> of {confirmedClaim.donation?.title || 'food'}.
            </p>
          </div>
          <button onClick={() => setConfirmedClaim(null)} className="text-[#0a3c1a]/50 hover:text-[#0a3c1a] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-3 border-gray-200 border-t-[#0a3c1a] rounded-full"></div>
        </div>
      ) : pendingClaims.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No active bookings</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            When a rescuer books a collection from your listings, it will appear here with a QR code for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {pendingClaims.map((claim) => (
            <article
              key={claim.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#0a3c1a] truncate">
                      {claim.donation?.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {claim.claimed_quantity} meals
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Booked {getTimeAgo(claim.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {/* Rescuer Info */}
                <div className="bg-gray-50 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0a3c1a]/10 flex items-center justify-center text-[#0a3c1a] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Rescuer</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{claim.rescuer?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">ETA</p>
                    <p className="text-sm font-bold text-orange-600">{getETA(claim.created_at)}</p>
                  </div>
                </div>

                {/* Generate QR Button */}
                <button
                  onClick={() => setSelectedQrClaim(claim)}
                  className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#b9f02c]" />
                  Generate Pickup QR
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <button
              onClick={() => setSelectedQrClaim(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#eaf8d1] text-[#0a3c1a] flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#0a3c1a]">Pickup QR Code</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Show this to the rescuer when they arrive. They'll scan it to confirm the pickup.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 inline-block mx-auto shadow-sm">
                <QRCode
                  value={JSON.stringify({ type: 'pickup', claimId: selectedQrClaim.id, donationId: selectedQrClaim.donation_id })}
                  size={200}
                  level="H"
                  fgColor="#0a3c1a"
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Food</span>
                  <span className="font-bold text-gray-800">{selectedQrClaim.donation?.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Quantity</span>
                  <span className="font-bold text-[#0a3c1a]">{selectedQrClaim.claimed_quantity} meals</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Rescuer</span>
                  <span className="font-bold text-gray-800">{selectedQrClaim.rescuer?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
