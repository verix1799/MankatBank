"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;

  return <>{children}</>;
};

export default AuthGuard;
