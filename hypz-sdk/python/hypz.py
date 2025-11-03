"""
Hypz SDK for Python
A Python client library for interacting with the Hypz file storage API.

Author: Hypz Team
License: MIT
"""

import requests
import os
import json
from typing import Optional, Dict, List, Any, BinaryIO, Union
from pathlib import Path


class HypzError(Exception):
    """Base exception for Hypz SDK errors."""
    pass


class HypzClient:
    """
    Main client for interacting with the Hypz API.
    
    Example:
        >>> client = HypzClient(api_key='your_api_key_here')
        >>> buckets = client.buckets.list()
        >>> for bucket in buckets:
        ...     print(bucket['name'])
    """
    
    def __init__(self, api_key: str, base_url: str = 'http://localhost:5000/api/v1'):
        """
        Initialize the Hypz client.
        
        Args:
            api_key: Your Hypz API key
            base_url: Base URL of the Hypz API (default: http://localhost:5000/api/v1)
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Accept': 'application/json'
        })
        
        # Initialize resource managers
        self.buckets = BucketManager(self)
        self.files = FileManager(self)
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """
        Make an API request.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH)
            endpoint: API endpoint (will be appended to base_url)
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            Response data as dictionary
            
        Raises:
            HypzError: If the request fails
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            
            # Handle empty responses
            if response.status_code == 204:
                return {'success': True}
            
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json()
                error_message = error_data.get('message', str(e))
            except:
                error_message = str(e)
            raise HypzError(f"API Error: {error_message}")
        except requests.exceptions.RequestException as e:
            raise HypzError(f"Request failed: {str(e)}")


class BucketManager:
    """Manager for bucket operations."""
    
    def __init__(self, client: HypzClient):
        self.client = client
    
    def create(self, name: str, description: str = '', visibility: str = 'private') -> Dict[str, Any]:
        """
        Create a new bucket.
        
        Args:
            name: Bucket name
            description: Bucket description (optional)
            visibility: 'public' or 'private' (default: 'private')
            
        Returns:
            Created bucket data
        """
        data = {
            'name': name,
            'description': description,
            'visibility': visibility
        }
        response = self.client._request('POST', '/buckets', json=data)
        return response.get('data', response)
    
    def list(self, page: int = 1, limit: int = 10) -> List[Dict[str, Any]]:
        """
        List all buckets.
        
        Args:
            page: Page number (default: 1)
            limit: Items per page (default: 10)
            
        Returns:
            List of buckets
        """
        params = {'page': page, 'limit': limit}
        response = self.client._request('GET', '/buckets', params=params)
        return response.get('data', {}).get('buckets', [])
    
    def get(self, bucket_id: str) -> Dict[str, Any]:
        """
        Get bucket details.
        
        Args:
            bucket_id: Bucket ID
            
        Returns:
            Bucket data
        """
        response = self.client._request('GET', f'/buckets/{bucket_id}')
        return response.get('data', response)
    
    def update(self, bucket_id: str, **kwargs) -> Dict[str, Any]:
        """
        Update a bucket.
        
        Args:
            bucket_id: Bucket ID
            **kwargs: Fields to update (name, description, visibility)
            
        Returns:
            Updated bucket data
        """
        response = self.client._request('PUT', f'/buckets/{bucket_id}', json=kwargs)
        return response.get('data', response)
    
    def delete(self, bucket_id: str) -> bool:
        """
        Delete a bucket.
        
        Args:
            bucket_id: Bucket ID
            
        Returns:
            True if successful
        """
        self.client._request('DELETE', f'/buckets/{bucket_id}')
        return True
    
    def stats(self, bucket_id: str) -> Dict[str, Any]:
        """
        Get bucket statistics.
        
        Args:
            bucket_id: Bucket ID
            
        Returns:
            Bucket statistics
        """
        response = self.client._request('GET', f'/buckets/{bucket_id}/stats')
        return response.get('data', response)


