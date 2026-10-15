# Build a Production-Ready Instant Soundboard Website

Build a production-ready, fully responsive instant soundboard website inspired by the core functionality of MyInstants. Use an original brand identity, original UI design, and clean, maintainable code. Do not copy proprietary branding, assets, or source code.

## 1. Technology Stack

- Next.js with App Router
- React
- TypeScript with strict mode enabled
- Tailwind CSS
- shadcn/ui
- MongoDB with Mongoose
- Zod for input validation
- Auth.js for authentication, if needed
- Cloudflare R2 or S3-compatible object storage for audio files
- Vercel for deployment

Use Mongoose for all MongoDB database operations. Do not use Prisma or another ORM.

## 2. Homepage

Create a modern, responsive homepage featuring:

- Responsive header, original logo, navigation, and search bar
- Trending, popular, recently added, and featured sounds
- Responsive grid of sound buttons
- Category and tag navigation
- Pagination or Load More functionality
- Dark and light themes
- Footer with About, Contact, Privacy Policy, Terms of Service, and copyright reporting links

Each sound card should display the sound title and provide an accessible play button with clear playback feedback.

## 3. Sound Detail Pages

Create a unique, SEO-friendly URL for every published sound.

Each sound page should include:

- Sound title and description
- Audio player with play/pause, replay, progress, and volume controls
- Category, tags, uploader, and audio duration
- Download MP3 option when permitted
- Share link and copy-link functionality
- Embed code for supported public sounds
- Favorite button and play counter
- Related sounds
- Dynamic metadata and Open Graph previews
- Breadcrumb navigation

Use native browser audio capabilities or a lightweight audio player. Avoid loading every audio file when the page initially renders.

## 4. Search and Discovery

Implement functional search and discovery features:

- Search by sound title, description, and tags
- Filter by category
- Sort by newest, most played, and most favorited
- Pagination with validated query parameters
- Loading, empty, and error states
- Efficient MongoDB queries and indexes
- Case-insensitive search with a scalable search strategy

Use MongoDB text indexes or another appropriate search strategy. Avoid unbounded database queries and unrestricted regular expressions.

## 5. Audio Upload and Storage

Store audio files in Cloudflare R2 or another S3-compatible object storage service. Never store large audio binaries directly in MongoDB or the application repository.

Implement:

- Support for approved audio formats, initially MP3 and WAV
- Configurable upload size and audio duration limits
- MIME type and file-signature validation
- Secure, short-lived signed upload URLs
- Server-side upload authorization
- Duplicate upload detection
- Audio metadata extraction, including duration and file size
- Upload status and moderation workflow
- Admin approval before user-submitted sounds become public
- Copyright reporting and content removal workflow
- Safe deletion of audio objects when appropriate

Do not trust client-provided MIME types, filenames, file sizes, durations, or storage keys. Verify uploads server-side and prevent unauthorized access to unpublished audio.

## 6. Authentication, Users, and Favorites

Implement authentication only where it adds meaningful functionality.

Support:

- Registration and login
- Secure sessions
- User profiles
- Favorites synchronized across devices for authenticated users
- Guest favorites stored locally
- Recently played sounds
- User-upload management
- Server-side authorization for all protected operations

Use Auth.js with a compatible MongoDB integration if authentication is implemented. Alternatively, use a carefully configured credentials provider if appropriate.

Never trust user IDs, roles, or permissions supplied by the client. Derive authenticated identity from the validated server-side session.

For the MVP, prioritize guest browsing and playback. Authentication should be added without blocking the core soundboard experience.

## 7. User Dashboard

Create a protected user dashboard for authenticated users with:

- Profile details and account settings
- Favorites synchronized across devices
- Recently played sounds
- A list of the user's uploads, with upload and moderation status
- Links to edit or remove uploads when permitted
- Clear empty, loading, success, and error states

Protect every dashboard page and server operation with server-side session checks. Users may manage only their own profile, favorites, and uploads. Keep public browsing and playback available to guests.

## 8. Admin Dashboard

Create a protected admin dashboard with:

- Overview of sounds, plays, uploads, and reports
- Create, edit, publish, unpublish, and delete sounds
- Review and approve pending user uploads
- Manage categories and tags
- Manage featured and trending content
- Review copyright complaints and moderation reports
- Manage users and account status
- View basic analytics

Protect every admin page, Server Action, API route, and mutation with server-side role checks.

Create a secure way to provision the initial administrator. Never allow users to assign themselves an admin role through registration or profile updates.

## 9. MongoDB and Mongoose Architecture

