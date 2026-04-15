import Link from "next/link";

import { PublicOceanMap } from "@/components/map/public-ocean-map";
import { getPublicFeed } from "@/lib/data/public-feed";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function HomePage() {
  const voyages = await getPublicFeed();
  const totalPosts = voyages.reduce((count, voyage) => count + voyage.posts.length, 0);
  const featuredVoyage = voyages[0] ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.24),_transparent_36%),radial-gradient(circle_at_80%_18%,_rgba(196,170,109,0.16),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.96),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <span>LatLong</span>
          <span>Public voyage feed</span>
        </header>

        <section className="grid gap-10 py-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-end lg:gap-12 lg:py-14">
          <div className="max-w-xl">
            <p className="mb-5 text-[0.72rem] uppercase tracking-[0.36em] text-[#7ec0d9]">
              Shared ocean map
            </p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl lg:text-7xl">
              Routes told in tides, coordinates, and compressed light.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#d8e1e8]">
              Public voyages surface as long-form chart entries: precise starts and finishes, mid-passage photo notes, and a shared map that reads more like an atlas than a dashboard.
            </p>

            <div className="mt-8 grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Voyages",
                  value: voyages.length.toString().padStart(2, "0"),
                },
                {
                  label: "Positions logged",
                  value: totalPosts.toString().padStart(2, "0"),
                },
                {
                  label: "Current focus",
                  value: featuredVoyage ? featuredVoyage.end.name : "Awaiting launch",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#8bbcd0]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#fff7e8]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {featuredVoyage ? (
              <div className="mt-8 rounded-[1.6rem] border border-[#d8b36a]/20 bg-[#d8b36a]/10 p-5">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f6deaa]">
                  Featured log
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#fff7e8]">
                  {featuredVoyage.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#f6f0e3]">
                  {featuredVoyage.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.24em] text-[#f6deaa]/86">
                  <span>{featuredVoyage.authorName}</span>
                  <span>{formatDate(featuredVoyage.createdAt)}</span>
                  <span>
                    {featuredVoyage.start.name} to {featuredVoyage.end.name}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <PublicOceanMap
            voyages={voyages}
            activeVoyageId={featuredVoyage?.id}
            className="min-h-[420px]"
          />
        </section>

        <section className="pb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8bbcd0]">
                Voyage logbook
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                Public passages
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#d8e1e8]/80">
              Each card opens into a dedicated voyage page with the full route, photo chronology, and exact waypoints.
            </p>
          </div>

          {voyages.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-3">
              {voyages.map((voyage) => (
                <Link
                  key={voyage.id}
                  href={`/voyages/${voyage.id}`}
                  className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#8ed3ef]/40 hover:bg-[linear-gradient(180deg,rgba(142,211,239,0.13),rgba(255,255,255,0.03))]"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(216,179,106,0.85),transparent)] opacity-70" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#8bbcd0]">
                        {voyage.authorName}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                        {voyage.title}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-[#d7ccb5]/80">
                      {voyage.posts.length} posts
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#d8e1e8]">
                    {voyage.description}
                  </p>

                  <div className="mt-6 grid gap-4 rounded-[1.4rem] border border-white/8 bg-[#071824]/70 p-4 text-sm text-[#f4efe3] sm:grid-cols-2">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#8bbcd0]">
                        Departed
                      </p>
                      <p className="mt-2 font-medium text-[#fff7e8]">{voyage.start.name}</p>
                    </div>
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#8bbcd0]">
                        Landfall
                      </p>
                      <p className="mt-2 font-medium text-[#fff7e8]">{voyage.end.name}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[#d7ccb5]/78">
                    <span>{formatDate(voyage.createdAt)}</span>
                    <span className="transition group-hover:text-[#8ed3ef]">
                      Open voyage
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-white/10 bg-white/4 px-6 py-10 text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[#8ed3ef]">
                Awaiting first signal
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                The public feed is empty for now
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#d8e1e8]">
                Once voyages are published, this page will turn into a browsable chart of routes, photo notes, and destination pages.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
