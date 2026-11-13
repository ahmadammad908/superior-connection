import { Suspense } from "react";
import AdminContent from "./AdminContent";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#6C1C74]" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}