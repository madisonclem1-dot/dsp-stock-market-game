# Delta Sigma Pi Kappa Tau Stock Market Challenge 2.0

A multiplayer, fictional investing game with 50 stocks, 10 alternative investments, 12 economic lessons, knowledge quizzes, synchronized market reactions, and live wealth / knowledge / overall leaderboards.

## Deploy on your existing Render service

1. Back up your existing GitHub repository before replacing any files.
2. Replace `server.js`, `package.json`, and `public/index.html` in the repository with the matching files from this package. Keep the directory structure unchanged.
3. In Render > your web service > Environment, set `HOST_PASSWORD` to a secret password you choose. Never commit it to GitHub or share it with players.
4. Use Build Command `npm install`, Start Command `npm start`. Enable automatic deployment of the `main` branch if desired.
5. Wait for Render to finish deploying, then open your `.onrender.com` URL (not a separate Netlify copy).
6. Test with two browser sessions before the event. Join players **before** the host starts the game.

## Host sequence

Start game → Launch next lesson → wait for player answers → Reveal market reaction → Continue trading → repeat for 12 lessons. The final lesson closes the game after Continue. Host can pause trading or finish early. Reset clears all players.

## Game mechanics

- Everyone starts with $10,000 in fictional cash; maximum 30 players.
- 50 stocks plus gold, silver, crude oil, corn, wheat, a broad market index fund, a Treasury bond fund, high-yield savings, a two-event CD, and a real estate fund.
- Prices move **when the host reveals market reactions**, based on predetermined simulated scenarios. Savings and CD prices earn simulated yields on each event; CD holdings cannot be sold until two news events have elapsed since the most recent CD purchase.
- Knowledge answers are accepted only once per player per event, worth 100 XP for correct answers. During lessons and reviews, trading is closed.
- Overall score: 70% relative wealth rank and 30% relative knowledge rank. This is a game ranking, not a professional risk-adjusted metric.
- Data is stored in server memory only. A Render restart / sleep may clear the lobby, players, and results. Free Render instances may take time to wake up.
- Server is authoritative for prices, trades, answers, and rankings; clients cannot supply market prices.
- This is not live market data or financial advice. All prices, event responses, and returns are fictional.

## Local test

```sh
npm install
HOST_PASSWORD=choose-a-private-password npm start
```

Open http://localhost:3000 .
