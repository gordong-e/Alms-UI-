import React from 'react';
import { TrendingUp, Utensils, Leaf, Award, ShieldCheck, HeartHandshake, ArrowUpRight, Users, Droplets } from 'lucide-react';
import { UserProfile } from '../types';

interface ImpactScreenProps {
  profile: UserProfile;
}

export const ImpactScreen: React.FC<ImpactScreenProps> = ({ profile }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-32 pt-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a3c1a] tracking-tight mb-1">
          Your Impact
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Tracking your food rescue milestones and environmental savings.
        </p>
      </div>

      {/* Big Hero Impact Card */}
      <div className="bg-[#0a3c1a] text-white rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#b9f02c]/20 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#b9f02c] uppercase tracking-wider">
            LIFETIME RESCUE IMPACT
          </span>
          <span className="bg-white/10 text-white text-[11px] px-2.5 py-1 rounded-full font-semibold">
            Since Jan 2024
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {(profile.role === 'donate' ? profile.mealsDonated : profile.mealsReceived).toLocaleString()}
            </div>
            <p className="text-xs text-white/70 mt-0.5">Meals {profile.role === 'donate' ? 'Distributed' : 'Received'}</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#b9f02c] tracking-tight">
              {(profile.role === 'donate' ? profile.kgSaved : profile.kgRescued).toLocaleString()} <span className="text-xl">kg</span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">Surplus Food Saved</p>
          </div>
          <div className="hidden sm:block">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {Math.round((profile.role === 'donate' ? profile.kgSaved : profile.kgRescued) * 2.5).toLocaleString()}
            </div>
            <p className="text-xs text-white/70 mt-0.5">kg CO₂e Avoided</p>
          </div>
          <div className="hidden sm:block">
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-300 tracking-tight">
              {Math.round(((profile.role === 'donate' ? profile.kgSaved : profile.kgRescued) * 182) / 1000)}K
            </div>
            <p className="text-xs text-white/70 mt-0.5">L Water Conserved</p>
          </div>
        </div>

        {/* Mobile-only environmental stats */}
        <div className="sm:hidden mt-6 pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#b9f02c]" />
            <span>{Math.round((profile.role === 'donate' ? profile.kgSaved : profile.kgRescued) * 2.5).toLocaleString()} kg CO₂e avoided</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-300" />
            <span>{((profile.role === 'donate' ? profile.kgSaved : profile.kgRescued) * 182).toLocaleString()} L water conserved</span>
          </div>
        </div>
      </div>

      {/* Two column layout on desktop: chart + partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Meter */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm lg:text-base text-[#0a3c1a]">Weekly Rescue Activity</h3>
            <span className="text-xs font-bold text-[#526600] bg-[#eaf8d1] px-2 py-0.5 rounded-full">
              +24% vs last week
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-32 lg:h-40 pt-4 px-2">
            {[
              { day: 'Mon', kg: 45, max: 100 },
              { day: 'Tue', kg: 60, max: 100 },
              { day: 'Wed', kg: 85, max: 100 },
              { day: 'Thu', kg: 50, max: 100 },
              { day: 'Fri', kg: 95, max: 100 },
              { day: 'Sat', kg: 70, max: 100 },
              { day: 'Sun', kg: 45, max: 100 },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                <div className="text-[10px] font-bold text-gray-400">{bar.kg}kg</div>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.kg >= 80 ? 'bg-[#0a3c1a]' : 'bg-[#b9f02c]'
                  }`}
                  style={{ height: `${(bar.kg / bar.max) * 100}%` }}
                ></div>
                <span className="text-[11px] font-semibold text-gray-500">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Shelters & Recipients */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold text-sm lg:text-base text-[#0a3c1a]">Verified Community Beneficiaries</h3>
          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Hope Harbor Shelter</p>
                <p className="text-gray-500">420 meals received • 0.8 mi</p>
              </div>
              <span className="font-bold text-[#0a3c1a]">Active Partner</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Eastside Family Kitchen</p>
                <p className="text-gray-500">310 meals received • 1.4 mi</p>
              </div>
              <span className="font-bold text-[#0a3c1a]">Active Partner</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Downtown Youth Community Center</p>
                <p className="text-gray-500">520 meals received • 2.2 mi</p>
              </div>
              <span className="font-bold text-[#0a3c1a]">Active Partner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
