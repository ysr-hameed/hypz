# Hypz Python SDK - Quick Start Guide

## Installation

### Option 1: Install from source (Recommended for development)

```bash
cd hypz-sdk/python
pip install -e .
```

### Option 2: Install dependencies only

```bash
cd hypz-sdk/python
pip install -r requirements.txt
```

## Getting Your API Key

1. Log in to your Hypz dashboard at http://localhost:5173
2. Navigate to **API Keys** section
3. Click **Generate New API Key**
4. Copy your API key and save it securely

## Quick Test

### 1. Set your API key:

```bash
export HYPZ_API_KEY='your_api_key_here'
```

### 2. Run the test script:

```bash
cd hypz-sdk/python
python test_sdk.py
```

This will verify your API key and test basic operations.

## Basic Usage

### Python Script

```python
from hypz import HypzClient

# Initialize
client = HypzClient(api_key='your_api_key_here')

# Create a bucket
bucket = client.buckets.create(name='my-bucket')

# Upload a file
file = client.files.upload(
    bucket_id=bucket['id'],
    file_path='./photo.jpg'
)

print(f"File uploaded: {file['url']}")
```

### Environment Variables

Create a `.env` file or export variables:

```bash
export HYPZ_API_KEY='your_api_key'
export HYPZ_API_URL='http://localhost:5000/api/v1'
```

Then in your Python code:

```python
import os
from hypz import HypzClient

client = HypzClient(
    api_key=os.getenv('HYPZ_API_KEY'),
    base_url=os.getenv('HYPZ_API_URL', 'http://localhost:5000/api/v1')
)
```

## Examples

Run the example scripts:

```bash
# Basic usage
python examples/basic_usage.py

# Bulk upload
python examples/bulk_upload.py

# Metadata management
python examples/metadata_example.py
```

## Common Operations

### Buckets

```python
# Create
bucket = client.buckets.create(name='my-bucket', visibility='private')

# List
buckets = client.buckets.list()

# Get details
bucket = client.buckets.get('bucket_id')

# Update
bucket = client.buckets.update('bucket_id', visibility='public')

# Delete
client.buckets.delete('bucket_id')

# Get stats
stats = client.buckets.stats('bucket_id')
```

### Files

```python
# Upload from file path
file = client.files.upload(bucket_id='id', file_path='./file.pdf')

# Upload from file object
with open('file.pdf', 'rb') as f:
    file = client.files.upload(
        bucket_id='id',
        file_data=f,
        filename='file.pdf'
    )

# Upload with metadata
file = client.files.upload(
    bucket_id='id',
    file_path='./doc.pdf',
    is_public=True,
    tags=['important', 'document'],
    metadata={'category': 'reports', 'year': 2024}
)

# List files
files = client.files.list(bucket_id='id', page=1, limit=50)

# Get file details
file = client.files.get('file_id')

# Download
data = client.files.download('file_id')  # Returns bytes
# Or save to file
client.files.download('file_id', save_path='./downloaded.pdf')

# Update metadata
file = client.files.update('file_id', tags=['new-tag'], is_public=False)

# Delete
client.files.delete('file_id')
```

## Error Handling

```python
from hypz import HypzClient, HypzError

client = HypzClient(api_key='your_key')

try:
    bucket = client.buckets.create(name='my-bucket')
    file = client.files.upload(bucket['id'], file_path='./file.pdf')
except HypzError as e:
    print(f"API Error: {e}")
except FileNotFoundError as e:
    print(f"File not found: {e}")
```

## Production Configuration

For production, use environment variables:

```python
import os
from hypz import HypzClient

# Production settings
client = HypzClient(
    api_key=os.environ['HYPZ_API_KEY'],  # From environment
    base_url='https://api.yourdomain.com/api/v1'  # Your production URL
)
```

## Troubleshooting

### Connection Errors

If you get connection errors, check:
1. Backend server is running: `cd backend && npm start`
2. API URL is correct (default: http://localhost:5000/api/v1)
3. Firewall isn't blocking the connection

### Authentication Errors

If you get "Invalid API key" errors:
1. Verify your API key is correct
2. Check the key has proper permissions (read, write, delete)
3. Ensure the key isn't expired

### Import Errors

If Python can't find the module:
```bash
# Install in development mode
pip install -e .

# Or add to path
export PYTHONPATH="${PYTHONPATH}:/path/to/hypz-sdk/python"
```

## Support

- Documentation: See README.md
- Backend API: http://localhost:5000/api/v1
- Frontend Dashboard: http://localhost:5173

## Next Steps

1. ✓ Install the SDK
2. ✓ Get your API key
3. ✓ Run test_sdk.py
4. → Build your application!

Check out the examples folder for more use cases.
