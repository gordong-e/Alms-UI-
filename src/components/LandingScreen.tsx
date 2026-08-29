import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Heart, Plus, Truck, Users } from 'lucide-react';
import { HERO_IMAGE, VOLUNTEERS_IMAGE } from '../data/mockData';
import { ScreenType, UserRole } from '../types';
import { HowItWorks } from './ui/how-it-works';
import { RuixenGradientFooter } from './ui/ruixen-gradient-footer';

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: ["Overview", "How it works", "Impact", "Partners"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Community", "Blog", "Contact"],
  },
  { title: "Company", links: ["About", "Careers", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

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
    <div className="bg-[#fdfaf5] text-[#1a202c] min-h-screen flex flex-col relative">
      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 pt-2 pb-12 w-full z-10 relative">
        {/* Hero Section — full-width on desktop, taller */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden h-[500px] lg:h-[560px] shadow-lg group"
        >
          <img
            alt="Community food rescue"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src="/heroimage.jpg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 flex flex-col justify-end p-6 lg:p-12">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Alms logo"
                className="w-9 h-9 rounded-xl object-cover shadow-sm border border-white/30 bg-white/10"
              />
              <span className="text-white/90 font-bold text-lg tracking-tight">Alms</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-3 tracking-tight max-w-lg"
            >
              No Empty Bowls
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/90 text-sm lg:text-base mb-6 max-w-md leading-relaxed"
            >
              Join the movement to rescue perfectly good food and distribute it to those who need it most.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signup')}
                className="bg-[#b9f02c] text-[#0a3c1a] font-bold py-3.5 px-6 rounded-full inline-flex items-center justify-center gap-2 w-max shadow-lg hover:bg-[#c9fb40] transition-all text-sm lg:text-base lg:py-4 lg:px-8"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                onClick={() => onNavigate('login')}
                className="text-white/90 font-semibold text-sm hover:text-white underline underline-offset-2 transition-colors ml-2"
              >
                Log In
              </button>
            </motion.div>
          </div>
        </motion.section>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
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
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "75%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-[#b9f02c] rounded-full"
              />
            </div>
          </section>

          {/* Donate CTA Card */}
          <motion.section 
            whileHover={{ y: -5 }}
            className="bg-[#0a3c1a] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center cursor-pointer"
            onClick={() => onNavigate('signup')}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="mb-4 text-[#b9f02c]">
              <Heart className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-bold mb-1.5">Have food to donate?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Local partners are ready to pick up your surplus. Sign up to start sharing.
            </p>
            <button
              className="text-sm font-semibold flex items-center gap-2 hover:text-[#b9f02c] transition-colors group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.section>
        </motion.div>

        {/* How It Works */}
        <HowItWorks />

        {/* Why Alms? — two column on desktop */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0a3c1a] mb-3 tracking-tight">Why Alms?</h2>
              <p className="text-gray-600 text-sm lg:text-base mb-6 leading-relaxed">
                We believe solving hunger and reducing environmental impact go hand-in-hand. By bridging the gap between excess and scarcity, we empower communities to support each other sustainably.
              </p>

              <ul className="space-y-4">
                {[
                  { title: "Community Impact", desc: "Directly support local families and shelters in your neighborhood." },
                  { title: "Environmental Sustainability", desc: "Reduce greenhouse gas emissions by keeping edible food out of landfills." },
                  { title: "Ease of Use", desc: "An intuitive, mobile-friendly platform designed for speed and simplicity." }
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (idx * 0.1), duration: 0.4 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="text-[#0a3c1a] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-[#0a3c1a]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#0a3c1a] text-sm">{item.title}</h5>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:w-1/2 w-full"
            >
              <img
                alt="Volunteers packing food"
                className="w-full h-64 lg:h-80 object-cover rounded-3xl shadow-sm"
                src={VOLUNTEERS_IMAGE}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA & Footer */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="bg-[#0a3c1a] rounded-3xl p-8 lg:p-12 text-center flex flex-col items-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Make<br />a Difference?
          </h2>
          <p className="text-white/80 text-sm lg:text-base mb-8 max-w-md leading-relaxed">
            Whether you have food to give or time to volunteer, there's a place for you here.
          </p>

          <div className="w-full max-w-md space-y-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('signup')}
              className="w-full bg-[#b9f02c] text-[#0a3c1a] font-bold py-4 px-6 rounded-2xl shadow-sm transition-colors"
            >
              Sign Up — It's Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('login')}
              className="w-full bg-transparent border border-white text-white font-bold py-4 px-6 rounded-2xl transition-colors"
            >
              I Already Have an Account
            </motion.button>
          </div>
        </motion.section>
      </main>

      <RuixenGradientFooter gradientHeight="35vh" className="relative z-10 bg-[#fdfaf5] text-[#1a202c]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-6 border-t border-[#0a3c1a]/10 pt-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-[#0a3c1a]">
                <img src="/logo.png" alt="Alms" className="w-6 h-6 rounded-md shadow-sm border border-[#0a3c1a]/10" />
                <span className="font-bold text-base tracking-tight">
                  Alms
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-gray-500">
                Fighting food waste and feeding communities. Built for speed, impact, and sustainability.
              </p>
 
              <div className="mt-6 flex max-w-xs gap-2">
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="you@email.com"
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1a202c] placeholder:text-gray-400 focus:border-[#b9f02c] focus:ring-2 focus:ring-[#b9f02c]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  className="h-10 shrink-0 rounded-xl bg-[#0a3c1a] px-4 font-bold text-xs uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                >
                  Join
                </button>
              </div>
            </div>
 
            <nav className="grid grid-cols-2 gap-10 font-bold text-xs uppercase tracking-wider sm:grid-cols-4 lg:col-span-4">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-[#0a3c1a]">{col.title}</h3>
                  <ul className="mt-4 flex flex-col gap-3 font-medium normal-case tracking-normal">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-gray-500 transition-colors hover:text-[#0a3c1a]"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
 
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#0a3c1a]/10 pt-6 pb-2 font-bold text-xs uppercase tracking-wider text-gray-400 sm:flex-row">
            <span>© 2026 Alms Foundation</span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#b9f02c]" />
              All systems operational
            </span>
            <span>Made with ♥</span>
          </div>
        </div>
      </RuixenGradientFooter>
    </div>
  );
};
