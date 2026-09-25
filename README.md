# Sulaymon Ruziboev — Portfolio

A static, no-build site. Four pages, one stylesheet, one content file.
Nothing to install and nothing to compile — but it **must be served over
HTTP**, not opened with a double-click (`file://` blocks ES modules, so the
WebGL hero won't start).

## Run it locally

```bash
npx http-server -p 8322 -c-1 .
```

Then open <http://localhost:8322>.

## Layout

```
index.html          Home — WebGL hero, featured work, capabilities
work.html           All projects, filterable, with lightbox
about.html          Bio, skills, timeline
contact.html        Form, details, FAQ
robots.txt

assets/css/main.css     Design tokens + every component
assets/js/data.js       ← ALL CONTENT LIVES HERE
assets/js/main.js       Shared runtime (header, menu, grid, lightbox…)
assets/js/hero-gl.js    Three.js hero shader (ES module)

Media/Pictures/My Works/    Your original files — never touched
Media/web/                  Optimised web copies, generated (30 MB vs 185 MB)
_legacy/                    The first version of the site, kept for reference
```

## Adding a project

Everything on the site is rendered from `assets/js/data.js`. To add a piece,
drop an object into `RS.works` — no HTML to edit:

```js
{
  id: "my-new-piece",              // unique, kebab-case
  title: "My New Piece",
  client: "Client name",
  cat: "banners",                  // must match an id in RS.categories
  year: "2026",
  addedAt: "2026-09-25",           // date added; newest dates appear first
  tools: ["Photoshop"],
  type: "image",                   // "image" or "video"
  src:   "Media/web/banners/my-new-piece.jpg",
  thumb: "Media/web/banners/my-new-piece-thumb.jpg",
  blurb: "One or two sentences about the work."
}
```

New work is sorted by `addedAt` (ISO `YYYY-MM-DD`) descending on every page and within category filters. Older entries without that field fall back to their project year; matching dates retain their order in the content file. The home page shows at least the newest nine projects, expanding to include every project sharing the latest addition date, while the four-slide hero only accepts new 16:9 images. Add each future design to `RS.works` with its actual addition date to feature it automatically.

Card sizes are calculated from each artwork's `ar` aspect ratio by the justified layout in `main.js`, preserving the full artwork.

For a video use `type: "video"` with `src` (`.mp4`) and `poster` (`.jpg`)
instead of `thumb`. Set `light: true` on a transparent PNG that needs a light
tile behind it.

The header, menu overlay and footer are all rendered by `main.js`, so edit
them once there and every page updates.

## Regenerating optimised media

New artwork goes in `Media/Pictures/My Works/<Category>/`. The web-sized
copies in `Media/web/` were produced with `ffmpeg`:

```bash
ffmpeg -y -i input.jpg -vf "scale='min(1800,iw)':-2" -q:v 4 output.jpg
ffmpeg -y -i input.jpg -vf "scale='min(900,iw)':-2"  -q:v 5 output-thumb.jpg
```

```bash
ffmpeg -y -i input.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an output.mp4
```

```bash
ffmpeg -y -ss 0.5 -i input.mp4 -frames:v 1 -vf "scale='min(1280,iw)':-2" -q:v 4 output-poster.jpg
```

## Changing the hero slideshow

`RS.buildHero()` preserves the original four slides (Nematov AI, Monster Energy, SpeedScope, WolfGang). A newly added image with a valid `addedAt` date and a clean 16:9 `ar` replaces one slot, newest first. Each eligible image replaces one original slide; remaining originals stay in their slots. At most four replacements are used. Portrait, square, 4:3, missing-ratio entries and videos cannot replace slides. Set `ar` to the source width divided by height; the comparison permits only four-decimal rounding (1.7778), not approximate widescreen formats. Gallery ordering is independent of hero eligibility.

## Rolling back the page transition

`_backup/pre-transition/` is a snapshot of the four pages plus `assets/`
taken immediately before the page-transition and click-burst work. To undo
all of it, from the `Org` folder:

```bash
cp -r _backup/pre-transition/. .
```

To disable just the transition without reverting anything, comment out the
`initTransition();` call in `boot()` at the bottom of `assets/js/main.js`.
Links fall straight back to normal browser navigation — the transition only
ever intercepts clicks, it never owns them.

## Notes before you publish

- **The contact form opens the visitor's email app** (`mailto:`). It doesn't
  send anything itself. To collect submissions properly, sign up for
  [Formspree](https://formspree.io) or host on Netlify and swap the submit
  handler in `initContactForm()` (`assets/js/main.js`).
- **Skill percentages and the timeline in `about.html` are my best guess** —
  read them and correct anything that isn't true.
- The two spec pieces (Chanel, Monster Energy) are labelled "Spec work" in
  `data.js`. Keep that honest if you show them to clients.
- Three.js loads from a CDN. If you'd rather not depend on one, download
  `three.module.js` into `assets/js/vendor/` and change the import at the top
  of `hero-gl.js`.
