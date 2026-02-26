# Supabase Database Backup Instructions

While the Admin Dashboard provides an easy way to export the database to an Excel (`.xlsx`) file, you may sometimes need a raw SQL dump for migrating or completely restoring a database.

## Full Database Backup using `pg_dump`

If you have the standard PostgreSQL client tools installed locally, you can use `pg_dump` to create an exact structural and data replica of your Supabase database.

### 1. Get your connection string
1. Go to your Supabase Project Dashboard.
2. Navigate to **Project Settings** -> **Database**.
3. Under **Connection string** (URI), copy the connection string. It will look like this:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 2. Run the `pg_dump` command
Open your terminal and run the following command, replacing `[YOUR_CONNECTION_STRING]` with the URI copied above:

```bash
pg_dump "[YOUR_CONNECTION_STRING]" \
  --clean \
  --if-exists \
  --quote-all-identifiers \
  --exclude-schema="auth" \
  --exclude-schema="storage" \
  --exclude-schema="graphql" \
  --exclude-schema="realtime" \
  --file=supabase_backup.sql
```

**Note**: We exclude system schemas like `auth`, `storage`, `graphql` and `realtime` since those are often managed internally by Supabase and importing them into a new project can cause conflicts. 

### 3. Restore (if needed)

To restore this backup into another Supabase project, use `psql`:

```bash
psql "[YOUR_NEW_CONNECTION_STRING]" -f supabase_backup.sql
```

## Using Supabase CLI (Alternative)

If you use the Supabase CLI, you can dump the database using:

```bash
# Pulls the remote schema and saves to supabase/schema.sql
supabase db pull

# Dump data only (if needed for seeding)
supabase db dump --data-only --file supabase/seed.sql
```
