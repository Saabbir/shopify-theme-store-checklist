# Theme Store Checklist

Interactive companion for Shopify Theme Store submission: a **submission scorecard** (Pass / Fail / N/A + markdown export) and a tickable development/QA checklist.

**Live site:** [https://saabbir.github.io/shopify-theme-store-checklist/](https://saabbir.github.io/shopify-theme-store-checklist/)

Built with [Astro](https://astro.build). Content lives in `src/data/`; UI chrome matches the original toolkit experience.

This is **not** the full engineering handbook. Standards, scaffolding, AI workflow, and publishing deep-dives live in:

- **Handbook site:** [https://saabbir.github.io/shopify-theme-handbook/](https://saabbir.github.io/shopify-theme-handbook/)
- **Handbook repo:** [Saabbir/shopify-theme-handbook](https://github.com/Saabbir/shopify-theme-handbook)

## Pages

| Page | Purpose |
|---|---|
| `/` | Interactive Theme Store submission scorecard + export |
| `/checklist/` | Interactive development / QA checklist |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:4321/shopify-theme-store-checklist/`.

```bash
npm run build
npm run preview
```

## Deploy

GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pushes to `main` build Astro and publish to `https://saabbir.github.io/shopify-theme-store-checklist/`.
