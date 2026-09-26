# Member ID card review

Run `supabase/member-id-card-verification.sql` once in the temple Supabase project.
It requires the existing walk-in, admin-edit, profile-details, and address migrations.

The admin member list shows the last successful card review time in Asia/Bangkok.
Admin and ordinary member accounts use the same rules. Staff must import a card
and confirm the cardholder, then save. Searching by ID, manual ID entry, and merely
uploading a photo do not mark a member verified. This is staff review of imported
card data, not verification with a government identity service.

The API checks the reviewed ID, name and birth date against the submitted profile.
The database saves profile changes and verification in one transaction, checks the
actor's admin role, and uses database time. Editing ID/name/birth date clears the
verification; unrelated changes retain it. Existing rows are not backfilled.
If the migration is missing, verified saves fail with an explicit migration message
and no profile changes. Ordinary manual editing continues to use the existing RPCs.

Validation: `node --test tests/card-verification.test.js`; production build.
The migration was also exercised with PostgreSQL via PGlite, including admin/member
records, registration, actor rejection, rollback, invalidation, and repeated migration.
