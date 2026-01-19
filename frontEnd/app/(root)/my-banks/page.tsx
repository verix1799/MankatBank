"use client";

import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { deposit, getAccounts, withdraw } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MyBanks = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<{
    accountId: string;
    type: "deposit" | "withdraw";
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<{
    accountId: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  const loadAccounts = async () => {
    const accountsResponse = await getAccounts();
    setAccounts(accountsResponse?.data ?? []);
    setAccountsError(accountsResponse?.error ?? null);
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const accountsResponse = await getAccounts();
      if (!isActive) return;
      setAccounts(accountsResponse?.data ?? []);
      setAccountsError(accountsResponse?.error ?? null);
      setIsLoading(false);
    };

    load().catch((error) => {
      console.error("Failed to load accounts:", error);
      if (isActive) {
        setAccountsError("Unable to load accounts. Please try again.");
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const handleAction = async () => {
    if (!activeAction) return;

    const parsedAmount = Number.parseInt(amount, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setStatus({
        accountId: activeAction.accountId,
        type: "error",
        message: "Enter a valid whole number amount.",
      });
      return;
    }

    const accountId = Number.parseInt(activeAction.accountId, 10);
    if (!Number.isFinite(accountId)) {
      setStatus({
        accountId: activeAction.accountId,
        type: "error",
        message: "Invalid account selected.",
      });
      return;
    }

    try {
      if (activeAction.type === "deposit") {
        await deposit(accountId, parsedAmount);
      } else {
        await withdraw(accountId, parsedAmount);
      }

      setStatus({
        accountId: activeAction.accountId,
        type: "success",
        message: `${activeAction.type === "deposit" ? "Deposit" : "Withdrawal"} successful.`,
      });
      setAmount("");
      setActiveAction(null);
      await loadAccounts();
    } catch (error) {
      console.error("Account update failed:", error);
      setStatus({
        accountId: activeAction.accountId,
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

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
          {isLoading && (
            <p className="text-14 text-gray-500">Loading accounts...</p>
          )}
          {!isLoading && accountsError && (
            <p className="text-14 text-red-500">{accountsError}</p>
          )}
          {!isLoading && !accountsError && accounts.length === 0 && (
            <p className="text-14 text-gray-500">
              No accounts found. Create one in the backend to see it here.
            </p>
          )}
          <div className="flex flex-wrap gap-6">
            {accounts.map((a: Account) => (
              <div key={a.id} className="flex flex-col gap-2">
                <BankCard 
                  account={a}
                  userName={user?.firstName}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-12"
                    onClick={() =>
                      setActiveAction({ accountId: a.id, type: "deposit" })
                    }
                  >
                    Deposit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-12"
                    onClick={() =>
                      setActiveAction({ accountId: a.id, type: "withdraw" })
                    }
                  >
                    Withdraw
                  </Button>
                </div>
                {activeAction?.accountId === a.id && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Amount"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="h-8 w-32 text-12"
                    />
                    <Button
                      type="button"
                      className="h-8 px-3 text-12"
                      onClick={handleAction}
                    >
                      {activeAction.type === "deposit" ? "Confirm" : "Confirm"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-3 text-12"
                      onClick={() => {
                        setActiveAction(null);
                        setAmount("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {status?.accountId === a.id && (
                  <p
                    className={
                      status.type === "success"
                        ? "text-12 text-green-600"
                        : "text-12 text-red-600"
                    }
                  >
                    {status.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyBanks
