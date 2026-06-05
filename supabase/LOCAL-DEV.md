# Supabase local (Docker) — FitTrack

Prueba el dashboard **sin tocar la nube**. Todo queda en tu Mac.

## Requisitos

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — instalar y abrir (whale icon en la barra).
2. **Supabase CLI** — ya instalado en el repo; si falta:

   ```bash
   brew install supabase/tap/supabase
   ```

## Primera vez (5 min)

```bash
cd fitness-app-ui

# 1. Levantar Postgres + Auth + Studio (descarga imágenes la primera vez)
pnpm supabase:start

# 2. Ver URL y anon key
pnpm supabase:status
```

Copia la **anon key** (JWT, no la “Publishable”) y crea `.env.local` en la raíz:

```bash
pnpm supabase:status -o env | grep ANON_KEY
```

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY del comando anterior>
```

La clave **Publishable** (`sb_publishable_…`) del resumen visual **no** es la que usa Next.js; usa `ANON_KEY`.

Plantilla: `supabase/env.local.example`  
Backup cloud: guarda tu `.env.local` anterior en `.env.cloud.local` (gitignored).

```bash
# 3. Aplicar schema (migración inicial)
pnpm supabase:reset

# 4. App
pnpm dev
```

Abre http://localhost:3000 → **Sign up** con un email de prueba (ej. `test@local.dev` / contraseña cualquiera).  
Auth local **no envía emails reales**; el login funciona directo.

### URLs útiles (local)

| Servicio | URL |
|----------|-----|
| App | http://localhost:3000 |
| Supabase Studio (SQL, tablas) | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |

## Día a día

```bash
pnpm supabase:start   # si Docker estaba apagado
pnpm dev
```

```bash
pnpm supabase:stop    # apagar contenedores
pnpm supabase:status  # keys + estado
```

## Borrar datos de prueba (local)

```bash
pnpm supabase:reset
```

Vuelve a crear tablas vacías + schema. Tendrás que registrarte otra vez en `/signup`.

Solo sesiones (sin borrar rutina): Studio → SQL → `reset-workout-sessions.sql`.

## Volver a Supabase cloud

En `.env.local`, pon la URL y anon key de tu proyecto en la nube y reinicia `pnpm dev`.

Puedes guardar credenciales cloud en otro archivo (ej. `.env.cloud.local`) y copiar cuando haga falta.

---

## Alternativa: segundo proyecto Free en la nube

Si no quieres Docker, crea `fittrack-dev` en supabase.com (gratis, 2º proyecto).  
Ver sección “Option A” abajo o [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq).

---

## Option A — Two cloud projects

1. `fittrack-dev` + `fittrack-prod` (ambos Free).
2. `schema.sql` en SQL Editor de cada uno.
3. `.env.local` → dev; Vercel → prod.

Reset en cloud: `reset-workout-sessions.sql` / `reset-user-data.sql`.

---

## Qué guarda el dashboard

| Tabla | Contenido |
|-------|-----------|
| `workout_set_logs` | Sets completados + repes |
| `workout_sessions` | Sesión del día (`in_progress` / `completed`) |
| `routines` … | Rutina importada |
