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
  | 'rescuer_map';

export type UserRole = 'donate' | 'rescue';

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: 'Bakery' | 'Produce' | 'Cooked Meals' | 'Dairy & Deli' | 'Pantry';
  mealsCount: number;
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
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  storeAvatarUrl: string;
  organizationName: string;
  verified: boolean;
  memberSince: string;
  mealsDonated: number;
  kgRescued: number;
  currentBadge: string;
  nextBadge: string;
  badgeProgress: number;
  bio: string;
  phone: string;
  address: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'claim' | 'reminder' | 'impact' | 'badge';
}
