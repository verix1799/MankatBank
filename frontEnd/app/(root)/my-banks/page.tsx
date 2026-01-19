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
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const accountsResponse = await getAccounts();
      if (!isActive) return;
      setAccounts(accountsResponse?.data ?? []);
    };

    load().catch((error) => console.error("Failed to load accounts:", error));

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
