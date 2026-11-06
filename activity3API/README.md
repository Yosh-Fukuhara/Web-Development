# One Piece TCG Card Library

A simple, beginner-friendly website for browsing One Piece Trading Card Game cards. It fetches live card data from a free public API and falls back to a local sample file when the API is unavailable.

Built with plain **HTML, CSS, and vanilla JavaScript** — no frameworks, no build tools, no npm, and no API keys.

## Features

- Responsive grid of card images (CSS Grid)
- Each card shows its **name, card ID, color, and type**
- **Search bar** to filter cards by name
- **Color** and **card type** (Leader, Character, Event, Stage) dropdown filters
- Click a card to open a **modal** with a larger image and full details (cost, power, attribute, effect text, rarity, life, counter, sub types)
- **Loading** message while data is fetching and a friendly **error** message if it fails
- **"No cards found"** message when filters return nothing
- Images lazy-loaded with `loading="lazy"`
- Dark nautical theme with a red accent

## Data source

Card data is fetched from the free public **OPTCG API** (no key required):

- All cards: `https://optcgapi.com/api/allSetCards/`
- Docs: https://optcgapi.com/documentation

If the API can't be reached, the site automatically uses the local [cards.json](cards.json) file, which contains 20 sample cards in the same format as the API response.

## Files

```
index.html    Page structure and layout
style.css     All styling and responsive rules
script.js     Fetching, filtering, rendering and modal logic
cards.json    Offline fallback data (20 sample cards)
README.md     This file
```

## Run it locally

1. Download or clone the folder.
2. Double-click `index.html` (or open it in any modern browser).

That's it — everything runs in the browser.

> Tip: For the API fetch to work, open the page over `http://` or `https://` rather than the `file://` path. GitHub Pages works out of the box. If you open it directly as a file and the API call is blocked, the local `cards.json` fallback is used instead.

## Deploy with GitHub Pages

1. Push these files to a GitHub repository (the files must be in the repository root, or in a folder you select as the source).
2. Go to the repository's **Settings**.
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Select the **main** branch and the `/ (root)` folder, then click **Save**.
6. Wait a minute, then open the published URL (usually `https://<your-username>.github.io/<repo-name>/`).

All paths in the project are **relative**, so it works correctly on GitHub Pages.

## Notes

- No API key is required.
- One Piece and the One Piece Trading Card Game are trademarks of Eiichiro Oda, Bandai, Shonen Jump, and Viz Media. This project is for educational use only.
