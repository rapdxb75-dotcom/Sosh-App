# Home Screen Documentation

The `Home` screen serves as the main dashboard for the user, providing a high-level overview of their social media analytics and a greeting interface to start content creation.

## 1. 🧠 Logic / Business Logic

### Purpose
The `Home` screen aggregates user performance data (Followers, Likes, Views) and profile information. it serves as the entry point after authentication, displaying "Live Data" fetched from Firebase.

### State Variables
- **`analytics`**: `useState({ totalFollowers, totalLikes, totalViews })` — Stores the calculated totals of user engagement metrics.
- **`refreshing`**: `useState(boolean)` — Tracks the state of the "pull-to-refresh" interaction.
- **`isLoading`**: `useState(boolean)` — Indicates whether the initial data fetch or an update is in progress to show skeleton states.
- **`userName`** (Redux): Derived from `RootState`, used for personalized greeting.
- **`globalEmail`** (Redux): Used as the unique identifier for fetching data from Firebase.

### Functions and Handlers
- **`handleRefresh`**: 
    - Triggered by pulling down on the `ScrollView`.
    - Fetches fresh data using `getCurrentUserData(globalEmail)`.
    - Implements a minimum 1s delay to ensure the refresh animation is visible to the user.
- **`useEffect` (Data Sync)**:
    - Sets up a real-time listener using `listenToUserData`.
    - Automatically updates the local `analytics` state and the Redux `userSlice` (userName, aiAdditions) whenever the database changes.
    - Cleans up the listener on component unmount.

### Edge Cases
- **Missing Analytics**: If `userData.totalAnalytics` is missing, state defaults to 0 to avoid `undefined` crashes.
- **No Global Email**: If the user is not properly logged in (no email in Redux), neither the listener nor the refresh function will execute.

---

## 2. 🔌 API Integration

### Firebase Integration
| Service Function | Trigger | Description |
| :--- | :--- | :--- |
| `getCurrentUserData(email)` | `onRefresh` | One-time fetch of current user document. |
| `listenToUserData(email, callback)` | `onMount` | Real-time subscription to user document changes. |

### Data Usage
- **`totalAnalytics`**: Extracted and formatted using `formatNumber` before being passed to `StatCard`.
- **`userName` / `aiAdditions`**: Dispatched to Redux via `setUserData` to keep the application state synced with the database.

---

## 3. 🎨 UI / User Interface

### Visual Layout
- **Safe Area Management**: Uses `useSafeAreaInsets` for top padding (iOS) and custom bottom padding calculation to ensure content doesn't overlap with the `BottomNavigation`.
- **Scrollable Content**: Wrapped in a `ScrollView` with `RefreshControl`.

### UI Elements
- **`Header`**: Custom component displaying logo, notifications, and profile menu.
- **Greeting Text**: Large personalized heading ("Hello [Name], lets create").
- **Live Data Indicator**: A small green dot and timestamp label.
- **`StatCard` Grid**:
    - **Followers**: Full-width card.
    - **Likes & Views**: Side-by-side half-width cards.

### Conditional Rendering & Interaction
- **Skeleton States**: `StatCard` receives the `loading` prop to show shimmer animations while `isLoading` is true.
- **Pull-to-Refresh**: Standard mobile interaction to force a data update.
- **Dynamic Padding**: `bottomPadding` is calculated based on device safe areas to maintain a consistent gap above the floating upload button.
