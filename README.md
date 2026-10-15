# dhonn..

dhonn.. is an original, responsive soundboard application for discovering, playing, saving, and submitting short creator-made sounds. Public browsing and playback do not require an account. User-submitted audio stays private until an administrator approves it.

## Features

- Searchable, category-filtered sound library with bounded pagination and popularity/newest/favorite sorting. Search requests are debounced, fetch only a bounded page (without a total-count query), and can be cached briefly at the CDN.
- Public sound details, lazy audio playback, signed download, favorites, share/embed links, and play analytics. Played sounds are cached in the browser for repeat and offline playback.
- Guest favorites stored locally and account favorites synchronized in MongoDB.
- Registration, credentials login, JWT-backed Auth.js sessions, profile settings, recent plays, and upload history.
- Direct, short-lived S3-compatible uploads; server-side signature, size, duration, and duplicate checks.
- User and administrator sound removal permanently deletes the audio object and its database records after confirmation.
- Admin overview, upload moderation, sound controls, categories, copyright/content reports, and account suspension.
- Mongoose schemas, indexes, Zod request schemas, server-side role checks, rate limits, sitemap, and robots rules.

## Requirements

- Node.js 20 or later and npm.
- MongoDB 7+ (MongoDB Atlas is suitable).
- An S3-compatible bucket; Cloudflare R2 is supported.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and configure `MONGODB_URI`, `AUTH_SECRET`, `APP_URL`, and the `S3_*` values. Generate `AUTH_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
3. Create a private R2 bucket and an API token with object read/write/delete permissions limited to that bucket. Use the account endpoint as `S3_ENDPOINT` and set `S3_REGION=auto`.
4. In the R2 dashboard, open the bucket's **Settings → CORS Policy** and add a rule for the exact local and production application origins. For local development, use `http://localhost:3000` (including the port). The rule must allow `PUT` and the `Content-Type` request header. For example:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://your-production-domain.example"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Replace the production origin with your deployed site's origin, save the policy, then retry the upload. Add any other local origin/port you use as a separate allowed origin.

5. Seed the built-in categories and optionally provision the initial administrator:

   ```powershell
   npm run seed
   ```

   `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` must both be set to provision an admin. The password must be at least 16 characters. Provisioning only creates the user if it does not already exist; registration and profile APIs never accept a role.

6. Start the local server with `npm run dev`.

Use authorized audio only. Seed data intentionally creates categories and an optional administrator, not fabricated published sounds or unlicensed media. An administrator or user can submit real audio using the upload flow.

## Environment variables

| Variable                 | Required      | Purpose                                                                                  |
| ------------------------ | ------------- | ---------------------------------------------------------------------------------------- |
| `MONGODB_URI`            | Yes           | MongoDB connection string used by Mongoose.                                              |
| `AUTH_SECRET`            | Yes           | Signs and encrypts Auth.js session tokens. Generate a strong random secret.              |
| `AUTH_TRUST_HOST`        | Deployment    | Set to `true` when deployed behind Vercel or another trusted proxy.                      |
| `APP_URL`                | Recommended   | Canonical origin, metadata, sitemap, and embed URLs.                                     |
| `S3_ENDPOINT`            | Yes for audio | S3-compatible API endpoint. R2: `https://<account-id>.r2.cloudflarestorage.com`.         |
| `S3_REGION`              | Yes for audio | Object storage region; R2 uses `auto`.                                                   |
| `S3_BUCKET`              | Yes for audio | Bucket for private audio objects.                                                        |
| `S3_ACCESS_KEY_ID`       | Yes for audio | Server-only storage access key.                                                          |
| `S3_SECRET_ACCESS_KEY`   | Yes for audio | Server-only storage secret. Never expose it to the browser.                              |
| `AUDIO_PUBLIC_BASE_URL`  | No            | Reserved for an optional future CDN. Playback currently uses short-lived signed URLs.    |
| `INITIAL_ADMIN_EMAIL`    | No            | Email for one-time initial admin provisioning by `npm run seed`.                         |
| `INITIAL_ADMIN_PASSWORD` | No            | Initial admin password (at least 16 characters); do not leave it set after provisioning. |
| `CONTACT_EMAIL`          | No            | Contact address rendered by the Contact page.                                            |

Auth.js uses `AUTH_SECRET`; Vercel provides the host context. For local auth, set `AUTH_SECRET` and use `http://localhost:3000` for `APP_URL`.

## Data and operations

