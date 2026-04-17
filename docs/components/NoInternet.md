# NoInternet Component Documentation

The `NoInternet` screen is a dedicated full-screen fallback UI triggered when the application loses networking capabilities or encounters critical Firebase reachability dropouts.

## 1. 🧠 Logic / Business Logic

### Isolation 
- Functionally decoupled from `react-navigation`. It accepts a single `onRetry` callback prop designed to allow the parent boundary (specifically the `ErrorBoundary.tsx`) to forcibly re-evaluate the DOM state and attempt to reconnect.

---

## 2. 🔌 API Integration

*Ironically, this component exists explicitly for when APIs are unreachable.*

---

## 3. 🎨 UI / User Interface

### Layout
- **Full Screen**: Wraps itself in a `SafeAreaView` with a hard `#000000` pitch-black background, ensuring it visually takes over the entire display unit to convey interruption severity.
- **Iconography**: Uses the `WifiOff` SVG from `lucide-react-native`, encased within a subtle grey `#1A1A1A` halo background.
- **Typography and CTA**: 
  - Centered messaging clarifying the situation gracefully (`Your internet connection is currently unavailable...`).
  - Prominent pill-shaped "Try Again" button spanning the width of the container, utilizing high-contrast black-on-white text to draw the user's thumb instinctually.
