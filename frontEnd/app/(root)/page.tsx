"use client";

import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const Home = () => {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);
  const id = searchParams.get("id");

  const [user, setUser] = useState<User | null>(null);
  const [accountsSummary, setAccountsSummary] = useState<{
    data: Account[];
    totalBanks: number;
    totalCurrentBalance: number;
  } | null>(null);
  const [accountDetails, setAccountDetails] = useState<{
    data: Account | null;
    transactions: Transaction[];
  } | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadAccounts = async () => {
      const accounts = await getAccounts();
      if (!isActive) return;
      setAccountsSummary(accounts);

      const accountsData = accounts?.data ?? [];
      const appwriteItemId = id || accountsData[0]?.appwriteItemId;

      if (!appwriteItemId) {
        setAccountDetails({ data: null, transactions: [] });
        return;
      }

      const account = await getAccount({ appwriteItemId });
      if (!isActive) return;
      setAccountDetails(account);
    };

    loadAccounts().catch((error) => console.error("Failed to load accounts:", error));

    return () => {
      isActive = false;
    };
  }, [id]);

  const accountsData = accountsSummary?.data ?? [];
  const appwriteItemId = useMemo(
    () => id || accountsData[0]?.appwriteItemId,
    [accountsData, id]
  );

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={user?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox 
            accounts={accountsData}
            totalBanks={accountsSummary?.totalBanks ?? 0}
            totalCurrentBalance={accountsSummary?.totalCurrentBalance ?? 0}
          />
        </header>

        <RecentTransactions 
          accounts={accountsData}
          transactions={accountDetails?.transactions ?? []}
          appwriteItemId={appwriteItemId || ""}
          page={currentPage}
        />
      </div>

      <RightSidebar 
        user={user ?? undefined}
        transactions={accountDetails?.transactions ?? []}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  )
}

export default Home
