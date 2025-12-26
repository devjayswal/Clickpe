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

async function createTestMatches() {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get test users
    const usersResult = await client.query(
      "SELECT user_id, name, email, monthly_income, credit_score FROM users WHERE email IN ('devjayswal404@gmail.com', 'rdssjayswal@gmail.com')"
    );
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No test users found. Run addTestUsers.js first!');
      return;
    }
    
    console.log(`\n📧 Found ${usersResult.rows.length} test users`);
    
    // Get some loan products
    const productsResult = await client.query(
      'SELECT product_id, product_name, lender_name, interest_rate, loan_amount_max FROM loan_products LIMIT 5'
    );
    
    console.log(`🏦 Found ${productsResult.rows.length} loan products\n`);
    
    let totalMatches = 0;
    
    for (const user of usersResult.rows) {
      console.log(`\n👤 Creating matches for: ${user.name} (${user.email})`);
      
      // Delete existing matches for this user
      await client.query('DELETE FROM matches WHERE user_id = $1', [user.user_id]);
      
      for (const product of productsResult.rows) {
        // Create match with perfect score (1.0) for test users
        const matchScore = 1.0;
        const matchReason = `🎯 TEST USER - Perfect Match | Income: ₹${user.monthly_income}, Credit Score: ${user.credit_score}, Interest: ${product.interest_rate}%`;
        
        await client.query(
          `INSERT INTO matches (user_id, product_id, match_score, match_reason)
           VALUES ($1, $2, $3, $4)`,
          [user.user_id, product.product_id, matchScore, matchReason]
        );
        
        console.log(`   ✅ Matched with: ${product.product_name} (${product.lender_name}) - ${Math.round(matchScore * 100)}%`);
        totalMatches++;
      }
    }
    
    console.log(`\n✨ Created ${totalMatches} test matches!`);
    console.log('💡 Now run: npm run test:email');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

createTestMatches();
