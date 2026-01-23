'use client';

import CountUp from 'react-countup';

import { formatAmount } from "@/lib/utils";
const AnimatedCounter = ({ amount, currency = "GBP" }: { amount: number, currency?: string }) => {
  return (
    <div className="w-full">
      {formatAmount(amount, currency)}
    </div>
  );
}

export default AnimatedCounter