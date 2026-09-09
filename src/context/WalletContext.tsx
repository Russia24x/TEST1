import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Abstract chain configuration
export const ABSTRACT_CHAIN = {
  id: 2741,
  name: 'Abstract',
  network: 'abstract',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.abs.xyz'] }, public: { http: ['https://api.abs.xyz'] } },
  blockExplorers: { default: { name: 'Abstract Explorer', url: 'https://explorer.abs.xyz' } },
};

// Token addresses
export const ABSTRACT_TOKENS = {
  WETH: '0x3439153EB7AF838Ad19d56E1571FBD09333C2809',
  USDC: '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1',
  USDT: '0x0709F39376dEEe2A2dfC94A58EdEb2Eb9DF012bD',
} as const;

export const SOLANA_TOKENS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  WSOL: 'So11111111111111111111111111111111111111112',
  PENGU: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
} as const;

export const TREASURY_ADDRESSES = {
  abstract: '0x60Df4E186364c3a49A550Aee29Da1d5fe3658818',
  solana: '4WN59xCyUtbnCR1MgTZHiG8XLDNGrKm9FfXAQp7soqrr',
} as const;

export const TREASURY_OWNERS: string[] = [
  TREASURY_ADDRESSES.abstract,
  TREASURY_ADDRESSES.solana,
];

// ERC-20 ABI
export const ERC20_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Window extensions
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    phantom?: { solana?: { connect: () => Promise<{ publicKey: { toString: () => string } }>; disconnect: () => Promise<void>; signMessage: (msg: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>; on: (event: string, cb: (...args: any[]) => void) => void; removeListener: (event: string, cb: (...args: any[]) => void) => void; }; };
    solflare?: { connect: () => Promise<{ publicKey: { toString: () => string } }>; disconnect: () => Promise<void>; signMessage: (msg: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>; on: (event: string, cb: (...args: any[]) => void) => void; removeListener: (event: string, cb: (...args: any[]) => void) => void; };
    backpack?: { solana?: { connect: () => Promise<{ publicKey: { toString: () => string } }>; disconnect: () => Promise<void>; signMessage: (msg: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>; on: (event: string, cb: (...args: any[]) => void) => void; removeListener: (event: string, cb: (...args: any[]) => void) => void; }; };
  }
}

export type WalletType = 'abstract' | 'solana' | null;
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WalletState {
  type: WalletType;
  address: string | null;
  status: WalletStatus;
  chainId: number | null;
  balance: string;
}

interface WalletContextType {
  wallet: WalletState;
  connectAbstract: () => Promise<void>;
  connectSolana: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (to: string, value?: bigint, data?: string) => Promise<string | null>;
  writeContract: (address: string, abi: any[], functionName: string, args: any[]) => Promise<string | null>;
}

const initialState: WalletState = { type: null, address: null, status: 'disconnected', chainId: null, balance: '0' };

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem('wallet_state');
    if (saved) {
      try { setWallet(JSON.parse(saved)); } catch { localStorage.removeItem('wallet_state'); }
    }
  }, []);

  useEffect(() => {
    if (wallet.status === 'connected') {
      localStorage.setItem('wallet_state', JSON.stringify(wallet));
    } else if (wallet.status === 'disconnected') {
      localStorage.removeItem('wallet_state');
    }
  }, [wallet]);

  const connectAbstract = useCallback(async () => {
    setWallet(prev => ({ ...prev, status: 'connecting', type: 'abstract' }));
    try {
      if (!window.ethereum) {
        window.open('https://portal.abs.xyz', '_blank');
        throw new Error('Please install MetaMask or use Abstract Global Wallet');
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) throw new Error('No accounts found');
      const address = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      if (chainId !== ABSTRACT_CHAIN.id) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: `0x${ABSTRACT_CHAIN.id.toString(16)}` }] });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: `0x${ABSTRACT_CHAIN.id.toString(16)}`, chainName: ABSTRACT_CHAIN.name, nativeCurrency: ABSTRACT_CHAIN.nativeCurrency, rpcUrls: ABSTRACT_CHAIN.rpcUrls.default.http, blockExplorerUrls: [ABSTRACT_CHAIN.blockExplorers.default.url] }] });
          } else { throw switchError; }
        }
      }
      const balanceHex = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
      const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setWallet({ type: 'abstract', address, status: 'connected', chainId: ABSTRACT_CHAIN.id, balance });
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) disconnect();
        else setWallet(prev => ({ ...prev, address: accounts[0] }));
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (error) {
      console.error('Failed to connect Abstract wallet:', error);
      setWallet(prev => ({ ...prev, status: 'error', type: null }));
      throw error;
    }
  }, []);

  const connectSolana = useCallback(async () => {
    setWallet(prev => ({ ...prev, status: 'connecting', type: 'solana' }));
    try {
      const providers = [window.phantom?.solana, window.solflare, window.backpack?.solana].filter((p): p is NonNullable<typeof p> => p !== undefined);
      if (providers.length === 0) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('No Solana wallet found. Please install Phantom, Solflare, or Backpack.');
      }
      const provider = providers[0];
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      setWallet({ type: 'solana', address, status: 'connected', chainId: 101, balance: '0.00' });
      provider.on('disconnect', () => disconnect());
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      setWallet(prev => ({ ...prev, status: 'error', type: null }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(initialState);
    localStorage.removeItem('wallet_state');
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (wallet.status !== 'connected' || !wallet.address) throw new Error('Wallet not connected');
    try {
      if (wallet.type === 'abstract' && window.ethereum) {
        return await window.ethereum.request({ method: 'personal_sign', params: [message, wallet.address] });
      } else if (wallet.type === 'solana') {
        const provider = window.phantom?.solana || window.solflare || window.backpack?.solana;
        if (!provider) throw new Error('No Solana wallet found');
        const encodedMessage = new TextEncoder().encode(message);
        const signed = await provider.signMessage(encodedMessage, 'utf8');
        return Array.from(signed.signature).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      return null;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [wallet]);

  const sendTransaction = useCallback(async (to: string, value?: bigint, data?: string): Promise<string | null> => {
    if (wallet.type !== 'abstract' || !window.ethereum || !wallet.address) throw new Error('Abstract wallet not connected');
    try {
      return await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet.address, to, value: value ? `0x${value.toString(16)}` : '0x0', data: data || '0x' }] });
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }, [wallet]);

  const writeContract = useCallback(async (address: string, abi: any[], functionName: string, args: any[]): Promise<string | null> => {
    if (wallet.type !== 'abstract' || !window.ethereum || !wallet.address) throw new Error('Abstract wallet not connected');
    let data = '0x';
    if (functionName === 'transfer' && args.length === 2) {
      const [to, amount] = args;
      data = '0xa9059cbb';
      data += to.slice(2).padStart(64, '0');
      data += BigInt(amount).toString(16).padStart(64, '0');
    }
    try {
      return await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet.address, to: address, data }] });
    } catch (error) {
      console.error('Failed to write contract:', error);
      throw error;
    }
  }, [wallet]);

  return (
    <WalletContext.Provider value={{ wallet, connectAbstract, connectSolana, disconnect, signMessage, sendTransaction, writeContract }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
