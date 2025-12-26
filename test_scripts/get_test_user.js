const { Client } = require('pg');

async function getTestUser() {
  const client = new Client({
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  
  await client.connect();
  
  // Get a user with matches
  const result = await client.query(`
    SELECT DISTINCT m.user_id, u.name, u.email, COUNT(*) as match_count
    FROM matches m
    JOIN users u ON m.user_id = u.user_id
    GROUP BY m.user_id, u.name, u.email
    ORDER BY match_count DESC
    LIMIT 1
  `);
  
  if (result.rows.length > 0) {
    const user = result.rows[0];
    console.log('\n✅ Test user found:');
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Matches: ${user.match_count}`);
    console.log('\n📋 Copy this curl command:\n');
    console.log(`curl -X POST http://localhost:5678/webhook/notify \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"user_id": "${user.user_id}"}'`);
  } else {
    console.log('❌ No matches found in database');
  }
  
  await client.end();
}

getTestUser().catch(console.error);
