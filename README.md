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
firebase login          # once, if you haven't
firebase deploy --only firestore:rules,storage
```

Note it's `storage`, not `storage:rules`. The `:rules` suffix only exists for
Firestore, which has both rules and indexes; for Storage the CLI reads
`storage:<name>` as a named deploy target and errors with
"Could not find rules for the following storage targets: rules".

`.firebaserc` pins the project to `iamwesmiller-270ac`, so you don't need
`--project` on every command. If the CLI ever says "No currently active
project," that file is missing or you're in the wrong directory.

Storage rules allow public read on `images/` — that's what lets posters load
from a plain `?alt=media` URL with no expiring token.

### 5. Vercel

Import the repo, add the same env vars from `.env.example` under Settings →
Environment Variables, deploy. Point `blklgt.com` and `www.blklgt.com` at it.

### 6. Turn on email/password sign-in

Firebase console → Authentication → Sign-in method → enable **Email/Password**.

Then create an account for yourself and one for Andrew: Authentication →
Users → Add user. That's the login for `/admin` — nothing to do with your
Google login for the Firebase console itself, and unrelated to
`serviceAccount.json`, which is a machine credential the scripts use, not
something a person signs in with.

### 7. Seed tour dates and bios

```bash
npm run seed:content
```

Loads the current tour schedule and both founder bios so `/admin` opens with
real content instead of a blank slate. Safe to re-run — merges, won't
overwrite anything already edited in the console.

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

`films` covers more than the name suggests — it's the role for **/admin/films,
/admin/tour, and /admin/bios**. All three are company-site content that the
same person typically manages, so they share one flag rather than three. It
does not reach `/admin`'s sign-in itself — that only requires a Firebase Auth
account (step 6 above). The role decides what a signed-in person can *save*;
Firestore rules are what actually enforce that, not the admin UI. If someone
without a role opens `/admin/films` and hits Save, they'll see a clear inline
message rather than a silent failure or a confusing Firebase error.

## Admin console — /admin

Three sections:

- **Films** — the same `films/{slug}` collection both sites read. Add a
  poster by uploading a file directly in the form; it goes to Storage
  `images/` and the path is saved automatically. Order controls slate
  position; site checkboxes decide whether it shows on blklgt.com,
  iamwesmiller.com, or both.
- **Tour** — add/edit/remove stops. When the list is empty, the site doesn't
  show a blank section — it shows a designed fallback message, which is also
  editable here, at the bottom of the Tour screen. That fallback is what a
  reader sees during the gap between tours, so it's worth writing something
  better than a placeholder.
- **Bios** — two fixed people, Wes and Andrew. Short bio is the homepage
  card; full bio is what expands when someone clicks "Read full bio." They're
  independent fields, not a truncation of one long text, so the short version
  reads as its own sentence rather than cutting off mid-clause.

Everything in `/admin` uses the full Firestore SDK with live updates
(`onSnapshot`) rather than the `lite` client the public pages use — a save
shows up in the list immediately. That tradeoff (bigger bundle, a persistent
connection) only makes sense behind a login, which is why `lib/adminFirebase.ts`
is never imported outside `app/admin/**`.

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

### Contact form

`/contact` posts to `/api/contact`, which **always** saves the message to
Firestore `messages` first, then makes a best-effort attempt to also email it
via Resend. If `RESEND_API_KEY` isn't set, the message is still saved — you
just don't get the email nudge. Read submissions with `hasRole('insiders')`
in the admin console (not yet built — currently, export via the Admin SDK or
the Firebase console directly), same access level as the mailing list, since
both are "someone is trying to reach us" data usually reviewed by the same
person.

To turn emails on: sign up at resend.com, verify `blklgt.com` as a sending
domain, set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` (an address on the
verified domain) in your env. Until the domain is verified, Resend's sandbox
`from` address only delivers to the email on your own Resend account — fine
for testing, not for production.

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

## Troubleshooting

**Slate is empty.** Run `npm run check`. It loads `.env.local`, runs the exact
query the page runs, and prints which of the three things is wrong: env vars
missing, no documents, or documents whose `sites` array doesn't contain
`blacklight`.

If it reports 5 matches, the data is fine and you're looking at a cached
render — restart `npm run dev`, or redeploy on Vercel (new env vars are not
applied to an existing build).

Note that `getFilms` swallows errors by design so a database blip can't fail a
deploy. The tradeoff is that failures are quiet: the real message goes to the
server terminal as `[films] getFilms failed`, not to the browser console.

## Before launch

- [ ] Optimize `WildCards_27x40_social.jpg` — 1.44 MB is large for a poster.
      `next/image` resizes it on delivery, but the source is worth compressing.
- [ ] Replace `REPLACE_WITH_WES_UID` in `firestore.rules` with your real UID.
- [ ] Delete `serviceAccount.json` once the migration has run.
- [ ] Grant Andrew `--films` when he needs slate access.
- [ ] Enable Email/Password sign-in and create admin accounts (step 6).
- [ ] `npm run seed:content` so `/admin` opens with real tour dates and bios.
- [ ] Set up Resend and verify the blklgt.com sending domain for the contact
      form — without it, messages still save, they just won't email you.
- [ ] Andrew's Insider referral system — confirm whether it stays on Supabase
      or moves into Firestore; `/api/insider` currently issues its own
      `BLK-` codes independent of it.
- [ ] Real trailer URLs on the film documents.
- [ ] Replace `app/privacy/page.tsx` with reviewed legal copy.
- [ ] Decide whether Insider stays on Supabase or moves fully to Firebase.
