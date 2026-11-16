import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "../lib/db";
import User from "../models/User";

export async function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  const isAdmin =
    userId === process.env.ADMIN_CLERK_USER_ID || user?.role === "admin";

  if (!isAdmin) redirect("/");

  return <>{children}</>;
}
