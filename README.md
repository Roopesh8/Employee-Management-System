# Employee Management System

A lightweight, front-end employee roster app — manage staff records with **department**, **salary**, and live **search**. No backend or build step required; it runs entirely in the browser.

## Features

- **Add / edit / delete** employee records (name, department, salary)
- **Live search** by name or department
- **Filter by department** via dropdown
- **Sortable columns** (name, department, salary)
- **Summary stats**: headcount, department count, average salary, total payroll
- **Local persistence** — data is saved in the browser via `localStorage`, so it survives page reloads (per-browser, not shared)

## Files

```
.
├── index.html    # Page structure
├── styles.css    # Styling (light/dark theme aware)
├── script.js     # App logic (CRUD, search, filter, sort, persistence)
└── README.md
```

## Getting started

No install needed — it's plain HTML/CSS/JS.

1. Clone or download this repo
2. Open `index.html` in your browser

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Deploying with GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set the source branch (e.g. `main`) and root folder
4. Your app will be live at `https://<username>.github.io/<repo-name>/`

## Notes

- Data is stored only in the visiting browser's `localStorage` — it is **not** shared between devices or users, and there's no server-side database.
- The app ships with a few sample employees; clear or edit them as you like.

## License

Feel free to use and modify this project as you like.
