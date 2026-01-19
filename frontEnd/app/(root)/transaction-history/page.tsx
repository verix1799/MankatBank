"use client";

import HeaderBox from '@/components/HeaderBox'
import { Pagination } from '@/components/Pagination';
import TransactionsTable from '@/components/TransactionsTable';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { formatAmount } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const TransactionHistory = () => {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);
  const id = searchParams.get("id");

  const [accountDetails, setAccountDetails] = useState<{
    data: Account | null;
    transactions: Transaction[];
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadAccounts = async () => {
      const accounts = await getAccounts();
      if (!isActive) return;
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

    loadAccounts().catch((error) => console.error("Failed to load account:", error));

    return () => {
      isActive = false;
    };
  }, [id]);

  const account = accountDetails?.data;
  const transactions = accountDetails?.transactions ?? [];

  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  const currentTransactions = useMemo(() => {
    const indexOfLastTransaction = currentPage * rowsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
    return transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  }, [currentPage, transactions]);

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox 
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">{account?.name}</h2>
            <p className="text-14 text-blue-25">
              {account?.officialName}
            </p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● {account?.mask}
            </p>
          </div>
          
          <div className='transactions-account-balance'>
            <p className="text-14">Current balance</p>
            <p className="text-24 text-center font-bold">{formatAmount(account?.currentBalance ?? 0)}</p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          <TransactionsTable 
            transactions={currentTransactions}
          />
            {totalPages > 1 && (
              <div className="my-4 w-full">
                <Pagination totalPages={totalPages} page={currentPage} />
              </div>
            )}
        </section>
      </div>
    </div>
  )
}

export default TransactionHistory
