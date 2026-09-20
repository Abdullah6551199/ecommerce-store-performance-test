import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { getDeveloperListings } from "@/lib/marketplace/listings";
import { DeveloperPortalClient } from "@/components/DeveloperPortalClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Developer Portal - Nasrify Apps Hub",
  description: "Build and publish edge apps for the Nasrify e-commerce marketplace.",
};

export default async function DeveloperPage() {
  const admin = await getCurrentAdmin();
  const initialApps = admin ? await getDeveloperListings(admin.email) : [];

  const initialUser = admin
    ? {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }
    : null;

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <DeveloperPortalClient
          initialUser={initialUser}
          initialApps={initialApps}
        />
      </main>
    </div>
  );
}
