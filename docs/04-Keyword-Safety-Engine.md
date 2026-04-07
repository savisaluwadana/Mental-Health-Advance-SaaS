# 4. Keyword Safety Engine

The Keyword Safety Engine (`src/lib/keywordEngine.ts`) is a critical safety net designed to automatically detect severe mental health crisis indicators in standard text chat.

## Motivation
In an asynchronous or semi-synchronous chat environment, a client might express active suicidal ideation or self-harm intent while the practitioner is offline or looking at another patient's file. The safety engine ensures the practitioner is instantly alerted regardless of what screen they are on.

## Detection Mechanism
The engine uses regex-based boundary scanning against an array of flagged trigger words (`suicide`, `kill myself`, `end it all`, `self harm`, etc.). 

This scanning occurs **synchronously** during the `POST /api/messages` cycle. 

## Flow
1. Message arrives at the API.
2. `keywordEngine.scanMessage(text)` evaluates the content.
3. If a match is found:
   - The original `Message` document is saved with `flagged: true`.
   - A new `KeywordAlert` document is generated in the database.
   - The API triggers a high-priority Socket.io `crisis_alert` event pushed directly to the `practitionerId`'s private socket room.
4. The Practitioner's UI catches the event and spawns a red high-priority toast notification, even if they are on the Home screen or Notes screen. It forces them to acknowledge the risk.

## Throttling and Fatigue Prevention
To prevent "alert fatigue" (where a practitioner ignores alerts because they receive too many), the engine implements intelligent rate-limiting:
- A client cannot trigger more than **3 alerts per hour**. If they continue using trigger words within that 60-minute window, the messages are still saved as `flagged: true`, but the practitioner's screen is not bombarded with duplicated aggressive popup notifications.
