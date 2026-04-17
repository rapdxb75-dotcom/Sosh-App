# ErrorBoundary Component Documentation

The `ErrorBoundary` is a critical React Class Component wrapped around the global application layout to catch unhandled JavaScript exceptions, network failures, or rendering tears before they crash the host OS process.

## 1. 🧠 Logic / Business Logic

### Lifecycle Methods
- **`getDerivedStateFromError`**: Native React API utilized to intercept an error down the DOM tree and eagerly flip the `hasError` state boolean to `true` to mount the fallback UI.
- **`componentDidCatch`**: 
  - Silently logs the crash.
  - **Crashlytics Gatekeeper**: Explicitly evaluates the error message string. If it detects network disconnects, Firestore unavailability warnings, or generic "Internet connection" string parts, it intentionally skips logging the error to `@react-native-firebase/crashlytics`. This prevents dashboard pollution from standard connectivity hiccups.

### Recovery Flow
- **`handleReset`**: Allows the user to reset the `hasError` state boolean locally, attempting to redraw the child component tree.

---

## 2. 🔌 API Integration

### Firebase Crashlytics
- Directly integrates `crashlytics().recordError(error)` to pipeline hard faults and logic exceptions over to the Google Cloud dashboard for remote debugging.

---

## 3. 🎨 UI / User Interface

### State Rendering
- **Network Errors**: If it string-matches a network-specific phrase, instead of rendering a harsh error screen, it elegantly routes into the `NoInternet` fallback component.
- **Generic Crashes**: If unhandled, forces a stark, full-screen blackout layout (`backgroundColor: "#000"`) ensuring no underlying broken UI states leak through. It provides a simple "Try Again" recovery CTA to invoke the `handleReset` pipeline.
