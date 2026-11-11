# Germany Study Path

Personal master's application dashboard with browser-local progress, scholarship workspaces and an on-demand official-page checker.

## Run locally

Requires Node.js 22 or newer. No package dependencies.

```sh
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:8765. Export backups regularly; progress is stored in each browser, not synced between deployments.

## Vercel

Import this repository with the root directory unchanged. `vercel.json` sets the framework to Other, build to `npm run build`, and output to `public`. The build also retains the original Worker output for Sites.

The dashboard works without environment variables. To enable the source checker, add a long random `SOURCE_CHECK_TOKEN` in Vercel project environment settings, then redeploy. Enter that same key when the app asks during a source check. It is kept only in that tab's session storage. Never commit the key or put it in client-side build variables. The API refuses checking when the key is unset or incorrect. Rate limits are per running function instance, not a distributed quota.

Vercel hosting does not inherit the original Sites owner-only login. Enable Vercel Deployment Protection in the project settings if access to the dashboard should be restricted. The repository includes personal planning information.

Official-page checks read HTML/text on demand; they do not run while the app is closed or compare PDF/video contents.
