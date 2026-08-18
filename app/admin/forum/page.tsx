import { requireChatGPTUser } from "../../chatgpt-auth";
import AdminDashboardClient from "./admin-dashboard-client";

export const dynamic = "force-dynamic";

async function AuthenticatedDashboard() {
  const user = await requireChatGPTUser("/admin/forum/");
  return <AdminDashboardClient displayName={user.displayName} />;
}

export default function AdminForumPage() { return <AuthenticatedDashboard />; }
