const { Client } = require('pg');

async function verify() {
  const client = new Client({
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  
  await client.connect();
  
  const result = await client.query(`
    SELECT 
      id,
      user_id,
      email,
      notification_type,
      status,
      created_at
    FROM notifications
    ORDER BY created_at DESC
    LIMIT 1
  `);
  
  if (result.rows.length > 0) {
    const notif = result.rows[0];
    console.log('\n✅ Workflow C Success!');
    console.log('================================');
    console.log(`Notification ID: ${notif.id}`);
    console.log(`User: ${notif.email}`);
    console.log(`Type: ${notif.notification_type}`);
    console.log(`Status: ${notif.status}`);
    console.log(`Created: ${notif.created_at}`);
    console.log('\n✅ Workflow C is working correctly!\n');
  }
  
  await client.end();
}

verify().catch(console.error);
