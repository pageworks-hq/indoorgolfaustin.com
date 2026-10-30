// Single source of truth for business facts (NAP = Name, Address, Phone).
// Keep these EXACTLY matching your Google Business Profile, Yelp, Apple Maps, etc.
// Change the domain here and rebuild — every canonical, sitemap and schema URL follows.

export const site = {
  url: "https://indoorgolfaustin.com", // or "https://austingolfsim.com"
  altDomains: ["austingolfsim.com"], // 301-redirected to url (see dist/_redirects)
  indexNowKey: "1602e2365334ec07e9ef86e6a34e920c", // IndexNow ownership key; dist/<key>.txt is generated
  name: "Another Nine Austin",
  shortName: "Another Nine",
  tagline: "Private 24/7 indoor golf simulator suites in Austin, TX",
  brandUrl: "https://anothernine.com",
  bookingUrl: "https://anothernine.com", // TODO: your Austin location's booking page once it's live
  giftCardUrl: "https://anothernine.com",
  contactUrl: "https://anothernine.com/pages/contact",

  address: {
    // TODO: fill in street + postal once public (exactly as on Google Business Profile).
    // While street is "", pages say "Austin, TX" and hide map/directions.
    street: "",
    city: "Austin",
    region: "TX",
    postal: "",
    country: "US",
  },
  // TODO: fill in once you have them. Leave "" to omit from schema/pages.
  phone: "",            // e.g. "+1-512-555-0123" — must match Google Business Profile
  email: "",
  geo: { lat: null, lng: null }, // copy exact pin coords from Google Maps
  googleBusinessProfileUrl: "", // your GBP "share" link once verified

  // Showing a starting price ("from $X/hr") is a big click-through lever — competitors show theirs.
  priceFrom: "", // e.g. "$45" — leave "" to hide
  // Real Google reviews only (copy text + first name + initial). Rendered on the home page when non-empty.
  reviews: [], // e.g. { name: "Jordan P.", text: "Best night out in Austin…", source: "Google" }
  hours: "24/7, 365 days a year",
  opening: { preOpening: true, label: "Coming soon to Austin" },

  facts: {
    suiteCapacity: 5,
    courses: "350+",
    launchMonitor: "Trackman iO",
    software: "Trackman Virtual Golf 3",
  },

  social: [
    "https://www.facebook.com/profile.php?id=100090301758051",
    "https://twitter.com/playanothernine",
    "https://www.tiktok.com/@anotherninehq",
    "https://www.linkedin.com/company/another-nine",
  ],

  // Cities we target with dedicated, genuinely-useful pages.
  areaServed: ["Austin", "West Lake Hills", "Rollingwood", "Sunset Valley", "Pflugerville"],
};

export const utm = (url, content = "site") =>
  `${url}${url.includes("?") ? "&" : "?"}utm_source=${new URL(site.url).hostname}&utm_medium=referral&utm_campaign=local_site&utm_content=${content}`;
