---
name: Framer Motion ease types
description: ease property in Framer Motion variants requires typed Easing values, not arbitrary strings
---

Framer Motion's `transition.ease` property is typed as `Easing | Easing[] | undefined`. Passing a plain string like `"easeOut"` fails TypeScript compilation with TS2322.

Safe patterns:
```tsx
// Option 1: omit ease entirely
{ opacity: 1, y: 0, transition: { duration: 0.22 } }

// Option 2: use as const (if you must specify ease)
{ opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } }
```

**Why:** TypeScript strict mode rejects string literals that don't match the exact union of valid Easing types.
