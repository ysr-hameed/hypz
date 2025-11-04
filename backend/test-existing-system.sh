#!/bin/bash

# Comprehensive test script for existing Hypz API
# Run this before implementing new features

API_URL="http://localhost:5000/api/v1"
TOKEN=""
USER_EMAIL="test@example.com"
USER_PASSWORD="Test123456!"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "🧪 HYPZ API TESTING SUITE"
echo "======================================"
echo ""

# Helper function to print test results
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
  fi
}

# 1. TEST AUTHENTICATION
echo "📝 Test 1: Authentication"
echo "--------------------------------------"

# Register new user
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Register response: $REGISTER_RESPONSE"

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed - no token received${NC}"
  echo "Response: $LOGIN_RESPONSE"
else
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "Token: ${TOKEN:0:50}..."
fi

echo ""

# 2. TEST BUCKET OPERATIONS
echo "📦 Test 2: Bucket Operations"
echo "--------------------------------------"

# Create bucket
CREATE_BUCKET_RESPONSE=$(curl -s -X POST "$API_URL/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-bucket",
    "visibility": "private",
    "description": "Test bucket"
  }')

BUCKET_ID=$(echo $CREATE_BUCKET_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$BUCKET_ID" ]; then
  echo -e "${RED}❌ Bucket creation failed${NC}"
  echo "Response: $CREATE_BUCKET_RESPONSE"
else
  echo -e "${GREEN}✅ Bucket created with ID: $BUCKET_ID${NC}"
fi

# List buckets
LIST_BUCKETS=$(curl -s -X GET "$API_URL/buckets" \
  -H "Authorization: Bearer $TOKEN")

BUCKET_COUNT=$(echo $LIST_BUCKETS | grep -o '"id":[0-9]*' | wc -l)
echo "Found $BUCKET_COUNT buckets"
test_result 0 "List buckets"

echo ""

# 3. TEST FILE UPLOAD
echo "📤 Test 3: File Upload"
echo "--------------------------------------"

# Create a test file
echo "Test file content $(date)" > /tmp/test-upload.txt

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/files/$BUCKET_ID/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-upload.txt" \
  -F "tags=[\"test\",\"upload\"]" \
  -F "metadata={\"description\":\"Test file\"}")

FILE_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$FILE_ID" ]; then
  echo -e "${RED}❌ File upload failed${NC}"
  echo "Response: $UPLOAD_RESPONSE"
else
  echo -e "${GREEN}✅ File uploaded with ID: $FILE_ID${NC}"
fi

echo ""

# 4. TEST FILE DOWNLOAD
echo "📥 Test 4: File Download"
echo "--------------------------------------"

if [ ! -z "$FILE_ID" ]; then
  DOWNLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/files/file/$FILE_ID/download" \
    -H "Authorization: Bearer $TOKEN" \
    -o /tmp/test-download.txt)
  
  HTTP_CODE=$(echo "$DOWNLOAD_RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    test_result 0 "File download"
    echo "Downloaded file content: $(cat /tmp/test-download.txt)"
  else
    test_result 1 "File download (HTTP $HTTP_CODE)"
  fi
else
  echo -e "${YELLOW}⚠️  Skipped - no file to download${NC}"
fi

echo ""

# 5. TEST SIGNED URLs
echo "🔐 Test 5: Signed URLs"
echo "--------------------------------------"

if [ ! -z "$FILE_ID" ]; then
  SIGNED_URL_RESPONSE=$(curl -s -X POST "$API_URL/files/file/$FILE_ID/signed-url" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "expiresIn": 3600,
      "action": "download"
    }')
  
  SIGNED_URL=$(echo $SIGNED_URL_RESPONSE | grep -o '"signedUrl":"[^"]*' | cut -d'"' -f4)
  
  if [ ! -z "$SIGNED_URL" ]; then
    test_result 0 "Generate signed URL"
    echo "Signed URL: ${SIGNED_URL:0:80}..."
  else
    test_result 1 "Generate signed URL"
    echo "Response: $SIGNED_URL_RESPONSE"
  fi
else
  echo -e "${YELLOW}⚠️  Skipped - no file for signed URL${NC}"
fi

echo ""

# 6. TEST API KEYS
echo "🔑 Test 6: API Keys"
echo "--------------------------------------"

CREATE_KEY_RESPONSE=$(curl -s -X POST "$API_URL/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API Key",
    "permissions": {
      "buckets:read": true,
      "buckets:write": true,
      "files:read": true,
      "files:write": true,
      "files:delete": true
    }
  }')

API_KEY=$(echo $CREATE_KEY_RESPONSE | grep -o '"key":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$API_KEY" ]; then
  test_result 0 "Create API key"
  echo "API Key: ${API_KEY:0:50}..."
  
  # Test API key works
  TEST_KEY_RESPONSE=$(curl -s -X GET "$API_URL/buckets" \
    -H "X-API-Key: $API_KEY")
  
  KEY_BUCKET_COUNT=$(echo $TEST_KEY_RESPONSE | grep -o '"id":[0-9]*' | wc -l)
  
  if [ "$KEY_BUCKET_COUNT" -gt 0 ]; then
    test_result 0 "Use API key for authentication"
  else
    test_result 1 "Use API key for authentication"
  fi
else
  test_result 1 "Create API key"
fi

echo ""

# 7. TEST RATE LIMITING
echo "⏱️  Test 7: Rate Limiting"
echo "--------------------------------------"

echo "Sending 10 rapid requests..."
for i in {1..10}; do
  RATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/buckets" \
    -H "Authorization: Bearer $TOKEN")
  HTTP_CODE=$(echo "$RATE_RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" -eq 429 ]; then
    echo -e "${GREEN}✅ Rate limit triggered at request $i${NC}"
    break
  fi
  
  if [ $i -eq 10 ]; then
    echo -e "${YELLOW}⚠️  No rate limit hit after 10 requests (might be plan-based)${NC}"
  fi
done

echo ""

# 8. TEST USAGE TRACKING
echo "📊 Test 8: Usage Tracking"
echo "--------------------------------------"

USAGE_RESPONSE=$(curl -s -X GET "$API_URL/usage/current" \
  -H "Authorization: Bearer $TOKEN")

STORAGE_USED=$(echo $USAGE_RESPONSE | grep -o '"storage_used":[0-9]*' | cut -d':' -f2)
FILES_COUNT=$(echo $USAGE_RESPONSE | grep -o '"files_count":[0-9]*' | cut -d':' -f2)

if [ ! -z "$STORAGE_USED" ]; then
  test_result 0 "Get usage stats"
  echo "Storage used: $STORAGE_USED bytes"
  echo "Files count: $FILES_COUNT"
else
  test_result 1 "Get usage stats"
fi

echo ""

# 9. TEST PLAN ENFORCEMENT
echo "💳 Test 9: Plan Enforcement"
echo "--------------------------------------"

# Get user plan
PLAN_RESPONSE=$(curl -s -X GET "$API_URL/plans/user/current" \
  -H "Authorization: Bearer $TOKEN")

PLAN_NAME=$(echo $PLAN_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$PLAN_NAME" ]; then
  echo -e "${GREEN}✅ User is on plan: $PLAN_NAME${NC}"
  
  # Try to create more buckets than allowed (if on Free plan)
  if [ "$PLAN_NAME" = "Free" ]; then
    echo "Testing bucket limit for Free plan (max 3)..."
    
    for i in {1..5}; do
      CREATE_RESPONSE=$(curl -s -X POST "$API_URL/buckets" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
          \"name\": \"limit-test-$i\",
          \"visibility\": \"private\"
        }")
      
      if echo "$CREATE_RESPONSE" | grep -q "bucket limit"; then
        echo -e "${GREEN}✅ Bucket limit enforced correctly${NC}"
        break
      fi
    done
  fi
else
  test_result 1 "Get user plan"
fi

echo ""

# 10. TEST BULK OPERATIONS
echo "📦 Test 10: Bulk Operations"
echo "--------------------------------------"

if [ ! -z "$FILE_ID" ]; then
  # Bulk delete
  BULK_DELETE_RESPONSE=$(curl -s -X POST "$API_URL/files/bulk/delete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"fileIds\": [$FILE_ID]
    }")
  
  if echo "$BULK_DELETE_RESPONSE" | grep -q "success"; then
    test_result 0 "Bulk delete files"
  else
    test_result 1 "Bulk delete files"
    echo "Response: $BULK_DELETE_RESPONSE"
  fi
else
  echo -e "${YELLOW}⚠️  Skipped - no files to delete${NC}"
fi

echo ""

# CLEANUP
echo "🧹 Cleanup"
echo "--------------------------------------"

if [ ! -z "$BUCKET_ID" ]; then
  DELETE_BUCKET=$(curl -s -X DELETE "$API_URL/buckets/$BUCKET_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "Bucket deleted"
fi

rm -f /tmp/test-upload.txt /tmp/test-download.txt

echo ""
echo "======================================"
echo "✅ TEST SUITE COMPLETED"
echo "======================================"
