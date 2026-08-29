import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Clock, Utensils, Search, List, Map as MapIcon, ChevronRight, X } from 'lucide-react';
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
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);

  const USER_LOCATION = { lat: 31.2200, lng: 75.7700 }; // Mock user location in Phagwara

  const availableDonations = donations.filter((d) => d.status === 'available');

  const filtered = availableDonations.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sort by distance
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
    }).setView([31.2240, 75.7708], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add User Location Marker
    const userIcon = L.divIcon({
      html: `<div style="width: 18px; height: 18px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([USER_LOCATION.lat, USER_LOCATION.lng], { icon: userIcon })
      .bindTooltip('Your Location', { direction: 'top', offset: [0, -10] })
      .addTo(map);

    mapRef.current = map;

    // Invalidate size after render to handle flex containers
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [viewMode]);

  // Update markers when donations change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    sorted.forEach((item) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: createMarkerIcon(item.mealsCount),
      }).addTo(map);

      marker.on('click', () => {
        setHighlightedId(item.id);
        const el = document.getElementById(`donation-card-${item.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    if (sorted.length > 0 && !highlightedId) {
      const bounds = L.latLngBounds(sorted.map((d) => [d.lat, d.lng] as [number, number]));
      bounds.extend([USER_LOCATION.lat, USER_LOCATION.lng]);
      map.fitBounds(bounds.pad(0.3));
    }
  }, [sorted, viewMode, highlightedId]);

  // Fetch and draw route when a donation is highlighted
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setRouteInfo(null);

    if (!highlightedId) return;

    const item = donations.find((d) => d.id === highlightedId);
    if (!item) return;

    fetch(`https://router.project-osrm.org/route/v1/driving/${USER_LOCATION.lng},${USER_LOCATION.lat};${item.lng},${item.lat}?overview=full&geometries=geojson`)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const distKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);
          setRouteInfo({ distance: `${distKm} km`, duration: `${durationMins} min` });

          routeLayerRef.current = L.geoJSON(route.geometry, {
            style: {
              color: '#0a3c1a',
              weight: 5,
              opacity: 0.8,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }
          }).addTo(mapRef.current!);

          const bounds = L.latLngBounds([
            [USER_LOCATION.lat, USER_LOCATION.lng],
            [item.lat, item.lng]
          ]);
          mapRef.current.fitBounds(bounds.pad(0.2));
        }
      })
      .catch((err) => console.error('OSRM routing error:', err));
  }, [highlightedId, donations]);

  // Resize map on window resize (for responsive layout changes)
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const DonationCard: React.FC<{ item: DonationItem; compact?: boolean }> = ({ item, compact = false }) => (
    <div
      id={`donation-card-${item.id}`}
      onClick={() => onSelectDonation(item)}
      className={`bg-white rounded-2xl shadow-sm border transition-all cursor-pointer active:scale-[0.99] flex gap-3 ${
        compact ? 'p-3' : 'p-3.5'
      } ${
        highlightedId === item.id
          ? 'border-[#b9f02c] ring-2 ring-[#b9f02c]/30 shadow-md'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className={`rounded-xl overflow-hidden bg-gray-100 shrink-0 ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
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
            {highlightedId === item.id && routeInfo ? routeInfo.distance : item.distance || '—'}
          </span>
          <span className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            {highlightedId === item.id && routeInfo ? `${routeInfo.duration} drive` : item.expiresText}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] relative">
      {/* Search + Filters bar */}
      <div className="px-4 lg:px-6 pt-2 pb-3 space-y-3 bg-[#fdfaf5] z-10 border-b border-gray-100">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#0a3c1a] tracking-tight">Nearby Donations</h1>
            <p className="text-[11px] lg:text-xs text-gray-500">{sorted.length} available near you</p>
          </div>
          {/* View toggle — only show on mobile, desktop always shows side-by-side */}
          <div className="flex items-center bg-[#f0ece1] p-1 rounded-xl lg:hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-white text-[#0a3c1a] shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-[#0a3c1a] shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, bakery, produce..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs focus:border-[#0a3c1a] outline-none shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
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

      {/* === Responsive Map & List Container === */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-0 relative">
        {/* Map Container (Always visible on desktop, toggled on mobile) */}
        <div
          ref={mapContainerRef}
          className={`${viewMode === 'list' ? 'hidden lg:block' : 'block'} flex-1 lg:flex-[3] min-h-[280px] lg:min-h-0 z-0`}
        />

        {/* Small Cards Panel (Desktop side panel OR Mobile bottom panel) */}
        <div
          className={`${
            viewMode === 'list' ? 'hidden lg:flex' : 'flex'
          } flex-col flex-1 lg:flex-[2] max-h-[45%] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-200 bg-[#fdfaf5] z-10`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="hidden lg:block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {sorted.length} donation{sorted.length !== 1 ? 's' : ''} nearby
            </p>
            {sorted.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-sm text-gray-500">
                No donations found matching your criteria.
              </div>
            ) : (
              sorted.map((item) => <DonationCard key={item.id} item={item} compact={true} />)
            )}
          </div>
        </div>

        {/* Large Cards Panel (Mobile List View Only) */}
        <div
          className={`${
            viewMode === 'map' ? 'hidden' : 'block lg:hidden'
          } flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-28 bg-[#edece8]`}
        >
          {sorted.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 mt-4">
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
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
      </div>
    </div>
  );
};
