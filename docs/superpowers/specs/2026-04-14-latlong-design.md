# LatLong Design Spec

Date: 2026-04-14
Status: Draft approved in conversation, written for review

## Summary

LatLong v1 is a mobile-first web app for sailors to document voyages from point A to point B with exact-coordinate photo posts. Each sailor has their own account and credentials. Voyages and posts are publicly browseable on a shared ocean map, while only the authenticated owner can create and manage their own content.

The product starts as a sailor-only experience, not a general social network. Social interactions such as likes, comments, following, crew collaboration, offline sync, and native mobile apps are out of scope for v1.

## Product Goals

- Let a sailor sign up with their own credentials and maintain their own voyage history.
- Let a sailor create a voyage with a start point and end point.
- Let a sailor upload photos during a voyage and attach each photo to an exact latitude and longitude.
- Make the public discovery experience map-first, with a shared ocean map showing all public voyage photo points.
- Keep v1 lean enough to launch quickly on Supabase and a web frontend.

## Non-Goals

- General-purpose social networking beyond public browsing
- Likes, comments, follows, reposts, or messaging
- Offline-first uploads or local draft syncing
- Private voyages or fine-grained privacy controls
- Native iOS or Android apps
- Shared editing across multiple sailors on one voyage

## Target Users

Primary users are sailors documenting journeys at sea. Secondary users are public viewers who browse voyages and photo points on the shared map.

## Core User Flows

### Sailor onboarding

1. A sailor opens the web app.
2. The sailor signs up or signs in with email and password.
3. The sailor arrives at their dashboard and can create a new voyage.

### Voyage creation

1. A sailor creates a voyage with:
   - voyage title
   - optional description
   - start point name
   - start latitude and longitude
   - end point name
   - end latitude and longitude
2. The voyage is public by default in v1.
3. The sailor can view the voyage page and start adding posts.

### Voyage posting

1. A sailor chooses a photo from the device camera or gallery.
2. The browser reads current device GPS coordinates.
3. The app auto-fills latitude and longitude.
4. The sailor may manually edit the coordinates before publishing.
5. The browser compresses the image before upload.
6. The compressed image uploads to Supabase Storage.
7. The app writes the post metadata to the database.
8. The new point appears on the voyage and on the public ocean map.

### Public browsing

1. A visitor opens the public homepage.
2. The visitor sees a shared ocean map containing all public photo points.
3. The visitor taps a point to view:
   - photo
   - exact coordinates
   - timestamp
   - sailor name
   - voyage title
4. The visitor can open the related voyage page and see the route from point A to point B with all associated photo points.

## Product Structure

### Primary surfaces

- Public shared map homepage
- Public voyage detail page
- Sailor authentication pages
- Sailor dashboard
- Voyage creation/edit page
- Post creation flow

### Browsing model

The homepage is the primary discovery surface. Profile and voyage pages are secondary surfaces reached from map points.

## System Architecture

### Frontend

A mobile-first web app optimized for phone browsers. The UI should prioritize:

- fast posting flow
- map readability on mobile
- compressed uploads
- clear fallback states for permissions and upload errors

### Backend and services

- Supabase Auth for email/password accounts
- Supabase Postgres for structured data
- Supabase Storage for compressed image files
- A web mapping library for route lines, points, and clustering

### Media pipeline

Image compression is mandatory before upload. The app should enforce strict client-side compression and reject files that fail compression or exceed the final upload limit.

Recommended v1 media policy:

- compress in browser before upload
- normalize to a web-friendly format such as JPEG or WebP
- target roughly 250-400 KB per uploaded image
- enforce a maximum post-compression file size

## Data Model

### users

- id
- email
- display_name
- created_at

### voyages

- id
- user_id
- title
- description
- start_name
- start_latitude
- start_longitude
- end_name
- end_latitude
- end_longitude
- created_at
- updated_at

### posts

- id
- voyage_id
- user_id
- image_path
- caption
- latitude
- longitude
- taken_at or posted_at
- created_at

## Ownership and Access Rules

- Each voyage belongs to exactly one sailor.
- Each post belongs to exactly one voyage and one sailor.
- Only authenticated sailors can create, edit, or delete their own voyages and posts.
- All voyages and posts are publicly readable in v1.
- Public viewers can browse content but cannot interact socially.

## Map Behavior

- The public homepage shows all public photo points on a shared map.
- Points should be clusterable for readability as content grows.
- Opening a point reveals the associated photo and voyage summary.
- Voyage pages show:
  - start point
  - end point
  - route line between A and B
  - exact photo points belonging to the voyage

The route line is a visualization of the voyage from start to end plus post points, not a fully validated nautical navigation engine in v1.

## Error Handling

- If location permission is granted, GPS auto-fills coordinates.
- If location permission is denied or GPS fails, the sailor can manually enter latitude and longitude.
- If image compression fails, the upload is blocked and the sailor sees a retry message.
- If storage upload fails, the sailor sees an upload failure message and can retry.
- If image upload succeeds but database write fails, the UI should guide the sailor to retry safely and avoid confusion about whether the post exists.
- If public map data fails to load, the app should preserve a fallback browsing path through list or voyage pages.

## Scale and Capacity on Supabase Free Tier

This project can start on the Supabase free tier, with the expectation that upgrading later is normal and preferred when usage grows.

Current practical constraints discussed for the free tier:

- 500 MB database
- 1 GB file storage
- about 10 GB bandwidth/egress total
- database capacity is much less likely to be the bottleneck than storage and image delivery

Practical interpretation for LatLong:

- The database can likely handle many thousands of accounts, voyages, and posts at this v1 shape because metadata rows are small.
- Storage and bandwidth will limit growth much earlier because the core product is image-heavy.
- With strict compression targeting roughly 250-400 KB per image, the free tier can hold roughly 2,500-4,000 uploaded images before storage pressure becomes serious.
- If a typical sailor uploads around 20 photos, a rough first estimate is about 125-200 sailors' worth of stored photos before storage becomes the first likely upgrade trigger.
- Public traffic may force an upgrade earlier if image views increase bandwidth usage.

Conclusion:

The free tier is enough for an MVP and an initial pilot, but LatLong should be designed with the expectation that Supabase paid plans are the normal next step once real adoption starts.

## Testing Focus

### Authentication

- Multiple sailors can create accounts independently.
- Email/password login works reliably.
- One sailor cannot edit another sailor's content.

### Voyage and posting

- A sailor can create a voyage from point A to point B.
- A sailor can upload a post with auto-filled GPS coordinates.
- A sailor can override coordinates manually before publish.
- A compressed image is uploaded instead of the original file.
- A post appears on the voyage and public map after creation.

### Public browsing

- Public viewers can browse the shared map without signing in.
- Public viewers can open point details and voyage pages.
- Voyage route and associated points render correctly.

### Failure cases

- GPS denied path works with manual coordinates.
- Compression failure is handled clearly.
- Upload failure is retryable.
- Database write failure after upload is handled clearly.

## Recommended MVP Boundaries

Build only these essentials first:

- account creation and sign-in
- voyage creation from A to B
- exact-coordinate photo posting
- strict image compression before upload
- public shared ocean map
- public voyage detail page

Do not expand v1 into:

- social engagement features
- offline support
- native apps
- advanced privacy controls
- crew or team workflows

## Open Operational Note

This workspace is not currently a git repository, so this spec can be written locally but cannot be committed until the project is initialized in git.
