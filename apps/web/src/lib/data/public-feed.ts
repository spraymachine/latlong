import { buildVoyageLine, type VoyageLineFeature } from "@/lib/geo/route";
import { VOYAGE_PHOTO_BUCKET } from "@/lib/supabase/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type VoyageRow = Database["public"]["Tables"]["voyages"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];

const PUBLIC_VOYAGE_SELECT = `
  id,
  user_id,
  title,
  description,
  start_name,
  start_latitude,
  start_longitude,
  end_name,
  end_latitude,
  end_longitude,
  created_at,
  updated_at,
  captain:profiles!voyages_user_id_fkey(display_name),
  entries:posts(
    id,
    image_path,
    caption,
    latitude,
    longitude,
    posted_at,
    created_at
  )
`;

type PublicVoyageQueryRow = Pick<
  VoyageRow,
  | "id"
  | "user_id"
  | "title"
  | "description"
  | "start_name"
  | "start_latitude"
  | "start_longitude"
  | "end_name"
  | "end_latitude"
  | "end_longitude"
  | "created_at"
  | "updated_at"
> & {
  captain: Pick<ProfileRow, "display_name"> | null;
  entries:
    | Array<
        Pick<
          PostRow,
          | "id"
          | "image_path"
          | "caption"
          | "latitude"
          | "longitude"
          | "posted_at"
          | "created_at"
        >
      >
    | null;
};

export type PublicVoyagePost = {
  id: string;
  imagePath: string;
  imageUrl: string;
  caption: string;
  latitude: number;
  longitude: number;
  postedAt: string;
  createdAt: string;
};

export type PublicVoyageStop = {
  name: string;
  latitude: number;
  longitude: number;
};

export type PublicVoyage = {
  id: string;
  userId: string;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  start: PublicVoyageStop;
  end: PublicVoyageStop;
  posts: PublicVoyagePost[];
  routeLine: VoyageLineFeature;
  latestPost: PublicVoyagePost | null;
};

const TEST_VOYAGE_ROUTES = [
  {
    title: "Arabian Sea Night Run",
    description:
      "Synthetic test passage across a calm Arabian Sea evening watch.",
    authorName: "Test Navigator",
    start: { name: "Kochi", latitude: 9.9667, longitude: 76.2833 },
    end: { name: "Muscat", latitude: 23.588, longitude: 58.3829 },
    captions: [
      "Harbor lights slipping behind the stern.",
      "Moonlit water and a quiet watch rotation.",
      "Sunrise haze building near landfall.",
    ],
  },
  {
    title: "Colombo Trade Wind Arc",
    description:
      "Synthetic test voyage built to exercise longer great-circle rendering.",
    authorName: "Atlas Crew",
    start: { name: "Colombo", latitude: 6.9271, longitude: 79.8612 },
    end: { name: "Perth", latitude: -31.9523, longitude: 115.8613 },
    captions: [
      "Warm air and dense cloud off the bow.",
      "Trade winds lifting a bright diagonal swell.",
      "A long blue arc toward Western Australia.",
    ],
  },
  {
    title: "Lisbon to Halifax Test Crossing",
    description:
      "Synthetic North Atlantic crossing for route and card stress testing.",
    authorName: "Harbor Office",
    start: { name: "Lisbon", latitude: 38.7223, longitude: -9.1393 },
    end: { name: "Halifax", latitude: 44.6488, longitude: -63.5752 },
    captions: [
      "Leaving the Tagus under low silver cloud.",
      "Mid-ocean swell with a cold wind shift.",
      "Fog bank lifting on final approach.",
    ],
  },
] as const;

