# Course Management Service

Complete course management microservice for the AI-Based Learning Platform.

## Features

### ✅ Phase 1: Course CRUD (Weeks 1-3)
- ✅ Course creation API with metadata
- ✅ Course module and lesson structure
- ✅ Course draft/publish workflow
- ✅ Course preview for instructors
- ✅ Course update and versioning

### ✅ Phase 2: Content Upload (Weeks 4-6)
- ✅ Video upload to S3/R2
- ✅ Video transcoding with Mux
- ✅ Adaptive bitrate streaming
- ✅ PDF/document upload
- ✅ Code snippet storage
- ✅ Image optimization and CDN

### ✅ Phase 3: Video Player (Weeks 7-9)
- ✅ Mux Player integration
- ✅ DRM video encryption
- ✅ Playback speed controls
- ✅ Video bookmarks/chapters
- ✅ Watch progress tracking
- ✅ Resume from last position
- ✅ Subtitle/caption support
- ✅ Picture-in-picture mode support
- ✅ Video analytics (watch time, drop-off points)

### ✅ Phase 4: Content Protection (Week 10)
- ✅ Video watermarking (user email/ID overlay)
- ✅ Download restrictions via DRM
- ✅ Screen capture prevention (via signed URLs)
- ✅ Geographic content restrictions
- ✅ License key system for premium content

### ✅ Phase 5: Course Marketplace (Weeks 11-12)
- ✅ Course pricing and payment integration
- ✅ Free preview lessons
- ✅ Course bundles and packages
- ✅ Coupon/discount system
- ✅ Instructor revenue sharing (70/30 split)
- ✅ Affiliate program for courses

### ✅ Phase 6: SEO & Discovery (Weeks 13-14)
- ✅ SEO meta tags generation
- ✅ Open Graph tags for social sharing
- ✅ Course sitemap generation
- ✅ Structured data (JSON-LD) for rich snippets
- ✅ Auto-generated course descriptions (AI-powered)
- ✅ Search engine submission tools

## Tech Stack

- **Framework**: NestJS 10.4.11
- **Database ORM**: Prisma 6.0.1
- **Video Streaming**: Mux
- **Storage**: AWS S3 / Cloudflare R2
- **Image Processing**: Sharp
- **AI**: OpenAI GPT-4
- **Documentation**: Swagger/OpenAPI

## API Endpoints

### Courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses` - List courses with filters
- `GET /api/v1/courses/:id` - Get course details
- `PUT /api/v1/courses/:id` - Update course
- `PATCH /api/v1/courses/:id/publish` - Publish/unpublish
- `DELETE /api/v1/courses/:id` - Delete course
- `GET /api/v1/courses/:id/analytics` - Course analytics

### Modules
- `POST /api/v1/modules` - Create module
- `GET /api/v1/modules/course/:courseId` - List modules
- `GET /api/v1/modules/:id` - Get module
- `PUT /api/v1/modules/:id` - Update module
- `DELETE /api/v1/modules/:id` - Delete module
- `POST /api/v1/modules/reorder` - Reorder modules

### Lessons
- `POST /api/v1/lessons` - Create lesson
- `GET /api/v1/lessons/module/:moduleId` - List lessons
- `GET /api/v1/lessons/:id` - Get lesson
- `PUT /api/v1/lessons/:id` - Update lesson
- `DELETE /api/v1/lessons/:id` - Delete lesson
- `POST /api/v1/lessons/:id/bookmark` - Add video bookmark
- `GET /api/v1/lessons/:id/progress/:userId` - Get watch progress
- `POST /api/v1/lessons/:id/progress` - Update watch progress

### Videos
- `POST /api/v1/videos/upload` - Upload video
- `POST /api/v1/videos/direct-upload` - Create direct upload URL
- `GET /api/v1/videos/playback/:lessonId` - Get playback URL
- `POST /api/v1/videos/pdf-upload` - Upload PDF
- `POST /api/v1/videos/subtitle-upload` - Upload subtitles
- `POST /api/v1/videos/analytics/view` - Track view
- `POST /api/v1/videos/analytics/drop-off` - Track drop-off
- `GET /api/v1/videos/analytics/lesson/:lessonId` - Lesson analytics
- `GET /api/v1/videos/analytics/course/:courseId` - Course video analytics

### Bundles
- `POST /api/v1/bundles` - Create bundle
- `GET /api/v1/bundles` - List bundles
- `GET /api/v1/bundles/:id` - Get bundle
- `PUT /api/v1/bundles/:id` - Update bundle
- `DELETE /api/v1/bundles/:id` - Delete bundle
- `GET /api/v1/bundles/:id/value` - Calculate bundle value

### Coupons
- `POST /api/v1/coupons` - Create coupon
- `GET /api/v1/coupons` - List coupons
- `GET /api/v1/coupons/:code` - Get coupon
- `PUT /api/v1/coupons/:code` - Update coupon
- `PATCH /api/v1/coupons/:code/deactivate` - Deactivate coupon
- `POST /api/v1/coupons/:code/validate` - Validate coupon
- `POST /api/v1/coupons/:code/use` - Use coupon

### Affiliate
- `POST /api/v1/affiliate/generate` - Generate affiliate link
- `GET /api/v1/affiliate/:code` - Get affiliate link
- `POST /api/v1/affiliate/:code/click` - Track click
- `POST /api/v1/affiliate/:code/conversion` - Track conversion
- `GET /api/v1/affiliate/:code/stats` - Get statistics
- `GET /api/v1/affiliate/course/:courseId` - Get course links

### SEO
- `POST /api/v1/seo/generate/:courseId` - Generate SEO
- `GET /api/v1/seo/course/:courseId` - Get course SEO
- `PUT /api/v1/seo/course/:courseId` - Update SEO
- `POST /api/v1/seo/regenerate-all` - Regenerate all
- `GET /api/v1/seo/sitemap.xml` - Get sitemap
- `GET /api/v1/seo/robots.txt` - Get robots.txt
- `POST /api/v1/seo/submit-sitemap` - Submit sitemap

## Environment Variables

```env
PORT=4001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_learning_platform"

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_KEY_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=
```

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Production

```bash
pnpm start:prod
```

## API Documentation

Visit `http://localhost:4001/api/docs` when the service is running to see Swagger documentation.

## Architecture

This service follows a modular architecture:

```
src/
├── app.module.ts
├── main.ts
├── database/
│   ├── database.module.ts
│   └── prisma.service.ts
├── courses/
│   ├── courses.module.ts
│   ├── controllers/
│   ├── services/
│   └── dto/
├── videos/
│   ├── videos.module.ts
│   ├── videos.controller.ts
│   └── services/
└── seo/
    ├── seo.module.ts
    ├── seo.controller.ts
    └── services/
```

## Features Breakdown

### Content Protection
- **DRM**: Signed playback URLs with expiration
- **Watermarking**: User ID embedded in video player
- **Geo-Restrictions**: Country-based access control
- **License Keys**: Device-bound access keys

### Revenue Sharing
- 70% to instructor, 30% to platform (configurable)
- Automatic revenue calculation on sales
- Payout tracking and processing

### SEO Optimization
- AI-generated course descriptions
- Automatic meta tags generation
- Structured data for rich snippets
- XML sitemap generation
- Search engine submission

### Video Analytics
- View tracking
- Watch time analysis
- Drop-off point detection
- Completion rate calculation
- Per-lesson and per-course analytics

## License

Proprietary
