# Profile Screen Documentation

The `Profile` screen is the user's personal dashboard for managing their identity, social media connections, and global app settings.

## 1. 🧠 Logic / Business Logic

### Core Responsibilities
- **Profile Management**: Updating `userName` and `profilePicture` across Redux and Firestore.
- **Social Integration**: Managing OAuth links and displaying connection status for platforms like Instagram, TikTok, and YouTube.
- **Data Synchronization**: Synchronizes user metrics (Posts, Likes, Views) from Firebase to the UI.

### State & Hooks
- **`globalUserName` / `globalProfilePicture`** (Redux): Primary sources of truth for the user's identity.
- **`socialMediaData`**: Local state tracking which platforms are currently authenticated (e.g., `{ instagram: ["username1"], tiktok: [] }`).
- **`analytics`**: Local state containing high-level totals specifically for the Profile view.
- **`editModalVisible`**: Controls the visibility of the profile editor.

### Key Workflows
- **`pickImage`**: Uses `react-native-image-crop-picker` (with `expo-image-picker` fallback) to select and optionally crop a circular profile picture.
- **`handleSaveProfile`**: 
    1. Validates inputs.
    2. Uploads the new image (source) and username to the backend via `userService.updateUser`.
    3. Triggers a Redux dispatch (`updateUser`) to update the app globally.
- **`connectPlatform`**: 
    1. Determines the specific OAuth URL for the social platform.
    2. Opens a browser via `Linking.openURL`.
    3. Adds the platform to `pendingConnections` while waiting for the OAuth callback to update Firestore.

---

## 2. 🔌 API Integration

### Service Methods
| Service | Method | Usage |
| :--- | :--- | :--- |
| `userService` | `updateUser(formData)` | POST request to update core profile details. |
| `firebaseService` | `listenToUserData()` | Real-time subscription for profile changes and social connection status. |
| `storageService` | `getToken()` | Retrieves the bearer token for authenticated requests. |

### Social Media OAuth
Interacts with external providers (Instagram, TikTok, YouTube) by redirecting users to their respective authorization pages.

---

## 3. 🎨 UI / User Interface

### Visual Features
- **Profile Card**: Centered layout with a large avatar wrapped in a `GradientRingSVG`.
- **Analytics Grid**: Displays `Total Posts`, `Total Likes`, and `Total Views` in a side-by-side format.
- **Social Platform List**: A vertical list of platform rows, each showing the platform icon, name, and connection status (Connected / Connect).

### Component Elements
- **`Header`**: Standard app header with notification and logout access.
- **Edit Modal**: A pop-up form with text inputs and a circular image uploader.
- **`ActivityIndicator`**: Shown during profile save or image processing.
- **`Toast` / `addNotification`**: Provides immediate feedback after profile updates or connection attempts.

### Responsive Design
- **Safe Area**: Uses `useSafeAreaInsets` to ensure content remains visible behind the standard OS status bar and home indicator.
- **Haptics**: light impact on image picking and form interactions.
- **Skeleton Views**: Implemented for analytics cards while `loading` is true.
