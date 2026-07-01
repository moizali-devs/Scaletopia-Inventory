```
███████╗ ██████╗ █████╗ ██╗     ███████╗████████╗ ██████╗ ██████╗ ██╗ █████╗
██╔════╝██╔════╝██╔══██╗██║     ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔══██╗
███████╗██║     ███████║██║     █████╗     ██║   ██║   ██║██████╔╝██║███████║
╚════██║██║     ██╔══██║██║     ██╔══╝     ██║   ██║   ██║██╔═══╝ ██║██╔══██║
███████║╚██████╗██║  ██║███████╗███████╗   ██║   ╚██████╔╝██║     ██║██║  ██║
╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝
                                                              INVENTORY
```

> Internal dashboard for browsing, filtering, and exporting Scaletopia's companies and people database.

---

### Stack

| | |
|---|---|
| `Next.js` | App Router · Server Components · ISR |
| `TypeScript` | End-to-end type safety |
| `Tailwind CSS` | Utility-first styling |
| `Supabase` | PostgreSQL backend |

---

### Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

```env
# .env.local
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The "Push to Clay" toolbar action pushes the current Companies filter view to a Clay webhook. The webhook URL is entered in the UI at push time (remembered per-device) — it is not an environment variable. Every company in the current view is sent on each push (no skip-already-pushed); Clay dedupes on its side.

---

### Scripts

```
dev      → start development server      npm run dev
build    → production build              npm run build
test     → run test suite                npm run test
lint     → run ESLint                    npm run lint
```
