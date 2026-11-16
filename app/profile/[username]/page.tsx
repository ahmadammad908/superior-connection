import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PublicProfileClient } from "./PublicProfileClient";

async function PublicProfileLoader({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
        </div>
      }
    >
      <PublicProfileLoader params={params} />
    </Suspense>
  );
}
