export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.24),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(196,170,109,0.16),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.96),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(244,239,227,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <span>LatLong</span>
          <span>Exact-coordinate voyage photos</span>
        </header>

        <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="max-w-xl">
            <p className="mb-5 text-[0.72rem] uppercase tracking-[0.36em] text-[#7ec0d9]">
              Charted for sailors
            </p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#fff7e8] sm:text-6xl lg:text-7xl">
              LatLong
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#d8e1e8]">
              A shared ocean map for exact-coordinate voyage photos, compressed
              to keep the story clean and the location precise.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-[#f4efe3]">
              {["Exact coordinates", "Compressed photos", "Voyage notes"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#"
                className="rounded-full bg-[#d8b36a] px-6 py-3 text-sm font-medium text-[#081321] transition hover:bg-[#e2c07a]"
              >
                Enter the chart
              </a>
              <a
                href="#"
                className="rounded-full border border-white/16 px-6 py-3 text-sm font-medium text-[#f4efe3] transition hover:bg-white/8"
              >
                Read the log
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -translate-x-5 translate-y-5 rounded-[2rem] border border-[#8ab6c9]/20 bg-[#0b2234]/70 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0b1d2b]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.26em] text-[#9bb8c8]">
                <span>Open water</span>
                <span>18° 24.8&apos; N · 72° 51.3&apos; E</span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#d1c6aa]">
                      Signal
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#fff7e8]">
                      14 images
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#b8c6d1]">
                      Anchored, compressed, and ready to surface.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#d8b36a]/20 bg-[#d8b36a]/10 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#f6deaa]">
                      Tide note
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#f6f0e3]">
                      Every post keeps the latitude, longitude, and a short
                      observation in view.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                  <svg
                    viewBox="0 0 360 280"
                    className="h-full w-full"
                    role="img"
                    aria-label="Abstract ocean chart route"
                  >
                    <defs>
                      <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8ed3ef" />
                        <stop offset="100%" stopColor="#d8b36a" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="360"
                      height="280"
                      rx="24"
                      fill="rgba(6, 20, 33, 0.55)"
                    />
                    <path
                      d="M18 58H342M18 116H342M18 174H342M18 232H342M72 18V262M144 18V262M216 18V262M288 18V262"
                      stroke="rgba(244,239,227,0.12)"
                      strokeWidth="1"
                    />
                    <path
                      d="M54 206C88 184 112 162 146 158C182 153 207 169 237 143C268 117 281 88 318 70"
                      fill="none"
                      stroke="url(#chart-line)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="54" cy="206" r="7" fill="#d8b36a" />
                    <circle cx="318" cy="70" r="7" fill="#8ed3ef" />
                    <circle cx="237" cy="143" r="9" fill="rgba(142, 211, 239, 0.18)" />
                    <path
                      d="M178 34l12 18 18 12-18 12-12 18-12-18-18-12 18-12z"
                      fill="rgba(244,239,227,0.9)"
                    />
                    <text x="178" y="150" textAnchor="middle" fill="#d1c6aa" fontSize="12" letterSpacing="4">
                      NORTH
                    </text>
                    <text x="178" y="170" textAnchor="middle" fill="#8ed3ef" fontSize="10" letterSpacing="3">
                      CURRENT
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
