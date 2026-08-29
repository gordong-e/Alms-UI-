import React, { useState } from 'react';
import { X, Clock, Utensils, MapPin, CheckCircle, QrCode, Phone, Share2, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationItem, UserRole } from '../types';

interface ListingDetailsModalProps {
  item: DonationItem | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onClaimRescue?: (item: DonationItem) => void;
  onEditListing?: (item: DonationItem) => void;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  userRole,
  onClaimRescue,
  onEditListing,
}) => {
  const [showQr, setShowQr] = useState(false);
  const [claimed, setClaimed] = useState(item?.status !== 'available');

  if (!isOpen || !item) return null;

  const handleClaim = () => {
    setClaimed(true);
    if (onClaimRescue) onClaimRescue(item);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Header / Hero Image */}
        <div className="relative h-56 sm:h-64 w-full bg-gray-900">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>

          {/* Top Controls */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between">
            <span className="bg-[#b9f02c] text-[#0a3c1a] text-xs font-black px-3 py-1 rounded-full shadow-md">
              {item.category}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-4 inset-x-5 text-white">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
              {item.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
              <span className="flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#b9f02c]" />
                ~{item.availableQuantity} meals
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#b9f02c]" />
                {item.expiresText}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Alert */}
          {claimed ? (
            <div className="bg-[#eaf8d1] border border-[#b9f02c] rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#0a3c1a] shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-[#0a3c1a]">Rescue Claimed &amp; Assigned</p>
                <p className="text-gray-600 mt-0.5">Show the QR code at pickup to verify transfer.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Available for immediate rescue pickup today.</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1.5">
              Item Details
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm bg-[#f9faf4] p-3.5 rounded-2xl border border-gray-100">
              {item.description}
            </p>
          </div>

          {/* Pickup Logistics */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1">
              Pickup Information
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0a3c1a] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-gray-900">{item.donorName}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                  {item.distance && (
                    <span className="text-[11px] text-[#526600] font-semibold">
                      {item.distance}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-gray-50">
                <Clock className="w-4 h-4 text-[#0a3c1a] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-gray-900">Pickup Window</p>
                  <p className="text-xs text-gray-500">{item.pickupWindow}</p>
                </div>
              </div>

              {item.instructions && (
                <div className="pt-2 border-t border-gray-50 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                  <span className="font-bold text-gray-800">Instructions: </span>
                  {item.instructions}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Verification Section */}
          {showQr ? (
            <div className="bg-[#f9faf4] rounded-2xl p-5 text-center border border-gray-100 space-y-3">
              <p className="text-xs font-bold text-[#0a3c1a]">Pickup Verification QR</p>
              <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto shadow-inner flex items-center justify-center border border-gray-200">
                {/* SVG Mock QR */}
                <svg className="w-full h-full text-[#0a3c1a]" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M60 60h10v10h-10z M75 60h15v10h-15z M60 75h20v15h-20z M85 75h5v15h-5z" />
                </svg>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">TOKEN: NR-2024-RESCUE-{item.id.toUpperCase()}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 border border-gray-200"
            >
              <QrCode className="w-4 h-4" />
              Show Pickup QR Code
            </button>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            {userRole === 'rescue' ? (
              !claimed ? (
                <button
                  onClick={handleClaim}
                  className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Claim for Rescue
                  <ArrowRight className="w-4 h-4 text-[#b9f02c]" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full bg-[#b9f02c] text-[#0a3c1a] font-bold py-3.5 rounded-2xl shadow-md text-sm text-center"
                >
                  Done (Ready for Pickup)
                </button>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => {
                    onClose();
                    if (onEditListing) onEditListing(item);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-[#0a3c1a] font-bold py-3 rounded-2xl text-xs sm:text-sm text-center"
                >
                  Edit Listing
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#0a3c1a] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm text-center shadow-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
