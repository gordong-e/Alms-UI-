import { DonationItem, DonatorProfile } from '../types';
import { initialDonations, initialDonators } from '../data/mockData';

// Simulated latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Mock Database State (in-memory for now)
let dbDonations = [...initialDonations].map(d => ({
  ...d,
  totalQuantity: (d as any).availableQuantity || 15, // Migrating old mock data shape
  availableQuantity: (d as any).availableQuantity || 15,
}));

let dbDonators = [...initialDonators];

export const api = {
  // --- Donators ---
  async getDonators(): Promise<DonatorProfile[]> {
    await delay(300);
    return [...dbDonators];
  },

  async onboardDonator(profile: DonatorProfile): Promise<DonatorProfile> {
    await delay(600);
    dbDonators = [profile, ...dbDonators];
    return profile;
  },

  // --- Donations ---
  async getAvailableDonations(): Promise<any[]> {
    await delay(400);
    return dbDonations.filter(d => d.status === 'available');
  },

  async getHistoryDonations(): Promise<any[]> {
    await delay(400);
    return dbDonations.filter(d => d.status === 'completed');
  },

  async createDonation(item: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    await delay(600);
    const newItem = {
      id: `don-${Date.now()}`,
      createdAt: 'Just now',
      totalQuantity: item.availableQuantity,
      status: 'available',
      ...item,
    };
    dbDonations = [newItem, ...dbDonations];
    return newItem;
  },

  async claimDonation(donationId: string, claimQuantity: number): Promise<any> {
    await delay(800); // Simulate network request
    
    const index = dbDonations.findIndex(d => d.id === donationId);
    if (index === -1) throw new Error("Donation not found");

    const donation = dbDonations[index];

    if (donation.availableQuantity < claimQuantity) {
      throw new Error(`Only ${donation.availableQuantity} items available to claim.`);
    }

    // Reduce available quantity
    const newAvailable = donation.availableQuantity - claimQuantity;
    
    const updatedDonation = {
      ...donation,
      availableQuantity: newAvailable,
      status: newAvailable === 0 ? 'claimed' as const : donation.status,
    };

    dbDonations[index] = updatedDonation;
    return updatedDonation;
  }
};
