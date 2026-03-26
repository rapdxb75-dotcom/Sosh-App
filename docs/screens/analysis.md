# Analysis Screen Documentation

The `Analysis` screen provides a deep dive into user performance analytics, featuring interactive charts, platform-specific metrics, and temporal filtering.

## 1. 🧠 Logic / Business Logic

### Core Functionality
- **Data Aggregation**: Displays detailed growth metrics for connected social platforms (Instagram, TikTok, YouTube, etc.).
- **Interactive Charts**: Uses `victory-native` to render area charts showing trends in views and engagement.
- **Dynamic Filtering**: Supports filtering data by time ranges (30 days, 90 days, YTD, All time).

### Component State
- **`analytics`**: Local state storing the aggregated engagement totals.
- **`isExpanded`**: Tracks which platform card is currently expanded to show detailed charts.
- **`viewsTab` / `engagementTab`**: Manages the active sub-tab (e.g., M1, M2, M3) within a platform's detailed view to switch chart data.
- **`pulseAnim`**: Drives the skeleton loader's opacity animation during initial data fetch.

### Key Logic & Calculations
- **`AnimatedCounter`**: A custom hook/component that animates numbers from zero to their actual value using `addListener` on an `Animated.Value`.
- **`getMultiplierForTab`**: Since data might represent a total 90-day period, this logic calculates "steps" (M1, M2) to simulate growth trends in charts when historical data is partial.
- **`VictoryVoronoiContainer`**: Enables tooltip interactions where users can hover/tap on chart segments to see specific data points.

---

## 2. 🔌 API Integration

### Data Sources
- **Firebase Firestore**: 
    - `getCurrentUserData`: Fetches the initial analytics snapshot.
    - `listenToUserData`: Subscribes to real-time updates of the `totalAnalytics` and individual platform metrics.
- **Redux**: Pulls the user's email to identify which document to watch in Firestore.

### Response Data Structure
Expects a `totalAnalytics` object and individual platform objects (e.g., `instagram: { metrics: { views, likes ... } }`).

---

## 3. 🎨 UI / User Interface

### Visual Layout
- **Platform Grid**: A vertical list of `PlatformCard` components.
- **Glassmorphism**: Extensive use of `BlurView` and semi-transparent backgrounds (`#FFFFFF1A`) to maintain consistent app styling.
- **Accordions**: Platform cards expand on tap to reveal complex charts and granular metrics.

### Key UI Elements
- **`VictoryChart`**: The primary data visualization engine.
- **`PlatformSkeletonCard`**: A custom pulsing skeleton used for state transitions.
- **`InlineDropdown`**: A precise, custom-styled dropdown for selecting time filters.
- **`AnimatedCounter`**: Large, bold text for high-level numbers that "counts up" on view.

### User Interactions
- **Tap to Expand**: Expanding a card triggers `Haptics.impactAsync`.
- **Chart Scrubbing**: Users can interact with the `VictoryArea` charts to see tooltips.
- **Time Filtering**: Changing a filter updates the context for all displayed charts.
