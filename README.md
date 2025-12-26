# STYLE GLAMOUR BEATS — Static deployment guide

This repository contains the static frontend for a small demo store (HTML/CSS/JS).

Important: the project includes an optional Node API in `server.js` (for storing users in `users.json`).
If you deploy the site as *static only* (GitHub Pages or Netlify), the Node API won't run on those platforms — the site will fall back to using localStorage for authentication and account persistence.

This README explains how to publish the site as a static site (GitHub Pages or Netlify) and how to test locally.

## 1) Quick local test
- Open a PowerShell terminal in the project folder and run:

```powershell
Set-Location -LiteralPath 'C:\project cá nhân\WEB CỬA HÀNG THỜI TRANG'
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/auth.html` in your browser. The site will use localStorage for auth.

## 2) Deploy to GitHub Pages (static)
There are two ways: via Settings (simple) or via Actions (recommended).

### Option A — Settings (simple)
1. Create a GitHub repository and push this project to it.
2. In Settings → Pages, set source to `main` branch and root `/`.
3. Wait ~1 minute — Pages will be live at `https://<username>.github.io/<repo>/`.

### Option B — Actions (recommended)
This repo includes a workflow at `.github/workflows/pages.yml` that deploys the contents of the `SGB_Shop` folder to GitHub Pages.

Steps:
- Push your code to the `main` branch.
- Ensure Actions are enabled for the repo (Settings → Actions).
- The workflow will build and deploy automatically, publishing at `https://<username>.github.io/<repo>/`.

Notes:
- Because this is static-only, `SERVER_ENABLED` in `auth.html` is set to `false`. The site will not call `/api/*` endpoints and will instead store user accounts in the visitor's browser localStorage.
- If you want server-backed auth later, deploy the Node server separately and set `SERVER_ENABLED = true`.
 - Pages runs under `https://` and a subpath (`/<repo>/`). All links in this project are relative, so they work under that path.

## 3) Deploy to Netlify (drag-and-drop)
1. Zip the project folder (or use the repo connection). Drag the zip onto Netlify's Sites panel (or connect your GitHub repo and configure the build to publish the root).
2. Netlify will give you a public URL. The site is static-only so the same `SERVER_ENABLED=false` behavior applies.

## 4) If you want the server API online later
- Deploy `server.js` (Node/Express) to a platform that supports Node (Render, Railway, Fly.io, Heroku, etc.). Upload `users.json` or use a proper database.
- After deploying the API, edit `auth.html` and set `const SERVER_ENABLED = true;` (or deploy a build step that toggles it). Then the client will attempt to use `/api/register` and `/api/login`.

## 4.1) AI Stylist (optional)
This project includes an AI style advisor at `style-advisor.html`.

Local usage (rule-based fallback):
- Start the local server: `npm start`
- Open `http://127.0.0.1:3000/style-advisor.html`
- The advisor will provide suggestions using a built-in rule engine.

Cloud AI (OpenAI) usage:
- Set environment variables before starting the server:

```powershell
Set-Location -LiteralPath "c:\project cá nhân\webfake\SGB_Shop"
$env:OPENAI_API_KEY = "<your-openai-key>"
# optional
$env:OPENAI_MODEL = "gpt-4o-mini"
npm start
```

- Now the advisor will call `/api/style-advisor` which proxies to OpenAI and returns stylist responses.
- If the key is not set or the API call fails, it will automatically fall back to local rule-based suggestions.

## 5) Notes & limitations
- localStorage auth is only suitable for demos. Passwords saved in localStorage are stored in plain text in this demo (unless you migrate to the server which hashes them). Do not use for production.
- If you need help creating a GitHub repo and pushing the code, or if you want me to create the repo and push it for you, tell me and I will prepare the git commands and files.

---
If you want, I can now:
- Initialize a git repo and create a `gh-pages` branch for you, or
- Provide step-by-step PowerShell commands to push to an existing GitHub repo, or
- Prepare Netlify instructions for connecting the repo.

Choose next action: `init-repo`, `push-to-github`, `netlify-guide`, or `done`.
