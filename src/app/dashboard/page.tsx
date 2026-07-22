import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRoleDashboardRoute } from "@/lib/routes";

export default async function DashboardRootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const targetRoute = getRoleDashboardRoute(user.role);
  redirect(targetRoute);
}
