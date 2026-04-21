import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicOceanMap } from "@/components/map/public-ocean-map";
import { getPublicVoyage } from "@/lib/data/public-feed";

export function generateStaticParams() {
  return [];
}

type VoyageDetailPageProps = {
  params: Promise<{
    voyageId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCoordinate(value: number, positive: string, negative: string) {
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(2)}° ${direction}`;
}

export async function generateMetadata({
  params,
}: VoyageDetailPageProps): Promise<Metadata> {
  const { voyageId } = await params;
  const voyage = await getPublicVoyage(voyageId);

  if (!voyage) {
    return {
      title: "Voyage not found | LatLong",
    };
  }

  return {
    title: `${voyage.title} | LatLong`,
    description: voyage.description,
  };
}

export default async function VoyageDetailPage({
  params,
}: VoyageDetailPageProps) {
  const { voyageId } = await params;
  const voyage = await getPublicVoyage(voyageId);

  if (!voyage) {
    notFound();
  }

  const isOwner = false;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.2),_transparent_34%),radial-gradient(circle_at_76%_14%,_rgba(196,170,109,0.15),_transparent_26%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <Link href="/" className="transition hover:text-[#fff7e8]">
            LatLong
          </Link>
          <span>Voyage detail</span>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:py-14">
          <div className="max-w-xl">
            <p className="text-[0.72rem] uppercase tracking-[0.36em] text-[#7ec0d9]">
              Voyage dossier
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
              {voyage.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#d8e1e8]">
              {voyage.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#8bbcd0]">
                  Navigator
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#fff7e8]">
                  {voyage.authorName}
                </p>
                <p className="mt-2 text-sm text-[#d8e1e8]/78">
                  Published {formatDate(voyage.createdAt)}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[#d8b36a]/20 bg-[#d8b36a]/10 p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#f6deaa]">
                  Route shape
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#fff7e8]">
                  {voyage.routeLine.properties.pointCount} points
                </p>
                <p className="mt-2 text-sm leading-6 text-[#f6f0e3]">
                  {voyage.posts.length} photo logs between departure and landfall.
                </p>
              </div>
            </div>
            {isOwner ? (
              <div className="mt-6">
                <Link
                  href={`/dashboard/voyages/${voyage.id}/publish`}
                  className="inline-flex items-center rounded-full border border-[#f4c776]/30 bg-[#f4c776]/10 px-5 py-3 text-[0.72rem] uppercase tracking-[0.26em] text-[#fff2cd] transition hover:bg-[#f4c776]/16"
                >
                  Publish another signal
                </Link>
              </div>
            ) : null}
          </div>

          <PublicOceanMap
            voyages={[voyage]}
            activeVoyageId={voyage.id}
            className="min-h-[420px]"
          />
        </section>

        <section className="grid gap-8 pb-14 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-5">
            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#8bbcd0]">
                Passage coordinates
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[#d8e1e8]">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                    Departure
                  </p>
                  <p className="mt-2 font-medium text-[#fff7e8]">{voyage.start.name}</p>
                  <p>
                    {formatCoordinate(voyage.start.latitude, "N", "S")} ·{" "}
                    {formatCoordinate(voyage.start.longitude, "E", "W")}
                  </p>
                </div>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                    Landfall
                  </p>
                  <p className="mt-2 font-medium text-[#fff7e8]">{voyage.end.name}</p>
                  <p>
                    {formatCoordinate(voyage.end.latitude, "N", "S")} ·{" "}
                    {formatCoordinate(voyage.end.longitude, "E", "W")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[#071824]/72 p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#8bbcd0]">
                Log summary
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                    Latest note
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#fff7e8]">
                    {voyage.latestPost?.caption || "No caption recorded."}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                    Last position
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#fff7e8]">
                    {voyage.latestPost
                      ? `${formatCoordinate(voyage.latestPost.latitude, "N", "S")} · ${formatCoordinate(voyage.latestPost.longitude, "E", "W")}`
                      : `${formatCoordinate(voyage.end.latitude, "N", "S")} · ${formatCoordinate(voyage.end.longitude, "E", "W")}`}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8bbcd0]">
                Photo chronicle
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                Positions logged underway
              </h2>
            </div>

            {voyage.posts.length > 0 ? (
              <div className="space-y-5">
                {voyage.posts.map((post, index) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]"
                  >
                    <div className="grid gap-0 md:grid-cols-[0.86fr_1.14fr]">
                      <div className="relative min-h-[260px] bg-[#081521]">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || `${voyage.title} post ${index + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,33,0.04),rgba(6,20,33,0.45))]" />
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.64rem] uppercase tracking-[0.24em] text-[#8bbcd0]">
                          <span>Log {String(index + 1).padStart(2, "0")}</span>
                          <span>{formatDate(post.postedAt)}</span>
                        </div>
                        <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                          {post.caption || "No written note for this position."}
                        </p>
                        <div className="mt-6 grid gap-4 text-sm leading-7 text-[#d8e1e8] sm:grid-cols-2">
                          <div>
                            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                              Latitude
                            </p>
                            <p className="mt-2 text-[#fff7e8]">
                              {formatCoordinate(post.latitude, "N", "S")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d7ccb5]/70">
                              Longitude
                            </p>
                            <p className="mt-2 text-[#fff7e8]">
                              {formatCoordinate(post.longitude, "E", "W")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.8rem] border border-white/10 bg-white/4 px-6 py-10">
                <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#8ed3ef]">
                  No post log yet
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d8e1e8]">
                  This voyage has a mapped route but no public photo entries yet. The line still follows departure and landfall so the passage remains visible on the chart.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
