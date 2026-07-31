# Tempo Pass staging system

Portable Node + SQLite staging application for customer registration, RSVP, personal QR passes, owner reporting, and event-night validation. It is staging-ready and has not been deployed or connected to the live QR URL.

## Routes

- `/` customer flow: shared colour code → prize → 15-second registration → personal QR → RSVP → interests → reminders
- `/admin` one-time owner setup, then private dashboard
- `/validate` restricted staff check-in
- `/preview` deterministic visual approval package; no database writes

## Local run

Requires Node 22+.

```bash
npm ci
npm test
npm run build
TEMPO_DB_PATH=./data/tempo-pass.sqlite npm start
```

Open `http://localhost:3000/preview` first. Owner setup is at `/admin` and always uses username `tempo-owner`. Boss enters the existing Bitwarden password into the one-time setup form. The password is never stored directly: only a salted scrypt hash is written to SQLite.

Create the staff credential from the authenticated owner API before event night. The fixed validator username is `tempo-validator`; staff must not share the owner login.

## Deployment requirements

Use a private persistent Node host with HTTPS and a mounted volume. Configure:

- `TEMPO_DB_PATH=/persistent/tempo-pass/tempo-pass.sqlite`
- `PORT=3000` (or the host-provided port)
- `NODE_ENV=production` so cookies are Secure
- optional `TEMPO_TEST_NUMBER_HASHES` as comma-separated SHA-256 hashes; never store raw owner/test numbers in source

GitHub contains source only. Customer names, WhatsApp numbers, SQLite files, exports, environment files, and backups are gitignored and must never enter Git history. Static-only GitHub Pages cannot safely host this backend.

## Backup and restore

Stop writes briefly or use SQLite's online backup command from the mounted host:

```bash
mkdir -p /secure-backups/tempo-pass
sqlite3 "$TEMPO_DB_PATH" ".backup '/secure-backups/tempo-pass/tempo-pass-$(date +%F).sqlite'"
sqlite3 /secure-backups/tempo-pass/tempo-pass-YYYY-MM-DD.sqlite "PRAGMA integrity_check;"
```

Keep backups encrypted, access-restricted, and outside the public web tree. Test restore to a separate path before launch. Owner CSV export is operational reporting, not a database backup.

## Security and privacy notes

- SQLite is server-only and never exposed as a static asset.
- Each entrant has a random 256-bit bearer token; only its SHA-256 hash is stored.
- Registration is transactional. Shared colour codes may be reused by different entrants.
- Owner/validator passwords use salted scrypt; sessions are HttpOnly, SameSite=Strict, and Secure in production.
- State-changing authenticated APIs require CSRF tokens. Narrow in-memory rate limits, secure headers, role checks, input validation, audit logs, and schema migrations are included.
- Recovery requires entry reference + WhatsApp, gives generic failure responses, rate-limits attempts, and rotates the QR token.
- Validator responses expose minimum identity/status only. Original physical Tempo Pass confirmation is mandatory; duplicate scans report the original check-in.
- Required event/prize consent, optional marketing consent, and optional WhatsApp reminders remain separate.
- `Milhouse`/`Milhousen`-like registrations and configured number hashes are tests and excluded from real totals by default.

Before public launch, Boss must approve every visual page and separately approve publishing. Final privacy notice, retention/anonymisation date, hosting access policy, CAPTCHA/distributed throttling, reminder delivery provider, challenge/ranking, and POS/redemption integration remain deployment/operations decisions. No legal claim is implied by these placeholders.

## Verification

`npm test` covers shared-code duplicates, validation, test detection, one-time setup, hashed passwords, login/CSRF/authorization, QR token safety, RSVP, recovery and rotation, minimum-data validator lookup, physical-pass check-in, duplicate check-in, CSV authorization/safety, and calendar date integrity.