function createSeededRandom(seed: string) {
  let state = 2166136261;

  for (const character of seed) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMockImageDataUri(title: string, caption: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a2740" />
          <stop offset="45%" stop-color="#16516e" />
          <stop offset="100%" stop-color="#d2a75a" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="930" cy="180" r="88" fill="rgba(244,239,227,0.85)" />
      <path d="M0 560 C220 500 430 650 660 590 C890 530 1030 640 1200 580 L1200 800 L0 800 Z" fill="#082235" />
      <path d="M0 620 C210 565 430 720 650 665 C900 610 1050 730 1200 680 L1200 800 L0 800 Z" fill="#0f3954" />
      <text x="72" y="118" font-family="Georgia, serif" font-size="42" fill="#f7efe1">${title}</text>
      <text x="72" y="170" font-family="Arial, sans-serif" font-size="24" fill="#d7e7ef">${caption}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function interpolateMockStop(
  start: PublicVoyageStop,
  end: PublicVoyageStop,
  progress: number,
) {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * progress,
    longitude: start.longitude + (end.longitude - start.longitude) * progress,
  };
}

function createMockVoyage(seed: string): PublicVoyage {
  const random = createSeededRandom(seed);
  const template =
    TEST_VOYAGE_ROUTES[Math.floor(random() * TEST_VOYAGE_ROUTES.length)] ??
    TEST_VOYAGE_ROUTES[0];
  const createdAt = new Date(
    Date.now() - Math.floor(random() * 7 * 24 * 60 * 60 * 1000),
  ).toISOString();
  const updatedAt = new Date(
    Date.parse(createdAt) + Math.floor(random() * 8 * 60 * 60 * 1000),
  ).toISOString();

  const posts = template.captions.map((caption, index) => {
    const progress = (index + 1) / (template.captions.length + 1);
    const drift = (random() - 0.5) * 1.8;
    const coordinates = interpolateMockStop(
      template.start,
      template.end,
      progress,
    );
    const postedAt = new Date(
      Date.parse(createdAt) + (index + 1) * 3 * 60 * 60 * 1000,
    ).toISOString();

    return {
      id: `${seed}-post-${index + 1}`,
      imagePath: `${seed}/post-${index + 1}.svg`,
      imageUrl: buildMockImageDataUri(template.title, caption),
      caption,
      latitude: Number((coordinates.latitude + drift * 0.35).toFixed(4)),
      longitude: Number((coordinates.longitude - drift).toFixed(4)),
      postedAt,
      createdAt: postedAt,
    };
  });

  return {
    id: seed,
    userId: `mock-user-${seed}`,
    title: template.title,
    description: template.description,
    authorName: template.authorName,
    createdAt,
    updatedAt,
    start: template.start,
    end: template.end,
    posts,
    routeLine: buildVoyageLine({
      start: template.start,
      end: template.end,
      posts: posts.map((post) => ({
        id: post.id,
        latitude: post.latitude,
        longitude: post.longitude,
        posted_at: post.postedAt,
      })),
    }),
    latestPost: posts.at(-1) ?? null,
  };
}

function createRequestMockVoyages() {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return Array.from({ length: 3 }, (_, index) =>
    createMockVoyage(`mock-${Date.now()}-${index}-${crypto.randomUUID()}`),
  );
}

function mapVoyageRow(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  row: PublicVoyageQueryRow,
): PublicVoyage {
  const posts = [...(row.entries ?? [])]
    .sort((left, right) => left.posted_at.localeCompare(right.posted_at))
    .map((post) => ({
      id: post.id,
      imagePath: post.image_path,
      imageUrl: supabase.storage
        .from(VOYAGE_PHOTO_BUCKET)
        .getPublicUrl(post.image_path).data.publicUrl,
      caption: post.caption,
      latitude: post.latitude,
      longitude: post.longitude,
      postedAt: post.posted_at,
      createdAt: post.created_at,
    }));

  const start = {
    name: row.start_name,
    latitude: row.start_latitude,
    longitude: row.start_longitude,
  };

  const end = {
    name: row.end_name,
    latitude: row.end_latitude,
    longitude: row.end_longitude,
  };

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? "",
    authorName: row.captain?.display_name?.trim() || "Unknown navigator",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    start,
    end,
    posts,
    routeLine: buildVoyageLine({
      start,
      end,
      posts: posts.map((post) => ({
        id: post.id,
        latitude: post.latitude,
        longitude: post.longitude,
        posted_at: post.postedAt,
      })),
    }),
    latestPost: posts.at(-1) ?? null,
  };
}

async function queryPublicVoyages() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("voyages")
    .select(PUBLIC_VOYAGE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load public voyage feed: ${error.message}`);
  }

  return {
    supabase,
    rows: (data ?? []) as PublicVoyageQueryRow[],
  };
}

async function queryPublicVoyage(voyageId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("voyages")
    .select(PUBLIC_VOYAGE_SELECT)
    .eq("id", voyageId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load public voyage: ${error.message}`);
  }

  return {
    supabase,
    row: (data ?? null) as PublicVoyageQueryRow | null,
  };
}

export async function getPublicFeed() {
  try {
    const { supabase, rows } = await queryPublicVoyages();
    return [...createRequestMockVoyages(), ...rows.map((row) => mapVoyageRow(supabase, row))];
  } catch {
    return createRequestMockVoyages();
  }
}

export async function getPublicVoyage(voyageId: string) {
  if (voyageId.startsWith("mock-")) {
    return createMockVoyage(voyageId);
  }

  try {
    const { supabase, row } = await queryPublicVoyage(voyageId);
    return row ? mapVoyageRow(supabase, row) : null;
  } catch {
    return null;
  }
}
