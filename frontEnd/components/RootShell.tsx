"use client";

import Image from "next/image";
import AuthGuard from "@/components/AuthGuard";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";

const RootShell = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  return (
    <AuthGuard>
      <main className="flex h-screen w-full font-inter">
        <Sidebar user={user ?? undefined} />

        <div className="flex size-full flex-col">
          <div className="root-layout">
            <Image src="/icons/logo.svg" width={30} height={30} alt="logo" />
            <div>
              <MobileNav user={user ?? undefined} />
            </div>
          </div>
          {children}
        </div>
      </main>
    </AuthGuard>
  );
};

export default RootShell;
