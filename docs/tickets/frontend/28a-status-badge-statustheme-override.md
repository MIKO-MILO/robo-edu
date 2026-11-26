# 28a: Patch StatusBadge — support `statusTheme` override prop

**What to build:** `StatusBadge` should accept a `statusTheme` prop that, when provided, overrides the theme that would otherwise be looked up from the internal `statusMap`. All existing call sites that do not pass `statusTheme` continue to work exactly as before — the change is fully backward-compatible.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `statusTheme` is destructured inside the `StatusBadge` function body (it already exists in the prop types via `VariantProps` but was previously unused inside the function).
- [x] The theme passed to `statusBadgeVariants` uses `statusTheme ?? config.theme` — the explicit prop wins; `statusMap` is the fallback.
- [x] All existing usages of `StatusBadge` across the codebase render identically to before (no `statusTheme` prop → no visual change).
