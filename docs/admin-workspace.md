# Admin workspace

## First account and approval

The connected project is `smartmoney-book` (`tikmonmvozelytbzerfq`). Register once at `/admin/sign-up` with **tafartechlabs@gmail.com** and a password you choose, then verify the Supabase confirmation email. Registration does not authorize publishing.

After confirming that this is the intended account, the project owner runs the following in Supabase SQL Editor:

```sql
update private.admin_account a
set approved_at = now()
from auth.users u
where a.singleton
  and a.user_id = u.id
  and lower(u.email) = 'tafartechlabs@gmail.com'
  and u.email_confirmed_at is not null
returning a.user_id, a.approved_at;
```

The command must return one row. No row means the account has not been registered or its email has not been verified. Then sign in at `/admin/login`. With no UI changes to introduce another approval screen, the project owner's SQL Editor access is the approval authority.

To revoke publishing access immediately:

```sql
update private.admin_account set approved_at = null where singleton;
```

`private.is_admin()` checks the live approval record and verified Auth user on every protected database/storage operation. User-editable metadata is used only for the displayed name. Approval does not depend on editable metadata or stale JWT role claims.

The single signup claim is permanent. Deleting the Auth user does not reopen registration. Recover the existing account through Supabase Auth rather than deleting and registering again. Keep Supabase email confirmation enabled and email delivery configured. Set the Auth Site URL to your production website and add any development/preview redirects in Supabase Auth URL Configuration before using those environments. The default email sender has rate limits; configure production SMTP in Auth settings for reliable delivery.

## Routes and data flow

- `/admin/login` or `/login`: Supabase email/password sign-in.
- `/admin/sign-up`: one permitted registration, pending owner approval.
- `/admin/dashboard`: live counts, visits, content management.
- `/admin/editor`: rich document editor; `?id=...` edits a saved document.
- `/admin/resources`: shared PDF library management.

`components/workspace-provider.tsx` loads live Supabase data on navigation, auth changes, window focus, and media-URL refresh. It clears cached private content on sign-out. The UI route gate is a convenience; Postgres RLS and Storage policies are the authorization boundary.

Posts use `public.posts`; PDF metadata uses `public.resources`; comments use `public.comments`. All exposed tables have RLS. Anonymous readers see published rows only. The sole approved, verified administrator has CRUD access, including drafts and hidden PDFs.

Both `images` and `resources` buckets are private. Saving uploads new images/PDFs to Storage, stores stable object paths, and resolves signed URLs for reading. Replacing a PDF removes its superseded object; deleting content also attempts file cleanup. A failed post/PDF metadata write removes newly uploaded files. Previously issued signed URLs remain valid until expiry (one hour). Changing a post to draft or hiding a resource prevents new public URLs from being issued.

Comments are public on published posts only. The submission RPC validates lengths and applies a 30-second browser-ID cooldown. This is basic abuse control; the browser identifier can be reset and is not a strong identity.

Dashboard analytics store browser/day/path visits in the private schema; only the approved admin can read aggregates. Metrics use Africa/Nairobi dates. A browser/post/path is counted once daily; multiple people/devices and blocked local storage affect the counts.

## PDF import

PDF.js converts files locally and appends text and supported embedded images to the current document. The original imported PDF is not uploaded unless added separately as a resource.

- Maximum 15 MB, first 20 pages.
- Up to six supported raster images per page.
- Unsupported encodings can fall back to page illustrations.
- Scanned PDFs become images; OCR is not implemented.
- Review reading order, tables, typography, and diagrams before publishing.

The PDF worker is copied from the installed package during installation/build and ignored by Git.
