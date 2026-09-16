# Theme Store Checklist

Interactive companion for Shopify Theme Store submission: a one-page scan of the official requirements, plus a tickable development/QA checklist.

**Live site:** [https://saabbir.github.io/shopify-theme-store-checklist/](https://saabbir.github.io/shopify-theme-store-checklist/)

This is **not** the full engineering handbook. Standards, scaffolding, AI workflow, and publishing deep-dives live in:

- **Handbook site:** [https://saabbir.github.io/shopify-theme-handbook/](https://saabbir.github.io/shopify-theme-handbook/)
- **Handbook repo:** [Saabbir/shopify-theme-handbook](https://github.com/Saabbir/shopify-theme-handbook)

## Pages

| Page | Purpose |
|---|---|
| [`index.html`](index.html) | Theme Store submission requirements (22 rules) |
| [`checklist.html`](checklist.html) | Interactive QA checklist with progress |

## Local use

Open the HTML files in a browser, or serve the folder statically:

```bash
npx serve .
```

Deployed via GitHub Pages (static HTML, no build step). See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
