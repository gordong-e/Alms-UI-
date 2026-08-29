import React, { useState } from 'react';
import { ScreenType, UserRole, DonationItem, UserProfile } from './types';
import { initialProfile, initialDonations, initialHistoryDonations, initialNotifications } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { LandingScreen } from './components/LandingScreen';
import { DonatorDashboard } from './components/DonatorDashboard';
import { DonationsScreen } from './components/DonationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen } from './components/AuthScreen';
import { ImpactScreen } from './components/ImpactScreen';
import { RescuerFeedScreen } from './components/RescuerFeedScreen';
import { CreateListingModal } from './components/CreateListingModal';
import { ListingDetailsModal } from './components/ListingDetailsModal';
import { ScreenSwitcherBar } from './components/ScreenSwitcherBar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('donate');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [donations, setDonations] = useState<DonationItem[]>(initialDonations);
  const [historyDonations, setHistoryDonations] = useState<DonationItem[]>(initialHistoryDonations);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DonationItem | null>(null);
  const [editingItem, setEditingItem] = useState<DonationItem | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Handlers
  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setProfile((prev) => ({ ...prev, role }));
  };

  const handleRoleContinue = () => {
    if (userRole === 'rescue') {
      setCurrentScreen('rescuer_feed');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleCreateOrUpdateListing = (itemData: Omit<DonationItem, 'id' | 'createdAt'>) => {
    if (editingItem) {
      setDonations((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData } : item
        )
      );
      setEditingItem(null);
    } else {
      const newItem: DonationItem = {
        id: `don-${Date.now()}`,
        createdAt: 'Just now',
        ...itemData,
      };
      setDonations((prev) => [newItem, ...prev]);
      setProfile((prev) => ({
        ...prev,
        mealsDonated: prev.mealsDonated + itemData.mealsCount,
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

  const handleClaimRescue = (item: DonationItem) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, status: 'claimed' } : d))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Rescue Claimed! 🚚',
        message: `You claimed "${item.title}". Directions are now active.`,
        time: 'Just now',
        read: false,
        type: 'claim',
      },
      ...prev,
    ]);
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setProfile((prev) => ({
      ...prev,
      name,
      email,
    }));
    setCurrentScreen('dashboard');
  };

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Determine header and nav presentation
  const showHeader = !['role_selection', 'signup', 'login'].includes(currentScreen);
  const showBottomNav = ['dashboard', 'donations', 'profile', 'impact', 'rescuer_feed'].includes(currentScreen);
  const headerVariant = currentScreen === 'profile' ? 'profile' : 'standard';
  const bottomNavVariant = ['profile', 'donations'].includes(currentScreen) ? 'side-plus' : 'center-plus';

  return (
    <div className="min-h-screen bg-[#edece8] text-[#191c19] flex flex-col items-center">
      {/* Top Preview Switcher Bar for direct reviewer jump to all 6 screens */}
      <div className="w-full">
        <ScreenSwitcherBar
          currentScreen={currentScreen}
          role={userRole}
          onSelectScreen={setCurrentScreen}
          onToggleRole={() => handleRoleSelection(userRole === 'donate' ? 'rescue' : 'donate')}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        />
      </div>

      {/* Main Container: Render full width or framed in mobile device viewport */}
      <div
        className={`w-full flex-1 transition-all ${
          isMobileFrame
            ? 'max-w-[430px] my-6 rounded-[40px] shadow-2xl border-[10px] border-[#1f2937] overflow-hidden bg-[#fdfaf5] min-h-[880px]'
            : 'max-w-md bg-[#fdfaf5] min-h-screen shadow-md'
        }`}
      >
        {/* App Header */}
        {showHeader && (
          <Header
            currentScreen={currentScreen}
            role={userRole}
            profile={profile}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onRoleToggle={() => handleRoleSelection(userRole === 'donate' ? 'rescue' : 'donate')}
            onClearNotifications={handleClearNotifications}
            variant={headerVariant}
          />
        )}

        {/* Screens */}
        <main className="relative">
          {currentScreen === 'role_selection' && (
            <RoleSelectionScreen
              selectedRole={userRole}
              onSelectRole={handleRoleSelection}
              onContinue={handleRoleContinue}
            />
          )}

          {currentScreen === 'landing' && (
            <LandingScreen
              onNavigate={setCurrentScreen}
              onSetRole={handleRoleSelection}
              onOpenCreate={() => {
                setEditingItem(null);
                setIsCreateOpen(true);
              }}
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
              onNavigate={setCurrentScreen}
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
              onNavigate={setCurrentScreen}
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

          {currentScreen === 'impact' && (
            <ImpactScreen profile={profile} />
          )}

          {currentScreen === 'rescuer_feed' && (
            <RescuerFeedScreen
              donations={donations}
              onViewDetails={handleViewDetails}
              onClaimRescue={handleClaimRescue}
            />
          )}
        </main>

        {/* Floating Bottom Navigation */}
        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onOpenCreate={() => {
              setEditingItem(null);
              setIsCreateOpen(true);
            }}
            variant={bottomNavVariant}
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
    </div>
  );
}
