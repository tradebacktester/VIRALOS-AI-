---
name: Clerk v6 API changes
description: Breaking changes in @clerk/react v6 — component API and key resolution differ from v5
---

Clerk v6 (`@clerk/react` ^6.x) removes `SignedIn` and `SignedOut` components entirely. Use `Show` with `when` prop instead.

```tsx
import { Show } from "@clerk/react";
// <Show when="signed-in"> ... </Show>
// <Show when="signed-out"> ... </Show>
```

The publishable key must be resolved via `publishableKeyFromHost` from `@clerk/react/internal`, not the raw env var:

```tsx
import { publishableKeyFromHost } from "@clerk/react/internal";
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
```

The `UserButton` component is still available but the skill discourages it in favor of `useUser()` for custom UI.

**Why:** The v6 release restructured the component exports. Using old component names causes TS2724/TS2305 errors at compile time.

**How to apply:** Whenever writing Clerk-protected routes or auth guards, use `Show`. When resolving the publishable key, always use `publishableKeyFromHost`.
