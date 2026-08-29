import React, { useState } from 'react';
import { Plus, Clock, Utensils, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { DonationItem, ScreenType } from '../types';

interface DonationsScreenProps {
  activeDonations: DonationItem[];
  historyDonations: DonationItem[];
  onOpenCreate: () => void;
  onEditListing: (item: DonationItem) => void;
  onViewDetails: (item: DonationItem) => void;
}

export const DonationsScreen: React.FC<DonationsScreenProps> = ({
  activeDonations,
  historyDonations,
  onOpenCreate,
  onEditListing,
  onViewDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const displayList = activeTab === 'active' ? activeDonations : historyDonations;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-5 pb-32 pt-2">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a3c1a] tracking-tight mb-1">
          My Donations
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Manage your active listings and view past impact.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="bg-[#f0ece1] p-1 rounded-2xl flex items-center max-w-xs shadow-inner">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-white text-[#0a3c1a] shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-white text-[#0a3c1a] shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          History
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm col-span-full">
            <p className="text-sm text-gray-500 mb-4">
              {activeTab === 'active'
                ? 'No active surplus listings right now.'
                : 'No completed donation history yet.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onOpenCreate}
                className="bg-[#0a3c1a] text-white text-xs font-bold py-3 px-6 rounded-full inline-flex items-center gap-2"
              >
              <Plus className="w-4 h-4" />
              Post Food Surplus
              </button>
            )}
          </div>
        ) : (
          displayList.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100/90 transition-all hover:shadow-md"
            >
              {/* Image Container with category pill tag */}
              <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-500"
                  onClick={() => onViewDetails(item)}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#b9f02c] text-[#0a3c1a] font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                  {item.category}
                </div>
                {item.status === 'completed' && (
                  <div className="absolute top-3 right-3 bg-[#0a3c1a] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#b9f02c]" />
                    Rescued
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="mb-3">
                <h2
                  onClick={() => onViewDetails(item)}
                  className="font-bold text-lg text-[#0a3c1a] hover:text-[#166534] cursor-pointer tracking-tight"
                >
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Meta Info Row */}
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-[#0a3c1a]">
                  <Utensils className="w-3.5 h-3.5 text-[#0a3c1a]" />
                  <span>~{item.mealsCount} meals</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5 text-[#d9381e]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.expiresText}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onEditListing(item)}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#0a3c1a] font-bold text-xs sm:text-sm py-3 rounded-2xl transition-colors text-center"
                >
                  Edit
                </button>
                <button
                  onClick={() => onViewDetails(item)}
                  className="w-full bg-[#0a3c1a] hover:bg-[#123e1f] text-white font-bold text-xs sm:text-sm py-3 rounded-2xl shadow-sm transition-colors text-center"
                >
                  Details
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* "+ Create New Donation" link at bottom */}
      <div className="text-center pt-2">
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 font-bold text-sm text-[#0a3c1a] hover:underline px-4 py-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Donation
        </button>
      </div>
    </div>
  );
};
