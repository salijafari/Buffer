# Buffer

The deployable web app lives in **`Main-page/`** (Vite + React).

## Deploy on Railway (Railpack)

Railpack only sees the directory you configure as the service root. By default it uses the **repository root**, which has no `package.json`, so detection fails.

1. Open your **Railway service** → **Settings**.
2. Under **Root Directory**, set: **`Main-page`** (no leading slash is fine; Railway accepts `Main-page` or `/Main-page`).
3. Save and **redeploy**.

The service will then find `package.json`, run `npm install` / `npm run build`, and should use `npm start` (serves `dist/` with `serve` on **`PORT`** from Railway).

Optional: set **Watch paths** to `Main-page/**` if you want deploys to ignore unrelated repo changes.

## Local development

```bash
cd Main-page
npm install
npm run dev
```
