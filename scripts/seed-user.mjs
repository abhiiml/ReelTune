import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

try {
  const result = await client.query(
    `INSERT INTO "user" ("id", "email", "displayName", "updatedAt") 
     VALUES ($1, $2, $3, NOW()) 
     ON CONFLICT ("id") DO NOTHING 
     RETURNING *;`,
    ['1af90884-1db5-47fd-83eb-c7ee8166e01b', 'test@reeltune.com', 'Test']
  );

  if (result.rows.length > 0) {
    console.log('✅ User inserted:', result.rows[0]);
  } else {
    console.log('⚠️  User already existed (no insert needed)');
    // Try to read the existing user
    const existing = await client.query(
      `SELECT * FROM "user" WHERE "id" = $1;`,
      ['1af90884-1db5-47fd-83eb-c7ee8166e01b']
    );
    console.log('Existing user:', existing.rows[0]);
  }
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await client.end();
}
