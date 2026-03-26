# CreatePost Screen Documentation

`CreatePost` is a large, complex screen that handles unified content creation for multiple social media formats (Post, Reel, Story) across different platforms.

## 1. 🧠 Logic / Business Logic

### Core Functionality

- **Multi-Tab Interface**: Manages state for three distinct content types (Post, Reel, Story), each with its own media, caption, and platform selections.
- **Content Sub-types**:
  - **Post**: Single image/video or Carousel.
  - **Reel**: Short-form video with cover selection.
  - **Story**: Single photo or short video.
- **Scheduling**: Integration with `DateTimePicker` to schedule posts for future dates.
- **Media Optimization**: Integrated video compression using `react-native-compressor` to ensure uploads meet platform size limits (e.g., <100MB for Stories).

### State Management

- **`tabData`**: The master state object (`INITIAL_TAB_DATA`). It stores nested data for `Post`, `Reel`, and `Story` to preserve user input when switching between tabs.
- **`activeTab`**: Tracks currently selected content type ("Post", "Reel", or "Story").
- **`scrubberPositionMs`**: Tracks the selected frame timestamp for video covers.
- **`isPublishing`**: UI lock to prevent duplicate submissions and show loading states.

### Key Workflows

1. **AI Caption Generation**: Uses `poppyService` to generate creative captions based on user prompts.
2. **Video Scrubber / Cover Selection**: Uses `PanResponder` and a "safe seek" mechanism to allow users to select a specific frame from a video as a thumbnail.
3. **Voice-to-Text**: Integrates `speechRecognitionModule` for hands-free captioning.
4. **Compression & Duration Constraints**:
   - **Story Duration**: Specifically monitors video length for Stories. If a video exceeds the platform-standard **60 seconds**, the UI provides feedback, and the compression engine prioritizes reducing file size (<100MB) over high bitrates.
   - **Resolution Steps**: Iteratively compresses videos at different resolutions (1280p -> 960p -> 720p) until they meet size constraints (100MB for Stories, 300MB for Reels).
   - **Utility**: Checks file size via `expo-file-system` and `react-native-compressor` before triggering the publish sequence.

### Edge Cases

- **Post Preview Sync**: When entering the **Post Preview** screen, all current state (captions, media, chosen covers) is serialized and passed as a `previewData` object to ensure a 1:1 visual match with what will be published.
- **Background Publishing**: Uses `AppState` to monitor if the user leaves the app during an upload. If backgrounded, it assumes success once the app returns (as webhooks often finish regardless of connection).
- **Timeout Handling**: Specifically catches `ECONNABORTED` to show a "Processing" message instead of an error, as backend webhooks often trigger successfully even if the response times out.

---

## 2. 🔌 API Integration

### Service Calls

| Service             | Method                           | Usage                                                               |
| :------------------ | :------------------------------- | :------------------------------------------------------------------ |
| `createPostService` | `createPost`, `createReel`, etc. | Core endpoints for final content delivery.                          |
| `poppyService`      | `generateCaption`                | AI-assist for writing captions.                                     |
| `firebaseService`   | `listenToUserData`               | Fetches connected social media handles to show available platforms. |

### Data Preparation

- **Media Payload**: Transforms local URIs into `FormData` compatible objects with `uri`, `type`, and `name`.
- **Platform Mapping**: Maps internal boolean state (e.g., `instagram: true`) to a list of strings required by the backend.

---

## 3. 🎨 UI / User Interface

### Layout & Containers

- **Tab Navigation**: A custom glass-morphic tab switcher at the top.
- **Preview Area**: Dynamic scaling (4:5 for Posts, 9:16 for Reels/Stories) to mimic real-world Instagram/TikTok aspect ratios.
- **Platform Selection Bar**: A scrolling row of social media icons that users can toggle.

### UI Elements

1. **Media Uploader**: Supports single selection, carousels (Draggable Grid), and video indicators.
2. **Voice & AI Buttons**: Float above the caption input for quick access.
3. **Draggable Grid**: For Carousel posts, allows users to reorder images by dragging.
4. **Video Scrubber Modal**: Overlays a film-strip view where users can drag a selector to choose a cover frame.

### Animations

- **Mic Pulse**: Pulsing scale animation when voice recognition is active.
- **Modal Transitions**: Smooth entry for "Generate AI Caption" and "Cover Selection" modals.

### Component Details

| Feature        | Details                                                         |
| :------------- | :-------------------------------------------------------------- |
| **Carousel**   | Uses `DraggableGrid` for intuitive reordering.                  |
| **Scheduling** | Conditionally renders `DateTimePicker` for date/time selection. |
| **Tags**       | Chip-based interface for adding and removing hashtags.          |
| **Reel Cover** | Real-time preview of the selected frame on the video.           |
