# Paywall Component Documentation

`Paywall` is the full-screen subscription purchase modal. It presents the Sosh Pro and Sosh Business plans side-by-side, allows the user to select a tier, inspect a feature accordion, and initiate an in-app purchase or restore a previous subscription.

## 1. 🧠 Logic / Business Logic

### Purpose
Gate premium features behind a visually polished purchase flow that drives IAP conversion for both Pro ($79/mo → $99/mo) and Business ($599/mo → $799/mo) tiers, while being fully App Store compliant.

### Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `visible` | `boolean` | Controls modal visibility. |
| `onClose` | `() => void` | Callback invoked when the user closes or finishes a purchase. |

### State Variables
- **`selectedPlan`**: `"Pro" | "Business"` — Tracks which plan tier is currently highlighted.
- **`accordionExpanded`**: `boolean` — Controls the feature details accordion open/closed state.

### Key Functions
| Function | Description |
| :--- | :--- |
| `handlePurchase` | Triggers haptics → shows an info Toast → calls `useIAP.handlePurchase(sku)` with the SKU matching `selectedPlan`. |
| `handleRestore` | Triggers success haptics → shows an info Toast → calls `useIAP.handleRestore()`. |
| `handleManageSubscriptions` | Opens `https://apps.apple.com/account/subscriptions` via `Linking.openURL`. |
| `selectPlan(plan)` | Switches the selected plan with a light haptic impact. |
| `toggleAccordion` | Expands/collapses the feature list accordion with a light haptic. |

### Animations
Two `Animated` values run in parallel on `visible` change:
- **`fadeAnim`**: Fades the content in from `0 → 1` over 400 ms.
- **`slideAnim`**: Springs the content up from `translateY: 50 → 0`.

### Feature Lists
| Plan | Features |
| :--- | :--- |
| Pro | 500 AI Chats & Captions/mo, Custom AI, cross-platform posting, 90-day analytics, scheduling, smart captions |
| Business | Everything in Pro + no hard AI limits, expert-built AI, Snapchat, deeper analytics, 24/7 support & team seats |

---

## 2. 🔌 API / Service Integration

### Dependencies
| Module | Usage |
| :--- | :--- |
| `useIAP` (hook) | Provides `handlePurchase(sku)` and `handleRestore()`. All billing communication happens inside the hook. |
| `SKUS` constant | Maps `"Pro"` → `sosh.pro.monthly` and `"Business"` → `sosh.enterprise.monthly`. |
| Redux `RootState` | Reads `state.user.email` to pass to `useIAP` for Firebase sync after a successful purchase. |

---

## 3. 🎨 UI / User Interface

### Layout Structure
```
Modal (transparent, fullscreen)
  └─ BlurView (dark, intensity 100) — frosted background
  └─ Animated.View (fade + slide)
       ├─ Close Button (floating, top-right)
       └─ ScrollView
            ├─ Hero Image (welcome_bg.png, 36% screen height, offset left -8px)
            ├─ Typography Header ("Sosh Premium")
            ├─ Plan Selector Card
            │    ├─ Option Row: Sosh Pro  (blue accent)
            │    └─ Option Row: Sosh Business (orange accent)
            ├─ Feature Accordion Card (collapsible feature list)
            ├─ CTA Button (white for Pro / orange gradient for Business)
            └─ Compliance Footer
                 ├─ Restore Purchases button
                 ├─ Manage Apple Subscriptions link
                 ├─ Auto-renewal legal disclosure
                 ├─ EULA & Privacy Policy links
                 └─ Fair Use Policy footnote
```

### Design Tokens
| Element | Value |
| :--- | :--- |
| Pro accent | `#3b82f6` (blue) |
| Business accent | `#FF8A00` (orange) |
| Card background | `rgba(255,255,255,0.03)` |
| Card border | `rgba(255,255,255,0.1)` |
| CTA Pro button | White fill, black text |
| CTA Business button | `LinearGradient("#FF8A00", "#E67A00")`, black text |

### App Store Compliance Elements
- Auto-renewal disclosure text (required by Apple).
- EULA link pointing to Apple's standard EULA.
- Privacy Policy link (`https://sosh.digital/privacy`).
- "Restore Purchases" button (required by App Store guidelines).
- "Manage Apple App Store Subscriptions" link.
- Fair Use Policy footnote for Business tier.
