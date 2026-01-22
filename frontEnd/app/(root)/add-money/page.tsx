"use client";

import HeaderBox from "@/components/HeaderBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BankOption = {
  id: string;
  name: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
};

const AddMoneyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeBank, setActiveBank] = useState<BankOption | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  const reference = useMemo(() => {
    if (user?.email) {
      const handle = user.email.split("@")[0]?.toUpperCase();
      return `MKTB-${handle}`;
    }

    return "MKTB-REFERENCE";
  }, [user?.email]);

  const bankOptions: BankOption[] = [
    {
      id: "bos",
      name: "Fake Bank of Scotland",
      accountName: "MankatBank Top Ups",
      sortCode: "12-34-56",
      accountNumber: "12345678",
    },
    {
      id: "barclays",
      name: "Fake Barclays",
      accountName: "MankatBank Top Ups",
      sortCode: "20-30-40",
      accountNumber: "87654321",
    },
  ];

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);

    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
    }, 2000);
  };

  return (
    <section className="flex min-h-screen flex-col gap-8 bg-gray-25 p-8 xl:py-12">
      <HeaderBox
        title="Add Money"
        subtext="Choose how you want to top up your MankatBank balance."
      />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="header-2">Bank transfer</h2>
            <p className="text-14 text-gray-600">
              Transfer money from your bank account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bankOptions.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => setActiveBank(bank)}
                className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-16 font-semibold text-gray-900">
                  {bank.name}
                </span>
                <span className="text-14 text-gray-500">Tap for details</span>
              </button>
            ))}

            <Link
              href="/my-banks"
              className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-left transition hover:border-gray-400"
            >
              <span className="text-16 font-semibold text-gray-900">
                See all banks
              </span>
              <span className="text-14 text-gray-500">
                View connected accounts
              </span>
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="header-2">Deposit</h2>
            <p className="text-14 text-gray-600">
              Bring in cash or cheques at a local branch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { id: "cash", label: "Cash deposit" },
              { id: "cheque", label: "Cheque deposit" },
            ].map((deposit) => (
              <button
                key={deposit.id}
                type="button"
                onClick={() => setComingSoon(deposit.label)}
                className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-16 font-semibold text-gray-900">
                  {deposit.label}
                </span>
                <span className="text-14 text-gray-500">Coming soon</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="header-2">Other ways to add money</h2>
            <p className="text-14 text-gray-600">
              Additional top up methods are on the way.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Add money",
              "From another MankatBank account",
              "International bank transfer",
            ].map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left text-gray-500 opacity-70"
              >
                <span className="text-16 font-semibold text-gray-700">
                  {label}
                </span>
                <span className="text-12 font-semibold uppercase tracking-wide text-gray-400">
                  Coming soon
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {activeBank ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-20 font-semibold text-gray-900">
                  {activeBank.name}
                </h3>
                <p className="text-14 text-gray-600">
                  Use these details to make a bank transfer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBank(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-12 font-semibold text-gray-600 transition hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: "Account name", value: activeBank.accountName },
                { label: "Sort code", value: activeBank.sortCode },
                { label: "Account number", value: activeBank.accountNumber },
                { label: "Reference", value: reference },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-12 uppercase tracking-wide text-gray-500">
                        {field.label}
                      </p>
                      <p className="text-16 font-semibold text-gray-900">
                        {field.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(field.value, field.label)}
                      className="rounded-full border border-gray-300 px-3 py-1 text-12 font-semibold text-gray-700 transition hover:border-gray-400"
                    >
                      Copy
                    </button>
                  </div>
                  {copiedField === field.label ? (
                    <span className="text-12 font-medium text-green-600">
                      Copied
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {comingSoon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-20 font-semibold text-gray-900">
              {comingSoon}
            </h3>
            <p className="mt-2 text-14 text-gray-600">
              Coming soon
            </p>
            <button
              type="button"
              onClick={() => setComingSoon(null)}
              className="mt-6 w-full rounded-full border border-gray-300 px-4 py-2 text-14 font-semibold text-gray-700 transition hover:border-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AddMoneyPage;
