"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { PostForm } from "@/components/posts/post-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database";
import {
  buildVoyagePhotoObjectPath,
  VOYAGE_PHOTO_BUCKET,
} from "@/lib/supabase/storage";
import { postSchema } from "@/lib/validation/post";

type VoyageRow = Pick<
  Database["public"]["Tables"]["voyages"]["Row"],
  "id" | "user_id" | "title" | "start_name" | "end_name"
>;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export default function PublishPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voyageId = searchParams.get("voyageId");
  const [voyage, setVoyage] = useState<VoyageRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!voyageId) {
        setError("Choose a voyage before publishing a signal.");
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data, error: voyageError } = await supabase
          .from("voyages")
          .select("id, user_id, title, start_name, end_name")
          .eq("id", voyageId)
          .maybeSingle();

        if (voyageError) {
          throw voyageError;
        }

        if (!data) {
          throw new Error("Voyage not found.");
        }

        if (data.user_id !== user.id) {
          throw new Error("Only the owner of this voyage can publish a signal.");
        }

        if (!cancelled) {
          setUserId(user.id);
          setVoyage(data);
          setError(null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Could not prepare this voyage for publishing.";
          setError(message);
          setVoyage(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setVoyage(null);
    setError(null);
    void load();

    return () => {
      cancelled = true;
    };
  }, [router, voyageId]);

  async function handlePublish(formData: FormData) {
    if (!voyage || !userId) {
      setError("Reload the page and try again.");
      return;
    }

    const photo = formData.get("photo");

    if (!(photo instanceof File) || photo.size === 0) {
      setError("Choose a photo before publishing.");
      return;
    }

    const parsed = postSchema.safeParse({
      voyageId,
      caption: formData.get("caption"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      fileName: photo.name,
      contentType: photo.type,
    });

    if (!parsed.success) {
      setError("Check the photo, coordinates, and timestamp before publishing.");
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const safeName = sanitizeFileName(photo.name || "signal.jpg");
      const objectPath = buildVoyagePhotoObjectPath(
        userId,
        `${voyage.id}/${Date.now()}-${safeName}`,
      );
      const postedAt = new Date(String(formData.get("postedAt"))).toISOString();

      const { error: uploadError } = await supabase.storage
        .from(VOYAGE_PHOTO_BUCKET)
        .upload(objectPath, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase.from("posts").insert({
        voyage_id: voyage.id,
        user_id: userId,
        image_path: objectPath,
        caption: parsed.data.caption ?? "",
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        posted_at: postedAt,
      });

      if (insertError) {
        throw insertError;
      }

      router.push(`/voyages?id=${voyage.id}`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not publish this signal.";
      setError(message);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.22),_transparent_36%),radial-gradient(circle_at_80%_12%,_rgba(196,170,109,0.15),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <span>LatLong publishing</span>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Dashboard
            </Link>
            <Link
              href={voyage ? `/voyages?id=${voyage.id}` : "/"}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Voyage detail
            </Link>
          </div>
        </header>

        <section className="grid gap-4">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            Publish signal
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
            Drop the next beam onto the live route.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d8e1e8]">
            Upload one image, lock exact coordinates, and the public globe will light the signal onto this passage immediately.
          </p>
        </section>

        {error ? (
          <Alert className="border-[#f0b86a]/25 bg-[#f0b86a]/8 text-[#fff7e8]">
            <AlertTitle>Signal not published</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/60">
            Loading voyage context...
          </p>
        ) : voyage ? (
          <PostForm
            action={handlePublish}
            voyageId={voyage.id}
            voyageTitle={voyage.title}
            departureLabel={voyage.start_name}
            arrivalLabel={voyage.end_name}
          />
        ) : null}
      </div>
    </main>
  );
}
