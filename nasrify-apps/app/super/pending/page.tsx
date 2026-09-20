import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { getPendingListings } from "@/lib/marketplace/listings";
import { SuperPendingClient } from "@/components/SuperPendingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Approval Queue - Nasrify Super Admin",
  description: "Review and approve app submissions for the Nasrify Marketplace.",
};

function checkIsSuperAdmin(email?: string): boolean {
  if (!email) return false;
  const superAdminList = (
    process.env.SUPER_ADMIN_EMAILS || "admin@apexstore.com,admin@example.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return superAdminList.includes(email.toLowerCase());
}

export default async function SuperPendingPage() {
  const admin = await getCurrentAdmin();
  const isSuperAdmin = admin ? checkIsSuperAdmin(admin.email) || admin.role === "admin" : false;
  const initialPending = isSuperAdmin ? await getPendingListings() : [];

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <SuperPendingClient
          initialPending={initialPending}
          isSuperAdmin={isSuperAdmin}
          userEmail={admin?.email || null}
        />
      </main>
    </div>
  );
}
