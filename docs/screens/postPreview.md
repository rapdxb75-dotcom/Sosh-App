# Post Preview Screen Documentation

The `PostPreview` screen provides a high-fidelity mock-up of how the content will appear on social media before the user commits to publishing.

## 1. 🧠 Logic / Business Logic

### Purpose

To ensure users can review their content, check video playback, verify caption accuracy, and confirm platform-specific formatting (like Reel covers) without leaving the creation flow.

### Duration & Limits

- **Story Constraints**: The screen specifically calculates `storyDurationMs` for video stories. It enforces a high-standard check for the **60-second limit** typical for Instagram/TikTok stories.
- **Labeling**: Uses `formatDurationLabel` to provide human-readable timestamps (e.g., `0:45` or `1:05`) for all video content in the preview.

### State & Navigation

- **`previewData` Serialization**: The screen consumes a JSON-serialized parameter containing the entire state of the `CreatePost` screen.
- **Syncing Transitions**: Uses `markPreviewPostSuccessReset` to signal to the `CreatePost` screen when a post has been successfully published from the preview, triggering a state clear on the original screen.

### Handlers

- **`handleGeneratePost`**: Duplicates the heavy-lifting logic from the main creation screen, including media processing, compression checks, and platform-specific API calls (`createReel`, `createStory`, etc.).
- **Media Indexing**: For Carousel posts, it tracks `currentMediaIndex` to allow horizontal swiping through the array of media items.
- **Audio Control**: Implements `Volume2` / `VolumeX` toggles to let users test audio levels before publishing.

---

## 2. 🔌 API Integration

### Publishing Calls

Identical to the `CreatePost` component, it integrates with `createPostService` to perform:

- **`createPost`** / **`createCarousel`**
- **`createReel`** (with `thumbNailOffset` and `thumbnailPayload`)
- **`createStory`**

### AI & Voice

Users can still edit their caption within the preview modal, utilizing `poppyService.generateCaption` and `speechRecognitionModule` for last-minute adjustments.

---

## 3. 🎨 UI / User Interface

### Visual Presentation

- **Dynamic Framing**: Uses `ResizeMode.COVER` or `ResizeMode.CONTAIN` based on the user's preference set in the previous screen.
- **Platform Branding**: Displays the user's social handle (e.g., `@instagram_handle`) and profile picture in a mock-up header.
- **Overlay Elements**: Includes "Like", "Comment", and "Share" icons to simulate the native social media environment.

### Interactions

- **Carousel Pagination**: Animated dot indicators at the bottom showing the user's progress through an image/video slider.
- **Caption Edit Modal**: A glass-morphic pop-up allowing users to update text without navigating away.
- **Publish Button**: A floating white button that triggers the final upload sequence, including the iterative compression progress.

### Visual Feedback

- **Haptics**: `Medium` impact on publish, `Light` impact on media switching and modal toggling.
- **Toast Notifications**: Real-time status updates for compression ("Video is larger than 100MB...") and final success/failure confirmations.
