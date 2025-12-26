const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: '',
    port: 5432,
    database: 'clikpedb',
    user: '',
    password: '',
  });
  
  await client.connect();
  
  const result = await client.query(`
    SELECT COUNT(*) as total,
           MAX(created_at) as most_recent
    FROM matches
  `);
  
  console.log('Total matches:', result.rows[0].total);
  console.log('Most recent:', result.rows[0].most_recent);
  
  await client.end();
}

check().catch(console.error);
