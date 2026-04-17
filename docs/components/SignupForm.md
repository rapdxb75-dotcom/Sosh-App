# SignupForm Component Documentation

The `SignupForm` is the primary initial entry point for new users. Instead of creating the user immediately in the backend, it serves strictly as a client-side validator and data-buffer before routing the user into a multi-step onboarding flow.

## 1. 🧠 Logic / Business Logic

### State Management
- Utilizes robust two-way binding using standard `useState` hooks for `fullName`, `userName`, `email`, `password`, and `confirmPassword`.
- **Validation**:
  - The `handleSignup` function evaluates strict criteria (e.g. Email RegEx formatting, Password minimum length of 8, and Exact password matching).
  - Explicitly resets errors on a per-field basis upon user typing (`onChangeText`).

### Data Buffering
- Rather than directly calling `authService.register` here, upon successful validation, it bundles the form data and dispatches `setRegistrationBuffer` into the Redux `userSlice`.
- It then navigates the user definitively to `/onboarding` so they can complete the complex 10-step AI personality profile. 

---

## 2. 🔌 API Integration

*No direct API calls.*
- Integration happens via Redux (`useDispatch`), storing the payload so that the final step of the `/onboarding` screen can pull it and make the final API request.

---

## 3. 🎨 UI / User Interface

### Layout
- **Container Styling**: Designed to match the dark glassmorphic identity of the `/login` screen. Contains an overarching wrapper utilizing absolute SVG gradients for the border edge.
- **Inputs**:
  - Each text field is visually wrapped in a `BlurView` with `intensity={20}`.
  - Password fields toggle visibility utilizing `Eye` and `EyeOff` icons from `lucide-react-native`.

### Action Elements
- **Main Button**: Uses a distinct, image-backed button (`ImageBackground` using `post_without.jpg`) wrapped in a rounded corner clip to denote the primary CTA.
- **Social Connectors**: Displays Apple and Google OAuth buttons (currently wired to empty `onPress` stubs as placeholders for later SSO expansion).
