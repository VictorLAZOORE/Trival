# Trival — Real-time Multiplayer Trivia

A Kahoot-style trivia game built with Next.js, Socket.io, and OpenAI. Play with friends in real-time on any device.

## Features

- Real-time multiplayer via WebSockets
- AI-generated trivia questions (10+ themes or custom)
- Mobile-first responsive design
- Speed-based scoring system
- Live leaderboard with animations
- Sound effects and confetti winner celebration

## Tech Stack

- **Next.js 16** (React 19, App Router)
- **TailwindCSS 4**
- **Socket.io** for real-time multiplayer
- **OpenAI API** for dynamic question generation
- **In-memory storage** for rooms

## Getting Started

### Prerequisites

- Node.js 20+
- An OpenAI API key

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

> Without a valid key, the app falls back to a set of built-in trivia questions.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm start
```

## How to Play

1. Enter your name on the home screen
2. **Create a Room** or **Join** with a 6-character room code
3. Host picks a theme and number of questions
4. Host clicks **Generate Questions** then **Start Game**
5. Answer questions as fast as you can — speed = more points!
6. See the leaderboard after each question
7. Winner gets confetti

## Project Structure

```
src/
  app/
    page.tsx              # Home (create/join room)
    room/[code]/page.tsx  # Game room
    api/questions/route.ts # Question generation endpoint
  components/
    Lobby.tsx             # Waiting room with settings
    QuestionCard.tsx      # Question display + answer buttons
    AnswerReveal.tsx      # Correct answer reveal
    Leaderboard.tsx       # Score rankings
    WinnerScreen.tsx      # End-of-game celebration
  lib/
    openai.ts             # OpenAI question generation
    socket.ts             # Socket.io client singleton
    sounds.ts             # Web Audio API sound effects
  server/
    gameManager.ts        # Room + game state management
  types/
    game.ts               # Shared TypeScript types
server.ts                 # Custom Node.js server (Socket.io + Next.js)
```
