# CariKos — Platform Perbandingan Kos

Platform untuk menemukan dan membandingkan kos di sekitar kampus di Indonesia.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema to connected database
- `pnpm --filter @workspace/db run generate` — generate SQL migration files
- `pnpm --filter @workspace/scripts run seed` — seed the database with 15 kos + reviews
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle ORM table definitions (users, kos, fasilitas, kos_fasilitas, reviews)
- `lib/db/src/schema/index.ts` — barrel export for all tables
- `scripts/src/seed.ts` — seed script (15 kos fiktif + fasilitas + reviews)
- `supabase_schema_seed.sql` — file SQL lengkap untuk dijalankan langsung di Supabase SQL Editor

## Database Schema

| Tabel | Keterangan |
|---|---|
| `users` | Role: pencari / pemilik / admin |
| `kos` | 15 kos di area UI, ITB, UGM, ITS, Unpad. Harga 500rb–2jt |
| `fasilitas` | 8 fasilitas: AC, Wifi, KM Dalam, Dapur, Laundry, Parkir, CCTV, Penjaga |
| `kos_fasilitas` | Many-to-many join table |
| `reviews` | Rating 1–5, komentar, foto, tanggal |

## Architecture decisions

- Enum `user_role` di level database untuk validasi ketat peran pengguna.
- `harga` disimpan sebagai `INTEGER` (satuan Rupiah) agar sorting dan filtering akurat.
- `lat`/`lng` sebagai `NUMERIC(10,7)` untuk presisi koordinat GPS 7 desimal.
- `tanggal` review menggunakan kolom `DATE` (bukan `TIMESTAMP`) karena hanya perlu hari kalender.
- Seed script TypeScript (via Drizzle) untuk type-safety; SQL file murni juga disertakan untuk Supabase.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Jalankan `push` sebelum `seed`. Seed akan gagal jika tabel belum ada.
- `supabase_schema_seed.sql` menggunakan urutan INSERT untuk menghitung FK secara relatif — jangan dijalankan sebagian.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
