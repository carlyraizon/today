# Today: a calm daily dashboard (v1)

One calm page that pulls the whole day together: greeting → schedule → top 3 → lift/rest → habits → cleaning → sketch prompt → media pick.
Plain static site (HTML/CSS/vanilla JS modules). No build step, no dependencies, no accounts. Data lives in `localStorage`.

## Live
https://carlyraizon.github.io/today/. Data stays in your browser; nothing is sent anywhere.

## Run locally
    cd today-app && python3 -m http.server 8765
    # open http://localhost:8765
(It has to be served over http, because ES modules and `today.json` don't load from `file://`.)

## Using it
- **Example data** is flagged by a banner at the top. Use **Clear example data** to start fresh.
- **Export / Import**: JSON backup of everything.
- **Top 3**: hover (or tap) a row for controls: ↑/↓ reorder, *Later* moves it to the backlog, *To top 3* moves it back. New to-dos go to Later once the top 3 is full.
- **Training**: tap days to toggle lift days. Set your Ladder link, your name and the training note in **Settings** (footer).
- **Clear all data** (footer) wipes everything on this device but keeps your settings.
- **Cleaning**: shows only what's due (daily ≥1 day, weekly ≥7, monthly ≥30 since last done).
- **Habits**: check off today; 🔥 counts consecutive days (today or through yesterday).
- **Sketch prompt**: 60 built-in prompts, rotating by date (`js/prompts.js`).

## today.json (daily suggestions from another process)
Drop a `today.json` next to `index.html`. On page load it gets merged **once per new file content**, and your checkmarks are kept:
```json
{
  "top3": ["Ship v1 dashboard", "Call mom", "Book dentist"],
  "media": {
    "current": {"title": "Severance", "type": "watch", "link": "https://…", "why": "Fun"},
    "queue":   [{"title": "Song Exploder ep. 12", "type": "listen", "link": "", "why": "Short"}]
  },
  "meal": {"text": "Sheet-pan gnocchi with tomatoes and spinach.", "link": "https://…"},
  "cleaning": [{"name": "Dust shelves", "freq": "weekly", "last": "2026-10-01"}]
}
```
All keys are optional. `type` is one of read/watch/listen, and `freq` is one of daily/weekly/monthly.
- **top3** replaces the top 3. If a title matches an item you already have, its checkmark is kept. Unfinished items that drop off go to *Later*.
- **media** puts `current` first, then `queue`, ahead of your existing items. Duplicate titles are removed.
- **meal** (optional) shows in the Meal section as one or two lines of text, plus a link if there is one. If `meal` is missing from the latest today.json, the section says "No meal note today".
- **cleaning** adds tasks it doesn't know yet. A task it already knows (matched by name) gets its frequency updated, and its last-done date is kept.

## Code layout
- `js/store.js`: state, seed data, load/save
- `js/schedule-source.js`: **schedule data source**. v1 is `LocalSource`. To add Google Calendar, write a `GoogleCalendarSource` with the same `getEvents()` and set `activeSource`.
- `js/prompts.js`: sketch prompts
- `js/app.js`: rendering and interactions

## Next steps
- Google Calendar: OAuth via Google Identity Services (client-side), then calendar.events.list for today, read-only, merged with local events.
- Hosting: GitHub Pages (push the folder), Netlify, or Cloudflare Pages (drag-and-drop). Data stays per-browser, so use Export/Import to move between devices, or add sync later.
- PWA manifest + offline cache so it opens like an app on the phone home screen.
- Drag-and-drop reordering and inline editing of items.
