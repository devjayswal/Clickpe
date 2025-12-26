#!/bin/bash
# Quick SES Email Verification

export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY="+"
export AWS_REGION="ap-south-1"

EMAIL=$1

if [ -z "$EMAIL" ]; then
    echo "Usage: ./verify_email.sh your@email.com"
    exit 1
fi

echo "Sending verification email to: $EMAIL"
aws ses verify-email-identity --email-address "$EMAIL" --region ap-south-1

if [ $? -eq 0 ]; then
    echo "✓ Verification email sent successfully!"
    echo "⚠ Check your inbox at: $EMAIL"
    echo "⚠ Click the verification link in the email"
    echo ""
    echo "To check verification status, run:"
    echo "aws ses get-identity-verification-attributes --identities \"$EMAIL\" --region ap-south-1"
else
    echo "✗ Failed to send verification email"
fi
