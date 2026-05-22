# TierIcons Component Documentation

`TierIcons` exports three small presentational icon components (`FreeTierIcon`, `ProTierIcon`, `BusinessTierIcon`) used across the app to visually represent subscription tiers wherever a plan badge or label is displayed.

## 1. 🧠 Logic / Business Logic

### Purpose
Provide a centralized, consistent set of icons for the three Sosh subscription tiers — Free, Pro, and Business — so that any screen or component can import only the icon it needs without duplicating icon/color logic.

### Components Exported

| Export | Icon (lucide) | Default Color | Default Size |
| :--- | :--- | :--- | :--- |
| `FreeTierIcon` | `User` | `#FFFFFF` | 20 |
| `ProTierIcon` | `Crown` | `#3b82f6` (blue) | 20 |
| `BusinessTierIcon` | `BriefcaseBusiness` | `#FF8A00` (orange) | 20 |

### Props (shared `TierIconProps` interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `number` | `20` | Width & height of the icon in dp. |
| `color` | `string` | Tier default | Stroke color for the Lucide icon. |

All three components wrap the Lucide icon in a `View` sized to `{ width: size, height: size }` with `center` alignment so the icon integrates cleanly into any flexbox row.

---

## 2. 🔌 API / Service Integration

*No API calls or service dependencies — purely presentational.*

---

## 3. 🎨 UI / User Interface

### Usage Example
```tsx
import { ProTierIcon, BusinessTierIcon, FreeTierIcon } from '../../components/subscription/TierIcons';

// Inside a plan card:
<ProTierIcon size={18} />
<BusinessTierIcon size={18} color="#FF8A00" />
<FreeTierIcon size={18} color="rgba(255,255,255,0.5)" />
```

### Where Used
- `profile.tsx` — Plan card header to show the active tier badge.
- Any UI that needs to distinguish between Free / Pro / Business at a glance.

### Stroke Width
All icons use `strokeWidth={2.2}` for a consistent, slightly bold line weight that reads well at small sizes on dark backgrounds.
