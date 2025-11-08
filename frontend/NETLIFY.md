# Deploying the frontend to Netlify

This project uses Vite + React and can be deployed to Netlify easily.

Netlify settings (recommended)
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `frontend` (if you're pointing Netlify at the repository root)

We include a `netlify.toml` in the repo which sets the base to `frontend` and publish to `frontend/dist`. Netlify will pick these settings automatically.

Important:
- We added `frontend/public/_redirects` with the contents:
  ```
  /* /index.html 200
  ```
  This ensures single-page-app routes return `index.html` so client-side routing works.

How to connect your repository to Netlify
1. In Netlify, click "Add new site" → "Import from Git".
2. Choose Git provider and authorize if needed.
3. Pick the `ysr-hameed/hypz` repository.
4. Netlify will detect `netlify.toml` and auto-fill build settings. If not, set them manually:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

Environment variables
- If your frontend needs runtime config (API base URL, feature flags), add them under Site settings → Build & deploy → Environment.

Preview deploys
- Netlify creates preview deploys for pull requests. The same `netlify.toml` will be used.

Manual build/test locally
```bash
cd frontend
npm ci
npm run build
# preview build locally
npm run preview
```

That's it — after connecting your repo, Netlify will build and publish your site automatically when you push to `main` or open PRs.
