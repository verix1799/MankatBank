
// app/(root)/my-banks/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import HeaderBox from "@/components/HeaderBox";
import BankCard, { DemoBankCard } from "@/components/BankCard";
import { Button } from "@/components/ui/button";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Account = {
  id: string | number;
  name?: string;
  officialName?: string;
  mask?: string | number;
  currentBalance?: number;
  availableBalance?: number;
  currency?: string;
  type?: string;
  subtype?: string;
};

const fakeConnectedBanks = [
  {
    id: "fake-1",
    name: "Fake Bank of Scotland",
    currentBalance: 5000,
    mask: "1234",
  },
  {
    id: "fake-2",
    name: "Fake Barclays",
    currentBalance: 7500,
    mask: "5678",
  },
];

export default function MyBanks() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser() as unknown as User);
  }, []);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const resp = await getAccounts();
        if (!isActive) return;
        setAccounts(resp?.data ?? []);
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  const userName = useMemo(
    () => (user?.firstName ? user.firstName : "Card holder"),
    [user?.firstName]
  );

  return (
    <section className="flex">
      <div className="my-banks mx-auto w-full max-w-6xl px-4 py-8">
        {/* Page header */}
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />

        {/* Connected Banks */}
        <section className="mb-10 rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Connected banks</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your linked institutions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-bank-gradient text-white hover:opacity-95">
                Connect a bank
              </Button>
              <Button variant="outline">See all banks</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fakeConnectedBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBankId(bank.id)}
                className={[
                  "group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition",
                  "hover:shadow-md",
                  selectedBankId === bank.id ? "ring-2 ring-primary" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{bank.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Balance: £{(bank.currentBalance ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <Image
                    src="/icons/connect-bank.svg"
                    width={24}
                    height={24}
                    alt="bank icon"
                    className="opacity-70"
                  />
                </div>
              </button>
            ))}

            {/* See all placeholder */}
            <div className="flex items-center justify-between rounded-xl border border-dashed bg-card p-4 text-muted-foreground">
              <div>
                <div className="text-base font-medium">See all banks</div>
                <div className="text-xs">View connected accounts</div>
              </div>
              <span className="rounded-full border px-2 py-1 text-xs">Coming soon</span>
            </div>
          </div>
        </section>

        {/* Your Cards */}
        <section className="mb-10 rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Your cards</h3>
            <p className="text-sm text-muted-foreground">
              Virtual and physical cards linked to your accounts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.length > 0 ? (
              accounts.slice(0, 2).map((a) => (
                <div key={String(a.id)} className="flex justify-center">
                  <BankCard account={a} userName={userName} />
                </div>
              ))
            ) : (
              <>
                {/* Show a nice demo card as a placeholder */}
                <div className="flex justify-center">
                  <DemoBankCard />
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    No cards yet — connect a bank to get started.
                  </p>
                </div>
              </>
            )}

            {/* Add new card tile */}
            <button
              className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground transition hover:bg-muted/50"
              title="Add new card"
              onClick={() => alert("Add card flow coming soon")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-lg">
                +
              </span>
              <span className="text-sm">Add new card</span>
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Actions</h3>
            <p className="text-sm text-muted-foreground">
              Common operations for your cards and banks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-bank-gradient text-white hover:opacity-95">
              Connect a bank
            </Button>
            <Button variant="outline" disabled>
              Set default
            </Button>
            <Button variant="outline" disabled>
              Remove card
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
