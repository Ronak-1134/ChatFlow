# 💬 ChatFlow — Real-Time Chat Application

![ChatFlow Banner](https://img.shields.io/badge/ChatFlow-v1.0.0-7c6af7?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![WebSocket](https://img.shields.io/badge/WebSocket-ws%408-010101?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A production-grade, real-time chat application built with **Node.js**, **WebSockets**, and **Vanilla JavaScript**. Features a premium dark SaaS UI inspired by Slack and Discord — with multi-room support, typing indicators, unread badges, and auto-reconnection.

---

## ✨ Features

- 🔴 **Real-time messaging** via WebSockets
- 🏠 **Multi-room support** — general, tech, random, design
- 👤 **Username authentication** with validation & session persistence
- ⌨️ **Typing indicators** — shows who is typing with animated dots
- 🔔 **Unread badges** per room
- 🔊 **Sound notifications** for new messages (Web Audio API)
- 🕐 **Smart timestamps** — relative + absolute
- 💬 **Message grouping** — consecutive messages from same user are grouped
- 📅 **Date dividers** — separates messages by day
- 🔄 **Auto-reconnection** with exponential backoff
- 📱 **Mobile responsive** — sidebar toggle on small screens
- 🎨 **Premium dark UI** — glassmorphism, smooth animations, soft shadows

---

## 🖥️ Preview

```
┌─────────────────────────────────────────────────────────┐
│  💬 ChatFlow                              [alice]        │
├──────────────┬──────────────────────────────────────────┤
│  ROOMS       │  # general  ·  Welcome to general chat   │
│  # general ● │──────────────────────────────────────────│
│  # tech    3 │  [AB]  alice          10:42 AM            │
│  # random    │       Hey everyone! 👋                    │
│  # design    │       How's everyone doing?               │
│              │                                           │
│  ONLINE      │  [BC]  bob            10:43 AM            │
│  ● alice     │       Doing great! Working on a          │
│  ● bob       │       new project                        │
│              │                                           │
│              │  bob is typing...  ···                   │
│  ● Connected │──────────────────────────────────────────│
│              │  Message #general...            [→ Send] │
└──────────────┴──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
realtime-chat/
├── backend/
│   ├── package.json          # Dependencies & scripts
│   ├── server.js             # Express + WebSocket server
│   ├── socketHandler.js      # WebSocket event logic
│   └── roomManager.js        # Room & user state management
│
└── frontend/
    ├── index.html            # App shell & HTML structure
    ├── css/
    │   ├── reset.css         # Base reset & normalize
    │   ├── variables.css     # Design tokens (colors, spacing)
    │   ├── layout.css        # Grid layout & auth overlay
    │   ├── components.css    # UI components (buttons, messages)
    │   └── animations.css    # Keyframe animations
    └── js/
        ├── app.js            # App init & global state
        ├── socket.js         # WebSocket client wrapper
        ├── ui.js             # DOM helpers & rendering
        ├── auth.js           # Username auth & session
        ├── chat.js           # Send/receive messaging
        └── rooms.js          # Room switching logic
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v8 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/chatflow.git
cd chatflow

# 2. Install backend dependencies
cd backend
npm install

# 3. Start the development server
npm run dev
```

### Open the app

```
http://localhost:3000
```

> Enter a username and start chatting. Open multiple tabs to simulate multiple users.

---

## ⚙️ Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-restart on changes) |

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory (optional):

```env
PORT=3000
NODE_ENV=production
```

Add `dotenv` if using `.env`:

```bash
npm install dotenv
```

Add to top of `server.js`:

```js
require('dotenv').config();
```

---

## 📡 WebSocket API

### Client → Server

| Type | Payload | Description |
|---|---|---|
| `join` | `{ username, room }` | Join app with username |
| `message` | `{ text }` | Send a message to current room |
| `switch_room` | `{ room }` | Switch to a different room |
| `typing` | _(none)_ | Emit typing event |

### Server → Client

| Type | Payload | Description |
|---|---|---|
| `joined` | `{ room, username, users }` | Confirmed room join |
| `message` | `{ username, text, room, ts, self }` | Incoming message |
| `system` | `{ text }` | System notification |
| `user_list` | `{ room, users }` | Updated online user list |
| `typing` | `{ username }` | Someone is typing |
| `error` | `{ text }` | Error message |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| HTTP Server | Express 4 |
| WebSocket | ws 8 |
| Frontend | HTML5, CSS3, Vanilla JS (ES Modules) |
| Process Manager | PM2 (production) |
| Dev Server | nodemon |

---

## 🔒 Security Notes

- All user input is HTML-escaped before rendering (XSS prevention)
- Reserved usernames (`admin`, `system`, `bot`, `server`) are blocked
- Username validation: alphanumeric + underscores only, 2–20 chars
- No passwords — session stored in `sessionStorage` (cleared on tab close)

---

## 🛣️ Roadmap

- [ ] Message history (persist to SQLite / Redis)
- [ ] User avatars / profile images
- [ ] Private direct messages
- [ ] Emoji reactions on messages
- [ ] File/image sharing
- [ ] JWT-based authentication
- [ ] Admin room management
- [ ] Read receipts

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT © 2024 — Free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- UI inspired by [Slack](https://slack.com) and [Discord](https://discord.com)
- Built with [ws](https://github.com/websockets/ws) WebSocket library
- Font: [Inter](https://rsms.me/inter/) by Rasmus Andersson
