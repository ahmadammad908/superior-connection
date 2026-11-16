import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PostDetailClient } from "./PostDetailClient";

async function PostDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailClient id={id} />;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
        </div>
      }
    >
      <PostDetailLoader params={params} />
    </Suspense>
  );
}
