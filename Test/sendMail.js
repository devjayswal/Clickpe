const AWS = require('aws-sdk');
const { Client } = require('pg');
require('dotenv').config();

// AWS SES Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.SES_SENDER_EMAIL || '@gmail.com',
  to: '@gmail.com',
  alternativeRecipient: '@gmail.com'
};

// PostgreSQL configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

// Generate product card HTML
function generateProductCard(product) {
  const matchScore = Math.round((product.match_score || 0.85) * 100);
  const interestRate = product.interest_rate || 'Contact for rate';
  const lenderName = product.lender_name || 'Premium Lender';
  const productName = product.product_name || 'Personal Loan';
  const loanAmount = product.loan_amount_max 
    ? `₹${(product.loan_amount_max / 100000).toFixed(1)}L` 
    : 'Up to ₹40L';
  
  return `
    <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #4CAF50;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">${productName}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">🏦 ${lenderName}</p>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          ${matchScore}% Match
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
        <div>
          <p style="margin: 0 0 4px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Interest Rate</p>
          <p style="margin: 0; color: #4CAF50; font-size: 20px; font-weight: 700;">${interestRate}%</p>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;">per annum</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Loan Amount</p>
          <p style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 700;">${loanAmount}</p>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;">available</p>
        </div>
      </div>
      
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
          <strong>Match Reason:</strong> ${product.match_reason || 'Perfect match for your profile'}
        </p>
      </div>
      
      <div style="margin-top: 16px;">
        <a href="https://example.com/apply/${product.product_id}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          Apply Now →
        </a>
      </div>
    </div>
  `;
}

// Generate complete email HTML
function generateEmailHTML(userName, products) {
  const productCards = products.map(p => generateProductCard(p)).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Personalized Loan Matches</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Content -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                🎯 Your Personalized Loan Matches
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                We found ${products.length} loan${products.length !== 1 ? 's' : ''} perfect for your profile!
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                Hello ${userName}! 👋
              </h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                Great news! Based on your profile, income, and credit score, we've matched you with the following loan products that you're likely eligible for.
              </p>
            </td>
          </tr>
          
          <!-- Products Section -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              ${productCards}
            </td>
          </tr>
          
          <!-- Why Choose Section -->
          <tr>
            <td style="padding: 0 32px 32px 32px; background-color: #f8f9ff; border-top: 2px solid #eee;">
              <h3 style="margin: 24px 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                ✨ Why These Matches?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                <li>Matched based on your monthly income and credit score</li>
                <li>Pre-qualified based on age and employment status</li>
                <li>Best interest rates available for your profile</li>
                <li>Quick approval process with minimal documentation</li>
              </ul>
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #fff;">
              <a href="https://example.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                View All Matches in Dashboard
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px; background-color: #f8f9ff; border-top: 1px solid #eee;">
              <p style="margin: 0 0 12px 0; color: #999; font-size: 13px; line-height: 1.6; text-align: center;">
                This is an automated notification from your Loan Eligibility Engine.<br>
                You're receiving this because you uploaded your profile for loan matching.
              </p>
              <p style="margin: 12px 0 0 0; color: #ccc; font-size: 12px; text-align: center;">
                © 2025 Loan Eligibility Engine | Powered by n8n & AWS
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}

// Fetch matches from database
async function fetchMatches(userEmail) {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Fetch user info
    const userResult = await client.query(
      'SELECT user_id, name, email FROM users WHERE email = $1',
      [userEmail]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error(`User not found with email: ${userEmail}`);
    }
    
    const user = userResult.rows[0];
    console.log(`📧 Found user: ${user.name} (${user.email})`);
    
    // Fetch matches with product details
    const matchesResult = await client.query(`
      SELECT 
        m.id,
        m.match_score,
        m.match_reason,
        m.created_at,
        p.product_id,
        p.product_name,
        p.lender_name,
        p.interest_rate,
        p.loan_amount_max
      FROM matches m
      JOIN loan_products p ON m.product_id = p.product_id
      WHERE m.user_id = $1
      ORDER BY m.match_score DESC, m.created_at DESC
      LIMIT 10
    `, [user.user_id]);
    
    console.log(`🎯 Found ${matchesResult.rows.length} matches for ${user.name}`);
    
    return {
      user,
      matches: matchesResult.rows
    };
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Send email using AWS SES
async function sendEmail(userEmail, userName, products) {
  try {
    const htmlContent = generateEmailHTML(userName, products);
    const subject = `🎯 ${products.length} Loan Match${products.length !== 1 ? 'es' : ''} Found For You!`;
    
    const params = {
      Source: EMAIL_CONFIG.from,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `Hello ${userName},\n\nWe found ${products.length} loan matches for you! Please view this email in HTML format for the best experience.`,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    console.log('📧 Sending email via AWS SES...');
    console.log(`   From: ${EMAIL_CONFIG.from}`);
    console.log(`   To: ${userEmail}`);
    console.log(`   Region: ${AWS.config.region}`);
    
    const result = await ses.sendEmail(params).promise();
    
    console.log('✅ Email sent successfully via AWS SES!');
    console.log('📧 Message ID:', result.MessageId);
    
    return result;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.code === 'MessageRejected') {
      console.error('💡 Email was rejected. Check if the sender email is verified in SES.');
    } else if (error.code === 'ConfigurationSetDoesNotExist') {
      console.error('💡 Configuration set does not exist.');
    }
    throw error;
  }
}

// Main execution
async function main() {
  console.log('\n🚀 Starting Loan Offer Email Test...\n');
  console.log('=' .repeat(50));
  
  const targetEmail = 'rdssjayswal@gmail.com';
  
  try {
    // Step 1: Fetch matches from database
    console.log(`\n📊 Fetching matches for: ${targetEmail}`);
    console.log('─'.repeat(50));
    const { user, matches } = await fetchMatches(targetEmail);
    
    if (matches.length === 0) {
      console.log(`\n⚠️  No matches found for ${targetEmail}`);
      console.log('💡 Tip: Run the matching workflow in n8n first to generate matches.');
      return;
    }
    
    // Step 2: Send email
    console.log(`\n📧 Sending email to ${user.name}...`);
    console.log(`   From: ${EMAIL_CONFIG.from}`);
    console.log(`   To: ${user.email}`);
    
    await sendEmail(user.email, user.name, matches);
    
    // Step 3: Summary
    console.log('\n' + '=' .repeat(50));
    console.log('✨ Email sent successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • From: ${EMAIL_CONFIG.from}`);
    console.log(`   • To: ${user.name} (${user.email})`);
    console.log(`   • Matches sent: ${matches.length}`);
    console.log(`   • Top match score: ${Math.round(matches[0].match_score * 100)}%`);
    console.log('\n💡 Check inbox at: ${targetEmail}');
    console.log('=' .repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your .env file has correct AWS credentials');
    console.error('   2. Ensure PostgreSQL is running and accessible');
    console.error('   3. Verify sender email is verified in AWS SES');
    console.error('   4. Check AWS SES is in production mode (not sandbox)');
    console.error('   5. Run the matching workflow first to generate matches');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchMatches, sendEmail, generateEmailHTML };