Create Mongoose models and schemas for the following entities:

- User
- Sound
- Category
- Tag, if separate tag documents are necessary
- Favorite
- Report
- PlayEvent or another suitable analytics representation

Use references where appropriate and embed small, tightly related data when it improves query efficiency.

Each model should include appropriate validation, timestamps, and indexes.

Examples of required constraints and indexes:

- Unique sound slug
- Unique category slug
- Efficient sound queries by publication status, creation date, and popularity
- Efficient category and tag filtering
- Unique user-to-sound favorite relationships
- Indexes for moderation reports and pending uploads

Use atomic MongoDB operations to update counters and prevent duplicate favorites.

Do not increment play counts on every React render or trust client-provided counters. Record legitimate playback events through a rate-limited server endpoint or another appropriate mechanism. Use aggregation or periodic rollups when needed.

Implement a reusable MongoDB connection utility that caches the Mongoose connection appropriately for Next.js development and serverless deployment.

Keep database operations in a dedicated data-access layer rather than scattering Mongoose queries throughout UI components.

Validate every external input and database mutation with Zod. Keep Zod validation and Mongoose schema validation consistent.

## 10. SEO

Implement:

- Dynamic metadata for sound and category pages
- Canonical URLs
- XML sitemap
- robots.txt
- Open Graph and social sharing metadata
- Semantic HTML
- Breadcrumbs and internal linking
- Appropriate structured data when eligible
- Pagination metadata where appropriate

Do not index unpublished sounds, private user pages, empty search results, or duplicate and low-value pages.

Use stable canonical URLs and avoid creating unlimited crawlable search or filter combinations.

## 11. Performance and Security

Follow production best practices:

- Prefer React Server Components for static and data-driven UI
- Use Client Components only for interactive functionality
- Use pagination and bounded database queries
- Add appropriate caching and cache invalidation
- Lazy-load audio and avoid unnecessary preloading
- Use database indexes and select only required fields
- Implement rate limiting for uploads, authentication, reports, and playback analytics
- Validate and sanitize external inputs
- Protect against unauthorized mutations and insecure object access
- Keep all secrets and privileged storage credentials server-side
- Use secure session and cookie settings
- Avoid exposing internal errors, stack traces, or database details
- Add structured logging and production error handling
- Document database and object storage backup and recovery procedures

Use Node.js runtime for routes that require Mongoose or Node.js-specific libraries. Do not use the Edge runtime for Mongoose-dependent handlers.

## 12. Code Organization

Use a feature-based, maintainable project structure. For example:

- `app/` — pages, layouts, loading states, error states, and API routes
- `components/` — shared UI components
- `features/` — soundboard, search, favorites, uploads, authentication, and admin features
- `models/` — Mongoose models and schemas
- `lib/db/` — MongoDB connection and database utilities
- `lib/auth/` — authentication and authorization
- `lib/storage/` — object storage integration
- `lib/validation/` — shared Zod schemas
- `lib/utils/` — reusable utilities
- `services/` — business logic
- `types/` — shared TypeScript types
- `scripts/` — database seeding and maintenance scripts
- `tests/` — unit and integration tests

Adjust the structure if a better architecture is justified. Avoid unnecessary abstraction and duplicated code.

## 13. Three-Phase Implementation Plan

Work in three testable phases. Complete each phase's acceptance criteria before moving on. Keep the application functional throughout development, use real server-side operations and MongoDB data, and do not replace unfinished features with fake API responses or hardcoded production data.

### Phase 1: Architecture, Database, and Server Foundation

Plan and implement the shared foundation used by the public site, user dashboard, and admin dashboard:

- Define the application architecture, feature-based project structure, route plan, server/API plan, and security boundaries.
- Design the MongoDB data model and relationships for users, sounds, categories, tags, favorites, reports, and playback analytics. Add Mongoose schemas, validation, timestamps, indexes, and seed scripts.
- Implement a reusable cached Mongoose connection and a dedicated data-access and service layer. Keep database queries out of UI components.
- Define and validate server actions and API endpoints for sounds, search, categories, favorites, user uploads, moderation, reports, and analytics. Validate external input with Zod and enforce authorization on the server.
- Implement authentication, secure sessions, role checks, and safe initial-admin provisioning. Derive identity and permissions from the server-validated session, never client-supplied IDs or roles.
- Implement audio storage integration, signed upload workflow, server-side file verification, upload limits, duplicate detection, metadata extraction, and safe access/deletion rules.
- Establish environment configuration, structured error handling/logging, rate limits, and local development setup.

