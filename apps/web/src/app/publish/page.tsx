import { Suspense } from "react";

import PublishPageClient from "./page-client";

export default function PublishPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center bg-[#061421] text-[#f4efe3]">
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/60">
            Loading voyage context...
          </p>
        </main>
      }
    >
      <PublishPageClient />
    </Suspense>
  );
}
