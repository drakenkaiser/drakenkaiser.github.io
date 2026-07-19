# Jofin F Archbald — Portfolio

Minimal, watercolor-themed portfolio site that renders itself from `data.js`,
which is generated automatically from a resume PDF. No frameworks, no build
step, $0 to run.

## How it works

```
Google Drive folder (your resume PDF)
        │  weekly, Mon 06:30 UTC — GitHub Actions (free)
        ▼
scripts/parse_resume.py  →  data.js + assets/resume.pdf
        ▼
GitHub Pages redeploys index.html (free hosting)
```

## One-time setup

1. **Create a public GitHub repo** (public = free Actions minutes + free Pages),
   e.g. `portfolio`, and push this folder:
   ```bash
   git init && git add -A && git commit -m "initial site"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/portfolio.git
   git push -u origin main
   ```
2. **Enable Pages**: repo → Settings → Pages → Source: *Deploy from a branch* →
   `main` / `/ (root)`. Site appears at
   `https://<YOUR_USERNAME>.github.io/portfolio/`.
3. **Create a Google Drive folder**, put your resume PDF in it, right-click →
   Share → *Anyone with the link* (Viewer). Copy the folder link.
4. **Store the link**: repo → Settings → Secrets and variables → Actions →
   *Variables* tab → New repository variable →
   name `DRIVE_FOLDER_URL`, value = the folder link.
5. (Optional) Save your portrait as `assets/portrait.png`. Without it, the site
   shows a monogram fallback.

## Updating your resume

Upload the new PDF to the Drive folder (replacing or alongside the old one —
the newest PDF wins). The site updates automatically every Monday, or
immediately via repo → Actions → *Weekly resume sync* → Run workflow.

**Keep the resume structure stable**: the parser keys off the section headings
`WORK EXPERIENCE`, `TECHNICAL SKILLS`, `EDUCATION`, `CERTIFICATIONS`,
`AWARDS & RECOGNITION`, `PROJECTS` and the current bullet/heading layout.
Edit content freely; if you restructure the document, update
`scripts/parse_resume.py` to match.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

To regenerate data locally: `python3 scripts/parse_resume.py <resume.pdf> data.js`
(requires `pip install pypdf`).
