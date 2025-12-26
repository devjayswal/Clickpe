require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  try {
    await client.connect();
    
    const productsRes = await client.query('SELECT COUNT(*) FROM loan_products');
    console.log(`Loan Products in DB: ${productsRes.rows[0].count}`);
    
    const usersRes = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Users in DB: ${usersRes.rows[0].count}`);

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await client.end();
  }
}

checkData();
