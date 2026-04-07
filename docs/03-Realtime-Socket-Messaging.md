# 3. Real-Time Socket Messaging

The messaging system is designed to mimic standard modern chat applications (like WhatsApp) while integrating heavily with mental health safety protocols.

## Connection Lifecycle
1. User logs in via NextAuth.
2. The `SessionProvider.tsx` React Context initializes a Socket.io connection to the server.
3. The server authenticates the socket using the user's `userId` and adds the socket to a private room: `room_userId`.
4. As long as the dashboard is open, the connection stays alive.

## The `sendMessage` Flow
When a user types a message and clicks send:
1. The client-side logic performs an optimistic UI update (appending the message locally).
2. The client fires a standard `POST /api/messages` API request.
3. The Next.js API route:
   - Validates the user role and message content.
   - Saves the message to MongoDB.
   - Synchronously runs the message through the **Keyword Safety Engine** (see Doc 04).
4. If successful, the API route emits a `new_message_event` directly to the Socket.io server instance attached to `global.io`.
5. The Socket server pushes the message payload to the receiver's private room (`room_receiverId`).
6. The receiver's UI updates instantly without a page refresh.

## Typing Indicators
Typing indicators bypass the database entirely for speed. 
When a user presses a key, the client emits a direct socket event `typing`. The server relays this to the recipient, which triggers the "Practitioner is typing..." UI state for 3 seconds before automatically clearing.
