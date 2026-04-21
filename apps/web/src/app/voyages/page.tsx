import { Suspense } from "react";

import VoyagesPageClient from "./page-client";

export default function VoyagesPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center bg-[#061421] text-[#f4efe3]">
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/60">
            Loading voyage dossier...
          </p>
        </main>
      }
    >
      <VoyagesPageClient />
    </Suspense>
  );
}
