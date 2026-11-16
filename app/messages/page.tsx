import { Suspense } from "react";
import { MessagesClient } from "./MessagesClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Messages | Superior Connection",
  description: "Connect and chat with students across Superior University.",
};

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C1C74]" />
        </div>
      }
    >
      <MessagesClient />
    </Suspense>
  );
}
