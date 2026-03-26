# Header Component Documentation

The `Header` is a global navigation component providing access to notifications, branding, and user account management.

## 1. 🧠 Logic / Business Logic

### State Management
- **`showDropdown`**: `useState(boolean)` — Controls the visibility of the user profile logout menu.
- **`profilePic`** (Redux): Fetched from `userSlice` to display the user's avatar.
- **`unreadCount`** (Context): Accessed via `useNotification` to show the notification badge.

### Functions and Handlers
- **`handleLogout`**:
    - Triggers a medium haptic feedback.
    - Adds a "Logged Out" notification via `NotificationContext`.
    - Clears Redux state (`clearUserData`).
    - Calls `storageService.logout()` to clear local tokens/storage.
    - Redirects user to the root login screen (`/`).
- **Toggle Dropdown**: Switches `showDropdown` to show or hide the logout menu.

---

## 2. 🔌 API / Service Integration

### Context & Services
- **`useNotification`**: Used to trigger the notification modal (`showNotifications`) and add log-out alerts.
- **`storageService`**: Interacts with local storage to clear session data during logout.
- **Redux**: Reads user profile data and resets the store on logout.

---

## 3. 🎨 UI / User Interface

### UI Elements
- **Logo Area**: Left-aligned branding image.
- **Notification Icon**: Trigger for the notification modal. Includes a red badge displaying `unreadCount` (clamped at "99+").
- **Profile Avatar**: 
    - Displays a custom uploaded image or a default avatar.
    - Wrapped in a `GradientRingSVG` for a premium look.
- **Logout Dropdown**: 
    - Positioned absolutely below the profile icon.
    - Uses `BlurView` for a frosted glass effect.
    - Contains an SVG gradient border for precise styling.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableTopSpacing` | `boolean` | `false` | If true, removes the top safe area padding (useful when the parent already handles it). |

### Animations and Interactions
- **Haptics**: Light impact on notification/profile clicks, medium impact on logout.
- **Blurred Visuals**: Uses `expo-blur` for both the gradient ring background and the dropdown menu.
