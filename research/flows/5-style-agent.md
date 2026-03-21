# Flow 5: Style Agent

**DripAdvisor feature:** AI stylist chat that knows your wardrobe and suggests outfits. Uses streaming responses + voice (ElevenLabs TTS).

## Best References

### Nike — `nike-ios/`
Nike has an actual in-app chatbot.
- `chatting-live-with-nike-bot` (10 shots) — full chat flow with bot, message bubbles, quick replies

### ZARA — `zara-ios/`
ZARA's virtual assistant for styling/support.
- `chatting-with-virtual-assistant` (5 shots) — chat interface, message UI
- `ending-chat-with-virtual-assistant` (3 shots) — session end UX

### Sephora — `sephora-ios/`
Beauty advisor chat.
- `chatting-with-customer-support` (11 shots) — chat with product recommendations inline

### SKIMS — `skims-ios/`
- `messaging-skims-virtual-asistant` (3 shots) — virtual assistant chat

### Whering — `whering-ios/`
Styling suggestions within the app.
- `styling` (7 shots) — AI styling suggestions interface
- `styling-outfit-detail` (2 shots) — detailed outfit suggestion view
- `reacting-to-a-style` (4 shots) — feedback on suggestions (like/dislike)

## Key Patterns to Study
- Nike bot's quick reply buttons (suggested actions below chat)
- ZARA's clean chat bubbles (minimal, fashion-appropriate)
- Sephora's inline product cards within chat (product recommendations in messages)
- Whering's style reaction UX (thumbs up/down on outfit suggestions)
- How to show outfit images within a chat stream
- Voice input/output indicators (for ElevenLabs TTS integration)
