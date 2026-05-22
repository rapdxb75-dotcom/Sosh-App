# AIConsentModal Component Documentation

`AIConsentModal` is a full-screen overlay modal that presents the AI Data Sharing disclosure to the user and collects explicit consent before AI-powered features are enabled. It wraps `AIDisclosureView` and adds an agree/dismiss footer.

## 1. 🧠 Logic / Business Logic

### Purpose
Satisfy legal/privacy obligations by obtaining informed user consent before sharing data with third-party AI providers (Anthropic, Poppy AI, Ayrshare, Zernio). Consent is persisted to Redux **and** to Firebase via the `updateUser` thunk.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `visible` | `boolean` | — | Controls modal visibility. |
| `onClose` | `() => void` | — | Called when the user dismisses (via ✕ or "Not Now") or after successful consent. |
| `showFooter` | `boolean` | `true` | When `false`, hides the "Not Now / I Agree" action buttons (used for read-only disclosure views). |

### Key Functions

#### `handleAgree`
1. Dispatches `updateUser({ aiConsent: true })` — persists to Redux and `AsyncStorage`.
2. Calls `onClose()` to dismiss the modal.
3. Errors are caught and logged to console without blocking UX.

### Side Effects
- Redux state change (`aiConsent: true`) propagates to all components reading `state.user.aiConsent`.
- `updateUser` also writes the consent flag to `AsyncStorage` so it survives app restarts.

---

## 2. 🔌 API / Service Integration

| Module | Usage |
| :--- | :--- |
| Redux `updateUser` | Persists `{ aiConsent: true }` to store + `AsyncStorage`. |
| `AIDisclosureView` | Renders the disclosure content (providers, data shared, privacy note). |

---

## 3. 🎨 UI / User Interface

### Layout
```
Modal (transparent, fade animation)
  └─ Overlay (semi-opaque black, centered)
       └─ Card (LinearGradient dark, max-width 450, 80% screen height)
            ├─ ✕ Close Button (top-right, absolute)
            ├─ AIDisclosureView (scrollable content)
            └─ Footer (conditional, showFooter=true)
                 ├─ "Not Now" — ghost button (calls onClose)
                 └─ "I Agree" — green gradient button (calls handleAgree)
```

### Design Details
- **Card**: `borderRadius: 32`, dark gradient (`rgba(20,20,20,0.95)` → `rgba(0,0,0,0.98)`), subtle white border.
- **Close Button**: `32×32` circle, `rgba(255,255,255,0.08)` background, top-right absolute.
- **"Not Now" button**: Frosted ghost style, `flex: 1`, `height: 52`.
- **"I Agree" button**: `LinearGradient("#1DB954", "#158c3f")`, Spotify-green, `flex: 1.8`, `height: 52` — takes ~64% of the footer row width to visually encourage agreement.

### Accessibility
- `onRequestClose={onClose}` ensures Android back-button dismisses the modal.
- `activeOpacity={0.7/0.8}` on buttons provides tactile feedback.
