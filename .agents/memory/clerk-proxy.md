---
name: Clerk proxy setup
description: The Clerk proxy is production-only; dev uses FAPI directly; never hardcode proxy URL in frontend
---

The Clerk proxy middleware (`/api/__clerk`) only activates when `NODE_ENV === "production"`. In development it is a no-op (`next()`).

`VITE_CLERK_PROXY_URL` is intentionally empty in dev — Clerk's browser SDK hits the dev FAPI directly. It is auto-populated in production by the platform.

Frontend wiring (canonical, copy verbatim):
```tsx
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL; // empty in dev, auto-set in prod
<ClerkProvider proxyUrl={clerkProxyUrl} ...>
```

Never gate on `import.meta.env.PROD`, never hardcode `"/api/__clerk"` in frontend code, never omit `proxyUrl` prop.

**Why:** Hardcoding the proxy URL or gating on NODE_ENV breaks the production proxy — the platform auto-injects the value only when the prop is present and unconditional.
