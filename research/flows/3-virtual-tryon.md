# Flow 3: Virtual Try-On

**DripAdvisor feature:** See yourself wearing any item in your wardrobe. AI generates the image.

## Best References

### Lensa AI — `lensa-ai-ios/`
The most relevant reference — AI photo generation from user photos.
- `generating-magic-avatars` (26 shots) — generation loading states, progress indicators, result gallery
- `editing-photos` (22 shots) — before/after editing, result display
- `saving-to-photos` (4 shots) — saving generated results
- `sharing-photos` (6 shots) — sharing generation results
- `view-magic-avatar-pack` (6 shots) — viewing generated image sets

### Pinterest — `pinterest-ios/`
Pinterest has an actual try-on feature!
- `trying-on-a-product` (7 shots) — virtual try-on flow
- `filtering-try-on` (5 shots) — filtering try-on results
- `search-pinterest-camera` (2 shots) — camera-based search (visual)

### VSCO — `vsco-ios/`
Photo editing/processing UX patterns.
- `applying-a-preset` (11 shots) — applying visual transformations
- `editing-an-image-colors` (13 shots) — image manipulation UI
- `editing-an-image-remove` (5 shots) — AI-powered removal tool

## Key Patterns to Study
- Lensa's generation progress UX (how they show "generating..." with progress)
- Pinterest's actual try-on feature (they solved this exact problem)
- Loading states during AI generation (skeleton, progress bar, animation)
- Result presentation (before/after, gallery of results, zoom)
- Save/share CTA after generation completes
