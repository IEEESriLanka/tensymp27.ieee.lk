# Visitor counter: plan and open decisions

Status: **draft, not started.** Nothing in the site has been changed for this yet.

Goal: show visits per country publicly in the site footer, and give the organising
committee private pageview detail. Written as a plan for an outside contribution,
since the author has no access to the IEEE Sri Lanka Section's Cloudflare account.

This file lives in `_plans/` on purpose. The repo has no `.nojekyll`, so GitHub Pages
runs Jekyll over it, and Jekyll excludes underscore-prefixed directories from the
build. A markdown file at the repo root would have been published as a page on the
live site. Keep planning notes in here, and leave this file out of any pull request
to the publishing repo.

## The constraint that drives everything

The site is plain HTML on GitHub Pages: 30 content pages, no build step, no
`package.json`. GitHub Pages serves files and runs no server-side code, so **the site
can never see a visitor's country on its own**. Resolving an IP address to a country
has to happen somewhere that runs code per request, and every option is really just a
different answer to "where does that happen, and who gets to see the IP address".

Two facts about this repo make the work much smaller than it looks:

- All 30 pages already load a shared `script.js` (`../script.js` from subfolders) and
  all 30 already contain the same `.footer-bottom` block. **One edit to `script.js`
  reaches every page** — no need to touch 30 HTML files.
- Subpages use relative paths (`../style.css`), so any new asset must be referenced
  **absolutely** (`/flags/lk.svg`), which works because Pages serves from the domain root.

## Two systems, because no single free tool does both jobs

A public counter has to expose numbers to anyone; analytics dashboards are private by
design and have no per-country public API. Forcing one tool to do both is what makes
this awkward, so run two and keep each simple.

- **Public counter:** a Cloudflare Worker with a D1 database, plus a footer widget.
  It answers only "how many visits, from how many countries", publicly.
- **Private detail:** Cloudflare Web Analytics. One beacon script, cookieless, free,
  and it answers what a flag counter cannot — which call-for-papers pages get read,
  and where visitors arrived from.

They also cross-check each other. The public counter is inflatable and full of
crawlers; the dashboard is bot-filtered. If the widget says 4,000 visits and the
dashboard says 900, that is worth knowing before somebody quotes the wrong number in
a report to IEEE.

## Facts established while researching (verified, not assumed)

- `ieee.lk` runs on Cloudflare nameservers (`heather.ns.cloudflare.com`,
  `mark.ns.cloudflare.com`), so the section already has a Cloudflare account.
- `tensymp27.ieee.lk` is **DNS-only**: it resolves to `ieeesrilanka.github.io` and
  GitHub's Pages IPs (`185.199.108-111.153`), not Cloudflare's. Cloudflare never sees
  these requests, so a Worker route on `tensymp27.ieee.lk/api/*` would never fire.
  Use Workers **Custom Domains** on a subdomain such as `counter.tensymp27.ieee.lk`,
  which creates the DNS record and TLS certificate automatically and is free.
- **The live site publishes from `ieeesrilanka.github.io`, not from this repo.** The
  copy in this repo is not the copy the public sees. Shipping needs a section member.
- Cloudflare Web Analytics needs **no domain ownership verification**; for a
  non-proxied site you enter the hostname, take the token, and paste the beacon.
- Nothing here costs money and **Workers Free needs no credit card.** Free tiers:
  100,000 Worker requests/day; D1 at 100,000 rows written and 5 million read per day
  with 5 GB storage; Web Analytics free outright. Exceeding a limit returns errors
  rather than starting charges, and with no card on file there is no billing path.

## The single most important design decision: inert by default

A config block at the top of `script.js`, both values empty:

```js
// Visitor counter and analytics. Both features stay off while these are empty.
const SITE_CONFIG = {
  counterEndpoint: "", // e.g. "https://counter.tensymp27.ieee.lk"
  beaconToken: "",     // Cloudflare Web Analytics site token
};
```

While empty, the code makes **zero network requests and no visual change at all**.
This matters more than any other choice here:

- The pull request is reviewable as pure code with no infrastructure attached to it,
  so merging is risk-free.
- Nothing can leak visitor data anywhere, so it raises no privacy objection at review.
- Switching it on later means editing two strings — a task safe to hand to a
  non-technical committee member.
- If nobody ever acts, nothing is broken and nothing is embarrassing.

## Handing over the Worker: the deploy button

Cloudflare's **Deploy to Cloudflare button** does exactly what an outside contributor
needs. A click clones the repo into the clicker's own GitHub account, auto-provisions
the D1 database declared in `wrangler.toml`, configures CI/CD, and deploys to *their*
Cloudflare account. No credentials are shared in either direction, and the section
ends up owning both the code and the data.

```md
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=<repo URL>/tree/main/worker)
```

