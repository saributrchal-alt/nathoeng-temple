# Kathin 2569 drink system

Standalone Vite + React app intended for a separate Vercel project with project root set to `kathin/` and custom domain `kathin.nathoeng.com`. Keeping its API under this project root avoids adding another serverless function to the existing `watt.nathoeng.com` Vercel project.

## Deployment prerequisites

1. Run `supabase/kathin-drinks-2569.sql` in the temple Supabase SQL editor.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the same `SESSION_SECRET` as the member site in the new Vercel project.
3. Set `SESSION_COOKIE_DOMAIN=.nathoeng.com` on the existing member-site Vercel project and redeploy it. Set the same `SESSION_SECRET` on both projects. Members will need to sign in again after that change. This enables the signed, HttpOnly member session on the Kathin subdomain; it also makes that cookie available to other `*.nathoeng.com` subdomains, so review that trust boundary first.
4. Point the new Vercel project's root directory at `kathin/`, then attach `kathin.nathoeng.com`.

The app contains one serverless endpoint (`api/kathin-drinks.js`). It uses the existing signed member session and shared Supabase tables. Members can order their own drinks; assigned event staff can view names/queues, place assisted orders, grant rights, and update order status; only admins can manage staff, menu availability, and event state.
