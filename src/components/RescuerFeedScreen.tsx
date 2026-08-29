import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Utensils, Filter, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { DonationItem } from '../types';

interface RescuerFeedScreenProps {
  donations: DonationItem[];
  onViewDetails: (item: DonationItem) => void;
  onClaimRescue: (item: DonationItem) => void;
}

export const RescuerFeedScreen: React.FC<RescuerFeedScreenProps> = ({
  donations,
  onViewDetails,
  onClaimRescue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = donations.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="px-4 sm:px-6 max-w-lg mx-auto space-y-4 pb-32 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a3c1a] tracking-tight mb-1">
          Available Surplus Food
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Claim food near you and deliver to local partner shelters.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by bakery, produce, item..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs sm:text-sm focus:border-[#0a3c1a] outline-none shadow-xs"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Bakery', 'Produce', 'Cooked Meals'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#0a3c1a] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings List */}
      <div className="space-y-4 pt-1">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/90 transition-all hover:shadow-md"
          >
            <div className="relative h-44 w-full bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-500"
                onClick={() => onViewDetails(item)}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#b9f02c] text-[#0a3c1a] font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                {item.category}
              </div>
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Navigation className="w-3 h-3 text-[#0a3c1a]" />
                {item.distance || '0.8 mi'}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3
                  onClick={() => onViewDetails(item)}
                  className="font-bold text-base text-[#0a3c1a] hover:text-[#166534] cursor-pointer"
                >
                  {item.title}
                </h3>
                <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-xs px-2 py-0.5 rounded-full shrink-0">
                  ~{item.mealsCount} meals
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {item.donorName} • {item.location}
              </p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-[#d9381e] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.expiresText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetails(item)}
                    className="text-xs font-bold text-gray-600 hover:text-[#0a3c1a] px-2 py-1.5"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onClaimRescue(item)}
                    className="bg-[#0a3c1a] hover:bg-[#124b22] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
