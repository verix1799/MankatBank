"use client";

import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/actions/bank.actions';
import { useEffect, useState } from 'react'

const Transfer = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadAccounts = async () => {
      const accountsResponse = await getAccounts();
      if (!isActive) return;
      setAccounts(accountsResponse?.data ?? []);
    };

    loadAccounts().catch((error) => console.error("Failed to load accounts:", error));

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="payment-transfer">
      <HeaderBox 
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />

      <section className="size-full pt-5">
        <PaymentTransferForm accounts={accounts} />
      </section>
    </section>
  )
}

export default Transfer
