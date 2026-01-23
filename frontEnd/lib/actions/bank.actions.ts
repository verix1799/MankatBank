import { getAccounts as getDemoAccounts, setAccounts, updateBalance } from "@/lib/demoBanks";
import { parseStringify } from "../utils";

// Demo: getAccounts reads from localStorage, seeds if missing
export const getAccounts = async () => {
  const accounts = getDemoAccounts();
  // Adapt to app's expected shape
  const data = accounts.map((a) => ({
    id: a.id,
    bankName: a.bankName,
    masked: a.masked,
    currentBalance: a.currentBalance,
    currency: a.currency,
    // for compatibility with UI
    availableBalance: a.currentBalance,
    institutionId: "demo",
    name: a.bankName,
    officialName: a.bankName,
    mask: a.masked,
    type: "depository",
    subtype: "checking",
    appwriteItemId: a.id,
    shareableId: a.id,
  }));
  return {
    data,
    totalBanks: data.length,
    totalCurrentBalance: data.reduce((t, x) => t + (x.currentBalance ?? 0), 0),
  };
};

// This UI expects single account shaped like:
// { data: AccountUI, transactions: TransactionUI[] }
export const getAccount = async ({ appwriteItemId }: any) => {
  try {
    // appwriteItemId is like "acc-4" from above mapping
    const idStr = String(appwriteItemId || "").replace("acc-", "");
    const id = Number(idStr);
    if (!Number.isFinite(id)) throw new Error("Invalid account id");

    const account = await apiJson<{
      id: number;
      ownerName: string;
      balance: number;
    }>(`/accounts/${id}`, { cache: "no-store" });

    let txs: Array<any> = [];
    try {
      txs = await apiJson<Array<any>>(`/accounts/${id}/transactions`, {
        cache: "no-store",
      });
    } catch (error) {
      console.warn("Transactions endpoint unavailable:", error);
    }

    const uiAccount = {
      id: String(account.id),
      availableBalance: account.balance,
      currentBalance: account.balance,
      institutionId: "mankatbank",
      name: `${account.ownerName}'s Account`,
      officialName: "MankatBank Account",
      mask: String(account.id).padStart(4, "0"),
      type: "depository",
      subtype: "checking",
      appwriteItemId: `acc-${account.id}`,
    };

    const uiTransactions = txs.map((t) => ({
      id: String(t.id ?? crypto.randomUUID?.() ?? Math.random()),
      name: t.type ?? "Transaction",
      amount: t.amount ?? 0,
      date: t.createdAt ?? new Date().toISOString(),
      paymentChannel: "internal",
      category: String(t.type ?? "transaction").toLowerCase(),
      type:
        String(t.type || "").toUpperCase().includes("WITHDRAW") ||
        String(t.type || "").toUpperCase().includes("TRANSFER_OUT")
          ? "debit"
          : "credit",
    }));

    // newest first
    uiTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: uiAccount,
      transactions: uiTransactions,
    });
  } catch (error) {
    console.error("Error getting account from Spring:", error);
    return parseStringify({ data: null, transactions: [] });
  }
};

export const transferFunds = async ({
  fromId,
  toId,
  amount,
}: {
  fromId: number;
  toId: number;
  amount: number;
}) => {
  await apiJsonNoBody("/accounts/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromId, toId, amount }),
  });
};

// Demo: deposit/withdraw update localStorage
export const depositFunds = async ({ accountId, amount }: { accountId: string; amount: number }) => {
  updateBalance(accountId, amount);
};
export const withdrawFunds = async ({ accountId, amount }: { accountId: string; amount: number }) => {
  updateBalance(accountId, -amount);
};
