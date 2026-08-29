import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenType, UserRole, DonationItem, UserProfile, DonatorProfile } from './types';
import { initialProfile, initialDonations, initialHistoryDonations, initialNotifications, initialDonators } from './data/mockData';
import { api } from './lib/api';
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

export default function App() {
  // Auth state — easy to replace with real auth later
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [userRole, setUserRole] = useState<UserRole>('donate');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [donations, setDonations] = useState<DonationItem[]>(initialDonations);
  const [historyDonations, setHistoryDonations] = useState<DonationItem[]>(initialHistoryDonations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [donators, setDonators] = useState<DonatorProfile[]>(initialDonators);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DonationItem | null>(null);
  const [editingItem, setEditingItem] = useState<DonationItem | null>(null);

  // ── Handlers ──

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setProfile((prev) => ({ ...prev, role }));
  };

  const handleRoleContinue = () => {
    setHasSelectedRole(true);
    if (userRole === 'rescue') {
      setCurrentScreen('rescuer_map');
    } else {
      if (!profile.isOnboarded) {
        setCurrentScreen('donator_onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    }
  };

  const handleCreateOrUpdateListing = async (itemData: Omit<DonationItem, 'id' | 'createdAt' | 'totalQuantity'> & { availableQuantity: number }) => {
    if (editingItem) {
      setDonations((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData } : item
        )
      );
      setEditingItem(null);
    } else {
      const newItem = await api.createDonation(itemData);
      setDonations((prev) => [newItem, ...prev]);
      setProfile((prev) => ({
        ...prev,
        mealsDonated: prev.mealsDonated + itemData.availableQuantity,
      }));
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
    const updatedItem = await api.claimDonation(item.id, quantity);
    
    setDonations((prev) =>
      prev.map((d) => (d.id === item.id ? updatedItem : d))
    );
    
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Collection Confirmed! 🚚',
        message: `You're collecting ${quantity} meal${quantity > 1 ? 's' : ''} from "${item.title}". Head to ${item.location}.`,
        time: 'Just now',
        read: false,
        type: 'claim' as const,
      },
      ...prev,
    ]);
  };

  const handleClaimRescue = (item: DonationItem) => {
    handleConfirmClaim(item, item.availableQuantity);
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setProfile((prev) => ({
      ...prev,
      name,
      email,
    }));
    setIsAuthenticated(true);
    // After auth, go to role selection if not yet selected
    if (!hasSelectedRole) {
      setCurrentScreen('role_selection');
    } else {
      // Already picked a role before, go to appropriate screen
      if (userRole === 'rescue') {
        setCurrentScreen('rescuer_map');
      } else {
        setCurrentScreen(profile.isOnboarded ? 'dashboard' : 'donator_onboarding');
      }
    }
  };

  const handleOnboardingComplete = (onboardingData: Partial<DonatorProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...onboardingData,
      isOnboarded: true
    }));
    
    const newDonator: DonatorProfile = {
      id: `donor-${Date.now()}`,
      businessName: onboardingData.businessName || profile.name,
      lat: onboardingData.lat || 31.2240,
      lng: onboardingData.lng || 75.7708,
      categories: onboardingData.categories || [],
      avatarUrl: profile.storeAvatarUrl || profile.avatarUrl
    };
    
    setDonators(prev => [newDonator, ...prev]);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasSelectedRole(false);
    setCurrentScreen('landing');
  };

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNavigate = (screen: ScreenType) => {
    // Guard auth-required screens
    const authRequiredScreens: ScreenType[] = ['dashboard', 'donations', 'profile', 'impact', 'rescuer_feed', 'rescuer_map', 'role_selection', 'donator_onboarding'];
    if (authRequiredScreens.includes(screen) && !isAuthenticated) {
      setCurrentScreen('signup');
      return;
    }
    
    if (screen === 'dashboard' && userRole === 'donate' && !profile.isOnboarded) {
      setCurrentScreen('donator_onboarding');
      return;
    }
    
    setCurrentScreen(screen);
  };

  // ── Presentation Logic ──

  const showHeader = !['role_selection', 'signup', 'login', 'landing', 'donator_onboarding'].includes(currentScreen);
  const showBottomNav = ['dashboard', 'donations', 'profile', 'impact', 'rescuer_feed', 'rescuer_map'].includes(currentScreen);
  const headerVariant = currentScreen === 'profile' ? 'profile' : 'standard';

  // Determine bottom nav variant based on role
  const getBottomNavVariant = (): 'center-plus' | 'side-plus' => {
    if (userRole === 'rescue') return 'side-plus';
    if (['profile', 'donations'].includes(currentScreen)) return 'side-plus';
    return 'center-plus';
  };

  return (
    <>
      <div className="min-h-screen bg-[#edece8] text-[#191c19] flex flex-col items-center">
        {/* Main Container */}
        <div className="w-full flex-1 bg-[#fdfaf5] min-h-screen shadow-md transition-all flex flex-col">
        {/* App Header */}
        {showHeader && (
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

        {/* Screens */}
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
                />
              )}

              {currentScreen === 'donator_onboarding' && (
                <DonatorOnboardingScreen
                  profile={profile}
                  onComplete={handleOnboardingComplete}
                />
              )}

              {currentScreen === 'dashboard' && (
                <DonatorDashboard
                  profile={profile}
                  donations={donations}
                  onOpenCreate={() => {
                    setEditingItem(null);
                    setIsCreateOpen(true);
                  }}
                  onEditListing={handleEditListing}
                  onViewDetails={handleViewDetails}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'donations' && (
                <DonationsScreen
                  activeDonations={donations.filter((d) => d.status === 'available')}
                  historyDonations={historyDonations}
                  onOpenCreate={() => {
                    setEditingItem(null);
                    setIsCreateOpen(true);
                  }}
                  onEditListing={handleEditListing}
                  onViewDetails={handleViewDetails}
                />
              )}

              {currentScreen === 'profile' && (
                <ProfileScreen
                  profile={profile}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'impact' && (
                <ImpactScreen profile={profile} />
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
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation */}
        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            userRole={userRole}
            onNavigate={handleNavigate}
            onOpenCreate={() => {
              setEditingItem(null);
              setIsCreateOpen(true);
            }}
            variant={getBottomNavVariant()}
          />
        )}
      </div>

      {/* Interactive Modals */}
      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
        }}
        onSaveListing={handleCreateOrUpdateListing}
        profile={profile}
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
        item={selectedItem}
        onConfirmClaim={handleConfirmClaim}
      />
    </div>
    </>
  );
}
