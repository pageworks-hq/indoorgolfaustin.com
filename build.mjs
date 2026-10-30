// Static site generator: `node build.mjs` → ./dist (deploy to Netlify, Cloudflare Pages, Vercel, etc.)
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { site, utm } from "./site.config.mjs";
import { pages, faqs } from "./pages.mjs";

const OUT = "dist";
const today = new Date().toISOString().slice(0, 10);
const A = site.address;
const fullAddr = A.street ? `${A.street}, ${A.city}, ${A.region} ${A.postal}` : `${A.city}, ${A.region}`;
const abs = p => site.url + p;
const BIZ_ID = abs("/#business");
// Minimal HTML → Markdown for the .md twins and llms-full.txt (handles the tags pages.mjs uses).
const toMd = html => html
  .replace(/<iframe[\s\S]*?<\/iframe>/g, "")
  .replace(/<tr>([\s\S]*?)<\/tr>/g, (_, r) => "| " + [...r.matchAll(/<t[hd]>([\s\S]*?)<\/t[hd]>/g)].map(m => m[1]).join(" | ") + " |\n")
  .replace(/<\/thead>/g, "| --- | --- | --- |\n")
  .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, "\n# $1\n").replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, "\n## $1\n").replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, "\n### $1\n")
  .replace(/<summary>([\s\S]*?)<\/summary>/g, "\n### $1\n")
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, h, t) => `[${t}](${h.startsWith("/") ? abs(h) : h})`)
  .replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, "**$2**")
  .replace(/<li>/g, "\n- ").replace(/<br>/g, "  \n").replace(/<\/(p|div|section|ul|ol|table)>/g, "\n\n")
  .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
  .replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/\|\n\n+\|/g, "|\n|").replace(/\n{3,}/g, "\n\n").trim();

