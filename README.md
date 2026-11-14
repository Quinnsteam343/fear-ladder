# Fear Ladder

A rules-based crypto signal app: **only the live top 10 coins**, buy in **extreme fear** when a coin is **≥ 50% below its high** (4 spaced tranches), sell in thirds at **+100% / +200% / +300%**.

- **Phone app** (root): installable web app for Android and iPhone — open the GitHub Pages link, then *Install app* (Chrome) or *Share → Add to Home Screen* (Safari).
- **Desktop dashboard**: [`/desktop/`](desktop/) — signals, backtest, out-of-sample evidence, plan, journal.

All market data comes live from public sources (DefiLlama, Kraken, Bybit, CoinGecko, alternative.me) and is held in memory only. Your journal and settings stay in your own browser; nothing personal is stored in this repo.

Signals restate the rules above. Not financial advice.

## Privacy & security
- **No cookies, no analytics, no ads, no third-party scripts.** Fonts are self-hosted (`fonts/`, OFL-licensed); nothing loads from Google or any CDN.
- **Content Security Policy** on both pages: the app can only talk to its own site and the five public data sources (DefiLlama, Kraken, Bybit, CoinGecko, alternative.me; Coinbase as an AUD fallback). Anything else is blocked by the browser. The phone app also blocks all inline scripts.
- **Requests never send cookies or referrers** (`credentials: omit`, `no-referrer`).
- **Outside data is treated as untrusted:** coin ids/symbols and labels are filtered before display; imported journal entries are validated and anything malformed is dropped.
- Your journal and settings live only in your own browser's storage on each device.
