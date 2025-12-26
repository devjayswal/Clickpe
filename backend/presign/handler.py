import json
import boto3
import os
from datetime import datetime
from botocore.config import Config

# Force the client to use the regional endpoint to avoid 307 Redirects which break CORS
s3 = boto3.client(
    's3', 
    region_name='ap-south-1',
    endpoint_url='https://s3.ap-south-1.amazonaws.com',
    config=Config(signature_version='s3v4')
)

def generate_presigned_url(event, context):
    """
    Generate a presigned POST URL for CSV upload to S3.
    Called by the UI to get a temporary, direct upload link.
    """
    bucket = os.environ['BUCKET_NAME']
    
    try:
        # Generate presigned POST (allows direct PUT from browser/client)
        timestamp = datetime.utcnow().isoformat()
        key = f"uploads/users-{timestamp}.csv"
        
        presigned_post = s3.generate_presigned_post(
            Bucket=bucket,
            Key=key,
            ExpiresIn=3600  # 1 hour validity
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'url': presigned_post['url'],
                'fields': presigned_post['fields'],
                'key': key
            })
        }
    except Exception as e:
        print(f"Error generating presigned URL: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