**Phase 1 acceptance criteria:**

- MongoDB and object storage integrations use real configured services; no production data is hardcoded.
- Models, indexes, data-access functions, and server endpoints are validated and have appropriate tests.
- Authentication and authorization protect every server-side operation, including upload and future dashboard operations.
- Local setup is documented and can seed sample sounds that are owned, licensed, or otherwise authorized for use.

### Phase 2: Public Soundboard and User Dashboard

Build the complete guest and signed-in user experience on the Phase 1 foundation:

- Deliver the responsive homepage, sound grid, navigation, categories/tags, trending/popular/recent/featured sections, and theme support.
- Implement sound detail pages with accessible playback controls, permitted downloads, sharing, favorites, related sounds, metadata, and breadcrumbs.
- Implement validated search, category filters, sorting, bounded pagination, and loading, empty, error, and not-found states.
- Build the protected user dashboard with profile/account settings, cross-device favorites, recently played sounds, and the user's uploads with moderation status and permitted management actions.
- Allow guest browsing, playback, and locally stored favorites without requiring authentication. Require a validated session for protected user data and mutations.
- Implement user audio submission and status feedback, with pending submissions private until approved.
- Add public-page SEO, canonical URLs, sitemap/robots behavior, accessible interactions, and responsive layouts.

**Phase 2 acceptance criteria:**

- Guest discovery and playback work end-to-end, and pagination/search use real server queries.
- Signed-in users can manage only their own dashboard data, favorites, and uploads; unauthorized access is rejected server-side.
- Unpublished sounds and private dashboard data are not exposed or indexed.
- Critical public and user flows have tests, and all UI states are handled without nonfunctional controls.

### Phase 3: Admin Dashboard, Moderation, and Production Readiness

Complete administrative operations, platform safety, and release validation:

- Build a protected admin dashboard with sound, play, upload, and report overviews.
- Implement sound creation/editing, publication controls, deletion, category/tag management, and featured/trending management.
- Implement pending-upload review and approval/rejection, copyright complaints, moderation reports, user/account management, and basic analytics.
- Enforce admin role checks on every admin page, server action, API route, and mutation; test that ordinary users cannot invoke admin operations.
- Complete rate limiting, caching and invalidation, security review, structured logging, database/object-storage backup and recovery guidance, and production configuration.
- Test critical business logic, validation, authorization, sound lifecycle, upload restrictions, moderation, search, pagination, favorites, reports, and dashboard states.
- Run linting, TypeScript checks, and the production build; resolve failures before declaring the application complete.
- Complete deployment and operations documentation, including Vercel, MongoDB, object storage, environment variables, backup, and recovery.

**Phase 3 acceptance criteria:**

- Admin workflows operate on persisted data and are inaccessible to non-admin users, including through direct server/API calls.
- Moderation and copyright workflows prevent unapproved or removed content from being publicly served.
- Essential end-to-end tests, linting, type checks, and production build pass.
- Deployment, configuration, and recovery procedures are documented; no placeholder security mechanisms or nonfunctional buttons remain.

## 14. Environment Configuration

Provide a complete `.env.example` containing all required variables, such as:

- `MONGODB_URI`
- `AUTH_SECRET`
- `AUTH_URL`, if required by the selected Auth.js configuration
- Object storage account or endpoint configuration
- Object storage bucket name
- Object storage access credentials
- Public audio delivery base URL, if applicable
- Application base URL

Use the exact environment variable names required by the chosen libraries and implementation. Explain each variable, whether it is required, and where to obtain its value.

Never commit real secrets to Git.

## 15. Documentation

Create a complete README covering:

- Project overview and features
- Prerequisites
- Installation
- Environment variable configuration
- Local development
- MongoDB setup
- Mongoose model and index initialization
- Database seeding
- Object storage configuration
- Authentication setup
- Testing and linting
- Production build
- Vercel deployment
- Backup and recovery guidance

Do not include Prisma models, Prisma migrations, or Prisma commands. Use Mongoose models, MongoDB indexes, and seed scripts instead.

## Final Requirements

Prioritize a polished user interface, fast audio playback, reliable database operations, security, accessibility, and maintainable code.

Do not leave nonfunctional buttons, fake backend behavior, or placeholder security mechanisms.

Do not claim that a feature is complete unless its implementation and essential tests are in place.

Follow the three phases in order. Begin with Phase 1 by presenting the architecture, MongoDB/Mongoose design, server/API and route plan, authentication/authorization approach, audio storage workflow, security considerations, and phase checklist before implementing the foundation.