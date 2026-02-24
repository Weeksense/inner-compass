

## Fix: Vercel SPA Routing (404 on page reload)

### Problem
Vercel serves static files. When you visit `/admin` or reload `/dashboard`, the server looks for a file at that exact path. Since this is a Single Page App (all routing is handled by React Router in the browser), there's no actual file there -- so Vercel returns 404.

### Solution
Add a `vercel.json` configuration file to the project root that tells Vercel to redirect all requests to `index.html`, letting React Router handle the routing.

### Changes

**New file: `vercel.json`**
- Add a single rewrite rule: all routes (`/(.*)`) get served by `/index.html`
- This is the standard configuration for any SPA deployed on Vercel

### Technical Detail
```text
vercel.json
  rewrites: [{ source: "/(.*)", destination: "/index.html" }]
```

After this change, redeploy on Vercel and all routes (`/admin`, `/dashboard`, `/insights/123`, etc.) will work correctly on direct access and page reload.

