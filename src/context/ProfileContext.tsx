import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet, TREASURY_OWNERS } from './WalletContext';

interface UserProfile {
  address: string;
  walletType: 'abstract' | 'solana';
  joinDate: string;
  totalPayments: number;
  lastAccess: string;
  isTreasuryOwner: boolean;
}

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { wallet } = useWallet();

  useEffect(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch { console.error('Failed to parse profile'); }
    }
  }, []);

  useEffect(() => {
    if (wallet.status === 'connected' && wallet.address) {
      const saved = localStorage.getItem('user_profile');
      const existingProfile = saved ? JSON.parse(saved) : null;
      if (!existingProfile || existingProfile.address !== wallet.address) {
        const newProfile: UserProfile = {
          address: wallet.address,
          walletType: wallet.type as 'abstract' | 'solana',
          joinDate: new Date().toISOString(),
          totalPayments: 0,
          lastAccess: new Date().toISOString(),
          isTreasuryOwner: TREASURY_OWNERS.includes(wallet.address),
        };
        setProfile(newProfile);
        localStorage.setItem('user_profile', JSON.stringify(newProfile));
      } else {
        const updatedProfile = { ...existingProfile, lastAccess: new Date().toISOString() };
        setProfile(updatedProfile);
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      }
    } else if (wallet.status === 'disconnected') {
      setProfile(null);
    }
  }, [wallet.address, wallet.status, wallet.type]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem('user_profile', JSON.stringify(updated));
    }
  };

  const resetProfile = () => {
    setProfile(null);
    localStorage.removeItem('user_profile');
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
