const { Client } = require('pg');

const client = new Client({
  host: '',
  port: 5432,
  database: '',
  user: '',
  password: '',
});

async function checkMatches() {
  try {
    await client.connect();
    
    // Check total matches
    const totalResult = await client.query('SELECT COUNT(*) FROM matches');
    console.log('\n📊 Total matches:', totalResult.rows[0].count);
    
    // Check most recent matches
    const recentResult = await client.query(`
      SELECT 
        user_id,
        product_id,
        match_score,
        created_at,
        NOW() - created_at as age
      FROM matches 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n🕒 Most recent matches:');
    recentResult.rows.forEach(row => {
      console.log(`  - Created: ${row.created_at} (${row.age} ago)`);
      console.log(`    User: ${row.user_id}, Score: ${row.match_score}`);
    });
    
    // Test with longer interval
    const testResult = await client.query(`
      SELECT COUNT(*) 
      FROM matches m
      WHERE m.created_at > NOW() - INTERVAL '1 day'
    `);
    console.log('\n📅 Matches in last 24 hours:', testResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMatches();
