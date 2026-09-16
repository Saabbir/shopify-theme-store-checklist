# Theme Store Checklist

Day-of-submission **toolkit** for Shopify Theme Store themes — companion to the [Shopify Theme Handbook](https://saabbir.github.io/shopify-theme-handbook/).

**Live site:** [https://saabbir.github.io/shopify-theme-store-checklist/](https://saabbir.github.io/shopify-theme-store-checklist/)

Built with [Astro](https://astro.build). Content lives in `src/data/`.

## Purpose

| This toolkit | The handbook |
|---|---|
| Score, tick, package, diagnose | Learn architecture, Liquid, AI workflow |
| Short and exportable | Deep and explanatory |

## Pages

| Route | Purpose |
|---|---|
| `/` | Today’s run hub |
| `/scorecard/` | Pass / Fail / N/A submission scorecard + markdown export |
| `/checklist/` | Interactive development / QA checklist + export |
| `/packaging/` | Pre-upload packaging gate |
| `/rejections/` | Rejection autopsy (diagnostic index) |

> Older bookmarks to `/` for the scorecard should use `/scorecard/` now.

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
