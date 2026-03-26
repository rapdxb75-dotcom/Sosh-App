# LoginForm Component Documentation

`LoginForm` is the primary entry point for user authentication, handling input validation, API interaction, local storage persistence, and initial app state setup (Redux, Firebase, FCM).

## 1. 🧠 Logic / Business Logic

### Purpose
To provide a secure and user-friendly interface for logging into the application, ensuring that all necessary user data and services (Push Notifications, Firebase listener) are initialized upon successful authentication.

### State Variables
- **`email` / `password`**: `useState(string)` — Stores user credentials.
- **`showPassword`**: `useState(boolean)` — Toggles password visibility.
- **`errors`**: `useState({ email, password })` — Stores validation error messages.
- **`loading`**: `useState(boolean)` — Tracks API request status to disable the button and show an `ActivityIndicator`.

### Key Functions
- **`handleLogin`**:
    - **Validation**: Checks for empty fields and valid email regex.
    - **API Call**: Executes `authService.login`.
    - **Post-Login Sequence**:
        1. Decodes JWT to extract `userName`, `email`, and `profilePicture`.
        2. Persists data to `AsyncStorage` via `storageService`.
        3. Updates Redux store (`setUserData`).
        4. Initializes Firebase and FCM (Push Notifications).
        5. Fetches initial user data from Firestore (specifically `aiAdditions`).
        6. Pre-fetches chat conversations after a 1.5s delay to ensure storage stability.
        7. Redirects to `/(tabs)/home`.

### Side Effects
- **Delayed Fetching**: Uses `setTimeout` to fetch conversations, preventing race conditions between disk writes and network requests.
- **Notifications**: Triggers both a global `NotificationContext` alert and a visual `Toast` on success/failure.

---

## 2. 🔌 API / Service Integration

### Services Used
| Service | Action | Description |
| :--- | :--- | :--- |
| `authService` | `login()` | Backend authentication endpoint. |
| `storageService` | `setToken()`, `setEmail()`, etc. | Persists session to `AsyncStorage`. |
| `firebaseService` | `initializeFirebase()`, `initializeFCM()` | Sets up Firestore and Push Notifications. |
| `chatService` | `getConversations()` | Pre-warms the chat cache for the Home screen. |

### Data Structures
- **Request**: `{ email, password }`
- **Response**: `{ token, profilePicture, message? }` (JWT contains `userName` and `email`).

---

## 3. 🎨 UI / User Interface

### Visual Design
- **Background**: Uses `ImageBackground` (implicitly via parent) and `BlurView` for a "Glassmorphism" effect.
- **Layout**: Centered logo, welcome typography, and a "Login Card" with a floating-label style input.
- **SVG Styling**: A custom SVG `Rect` provides a precision gradient border that fades at the bottom to match the card's transparency.

### Elements
- **Logo**: 54px centered image.
- **Inputs**: Custom `BlurView` wrapped `TextInput` components with `placeholderTextColor` support.
- **Eye Toggle**: `Eye`/`EyeOff` icons from `lucide-react-native` for password security.
- **Submit Button**: High-contrast blue button with `ActivityIndicator` support during `loading`.

### User Interactions
- **Tap Outside**: `TouchableWithoutFeedback` on the parent screen dismisses the keyboard.
- **ValidationError**: Inputs show red border/text if validation fails before triggering the API.
- **Haptics**: Integration via `NotificationContext` alerts.
