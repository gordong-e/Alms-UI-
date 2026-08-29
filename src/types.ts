export type ScreenType = 
  | 'role_selection' 
  | 'landing' 
  | 'signup' 
  | 'login' 
  | 'dashboard' 
  | 'donations' 
  | 'profile' 
  | 'impact' 
  | 'rescuer_feed'
  | 'rescuer_map'
  | 'donator_onboarding';

export type UserRole = 'donate' | 'rescue';

export interface DonatorProfile {
  id: string; // References users.id
  businessName: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  avatarUrl?: string; // Stored in users or auth metadata
  mealsDonated: number;
  kgSaved: number;
  createdAt: string;
}

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: 'Bakery' | 'Produce' | 'Cooked Meals' | 'Dairy & Deli' | 'Pantry';
  totalQuantity: number;
  availableQuantity: number;
  expiresText: string;
  hoursLeft: number;
  imageUrl: string;
  status: 'available' | 'claimed' | 'completed';
  donorName: string;
  donorAvatar?: string;
  location: string;
  distance?: string;
  createdAt: string;
  pickupWindow: string;
  instructions?: string;
  rescuingBy?: string;
  lat: number;
  lng: number;
  claimedQuantity?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  storeAvatarUrl: string; // We can derive this if they have a donator profile
  organizationName: string; // Equivalent to businessName
  verified: boolean;
  personaVerified: boolean;
  memberSince: string; // derived from created_at
  mealsDonated: number;
  kgSaved: number; // for donator role
  mealsReceived: number; // for rescuer role
  kgRescued: number; // for rescuer role
  currentBadge: string;
  nextBadge: string;
  badgeProgress: number;
  bio: string;
  phone: string;
  address: string;
  isOnboarded: boolean;
  lat?: number;
  lng?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'claim' | 'reminder' | 'impact' | 'badge';
}
