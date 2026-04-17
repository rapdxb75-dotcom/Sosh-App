# CustomToast Component Documentation

The `CustomToast` configuration intercepts default system toasts and provides a high-fidelity visual design language matching the app's dark-mode/glassmorphic aesthetic.

## 1. 🧠 Logic / Business Logic

### Toast Mapping
- It acts as the renderer specification passed into the `ToastConfig` object mandated by `react-native-toast-message`.
- Exposes three distinct rendering paths governed by the `type` prop: `success`, `error`, and `info`.
- **`getIcon()` function**: Conditionally scopes exact SVG variants (from `lucide-react-native`) and vibrant Hex codes based on the invoked Toast type. 
  - Success translates to Green (`#34C759`) targeting `Check`.
  - Error translates to Red (`#FF3B30`) targeting `X`.
  - Info translates to Blue (`#0A84FF`) targeting `Info`.

---

## 2. 🔌 API Integration

*No external API fetching, but globally utilized by `apiClient` to surface HTTP 400/500 errors gracefully.*

---

## 3. 🎨 UI / User Interface

### Styling specifications
- **Container**: Floating capsule design (`width: "90%"`), positioned near the top of the interface.
- **Glass Effects**: Uses a slightly transparent solid backing (`bg-[#2C2C2E]/95`) rather than a heavy blur to ensure high contrast for error legibility.
- **Typography**: Adheres strictly to the `font-inter` aesthetic, enforcing `numberOfLines={1}` on titles to prevent layout breaking on verbose server errors.
- **Shadows**: Employs a multi-dimensional native drop shadow (`elevation: 8`, `shadowOpacity: 0.3`) to detach it visually from underlying navigation header fragments.
