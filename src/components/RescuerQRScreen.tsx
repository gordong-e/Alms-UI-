import React, { useEffect, useState } from 'react';
import { Camera, Clock, X, CheckCircle, Utensils, MapPin, Navigation, ScanLine, Package, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface RescuerQRScreenProps {
  profile: UserProfile;
  onRefreshData: () => void;
}

export const RescuerQRScreen: React.FC<RescuerQRScreenProps> = ({ profile, onRefreshData }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningClaimId, setScanningClaimId] = useState<string | null>(null);
  const [confirmedClaimId, setConfirmedClaimId] = useState<string | null>(null);
  const [scanError, setScanError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getRescuerBookings(profile.id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load rescuer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [profile.id]);

  // QR Scanner effect
  useEffect(() => {
    if (!scanningClaimId) return;

    const scanner = new Html5QrcodeScanner(
      "rescuer-qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(async (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.type === 'pickup' && data.claimId === scanningClaimId) {
          scanner.clear();
          await api.confirmCollection(scanningClaimId);
          setConfirmedClaimId(scanningClaimId);
          setScanningClaimId(null);
          setScanError('');
          onRefreshData();

          // Remove from local state
          setBookings(prev => prev.filter(b => b.id !== scanningClaimId));

          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#0a3c1a', '#b9f02c', '#ffffff'],
          });
        } else {
          setScanError('QR code does not match this booking.');
        }
      } catch (e) {
        setScanError('Could not read QR code. Try again.');
      }
    }, () => {
      // Ignore continuous scan errors
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanningClaimId]);

  const getTimeAgo = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-32 pt-2">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a3c1a] tracking-tight mb-1">
            My Pickups
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Scan QR codes to confirm food collection
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
              PENDING PICKUPS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {bookings.length}
              </span>
              <span className="text-white/70 text-sm font-medium">
                to collect
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <ScanLine className="w-7 h-7 text-[#b9f02c]" />
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {confirmedClaimId && (
        <div className="bg-[#eaf8d1] border border-[#b9f02c]/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-6 h-6 text-[#0a3c1a] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0a3c1a]">Collection Confirmed!</p>
            <p className="text-xs text-[#4d6600]">The pickup has been verified and the meal count has been updated.</p>
          </div>
          <button onClick={() => setConfirmedClaimId(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-3 border-gray-200 border-t-[#0a3c1a] rounded-full"></div>
        </div>
      ) : bookings.length === 0 && !confirmedClaimId ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No pending pickups</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Book a food collection from the Explore tab, then come here to scan the QR code at pickup.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#0a3c1a] truncate">
                      {booking.donation?.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {booking.claimed_quantity} meals
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Booked {getTimeAgo(booking.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <ScanLine className="w-5 h-5" />
                  </div>
                </div>

                {/* Donator Info */}
                <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#0a3c1a] shrink-0" />
                    <span className="font-bold text-gray-800">{booking.donation?.donator?.business_name || 'Unknown Donator'}</span>
                  </div>
                  {booking.donation?.pickup_window && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-600">Pickup: {booking.donation.pickup_window}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {booking.donation?.lat && booking.donation?.lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${booking.donation.lat},${booking.donation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white border-2 border-[#0a3c1a] text-[#0a3c1a] hover:bg-gray-50 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Directions
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setScanError('');
                      setScanningClaimId(booking.id);
                    }}
                    className="flex-1 bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3 rounded-2xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[#b9f02c]" />
                    Scan QR
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* QR Scanner Modal */}
      {scanningClaimId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <button
              onClick={() => {
                setScanningClaimId(null);
                setScanError('');
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#0a3c1a]">Scan Pickup QR</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Point your camera at the donator's QR code to confirm collection.
                </p>
              </div>
              
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-gray-100 relative bg-black aspect-square">
                <div id="rescuer-qr-reader" className="w-full h-full"></div>
              </div>

              {scanError && (
                <p className="text-red-500 text-sm font-medium bg-red-50 py-2 px-3 rounded-lg">{scanError}</p>
              )}

              {/* Demo fallback */}
              <button
                onClick={async () => {
                  try {
                    await api.confirmCollection(scanningClaimId);
                    setConfirmedClaimId(scanningClaimId);
                    setBookings(prev => prev.filter(b => b.id !== scanningClaimId));
                    setScanningClaimId(null);
                    setScanError('');
                    onRefreshData();
                    confetti({
                      particleCount: 120,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ['#0a3c1a', '#b9f02c', '#ffffff'],
                    });
                  } catch (err) {
                    console.error('Manual confirm failed:', err);
                  }
                }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 underline"
              >
                Simulate Scan (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
