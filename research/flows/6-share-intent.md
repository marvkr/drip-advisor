# Flow 6: Share Intent

**DripAdvisor feature:** Share clothing screenshots directly from TikTok, Instagram, Safari into the app. AI extracts the garment.

## Best References

### FARFETCH — `farfetch-ios/`
Visual search from photos — closest to "share screenshot → find item."
- `searching-farfetch-with-photo` (8 shots) — camera/photo-based product search

### Pinterest — `pinterest-ios/`
Best-in-class save/collect from external sources.
- `creating-a-pin` (6 shots) — adding content from external sources
- `saving-a-pin` (2 shots) — quick save flow
- `saving-pincode` (2 shots) — scanning/importing visual content
- `search-pinterest-camera` (2 shots) — camera-based visual search
- `searching-an-image` (3 shots) — image-based search

### Depop — `depop-ios/`
- `sharing-a-product` (3 shots) — share sheet integration
- `saving-a-product-to-profile` (2 shots) — quick save
- `saving-a-product-to-a-new-collection` (6 shots) — save + organize

### VSCO — `vsco-ios/`
- `add-to-space` (2 shots) — adding external content
- `adding-media` (7 shots) — importing media from other sources

### Grailed — `grailed-ios/`
- `saving-to-collection` (2 shots) — save to collection flow

## Key Patterns to Study
- FARFETCH's photo search (share screenshot → AI identifies the product)
- Pinterest's share extension (receiving content from other apps)
- The "processing" state when AI is extracting the garment from a screenshot
- Confirmation flow: "We found this garment — add to wardrobe?"
- How to handle low-quality screenshots or partial clothing views