rmSync(OUT, { recursive: true, force: true });
const write = (p, s) => { const f = join(OUT, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };

// ---------- Structured data ----------
const ORG_ID = abs("/#organization");
const LOGO = { "@type": "ImageObject", url: abs("/icon-512.png"), width: 512, height: 512 };

const organization = {
  "@type": "Organization", "@id": ORG_ID, name: "Another Nine", url: site.brandUrl, logo: LOGO, sameAs: site.social,
};

const services = [
  ["Private golf simulator suite rental", "Hourly rental of a fully private Trackman iO golf simulator suite for up to 5 people, billed per suite.", "/pricing/"],
  ["Golf simulator parties & private events", "Birthdays, bachelor and bachelorette parties, date nights and corporate team building in private BYOB suites.", "/private-events/"],
  ["Indoor golf leagues", "Trackman-scored indoor golf league play, open 24/7.", "/leagues/"],
  ["Trackman golf practice", "Practice with Trackman ball and club data, driving ranges and practice scenarios.", "/trackman-golf-simulator/"],
  ["Corporate golf events & team building", "Private simulator suites for team building, client entertainment and offsites.", "/corporate-events/"],
  ["Golf simulator gift cards", "Gift cards redeemable for private suite time.", "/gift-cards/"],
];

const business = {
  "@type": ["SportsActivityLocation", "EntertainmentBusiness"],
  "@id": BIZ_ID,
  name: site.name,
  alternateName: ["Another Nine Indoor Golf Austin", "Another Nine Golf Simulator Austin"],
  description: `Private, 24/7 indoor golf simulator suites powered by ${site.facts.launchMonitor} with ${site.facts.courses} courses. BYOB, up to ${site.facts.suiteCapacity} guests per suite, no membership required. Serving Austin, TX.`,
  url: abs("/"),
  image: [abs("/og-image.png")],
  logo: LOGO,
  slogan: site.tagline,
  currenciesAccepted: "USD",
  ...(site.priceFrom ? { priceRange: `From ${site.priceFrom}/hr per suite` } : {}),
  publicAccess: true,
  address: { "@type": "PostalAddress", ...(A.street ? { streetAddress: A.street, postalCode: A.postal } : {}), addressLocality: A.city, addressRegion: A.region, addressCountry: A.country },
  ...(site.geo.lat ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
  ...(site.phone ? { telephone: site.phone } : {}),
  ...(site.email ? { email: site.email } : {}),
  ...(A.street ? { hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}` } : {}),
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00", closes: "23:59",
  }],
  areaServed: site.areaServed.map(c => ({ "@type": "City", name: `${c}, TX` })),
  amenityFeature: [
    "Private golf simulator suites", "Trackman iO launch monitor", "BYOB", "Mini-fridge in every suite",
    "TV with sports package", "Open 24/7", "Club rentals",
  ].map(name => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  maximumAttendeeCapacity: site.facts.suiteCapacity,
  potentialAction: { "@type": "ReserveAction", target: site.bookingUrl, name: "Book a golf simulator suite" },
  parentOrganization: { "@id": ORG_ID },
  hasOfferCatalog: {
    "@type": "OfferCatalog", name: "Indoor golf services",
    itemListElement: services.map(([name, description, path]) => ({
      "@type": "Offer", url: abs(path), availability: "https://schema.org/InStock",
      itemOffered: { "@type": "Service", name, description, provider: { "@id": BIZ_ID }, areaServed: { "@type": "City", name: "Austin, TX" } },
    })),
  },
  sameAs: [site.bookingUrl, ...(site.googleBusinessProfileUrl ? [site.googleBusinessProfileUrl] : [])],
  knowsAbout: ["Golf simulators", "Indoor golf", "Trackman", "Golf practice", "Golf leagues"],
};

const website = {
  "@type": "WebSite", "@id": abs("/#website"),
  url: abs("/"), name: site.name, alternateName: new URL(site.url).hostname, publisher: { "@id": BIZ_ID }, inLanguage: "en-US",
};

const webPage = pg => ({
  "@type": (pg.faq || pg.qa) ? ["WebPage", "FAQPage"] : pg.path === "/location/" ? ["WebPage", "ContactPage"] : "WebPage",
  "@id": abs(pg.path) + "#webpage", url: abs(pg.path), name: pg.title, description: pg.description, inLanguage: "en-US",
  isPartOf: { "@id": abs("/#website") }, about: { "@id": BIZ_ID },
  primaryImageOfPage: { "@type": "ImageObject", url: abs("/og-image.png"), width: 1200, height: 630 },
  dateModified: today,
  ...(pg.crumbs.length ? { breadcrumb: { "@id": abs(pg.path) + "#breadcrumb" } } : {}),
  ...((pg.faq || pg.qa) ? { mainEntity: (pg.faq ? faqs : pg.qa).map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } : {}),
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".lede"] },
});

const crumbsLd = (crumbs, path) => crumbs.length && ({
  "@type": "BreadcrumbList", "@id": abs(path) + "#breadcrumb",
  itemListElement: [["Home", "/"], ...crumbs].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })),
});

const articleLd = pg => ({ "@type": "Article", "@id": abs(pg.path) + "#article", isPartOf: { "@id": abs(pg.path) + "#webpage" },
  headline: pg.h1, description: pg.description, datePublished: pg.article.published, dateModified: today,
  author: { "@id": BIZ_ID }, publisher: { "@id": BIZ_ID }, mainEntityOfPage: abs(pg.path), image: abs("/og-image.png") });

// ---------- Layout ----------
const nav = [["/pricing/", "Pricing"], ["/trackman-golf-simulator/", "Trackman"], ["/private-events/", "Parties"],
  ["/corporate-events/", "Corporate"], ["/leagues/", "Leagues"], ["/gift-cards/", "Gift Cards"], ["/faq/", "FAQ"]];

const navLinks = pg => nav.map(([h, l]) => `<a href="${h}"${h === pg.path ? ' aria-current="page"' : ""}>${l}</a>`).join("")
  + `<a class="btn sm" href="${utm(site.bookingUrl, "nav")}" rel="noopener">Book</a>`;

const layout = pg => {
  const graph = [organization, website, business, webPage(pg), crumbsLd(pg.crumbs, pg.path), pg.article ? articleLd(pg) : null].filter(Boolean);
  const md = pg.path === "/" ? "/index.md" : `${pg.path}index.md`;
  const crumbHtml = pg.crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${pg.crumbs.map(([n, p], i) => i === pg.crumbs.length - 1 ? ` / <span aria-current="page">${n}</span>` : ` / <a href="${p}">${n}</a>`).join("")}</nav>` : "";
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pg.title}</title>
<meta name="description" content="${pg.description}">
<link rel="canonical" href="${abs(pg.path)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="geo.region" content="US-TX">
<meta name="geo.placename" content="${A.city}, Texas">
${site.geo.lat ? `<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}"><meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">` : ""}
<meta property="og:type" content="${pg.article ? "article" : "website"}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${pg.title}">
<meta property="og:description" content="${pg.description}">
<meta property="og:url" content="${abs(pg.path)}">
<meta property="og:image" content="${abs("/og-image.png")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${site.name}: private 24/7 Trackman golf simulator suites in Austin, TX">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@playanothernine">
<meta name="twitter:title" content="${pg.title}">
<meta name="twitter:description" content="${pg.description}">
<meta name="twitter:image" content="${abs("/og-image.png")}">
<meta name="theme-color" content="#06110c">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="${site.shortName}">
<meta name="application-name" content="${site.name}">
<link rel="manifest" href="/site.webmanifest">
${pg.md !== false ? `<link rel="alternate" type="text/markdown" href="${md}" title="Markdown version">` : ""}
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.classList.add("js")</script>
<script src="/app.js" defer></script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body${pg.home ? ' class="home"' : ""}>
<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <div class="wrap bar">
    <a class="logo" href="/" aria-label="${site.name} home"><span class="dot"></span>Another&nbsp;Nine <em>Austin</em></a>
    <nav class="desk" aria-label="Main">${navLinks(pg)}</nav>
    <details class="menu"><summary aria-label="Menu">Menu</summary>
      <nav aria-label="Main mobile">${navLinks(pg)}</nav>
    </details>
  </div>
</header>
<main id="main" class="wrap">
${pg.home ? pg.body : `<div class="page">${crumbHtml}
${pg.body}</div>`}
</main>
<div class="mobile-cta"><a class="btn" href="${utm(site.bookingUrl, "sticky")}" rel="noopener">${site.opening.preOpening ? "Get early access" : "Book a suite"}</a></div>
<footer class="site">
  <div class="wrap fgrid">
    <div>
      <p class="logo"><span class="dot"></span>Another Nine Austin</p>
      <p>${site.name}<br>
      ${fullAddr}<br>
      ${site.phone ? `<a href="tel:${site.phone}">${site.phone}</a><br>` : ""}
      Open ${site.hours}</p>
    </div>
    <nav aria-label="Areas served"><p><strong>Indoor golf in</strong></p>
      <a href="/indoor-golf-downtown-austin/">Downtown Austin</a><a href="/indoor-golf-north-austin/">North Austin</a><a href="/indoor-golf-south-austin/">South Austin</a><a href="/indoor-golf-east-austin/">East Austin</a><a href="/indoor-golf-west-lake-hills/">Westlake</a></nav>
    <nav aria-label="Explore"><p><strong>Explore</strong></p>
      <a href="/pricing/">Pricing</a><a href="/trackman-golf-simulator/">Trackman simulator</a><a href="/private-events/">Parties</a><a href="/corporate-events/">Corporate events</a><a href="/leagues/">Leagues</a><a href="/gift-cards/">Gift cards</a></nav>
    <nav aria-label="More"><p><strong>More</strong></p>
      <a href="/location/">Location</a><a href="/guides/">Guides</a><a href="/faq/">FAQ</a><a href="${utm(site.contactUrl, "footer")}" rel="noopener">Contact</a><a href="${site.brandUrl}" rel="noopener">AnotherNine.com</a></nav>
  </div>
  <p class="wrap small">© ${new Date().getFullYear()} Another Nine Austin. Trackman is a trademark of its owner.</p>
</footer>
</body>
</html>`;
};

for (const pg of pages) write(pg.path === "/" ? "index.html" : `${pg.path.slice(1)}index.html`, layout(pg));

write("404.html", layout({ path: "/404", md: false, title: "Page not found | Another Nine Austin", description: "That page couldn't be found.", crumbs: [],
  body: `<h1>That one went in the water.</h1><p>We couldn't find that page. <a href="/">Go home</a> or <a href="${utm(site.bookingUrl, "404")}">book a suite</a>.</p>` })
  .replace('content="index, follow, max-image-preview:large, max-snippet:-1"', 'content="noindex"'));

// ---------- robots.txt (explicitly welcomes search + AI answer engines) ----------
write("robots.txt", `# ${site.name}
User-agent: *
Allow: /
Disallow: /404.html
# Markdown twins are for AI readers; keep them out of the search index (GitHub Pages can't send X-Robots-Tag)
Disallow: /*.md$

# AI search & answer engines — allowed so we can be cited for "golf simulator near Austin"
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Applebot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: DuckAssistBot
Allow: /
User-agent: MistralAI-User
Allow: /
User-agent: Bingbot
Allow: /
Disallow: /404.html
Disallow: /*.md$

Sitemap: ${abs("/sitemap.xml")}
`);

// ---------- sitemap.xml ----------
const prio = p => p === "/" ? "1.0" : p.startsWith("/guides/") ? "0.6" : "0.8";
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod><priority>${prio(p.path)}</priority></url>`).join("\n")}
</urlset>
`);

// ---------- llms.txt (llmstxt.org format) + llms-full.txt ----------
const keyFacts = `- Name: ${site.name} (part of Another Nine, ${site.brandUrl})
- Address: ${fullAddr}
- Hours: ${site.hours} (self-service access code sent by text/email after booking)
- What: Private, fully enclosed indoor golf simulator suites
- Tech: ${site.facts.launchMonitor} launch monitor, ${site.facts.software}, ${site.facts.courses} courses, ranges, practice scenarios, mini games
- Capacity: up to ${site.facts.suiteCapacity} people per suite
- Pricing: per suite, per hour (not per person); no membership required; live rates at ${site.bookingUrl}
- Amenities: BYOB, mini-fridge, smart TV with sports package, sound, seating, club rentals
- Cancellation: full refund >12 hours ahead; store credit within 12 hours
- Serves: ${site.areaServed.join(", ")}
${site.phone ? `- Phone: ${site.phone}\n` : ""}${site.opening.preOpening ? `- Status: ${site.opening.label}; founding-member pricing for early sign-ups\n` : ""}- Booking: ${site.bookingUrl}`;

write("llms.txt", `# ${site.name}

> ${site.name} is a 24/7 private indoor golf simulator facility in ${fullAddr}. Each suite has a ${site.facts.launchMonitor} with ${site.facts.courses} courses, seats up to ${site.facts.suiteCapacity}, and is BYOB. No membership required.

## Key facts
${keyFacts}

## Pages
${pages.map(p => `- [${p.h1}](${abs(p.path === "/" ? "/index.md" : p.path + "index.md")}): ${p.description}`).join("\n")}

## Optional
- [Full content for LLMs](${abs("/llms-full.txt")})
- [Book a suite](${site.bookingUrl})
`);

write("llms-full.txt", `# ${site.name} — full site content

## Key facts
${keyFacts}

## FAQ
${faqs.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}

${pages.filter(p => !p.faq).map(p => `---\n\nURL: ${abs(p.path)}\n\n${toMd(p.body)}`).join("\n\n")}
`);

// ---------- Markdown twin of every page (llmstxt.org convention: same URL + .md) ----------
const mdPath = p => p.path === "/" ? "index.md" : `${p.path.slice(1)}index.md`;
for (const p of pages) write(mdPath(p), `---\ntitle: ${JSON.stringify(p.title)}\ndescription: ${JSON.stringify(p.description)}\ncanonical: ${abs(p.path)}\n---\n\n${toMd(p.body)}\n`);

// ---------- Static assets ----------
write("site.webmanifest", JSON.stringify({ name: site.name, short_name: site.shortName, description: site.tagline, id: "/", start_url: "/", scope: "/",
  display: "standalone", lang: "en-US", categories: ["sports", "entertainment"], background_color: "#f6f4ee", theme_color: "#0f3d2e",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
  ] }, null, 2));
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f3d2e"/><circle cx="32" cy="34" r="16" fill="#f6f4ee"/><circle cx="26" cy="29" r="2" fill="#c9d8cf"/><circle cx="34" cy="27" r="2" fill="#c9d8cf"/><circle cx="38" cy="35" r="2" fill="#c9d8cf"/><circle cx="29" cy="38" r="2" fill="#c9d8cf"/><text x="32" y="16" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#e9c46a" text-anchor="middle">A9</text></svg>`);
write("og-image.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0f3d2e"/><path d="M0 470 Q300 400 600 460 T1200 430 V630 H0Z" fill="#1d5c45"/><circle cx="960" cy="200" r="90" fill="#f6f4ee"/><text x="80" y="230" font-family="Georgia,serif" font-size="78" font-weight="700" fill="#f6f4ee">Another Nine</text><text x="80" y="310" font-family="Georgia,serif" font-size="46" fill="#e9c46a">Austin, Texas</text><text x="80" y="390" font-family="Arial,sans-serif" font-size="32" fill="#c9d8cf">Private 24/7 Trackman golf simulator suites · BYOB</text></svg>`);
write("styles.css", readFileSync("styles.css", "utf8"));
write("app.js", readFileSync("app.js", "utf8"));
// Everything in ./static ships as-is (icons from tools/make-icons.ps1, og-image.png).
for (const f of existsSync("static") ? readdirSync("static") : []) writeFileSync(join(OUT, f), readFileSync(join("static", f)));

// favicon.ico = PNG-in-ICO container built from the 16/32/48 PNGs
const icoPngs = ["favicon-16.png", "favicon-32x32.png", "favicon-48.png"].map(f => join("static", f)).filter(existsSync).map(f => readFileSync(f));
if (icoPngs.length) {
  const head = Buffer.alloc(6 + 16 * icoPngs.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(icoPngs.length, 4);
  let offset = head.length;
  icoPngs.forEach((png, i) => {
    const w = png.readUInt32BE(16), e = 6 + 16 * i;
    head.writeUInt8(w >= 256 ? 0 : w, e); head.writeUInt8(w >= 256 ? 0 : w, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(png.length, e + 8); head.writeUInt32LE(offset, e + 12); offset += png.length;
  });
  writeFileSync(join(OUT, "favicon.ico"), Buffer.concat([head, ...icoPngs]));
}

// IndexNow (Bing, Yandex, Seznam, Naver): key file proves ownership; `node tools/indexnow.mjs` pings after deploys.
if (site.indexNowKey) write(`${site.indexNowKey}.txt`, site.indexNowKey);

// security.txt (RFC 9116) — trust signal, expires yearly so rebuilds keep it fresh
const nextYear = new Date(Date.now() + 365 * 864e5).toISOString();
write(".well-known/security.txt", `Contact: ${site.email ? `mailto:${site.email}` : site.contactUrl}\nExpires: ${nextYear}\nPreferred-Languages: en\nCanonical: ${abs("/.well-known/security.txt")}\n`);

// humans.txt
write("humans.txt", `/* TEAM */\n${site.name}\nSite: ${site.url}\nBooking: ${site.bookingUrl}\n\n/* SITE */\nLast update: ${today}\nStandards: HTML5, CSS3, schema.org\n`);

// _headers (Netlify & Cloudflare Pages): security, caching, and keep .md/.txt twins out of Google's index
write("_headers", `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/styles.css
  Cache-Control: public, max-age=604800
/app.js
  Cache-Control: public, max-age=604800
/*.png
  Cache-Control: public, max-age=2592000
/favicon.ico
  Cache-Control: public, max-age=2592000

/llms.txt
  Content-Type: text/plain; charset=utf-8
  X-Robots-Tag: noindex
/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  X-Robots-Tag: noindex
${pages.map(p => `/${mdPath(p)}\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex\n  Link: <${abs(p.path)}>; rel="canonical"`).join("\n")}
`);

// _redirects (Netlify): one canonical host. Cloudflare Pages: set these as Bulk/Page Redirects instead.
const host = new URL(site.url).hostname;
write("_redirects", [`https://www.${host}/* ${site.url}/:splat 301!`,
  ...site.altDomains.flatMap(d => [`https://${d}/* ${site.url}/:splat 301!`, `https://www.${d}/* ${site.url}/:splat 301!`])].join("\n") + "\n");

// GitHub Pages: custom domain + serve dot-folders (.well-known) as-is
write("CNAME", `${host}
`);
write(".nojekyll", "");

console.log(`Built ${pages.length} pages (+ .md twins), robots.txt, sitemap.xml, llms.txt, llms-full.txt, icons, _headers, _redirects → ${OUT}/ (${site.url})`);
