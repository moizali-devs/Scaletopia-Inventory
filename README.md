# Scaletopia Inventory

Internal dashboard for browsing and filtering Scaletopia's companies and people database.

## Stack

- **Next.js** — App Router, Server Components, ISR
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility-first styling
- **Supabase** — PostgreSQL backend

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run test suite |
| `npm run lint` | Run ESLint |
