import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, MapPin, Clock, Utensils, Navigation, CheckCircle, ArrowRight, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { DonationItem } from '../types';
import { api } from '../lib/api';

interface ClaimModalProps {
  item: DonationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: (item: DonationItem, quantity: number) => Promise<any>;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmClaim,
}) => {
  const [step, setStep] = useState<'select' | 'booked' | 'scanning' | 'confirmed'>('select');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimRecord, setClaimRecord] = useState<any>(null);
  const [scanError, setScanError] = useState('');

  const maxQuantity = item?.availableQuantity || 1;

  const handleConfirm = async () => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      const claim = await onConfirmClaim(item, quantity);
      setClaimRecord(claim);
      setStep('booked');
    } catch (error) {
      console.error("Failed to claim donation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setStep('select');
    setQuantity(1);
    setClaimRecord(null);
    onClose();
  };

  const startScanner = () => {
    setStep('scanning');
  };

  useEffect(() => {
    if (step === 'scanning') {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(async (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'pickup' && data.claimId === claimRecord?.id) {
            scanner.clear();
            await api.confirmCollection(claimRecord.id);
            setStep('confirmed');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#0a3c1a', '#b9f02c', '#ffffff'],
            });
          } else {
            setScanError('Invalid QR code for this pickup.');
          }
        } catch (e) {
          setScanError('Could not read QR code.');
        }
      }, (error) => {
        // ignore continuous scan errors
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [step, claimRecord]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {step === 'select' ? (
          <>
            {/* Header with image */}
            <div className="relative h-44 w-full bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-xl font-bold tracking-tight mb-1">{item.title}</h2>
                <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.donorName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {item.distance || '0.8 mi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Info pills */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#eaf8d1] text-[#4d6600] px-3 py-1.5 rounded-full text-xs font-bold">
                  <Utensils className="w-3.5 h-3.5" />
                  ~{item.availableQuantity} meals available
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {item.expiresText}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="bg-[#f9faf4] rounded-2xl p-5 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  How many meals to collect?
                </label>
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[#0a3c1a] flex items-center justify-center text-gray-600 hover:text-[#0a3c1a] transition-all active:scale-95 shadow-sm"
                  >
                    <Minus className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-[#0a3c1a] tracking-tight tabular-nums">
                      {quantity}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">
                      of {maxQuantity} meals
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[#0a3c1a] flex items-center justify-center text-gray-600 hover:text-[#0a3c1a] transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Quick select buttons */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[1, Math.ceil(maxQuantity / 4), Math.ceil(maxQuantity / 2), maxQuantity].filter((v, i, a) => a.indexOf(v) === i).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuantity(val)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        quantity === val
                          ? 'bg-[#0a3c1a] text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {val === maxQuantity ? 'All' : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup info */}
              <div className="flex items-start gap-3 text-xs text-gray-600 bg-white rounded-xl p-3 border border-gray-100">
                <Clock className="w-4 h-4 text-[#0a3c1a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">Pickup: {item.pickupWindow}</p>
                  {item.instructions && (
                    <p className="text-gray-500 mt-0.5">{item.instructions}</p>
                  )}
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                    Booking...
                  </span>
                ) : (
                  <>
                    Book Collection ({quantity} meal{quantity > 1 ? 's' : ''})
                    <ArrowRight className="w-4 h-4 text-[#b9f02c]" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : step === 'booked' ? (
          /* Booked state */
          <div className="p-8 text-center space-y-5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 stroke-[1.8]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0a3c1a] mb-2">Collection Booked!</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                Head to <span className="font-bold">{item.donorName}</span> to pick up your {quantity} meal{quantity > 1 ? 's' : ''}.
              </p>
            </div>

            <div className="bg-[#f9faf4] rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-[#0a3c1a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">{item.location}</p>
                  <p className="text-gray-500">{item.distance}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white border-2 border-[#0a3c1a] text-[#0a3c1a] hover:bg-gray-50 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <button
                onClick={startScanner}
                className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Camera className="w-4 h-4 text-[#b9f02c]" />
                Scan QR at Pickup
              </button>
            </div>
          </div>
        ) : step === 'scanning' ? (
          <div className="p-6 text-center space-y-5">
            <button
              onClick={() => setStep('booked')}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#0a3c1a] mb-2">Scan QR Code</h2>
            <p className="text-sm text-gray-500 mb-4">Ask the donator to show their QR code to confirm pickup.</p>
            
            <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-gray-100 relative bg-black aspect-square">
              <div id="qr-reader" className="w-full h-full"></div>
            </div>

            {scanError && (
              <p className="text-red-500 text-sm font-medium mt-4 bg-red-50 py-2 px-3 rounded-lg">{scanError}</p>
            )}
            
            {/* Fallback button for demo purposes if camera fails */}
            <button
               onClick={() => {
                 api.confirmCollection(claimRecord.id).then(() => {
                   setStep('confirmed');
                   confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#0a3c1a', '#b9f02c', '#ffffff'] });
                 });
               }}
               className="mt-4 text-xs font-semibold text-gray-400 hover:text-gray-600 underline"
            >
               Simulate Successful Scan (Demo)
            </button>
          </div>
        ) : (
          /* Confirmed state */
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#eaf8d1] text-[#0a3c1a] flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 stroke-[1.8]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0a3c1a] mb-2">Collection Confirmed!</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                You're collecting <span className="font-bold text-[#0a3c1a]">{quantity} meal{quantity > 1 ? 's' : ''}</span> from <span className="font-bold">{item.donorName}</span>.
              </p>
            </div>

            <div className="bg-[#f9faf4] rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-[#0a3c1a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">{item.location}</p>
                  <p className="text-gray-500">{item.distance}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs border-t border-gray-100 pt-3">
                <Clock className="w-4 h-4 text-[#0a3c1a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">{item.pickupWindow}</p>
                  {item.instructions && <p className="text-gray-500">{item.instructions}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0a3c1a] hover:bg-[#124b22] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Navigation className="w-4 h-4 text-[#b9f02c]" />
                Get Directions
              </a>
              <button
                onClick={handleDone}
                className="w-full bg-gray-100 hover:bg-gray-200 text-[#0a3c1a] font-bold py-3 rounded-2xl text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
