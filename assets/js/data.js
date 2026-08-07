/* =====================================================================
   PORTFOLIO CONTENT STORE
   Single source of truth for every project on the site.
   All pages read from RS.works / RS.categories — nothing is hardcoded
   in the HTML, so adding a project = adding one object below.

   Asset paths point at Media/web/** (optimised, web-sized derivatives
   built from Media/Pictures/My Works/**). Originals stay untouched.
   ===================================================================== */

window.RS = window.RS || {};

RS.categories = [
  { id: "all",           label: "All Work" },
  { id: "banners",       label: "Banners & Thumbnails" },
  { id: "logos",         label: "Logos & Identity" },
  { id: "ads",           label: "Advertising" },
  { id: "product",       label: "Product Design" },
  { id: "animations",    label: "Motion" },
  { id: "presentations", label: "Presentations" },
  { id: "etsy",          label: "Brand Packs" },
];

/* Each work:
   id, title, client, cat, year, tools[], type: 'image'|'video',
   src (full), thumb (grid), poster (video only), blurb,
   light (true -> render on a light tile, for dark transparent PNGs)

   Card widths are NOT set here — main.js packs each grid row to exactly
   12 columns, so the mosaic stays flush at any item count or filter. */
RS.works = [
  /* ---------------- BANNERS & THUMBNAILS ---------------- */
  {
    id: "nematov-ai-v1-2", ar: 1.7787, title: "Nematov AI", client: "Nematov AI", cat: "banners", year: "2025",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/banners/nematov-ai-v1-2.jpg", thumb: "Media/web/banners/nematov-ai-v1-2-thumb.jpg",
    blurb: "Channel identity for an AI education creator — a cold, technical palette cut with a single warm focal light so the face still leads the composition."
  },
  {
    id: "code-master-v0-2-with-c", ar: 1.7787, title: "Code Master", client: "Code Master", cat: "banners", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/banners/code-master-v0-2-with-c.jpg", thumb: "Media/web/banners/code-master-v0-2-with-c-thumb.jpg",
    blurb: "Programming-channel banner built around depth: layered code planes behind the subject, with the language mark held as the anchor."
  },
  {
    id: "speedscope", ar: 1.7787, title: "SpeedScope", client: "SpeedScope", cat: "banners", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/banners/speedscope.jpg", thumb: "Media/web/banners/speedscope-thumb.jpg",
    blurb: "High-velocity automotive branding — motion blur, lens flare and hard type lockup tuned to survive YouTube's aggressive downscale."
  },
  {
    id: "wolfgang2", ar: 1.7787, title: "WolfGang", client: "WolfGang", cat: "banners", year: "2024",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/banners/wolfgang2.jpg", thumb: "Media/web/banners/wolfgang2-thumb.jpg",
    blurb: "Gaming-crew banner. Heavy condensed type, aggressive contrast, and a mark that still reads at avatar size."
  },
  {
    id: "avadex", ar: 1.7787, title: "Avadex", client: "Avadex", cat: "banners", year: "2024",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/banners/avadex.jpg", thumb: "Media/web/banners/avadex-thumb.jpg",
    blurb: "Cover artwork with a restrained palette — the whole piece hangs on one accent hue and a lot of negative space."
  },
  {
    id: "kino-frost-banner", ar: 1.7787, title: "Kino Frost", client: "Kino Frost", cat: "banners", year: "2024",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/banners/kino-frost-banner.jpg", thumb: "Media/web/banners/kino-frost-banner-thumb.jpg",
    blurb: "Cinematic channel art with a cold-grade colour treatment and film-frame framing device."
  },

  /* ---------------- LOGOS & IDENTITY ---------------- */
  {
    id: "phoenix-security-logo-concept", ar: 1.5, title: "Phoenix Security", client: "Concept", cat: "logos", year: "2025",
    tools: ["Illustrator"], type: "image",
    src: "Media/web/logos/phoenix-security-logo-concept.jpg", thumb: "Media/web/logos/phoenix-security-logo-concept-thumb.jpg",
    blurb: "Cybersecurity mark built from a shield and a rising phoenix, resolved on a geometric grid so it holds together down to favicon scale."
  },
  {
    id: "trangok-project-1-after-effects", ar: 1, title: "Trangok — Logo Reveal I", client: "Trangok", cat: "logos", year: "2025",
    tools: ["After Effects", "Illustrator"], type: "video",
    src: "Media/web/logos/trangok-project-1-after-effects.mp4", poster: "Media/web/logos/trangok-project-1-after-effects-poster.jpg",
    blurb: "Logo animation with mechanical easing — the mark assembles from its own construction lines, then settles."
  },
  {
    id: "trangok-project-2after-effects-logo", ar: 1, title: "Trangok — Logo Reveal II", client: "Trangok", cat: "logos", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/logos/trangok-project-2after-effects-logo.mp4", poster: "Media/web/logos/trangok-project-2after-effects-logo-poster.jpg",
    blurb: "Second identity animation for the same client — a lighter, faster cut intended as a video intro sting."
  },

  /* ---------------- ADVERTISING ---------------- */
  {
    id: "monster-energy-wide", ar: 1.7787, title: "Monster Energy — Key Visual", client: "Spec work", cat: "ads", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/ads/monster-energy-wide.jpg", thumb: "Media/web/ads/monster-energy-wide-thumb.jpg",
    blurb: "Wide-format key visual. Product hero lit hard against near-black, with splash dynamics carrying the energy of the brand."
  },
  {
    id: "monster-energy", ar: 1, title: "Monster Energy — Poster", client: "Spec work", cat: "ads", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/ads/monster-energy.jpg", thumb: "Media/web/ads/monster-energy-thumb.jpg",
    blurb: "Portrait cut of the same campaign, recomposed for feed and story placements rather than cropped."
  },
  {
    id: "chanel", ar: 1, title: "Chanel — Fragrance", client: "Spec work", cat: "ads", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/ads/bleu-de-chanel.jpg", thumb: "Media/web/ads/bleu-de-chanel-thumb.jpg",
    blurb: "Luxury advertising study. Almost no colour, almost no type — the whole thing is lighting, product placement and restraint."
  },

  /* ---------------- PRODUCT DESIGN ---------------- */
  {
    id: "z-fold-7-v1", ar: 1, title: "Z Fold 7", client: "Concept", cat: "product", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/product/z-fold-7-v1.jpg", thumb: "Media/web/product/z-fold-7-v1-thumb.jpg",
    blurb: "Device launch visual — studio lighting, controlled reflections, and a colour story that lets the hardware silhouette do the talking."
  },
  {
    id: "hoodie-product-cover-dsgn", ar: 1, title: "Hoodie — Product Cover", client: "MODERNZ", cat: "product", year: "2025",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/product/hoodie-product-cover-dsgn.jpg", thumb: "Media/web/product/hoodie-product-cover-dsgn-thumb.jpg",
    blurb: "Apparel cover art for a streetwear drop, treated like an album sleeve rather than a catalogue shot."
  },
  {
    id: "modernz-wear-design", ar: 0.7993, title: "MODERNZ Wear", client: "MODERNZ", cat: "product", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/product/modernz-wear-design.jpg", thumb: "Media/web/product/modernz-wear-design-thumb.jpg",
    blurb: "Full apparel line visual — consistent grading and mockup discipline so the range reads as one collection."
  },
  {
    id: "t-shirt-1", ar: 1, title: "Tee — Graphic I", client: "MODERNZ", cat: "product", year: "2025",
    tools: ["Illustrator", "Photoshop"], type: "image",
    src: "Media/web/product/t-shirt-1.jpg", thumb: "Media/web/product/t-shirt-1-thumb.jpg",
    blurb: "Print graphic designed for garment, not for screen — heavy weights, limited inks, generous bleed."
  },
  {
    id: "t-shirt-2", ar: 1, title: "Tee — Graphic II", client: "MODERNZ", cat: "product", year: "2025",
    tools: ["Illustrator", "Photoshop"], type: "image",
    src: "Media/web/product/t-shirt-2.jpg", thumb: "Media/web/product/t-shirt-2-thumb.jpg",
    blurb: "Companion print. Same system, different energy — proof the identity survives more than one execution."
  },
  {
    id: "cell-divide-v2-0", ar: 1, title: "Cell Divide v2.0", client: "Cell Divide", cat: "product", year: "2025",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/product/cell-divide-v2-0.jpg", thumb: "Media/web/product/cell-divide-v2-0-thumb.jpg",
    blurb: "Final iteration of the Cell Divide packaging concept — the version where the type system finally locked."
  },
  {
    id: "cell-divide-v1-3", ar: 1, title: "Cell Divide v1.3", client: "Cell Divide", cat: "product", year: "2025",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/product/cell-divide-v1-3.jpg", thumb: "Media/web/product/cell-divide-v1-3-thumb.jpg",
    blurb: "Mid-stage revision. Kept here deliberately — the iteration is part of the work."
  },
  {
    id: "cell-divide-v1-0", ar: 1, title: "Cell Divide v1.0", client: "Cell Divide", cat: "product", year: "2024",
    tools: ["Photoshop"], type: "image",
    src: "Media/web/product/cell-divide-v1-0.jpg", thumb: "Media/web/product/cell-divide-v1-0-thumb.jpg",
    blurb: "The first pass at the concept, before the palette was pulled back and the composition simplified."
  },

  /* ---------------- MOTION ---------------- */
  {
    id: "project-9-after-effects", ar: 1.7778, title: "Motion Study 09", client: "Personal", cat: "animations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/animations/project-9-after-effects.mp4", poster: "Media/web/animations/project-9-after-effects-poster.jpg",
    blurb: "Longest of the motion studies — shape-layer choreography with overlapping action and a deliberate hold before the resolve."
  },
  {
    id: "project-8-after-effects", ar: 1.7778, title: "Motion Study 08", client: "Personal", cat: "animations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/animations/project-8-after-effects.mp4", poster: "Media/web/animations/project-8-after-effects-poster.jpg",
    blurb: "Kinetic typography exercise focused on entrance timing and the weight of a well-placed pause."
  },
  {
    id: "project-10-after-effects", ar: 1.7778, title: "Motion Study 10", client: "Personal", cat: "animations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/animations/project-10-after-effects.mp4", poster: "Media/web/animations/project-10-after-effects-poster.jpg",
    blurb: "Short transition loop — built to be dropped between cuts in a longer edit."
  },
  {
    id: "project-4-after-effects", ar: 1.7734, title: "Motion Study 04", client: "Personal", cat: "animations", year: "2024",
    tools: ["After Effects"], type: "video",
    src: "Media/web/animations/project-4-after-effects.mp4", poster: "Media/web/animations/project-4-after-effects-poster.jpg",
    blurb: "Early animation study. Simple mechanics, but it's where the easing habits came from."
  },

  /* ---------------- PRESENTATIONS ---------------- */
  {
    id: "lambo-1", ar: 1.7778, title: "Automotive", client: "Presentation", cat: "presentations", year: "2025",
    tools: ["After Effects", "Photoshop"], type: "video",
    src: "Media/web/presentations/lambo-1.mp4", poster: "Media/web/presentations/lambo-1-poster.jpg",
    blurb: "Animated presentation sequence — camera moves and transitions cut to a rhythm rather than to the slide count."
  },
  {
    id: "tokio-1", ar: 1.7778, title: "Tokyo", client: "Presentation", cat: "presentations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/presentations/tokio-1.mp4", poster: "Media/web/presentations/tokio-1-poster.jpg",
    blurb: "City sequence built on neon grading and hard type cuts synced to the edit."
  },
  {
    id: "fighter-jet-1", ar: 1.7778, title: "Aviation", client: "Presentation", cat: "presentations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/presentations/fighter-jet-1.mp4", poster: "Media/web/presentations/fighter-jet-1-poster.jpg",
    blurb: "Technical-brief styling — HUD motifs, precise alignment, and motion that stays out of the information's way."
  },
  {
    id: "earth", ar: 1.7778, title: "Earth", client: "Presentation", cat: "presentations", year: "2025",
    tools: ["After Effects"], type: "video",
    src: "Media/web/presentations/earth.mp4", poster: "Media/web/presentations/earth-poster.jpg",
    blurb: "Orbital opener for an environmental deck. Slow, wide, and deliberately unhurried."
  },
  {
    id: "cars", ar: 1.7778, title: "Cars", client: "Presentation", cat: "presentations", year: "2024",
    tools: ["After Effects"], type: "video",
    src: "Media/web/presentations/cars.mp4", poster: "Media/web/presentations/cars-poster.jpg",
    blurb: "Product-reveal sequence with layered parallax and a hard-cut finish."
  },
  {
    id: "nature", ar: 1.7778, title: "Nature", client: "Presentation", cat: "presentations", year: "2024",
    tools: ["After Effects"], type: "video",
    src: "Media/web/presentations/nature.mp4", poster: "Media/web/presentations/nature-poster.jpg",
    blurb: "Softer counterpoint to the rest of the set — organic transitions, warm grade, longer holds."
  },

  /* ---------------- BRAND PACKS ---------------- */
  {
    id: "kingston-blake-etsy-banner-fashion", ar: 3.9823, title: "Kingston Blake — Store Banner", client: "Kingston Blake", cat: "etsy", year: "2025",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/etsy/kingston-blake-etsy-banner-fashion.jpg", thumb: "Media/web/etsy/kingston-blake-etsy-banner-fashion-thumb.jpg",
    blurb: "Storefront banner for a fashion label — part of a full Etsy pack covering banner, mark and listing style."
  },
  {
    id: "kingston-blake-etsy-logo-fashion", ar: 1, title: "Kingston Blake — Mark", client: "Kingston Blake", cat: "etsy", year: "2025",
    tools: ["Illustrator"], type: "image",
    src: "Media/web/etsy/kingston-blake-etsy-logo-fashion.jpg", thumb: "Media/web/etsy/kingston-blake-etsy-logo-fashion-thumb.jpg",
    blurb: "Primary logotype, drawn for a fashion label that needed to look older than it is."
  },
  {
    id: "kingston-blake-kingston-blake-logo-white", ar: 1.8957, title: "Kingston Blake — Reversed", client: "Kingston Blake", cat: "etsy", year: "2025",
    tools: ["Illustrator"], type: "image",
    src: "Media/web/etsy/kingston-blake-kingston-blake-logo-white.png",
    thumb: "Media/web/etsy/kingston-blake-kingston-blake-logo-white.png",
    blurb: "Reversed lockup from the identity pack, for dark packaging and labels."
  },
  {
    id: "kingston-blake-kingston-blake-logo-black", ar: 1.8957, title: "Kingston Blake — Primary", client: "Kingston Blake", cat: "etsy", year: "2025",
    tools: ["Illustrator"], type: "image", light: true,
    src: "Media/web/etsy/kingston-blake-kingston-blake-logo-black.png",
    thumb: "Media/web/etsy/kingston-blake-kingston-blake-logo-black.png",
    blurb: "Positive lockup on light — the master artwork the rest of the pack derives from."
  },
  {
    id: "punny-planet-etsy-banner", ar: 3.9823, title: "Punny Planet — Store Banner", client: "Punny Planet", cat: "etsy", year: "2025",
    tools: ["Photoshop", "Illustrator"], type: "image",
    src: "Media/web/etsy/punny-planet-etsy-banner.jpg", thumb: "Media/web/etsy/punny-planet-etsy-banner-thumb.jpg",
    blurb: "Playful storefront identity — a deliberate tonal opposite to Kingston Blake, from the same hand."
  },
  {
    id: "punny-planet-p-planet", ar: 1, title: "Punny Planet — Mark", client: "Punny Planet", cat: "etsy", year: "2025",
    tools: ["Illustrator"], type: "image", light: true,
    src: "Media/web/etsy/punny-planet-p-planet.png", thumb: "Media/web/etsy/punny-planet-p-planet.png",
    blurb: "Character-led mark built to survive being printed on mugs, stickers and everything else."
  },
];

