"use client";

import AnimatedCounter from './AnimatedCounter';
import DoughnutChart from './DoughnutChart';
import { useEffect, useState } from 'react';
import { getWallet } from '@/lib/demoWallet';

const TotalBalanceBox = ({ accounts = [], totalBanks, totalCurrentBalance }: TotalBalanceBoxProps) => {
  const count = accounts.length;
  const [wallet, setWallet] = useState(() => (typeof window !== 'undefined' ? getWallet() : { balance: 0 }));
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWallet(getWallet());
    }
  }, []);
  return (
    <section className="total-balance">
      <div className="total-balance-chart">
        <DoughnutChart accounts={accounts} />
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="header-2">Bank Accounts: {count}</h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">Total Current Balance</p>
          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounter amount={wallet.balance ?? 0} currency="GBP" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TotalBalanceBox
