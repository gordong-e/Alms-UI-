import React from 'react';
import { ArrowRight, CheckCircle2, Heart, Plus, Truck, Users } from 'lucide-react';
import { HERO_IMAGE, VOLUNTEERS_IMAGE } from '../data/mockData';
import { ScreenType, UserRole } from '../types';

interface LandingScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSetRole: (role: UserRole) => void;
  onOpenCreate: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onNavigate,
  onSetRole,
  onOpenCreate,
}) => {
  return (
    <div className="bg-[#fdfaf5] text-[#1a202c] pb-12 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 pt-2">
        {/* Hero Section — full-width on desktop, taller */}
        <section className="relative rounded-3xl overflow-hidden h-[500px] lg:h-[560px] shadow-lg group">
          <img
            alt="Community food rescue"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={HERO_IMAGE}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 flex flex-col justify-end p-6 lg:p-12">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#0a3c1a] text-[#ccf148] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-white/90 font-bold text-lg tracking-tight">Alms</span>
            </div>

            <h1 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-3 tracking-tight max-w-lg">
              Fight Waste,<br />Feed<br />Community
            </h1>
            <p className="text-white/90 text-sm lg:text-base mb-6 max-w-md leading-relaxed">
              Join the movement to rescue perfectly good food and distribute it to those who need it most.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('signup')}
                className="bg-[#b9f02c] text-[#0a3c1a] font-bold py-3.5 px-6 rounded-full inline-flex items-center justify-center gap-2 w-max shadow-lg hover:bg-[#c9fb40] active:scale-95 transition-all text-sm lg:text-base lg:py-4 lg:px-8"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="text-white/90 font-semibold text-sm hover:text-white underline underline-offset-2 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </section>

        {/* Impact Stats + Donate CTA — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impact Stats */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <div className="w-8 h-8 rounded-full bg-[#b9f02c] flex items-center justify-center text-[#0a3c1a]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" fillRule="evenodd" />
                </svg>
              </div>
              Impact Today
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0a3c1a] mb-1 tracking-tight">2,450 kg</div>
              <div className="text-gray-500 text-sm">Food rescued this week</div>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#b9f02c] w-[75%] rounded-full transition-all duration-1000"></div>
            </div>
          </section>

          {/* Donate CTA Card */}
          <section className="bg-[#0a3c1a] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="mb-4 text-[#b9f02c]">
              <Heart className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-bold mb-1.5">Have food to donate?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Local partners are ready to pick up your surplus. Sign up to start sharing.
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="text-sm font-semibold flex items-center gap-2 hover:text-[#b9f02c] transition-colors group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </section>
        </div>

        {/* How It Works — 3 column grid on desktop */}
        <section className="py-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0a3c1a] mb-2 tracking-tight">How It Works</h2>
            <p className="text-gray-500 text-sm lg:text-base max-w-md mx-auto">
              Connecting abundance with need in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-[#b9f02c] rounded-full flex items-center justify-center mb-4 text-[#0a3c1a] shadow-sm">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-[#0a3c1a] mb-2 text-base">1. Donators Log Surplus</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Restaurants, grocers, and individuals quickly log their extra food for the day — what they have and how much.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-[#b9f02c] rounded-full flex items-center justify-center mb-4 text-[#0a3c1a] shadow-sm">
                <Truck className="w-6 h-6 stroke-[2]" />
              </div>
              <h4 className="font-bold text-[#0a3c1a] mb-2 text-base">2. Rescuers Find & Collect</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Rescuers see nearby donations on a live map, choose what to collect, pick the quantity, and head over to pick it up.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-[#b9f02c] rounded-full flex items-center justify-center mb-4 text-[#0a3c1a] shadow-sm">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h4 className="font-bold text-[#0a3c1a] mb-2 text-base">3. Community Gets Fed</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                The rescued food reaches local pantries, shelters, and communities — nourishing those who need it most.
              </p>
            </div>
          </div>
        </section>

        {/* Why Alms? — two column on desktop */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0a3c1a] mb-3 tracking-tight">Why Alms?</h2>
              <p className="text-gray-600 text-sm lg:text-base mb-6 leading-relaxed">
                We believe solving hunger and reducing environmental impact go hand-in-hand. By bridging the gap between excess and scarcity, we empower communities to support each other sustainably.
              </p>

              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="text-[#0a3c1a] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0a3c1a]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0a3c1a] text-sm">Community Impact</h5>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Directly support local families and shelters in your neighborhood.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <div className="text-[#0a3c1a] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0a3c1a]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0a3c1a] text-sm">Environmental Sustainability</h5>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Reduce greenhouse gas emissions by keeping edible food out of landfills.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <div className="text-[#0a3c1a] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0a3c1a]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0a3c1a] text-sm">Ease of Use</h5>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      An intuitive, mobile-friendly platform designed for speed and simplicity.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <img
              alt="Volunteers packing food"
              className="w-full h-64 lg:h-80 object-cover rounded-3xl shadow-sm"
              src={VOLUNTEERS_IMAGE}
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* Final CTA & Footer */}
        <section className="bg-[#0a3c1a] rounded-3xl p-8 lg:p-12 text-center flex flex-col items-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Make<br />a Difference?
          </h2>
          <p className="text-white/80 text-sm lg:text-base mb-8 max-w-md leading-relaxed">
            Whether you have food to give or time to volunteer, there's a place for you here.
          </p>

          <div className="w-full max-w-md space-y-3 mb-10">
            <button
              onClick={() => onNavigate('signup')}
              className="w-full bg-[#b9f02c] text-[#0a3c1a] font-bold py-4 px-6 rounded-2xl shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Sign Up — It's Free
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-transparent border border-white text-white font-bold py-4 px-6 rounded-2xl hover:bg-white/10 active:scale-[0.99] transition-colors"
            >
              I Already Have an Account
            </button>
          </div>

          <div className="w-full border-t border-white/20 pt-6">
            <p className="text-white/50 text-xs">
              © 2024 Alms. All rights reserved.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
