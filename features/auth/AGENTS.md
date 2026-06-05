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

- Success → `redirect("/")` or `redirect("/login")` on logout
- `proxy.ts` + `lib/supabase/middleware.ts` guard private routes

## Related

- `docs/supabase/002-auth-nextjs-app-router.md`
- `app/login/page.tsx`, `app/signup/page.tsx`
