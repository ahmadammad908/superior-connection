import { AdminDashboard } from "../components/AdminDashboard";

export default function AdminContent() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AdminDashboard />
      </div>
    </div>
  );
}
