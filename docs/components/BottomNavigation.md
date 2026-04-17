# BottomNavigation Component Documentation

The `BottomNavigation` acts as the customized persistent tab bar displayed at the bottom of the screen across the `/(tabs)` group, providing main spatial routing and the floating 'Create Post' primary action button.

## 1. 🧠 Logic / Business Logic

### State and Routing
- Receives state from `expo-router`'s underlying React Navigation implementation via `BottomTabBarProps`.
- Uses `state.routes[state.index].name` to determine the currently active tab.
- **`navigateTo(routeName)`**: Core logic handler that:
  - Triggers a light haptic tap.
  - Emits the standard `tabPress` event to Navigation.
  - Pushes the new route (with `merge: true` if already in the stack).

---

## 2. 🔌 API Integration

*This component has no backend integration. It purely dictates navigation flow on the client.*

---

## 3. 🎨 UI / User Interface

### Layout structure
- Utilizes `absolute` positioning to float above the content instead of taking up layout space natively.
- Dynamically scales its `bottom` spacing offset by utilizing `useSafeAreaInsets()`, ensuring it never collides with the iOS home indicator or Android navigation gestures.

### Advanced Visual Effects
- **Frosted Glass Engine**: The root background uses a `BlurView` with `intensity={20}` and `tint="dark"` for OS-level background blur.
- **Micro-interactions**: The active tab highlights itself dynamically by setting an opaque white background (`bg-[#FFFFFF1A]`) behind the icon.
- **SVG Gradients**: 
  - To achieve a premium 'glowing border', the component renders a `react-native-svg` frame positioned absolutely beneath the buttons. The `LinearGradient` provides subtle edge illumination.
  - The elevated center "Create Post" button uses complex overlapping positioning (`-mt-14`) bursting out of the normal tab boundary to draw user attention. It contains a rigid drop shadow (`elevation: 14`) to float above the `BlurView`.
