# OutlineBased — Country-Shape Guessing Game

Live demo: https://melihadalet.github.io/OutlineBased/

OutlineBased is a small, fun geography game that challenges you to identify countries from their outlines (silhouettes). Each round shows a country's shape; your job is to type (or pick) the correct country name. The app is designed for quick play, learning, and sharing high scores.

Features
- Guess countries by outline (silhouette) — great for learning country shapes
- Multiple difficulty levels (region-only, country-only, mixed)
- Hints: continent, capital, or a zoomed-in detail of the outline
- Timer and scoring to encourage improvement
- Mobile-friendly UI so you can play on the go
- Lightweight, static-friendly site that can be hosted via GitHub Pages

Play
- Visit the live site: https://melihadalet.github.io/OutlineBased/
- Start a new game, select a difficulty or region, and try to guess as many outlines as you can before time runs out.

Getting started (developer)
Prerequisites
- Node.js (recommended LTS) and npm — only required for local development and building the site. The site itself is a static app that can be served on any static host.

Run locally
1. Clone the repo:
   git clone https://github.com/MelihAdalet/OutlineBased.git
2. Install dependencies:
   npm install
3. Start the dev server:
   npm run dev
4. Open your browser to:
   http://localhost:3000
   (port may vary depending on the dev server)

Build for production
- To build optimized static assets:
  npm run build
- Serve the build locally (optional):
  npm run serve

Deploy
- This project is configured to work with GitHub Pages. After running the build step, push the built files to the branch or folder you use for Pages (for example, the gh-pages branch or the repository's docs/ folder).
- The public demo is available at:
  https://melihadalet.github.io/OutlineBased/

Data & assets
- Country outlines come from open geographic data sources (e.g., Natural Earth, public GeoJSONs) and are used for educational/demonstration purposes. If you need to update or replace the dataset, look in the /data or /public folder for GeoJSONs and shape tiles.

Development notes
- The app is intentionally small and focused. If you'd like to extend it:
  - Add new hint types (e.g., flag silhouette, population bracket)
  - Add multiplayer or score leaderboards
  - Localize the country names into other languages
  - Add progressive difficulty and learning-mode review sessions

Contributing
Contributions, bug reports, and improvements are welcome.
- Fork the repo
- Create a branch for your feature or fix
- Open a pull request with a short description of changes

License
- MIT — see LICENSE file for details.

Contact
- Author / Maintainer: Melih Adalet — https://github.com/MelihAdalet

Thanks for trying OutlineBased — have fun learning the world by its shapes!