The source repo must be **public** and on github.com or gitlab.com. Keep the Worker
in this repo under `worker/` rather than a separate one: the button accepts a
subdirectory, and a volunteer committee is far likelier to act on a single PR than on
one that sends them elsewhere.

## Three handover paths

The code is identical in all three. They differ only in who owns the running Worker,
and therefore what happens to the widget in 2027. The tension is that the counter
needs an owner who will still be around, and the only permanent party is the one
without access.

### Path 1: PR only, with the deploy button (recommended)

Ship inert code plus `worker/README.md` with the button and a short runbook. Deploy
to a throwaway free account only long enough to screenshot a working footer, then
tear it down.

- **Needs from the author:** a free Cloudflare account for verification. Nothing permanent.
- **Needs from the section:** merge, click the button, paste the URL into `counterEndpoint`.
- **If nobody acts:** nothing happens. Inert code, unchanged site. This property is
  what makes it the default.
- **Catch:** the counter shows nothing until somebody with access acts, and volunteer
  committees are slow. It may never go live.

### Path 2: an account owned by the conference

Same PR, but ask the committee for an email address the conference controls, such as
`web@tensymp27.ieee.lk`, and create the Cloudflare account under that address. Deploy,
then hand over by handing back the inbox.

- **Needs from the author:** nothing permanent.
- **Needs from the section:** one email address, and continued control of that mailbox.
  Nothing technical. A much smaller ask than account access, and usually answerable by
  one person.
- **If nobody acts:** blocked on the email address, but Path 1 remains available with
  no code change.
- **Why it is attractive:** it resolves the ownership objection honestly instead of
  deferring it. The infrastructure belongs to the conference from day one and nothing
  is registered against a personal name.
- **Catch:** the author holds credentials to a conference asset for a while. Hand over
  promptly and in writing, and do not reuse a password.

### Path 3: a temporary bridge on a personal account

Deploy to the author's own free account, ship the PR with that `*.workers.dev`
endpoint filled in, clearly labelled temporary with a note on how to replace it.

- **Needs from the author:** keeping that account alive until somebody replaces it —
  an open-ended commitment.
- **Needs from the section:** nothing, which is both the appeal and the problem.
- **If nobody acts:** the site depends on a volunteer's personal account indefinitely.
  When it lapses the fail-silent design means the widget simply disappears, but the
  count resets to zero when redeployed elsewhere, so the history is lost.
- **Why it might still be right:** it is the only path where the counter is live
  immediately, and a working thing on the site persuades a committee far better than a
  description of one. Could be a deliberate two-week demo with an agreed migration date.
- **Catch, and it is the real one:** reviewers are right to be wary of a PR pointing an
  IEEE domain at a contributor's personal infrastructure. If taking this path, say so
  explicitly in the PR. Being upfront is the difference between a temporary bridge and
  a hidden dependency.

### How to choose

Default to Path 1; ask about the email for Path 2 in the same message as the PR; hold
Path 3 in reserve for when the committee likes the idea but stalls. Paths 1 and 2 are
the same work. Path 3 is Path 1 plus a deployment somebody must remember to retire.

## Web Analytics without domain access

Because no ownership verification is required, the beacon can be enabled from any
Cloudflare account. Be deliberate about why:

- **Good use:** enable it briefly to prove the beacon works and to show the committee
  a screenshot of the data they would get. That is a demonstration, and it persuades.
- **Bad use:** leaving the conference's analytics permanently in a personal dashboard
  the committee cannot see. That is the handover liability, relocated rather than solved.

The token is one line of config, so swapping to the section's own token later is
trivial. Worth mentioning in the pitch: beacon hostnames are validated by postfix
match on the apex, so a single `ieee.lk` token would cover every section subdomain.

## The code

### The Worker

`worker/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS hits (
  country TEXT PRIMARY KEY,
  count   INTEGER NOT NULL DEFAULT 0
);
```

`worker/src/index.js`, in outline:

```js
const ORIGIN = "https://tensymp27.ieee.lk";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": ORIGIN };

    if (url.pathname === "/hit" && request.method === "POST") {
      // Browsers honour CORS; curl does not. This raises the bar, it does not seal it.
      if (request.headers.get("Origin") !== ORIGIN) return new Response(null, { status: 403 });
      const country = request.cf?.country;
      if (country && country !== "XX" && country !== "T1") {
        await env.DB.prepare(
          `INSERT INTO hits (country, count) VALUES (?1, 1)
           ON CONFLICT(country) DO UPDATE SET count = count + 1`
        ).bind(country).run();
      }
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/stats") {
      const { results } = await env.DB.prepare(
        "SELECT country, count FROM hits ORDER BY count DESC"
      ).all();
      return Response.json(
        { total: results.reduce((n, r) => n + r.count, 0),
          countries: Object.fromEntries(results.map((r) => [r.country, r.count])) },
        { headers: { ...cors, "Cache-Control": "public, max-age=60, s-maxage=300" } }
      );
    }
    return new Response("Not found", { status: 404 });
  },
};
```

