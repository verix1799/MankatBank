
"use client";

import React from "react";

type Network = "VISA" | "Mastercard";

export interface BankCardProps {
  // Either pass explicit fields...
  id?: string;
  bankName?: string;
  holderName?: string;
  last4?: string;
  expiry?: string;
  balance?: number;
  network?: Network;
  colorFrom?: string;
  colorTo?: string;

  // ...or pass an account and we'll derive fields:
  account?: {
    id?: string | number;
    name?: string;
    officialName?: string;
    mask?: string | number;
    currentBalance?: number;
    availableBalance?: number;
    currency?: string;
    type?: string;
    subtype?: string;
  };

  userName?: string; // used if holderName not provided
  selected?: boolean;
}

const formatCurrency = (value: number | undefined, currency = "GBP") =>
  typeof value === "number"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value)
    : "—";


const resolveProps = (p: BankCardProps) => {
  // Prefer the account currency; otherwise pick a sensible default.
  // If running in a browser and locale looks GB, default to GBP; else USD.
  let detectedCurrency = "USD";
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const lang = navigator.language?.toLowerCase() ?? "";
    detectedCurrency = lang.includes("en-gb") ? "GBP" : "USD";
  }

  const currency = p.account?.currency ?? detectedCurrency;

  return {
    id: p.id ?? (p.account?.id ? String(p.account.id) : "demo"),
    bankName: p.bankName ?? p.account?.officialName ?? p.account?.name ?? "Your bank",
    holderName: p.holderName ?? p.userName ?? "Card holder",
    last4: p.last4 ?? (p.account?.mask ? String(p.account.mask).slice(-4) : "0000"),
    expiry: p.expiry ?? "12/28",
    balance:
      p.balance ?? p.account?.currentBalance ?? p.account?.availableBalance ?? 0,
    network: p.network ?? "VISA",
    colorFrom: p.colorFrom ?? "#1e3a8a",
    colorTo: p.colorTo ?? "#3b82f6",
    currency,
    selected: p.selected ?? false,
  };
};


const BankCard: React.FC<BankCardProps> = (props) => {
  const {
    bankName,
    holderName,
    last4,
    expiry,
    balance,
    network,
    colorFrom,
    colorTo,
    currency,
    selected,
  } = resolveProps(props);

  return (
    <div
      className={[
        "relative h-48 w-80 cursor-pointer overflow-hidden rounded-xl p-6 text-white shadow-lg transition-transform",
        "hover:scale-105 active:scale-95",
        selected ? "ring-2 ring-blue-500" : "",
      ].join(" ")}
      style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      aria-label={`${bankName} card ending ${last4}`}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{bankName}</h2>
            <p className="text-sm opacity-80">{holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold opacity-80">{network}</p>
          </div>
        </div>

        {/* Chip */}
        <div className="h-8 w-12 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />

        {/* Card number */}
        <div className="text-center">
          <p className="font-mono text-xl tracking-widest">•••• •••• •••• {last4}</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between text-xs">
          <div>
            <p className="opacity-80">Expiry</p>
            <p className="text-sm font-semibold">{expiry}</p>
          </div>
          <div className="text-right">
            <p className="opacity-80">Balance</p>
            <p className="text-lg font-bold">{formatCurrency(balance, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankCard;

export const DemoBankCard = () => (
  <BankCard
    id="demo"
    bankName="MankatBank"
    holderName="Vedic Shiju"
    last4="4242"
    expiry="12/26"
    balance={1234.56}
    network="VISA"
    colorFrom="#1e3a8a"
    colorTo="#3b82f6"
  />
);
