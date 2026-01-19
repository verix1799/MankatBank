"use client";

import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { useEffect, useState } from 'react';

const MyBanks = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadAccounts = async () => {
      const accountsResponse = await getAccounts();
      if (!isActive) return;
      setAccounts(accountsResponse?.data ?? []);
    };

    loadAccounts().catch((error) => console.error("Failed to load accounts:", error));

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className='flex'>
      <div className="my-banks">
        <HeaderBox 
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activites."
        />

        <div className="space-y-4">
          <h2 className="header-2">
            Your cards
          </h2>
          <div className="flex flex-wrap gap-6">
            {accounts.map((a: Account) => (
              <BankCard 
                key={a.id}
                account={a}
                userName={user?.firstName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyBanks
