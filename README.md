# Another Nine Austin: local SEO site

`node build.mjs` builds the site into `dist/`. It's hosted on GitHub Pages: every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/`. `_headers` and `_redirects` are only used if you ever move to Netlify or Cloudflare Pages.

- `site.config.mjs`: domain, address, phone and business facts. This is the only file you edit to change NAP (name, address, phone) details.
- `pages.mjs`: page copy and FAQ.
- `styles.css`: design.

- `static/`: icons and share image, copied as-is. Regenerate the icons with `powershell -File tools/make-icons.ps1`.

## What the build outputs for SEO
- **Structured data:** One connected schema.org `@graph` per page: Organization, WebSite, the business (SportsActivityLocation), WebPage, BreadcrumbList, plus FAQPage and Article where relevant, and an OfferCatalog of services.
- **Crawling files:** `robots.txt` (lets Google, Bing and the AI search bots in), `sitemap.xml`, `llms.txt` and `llms-full.txt`, and an `index.md` Markdown copy of every page. The Markdown copies are marked noindex with a canonical link back to the HTML page.
- **Icons:** `favicon.ico`, `favicon.svg`, 32px PNG, Apple touch icon, 192 and 512 icons plus a maskable icon, and `site.webmanifest`.
- **Server files:** `_headers` (security, caching, noindex for the Markdown copies) and `_redirects` (www and the alternate domain redirect to the main domain). Both work on Netlify; on Cloudflare Pages, set up the domain redirects as Bulk Redirects.
- **IndexNow:** A key file that lets Bing index changes right away. After each deploy, run `node tools/indexnow.mjs`.
- **Other:** `.well-known/security.txt` and `humans.txt`.

## Before launch
1. Fill in `address.street`/`postal`, `bookingUrl`, `phone`, `geo` (the exact pin from Google Maps) and `googleBusinessProfileUrl` in `site.config.mjs`, then rebuild.
2. Once the address is set, optionally add a `drive` line to each neighborhood in `pages.mjs` (they show up automatically).
3. Add real suite photos. Image search is a significant traffic source for "golf simulator" queries.
4. Verify the domain in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.
5. Set the Google Business Profile website link to this domain. Category: "Indoor golf course"; secondary: "Golf driving range" and "Event venue".
6. Validate the schema at https://search.google.com/test/rich-results.
7. 301-redirect the other domain to this one (a Namecheap URL Redirect record), so you never run two copies of the site.

## Ongoing
- Ask for Google reviews that mention "golf simulator" and the guest's city. Reviews matter more than anything else on this list.
- Keep the NAP identical on Yelp, Apple Business Connect, Bing Places and the Greater Austin Chamber.
- Add one guide every month or two, answering questions customers actually ask.
- Once you're open, set `opening.preOpening: false`.
