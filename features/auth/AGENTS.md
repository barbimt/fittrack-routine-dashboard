# Auth feature

Supabase email/password auth via Server Actions.

## Files

| Path | Role |
|------|------|
| `actions/authActions.ts` | `login`, `signup`, `logout` |
| `components/LoginForm.tsx` | Client form → `login` |
| `components/SignupForm.tsx` | Client form → `signup` |
| `components/LogoutButton.tsx` | Sidebar sign-out |

## Flow

- `signup` → `signOut()` → `redirect("/login?registered=1")` (success notice on login page)
- `login` success → `redirect("/")`
- `logout` → `redirect("/login")`
- `proxy.ts` + `lib/supabase/middleware.ts` guard private routes

## Related

- `docs/supabase/002-auth-nextjs-app-router.md`
- `app/login/page.tsx`, `app/signup/page.tsx`
