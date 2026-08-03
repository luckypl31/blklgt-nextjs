# blklgt.com

BLacklight's public site. Next.js 16 (App Router), Firebase, deployed on Vercel.

Film data is shared with **iamwesmiller.com** — both sites read the same
Firestore project, so adding a film in the admin console updates both.

---

## Deploy

```bash
npm install
cp .env.example .env.local     # then fill in NEXT_PUBLIC_FIREBASE_APP_ID
npm run dev
```

### 1. Register blklgt.com in Firebase

Firebase console → Project settings → Your apps → Add app → Web.
Copy the new `appId` into `NEXT_PUBLIC_FIREBASE_APP_ID`.

This appId identifies the client and **nothing else**. It is deliberately not
part of any Firestore path — that was the bug in the old setup, where data
lived under `artifacts/{appId}/...` and so was invisible to any second app.

### 2. Get a service account key

Firebase console → Project settings → **Service accounts** → Generate new
private key. Save the JSON as `serviceAccount.json` in the project root.

This is not your console login. It's a machine credential, and it bypasses
security rules — which is what makes the next two steps work without any
chicken-and-egg around permissions.

It grants **full access to the project**. It's in `.gitignore`; keep it out of
the repo and out of Vercel. Delete it when you're done — you can always
generate another.

### 3. Migrate the film data

```bash
npm run migrate
```

Moves `artifacts/{appId}/public/data/filmography` → `films/{slug}` and seeds
the five BLacklight titles. Safe to re-run. Leaves the old collection alone;
delete it manually once iamwesmiller.com is reading from the new path.

### 4. Deploy the rules

Put your UID in `firestore.rules` first — replace `REPLACE_WITH_WES_UID`.
Firebase console → Authentication → Users → the `User UID` column.

```bash
firebase deploy --only firestore:rules,storage:rules
```

Storage rules allow public read on `images/` — that's what lets posters load
from a plain `?alt=media` URL with no expiring token.

### 5. Vercel

Import the repo, add the same env vars from `.env.example` under Settings →
Environment Variables, deploy. Point `blklgt.com` and `www.blklgt.com` at it.

---

## Who can edit what

The two sites share a project but are **not** equally trusted with the same
data. Permission is per-collection and stored as data in `roles/{uid}`, so
adding someone is one document — not a rules edit and a redeploy.

| Role | Grants |
|---|---|
| `films` | Edit the shared slate. Shows on both sites. |
| `insiders` | Read and export the mailing list. |
| `personal` | iamwesmiller content: bio, quotes, log, scripts. |

```bash
npm run grant -- --email andrew@example.com --films
npm run grant -- --list
npm run grant -- --email andrew@example.com --revoke
```

Grant the narrowest thing that does the job. Someone updating the slate gets
`films` and nothing else — they can't read an unpublished log entry, a script
in development, or the Insider list. That separation is the entire reason the
roles are split rather than one global `isAdmin()`.

Your own UID is hardcoded in `firestore.rules` as the owner. It's the one
hardcoded value, and it exists so somebody can create the first role document
— otherwise nobody can grant anybody anything and you're locked out of your
own project.

The person needs to have signed into the admin console once before a role can
be attached; the script resolves their email to a UID through Auth.

---

## How it's put together

**Rendering.** Every page is server-rendered with ISR (`revalidate = 300`).
Admin edits appear within five minutes with no redeploy, and the slate and
every `/films/[slug]` page are in the HTML for crawlers — which matters,
because press, festival programmers and distributors find those pages through
search. There is no client-side `onSnapshot` anywhere; this is a marketing
site, not a dashboard.

**Firestore SDK.** Reads use `firebase/firestore/lite` — a plain REST client
with no websockets or grpc. It runs cleanly in Node and on the edge and is a
fraction of the bundle size of the full SDK.

**Reads never throw.** If Firestore is unreachable during a build, `getFilms`
logs and returns `[]`, and the page renders its empty state. A film company's
site should not fail to deploy because a database blipped mid-build.

**The beam.** `components/Blacklight.tsx` writes CSS custom properties on
`<html>` from a rAF loop. It never touches React state — putting the pointer
position in `useState` would re-render the page sixty times a second.

**Insider signup** posts to `/api/insider` rather than writing from the
browser, so referral codes are generated server-side and can't be forged, and
there's one place to add rate limiting when the tour drives traffic here.
Firestore rules make `insiders` create-only from the client, so the mailing
list can't be read back out of a public page.

---

## Content

| What | Where |
|---|---|
| Films | Firestore `films/{slug}` — admin console |
| Tour dates | `lib/site.ts` |
| Copy, stats, founder bios | `lib/site.ts` |
| Posters, stills | Firebase Storage `images/` |
| Founder photos | `public/people/` |

### Adding a film

One document in `films/`. The `sites` array decides where it shows:

```ts
sites: ['blacklight', 'iamwesmiller']  // both
sites: ['iamwesmiller']                // directing credit only
```

That's how *A Day to Die*, *River Runs Red*, *Atone* and *Hell on the Border*
stay on Wes's directing site without appearing on the company slate.

Store the Storage **path** in `poster`, not a full URL:

```ts
poster: 'images/WildCards_27x40_social.jpg'
```

Signed URLs carry a token that regenerates if a file is ever re-uploaded, and
every stored reference dies with it. `mediaUrl()` builds the link at render
time from the path.

---

## Before launch

- [ ] Optimize `WildCards_27x40_social.jpg` — 1.44 MB is large for a poster.
      `next/image` resizes it on delivery, but the source is worth compressing.
- [ ] Replace `REPLACE_WITH_WES_UID` in `firestore.rules` with your real UID.
- [ ] Delete `serviceAccount.json` once the migration has run.
- [ ] Grant Andrew `--films` when he needs slate access.
- [ ] Real trailer URLs on the film documents.
- [ ] Replace `app/privacy/page.tsx` with reviewed legal copy.
- [ ] Decide whether Insider stays on Supabase or moves fully to Firebase.
