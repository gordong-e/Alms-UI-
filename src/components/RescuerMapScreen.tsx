import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Clock, Utensils, Search, List, Map as MapIcon, Filter, ChevronRight, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DonationItem } from '../types';

interface RescuerMapScreenProps {
  donations: DonationItem[];
  onSelectDonation: (item: DonationItem) => void;
}

// Custom marker icon using inline SVG data URI
const createMarkerIcon = (mealsCount: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <defs>
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path d="M20 50 C20 50 36 32 36 20 C36 11.16 28.84 4 20 4 C11.16 4 4 11.16 4 20 C4 32 20 50 20 50Z" fill="#0a3c1a" filter="url(#shadow)"/>
    <circle cx="20" cy="20" r="12" fill="#b9f02c"/>
    <text x="20" y="24" text-anchor="middle" fill="#0a3c1a" font-size="11" font-weight="800" font-family="sans-serif">${mealsCount}</text>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52],
  });
};

export const RescuerMapScreen: React.FC<RescuerMapScreenProps> = ({
  donations,
  onSelectDonation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const availableDonations = donations.filter((d) => d.status === 'available');

  const filtered = availableDonations.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sort by distance (mocked via parsing distance string)
  const sorted = [...filtered].sort((a, b) => {
    const distA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || '999');
    const distB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || '999');
    return distA - distB;
  });

  // Initialize map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([37.7880, -122.4020], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [viewMode]);

  // Update markers when donations change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for filtered donations
    sorted.forEach((item) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: createMarkerIcon(item.mealsCount),
      }).addTo(map);

      marker.on('click', () => {
        setHighlightedId(item.id);
        // Scroll the list card into view
        const el = document.getElementById(`donation-card-${item.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // Fit bounds if there are markers
    if (sorted.length > 0) {
      const bounds = L.latLngBounds(sorted.map((d) => [d.lat, d.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.3));
    }
  }, [sorted, viewMode]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative">
      {/* Search + Filters bar */}
      <div className="px-4 pt-2 pb-3 space-y-3 bg-[#fdfaf5] z-10 border-b border-gray-100">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0a3c1a] tracking-tight">Nearby Donations</h1>
            <p className="text-[11px] text-gray-500">{sorted.length} available near you</p>
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-[#f0ece1] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#0a3c1a] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#0a3c1a] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, bakery, produce..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs focus:border-[#0a3c1a] outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {['All', 'Bakery', 'Produce', 'Cooked Meals', 'Dairy & Deli', 'Pantry'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0a3c1a] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Map + Bottom card list */
        <div className="flex-1 flex flex-col relative">
          {/* Map container */}
          <div ref={mapContainerRef} className="flex-1 min-h-[280px]" />

          {/* Scrollable donation cards overlay at bottom */}
          <div className="bg-[#fdfaf5] border-t border-gray-200 max-h-[45%] overflow-y-auto">
            <div className="px-4 py-3 space-y-3">
              {sorted.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  No donations found matching your criteria.
                </div>
              ) : (
                sorted.map((item) => (
                  <div
                    key={item.id}
                    id={`donation-card-${item.id}`}
                    onClick={() => onSelectDonation(item)}
                    className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all cursor-pointer active:scale-[0.99] flex gap-3 ${
                      highlightedId === item.id
                        ? 'border-[#b9f02c] ring-2 ring-[#b9f02c]/30 shadow-md'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-[#0a3c1a] truncate">{item.title}</h3>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {item.donorName}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-[10px] px-2 py-0.5 rounded-full">
                          ~{item.mealsCount} meals
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                          <Navigation className="w-3 h-3" />
                          {item.distance || '—'}
                        </span>
                        <span className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          {item.expiresText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-28">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
              <p className="text-sm text-gray-500">No donations found matching your filters.</p>
            </div>
          ) : (
            sorted.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/90 transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
                onClick={() => onSelectDonation(item)}
              >
                <div className="relative h-40 w-full bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#b9f02c] text-[#0a3c1a] font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#0a3c1a]" />
                    {item.distance || '—'}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-base text-[#0a3c1a]">{item.title}</h3>
                    <span className="bg-[#eaf8d1] text-[#4d6600] font-bold text-xs px-2 py-0.5 rounded-full shrink-0">
                      ~{item.mealsCount} meals
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {item.donorName} • {item.location}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.expiresText}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDonation(item);
                      }}
                      className="bg-[#0a3c1a] hover:bg-[#124b22] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-colors"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};
