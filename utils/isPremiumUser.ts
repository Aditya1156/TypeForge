import type { User } from '../types';

export function isPremiumUser(user: User | null | undefined): boolean {
  if (!user || user.uid === 'guest') return false;
  const tier = user.subscription?.tier;
  return tier === 'premium' || tier === 'pro';
}
