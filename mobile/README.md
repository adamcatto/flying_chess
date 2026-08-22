# Flying Chess — mobile (React Native + Expo)

A playable **aeroplane chess** (Ludo-style flying chess) game for iOS, built with
React Native and Expo. This is the **2‑player team mode**, pass‑and‑play on a
single device:

- **Team 1** controls **Yellow + Green**
- **Team 2** controls **Red + Blue**

Two people share one phone and hand it back and forth each turn. The first team to
fly all 8 of its planes home to the center wins.

---

## ▶️ Test it on your iPhone (no Mac, no Xcode needed)

You only need a computer (Windows, Mac, or Linux) to run the dev server and your
iPhone with the free **Expo Go** app. The phone connects to the server over
Wi‑Fi and loads the game live.

1. **On your iPhone:** install **Expo Go** from the App Store.
2. **On your computer:** install [Node.js](https://nodejs.org) (LTS) if you don't
   have it, then:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. A **QR code** appears in the terminal. Open the iPhone **Camera** app and point
   it at the QR code, then tap the banner — it opens the game in Expo Go.
   - Your phone and computer must be on the **same Wi‑Fi network**.
   - On a restricted network (e.g. some office/campus Wi‑Fi), run
     `npx expo start --tunnel` instead — it works across networks (needs an
     Expo account; it will prompt you).

That's it — edit the code and the app reloads on your phone instantly.

### Prefer to try it without a phone?

```bash
npm run web      # opens the game in your browser
```

---

## 🎮 How to play

- Each turn a team gets **2 rolls**. Tap **ROLL**, then tap one of the
  highlighted planes (either of your team's colors) to move it.
- A plane leaves the hangar only when you roll a **6**. Rolling a 6 also earns an
  **extra roll**.
- **Same‑color jump:** land on one of your team's tinted squares to leap forward
  to the next one.
- **Flight ✈:** land on your color's flight square (marked ✈) to fly a shortcut
  across the board.
- **Capture:** land on an enemy plane to send it back to its hangar. Teammates can
  safely share a square, and the ✦ start squares are safe for everyone.
- **Home:** after a lap, a plane turns up its colored home column to the center
  **★**. You must land exactly — overshooting bounces back.
- Three 6s in a row forfeits your turn and sends that plane back!

Tap **Rules** in‑game for the same summary.

---

## 🗂 Project structure

```
mobile/
├─ App.tsx                     # root: switches Start ↔ Game screens
├─ src/
│  ├─ game/
│  │  ├─ board.ts              # 15×15 board geometry, 56-cell loop, coordinates
│  │  └─ engine.ts             # pure game rules (turns, moves, capture, win)
│  ├─ components/
│  │  ├─ BoardView.tsx         # renders board, squares, planes, highlights
│  │  └─ Die.tsx               # die face with pips
│  ├─ screens/
│  │  ├─ StartScreen.tsx
│  │  ├─ GameScreen.tsx        # turn flow, controls, win overlay
│  │  └─ RulesModal.tsx
│  └─ theme.ts                 # colors
└─ scripts/simulate.ts         # node sanity tests for the engine + geometry
```

The game engine in `src/game/` is pure (no UI), so it can be tested directly.

## 🧪 Dev scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # runs board/engine sanity checks under node (via tsx)
```

---

## 📦 Making a standalone build / TestFlight (optional, later)

Expo Go is perfect for testing. When you want a standalone `.ipa` or to put it on
TestFlight, use [EAS Build](https://docs.expo.dev/build/introduction/) — it builds
in the cloud, so you still don't strictly need a Mac (a paid Apple Developer
account is required for TestFlight / App Store distribution):

```bash
npm install -g eas-cli
eas build --platform ios
```
