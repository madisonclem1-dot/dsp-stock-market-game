# DSP Stock Market Challenge

Multiplayer educational stock game for up to 30 individual players. No Firebase or database needed.

## Deploy using Render (web dashboard)
1. Create a new private GitHub repository and upload the files in this folder (package.json, server.js, and public/index.html).
2. In Render, choose **New > Web Service**, connect the repository, select **Node**.
3. Build command: `npm install`. Start command: `npm start`.
4. Under Environment, add `HOST_PASSWORD` with a strong, unique secret. Never place the password in source code or share it with players.
5. Deploy and open the resulting HTTPS address. Share that same address with players. The host selects **Host** and enters the password.
6. Test with two different phones or browser profiles before the event.

## Gameplay
- Up to 30 unique player names; each receives $10,000 fictional cash.
- Host starts the game, then advances up to 10 news rounds manually.
- Players trade whole shares at current simulated prices.
- All portfolio values and rankings update via Socket.IO.
- End the game to freeze trades and display final rankings.
- Reset clears all player sessions and starts a fresh game.

## Important limits
- All state is stored in server memory. A server restart or free-host sleep erases the game. Use a hosting plan that stays awake during the event; rehearse first.
- One player per browser session; tokens are stored in localStorage to reconnect after refresh.
- Host password is checked server-side. Set `HOST_PASSWORD` before deployment.
- This is an event game, not a production financial platform. There is no identity verification, persistent storage, or anti-cheat account system.
- Players must join before the host presses Start. The maximum player count is 30.
