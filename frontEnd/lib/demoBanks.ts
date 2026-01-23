import { getWallet, setWallet, updateWallet } from "./demoWallet";
// Transfer helpers
export function transferFromBankToWallet(bankId, amount) {
  if (typeof window === 'undefined') return { error: 'No window' };
  const accounts = getAccounts();
  const bank = accounts.find(a => a.id === bankId);
  const wallet = getWallet();
  if (!bank) return { error: 'Bank not found' };
  if (amount <= 0 || amount > 1000) return { error: 'Invalid amount' };
  if (amount > bank.currentBalance) return { error: 'Insufficient bank funds' };
  bank.currentBalance -= amount;
  wallet.balance += amount;
  setAccounts(accounts);
  setWallet(wallet);
  return { bank, wallet };
}

export function transferFromWalletToBank(bankId, amount) {
  if (typeof window === 'undefined') return { error: 'No window' };
  const accounts = getAccounts();
  const bank = accounts.find(a => a.id === bankId);
  const wallet = getWallet();
  if (!bank) return { error: 'Bank not found' };
  if (amount <= 0 || amount > 1000) return { error: 'Invalid amount' };
  if (amount > wallet.balance) return { error: 'Insufficient wallet funds' };
  wallet.balance -= amount;
  bank.currentBalance += amount;
  setAccounts(accounts);
  setWallet(wallet);
  return { bank, wallet };
}
// frontEnd/lib/demoBanks.ts

const DEMO_BANKS = [
  {
    id: 'demo-bos',
    bankName: 'Fake Bank of Scotland',
    masked: '5678',
    currentBalance: 5000,
    currency: 'GBP',
  },
  {
    id: 'demo-barclays',
    bankName: 'Fake Barclays',
    masked: '4242',
    currentBalance: 7500,
    currency: 'GBP',
  },
];

const STORAGE_KEY = 'demo.connectedBanks';

export function getAccounts() {
  if (typeof window === 'undefined') return DEMO_BANKS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_BANKS));
    return DEMO_BANKS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_BANKS));
    return DEMO_BANKS;
  }
}

export function setAccounts(next) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function updateBalance(bankId, delta) {
  if (typeof window === 'undefined') return;
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === bankId);
  if (idx === -1) return;
  accounts[idx] = {
    ...accounts[idx],
    currentBalance: Math.max(0, accounts[idx].currentBalance + delta),
  };
  setAccounts(accounts);
}
