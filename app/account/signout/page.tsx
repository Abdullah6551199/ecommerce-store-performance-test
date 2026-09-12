"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function doLogout() {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.push("/login");
        router.refresh();
      }
    }
    doLogout();
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-zinc-500">
      Signing you out securely...
    </div>
  );
}
