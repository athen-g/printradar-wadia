# PrintRadar — Wadia

A React frontend and Cloudflare Workers backend for anonymous, student-reported print shop crowds around MES Wadia College of Engineering, Pune. Swiss editorial typography meets an industrial brutalist campus map.

## Features

- Custom SVG map reconstructed from student reference screenshots, with selection, pan and zoom.
- CP interior, CP exterior, college exterior and nearby shops remain distinct.
- Search, area filtering, crowd levels, optional wait/people estimates, closed and printer-unavailable reports.
- Shared D1 database, 20-minute freshness, one latest observation per device, weighted crowd/service votes and confidence labels.
- Anonymous device ID, five-minute shop cooldown, hourly limits and input validation. No login or GPS requirement. Device identifiers are resettable; abuse protection is intentionally basic.
- Shop suggestions within 1 km saved privately for owner review, not auto-published.
- Real-history weighted k-nearest-neighbour wait prediction for 30 minutes ahead. Minimum 60 half-hour windows over seven days and chronological holdout MAE <=10 minutes. No fabricated live data. This is an initial model, not a validated campus study.

## Development

Requires Node >=22.13. Install with `npm run install:ci`, then `npm run build`. Apply the SQL file in `drizzle/` to local D1 using:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_aromatic_omega_sentinel.sql
```

Run `npm run dev` and open the printed local URL. Run `node --test tests/learning.test.mjs` and `npx tsc --noEmit`. With the preview running, `node tests/api-smoke.mjs` exercises the backend and writes clearly prefixed LOCAL test records. Do not point that script at production.

## Review suggestions

The owner can inspect the Sites D1 `suggestions` table using the database management connector. Verify names, entrances, duplicates, CP classification and current operation before editing `lib/shops.ts` and redeploying. This version does not expose an unauthenticated admin endpoint. Corrections can be submitted through the suggestion form.

## Map and shop accuracy

This is an illustrated reference map, not a surveyed navigation map. No route guidance or metre-accurate map scale is claimed. Student-provided red/blue marks inform location grouping. Anish, Hanuman and Comet CP listings support CP addresses, not precise interior entrances. Their interior placement is provisional. Unnamed exterior counters retain descriptive names. Additional Sudhir and Comet Bund Garden listings have approximate pins; Comet entries may require deduplication. Review all pins on site before promoting them as verified.

Public directory references are linked per shop in `lib/shops.ts`. Reporting mechanics were informed by https://ganpatipune.in/how-to-use ; the visual design and SVG map are original to this project. Existing Campus Courier files were read as references and remain unchanged.

## Data

Only a random browser device ID accompanies reports; no personal details or GPS are requested. Reports stop affecting the current state after 20 minutes. The prediction query uses at most 90 days of history. Historical rows are not automatically deleted in this initial release; establish a retention job before wider use if deletion is required. Suggestions are visible only to the database owner. Hosting infrastructure may process connection metadata.

## Deployment

`.openai/hosting.json` declares the Sites project and D1 binding. Sites provisions the hosted database and applies the Drizzle migration. Deployment uses the Sites source workflow. GitHub is the public source mirror; no credentials, local database or generated deployment archives belong in this repository.

## Verification

Seven deterministic aggregation/prediction tests, TypeScript checks, a production build, local HTTP integration tests, and desktop/mobile browser inspection. Test samples are fixtures only and never seed the hosted database.
