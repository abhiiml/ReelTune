const pg = require('pg');

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
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
      console.log('✅ User inserted:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('⚠️  User already existed. Fetching existing row...');
      const existing = await client.query(
        `SELECT * FROM "user" WHERE "id" = $1;`,
        ['1af90884-1db5-47fd-83eb-c7ee8166e01b']
      );
      console.log('Existing user:', JSON.stringify(existing.rows[0], null, 2));
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
