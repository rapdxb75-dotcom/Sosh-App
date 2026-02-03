# RAPDXB Source Directory

This directory contains the core application logic.

## Structure

-   `components/`: Reusable UI components.
    -   `ui/`: Primitive generic components (Buttons, Inputs, Cards).
    -   `common/`: Domain-specific components used across features.
-   `features/`: Feature-based modules. Each feature folder should contain its own components, hooks, and services.
-   `hooks/`: Custom React hooks shared across the app.
-   `services/`: API clients, database interactions, and external service integrations.
-   `utils/`: Pure utility functions and helpers.
-   `constants/`: App-wide constants, theme definitions, and configuration values.
-   `context/`: React Context providers for global state management.
-   `types/`: Global TypeScript type definitions and interfaces.

## Usage

Import modules using the `@/` alias. For example:

```typescript
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
```
