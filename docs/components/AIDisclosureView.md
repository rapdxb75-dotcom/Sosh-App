# AIDisclosureView Component Documentation

`AIDisclosureView` is a scrollable, read-only view that explains which third-party AI providers Sosh uses, what data is shared with them, and how that data is protected. It is consumed by `AIConsentModal` and the standalone `ai-disclosure.tsx` screen.

## 1. 🧠 Logic / Business Logic

### Purpose
Provide a clear, legally compliant disclosure of Sosh's AI data-sharing practices to satisfy App Store privacy requirements and GDPR/CCPA transparency obligations.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showTitle` | `boolean` | `true` | When `true`, renders the "AI Data Sharing" heading. Set to `false` when embedding in contexts that supply their own title. |

### Exported Constants (reusable data)

#### `PROVIDERS`
Array of four trusted AI/service providers displayed in the disclosure:

| Name | Purpose |
| :--- | :--- |
| Anthropic (Claude) | Smart Content Generation & Chat |
| Poppy AI | Custom Business Intelligence & Chat |
| Ayrshare | Social Media Publishing & Connectivity |
| Zernio | Advanced Social Analytics |

Each entry includes a `name`, `purpose`, and an inline JSX `icon` (20×20 provider logo from `assets/icons/`).

#### `DATA_SHARED`
Array of three data-sharing categories:

| Category | Description |
| :--- | :--- |
| 1. Account Data | Username, profile info, and brand data |
| 2. Prompts & Input | User-provided prompts, chat messages, and content data |
| 3. Media Assets | Captions, photos, and videos chosen for processing/publishing |

---

## 2. 🔌 API / Service Integration

*Purely presentational — no network calls or Redux access.*

Local assets used:
- `assets/icons/provider_claude_actual.png`
- `assets/icons/provider_poppy_actual.png`
- `assets/icons/provider_ayrshare.png`
- `assets/icons/provider_zernio.png`

---

## 3. 🎨 UI / User Interface

### Layout Structure
```
ScrollView
  ├─ Header
  │    ├─ "AI Data Sharing" title (conditional)
  │    └─ Subtitle paragraph
  ├─ "Trusted Providers" section
  │    └─ Provider list card (dark rounded card, one row per provider)
  ├─ "What is Shared?" section
  │    └─ Data grid (one dark card per category)
  └─ Privacy note (green-tinted gradient row with lock icon)
```

### Design Details
- **Provider list**: `borderRadius: 24`, `backgroundColor: rgba(20,20,20,0.6)`, dividers via `borderBottomColor: rgba(255,255,255,0.04)`.
- **Provider icons**: 42×42 rounded container with a subtle white-to-transparent gradient background.
- **Data cards**: Individual `borderRadius: 24` cards with shadow.
- **Privacy note**: Green-tinted `LinearGradient` with `#00FF94` lock icon and highlighted text.
- **Section titles**: Bold 18px with a right-side `flex: 1` horizontal rule for visual separation.

### Color Palette (Privacy / Trust)
| Element | Color |
| :--- | :--- |
| Privacy accent | `#00FF94` (green) |
| Card border | `rgba(255,255,255,0.08)` |
| Provider name | `#FFF` |
| Provider purpose | `rgba(255,255,255,0.45)` |
| Highlighted text | `#00FF94`, `fontWeight: 700` |
