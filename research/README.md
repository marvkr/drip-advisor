# DripAdvisor Design Research

Hand-curated UI references from 12 brands mapped to DripAdvisor's 6 core flows. All screenshots are already downloaded locally.

## Screenshots Location

```
~/Library/Mobile Documents/com~apple~CloudDocs/brand/<brand-folder>/
```

## Flows → DripAdvisor Features

| # | Flow | Feature | Top References |
|---|------|---------|----------------|
| 1 | [Avatar Setup](flows/1-avatar-setup.md) | Take/upload full-body photo | Lensa AI, Whering, Depop |
| 2 | [Wardrobe](flows/2-wardrobe.md) | Add clothing, browse grid | Whering, GOAT, Depop, Nike |
| 3 | [Virtual Try-On](flows/3-virtual-tryon.md) | AI generates you wearing items | Lensa AI, Pinterest, VSCO |
| 4 | [Mix & Match](flows/4-mix-and-match.md) | Combine tops + bottoms | Whering, Pinterest, Nike |
| 5 | [Style Agent](flows/5-style-agent.md) | AI stylist chat + voice | Nike bot, ZARA, Sephora |
| 6 | [Share Intent](flows/6-share-intent.md) | Receive screenshots from other apps | FARFETCH, Pinterest |

## Brands

| Brand | Folder | Images | Why |
|-------|--------|--------|-----|
| [Whering](brands/whering.md) | `whering-ios/` | 318 | Closest competitor — wardrobe + outfit creation |
| [GOAT](brands/goat.md) | `goat-ios/` | 240 | Best clothing card/grid design |
| [Depop](brands/depop.md) | `depop-ios/` | 412 | Camera-first item adding flow |
| [Nike](brands/nike.md) | `nike-ios/` | 368 | Product presentation + in-app chatbot |
| [FARFETCH](brands/farfetch.md) | `farfetch-ios/` | 288 | Photo-based search (share intent ref) |
| [Pinterest](brands/pinterest.md) | `pinterest-ios/` | 410 | Try-on feature + visual collecting |
| [Lensa AI](brands/lensa-ai.md) | `lensa-ai-ios/` | 179 | AI photo generation UX |
| [VSCO](brands/vsco.md) | `vsco-ios/` | 461 | Camera + photo editing patterns |
| [ZARA](brands/zara.md) | `zara-ios/` | 146 | Virtual assistant chat |
| [SKIMS](brands/skims.md) | `skims-ios/` | 211 | Premium product presentation |
| [Grailed](brands/grailed.md) | `grailed-ios/` | 359 | Item listing + photo upload |
| [Sephora](brands/sephora.md) | `sephora-ios/` | 259 | Chat advisor + photo adding |

## Data Files

- `local-brand-index.json` — programmatic index of all brands, screens, and filenames
- `dripadvisor-references.json` — Mobbin CDN URLs for 31 brands (fallback for brands not downloaded)