class FileManager:
    """Manager for file operations."""
    
    def __init__(self, client: HypzClient):
        self.client = client
    
    def upload(
        self,
        bucket_id: str,
        file_path: Optional[str] = None,
        file_data: Optional[BinaryIO] = None,
        filename: Optional[str] = None,
        is_public: bool = False,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to a bucket.
        
        Args:
            bucket_id: Bucket ID to upload to
            file_path: Path to file (either this or file_data required)
            file_data: File-like object (either this or file_path required)
            filename: Filename to use (required if using file_data)
            is_public: Whether file should be public (default: False)
            tags: List of tags (optional)
            metadata: Additional metadata (optional)
            progress_callback: Callback function for upload progress
            
        Returns:
            Uploaded file data
            
        Example:
            >>> # Upload from file path
            >>> client.files.upload('bucket123', file_path='./image.png')
            
            >>> # Upload from file object with progress
            >>> def progress(current, total):
            ...     print(f"Progress: {current}/{total} bytes")
            >>> with open('file.pdf', 'rb') as f:
            ...     client.files.upload('bucket123', file_data=f, filename='file.pdf', 
            ...                        progress_callback=progress)
        """
        if not file_path and not file_data:
            raise ValueError("Either file_path or file_data must be provided")
        
        if file_data and not filename:
            raise ValueError("filename must be provided when using file_data")
        
        # Open file if path provided
        if file_path:
            file_path = Path(file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            file_data = open(file_path, 'rb')
            filename = filename or file_path.name
        
        try:
            # Prepare form data
            files = {'file': (filename, file_data)}
            data = {
                'isPublic': str(is_public).lower(),
            }
            
            if tags:
                data['tags'] = json.dumps(tags)
            if metadata:
                data['metadata'] = json.dumps(metadata)
            
            # Make request
            response = self.client._request(
                'POST',
                f'/files/{bucket_id}/upload',
                files=files,
                data=data
            )
            return response.get('data', response)
        finally:
            # Close file if we opened it
            if file_path:
                file_data.close()
    
    def list(self, bucket_id: str, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """
        List files in a bucket.
        
        Args:
            bucket_id: Bucket ID
            page: Page number (default: 1)
            limit: Items per page (default: 20)
            
        Returns:
            List of files
        """
        params = {'page': page, 'limit': limit}
        response = self.client._request('GET', f'/files/{bucket_id}/files', params=params)
        return response.get('data', {}).get('files', [])
    
    def get(self, file_id: str) -> Dict[str, Any]:
        """
        Get file details.
        
        Args:
            file_id: File ID
            
        Returns:
            File data
        """
        response = self.client._request('GET', f'/files/file/{file_id}')
        return response.get('data', response)
    
    def download(self, file_id: str, save_path: Optional[str] = None) -> Union[bytes, str]:
        """
        Download a file.
        
        Args:
            file_id: File ID
            save_path: Path to save file (optional, returns bytes if not provided)
            
        Returns:
            File path if save_path provided, otherwise file bytes
        """
        url = f"{self.client.base_url}/files/file/{file_id}/download"
        response = self.client.session.get(url, stream=True)
        response.raise_for_status()
        
        if save_path:
            save_path = Path(save_path)
            save_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return str(save_path)
        else:
            return response.content
    
    def delete(self, file_id: str) -> bool:
        """
        Delete a file.
        
        Args:
            file_id: File ID
            
        Returns:
            True if successful
        """
        self.client._request('DELETE', f'/files/file/{file_id}')
        return True
    
    def update(self, file_id: str, **kwargs) -> Dict[str, Any]:
        """
        Update file metadata.
        
        Args:
            file_id: File ID
            **kwargs: Fields to update (tags, metadata, is_public)
            
        Returns:
            Updated file data
        """
        response = self.client._request('PATCH', f'/files/file/{file_id}', json=kwargs)
        return response.get('data', response)


# Convenience functions
def create_client(api_key: str, base_url: str = 'http://localhost:5000/api/v1') -> HypzClient:
    """
    Create a Hypz client instance.
    
    Args:
        api_key: Your Hypz API key
        base_url: Base URL of the Hypz API
        
    Returns:
        HypzClient instance
    """
    return HypzClient(api_key, base_url)


if __name__ == '__main__':
    # Example usage
    print("Hypz Python SDK")
    print("===============")
    print("\nQuick Start:")
    print("  from hypz import HypzClient")
    print("  client = HypzClient(api_key='your_api_key_here')")
    print("  buckets = client.buckets.list()")
    print("  client.files.upload('bucket_id', file_path='./file.png')")
