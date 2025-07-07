import type { User } from '../types';

/**
 * Enhanced premium user checker with validation and fallbacks
 */
export function isPremiumUser(user: User | null | undefined): boolean {
  // Early returns for null/undefined/guest users
  if (!user) {
    return false;
  }
  
  if (user.uid === 'guest') {
    return false;
  }

  // Check subscription object exists
  if (!user.subscription) {
    console.warn('[Premium Check] User has no subscription object:', user.uid);
    return false;
  }

  const tier = user.subscription.tier;
  
  // Check for premium/pro tiers
  const isPremium = tier === 'premium' || tier === 'pro';
  
  // Additional validation: check if subscription is still valid
  if (isPremium && user.subscription.endDate) {
    const endDate = new Date(user.subscription.endDate);
    const now = new Date();
    const isExpired = endDate < now;
    
    if (isExpired) {
      console.warn('[Premium Check] Subscription expired:', {
        uid: user.uid,
        tier,
        endDate: user.subscription.endDate,
        now: now.toISOString()
      });
      return false;
    }
  }
  
  return isPremium;
}
