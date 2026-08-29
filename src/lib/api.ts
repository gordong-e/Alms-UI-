import { supabase } from './supabaseClient';
import { DonationItem, DonatorProfile, UserProfile } from '../types';

export const api = {
  // --- Users ---
  async getUserProfile(userId: string, retries = 3): Promise<UserProfile> {
    // Use maybeSingle to avoid PGRST116 on 0 rows
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('getUserProfile: error fetching user', userError);
      throw userError;
    }

    if (!userData) {
      if (retries > 0) {
        // Race condition: DB trigger hasn't finished yet
        await new Promise(res => setTimeout(res, 1000));
        return this.getUserProfile(userId, retries - 1);
      }
      // Trigger failed completely — manually upsert so the UI never white-screens
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: user?.email || '',
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Alms User',
          role: 'UNASSIGNED',
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('getUserProfile: upsert fallback failed', insertError);
        // Return a minimal profile so the UI can at least render
        return {
          id: userId,
          name: user?.user_metadata?.name || 'User',
          email: user?.email || '',
          role: 'donate',
          avatarUrl: '',
          storeAvatarUrl: '',
          organizationName: '',
          verified: false,
          memberSince: new Date().toLocaleDateString(),
          mealsDonated: 0,
          kgSaved: 0,
          mealsReceived: 0,
          kgRescued: 0,
          currentBadge: 'Bronze',
          nextBadge: 'Silver',
          badgeProgress: 0,
          bio: '',
          phone: '',
          address: '',
          isOnboarded: false,
        };
      }
      userData = newUser;
    }

    // Fetch donator profile if role is DONATOR
    let donatorData: any = null;
    if (userData.role === 'DONATOR') {
      const { data, error: donatorError } = await supabase
        .from('donators')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!donatorError) {
        donatorData = data;
      }
    }

    const result: any = {
      id: userData.id,
      name: userData.name || donatorData?.business_name || 'User',
      email: userData.email || '',
      role: userData.role === 'DONATOR' ? 'donate' : userData.role === 'RESCUER' ? 'rescue' : 'donate',
      avatarUrl: donatorData?.avatar_url || '',
      storeAvatarUrl: donatorData?.avatar_url || '',
      organizationName: donatorData?.business_name || userData.name || '',
      verified: true,
      personaVerified: !!userData.persona_verified,
      memberSince: userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Recently',
      mealsDonated: donatorData?.meals_donated || 0,
      kgSaved: donatorData?.kg_saved || 0,
      mealsReceived: 0,
      kgRescued: 0,
      currentBadge: 'Silver Saver',
      nextBadge: 'Gold',
      badgeProgress: 75,
      bio: donatorData?.bio || 'Passionate about fighting food waste and feeding the community.',
      phone: donatorData?.phone || '',
      address: donatorData?.address || '',
      isOnboarded: !!donatorData,
      lat: donatorData?.lat,
      lng: donatorData?.lng,
      // Internal: raw DB role so App.tsx doesn't need an extra query
      _dbRole: userData.role,
    };
    return result;
  },

  async markPersonaVerified(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ persona_verified: true })
      .eq('id', userId);
    
    if (error) {
      console.error('markPersonaVerified error:', error);
      throw error;
    }
  },

  async updateDonatorProfile(userId: string, updates: Partial<DonatorProfile>): Promise<void> {
    const { error } = await supabase
      .from('donators')
      .update({
        business_name: updates.businessName,
        bio: updates.bio,
        phone: updates.phone,
        address: updates.address,
      })
      .eq('id', userId);

    if (error) {
      console.error('updateDonatorProfile error:', error);
      throw error;
    }
  },

  async getDonators(): Promise<DonatorProfile[]> {
    const { data, error } = await supabase.from('donators').select('*');
    if (error) {
      console.error('getDonators error:', error);
      return [];
    }
    return (data || []).map((d: any) => ({
      id: d.id,
      businessName: d.business_name || 'Unknown',
      phone: d.phone || '',
      address: d.address || '',
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
      categories: d.categories || [],
      mealsDonated: d.meals_donated || 0,
      kgSaved: d.kg_saved || 0,
      createdAt: d.created_at || '',
    }));
  },

  async onboardDonator(userId: string, profile: Partial<DonatorProfile>): Promise<DonatorProfile> {
    // Use upsert to handle the case where a partial row already exists
    const { data, error } = await supabase
      .from('donators')
      .upsert({
        id: userId,
        business_name: profile.businessName || 'My Business',
        phone: profile.phone || '',
        address: profile.address || '',
        lat: profile.lat || 31.224,
        lng: profile.lng || 75.771,
        categories: profile.categories || [],
      })
      .select()
      .single();

    if (error) {
      console.error('onboardDonator error:', error);
      throw error;
    }

    // Also update user role to DONATOR
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'DONATOR' })
      .eq('id', userId);

    if (roleError) {
      console.error('onboardDonator: failed to update role', roleError);
    }

    return {
      id: data.id,
      businessName: data.business_name || '',
      phone: data.phone || '',
      address: data.address || '',
      lat: data.lat || 31.224,
      lng: data.lng || 75.771,
      categories: data.categories || [],
      mealsDonated: data.meals_donated || 0,
      kgSaved: data.kg_saved || 0,
      createdAt: data.created_at || '',
    };
  },

  // --- Donations ---
  async getAvailableDonations(): Promise<DonationItem[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAvailableDonations error:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title || 'Untitled Donation',
      description: d.description || '',
      category: d.category || 'Bakery',
      totalQuantity: d.total_quantity || 0,
      availableQuantity: d.available_quantity || 0,
      expiresText: 'Expires in 4h',
      hoursLeft: 4,
      imageUrl: d.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: 'available' as const,
      donorName: d.donator?.business_name || 'Unknown Donator',
      location: d.donator?.address || 'Unknown Location',
      createdAt: d.created_at || '',
      pickupWindow: d.pickup_window || 'Today',
      instructions: d.instructions || '',
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
    }));
  },

  async getHistoryDonations(donatorId?: string): Promise<DonationItem[]> {
    let query = supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .in('status', ['CLAIMED', 'PARTIAL', 'EXPIRED', 'CANCELLED'])
      .order('created_at', { ascending: false });

    if (donatorId) {
      query = query.eq('donator_id', donatorId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('getHistoryDonations error:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title || 'Untitled',
      description: d.description || '',
      category: d.category || 'Bakery',
      totalQuantity: d.total_quantity || 0,
      availableQuantity: d.available_quantity || 0,
      expiresText: 'Completed',
      hoursLeft: 0,
      imageUrl: d.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: (d.status || 'claimed').toLowerCase() as any,
      donorName: d.donator?.business_name || 'Unknown Donator',
      location: d.donator?.address || 'Unknown Location',
      createdAt: d.created_at || '',
      pickupWindow: d.pickup_window || 'Past',
      instructions: d.instructions || '',
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
    }));
  },

  async getDonatorDonations(donatorId: string): Promise<DonationItem[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*, donator:donator_id ( business_name, address )')
      .eq('donator_id', donatorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getDonatorDonations error:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title || 'Untitled',
      description: d.description || '',
      category: d.category || 'Bakery',
      totalQuantity: d.total_quantity || 0,
      availableQuantity: d.available_quantity || 0,
      expiresText: (d.status === 'AVAILABLE') ? 'Expires in 4h' : 'Completed',
      hoursLeft: (d.status === 'AVAILABLE') ? 4 : 0,
      imageUrl: d.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: (d.status || 'available').toLowerCase() as any,
      donorName: d.donator?.business_name || 'Unknown Donator',
      location: d.donator?.address || 'Unknown Location',
      createdAt: d.created_at || '',
      pickupWindow: d.pickup_window || 'Today',
      instructions: d.instructions || '',
      lat: d.lat || 31.224,
      lng: d.lng || 75.771,
    }));
  },

  async createDonation(donatorId: string, item: Omit<DonationItem, 'id' | 'createdAt' | 'totalQuantity'> & { availableQuantity: number }): Promise<DonationItem> {
    const { data, error } = await supabase.from('donations').insert({
      donator_id: donatorId,
      title: item.title,
      description: item.description || 'Fresh surplus food ready for pickup.',
      category: item.category || 'Bakery',
      total_quantity: item.availableQuantity || 10,
      available_quantity: item.availableQuantity || 10,
      image_url: item.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      pickup_window: item.pickupWindow || 'Today',
      instructions: item.instructions || '',
      lat: item.lat || 31.224,
      lng: item.lng || 75.771,
      status: 'AVAILABLE',
    }).select('*, donator:donator_id ( business_name, address )').single();

    if (error) {
      console.error('createDonation error:', error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'Bakery',
      totalQuantity: data.total_quantity || 0,
      availableQuantity: data.available_quantity || 0,
      expiresText: 'Expires soon',
      hoursLeft: 4,
      imageUrl: data.image_url || '',
      status: 'available',
      donorName: data.donator?.business_name || '',
      location: data.donator?.address || '',
      createdAt: data.created_at || '',
      pickupWindow: data.pickup_window || '',
      instructions: data.instructions || '',
      lat: data.lat || 31.224,
      lng: data.lng || 75.771,
    };
  },

  async claimDonation(donationId: string, rescuerId: string, claimQuantity: number): Promise<any> {
    // Insert into claims
    const { data, error } = await supabase.from('claims').insert({
      donation_id: donationId,
      rescuer_id: rescuerId,
      claimed_quantity: claimQuantity,
      status: 'PENDING',
    }).select().single();

    if (error) {
      console.error('claimDonation: insert claim error', error);
      throw error;
    }

    // Manually reduce available_quantity and update status
    const { data: donData, error: fetchError } = await supabase
      .from('donations')
      .select('available_quantity')
      .eq('id', donationId)
      .single();

    if (!fetchError && donData) {
      const newQty = Math.max(0, (donData.available_quantity || 0) - claimQuantity);
      const newStatus = newQty === 0 ? 'CLAIMED' : 'AVAILABLE';

      await supabase
        .from('donations')
        .update({ available_quantity: newQty, status: newStatus })
        .eq('id', donationId);
    }

    return data;
  },
};