- All application database access goes through Mongoose. Models are in `models/index.ts`; query and business logic is under `lib/services/`.
- `npm run seed` initializes categories, which also creates model indexes through Mongoose. The script never inserts fake public sound/audio records.
- MongoDB collections include users, categories, sounds, favorites, reports, play events, and rate-limit buckets. A unique sound hash prevents exact duplicate audio.
- Play events are retained for 180 days. Rate-limit buckets have TTL expiry.
- Admin and creator upload lists use bounded cursor pagination and indexed full-text search. After deploying search or pagination index changes to an existing database, run `npm run admin:indexes` once from a trusted environment during a low-traffic window; index builds can consume database resources.
- Admin and creator dashboard lists and mutations use authenticated server actions with direct server-side database access rather than dashboard fetches to API routes.
- Pending and rejected sounds are excluded from all public discovery, detail, audio, embed, and sitemap queries. The removal action permanently deletes the sound and related records.
- Production MongoDB access should use a least-privilege database user and network allowlisting.

### Audio storage and recovery

Keep the bucket private. The application issues a five-minute signed `PUT` URL only to a signed-in user and creates an unlisted moderation record first. Completion re-reads the object from storage, checks its byte signature and size, parses actual audio duration, hashes its content, copies the verified object from the temporary `uploads/` prefix into the permanent `audio/` prefix, and leaves it pending moderation. Published downloads use five-minute signed `GET` URLs; playback streams through the application so the service worker can cache it on the device.

In production, the service worker caches public pages, public catalog responses, static assets, and audio after they are first loaded online. Previously visited public sections and sounds can then be revisited offline without querying MongoDB. Account and admin pages/data are not cached, and app page caches are cleared at sign-out. Browser storage can be cleared or evicted, so offline access is limited to content already loaded on that device and is not a permanent backup.

Enable object versioning if available and configure a lifecycle policy only for the temporary `uploads/` prefix (for example, delete objects after one day). Do not apply that lifecycle rule to the permanent `audio/` prefix. Back up MongoDB with Atlas continuous backups or scheduled `mongodump` snapshots, and enable bucket versioning/replication appropriate to your recovery objectives. Test restores in a separate database and bucket; restore database metadata before exposing recovered published audio. Retention, costs, and restore procedures should be reviewed periodically.

R2 bucket lock rules prevent deletion or overwriting of matching objects until their retention requirement is met. If sound removal returns `ObjectLockedByBucketPolicy`, open the bucket in Cloudflare **R2 → Settings → Bucket lock rules** and check for a rule matching the object's `audio/` key. Wait for intentional retention to expire, or correct an accidentally matching rule, then retry removal. The sound's database record and related data are kept when R2 rejects deletion.

## Authentication and authorization

Auth.js Credentials authentication uses bcryptjs password hashes and JWT sessions. Session user ID, role, name, and active status are looked up server-side before protected operations. The admin account is provisioned by the seed script and cannot be selected at registration. Admin pages and every admin API independently enforce admin role checks. Users can only access their own profile, uploads, favorites, and recent-play data.

## Routes

| Path                                                                                     | Purpose                                       |
| ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| `/` and `/search`                                                                        | Public searchable soundboard.                 |
| `/sound/[slug]`                                                                          | Public sound details and metadata.            |
| `/embed/[slug]`                                                                          | Minimal player for a published sound.         |
| `/login`, `/register`                                                                    | Account access.                               |
| `/dashboard`                                                                             | Favorites, recent plays, upload statuses.     |
| `/dashboard/upload`, `/dashboard/settings`                                               | Upload and account settings.                  |
| `/admin`                                                                                 | Protected admin overview.                     |
| `/admin/uploads`, `/admin/sounds`, `/admin/reports`, `/admin/categories`, `/admin/users` | Moderation and administration.                |
| `/api/sounds`, `/api/favorites`, `/api/uploads`, `/api/reports`                          | Public discovery and authenticated user APIs. |
| `/api/admin/*`                                                                           | Server-authorized admin operations.           |

## Development checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The repository currently has focused request-schema tests. Full database, S3, and browser end-to-end tests require configured test services and are not represented as passing until those services are provided.

## Deployment

1. Push the project to GitHub and import it into Vercel.
2. Configure the production environment variables in the Vercel project. Use a dedicated MongoDB database user and bucket-scoped R2 token.
3. Allow the production site origin for the R2 bucket's CORS `PUT` requests.
4. Set `APP_URL` to the production HTTPS origin and `AUTH_TRUST_HOST=true`.
5. Run `npm run seed` once against the production database from a trusted environment to create categories and, if needed, the initial administrator.
6. Deploy and verify registration, login/logout, public audio, upload verification/moderation, and admin authorization.

Do not commit `.env.local`, credentials, or real production data.
