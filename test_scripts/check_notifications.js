const { Client } = require('pg');

async function checkNotifications() {
  const client = new Client({
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  
  await client.connect();
  
  // Check recent notifications
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
    LIMIT 5
  `);
  
  console.log('\n📬 Recent Notifications:');
  console.log('================================');
  
  if (result.rows.length === 0) {
    console.log('❌ No notifications found');
  } else {
    result.rows.forEach((notif, i) => {
      console.log(`\n${i + 1}. Notification ID: ${notif.id}`);
      console.log(`   User: ${notif.user_id}`);
      console.log(`   Email: ${notif.email}`);
      console.log(`   Type: ${notif.notification_type}`);
      console.log(`   Status: ${notif.status}`);
      console.log(`   Created: ${notif.created_at}`);
    });
  }
  
  await client.end();
}

checkNotifications().catch(console.error);
