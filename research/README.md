# DripAdvisor Design Research

UI pattern references from 12 brands with **3,641 downloaded screenshots** in iCloud, organized by DripAdvisor flows.

## Image Source

All screenshots are already downloaded locally:
```
~/Library/Mobile Documents/com~apple~CloudDocs/brand/<brand-name>/
```

## Structure

```
research/
  local-brand-index.json        # Programmatic index of all brands, screens, and filenames
  dripadvisor-references.json   # Mobbin CDN data (31 brands, 5184 refs) — fallback for brands not downloaded
  flows/                        # Screens grouped by DripAdvisor flow
    camera-avatar.md            # Photo capture, selfie, avatar creation
    wardrobe-grid.md            # Clothing browsing, product grids, wardrobe management
    tryon-generation.md         # AI generation, try-on results, editing
    style-agent-chat.md         # AI chat, streaming responses
    share-collect.md            # Share intent, saving, collecting
    detail-view.md              # Product detail pages, sizing, color selection
    onboarding.md               # Welcome, signup, permissions
  brands/                       # Per-brand deep dives
    whering.md                  # 318 images — closest competitor
    goat.md                     # 240 images — clothing cards
    depop.md                    # 412 images — fashion marketplace
    nike.md                     # 368 images — product presentation
    farfetch.md                 # 288 images — luxury browsing
    pinterest.md                # 410 images — visual collecting
    lensa-ai.md                 # 179 images — AI photo generation
    vsco.md                     # 461 images — photo editing
    zara.md                     # 146 images — minimal fashion
    skims.md                    # 211 images — premium feel
    grailed.md                  # 359 images — menswear marketplace
    sephora.md                  # 259 images — product browsing
```

## Flow → DripAdvisor Screen Mapping

| Flow | DripAdvisor Screen | Top References |
|------|-------------------|----------------|
| camera-avatar | Avatar photo capture | VSCO, Depop, Sephora |
| wardrobe-grid | Wardrobe tab, item browsing | Whering, GOAT, Depop, Nike |
| tryon-generation | Try-on result, outfit preview | Lensa AI, VSCO, Pinterest |
| style-agent-chat | Style agent chat screen | Whering, Pinterest |
| share-collect | Share intent receiver | Pinterest, Depop, VSCO |
| detail-view | Item detail page | Nike, FARFETCH, GOAT, ZARA |
| onboarding | First launch, signup | Depop, VSCO, Whering |

## How to Use

Open the flow markdown for the screen you're building. Each entry points to the exact filename in iCloud you can open to see the reference screenshot.

For programmatic access, load `local-brand-index.json`.
