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
CLAY_WEBHOOK_URL=
```

`CLAY_WEBHOOK_URL` is server-only (read in `lib/clay/push-to-clay.ts`, never exposed to the client). The "Push to Clay" toolbar action pushes the current Companies filter view and automatically skips companies already pushed.

---

### Scripts

```
dev      → start development server      npm run dev
build    → production build              npm run build
test     → run test suite                npm run test
lint     → run ESLint                    npm run lint
```
