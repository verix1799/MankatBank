// frontEnd/lib/demoWallet.ts

const WALLET_KEY = 'demo.wallet';
const WALLET_SEED = {
  id: 'wallet',
  name: 'MankatBank',
  balance: 0,
  currency: 'GBP',
};

export function getWallet() {
  if (typeof window === 'undefined') return WALLET_SEED;
  const raw = localStorage.getItem(WALLET_KEY);
  if (!raw) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(WALLET_SEED));
    return WALLET_SEED;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(WALLET_KEY, JSON.stringify(WALLET_SEED));
    return WALLET_SEED;
  }
}

export function setWallet(next) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WALLET_KEY, JSON.stringify(next));
}

export function updateWallet(delta) {
  if (typeof window === 'undefined') return;
  const wallet = getWallet();
  const next = { ...wallet, balance: Math.max(0, wallet.balance + delta) };
  setWallet(next);
  return next;
}
