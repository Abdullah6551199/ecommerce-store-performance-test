import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const admin = await getCurrentAdmin();
  if (admin && admin.role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/admin/login");
  }
}
