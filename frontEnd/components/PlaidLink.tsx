"use client";

import React from "react";

type PlaidLinkProps = {
  user?: any;
  variant?: "primary" | "ghost";
  className?: string;
};

/**
 * DEMO VERSION
 * This project template originally connects real bank accounts via Plaid + Appwrite.
 * For your portfolio MVP, we disable that flow and show a "Coming soon" action instead.
 * Later you'll replace this with your Spring Boot "link account" flow or remove it entirely.
 */
const PlaidLink = ({ variant = "primary", className = "" }: PlaidLinkProps) => {
  const handleClick = () => {
    alert("Connect bank is coming soon. (Demo mode)");
  };

  // Keep styling roughly consistent with the original component
  const base =
    "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition";
  const primary =
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800";
  const ghost =
    "bg-transparent text-white/80 hover:text-white hover:bg-white/10";

  const styles = `${base} ${variant === "ghost" ? ghost : primary} ${className}`;

  return (
    <button type="button" className={styles} onClick={handleClick}>
      {/* Minimal text; you can swap to icons later */}
      <span>Connect bank</span>
    </button>
  );
};

export default PlaidLink;
