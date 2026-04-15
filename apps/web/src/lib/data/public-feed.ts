import { buildVoyageLine, type VoyageLineFeature } from "@/lib/geo/route";
import { VOYAGE_PHOTO_BUCKET } from "@/lib/supabase/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type VoyageRow = Database["public"]["Tables"]["voyages"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];

const PUBLIC_VOYAGE_SELECT = `
  id,
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
    title: row.title,
    description: row.description,
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
  const { supabase, rows } = await queryPublicVoyages();

  return rows.map((row) => mapVoyageRow(supabase, row));
}

export async function getPublicVoyage(voyageId: string) {
  const { supabase, row } = await queryPublicVoyage(voyageId);

  return row ? mapVoyageRow(supabase, row) : null;
}
