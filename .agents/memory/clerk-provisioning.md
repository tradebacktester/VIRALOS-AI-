---
name: Clerk provisioning required
description: "failed_to_load_clerk_js" root cause and fix — always call setupClerkWhitelabelAuth() first
---

## Rule

When the preview shows `Clerk: Failed to load Clerk JS` and the URL attempting to load is `https://clerk.localhost/...`, the root cause is that `setupClerkWhitelabelAuth()` was never called — the Clerk app was never provisioned and the secrets (`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`) were never set.

**Why:** `publishableKeyFromHost(window.location.hostname, undefined)` returns a key derived purely from the hostname. On `localhost` that resolves to `clerk.localhost` as the CDN proxy, which doesn't exist and fails to load. With a real `VITE_CLERK_PUBLISHABLE_KEY`, the function resolves correctly.

**How to apply:**
1. Always call `checkClerkManagementStatus()` first.
2. If status is `not_configured`, call `setupClerkWhitelabelAuth()` — this sets all three secrets automatically.
3. Restart both the frontend and API server workflows to bake in the new secrets.
4. No code changes needed if the App.tsx wiring already matches the canonical template.

The code wiring (publishableKeyFromHost, ClerkProvider props, sign-in/sign-up routes) can be perfectly correct and still fail if the secrets are missing.
