#!/bin/bash

# AWS SES Setup Script for Loan Eligibility Engine
# This script helps verify email identities in AWS SES

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AWS SES Email Verification Setup ===${NC}\n"

# Load AWS credentials from .env
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_REGION="ap-south-1"

echo -e "${YELLOW}Current SES Status:${NC}"
aws sesv2 get-account --region ap-south-1 | grep -E "ProductionAccessEnabled|SendingEnabled|Max24HourSend"
echo ""

echo -e "${YELLOW}Currently Verified Identities:${NC}"
aws ses list-identities --region ap-south-1
echo ""

# Function to verify email
verify_email() {
    local email=$1
    echo -e "\n${GREEN}Verifying email: $email${NC}"
    
    # Check if already verified
    if aws ses list-identities --region ap-south-1 | grep -q "$email"; then
        echo -e "${YELLOW}Email already in verification list${NC}"
        
        # Check verification status
        status=$(aws ses get-identity-verification-attributes \
            --identities "$email" \
            --region ap-south-1 \
            --query "VerificationAttributes.\"$email\".VerificationStatus" \
            --output text)
        echo -e "Status: $status"
    else
        # Send verification email
        aws ses verify-email-identity \
            --email-address "$email" \
            --region ap-south-1
        echo -e "${GREEN}✓ Verification email sent to: $email${NC}"
        echo -e "${YELLOW}⚠ Please check your inbox and click the verification link!${NC}"
    fi
}

# Main menu
echo -e "${GREEN}Choose an option:${NC}"
echo "1. Verify a sender email address"
echo "2. Verify a recipient email address"
echo "3. Verify both sender and recipient (same email)"
echo "4. Check verification status"
echo "5. List all verified identities"
echo ""
read -p "Enter option (1-5): " option

case $option in
    1)
        read -p "Enter sender email address: " sender_email
        verify_email "$sender_email"
        ;;
    2)
        read -p "Enter recipient email address: " recipient_email
        verify_email "$recipient_email"
        ;;
    3)
        read -p "Enter your email address (will be used as both sender and recipient): " email
        verify_email "$email"
        ;;
    4)
        read -p "Enter email address to check: " check_email
        aws ses get-identity-verification-attributes \
            --identities "$check_email" \
            --region ap-south-1
        ;;
    5)
        echo -e "\n${GREEN}All Verified Identities:${NC}"
        aws ses list-verified-email-addresses --region ap-south-1
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "\n${YELLOW}=== Important Notes ===${NC}"
echo "1. Check your email inbox for verification link"
echo "2. Click the link to complete verification"
echo "3. In sandbox mode, BOTH sender and recipient must be verified"
echo "4. After verification, update the .env file with your verified email"
echo "5. Update Workflow C in n8n with the verified sender email"
echo ""
echo -e "${GREEN}To request production access (remove sandbox limits):${NC}"
echo "aws sesv2 put-account-details \\"
echo "  --production-access-enabled \\"
echo "  --mail-type TRANSACTIONAL \\"
echo "  --website-url https://yourwebsite.com \\"
echo "  --use-case-description 'Loan eligibility matching notifications' \\"
echo "  --region ap-south-1"
