"use server";

import { DEMO_MODE, demoUser } from "@/lib/demo";
import { parseStringify } from "../utils";

const demoBanks = [
  {
    $id: "demo-item",
    name: "MankatBank Demo Account",
    accessToken: "demo",
    shareableId: "demo-share",
  },
];

export const getLoggedInUser = async () => {
  if (DEMO_MODE) return parseStringify(demoUser);
  return null;
};

// In the original project this returns linked “banks/items” from Appwrite.
// For demo mode we return a single fake bank item so other pages don't crash.
export const getBanks = async ({ userId }: any) => {
  if (DEMO_MODE) return parseStringify(demoBanks);
  return parseStringify([]);
};

export const getBank = async ({ documentId }: any) => {
  if (DEMO_MODE) return parseStringify(demoBanks[0]);
  return null;
};
