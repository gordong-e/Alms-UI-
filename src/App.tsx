import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, UserRole, DonationItem, UserProfile, DonatorProfile } from './types';
import { api } from './lib/api';
import { supabase } from './lib/supabaseClient';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { DonatorOnboardingScreen } from './components/DonatorOnboardingScreen';
import { LandingScreen } from './components/LandingScreen';
import { DonatorDashboard } from './components/DonatorDashboard';
import { DonationsScreen } from './components/DonationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen } from './components/AuthScreen';
import { ImpactScreen } from './components/ImpactScreen';
import { RescuerMapScreen } from './components/RescuerMapScreen';
import { CreateListingModal } from './components/CreateListingModal';
import { ListingDetailsModal } from './components/ListingDetailsModal';
import { ClaimModal } from './components/ClaimModal';
import { PersonaVerification } from './components/PersonaVerification';
import { BookingsScreen } from './components/BookingsScreen';
import { RescuerQRScreen } from './components/RescuerQRScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [userRole, setUserRole] = useState<UserRole>('donate');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [historyDonations, setHistoryDonations] = useState<DonationItem[]>([]);
  const [donators, setDonators] = useState<DonatorProfile[]>([]);
  
  // Keep mock notifications for UI demonstration, since we don't have a notification table yet
  const [notifications, setNotifications] = useState<any[]>([]); 

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DonationItem | null>(null);
  const [editingItem, setEditingItem] = useState<DonationItem | null>(null);

  // ── Auth & Data Fetching ──

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = async (uid: string) => {
    try {
      const p = await api.getUserProfile(uid);
      setProfile(p);
      setIsAuthenticated(true);

      // Only fetch data relevant to the user's role to minimize DB calls
      // Donators need: their own donations + donators list (for map)
      // Rescuers need: available donations + donators list (for map)
      // Unassigned: nothing yet
      const isDonator = p.role === 'donate' && p.isOnboarded;
      const isRescuer = p.role === 'rescue';

      if (isDonator || isRescuer) {
        const [avail, dons] = await Promise.all([
          api.getAvailableDonations().catch(() => []),
          api.getDonators().catch(() => []),
        ]);
        setDonations(avail);
        setDonators(dons);

        // Only fetch history for donators (rescuers don't need it on initial load)
        if (isDonator) {
          api.getHistoryDonations(uid).then(h => setHistoryDonations(h)).catch(() => {});
        }
      }

      // p._dbRole is set by getUserProfile to avoid an extra DB call
      const dbRole = (p as any)._dbRole;

      if (dbRole && dbRole !== 'UNASSIGNED') {
        setHasSelectedRole(true);
        setUserRole(dbRole === 'DONATOR' ? 'donate' : 'rescue');

        setCurrentScreen(prev => {
          if (['landing', 'login', 'signup'].includes(prev)) {
            if (dbRole === 'RESCUER') return 'rescuer_map';
            return p.isOnboarded ? 'dashboard' : 'donator_onboarding';
          }
          return prev;
        });
      } else {
        setCurrentScreen(prev => {
          if (['landing', 'login', 'signup'].includes(prev)) {
            return 'role_selection';
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("refreshData failed:", err);
      setIsAuthenticated(true);
      setCurrentScreen('role_selection');
    }
  };
  const [showPersona, setShowPersona] = useState(false);

  useEffect(() => {
    if (sessionUser) {
      refreshData(sessionUser.id);
    } else {
      setIsAuthenticated(false);
      setProfile(null);
    }
  }, [sessionUser]);

  // ── Handlers ──

  const handleRoleSelection = async (role: UserRole) => {
    setUserRole(role);
    if (sessionUser) {
      const dbRole = role === 'donate' ? 'DONATOR' : 'RESCUER';
      try {
        await supabase.from('users').update({ role: dbRole }).eq('id', sessionUser.id);
      } catch (err) {
        console.error('handleRoleSelection: failed to update role', err);
      }
      if (profile) {
        setProfile({ ...profile, role: role });
        
        // Moved persona check to handleRoleContinue to prevent popups on selection
      }
    }
  };

  const handleRoleContinue = () => {
    if (userRole === 'rescue' && profile && !profile.personaVerified) {
      setShowPersona(true);
      return; // Do not proceed until verified
    }

    setHasSelectedRole(true);
    if (userRole === 'rescue') {
      setCurrentScreen('rescuer_map');
    } else {
      if (!profile?.isOnboarded) {
        setCurrentScreen('donator_onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    }
  };

  const handleCreateOrUpdateListing = async (itemData: Omit<DonationItem, 'id' | 'createdAt' | 'totalQuantity'> & { availableQuantity: number }) => {
    if (!profile) return;
    
    if (editingItem) {
      // For now we don't have update API logic, skip edit flow to keep simple or just recreate
      setEditingItem(null);
    } else {
      await api.createDonation(profile.id, itemData);
      refreshData(profile.id);
    }
  };

  const handleEditListing = (item: DonationItem) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  const handleViewDetails = (item: DonationItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleSelectDonationForClaim = (item: DonationItem) => {
    setSelectedItem(item);
    setIsClaimOpen(true);
  };

  const handleConfirmClaim = async (item: DonationItem, quantity: number) => {
    if (!profile) return null;
    const claim = await api.claimDonation(item.id, profile.id, quantity);
    refreshData(profile.id);
    
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Collection Booked! 🚚',
        message: `You've booked ${quantity} meal${quantity > 1 ? 's' : ''} from "${item.title}". Scan QR at pickup.`,
        time: 'Just now',
        read: false,
        type: 'claim' as const,
      },
      ...prev,
    ]);

    return claim;
  };

  const handleClaimRescue = (item: DonationItem) => {
    if (profile && !profile.personaVerified) {
      setShowPersona(true);
      return;
    }
    handleConfirmClaim(item, item.availableQuantity);
  };

  const handleOpenCreate = () => {
    if (profile && !profile.personaVerified) {
      setShowPersona(true);
      return;
    }
    setEditingItem(null);
    setIsCreateOpen(true);
  };

  const handleAuthSuccess = (name: string, email: string) => {
    // Session state takes over automatically, we just navigate based on the current state if needed
    if (!hasSelectedRole) {
      setCurrentScreen('role_selection');
    } else {
      if (userRole === 'rescue') {
        setCurrentScreen('rescuer_map');
      } else {
        setCurrentScreen(profile?.isOnboarded ? 'dashboard' : 'donator_onboarding');
      }
    }
  };

  const handleOnboardingComplete = async (onboardingData: Partial<DonatorProfile>) => {
    try {
      await api.onboardDonator(profile!.id, onboardingData);
      const p = await api.getUserProfile(sessionUser.id);
      setProfile(p);
      setHasSelectedRole(true);
      setCurrentScreen('dashboard');

      if (!p.personaVerified) {
        setShowPersona(true);
      }
    } catch (err) {
      console.error('handleOnboardingComplete failed:', err);
      // Still try to navigate — refreshData may have partially succeeded
      await refreshData(profile!.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setProfile(null);
    setSessionUser(null);
    setHasSelectedRole(false);
    setCurrentScreen('landing');
  };

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNavigate = (screen: ScreenType) => {
    const authRequiredScreens: ScreenType[] = ['dashboard', 'donations', 'profile', 'impact', 'bookings', 'rescuer_feed', 'rescuer_map', 'rescuer_qr', 'role_selection', 'donator_onboarding'];
    if (authRequiredScreens.includes(screen) && !isAuthenticated) {
      setCurrentScreen('signup');
      return;
    }
    
    if (screen === 'dashboard' && userRole === 'donate' && !profile?.isOnboarded) {
      setCurrentScreen('donator_onboarding');
      return;
    }
    
    setCurrentScreen(screen);
  };

  // ── Presentation Logic ──

  const showHeader = !['role_selection', 'signup', 'login', 'landing', 'donator_onboarding'].includes(currentScreen);
  const showBottomNav = ['dashboard', 'donations', 'profile', 'impact', 'bookings', 'rescuer_feed', 'rescuer_map', 'rescuer_qr'].includes(currentScreen);
  const headerVariant = currentScreen === 'profile' ? 'profile' : 'standard';

  const getBottomNavVariant = (): 'center-plus' | 'side-plus' => {
    if (userRole === 'rescue') return 'side-plus';
    if (['profile', 'donations'].includes(currentScreen)) return 'side-plus';
    return 'center-plus';
  };

  return (
    <>
      <div className="min-h-screen bg-[#edece8] text-[#191c19] flex flex-col items-center">
        <div className="w-full flex-1 bg-[#fdfaf5] min-h-screen shadow-md transition-all flex flex-col">
        
        {showHeader && profile && (
          <Header
            currentScreen={currentScreen}
            role={userRole}
            profile={profile}
            notifications={notifications}
            onNavigate={handleNavigate}
            onRoleToggle={() => handleRoleSelection(userRole === 'donate' ? 'rescue' : 'donate')}
            onClearNotifications={handleClearNotifications}
            onLogout={handleLogout}
            variant={headerVariant}
          />
        )}

        <main className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full flex-1 flex flex-col"
            >
              {currentScreen === 'landing' && (
                <LandingScreen
                  onNavigate={handleNavigate}
                  onSetRole={handleRoleSelection}
                  onOpenCreate={() => {
                    setEditingItem(null);
                    setIsCreateOpen(true);
                  }}
                />
              )}

              {currentScreen === 'signup' && (
                <AuthScreen
                  initialMode="signup"
                  onAuthSuccess={handleAuthSuccess}
                  onBackToLanding={() => setCurrentScreen('landing')}
                />
              )}

              {currentScreen === 'login' && (
                <AuthScreen
                  initialMode="login"
                  onAuthSuccess={handleAuthSuccess}
                  onBackToLanding={() => setCurrentScreen('landing')}
                />
              )}

              {currentScreen === 'role_selection' && (
                <RoleSelectionScreen
                  selectedRole={userRole}
                  onSelectRole={handleRoleSelection}
                  onContinue={handleRoleContinue}
                  onLogout={handleLogout}
                />
              )}

              {currentScreen === 'donator_onboarding' && profile && (
                <DonatorOnboardingScreen
                  profile={profile}
                  onComplete={handleOnboardingComplete}
                />
              )}

              {currentScreen === 'dashboard' && profile && (
                <DonatorDashboard
                  profile={profile}
                  donations={donations}
                  onOpenCreate={handleOpenCreate}
                  onEditListing={handleEditListing}
                  onViewDetails={handleViewDetails}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'donations' && (
                <DonationsScreen
                  activeDonations={donations}
                  historyDonations={historyDonations}
                  onOpenCreate={handleOpenCreate}
                  onEditListing={handleEditListing}
                  onViewDetails={handleViewDetails}
                />
              )}

              {currentScreen === 'profile' && profile && (
                <ProfileScreen
                  profile={profile}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              )}

              {currentScreen === 'impact' && profile && (
                <ImpactScreen profile={profile} />
              )}

              {currentScreen === 'bookings' && profile && (
                <BookingsScreen profile={profile} />
              )}

              {currentScreen === 'rescuer_map' && (
                <RescuerMapScreen
                  donations={donations}
                  donators={donators}
                  onSelectDonation={handleSelectDonationForClaim}
                />
              )}

              {currentScreen === 'rescuer_feed' && (
                <RescuerMapScreen
                  donations={donations}
                  donators={donators}
                  onSelectDonation={handleSelectDonationForClaim}
                />
              )}

              {currentScreen === 'rescuer_qr' && profile && (
                <RescuerQRScreen
                  profile={profile}
                  onRefreshData={() => refreshData(profile.id)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            userRole={userRole}
            onNavigate={handleNavigate}
            onOpenCreate={handleOpenCreate}
            variant={getBottomNavVariant()}
          />
        )}
      </div>

      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
        }}
        onSaveListing={handleCreateOrUpdateListing}
        profile={profile!}
        initialItem={editingItem}
      />

      <ListingDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        userRole={userRole}
        onClaimRescue={handleClaimRescue}
        onEditListing={handleEditListing}
      />

      <ClaimModal
        isOpen={isClaimOpen}
        onClose={() => {
          setIsClaimOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem!}
        onConfirmClaim={handleConfirmClaim}
      />

      <PersonaVerification 
        isOpen={showPersona}
        onClose={() => setShowPersona(false)}
        onComplete={() => {
          setShowPersona(false);
          if (profile) {
            setProfile({ ...profile, personaVerified: true });
            
            // Automatically proceed to the next screen now that they are verified
            if (currentScreen === 'role_selection' && userRole === 'rescue') {
              setHasSelectedRole(true);
              setCurrentScreen('rescuer_map');
            } else if (isClaimOpen || isCreateOpen) {
              // They were trying to perform an action, they can now retry it
            }
          }
        }}
        profile={profile}
      />
    </div>
    </>
  );
}
