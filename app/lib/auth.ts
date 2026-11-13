import { auth } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  if (userId !== process.env.ADMIN_CLERK_USER_ID)
    throw new Response("Forbidden", { status: 403 });
  return userId;
}

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  return userId;
}