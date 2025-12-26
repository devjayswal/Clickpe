import json
import boto3
import psycopg2
import csv
import os
from io import StringIO
import requests
import urllib.parse

s3 = boto3.client('s3')

def get_db_connection():
    """Create and return a PostgreSQL connection."""
    return psycopg2.connect(
        host=os.environ['DB_HOST'],
        database=os.environ['DB_NAME'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        port=5432
    )

def process_s3_event(event, context):
    """
    Triggered by S3 ObjectCreated event in uploads/ prefix.
    Streams CSV from S3, validates, parses, and inserts rows into the users table.
    Finally, triggers n8n webhook for matching workflow (Workflow B).
    """
    try:
        # Parse S3 event
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
        
        print(f"Processing CSV: s3://{bucket}/{key}")
        
        # Stream CSV from S3
        obj = s3.get_object(Bucket=bucket, Key=key)
        csv_content = obj['Body'].read().decode('utf-8')
        
        # Parse CSV
        reader = csv.DictReader(StringIO(csv_content))
        rows = list(reader)
        
        if not rows:
            return {'statusCode': 400, 'body': 'Empty CSV'}
        
        # Insert into DB
        conn = get_db_connection()
        cursor = conn.cursor()
        
        inserted_count = 0
        for row in rows:
            try:
                cursor.execute("""
                    INSERT INTO users 
                    (user_id, name, email, monthly_income, credit_score, employment_status, age)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    row['user_id'],
                    row['name'],
                    row['email'],
                    int(row['monthly_income']),
                    int(row['credit_score']),
                    row['employment_status'],
                    int(row['age'])
                ))
                inserted_count += 1
            except Exception as e:
                print(f"Error inserting row {row}: {str(e)}")
                continue
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"Inserted {inserted_count} rows")
        
        # Trigger n8n Workflow B (matching) via webhook
        webhook_url = os.environ.get('N8N_WEBHOOK_URL')
        if webhook_url:
            try:
                requests.post(webhook_url, json={
                    'batch_id': key,
                    'user_count': inserted_count
                }, timeout=30)
                print(f"Triggered n8n webhook")
            except Exception as e:
                print(f"Warning: Could not trigger n8n webhook: {str(e)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'CSV processed successfully',
                'inserted': inserted_count,
                's3_key': key
            })
        }
    
    except Exception as e:
        print(f"Error processing S3 event: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
