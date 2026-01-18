"use server";

import { parseStringify } from "../utils";

const API_BASE =
  process.env.SPRING_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

// This UI expects "accounts summary" shaped like:
// { data: AccountUI[], totalBanks: number, totalCurrentBalance: number }
export const getAccounts = async ({ userId }: any) => {
  try {
    const res = await fetch(`${API_BASE}/accounts`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Spring /accounts failed: ${res.status}`);

    const accounts = (await res.json()) as Array<{
      id: number;
      ownerName: string;
      balance: number;
    }>;

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

    const accRes = await fetch(`${API_BASE}/accounts/${id}`, { cache: "no-store" });
    if (!accRes.ok) throw new Error(`Spring /accounts/${id} failed: ${accRes.status}`);

    const account = (await accRes.json()) as {
      id: number;
      ownerName: string;
      balance: number;
    };

    const txRes = await fetch(`${API_BASE}/accounts/${id}/transactions`, {
      cache: "no-store",
    });

    // If transactions endpoint doesn't exist yet, keep UI alive
    const txs: Array<any> = txRes.ok ? await txRes.json() : [];

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
