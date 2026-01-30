# C Code Validator

A single-page React app for describing C coding problems, writing solutions in a code editor, and validating the code with feedback and a score.

## Sections

1. **Task / Problem** – Text input for the coding problem description
2. **Your Solution** – Monaco-based C code editor
3. **Validation** – Score (0–100%) and main issues/feedback

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to GitHub Pages

### Option 1: GitHub Actions (recommended)

1. Push to a GitHub repo.
2. Go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will deploy on push to `main` or `master`.

### Option 2: Manual deploy with `gh-pages`

1. Update `base` in `vite.config.ts` to your repo name (e.g. `/my-repo/`).
2. Run:
   ```bash
   npm run deploy
   ```

## Validation

Validation is done client-side with heuristic checks (structure, includes, braces, etc.). For real compilation and test execution, replace the logic in `src/validation.ts` with an API call to your backend (e.g. Judge0, Piston, or a custom service).
