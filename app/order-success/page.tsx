import { redirect } from "next/navigation";

export default function OrderSuccessIndexPage() {
  redirect("/account/orders");
}
