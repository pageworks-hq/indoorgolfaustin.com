// After each deploy: `node tools/indexnow.mjs` — tells Bing (and other IndexNow engines) every URL changed.
// Only run once the site is live on the real domain; the engines fetch <key>.txt to verify ownership.
import { site } from "../site.config.mjs";
import { pages } from "../pages.mjs";

const host = new URL(site.url).hostname;
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key: site.indexNowKey,
    keyLocation: `${site.url}/${site.indexNowKey}.txt`,
    urlList: pages.map(p => site.url + p.path),
  }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} (${pages.length} URLs)`);
