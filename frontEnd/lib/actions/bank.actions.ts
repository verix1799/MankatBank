import { apiJson } from "@/lib/api";
import { parseStringify } from "../utils";

// This UI expects "accounts summary" shaped like:
// { data: AccountUI[], totalBanks: number, totalCurrentBalance: number }
export const getAccounts = async ({ userId }: any = {}) => {
  try {
    const accounts = await apiJson<Array<{
      id: number;
      ownerName: string;
      balance: number;
    }>>("/accounts", { cache: "no-store" });

    const data = accounts.map((a) => ({
      id: String(a.id),
      availableBalance: a.balance,
      currentBalance: a.balance,
      institutionId: "mankatbank",
      name: `${a.ownerName}'s Account`,
      officialName: "MankatBank Account",
      mask: String(a.id).padStart(4, "0"),
      type: "depository",
      subtype: "checking",
      appwriteItemId: `acc-${a.id}`,
      shareableId: `acc-${a.id}`,
    }));

    return parseStringify({
      data,
      totalBanks: data.length,
      totalCurrentBalance: data.reduce((t, x) => t + (x.currentBalance ?? 0), 0),
    });
  } catch (error) {
    console.error("Error getting accounts from Spring:", error);
    // Return an empty state instead of crashing the UI
    return parseStringify({ data: [], totalBanks: 0, totalCurrentBalance: 0 });
  }
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
