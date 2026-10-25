// app/admin/layout.tsx
import { Suspense } from "react";
import { AdminAuthGuard } from "./AdminAuthGuard";

export const instant = false;   // ← yeh line add karein

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}