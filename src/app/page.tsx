import AuthenticatedLayout from "./(authenticated)/layout";
import DashboardPage from "./(authenticated)/dashboard/page";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <DashboardPage />
    </AuthenticatedLayout>
  );
}
