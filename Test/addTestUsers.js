const { Client } = require('pg');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

async function addTestUsers() {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const testUsers = [
      {
        name: 'Dev Jayswal',
        email: 'devjayswal404@gmail.com',
        monthly_income: 75000,
        credit_score: 780,
        employment_status: 'Salaried',
        age: 32
      },
      {
        name: 'RDS Jayswal',
        email: 'rdssjayswal@gmail.com',
        monthly_income: 95000,
        credit_score: 800,
        employment_status: 'Business',
        age: 35
      }
    ];
    
    for (const user of testUsers) {
      // Check if user already exists
      const checkResult = await client.query(
        'SELECT user_id FROM users WHERE email = $1',
        [user.email]
      );
      
      if (checkResult.rows.length > 0) {
        console.log(`⚠️  User ${user.email} already exists with ID: ${checkResult.rows[0].user_id}`);
        
        // Update the existing user
        await client.query(
          `UPDATE users SET 
           name = $1, 
           monthly_income = $2, 
           credit_score = $3, 
           employment_status = $4, 
           age = $5
           WHERE email = $6`,
          [user.name, user.monthly_income, user.credit_score, user.employment_status, user.age, user.email]
        );
        console.log(`✅ Updated user: ${user.name}`);
      } else {
        // Insert new user with UUID
        const result = await client.query(
          `INSERT INTO users (user_id, name, email, monthly_income, credit_score, employment_status, age)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
           RETURNING user_id`,
          [user.name, user.email, user.monthly_income, user.credit_score, user.employment_status, user.age]
        );
        console.log(`✅ Added user: ${user.name} with ID: ${result.rows[0].user_id}`);
      }
    }
    
    console.log('\n✨ Test users ready!');
    console.log('💡 Now run the matching workflow in n8n to generate matches for these users.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addTestUsers();