/* Hero showcase — the frames the WebGL stage melts between.
   These must be WIDE (16:9). The stage renders them *contained*, never
   cropped, so each piece is shown whole with its own typography intact —
   the site's headline sits beside the stage, never on top of it. */
RS.hero = [
  { src: "Media/web/banners/nematov-ai-v1-2.jpg",  label: "Nematov AI",    kicker: "Channel Identity" },
  { src: "Media/web/ads/monster-energy-wide.jpg",  label: "Monster Energy", kicker: "Advertising" },
  { src: "Media/web/banners/speedscope.jpg",       label: "SpeedScope",    kicker: "Channel Design" },
  { src: "Media/web/banners/wolfgang2.jpg",        label: "WolfGang",      kicker: "Gaming Brand" },
];

/* Capability pillars used on the home + about pages. */
RS.services = [
  {
    n: "01", title: "Brand Identity",
    body: "Logos, marks and the rules around them. Built on a grid, tested at every size, delivered with the files you actually need.",
    tags: ["Logo design", "Brand guidelines", "Logo animation"]
  },
  {
    n: "02", title: "Content Design",
    body: "Banners, thumbnails, covers and social sets that survive compression, thumbnails and a scrolling thumb.",
    tags: ["YouTube", "Instagram", "Etsy packs"]
  },
  {
    n: "03", title: "Motion Design",
    body: "After Effects work — logo reveals, kinetic type, animated presentations. Timing first, effects second.",
    tags: ["After Effects", "Logo reveals", "Presentations"]
  },
  {
    n: "04", title: "Product & Advertising",
    body: "Key visuals, packaging concepts and apparel graphics. Studio-grade compositing and colour discipline.",
    tags: ["Key visuals", "Apparel", "Packaging"]
  },
];

