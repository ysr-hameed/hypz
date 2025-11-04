# Hypz SDK Documentation Test Suite

This folder contains test scripts that verify all code examples from the Hypz documentation page work correctly with the actual SDK.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your credentials:
```env
HYPZ_API_KEY=your-api-key-here
HYPZ_BASE_URL=http://localhost:5000/api/v1
```

3. Link the local SDK (for testing):
```bash
cd ../hypz-sdk/nodejs
npm link
cd ../../test-sdk-docs
npm link @hypz/sdk
```

Or install from npm:
```bash
npm install ../hypz-sdk/nodejs
```

## Running Tests

Run all examples:
```bash
npm run test:all
```

Run specific category:
```bash
npm run test:auth         # Authentication examples
npm run test:buckets      # Bucket operations
npm run test:files        # File operations
npm run test:bulk         # Bulk operations
npm run test:apikeys      # API key management
npm run test:advanced     # Advanced features
```

## Test Structure

- `examples/` - Individual test files matching documentation sections
  - `authentication.js` - Auth and connection tests
  - `buckets.js` - Bucket CRUD operations
  - `files.js` - File upload, download, and management
  - `bulk-operations.js` - Bulk delete, update, download, move
  - `api-keys.js` - API key management
  - `advanced.js` - Signed URLs, public files, CORS, rate limits
- `test-all-examples.js` - Master test runner
- `utils/` - Helper functions for testing

## Notes

- All examples are taken directly from the documentation page
- Tests are designed to be idempotent where possible
- Cleanup happens after each test section
- Some tests require specific permissions or plan features
