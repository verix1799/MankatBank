"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formUrlQuery, formatAmount } from "@/lib/utils";

const BankDropdown = ({
  accounts = [],
  setValue,
  otherStyles,
}: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState<Account | null>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      setSelected(accounts[0]);
      if (setValue) {
        setValue("senderBank", accounts[0].appwriteItemId);
      }
    } else {
      setSelected(null);
    }
  }, [accounts, setValue]);

  const handleBankChange = (id: string) => {
    const account = accounts.find((account) => account.appwriteItemId === id) || null;

    setSelected(account);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", id);
    }
  };

  return (
    <select
      className={`flex w-full bg-white gap-3 md:w-[300px] ${otherStyles}`}
      value={selected?.appwriteItemId || ""}
      onChange={(event) => handleBankChange(event.target.value)}
    >
      <option value="" disabled>
        Select a bank to display
      </option>
      {accounts.map((account: Account) => (
        <option key={account.id} value={account.appwriteItemId}>
          {account.name} • {formatAmount(account.currentBalance)}
        </option>
      ))}
    </select>
  );
};

export default BankDropdown;
