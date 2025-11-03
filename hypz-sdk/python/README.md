# Hypz Python SDK

Official Python client library for the Hypz file storage API.

## Installation

### From Source

```bash
pip install -e .
```

### From PyPI (coming soon)

```bash
pip install hypz-sdk
```

## Requirements

- Python 3.7+
- requests >= 2.25.0

## Quick Start

```python
from hypz import HypzClient

# Initialize the client
client = HypzClient(api_key='your_api_key_here')

# Create a bucket
bucket = client.buckets.create(
    name='my-bucket',
    description='My awesome bucket',
    visibility='private'
)
print(f"Created bucket: {bucket['name']}")

# Upload a file
file = client.files.upload(
    bucket_id=bucket['id'],
    file_path='./image.png',
    is_public=False,
    tags=['image', 'profile']
)
print(f"Uploaded file: {file['filename']}")

# List files
files = client.files.list(bucket['id'])
for f in files:
    print(f"- {f['original_name']} ({f['size']} bytes)")

# Download a file
client.files.download(file['id'], save_path='./downloaded.png')
print("File downloaded!")
```

## Usage Examples

### Bucket Management

```python
# List all buckets
buckets = client.buckets.list(page=1, limit=10)

# Get bucket details
bucket = client.buckets.get('bucket_id_here')

# Update bucket
updated = client.buckets.update(
    'bucket_id_here',
    name='new-name',
    visibility='public'
)

# Delete bucket
client.buckets.delete('bucket_id_here')

# Get bucket statistics
stats = client.buckets.stats('bucket_id_here')
print(f"Files: {stats['file_count']}, Size: {stats['total_size']} bytes")
```

### File Operations

```python
# Upload with metadata
file = client.files.upload(
    bucket_id='bucket_id',
    file_path='./document.pdf',
    is_public=True,
    tags=['document', 'important'],
    metadata={'category': 'reports', 'year': 2024}
)

# Upload from file object
with open('data.json', 'rb') as f:
    file = client.files.upload(
        bucket_id='bucket_id',
        file_data=f,
        filename='data.json'
    )

# Upload with progress tracking
def progress_callback(current, total):
    percent = (current / total) * 100
    print(f"Upload progress: {percent:.2f}%")

client.files.upload(
    bucket_id='bucket_id',
    file_path='./large_file.zip',
    progress_callback=progress_callback
)

# List files with pagination
files = client.files.list(bucket_id='bucket_id', page=1, limit=50)

# Get file details
file_info = client.files.get('file_id')
print(f"URL: {file_info['url']}")
print(f"CDN URL: {file_info['cdn_url']}")

# Download file
# As bytes
data = client.files.download('file_id')

# To file
client.files.download('file_id', save_path='./downloads/file.pdf')

# Update file metadata
updated_file = client.files.update(
    'file_id',
    tags=['updated', 'new-tag'],
    is_public=False
)

# Delete file
client.files.delete('file_id')
```

### Error Handling

```python
from hypz import HypzClient, HypzError

client = HypzClient(api_key='your_api_key')

try:
    bucket = client.buckets.create(name='my-bucket')
except HypzError as e:
    print(f"Error: {e}")
```

### Environment Configuration

```python
import os
from hypz import HypzClient

# Use environment variables
api_key = os.getenv('HYPZ_API_KEY')
base_url = os.getenv('HYPZ_API_URL', 'http://localhost:5000/api/v1')

client = HypzClient(api_key=api_key, base_url=base_url)
```

## API Reference

### HypzClient

Main client class for interacting with the Hypz API.

**Constructor:**
- `HypzClient(api_key: str, base_url: str = 'http://localhost:5000/api/v1')`

**Properties:**
- `buckets`: BucketManager instance
- `files`: FileManager instance

### BucketManager

Manager for bucket operations.

**Methods:**
- `create(name, description='', visibility='private')`: Create a new bucket
- `list(page=1, limit=10)`: List all buckets
- `get(bucket_id)`: Get bucket details
- `update(bucket_id, **kwargs)`: Update bucket
- `delete(bucket_id)`: Delete bucket
- `stats(bucket_id)`: Get bucket statistics

### FileManager

Manager for file operations.

**Methods:**
- `upload(bucket_id, file_path=None, file_data=None, filename=None, is_public=False, tags=None, metadata=None, progress_callback=None)`: Upload a file
- `list(bucket_id, page=1, limit=20)`: List files in bucket
- `get(file_id)`: Get file details
- `download(file_id, save_path=None)`: Download a file
- `delete(file_id)`: Delete a file
- `update(file_id, **kwargs)`: Update file metadata

## Examples

See the `examples/` directory for more usage examples:

- `basic_usage.py`: Basic operations
- `bulk_upload.py`: Upload multiple files
- `download_manager.py`: Download files with progress
- `metadata_example.py`: Working with file metadata

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black hypz.py

# Lint code
flake8 hypz.py
```

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.hypz.io
- Issues: https://github.com/ysr-hameed/hypz/issues
- Email: support@hypz.io
