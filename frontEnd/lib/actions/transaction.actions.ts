"use server";

import { DEMO_MODE } from "@/lib/demo";
import { parseStringify } from "../utils";

export const getTransactionsByBankId = async ({ bankId }: any) => {
  if (DEMO_MODE) {
    return parseStringify({
      documents: [
        {
          $id: "demo-tx-1",
          name: "Initial Deposit",
          amount: 300,
          channel: "internal",
          category: "deposit",
          senderBankId: "demo-item",
          $createdAt: new Date().toISOString(),
        },
        {
          $id: "demo-tx-2",
          name: "Coffee",
          amount: 5,
          channel: "internal",
          category: "purchase",
          senderBankId: "demo-item",
          $createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    });
  }

  return parseStringify({ documents: [] });
};
