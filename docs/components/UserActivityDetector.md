# UserActivityDetector Component Documentation

`UserActivityDetector` is an invisible wrapper component that tracks whether the authenticated user is actively engaging with the app and syncs their online/activity status to Firebase in real time.

## 1. 🧠 Logic / Business Logic

### Purpose
Power the admin dashboard's "online" indicator by writing a `lastLogin` timestamp to Firestore whenever a user has been continuously interacting with the app for 30+ seconds, and refreshing it every 20 seconds while they remain active.

### Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `React.ReactNode` | The entire app subtree that should be monitored. |

### Thresholds
| Constant | Value | Meaning |
| :--- | :--- | :--- |
| `ACTIVE_THRESHOLD` | 30 000 ms | Continuous interaction window required before user is considered "Active" |
| `INACTIVE_THRESHOLD` | 60 000 ms | Silence period after which the user is reset to "Inactive" |

### State & Refs
| Name | Type | Purpose |
| :--- | :--- | :--- |
| `lastInteractionRef` | `useRef<number>` | Timestamp of the most recent touch event |
| `potentialActiveStartRef` | `useRef<number \| null>` | Timestamp when the current potential activity window started |
| `isActive` / `isActiveRef` | `state / ref` | Whether the user has met the 30s active threshold (ref used inside closures) |

### Activity Flow

```
User touches screen
  └─ handleInteraction()
       ├─ Update lastInteractionRef
       ├─ Start potentialActiveStartRef if not started
       └─ If 30s elapsed since potentialActiveStartRef → mark ACTIVE
            └─ updateUserActivityStatus(email)  [Firebase write]

setInterval (every 5s)
  ├─ If silence > 60s → reset to INACTIVE
  └─ If ACTIVE and 20s heartbeat elapsed → refresh activity timestamp
       └─ updateUserActivityStatus(email)  [Firebase write]
```

### Logout / Not Logged In
When `isLoggedIn` is `false` or `email` is empty, all refs are reset and the interval is cleared — ensuring no stale writes to Firestore after logout.

### Interaction Detection Mechanism
Uses `View.onStartShouldSetResponderCapture` returning `false` — this lets the detector observe all touch starts **without** consuming the event, so child components continue to handle their own gestures normally.

---

## 2. 🔌 API / Service Integration

| Service | Method | Trigger |
| :--- | :--- | :--- |
| `firebaseService` | `updateUserActivityStatus(email)` | On first reaching 30s threshold, then every 20s heartbeat |

### Redux Dependencies
| Selector | Usage |
| :--- | :--- |
| `state.user.email` | Email used as the Firestore document key |
| `state.user.isLoggedIn` | Guards all writes — no activity tracking for unauthenticated users |

---

## 3. 🎨 UI / User Interface

`UserActivityDetector` renders a single `View` with `flex: 1` that fills the entire screen. It has **no visual output** — it is purely a transparent gesture-capture layer wrapping the child tree.

### Where It Is Mounted
Typically mounted high in the navigation tree (e.g., inside `_layout.tsx`) so that all tab screens and modals are children of the detector.

### Performance Notes
- The `setInterval` checks every **5 seconds** — lightweight since it only reads timestamps from refs.
- Firebase writes are infrequent (one on activation + one per 20s heartbeat), preventing Firestore read/write cost from growing linearly with user session length.
