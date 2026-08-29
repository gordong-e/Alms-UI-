import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Award, Utensils, Leaf, Info, ExternalLink, MapPin, Phone, Mail, Edit3, Camera, Save, X } from 'lucide-react';
import { UserProfile, ScreenType } from '../types';
import { api } from '../lib/api';

interface ProfileScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onNavigate,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [bio, setBio] = useState(profile.bio || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [businessName, setBusinessName] = useState(profile.organizationName || '');
  
  // Avatar from localStorage
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load local avatar on mount
    const savedAvatar = localStorage.getItem(`avatar_${profile.id}`);
    if (savedAvatar) {
      setLocalAvatar(savedAvatar);
    }
  }, [profile.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalAvatar(base64String);
        localStorage.setItem(`avatar_${profile.id}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateDonatorProfile(profile.id, {
        businessName,
        bio,
        phone,
        address,
      });
      setIsEditing(false);
      // In a real app, we'd trigger a refreshData here to update the global profile state.
      // But for the hackathon, the local state will update on next hard refresh.
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Make sure the database schema is updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = localAvatar || profile.storeAvatarUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 pb-32 pt-2 relative">
      
      {/* Edit Button */}
      {profile.role === 'donate' && !isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-4 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      )}

      {/* Profile Header Block */}
      <div className="flex flex-col items-center text-center">
        {/* Storefront / Donator Circular Image */}
        <div className="relative mb-4">
          <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full p-1 bg-white shadow-md relative group">
            <img
              src={displayAvatar}
              alt={businessName}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white"
              >
                <Camera className="w-8 h-8" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Organization Name with Verified Check */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {isEditing ? (
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="text-xl lg:text-2xl font-bold text-center border-b-2 border-[#0a3c1a] focus:outline-none bg-transparent"
            />
          ) : (
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0a3c1a] tracking-tight">
              {businessName || profile.organizationName}
            </h1>
          )}
          {!isEditing && (
            <span className="w-5 h-5 rounded-full bg-[#84cc16] text-white flex items-center justify-center text-xs shadow-sm">
              <CheckCircle className="w-4 h-4 fill-[#84cc16] text-white" />
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          {profile.role === 'donate' ? 'Verified Donator' : 'Community Rescuer'} • Member since {profile.memberSince}
        </p>

        {/* Badges Progress Row */}
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#b9f02c] p-1 bg-white shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0a3c1a] text-[#b9f02c] flex items-center justify-center">
                  <Award className="w-7 h-7 stroke-[2]" />
                </div>
              </div>
              <span className="absolute -bottom-2 inset-x-0 mx-auto bg-[#0a3c1a] text-[#b9f02c] text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase text-center w-max shadow-sm">
                CURRENT
              </span>
            </div>
            <span className="text-xs font-bold text-[#0a3c1a] mt-3">
              Silver Saver
            </span>
          </div>

          <div className="flex flex-col items-center opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 p-1 bg-white flex items-center justify-center">
              <Award className="w-7 h-7 text-gray-400 stroke-[1.8]" />
            </div>
            <span className="text-xs font-bold text-gray-500 mt-2">
              Gold
            </span>
          </div>
        </div>
      </div>

      {/* Impact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Meals Donated/Received Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute -right-2 inset-y-0 my-auto w-24 h-28 opacity-[0.05] pointer-events-none flex items-center justify-center">
            <Utensils className="w-24 h-24 text-[#0a3c1a]" />
          </div>
          <div className="text-[#0a3c1a] mb-1">
            <Utensils className="w-5 h-5 stroke-[2.2] mx-auto" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider text-gray-400 uppercase">
            MEALS {profile.role === 'donate' ? 'DONATED' : 'RECEIVED'}
          </span>
          <div className="text-4xl font-extrabold text-[#0a3c1a] mt-1 tracking-tight">
            {(profile.role === 'donate' ? profile.mealsDonated : profile.mealsReceived).toLocaleString()}
          </div>
        </div>

        {/* Food Rescued Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute -left-3 inset-y-0 my-auto w-24 h-28 opacity-[0.05] pointer-events-none flex items-center justify-center">
            <Leaf className="w-24 h-24 text-[#0a3c1a]" />
          </div>
          <div className="text-[#0a3c1a] mb-1">
            <Leaf className="w-5 h-5 stroke-[2.2] mx-auto" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider text-gray-400 uppercase">
            FOOD RESCUED
          </span>
          <div className="text-4xl font-extrabold text-[#0a3c1a] mt-1 tracking-tight">
            {(profile.role === 'donate' ? profile.kgSaved : profile.kgRescued).toLocaleString()} <span className="text-2xl font-bold text-gray-500">kg</span>
          </div>
        </div>
      </div>

      {/* About the Donator/Rescuer Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0a3c1a]">
            <div className="w-5 h-5 rounded-full bg-[#0a3c1a] text-white flex items-center justify-center text-xs font-bold">
              i
            </div>
            <h2 className="font-bold text-base text-[#0a3c1a]">
              About
            </h2>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Bio / Description</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9f02c] focus:border-transparent min-h-[100px]"
                placeholder="Tell the community about your mission..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9f02c] focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9f02c] focus:border-transparent"
                  placeholder="123 Market St, City, ST"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-[#0a3c1a] text-white text-sm font-bold rounded-full hover:bg-[#0a3c1a]/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {bio || profile.bio || "No description provided yet."}
            </p>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0a3c1a] shrink-0" />
                <span>{address || profile.address || "Address not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0a3c1a] shrink-0" />
                <span>{phone || profile.phone || "Phone not provided"}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3.5 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
};
