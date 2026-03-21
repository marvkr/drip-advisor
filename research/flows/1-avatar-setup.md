# Flow 1: Avatar Setup

**DripAdvisor feature:** Take or upload a full-body photo of yourself.

## Best References

### Lensa AI — `lensa-ai-ios/`
The closest match. Users upload selfies, AI generates avatars.
- `generating-magic-avatars` (26 shots) — uploading photos, selection UI, generation progress, results
- `onboarding` (24 shots) — first-time photo upload flow
- `editing-photos` (22 shots) — photo manipulation after upload

### Whering — `whering-ios/`
Wardrobe app with outfit-of-the-day photo uploads.
- `uploading-an-ootd-photo` (7 shots) — camera capture + gallery picker for outfit photos
- `onboarding` (24 shots) — likely includes body photo step

### Depop — `depop-ios/`
Camera-first listing flow, relevant for capture UX.
- `adding-a-profile-picture` (4 shots) — simple avatar capture
- `posting-your-first-listing` (41 shots) — camera capture, photo selection, cropping
- `video-and-photo-tips` (3 shots) — guidance overlay for good photos

### Grailed — `grailed-ios/`
- `uploading-a-profile-photo` (6 shots) — profile photo capture flow
- `uploading-photos` (7 shots) — multi-photo upload for listings

### Sephora — `sephora-ios/`
- `adding-a-photo` (19 shots) — photo upload with guidance, extensive flow

### VSCO — `vsco-ios/`
- `camera` (2 shots) — clean camera UI
- `importing-an-image` (4 shots) — gallery import flow

## Key Patterns to Study
- How Lensa AI guides users to take good photos (lighting, distance, angle tips)
- Whering's OOTD capture (full-body framing)
- Depop's photo tips overlay (guidance for good shots)
- Permission flows for camera access
