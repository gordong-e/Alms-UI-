import React from 'react';
import { CheckCircle, Award, Utensils, Leaf, Info, ExternalLink, MapPin, Phone, Mail, Edit3 } from 'lucide-react';
import { UserProfile, ScreenType } from '../types';

interface ProfileScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onEditProfile?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onNavigate,
  onEditProfile,
}) => {
  return (
    <div className="px-4 sm:px-6 max-w-lg mx-auto space-y-6 pb-32 pt-2">
      {/* Profile Header Block */}
      <div className="flex flex-col items-center text-center">
        {/* Storefront / Donator Circular Image */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full p-1 bg-white shadow-md">
            <img
              src={profile.storeAvatarUrl}
              alt={profile.organizationName}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Organization Name with Verified Check */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h1 className="text-2xl font-extrabold text-[#0a3c1a] tracking-tight">
            {profile.organizationName}
          </h1>
          <span className="w-5 h-5 rounded-full bg-[#84cc16] text-white flex items-center justify-center text-xs shadow-sm">
            <CheckCircle className="w-4 h-4 fill-[#84cc16] text-white" />
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Verified Donator • Member since {profile.memberSince}
        </p>

        {/* Badges Progress Row */}
        <div className="flex items-center justify-center gap-8 mt-6">
          {/* Silver Saver (Current) */}
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

          {/* Gold (Next Badge) */}
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
      <div className="space-y-4">
        {/* Meals Donated Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Subtle fork watermark on right */}
          <div className="absolute -right-2 inset-y-0 my-auto w-24 h-28 opacity-[0.05] pointer-events-none flex items-center justify-center">
            <Utensils className="w-24 h-24 text-[#0a3c1a]" />
          </div>

          <div className="text-[#0a3c1a] mb-1">
            <Utensils className="w-5 h-5 stroke-[2.2] mx-auto" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider text-gray-400 uppercase">
            MEALS DONATED
          </span>
          <div className="text-4xl font-extrabold text-[#0a3c1a] mt-1 tracking-tight">
            {profile.mealsDonated.toLocaleString()}
          </div>
        </div>

        {/* Food Rescued Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Subtle leaf watermark on left */}
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
            {profile.kgRescued.toLocaleString()} <span className="text-2xl font-bold text-gray-500">kg</span>
          </div>
        </div>
      </div>

      {/* About the Donator Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-[#0a3c1a]">
          <div className="w-5 h-5 rounded-full bg-[#0a3c1a] text-white flex items-center justify-center text-xs font-bold">
            i
          </div>
          <h2 className="font-bold text-base text-[#0a3c1a]">
            About the Donator
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {profile.bio}
        </p>

        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0a3c1a] shrink-0" />
            <span>{profile.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#0a3c1a] shrink-0" />
            <span>{profile.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
