import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'signup' | 'login';
  onAuthSuccess: (name: string, email: string) => void;
  onBackToLanding: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signup',
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Replace with real auth API call
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(fullName || 'Sarah Mitchell', email || 'sarah@example.com');
    }, 600);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // TODO: Replace with real Google OAuth
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess('Sarah Mitchell', 'sarah.m@greenmarket.org');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9faf4] to-[#e7e9e3] flex flex-col items-center justify-center p-4 sm:p-6 antialiased">
      {/* Back button */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0a3c1a] transition-colors py-1 px-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="w-full max-w-md bg-white premium-shadow rounded-2xl p-8 sm:p-10 relative overflow-hidden border border-gray-100/50">
        {/* Subtle decorative orb */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#ccf148] rounded-full blur-[40px] opacity-30 pointer-events-none"></div>

        {/* Header / Logo Area */}
        <div className="flex flex-col items-center justify-center mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#0a3c1a] text-[#ccf148] flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00250b] tracking-tight">
              NourishResq
            </h1>
          </div>
          <h2 className="text-lg font-bold text-[#414941] text-center">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#717970]" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl pl-10 pr-4 py-3 bg-[#e3dbca]/30 focus:bg-white text-sm text-[#191c19] border-2 border-transparent focus:border-[#00250b] outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#717970]" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl pl-10 pr-4 py-3 bg-[#e3dbca]/30 focus:bg-white text-sm text-[#191c19] border-2 border-transparent focus:border-[#00250b] outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#717970]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl pl-10 pr-4 py-3 bg-[#e3dbca]/30 focus:bg-white text-sm text-[#191c19] border-2 border-transparent focus:border-[#00250b] outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00250b] hover:bg-[#0a3c1a] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : mode === 'signup' ? (
                'Sign Up'
              ) : (
                'Log In'
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-3 text-[#717970] text-xs font-bold uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#191c19] py-3.5 rounded-xl font-semibold text-sm transition-colors flex justify-center items-center gap-3 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </div>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center relative z-10">
          <p className="text-xs text-[#414941]">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#00250b] font-bold hover:underline"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#00250b] font-bold hover:underline"
                >
                  Create one
                </button>
              </>
            )}
          </p>

          <p className="text-[11px] text-[#717970] px-4 leading-relaxed">
            By signing up, you agree to our{' '}
            <span className="underline hover:text-black cursor-pointer">Terms of Service</span> and{' '}
            <span className="underline hover:text-black cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
