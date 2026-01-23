// WalletBalanceBox.tsx
"use client";
import { useEffect, useState } from "react";
import { getWallet } from "@/lib/demoWallet";
import AnimatedCounter from "./AnimatedCounter";

const WalletBalanceBox = () => {
  const [wallet, setWallet] = useState(getWallet());
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWallet(getWallet());
    }
  }, []);
  return (
    <section className="total-balance">
      <div className="flex flex-col gap-6">
        <h2 className="header-2">Current account balance</h2>
        <div className="flex flex-col gap-2">
          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounter amount={wallet.balance} currency="GBP" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletBalanceBox;
