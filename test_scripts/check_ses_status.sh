#!/bin/bash
# Check SES verification status for both emails

export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY="0Um+"
export AWS_REGION="a"

echo "=== Checking SES Verification Status ==="
echo ""

echo "Email 1: devjayswal404@gmail.com"
aws ses get-identity-verification-attributes \
    --identities "devjayswal404@gmail.com" \
    --region ap-south-1 \
    --query 'VerificationAttributes."devjayswal404@gmail.com".VerificationStatus' \
    --output text
echo ""

echo "Email 2: rdssjayswal@gmail.com"
aws ses get-identity-verification-attributes \
    --identities "rdssjayswal@gmail.com" \
    --region ap-south-1 \
    --query 'VerificationAttributes."rdssjayswal@gmail.com".VerificationStatus' \
    --output text
echo ""

echo "=== All Verified Identities ==="
aws ses list-verified-email-addresses --region ap-south-1

echo ""
echo "⚠️  If status is 'Pending', check your Gmail inbox and click verification links"
echo "✓  If status is 'Success', you're ready to send emails!"
