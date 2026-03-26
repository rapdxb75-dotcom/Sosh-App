# StatCard Component Documentation

`StatCard` is a highly styled, reusable UI component for displaying numerical analytics with visual trends and skeleton loading states.

## 1. 🧠 Logic / Business Logic

### Purpose & Layout
The `StatCard` exists to represent a single analytic metric (e.g., Followers, Likes). It uses internal logic to determine the layout:
1. **`fullWidth` mode**: A horizontal layout where the title is at the top, and the value and trend are side-by-side at the bottom.
2. **Standard mode**: A vertical layout with the title at the top, value in the middle, and trend below a separator line.

### Skeleton State
- **`loading`**: When set to `true`, the card renders a `Skeleton` component instead of text.
- **`Animated.Value(0)`**: Used to drive a shimmer animation that repeats indefinitely while the card is in a loading state.

### Functions and Handlers
- **`Skeleton` Animation**: 
    - Triggered on mount for each `Skeleton` instance.
    - Interpolates a 0-1 value into a `translateX` offset for the shimmer's `LinearGradient`.

---

## 2. 🔌 API Integration

*The `StatCard` does not directly communicate with APIs. It is a pure presentational component that consumes props provided by parent screens like `Home` or `Analysis`.*

---

## 3. 🎨 UI / User Interface

### Visual Layout
- **Containers**: Wrapped in an `expo-blur` `BlurView` with `intensity={40}` for a frosted glass look.
- **Borders**: Uses a custom `react-native-svg` `LinearGradient` border to create a "glass" edge effect.
- **Responsive Sizing**: Adapts font sizes based on `useWindowDimensions` (smaller devices get slightly reduced font sizes).

### UI Elements
- **Title**: Small, semi-transparent label at the top.
- **Value**: Large, custom fonts (`Questrial_400Regular`) for the primary metric.
- **Trend**: Includes a `TrendingUp` icon from `lucide-react-native` alongside the percentage change text.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Required | The label for the statistic (e.g., "Followers"). |
| `value` | `string` | Required | The formatted numerical value to display. |
| `trend` | `string` | Required | The textual description of the growth trend. |
| `fullWidth` | `boolean` | `false` | Toggles between horizontal and vertical internal layouts. |
| `loading` | `boolean` | `false` | Replaces values with shimmer skeletons when true. |

### Styling details
- **Font**: Uses `Questrial` for a modern, geometric appearance.
- **Background**: Semi-transparent white (`rgba(255, 255, 255, 0.1)`) with a blur intensity of 40.
- **Gradients**: Border gradients transition from white (70% opacity) at the top to black (70% opacity) at the bottom.
