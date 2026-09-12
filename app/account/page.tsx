import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Account Router
 * Redirects to /admin/dashboard if signed in as admin, otherwise to /admin/login.
 */
export default async function AccountPage(): Promise<never> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (sessionToken) {
    const admin = await getCurrentAdmin(sessionToken);
    if (admin) {
      redirect("/admin/dashboard");
    }
  }

  redirect("/admin/login");
}
