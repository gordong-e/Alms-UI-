import { supabase } from './supabaseClient';
import { DonationItem, DonatorProfile, UserProfile } from '../types';

export const api = {
  // --- Users ---
  async getUserProfile(userId: string, retries = 3): Promise<UserProfile> {
    // Fetch from users table
    const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();
    
    if (userError) {
      if (userError.code === 'PGRST116' && retries > 0) {
        // Race condition: trigger hasn't finished inserting public.users row yet. Wait 500ms and try again.
        await new Promise(res => setTimeout(res, 500));
        return this.getUserProfile(userId, retries - 1);
      }
      throw userError;
    }

    let donatorData = null;
    if (userData.role === 'DONATOR') {
      const { data, error: donatorError } = await supabase.from('donators').select('*').eq('id', userId).maybeSingle();
      if (donatorError) throw donatorError;
      donatorData = data;
    }

    return {
      id: userData.id,
      name: userData.name || donatorData?.business_name || 'User',
      email: userData.email,
      role: userData.role as any,
      avatarUrl: donatorData?.avatarUrl || '', // For now empty strings for mock visuals
      storeAvatarUrl: donatorData?.avatarUrl || '',
      organizationName: donatorData?.business_name || '',
      verified: true,
      memberSince: new Date(userData.created_at).toLocaleDateString(),
      mealsDonated: donatorData?.meals_donated || 0,
      kgSaved: donatorData?.kg_saved || 0,
      mealsReceived: userData.meals_received || 0,
      kgRescued: userData.kg_rescued || 0,
      currentBadge: 'Silver Saver',
      nextBadge: 'Gold',
      badgeProgress: 75,
      bio: '',
      phone: donatorData?.phone || '',
      address: donatorData?.address || '',
      isOnboarded: !!donatorData,
      lat: donatorData?.lat,
      lng: donatorData?.lng,
    };
  },

  async getDonators(): Promise<DonatorProfile[]> {
    const { data, error } = await supabase.from('donators').select('*');
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      businessName: d.business_name,
      phone: d.phone,
      address: d.address,
      lat: d.lat,
      lng: d.lng,
      categories: d.categories,
      mealsDonated: d.meals_donated,
      kgSaved: d.kg_saved,
      createdAt: d.created_at,
    }));
  },

  async onboardDonator(userId: string, profile: Partial<DonatorProfile>): Promise<DonatorProfile> {
    const { data, error } = await supabase.from('donators').insert({
      id: userId,
      business_name: profile.businessName,
      phone: profile.phone,
      address: profile.address,
      lat: profile.lat,
      lng: profile.lng,
      categories: profile.categories || [],
    }).select().single();

    if (error) throw error;
    
    // Also update user role to donator
    await supabase.from('users').update({ role: 'DONATOR' }).eq('id', userId);

    return {
      id: data.id,
      businessName: data.business_name,
      phone: data.phone,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      categories: data.categories,
      mealsDonated: data.meals_donated,
      kgSaved: data.kg_saved,
      createdAt: data.created_at,
    };
  },

  // --- Donations ---
  async getAvailableDonations(): Promise<DonationItem[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      category: d.category,
      totalQuantity: d.total_quantity,
      availableQuantity: d.available_quantity,
      expiresText: `Expires in 4h`, // Simplify for now or calculate from created_at
      hoursLeft: 4,
      imageUrl: d.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: d.status ? d.status.toLowerCase() : 'available',
      donorName: d.donator?.business_name || 'Unknown Donator',
      location: d.donator?.address || 'Unknown Location',
      createdAt: d.created_at,
      pickupWindow: d.pickup_window || 'Today',
      instructions: d.instructions,
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
    }));
  },

  async getHistoryDonations(donatorId?: string): Promise<DonationItem[]> {
    let query = supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .in('status', ['CLAIMED', 'COMPLETED'])
      .order('created_at', { ascending: false });

    if (donatorId) {
      query = query.eq('donator_id', donatorId);
    }
      
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      category: d.category,
      totalQuantity: d.total_quantity,
      availableQuantity: d.available_quantity,
      expiresText: 'Completed',
      hoursLeft: 0,
      imageUrl: d.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: 'completed',
      donorName: d.donator?.business_name || 'Unknown Donator',
      location: d.donator?.address || 'Unknown Location',
      createdAt: d.created_at,
      pickupWindow: d.pickup_window || 'Past',
      instructions: d.instructions,
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
    }));
  },

  async createDonation(donatorId: string, item: Omit<DonationItem, 'id' | 'createdAt' | 'totalQuantity'> & { availableQuantity: number }): Promise<DonationItem> {
    const { data, error } = await supabase.from('donations').insert({
      donator_id: donatorId,
      title: item.title,
      description: item.description,
      category: item.category,
      total_quantity: item.availableQuantity,
      available_quantity: item.availableQuantity,
      image_url: item.imageUrl,
      pickup_window: item.pickupWindow,
      instructions: item.instructions,
      lat: item.lat,
      lng: item.lng,
      status: 'AVAILABLE'
    }).select('*, donator:donator_id ( business_name, address )').single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      totalQuantity: data.total_quantity,
      availableQuantity: data.available_quantity,
      expiresText: 'Expires soon',
      hoursLeft: 4,
      imageUrl: data.image_url,
      status: data.status ? data.status.toLowerCase() as any : 'available',
      donorName: data.donator?.business_name,
      location: data.donator?.address,
      createdAt: data.created_at,
      pickupWindow: data.pickup_window,
      instructions: data.instructions,
      lat: data.lat,
      lng: data.lng,
    };
  },

  async claimDonation(donationId: string, rescuerId: string, claimQuantity: number): Promise<any> {
    // 1. Insert into claims (this will trigger process_donation_claim in DB to reduce quantity)
    const { data, error } = await supabase.from('claims').insert({
      donation_id: donationId,
      rescuer_id: rescuerId,
      claimed_quantity: claimQuantity,
      status: 'PENDING'
    }).select().single();

    if (error) throw error;

    // 2. Fetch the updated donation to return to UI
    const { data: donData, error: donError } = await supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .eq('id', donationId)
      .single();
      
    if (donError) throw donError;

    return {
      id: donData.id,
      title: donData.title,
      description: donData.description,
      category: donData.category,
      totalQuantity: donData.total_quantity,
      availableQuantity: donData.available_quantity,
      status: donData.status ? donData.status.toLowerCase() : 'claimed',
      donorName: donData.donator?.business_name,
      location: donData.donator?.address,
    };
  }
};
