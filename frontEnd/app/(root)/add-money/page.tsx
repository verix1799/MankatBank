"use client";

import HeaderBox from "@/components/HeaderBox";
import {
  depositFunds,
  getAccounts,
  withdrawFunds,
} from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type BankOption = {
  id: string;
  name: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
};

type MoneyAction = "deposit" | "withdraw";

type MoneyModalState = {
  type: MoneyAction;
  label: string;
};

const AddMoneyPage = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeBank, setActiveBank] = useState<BankOption | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [moneyModal, setMoneyModal] = useState<MoneyModalState | null>(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    loadAccounts().catch((error) =>
      console.error("Failed to load accounts:", error)
    );

    return () => {
      isActive = false;
    };
  }, []);

  const currentAccount = useMemo(() => {
    const id = searchParams.get("id");
    if (id) {
      const matched = accounts.find((account) => account.appwriteItemId === id);
      if (matched) return matched;
    }

    return accounts[0] ?? null;
  }, [accounts, searchParams]);

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

  const handleOpenMoneyModal = (type: MoneyAction) => {
    setMoneyModal({
      type,
      label: type === "deposit" ? "Deposit" : "Withdraw",
    });
    setAmount("");
    setAmountError(null);
  };

  const handleSubmitMoneyAction = async () => {
    if (!moneyModal) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      setAmountError("Enter a valid number.");
      return;
    }

    if (numericAmount <= 0) {
      setAmountError("Amount must be greater than 0.");
      return;
    }

    if (numericAmount > 1000) {
      setAmountError("Amount must be 1000 or less.");
      return;
    }

    const accountId = Number(currentAccount?.id);
    if (!Number.isFinite(accountId)) {
      setAmountError("Select an account to continue.");
      return;
    }

    setIsSubmitting(true);
    setAmountError(null);

    try {
      if (moneyModal.type === "deposit") {
        await depositFunds({ accountId, amount: numericAmount });
      } else {
        await withdrawFunds({ accountId, amount: numericAmount });
      }

      setMoneyModal(null);
      setAmount("");
    } catch (error) {
      console.error("Failed to submit money action:", error);
      setAmountError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              { id: "deposit", label: "Deposit" },
              { id: "withdraw", label: "Withdraw" },
            ].map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() =>
                  handleOpenMoneyModal(
                    action.id === "deposit" ? "deposit" : "withdraw"
                  )
                }
                className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-16 font-semibold text-gray-900">
                  {action.label}
                </span>
                <span className="text-14 text-gray-500">
                  {currentAccount
                    ? `Account ${currentAccount.mask}`
                    : "Select an account"}
                </span>
              </button>
            ))}
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

      {moneyModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-20 font-semibold text-gray-900">
                  {moneyModal.label}
                </h3>
                <p className="text-14 text-gray-600">
                  Enter an amount up to 1000.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoneyModal(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-12 font-semibold text-gray-600 transition hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-14 font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-14 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
                {amountError ? (
                  <p className="text-12 font-medium text-red-500">
                    {amountError}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleSubmitMoneyAction}
                disabled={isSubmitting}
                className="w-full rounded-full bg-bank-gradient px-4 py-3 text-14 font-semibold text-white shadow-form transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Processing..."
                  : `${moneyModal.label} funds`}
              </button>

              <button
                type="button"
                onClick={() => setMoneyModal(null)}
                className="w-full rounded-full border border-gray-300 px-4 py-3 text-14 font-semibold text-gray-700 transition hover:border-gray-400"
              >
                Cancel
              </button>
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
            <p className="mt-2 text-14 text-gray-600">Coming soon</p>
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
