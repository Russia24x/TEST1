import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet, TREASURY_ADDRESSES, ABSTRACT_TOKENS, ERC20_ABI } from './WalletContext';

export type PaymentStatus = 'idle' | 'preparing' | 'approving' | 'signing' | 'confirming' | 'success' | 'error';
export type PaymentAsset = 'USDC' | 'WETH' | 'PENGU' | 'WSOL' | 'SOL';

interface PaymentState {
  status: PaymentStatus;
  asset: PaymentAsset | null;
  amount: string;
  txHash: string | null;
  error: string | null;
  sessionExpiry: number | null;
}

interface PaymentContextType {
  payment: PaymentState;
  initiatePayment: (asset: PaymentAsset) => Promise<void>;
  resetPayment: () => void;
}

const initialState: PaymentState = { status: 'idle', asset: null, amount: '1.00', txHash: null, error: null, sessionExpiry: null };
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);
const PAYMENT_AMOUNT = 1_000_000n; // $1.00 USDC (6 decimals)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [payment, setPayment] = useState<PaymentState>(initialState);
  const { wallet, writeContract } = useWallet();

  useEffect(() => {
    const saved = localStorage.getItem('payment_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionExpiry && parsed.sessionExpiry > Date.now()) setPayment(parsed);
        else localStorage.removeItem('payment_session');
      } catch { localStorage.removeItem('payment_session'); }
    }
  }, []);

  useEffect(() => {
    if (payment.status === 'success' && payment.sessionExpiry) {
      localStorage.setItem('payment_session', JSON.stringify(payment));
    }
  }, [payment]);

  const initiatePayment = async (asset: PaymentAsset) => {
    if (!wallet.address || wallet.status !== 'connected') throw new Error('Wallet not connected');
    setPayment(prev => ({ ...prev, status: 'preparing', asset, error: null }));
    try {
      const isEVM = wallet.type === 'abstract';
      const treasuryAddress = isEVM ? TREASURY_ADDRESSES.abstract : TREASURY_ADDRESSES.solana;
      if (isEVM) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPayment(prev => ({ ...prev, status: 'signing' }));
        let txHash: string | null = null;
        const tokenAddress = asset === 'USDC' ? ABSTRACT_TOKENS.USDC : asset === 'WETH' ? ABSTRACT_TOKENS.WETH : '0x9eBe3A824Ca958e4b3Da772D2065518F009CBa62';
        txHash = await writeContract(tokenAddress, ERC20_ABI as any, 'transfer', [treasuryAddress, PAYMENT_AMOUNT]);
        if (!txHash) throw new Error('Transaction failed');
        setPayment(prev => ({ ...prev, status: 'confirming', txHash }));
        await new Promise(resolve => setTimeout(resolve, 3000));
        const sessionExpiry = Date.now() + 86400000;
        setPayment(prev => ({ ...prev, status: 'success', sessionExpiry }));
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPayment(prev => ({ ...prev, status: 'signing' }));
        await new Promise(resolve => setTimeout(resolve, 2000));
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const txHash = Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        setPayment(prev => ({ ...prev, status: 'confirming', txHash }));
        await new Promise(resolve => setTimeout(resolve, 2000));
        const sessionExpiry = Date.now() + 86400000;
        setPayment(prev => ({ ...prev, status: 'success', sessionExpiry }));
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPayment(prev => ({ ...prev, status: 'error', error: error instanceof Error ? error.message : 'Payment failed' }));
    }
  };

  const resetPayment = () => {
    setPayment(initialState);
    localStorage.removeItem('payment_session');
  };

  return (
    <PaymentContext.Provider value={{ payment, initiatePayment, resetPayment }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within PaymentProvider');
  return context;
}

export { TREASURY_ADDRESSES, ABSTRACT_TOKENS };
