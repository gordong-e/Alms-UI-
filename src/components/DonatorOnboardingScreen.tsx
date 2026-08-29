import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Store, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { DonatorProfile, UserProfile } from '../types';

interface DonatorOnboardingScreenProps {
  profile: UserProfile;
  onComplete: (onboardingData: Partial<DonatorProfile>) => void;
}

export const DonatorOnboardingScreen: React.FC<DonatorOnboardingScreenProps> = ({ profile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const availableCategories = ['Bakery', 'Produce', 'Cooked Meals', 'Dairy & Deli', 'Pantry'];

  const handleToggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    // Simulate API call for geolocation
    setTimeout(() => {
      setLocation({ lat: 31.2240, lng: 75.7708 }); // Center of Phagwara map roughly
      setIsLocating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    onComplete({
      businessName,
      categories,
      lat: location?.lat || 31.2240,
      lng: location?.lng || 75.7708,
    });
  };

  return (
    <div className="flex-1 bg-[#edece8] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="bg-[#0a3c1a] p-6 lg:p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-[#b9f02c] rounded-full mx-auto mb-4 flex items-center justify-center text-[#0a3c1a]">
            <Store className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Set Up Your Profile</h2>
          <p className="text-white/80 text-sm">Join the network and start sharing surplus food.</p>
          
          <div className="flex justify-center gap-2 mt-6">
            <div className={`h-2 rounded-full flex-1 max-w-[40px] transition-colors ${step >= 1 ? 'bg-[#b9f02c]' : 'bg-white/20'}`} />
            <div className={`h-2 rounded-full flex-1 max-w-[40px] transition-colors ${step >= 2 ? 'bg-[#b9f02c]' : 'bg-white/20'}`} />
            <div className={`h-2 rounded-full flex-1 max-w-[40px] transition-colors ${step >= 3 ? 'bg-[#b9f02c]' : 'bg-white/20'}`} />
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-[#0a3c1a] mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Business / Organization Name</label>
                  <div className="relative">
                    <Store className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-[#0a3c1a] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-[#0a3c1a] outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!businessName}
                className="w-full mt-8 bg-[#0a3c1a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0a3c1a]/90 disabled:opacity-50 transition-all"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-[#0a3c1a] mb-2">Location</h3>
              <p className="text-sm text-gray-500 mb-6">Rescuers need to know where to pick up the food.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-colors ${location ? 'bg-[#eaf8d1] text-[#4d6600]' : 'bg-gray-200 text-gray-400'}`}>
                  <MapPin className="w-8 h-8" />
                </div>
                
                {location ? (
                  <>
                    <p className="font-bold text-[#0a3c1a] mb-1">Location Pinned!</p>
                    <p className="text-xs text-gray-500 mb-4">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                    <button onClick={handleGetLocation} className="text-sm font-semibold text-[#0a3c1a] underline">Update Location</button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">We need your coordinates to show you on the rescuer map.</p>
                    <button 
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="bg-[#b9f02c] text-[#0a3c1a] font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-[#c9fb40] transition-colors"
                    >
                      {isLocating ? (
                        <div className="w-4 h-4 border-2 border-[#0a3c1a] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                      {isLocating ? 'Locating...' : 'Get Current Location'}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!location}
                  className="flex-[2] bg-[#0a3c1a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0a3c1a]/90 disabled:opacity-50 transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-[#0a3c1a] mb-2">What do you donate?</h3>
              <p className="text-sm text-gray-500 mb-6">Select the types of food you typically have surplus of.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map(cat => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2 transition-all ${
                        isSelected 
                          ? 'bg-[#eaf8d1] border-[#b9f02c] shadow-sm' 
                          : 'bg-white border-gray-200 hover:border-[#b9f02c]'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#4d6600]' : 'text-gray-300'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-[#4d6600]' : 'text-gray-600'}`}>{cat}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={categories.length === 0}
                  className="flex-[2] bg-[#b9f02c] text-[#0a3c1a] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c9fb40] disabled:opacity-50 transition-all"
                >
                  Complete Setup
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
