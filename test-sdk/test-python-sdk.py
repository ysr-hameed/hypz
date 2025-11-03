#!/usr/bin/env python3
"""
Comprehensive test for Hypz Python SDK
Tests all major features with the provided API key
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

from hypz import HypzClient, HypzError
import time

# API Configuration
API_KEY = 'sk_live_UXHEakqYuGlKDkMZVKSXIoFyweDIytkl'
BASE_URL = 'http://localhost:5000/api/v1'

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_section(msg):
    print(f"\n{Colors.CYAN}{'='*60}")
    print(msg)
    print(f"{'='*60}{Colors.RESET}")

def log_success(msg):
    print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")

def log_error(msg):
    print(f"{Colors.RED}✗{Colors.RESET} {msg}")

def log_info(msg):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {msg}")

# Test tracking
test_results = []

def run_test(name, func):
    """Run a single test and track result"""
    try:
        func()
        test_results.append((name, True, None))
        return True
    except Exception as e:
        test_results.append((name, False, str(e)))
        log_error(f"Failed: {e}")
        return False

def main():
    print(f"""{Colors.CYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║      Hypz Python SDK - Comprehensive Test Suite          ║
╚═══════════════════════════════════════════════════════════╝
{Colors.RESET}""")
    
    log_info(f"API URL: {BASE_URL}")
    log_info(f"API Key: {API_KEY[:15]}...")
    
    # Initialize client
    try:
        client = HypzClient(api_key=API_KEY, base_url=BASE_URL)
        log_success("SDK initialized successfully")
    except Exception as e:
        log_error(f"Failed to initialize SDK: {e}")
        return
    
    # Test variables
    test_bucket_id = None
    test_file_id = None
    
    # TEST 1: Create Bucket
    log_section("TEST 1: Create Bucket")
    def test_create_bucket():
        nonlocal test_bucket_id
        bucket = client.buckets.create(
            name=f'python-test-{int(time.time())}',
            description='Test bucket from Python SDK',
            visibility='private'
        )
        test_bucket_id = bucket['id']
        log_success(f"Bucket created: {bucket['name']}")
        log_info(f"Bucket ID: {test_bucket_id}")
    
    if not run_test("Create Bucket", test_create_bucket):
        return
    
    time.sleep(0.5)
    
    # TEST 2: List Buckets
    log_section("TEST 2: List Buckets")
    def test_list_buckets():
        buckets = client.buckets.list()
        log_success(f"Retrieved {len(buckets)} bucket(s)")
        for bucket in buckets[:5]:
            log_info(f"  - {bucket['name']} ({bucket['visibility']})")
    
    run_test("List Buckets", test_list_buckets)
    time.sleep(0.5)
    
    # TEST 3: Get Bucket Details
    log_section("TEST 3: Get Bucket Details")
    def test_get_bucket():
        bucket = client.buckets.get(test_bucket_id)
        log_success("Retrieved bucket details")
        log_info(f"Name: {bucket['name']}")
        log_info(f"Files: {bucket.get('file_count', 0)}")
    
    run_test("Get Bucket Details", test_get_bucket)
    time.sleep(0.5)
    
    # TEST 4: Upload File
    log_section("TEST 4: Upload File")
    def test_upload_file():
        nonlocal test_file_id
        # Create test file
        test_file = '/tmp/python-test-upload.txt'
        with open(test_file, 'w') as f:
            f.write(f'Test file from Python SDK\n')
            f.write(f'Timestamp: {time.time()}\n')
            f.write(f'API Key: {API_KEY[:15]}...\n')
        
        file = client.files.upload(
            bucket_id=test_bucket_id,
            file_path=test_file,
            is_public=False,
            tags=['test', 'python', 'sdk'],
            metadata={'source': 'python_sdk_test', 'version': '1.0'}
        )
        test_file_id = file['id']
        log_success(f"File uploaded: {file['original_name']}")
        log_info(f"File ID: {test_file_id}")
        log_info(f"Size: {file['size']} bytes")
        log_info(f"URL: {file['url'][:60]}...")
        
        # Cleanup
        os.remove(test_file)
    
    if not run_test("Upload File", test_upload_file):
        pass
    
    time.sleep(1)  # Wait for database
    
    # TEST 5: List Files
    log_section("TEST 5: List Files")
    def test_list_files():
        files = client.files.list(test_bucket_id)
        log_success(f"Retrieved {len(files)} file(s)")
        for file in files:
            log_info(f"  - {file['original_name']} ({file['size']} bytes)")
    
    run_test("List Files", test_list_files)
    time.sleep(0.5)
    
    # TEST 6: Get File Details
    if test_file_id:
        log_section("TEST 6: Get File Details")
        def test_get_file():
            file = client.files.get(test_file_id)
            log_success("Retrieved file details")
            log_info(f"Name: {file['original_name']}")
            log_info(f"MIME: {file['mime_type']}")
            log_info(f"Tags: {', '.join(file['tags'])}")
        
        run_test("Get File Details", test_get_file)
        time.sleep(0.5)
    
    # TEST 7: Update File Metadata
    if test_file_id:
        log_section("TEST 7: Update File Metadata")
        def test_update_file():
            file = client.files.update(
                test_file_id,
                tags=['test', 'python', 'sdk', 'updated'],
                metadata={'version': '2.0', 'updated': True}
            )
            log_success("File metadata updated")
            log_info(f"Updated tags: {', '.join(file['tags'])}")
        
        run_test("Update File Metadata", test_update_file)
        time.sleep(0.5)
    
    # TEST 8: Get Bucket Stats
    log_section("TEST 8: Get Bucket Statistics")
    def test_bucket_stats():
        stats = client.buckets.stats(test_bucket_id)
        log_success("Retrieved bucket statistics")
        log_info(f"Files: {stats.get('file_count', 0)}")
        log_info(f"Size: {stats.get('total_size', 0)} bytes")
    
    run_test("Bucket Statistics", test_bucket_stats)
    time.sleep(0.5)
    
    # TEST 9: Update Bucket
    log_section("TEST 9: Update Bucket")
    def test_update_bucket():
        bucket = client.buckets.update(
            test_bucket_id,
            name=f'python-test-updated-{int(time.time())}',
            description='Updated from Python SDK test'
        )
        log_success("Bucket updated successfully")
        log_info(f"New description: {bucket['description']}")
    
    run_test("Update Bucket", test_update_bucket)
    time.sleep(0.5)
    
    # TEST 10: Delete File
    if test_file_id:
        log_section("TEST 10: Delete File")
        def test_delete_file():
            client.files.delete(test_file_id)
            log_success("File deleted successfully")
        
        run_test("Delete File", test_delete_file)
        time.sleep(0.5)
    
    # TEST 11: Delete Bucket
    log_section("TEST 11: Delete Bucket")
    def test_delete_bucket():
        client.buckets.delete(test_bucket_id)
        log_success("Bucket deleted successfully")
    
    run_test("Delete Bucket", test_delete_bucket)
    
    # Print Results
    log_section("TEST RESULTS")
    passed = sum(1 for _, success, _ in test_results if success)
    failed = sum(1 for _, success, _ in test_results if not success)
    
    log_success(f"Passed: {passed}/{len(test_results)}")
    if failed > 0:
        log_error(f"Failed: {failed}/{len(test_results)}")
        print(f"\n{Colors.YELLOW}Failed tests:{Colors.RESET}")
        for name, success, error in test_results:
            if not success:
                print(f"  - {name}: {error}")
    
    if passed == len(test_results):
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Python SDK is working perfectly!{Colors.RESET}\n")
    else:
        print(f"\n{Colors.YELLOW}⚠️  Some tests failed. Check errors above.{Colors.RESET}\n")

if __name__ == '__main__':
    main()
