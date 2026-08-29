import React, { useState } from 'react';
import { X, Camera, Clock, Utensils, MapPin, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationItem, UserProfile } from '../types';

const BAKERY_IMAGE_1 = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80';
const BAKERY_BASKET_IMAGE = 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80';
const PRODUCE_STAND_IMAGE = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80';
const ROOT_VEGGIE_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveListing: (item: Omit<DonationItem, 'id' | 'createdAt' | 'totalQuantity'> & { availableQuantity: number }) => Promise<void>;
  profile: UserProfile;
  initialItem?: DonationItem | null;
}

const PRESET_IMAGES = [
  { label: 'Bakery Shelves', url: BAKERY_IMAGE_1, cat: 'Bakery' },
  { label: 'Artisan Bread Basket', url: BAKERY_BASKET_IMAGE, cat: 'Bakery' },
  { label: 'Fresh Market Stand', url: PRODUCE_STAND_IMAGE, cat: 'Produce' },
  { label: 'Root Vegetables', url: ROOT_VEGGIE_IMAGE, cat: 'Produce' },
  { label: 'Prepared Catering', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', cat: 'Cooked Meals' },
  { label: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', cat: 'Produce' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSaveListing,
  profile,
  initialItem,
}) => {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [category, setCategory] = useState<DonationItem['category']>(initialItem?.category || 'Bakery');
  const [availableQuantity, setMealsCount] = useState(initialItem?.availableQuantity || 15);
  const [hoursLeft, setHoursLeft] = useState(initialItem?.hoursLeft || 4);
  const [selectedImage, setSelectedImage] = useState(initialItem?.imageUrl || BAKERY_IMAGE_1);
  const [pickupWindow, setPickupWindow] = useState(initialItem?.pickupWindow || 'Today by 4:00 PM');
  const [instructions, setInstructions] = useState(initialItem?.instructions || 'Available at back counter or loading dock.');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveListing({
      title: title.trim(),
      description: description.trim() || 'Fresh surplus food ready for immediate pickup.',
      category,
      availableQuantity: Number(availableQuantity) || 10,
      hoursLeft: Number(hoursLeft) || 4,
      expiresText: `Ends in ${hoursLeft}h`,
      imageUrl: selectedImage,
      status: 'available',
      donorName: profile.organizationName,
      donorAvatar: profile.storeAvatarUrl || profile.avatarUrl,
      location: profile.address,
      distance: '0.8 miles away',
      pickupWindow,
      instructions,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0a3c1a', '#b9f02c', '#ffffff'],
    });

    onClose();
    } catch (error) {
      console.error("Failed to save listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#fdfaf5]">
          <div>
            <h2 className="font-bold text-lg text-[#0a3c1a]">
              {initialItem ? 'Edit Food Listing' : 'Post Surplus Food'}
            </h2>
            <p className="text-xs text-gray-500">
              Share surplus food with local rescuers and shelters
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 text-sm flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-5">
              {/* Category Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Food Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Bakery', 'Produce', 'Cooked Meals', 'Dairy & Deli', 'Pantry'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        category === cat
                          ? 'bg-[#0a3c1a] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Surplus Sourdough Loaves & Croissants"
                  className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description / Contents
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10 sourdough loaves, 8 baguettes baked this morning. Packaged in sanitized bakery crates."
                  className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none"
                />
              </div>

              {/* Meal Count & Expiration Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estimated Meals (~qty)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={availableQuantity}
                      onChange={(e) => setMealsCount(Number(e.target.value))}
                      className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">
                      meals
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Expires In (Hours)
                  </label>
                  <select
                    value={hoursLeft}
                    onChange={(e) => setHoursLeft(Number(e.target.value))}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none text-xs"
                  >
                    <option value={2}>2 hours (Urgent)</option>
                    <option value={4}>4 hours (Recommended)</option>
                    <option value={8}>8 hours (End of day)</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours (Next morning)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Image Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Select Food Photo</span>
                  <span className="text-[11px] text-gray-400 font-normal">Click to choose image</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition-all ${
                        selectedImage === img.url
                          ? 'border-[#0a3c1a] ring-2 ring-[#b9f02c]'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {selectedImage === img.url && (
                        <div className="absolute inset-0 bg-[#0a3c1a]/30 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-[#b9f02c] text-[#0a3c1a] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Window */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pickup Time Window &amp; Instructions
                </label>
                <input
                  type="text"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  placeholder="e.g. Today between 1:00 PM - 4:00 PM"
                  className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none text-xs mb-3"
                />
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Special instructions for rescuer/driver (e.g. Call upon arrival, access via alleyway...)"
                  className="w-full rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0a3c1a] outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 mt-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a3c1a] hover:bg-[#124d23] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#b9f02c]" />
                  {initialItem ? 'Update Listing' : 'Publish Surplus Food Listing'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
