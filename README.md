# Chat App

A real-time group chat interface built with React and TypeScript. Enter your name, send messages, and see everyone's updates automatically and no page refresh needed.

## Installation

```bash
git clone https://github.com/satheeshpolu/chat-app.git
cd chat-app
npm install
npm run dev
```

> **Note:** Requires the [Chat API](https://github.com/DoodleScheduling/frontend-challenge-chat-api) running on Docker [here](https://github.com/DoodleScheduling/frontend-challenge-chat-api?tab=readme-ov-file#option-1-running-with-docker-recommended) or locally on `http://localhost:3000`. The app works out of the box with no additional configuration.

## Documentation

- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Project Structure

```
src/
├── api/              # HTTP client with auth header
├── services/         # Maps API response shape to UI model
├── hooks/            # useMessages — fetch, poll, send, deduplicate
├── store/            # Current user state (Zustand)
├── components/chat/  # ChatWindow, MessageList, MessageBubble, MessageInput
├── pages/            # Name prompt → lazy-loaded chat view
├── types/            # Shared TypeScript interfaces
├── utils/            # Timestamp formatting, message grouping
└── constants/        # All configuration values in one place

```

---

## Key Features

### Polling

Messages are refetched every 5 seconds. The `after` cursor is set to the **newest** message timestamp so each poll returns only genuinely new data minimal bandwidth, no duplicates.

### Virtualised List

Only visible rows are rendered using `@tanstack/react-virtual`. Handles large message histories without DOM bloat or scroll jank.

### Smart Auto-scroll

Auto-scrolls to the latest message only when the user is already near the bottom. While reading history, a **↓ New messages** button appears instead clicking it jumps back to the bottom.

### Optimistic Sends

Messages appear in the UI instantly. Deduplication by message ID prevents doubles when the next poll confirms the send.

### Error Handling

| Scenario              | Behaviour                             |
| --------------------- | ------------------------------------- |
| Initial load fails    | Full-screen error with retry guidance |
| Background poll fails | Inline warning banner above messages  |
| Send fails            | Error notice above the input bar      |

### Accessibility

Follows WAI-ARIA best practices throughout:

- `role="log"` + `aria-live="polite"` on the message feed
- `role="alert"` on all error states
- `<time dateTime="...">` for semantic timestamps
- `focus-visible` outlines on every interactive element
- WCAG AA contrast ratios on all text
- Minimum 44 × 44 px touch targets
- `prefers-reduced-motion` respected for scroll animations

### Responsive & Mobile-first

- `100dvh` correctly handles mobile browser chrome
- `env(safe-area-inset-bottom)` supports iPhone home indicator
- `font-size: 1rem` on inputs prevents iOS auto-zoom
- Bubble widths adapt at 640 px, 480 px, and 360 px breakpoints

### SEO & Meta

- Semantic HTML5 landmarks (`<main>`, `<header>`, `<h1>`) for correct document structure
- Descriptive `<title>` and `<meta name="description">` in `index.html`
- Meaningful, human-readable URLs via the page router

### Testing

32 unit tests across all four chat components using **Vitest** + **React Testing Library**:

| Component       | Tests                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `MessageBubble` | Content rendering, self vs other alignment, sender name, timestamp                                   |
| `MessageInput`  | Submit, Enter key, Shift+Enter no-op, clear after send, disabled, whitespace guard                   |
| `MessageList`   | Loading, full-screen error, inline error banner, empty state, virtualised rendering, aria attributes |
| `ChatWindow`    | Room name, aria-label, error banner, prop forwarding, send-disabled state, unauthenticated guard     |

```bash
npm run test:run   # Run all tests once
npm run test       # Watch mode
npm run test:ui    # Visual test UI
```

---

## Environment Variables

| Variable            | Default                     | Description                   |
| ------------------- | --------------------------- | ----------------------------- |
| `VITE_AUTH_TOKEN`   | `super-secret-doodle-token` | Bearer token for the Chat API |
| `VITE_API_BASE_URL` | `http://localhost:3000`     | Base URL for the Chat API     |

```bash
cp .env.example .env   # then edit as needed
```

In production, inject secrets via CI/CD from a secrets manager (AWS SSM, HashiCorp Vault, Azure Key Vault).

---

## Contributing

```bash
npm run dev      # Start development server
npm run build    # Type-check + production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

### Tech Stack

|                       |                                              |
| --------------------- | -------------------------------------------- |
| React 19 + TypeScript | UI & type safety                             |
| TanStack Query        | Fetching, polling & caching                  |
| TanStack Virtual      | Virtualised list for large message histories |
| Zustand               | Minimal global state                         |
| CSS Modules           | Scoped, component-level styles               |
| Vite                  | Fast dev server & build                      |
