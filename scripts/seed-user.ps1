$env:PGPASSWORD = 'Ayushabhijit@123'
$result = psql -h db.nbkczvfnvbimanidfgqb.supabase.co -U postgres -d postgres -c 'INSERT INTO "user" ("id", "email", "displayName", "updatedAt") VALUES (''1af90884-1db5-47fd-83eb-c7ee8166e01b'', ''test@reeltune.com'', ''Test'', NOW()) ON CONFLICT ("id") DO NOTHING;' 2>&1
Write-Host $result