The country arrives already resolved in `request.cf.country`, so there is **no IP
lookup and no reason to store an IP at all** — the thing that makes a public counter
defensible on an IEEE domain. `XX` and `T1` are Cloudflare's codes for unknown and
Tor; neither has a flag and neither should appear as a mystery row in a public footer.

Use **D1 rather than KV**: KV's free tier allows only 1,000 writes a day, which a
call-for-papers deadline spike would exhaust.

### The footer widget, in `script.js` and `style.css`

- Bail out immediately when `SITE_CONFIG.counterEndpoint` is empty.
- Record a hit only when `sessionStorage` has no marker, so a reader who opens ten
  pages counts once. Wrap it in `try`/`catch`, since private-browsing modes throw on
  `sessionStorage`.
- Cache the `/stats` response per session too, so ten page views cost about two Worker
  requests rather than eleven.
- Render the top 12 countries plus "and N more", so the footer does not become a wall
  of 90 flags.
- **Fail silently on any error.** No widget is far better than a broken widget in a
  live IEEE footer, and it is also what makes a temporary deployment safe to lose.
- Country names come from `Intl.DisplayNames`, built into every current browser, so
  there is no name table to ship:

```js
new Intl.DisplayNames(["en"], { type: "region" }).of("LK"); // "Sri Lanka"
```

- Label it **"visits from N countries"**, never "people". These count sessions, not
  humans. The country spread is the honest signal; the absolute number is not, because
  a public site is crawled constantly and a public counter is inflatable with curl.
- Style against the palette already in `style.css`: footer gradient `#001a33` to
  `#003366`, text `#c4cfdb`, hairline `rgba(255, 255, 255, 0.15)`, `--primary: #00629B`.

### Flags as local files

Emoji flags are the obvious choice and the wrong one: **Windows ships no emoji flag
glyphs**, so Chrome on Windows renders `LK` as the letters "LK", and much of this
audience is on Windows. Vendor the SVG set (flag-icons, MIT) into `flags/` and
reference it absolutely as `/flags/lk.svg`.

### Privacy page

The site has no privacy policy today, while the footer links to IEEE Policies and a
Code of Conduct. Adding tracking without one is the real risk here, more than either
system itself. A short `privacy.html`, linked from the footer, saying: the counter
stores a two-letter country code and a number, with no IP addresses, no cookies and
no page paths; Web Analytics is cookieless but is a request to `cloudflareinsights.com`;
and any blocker stops both with no effect on the site.

## Verification before opening a PR

- Deploy the Worker to a throwaway free account, point `counterEndpoint` at the
  `*.workers.dev` URL, and confirm the path works end to end. Screenshot the footer for
  the PR: it proves the code works without asking anyone to trust the infrastructure.
- Test on `CFC/cfp.html`, not just `index.html` — that is where absolute flag paths
  would break.
- Navigate five pages and confirm the count rises by one, not five.
- Set `counterEndpoint` back to empty and confirm behaviour is unchanged: no requests
  in the network tab, no widget. That is the state the PR ships in, so it is the state
  that most needs testing.
- After 48 hours of real traffic, compare the Worker counts with the Web Analytics
  dashboard to size the bot inflation. Also check whether EU visitors appear, since
  Cloudflare's docs note that free-plan RUM excludes EU traffic; the Worker counts at
  the edge with no such exclusion, which is a second reason to run both.

## What to lead the PR with

State in the first line that the change is inert until two config strings are filled,
that no data goes anywhere until then, and that the Worker deploys into the section's
own account with one click. Then the runbook, then the screenshot. Reviewers reject
infrastructure they did not ask for; they merge code that does nothing until they
choose otherwise.

## Task list

- [ ] Add the inert `SITE_CONFIG` block to `script.js`
- [ ] Create `worker/` with `wrangler.toml` (declaring the D1 binding so the deploy
      button provisions it), `schema.sql` and `src/index.js`
- [ ] Write `worker/README.md` with the deploy button and runbook
- [ ] Vendor flag SVGs into `flags/`
- [ ] Extend `script.js` with per-session hit recording, stats caching and widget injection
- [ ] Style `.visitor-flags` in `style.css`, including mobile widths
- [ ] Add `privacy.html` and link it from the footer
- [ ] Deploy to a throwaway account, verify end to end, screenshot for the PR
- [ ] Decide the handover path; if Path 2, ask the committee for a conference email address
- [ ] Open the PR against the publishing repo, leading with the inert-by-default framing
