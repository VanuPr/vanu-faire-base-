import AuthenticatedLayout from "./dashboard/layout";
import DashboardPage from "./dashboard/page";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <DashboardPage />
    </AuthenticatedLayout>
  );
}
