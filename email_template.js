// Beautiful Loan Offer Email Template
// Use this in your n8n "Compose Email" Function Node

const user = $json;
const userName = user.name || 'Valued Customer';
const userEmail = user.email;

// Get matched products from previous node
// Assuming products are in items array or $json.matches
const products = $json.matches || items || [];

// Generate product cards HTML
let productCards = '';
products.forEach((product, index) => {
  const matchScore = Math.round((product.match_score || 0.85) * 100);
  const interestRate = product.interest_rate || 'Contact for rate';
  const lenderName = product.lender_name || 'Lender';
  const productName = product.product_name || 'Personal Loan';
  const loanAmount = product.loan_amount_max ? `₹${(product.loan_amount_max / 100000).toFixed(1)}L` : 'Up to ₹40L';
  
  productCards += `
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
      
      <div style="margin-top: 16px;">
        <a href="https://example.com/apply/${product.product_id}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          Apply Now →
        </a>
      </div>
    </div>
  `;
});

// Complete HTML Email
const htmlBody = `
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

// Return the email data
return {
  email: userEmail,
  name: userName,
  subject: `🎯 ${products.length} Loan Match${products.length !== 1 ? 'es' : ''} Found For You!`,
  htmlBody: htmlBody,
  match_count: products.length
};
