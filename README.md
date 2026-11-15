# InternCruise

A browser-only classroom prototype for finding internships and sharing experiences.

## Preview

Open `index.html`, or serve this folder with `python3 -m http.server 8782`.
The published demo is https://albertdivo.github.io/InternCruise/.

Demo accounts: `demo` (student), `chloe` (alumni), `provider` (Harbour Studio), `orbit` (Orbit Analytics). All use the public demonstration password `cruise`. Use fictional details only.

## Current handoff — 16 November 2026

Based on upstream commit `92098b9`; preserves the approved boat logo and existing UI.

- Pay is monthly throughout lists, details, comparisons, editing and filters. Old hourly demo data converts once using 176 hours/month. Filters range from HKD 0 to 100,000. Ratings distinguish 4–4.5 inclusive from strictly greater than 4.5. Filter panels fill the phone and slide from the left in 0.4 seconds, with reduced-motion support.
- Student Home uses four matching illustrated tiles: internships, community, Premium and reward advertisements. The official demonstration articles remain underneath. Internship, Posts and Forum search controls are sticky; Posts/Forum put larger Search/Clear buttons inside the input area.
- Student Me has Favorites, green statistics, a membership badge and Premium Features below View full profile. Premium Center has separate free-plan and member-feature views. Prices and final entitlements are undecided; switching membership is a local demo, without payment. Feature links reuse existing prototype tools, which remain accessible to free accounts.
- The 30-second advertisement promotes fictional third-party coffee brand Moss & Mug, using animated canvas/video with a Skip option for demonstration. Completion awards three local messaging trials. Premium hides trial banners and never consumes saved trials; switching back to free preserves the balance.
- Company accounts default to Manage and have four navigation items: Posts, Forum, Manage, Me. Manage contains only that company's roles, grouped into collapsible Open, Closed and Pending lists, plus Drafts when needed. Closed is red; Pending is orange-yellow. Search is sticky; filters omit Employer and AI presets. Management controls omit compare/wishlist.
- Company Me shows company identity, contact details under About the company, Settings/logout, one Inquiries entry and Published/Comments/Favorites/Liked tabs. Company accounts have no Premium or reward advertising pages.
- Companies can edit directly without requesting permission first. New/edited listings still require platform review. Pending or rejected edits preserve the published version. The presenter-only review simulator approves/rejects submissions; rejected drafts can be revised and resubmitted.

## Files

`app.js` contains the original application and listing review workflow. `enhancements.js` extends pages and interactions, including migrations. `style.css` contains base styling; `theme.css` contains the current UI styling. `assets/interncruise-boat.svg` is the approved shared logo. Load scripts/styles together using `index.html`.

## Checks

Run `node global-update-check.cjs`, `node student-layout-check.cjs`, `node provider-manage-check.cjs` and `node render-smoke-check.cjs`. Syntax checks: `node --check app.js` and `node --check enhancements.js`.

The checks cover pay migration/idempotence, rating boundaries, student and company page structure, ownership/review guards, rejection/resubmission/approval, account isolation and Premium trial handling. Browser inspection covered student Home/Me/free/member pages, recommendation filters, Posts/Forum search controls, company Manage/Me/filters and a 375px viewport. This is not an exhaustive real-device or cross-browser certification.

## Simulation limits

Data and conversations stay in the current browser. Authentication, document verification, resume extraction, recommendation rules, moderation, notifications, membership and rewards are demonstrations; there is no backend, real payment, real identity verification or communication with outside users. No live AI service is connected. Refreshing returns to the welcome page; choose the same account to resume saved activity. Reset demo clears local demo activity.
