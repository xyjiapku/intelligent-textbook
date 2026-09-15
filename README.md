# Intelligent Textbook

Three interactive economics books, sharing one front door.

**→ https://xyjiapku.github.io/intelligent-textbook/**

## What's inside

| Book | What it is | Path |
|---|---|---|
| **Market Forces — A Firm's Journey** | A classroom role-play: run one firm through all four market structures. Pick the product, hire the workers, set the price. | `market-forces/` |
| **A Brief History of Economic Thought** | From Adam Smith to behavioural economics — the people, the arguments, and how the discipline changed its mind. | `economic-thought-history/` |
| **Game Theory Rush** | Three chapters, eight payoff matrices solved two ways, plus interactive labs on Cournot and Hotelling competition. | `game-theory-rush/` |

The landing page (`index.html`) is the only file that ties them together — each book is
completely self-contained and can be opened, copied or zipped on its own.

## Publishing notes

- Hosted on GitHub Pages from `main` / root. `.nojekyll` is present so Pages serves the
  files exactly as they are instead of running them through Jekyll.
- Nothing here needs a server, a build step or a network connection. Every page works
  from `file://` as well as over HTTP.
- The masthead typeface is embedded in `index.html` as a base64 subset, so the title
  renders identically everywhere without a network request. See `FONT-LICENSE.md`.
- All three books are English-first by design; the teaching language for
  AP / IGCSE / IB Economics is English.

## Related

- **互动小程序 · Economics Mini Lab** — https://xyjiapku.github.io/economics_mini_lab/
- **课件 · Courseware** (AP Micro, AP Macro, IGCSE) — https://xyjiapku.github.io/econ-courseware/
