# Create Post Service Documentation

The `createPostService` handles complex media uploading, scheduling, and post-generation workflows, typically dealing with `multipart/form-data`.

## 1. 🧠 Logic / Business Logic

### Shared Logic per Function
- **Payload Formatting**: Converts standard JSON payloads into `FormData` to support image and video uploads.
- **Tag Formatting**: Automatically prepends `@` to tags if missing.
- **Platform Transformation**: Specifically maps the `"x"` platform identifier to `"twitter"` before submitting it to the API, preserving backend mappings while allowing localized frontend display.
- **Scheduling**: If `publishNow` is false, it injects the `scheduleDate` formatted accurately with the device's local timezone offset using a helper `formatDateWithOffset()`.

### Post Variations
- **Standard Post (`createPost`)**: Handles basic image uploads, text generation prompts, and multi-image posts (if sent as arrays).
- **Reel (`createReel`)**: Configured specifically for video files. Includes advanced flags like `isReel="true"` and thumbnail time offsets.
- **Story (`createStory`)**: Simplified payload optimized for ephemeral content; expects standard media uploads without rich caption tagging workflows.
- **Carousel (`createCarousel`)**: Formats multiple `mediaUrl` files within the `FormData` interface explicitly to create multi-slide backend objects.

---

## 2. 🔌 API Integration

### Core Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `createPost` | `/create-post` | Standard REST webhook for static feed posts. |
| `createReel` | `/create-reels` | Dedicated webhook for vertical video with thumbnails. |
| `createStory`| `/create-story`| Webhook targeting ephemeral 24-hour stories. |
| `createCarousel`|`/create-carousels`| Multi-part webhook strictly for grouped slide image posts. |

- **Headers**: Forces `Content-Type: multipart/form-data` and attaches the user's Bearer token.

---

## 3. 🎨 UI / User Interface

*This service hooks directly into the core Create Post flow:*
- Feeds data from the complex multi-step UI in `createPost.tsx`, receiving the stringified tags, platform toggle arrays, and base64 mapped media payloads.
