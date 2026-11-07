// app/admin/AdminAuthGuard.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== process.env.ADMIN_CLERK_USER_ID) redirect("/");
  return <>{children}</>;
}