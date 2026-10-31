# Shipper

This project folder is prepared as a Vite + React 19 app.

## Populating files from the bundled source

The monolithic source bundle is kept in the repository root as `shipper-all-code.md`.

Run:

```bash
node scripts/extract_bundle.js
```

This script reads each `## path` section in the bundle and writes the corresponding file contents into the `shipper/` project tree.
