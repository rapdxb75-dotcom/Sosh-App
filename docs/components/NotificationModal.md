# NotificationModal Component Documentation

The `NotificationModal` is a global overlay rendering application-level push notifications, system warnings, and success toasts that have been funneled into the `NotificationContext`.

## 1. 🧠 Logic / Business Logic

### State and Data Slicing
- Subscribes heavily to `useNotification` Context Hooks.
- **Read State**: Triggers `markAsRead()` forcefully upon the `useEffect` firing when the modal becomes visible, clearing header badges implicitly.
- **Time Grouping**: Mathematically segments the single flat notification `array` into two distinct arrays (`todayNotifs` and `earlierNotifs`) by normalizing the JavaScript `Date` offsets against midnight of the local clock.

### Utilities
- `getRelativeTime`: Translates raw timestamps into humanized shorthand (e.g., "Just now", "2m ago", "1h ago", "Yesterday").
- `getTypeColor`: A static map identifying semantic meaning (success/error/info) to precise branding hex colors.

---

## 2. 🔌 API Integration

*Displays context data initialized indirectly via `firebase.ts` FCM push listeners or local component API success handlers.*

---

## 3. 🎨 UI / User Interface

### Render Layers
- Mounted inside a pure React Native `Modal` spanning transparently over the entire OS viewport (`statusBarTranslucent`).
- **Dimming**: Relies on a heavily tinted `BlurView` (`intensity={80}`) to push the active app screen gracefully into the background.

### Scrollable Lists
- Injects a `ScrollView` wrapped into a rounded "Card" sheet centered structurally.
- Renders `NotificationRow` instances which utilize dynamic left-border colors matching their semantic type.
- **Empty State**: If the notification context is structurally empty, it draws a centered `Bell` icon and a reassuring "All caught up!" messaging block.

### Interactions
- Heavy reliance on `expo-haptics`: Light taps for dismissal of single notifications, and Medium impacts for full-list wipes via the Red Trashcan header button.