RS.tools = [
  { name: "Photoshop",     icon: "Media/Icons/photoshop-svg.svg" },
  { name: "Illustrator",   icon: "Media/Icons/illustrator-svg.svg" },
  { name: "After Effects", icon: "Media/Icons/aftereffects-svg.svg" },
  { name: "Behance",       icon: "Media/Icons/behance-svg.svg" },
  { name: "Pinterest",     icon: "Media/Icons/pinterest-svg.svg" },
  { name: "Unsplash",      icon: "Media/Icons/unsplash-svg.svg" },
  { name: "ChatGPT",       icon: "Media/Icons/chatgpt-svg.svg" },
  { name: "Claude",        icon: "Media/Icons/claude-svg.svg" },
];

RS.contact = {
  email: "sulaymonruziboev75@gmail.com",
  phone: "+998 94 314 55 77",
  phoneHref: "+998943145577",
  location: "Samarkand, Uzbekistan",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/aeolian.arts/",     icon: "Media/Icons/instagram-png.png" },
    { name: "Behance",   href: "https://www.behance.net/sulaymoruziboe",     icon: "Media/Icons/behance-svg-wht.svg" },
    { name: "Telegram",  href: "https://t.me/evedere",                  icon: "Media/Icons/telegram-svg.svg" },
  ],
};
