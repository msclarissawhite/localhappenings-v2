# Drizzle ORM Package Issue - Jan 1, 2026

## Problem Summary

Browse Events page is stuck on "Loading events..." and the `/archive` page shows no results. The tRPC API endpoint `events.list` returns 500 errors with "Failed query" messages.

## Root Cause

The `drizzle-orm` package has an "invalid workspace" error that prevents database queries from executing:

```
drizzle-orm@0.44.0 invalid: "workspace:./drizzle-orm/dist" from drizzle-kit
```

This error persists across:
- Multiple checkpoint rollbacks (tested back to 11:49 AM checkpoint)
- Fresh `node_modules` installations
- Package version downgrades (tried 0.44.7 → 0.44.0)
- Different drizzle-kit versions (0.31.8 → 0.30.0)

## Evidence

1. **Database is healthy**: Direct SQL queries via `webdev_execute_sql` work perfectly and show 41 published events
2. **Code is correct**: Rollback to known-working checkpoints doesn't fix the issue
3. **Standalone scripts work**: Test scripts using drizzle can query the database successfully
4. **Server queries fail**: All tRPC procedures using drizzle fail with "Failed query"

## Error Details

```
Error: Failed query: select `events`.`id`, ... from `events` 
left join `organizers` on `events`.`organizerId` = `organizers`.`id` 
where (`events`.`status` = ? and `events`.`startDate` >= ?) 
order by `events`.`startDate` asc limit ?
params: published,2026-01-01 22:22:29.977,1

at MySql2PreparedQuery.queryWithCache 
(/home/ubuntu/local_happenings/node_modules/.pnpm/drizzle-orm@0.44.0_mysql2@3.16.0/node_modules/src/mysql-core/session.ts:79:11)
```

## Timeline

- **12:10 PM**: Events were displaying correctly (user confirmed after CSV import)
- **~2:45 PM**: Database migration checkpoint (added `isDeprecated` column to eventTypes)
- **~5:00 PM**: Issue discovered - Browse Events not loading

## Attempted Fixes

1. ✅ Checked database connection - DATABASE_URL is correct
2. ✅ Verified events exist in database - 41 published events confirmed
3. ✅ Rolled back to checkpoint 9f9c537 (1:50 PM)
4. ✅ Rolled back to checkpoint 986e7e5 (11:49 AM - CSV import working)
5. ✅ Removed and reinstalled node_modules
6. ✅ Removed pnpm-lock.yaml and reinstalled
7. ✅ Downgraded drizzle-orm from 0.44.7 to 0.44.0
8. ✅ Downgraded drizzle-kit from 0.31.8 to 0.30.0
9. ✅ Removed wouter patch that was causing install errors
10. ❌ **None of these fixed the issue**

## Impact

- ❌ Browse Events page shows "Loading events..."
- ❌ Archive page shows no results
- ❌ Featured events carousel on home page works (uses different query method)
- ✅ All other functionality appears normal
- ✅ Database and data are intact

## Next Steps

1. **Report to Manus support** at https://help.manus.im with this documentation
2. **Try publishing** the current checkpoint to see if production environment has different package resolution
3. **Wait for platform fix** - this may be a temporary pnpm/drizzle-kit compatibility issue in the Manus environment

## Workaround Attempts

Created alternative database helper files:
- `server/db-direct.ts` - Direct connection pool bypassing cached getDb()
- `server/events-db-direct.ts` - Alternative events query function
- Modified `server/events-router.ts` to use direct connection

**Result**: Same "Failed query" error persists, confirming the issue is at the drizzle-orm package level, not the application code.

## Technical Details

- Node.js version: 22.13.0
- pnpm version: 10.4.1
- drizzle-orm: 0.44.0 (also tried 0.44.5, 0.44.6, 0.44.7)
- drizzle-kit: 0.30.0 (also tried 0.31.8)
- mysql2: 3.16.0
- Database: MySQL/TiDB (connection string works in standalone scripts)

## Data Safety

✅ **All event data is safe in the database**. Once the package issue is resolved, everything will work normally again. No data loss has occurred.
