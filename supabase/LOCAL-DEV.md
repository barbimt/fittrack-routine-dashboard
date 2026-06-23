# Supabase local (Docker) — FitTrack

Prueba el dashboard **sin tocar la nube**. Todo queda en tu máquina.

## Requisitos

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — instalar y abrir.
2. **Supabase CLI** — si falta:

   ```bash
   brew install supabase/tap/supabase
   ```

3. **Node.js 20+** y **pnpm** — ver [README](../README.md#clone-and-run-locally).

## Primera vez (~5 min)

```bash
git clone https://github.com/barbimt/fittrack-routine-dashboard.git
cd fittrack-routine-dashboard
pnpm install

# 1. Levantar Postgres + Auth + Studio (descarga imágenes la primera vez)
pnpm supabase:start

# 2. Aplicar schema + migraciones
pnpm supabase:reset
```

Crea `.env.local` en la raíz (plantilla: `supabase/env.local.example`):

```bash
pnpm supabase:status -o env | grep ANON_KEY
```

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY del comando anterior>
```

Usa la clave **JWT `ANON_KEY`**, no la **Publishable** (`sb_publishable_…`) del resumen visual de `supabase status`.

Backup cloud: guarda credenciales en `.env.cloud.local` (gitignored) y copia a `.env.local` cuando haga falta.

```bash
# 3. App
pnpm dev
```

Abre http://localhost:3000:

1. **Sign up** (`/signup`) — cualquier email y contraseña (mín. 6 caracteres), ej. `test@local.dev` / `123456`.
2. Tras el registro vas a `/login` con el aviso **“Cuenta creada con éxito”** — inicia sesión con las mismas credenciales.
3. Importa una rutina en `/upload` o edita en `/editor` → entrena en `/`.

Auth local **no envía emails reales** (`enable_confirmations = false` en `config.toml`).

Cada usuario solo ve sus datos (RLS + trigger `handle_new_user` que crea el `profile` al registrarse).

### URLs útiles (local)

| Servicio | URL |
|----------|-----|
| App | http://localhost:3000 |
| Supabase Studio (SQL, tablas, usuarios) | http://127.0.0.1:54323 |
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

Tablas vacías + schema. Tendrás que registrarte otra vez en `/signup`.

Solo sesiones (sin borrar rutina): Studio → SQL → `reset-workout-sessions.sql`.

## Volver a Supabase cloud

En `.env.local`, pon la URL y anon key de tu proyecto en la nube y reinicia `pnpm dev`.

En Authentication → Providers → Email, desactiva **Confirm email** si quieres el mismo flujo que en local (signup sin correo de confirmación).

## Alternativa: proyecto Free en la nube (sin Docker)

Crea un proyecto en [supabase.com](https://supabase.com), ejecuta `schema.sql` en el SQL Editor, y pon URL + anon key en `.env.local`. Ver [README](../README.md#supabase-cloud-optional).

Reset en cloud: `reset-workout-sessions.sql` / `reset-user-data.sql`.

## Producción (Vercel)

La app en producción usa Supabase cloud y está desplegada en:

https://fittrack-routine-dashboard.vercel.app

En Supabase → Authentication → URL Configuration:

- **Site URL** = dominio de Vercel
- **Redirect URLs** = `https://<dominio>/auth/callback`

## Qué guarda el dashboard

| Tabla | Contenido |
|-------|-----------|
| `profiles` | Perfil 1:1 con `auth.users` (creado al registrarse) |
| `routines` … `routine_exercises` | Rutina activa (import o editor) |
| `workout_sessions` | Sesión del día (`in_progress` / `completed`) |
| `workout_set_logs` | Sets completados + repes |
