# Hypz SDK - NPM Package

## ✅ Package Created Successfully!

Your professional npm package `hypz-cloud-sdk` has been created and built successfully.

## 📦 Package Structure

```
hypz-sdk/
├── dist/                    # Built distributable files
│   ├── index.js            # CommonJS module
│   ├── index.esm.js        # ES Module
│   ├── index.d.ts          # TypeScript definitions
│   └── *.map               # Source maps
├── src/
│   └── index.ts            # Source TypeScript code
├── package.json            # Package manifest
├── tsconfig.json           # TypeScript config
├── rollup.config.js        # Build config
├── README.md               # Complete documentation
├── test-sdk.js             # Test script
└── .npmignore              # NPM publish exclusions
```

## 🚀 Build Status

- ✅ TypeScript compilation: **PASSED**
- ✅ CommonJS output: **GENERATED**
- ✅ ES Module output: **GENERATED**
- ✅ Type definitions: **GENERATED**
- ✅ Source maps: **GENERATED**
- ✅ No vulnerabilities found
- ✅ All warnings resolved

## 📋 Features

### Dual Module Support
- **CommonJS** (`dist/index.js`) - For Node.js require()
- **ES Modules** (`dist/index.esm.js`) - For import statements
- **TypeScript** (`dist/index.d.ts`) - Full type definitions

### Complete API Coverage
- ✅ Bucket management (create, list, get, update, delete)
- ✅ File operations (upload, list, get, download, delete, update)
- ✅ Usage tracking (current, history)
- ✅ Error handling with custom HypzError class
- ✅ TypeScript support with full type inference
- ✅ Axios interceptor for clean response handling

## 🧪 Testing the SDK

### 1. Update the test file with your API key

Edit `test-sdk.js` and replace:
```javascript
const API_KEY = 'hypz_your_api_key_here';
```

### 2. Run the test

```bash
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk
node test-sdk.js
```

This will test:
- ✅ Listing buckets
- ✅ Getting usage statistics
- ✅ Creating a new bucket

## 📦 Using the Package Locally

### Option 1: NPM Link (Recommended for Testing)

```bash
# In the SDK directory
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk
npm link

# In your project
cd /path/to/your/project
npm link hypz-cloud-sdk
```

### Option 2: Install from Local Path

```bash
npm install /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk
```

### Usage Example

```javascript
// CommonJS
const { Hypz } = require('hypz-cloud-sdk');

// ES Modules
import { Hypz } from 'hypz-cloud-sdk';

const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY,
  baseURL: 'http://localhost:5000/api/v1' // or your production URL
});

// Create a bucket
const bucket = await hypz.createBucket({
  name: 'my-bucket',
  visibility: 'public'
});

// Upload a file
const file = await hypz.uploadFile(bucket.id, fileBuffer, {
  filename: 'image.jpg',
  tags: ['avatar', 'profile']
});

console.log('File URL:', file.cdn_url);
```

## 🌐 Publishing to NPM (Optional)

### 1. Create NPM Account
```bash
npm adduser
```

### 2. Publish the Package
```bash
cd /home/ysr/VS\ Code\ Projects/hypz/hypz-sdk
npm publish --access public
```

### 3. After Publishing
Users can install with:
```bash
npm install hypz-cloud-sdk
```

## 📚 Documentation

The package includes comprehensive documentation in `README.md`:
- ✅ Installation instructions
- ✅ Quick start guide
- ✅ Complete API reference
- ✅ Usage examples for all methods
- ✅ Error handling patterns
- ✅ TypeScript examples
- ✅ Best practices

## 🔧 Building from Source

If you make changes to `src/index.ts`:

```bash
npm run build
```

This will:
1. Compile TypeScript to JavaScript
2. Generate CommonJS and ES Module builds
3. Create type definition files
4. Generate source maps

## ⚠️ Important Notes

### API Key Security
- ✅ Never hardcode API keys
- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate keys regularly

### CORS Configuration
For browser usage, ensure your backend CORS settings allow your frontend origin.

### Rate Limiting
API keys have rate limits based on your plan. Handle 429 errors gracefully.

## 🐛 Troubleshooting

### "Cannot find module 'hypz-cloud-sdk'"
- Run `npm install` in your project
- Check that the package is in `node_modules/hypz-cloud-sdk`

### "401 Unauthorized"
- Verify your API key is correct
- Check that the API key hasn't expired
- Ensure the API key has required permissions

### "TypeError: Hypz is not a constructor"
```javascript
// ❌ Wrong
const Hypz = require('hypz-cloud-sdk');

// ✅ Correct
const { Hypz } = require('hypz-cloud-sdk');
```

## 📊 Package Stats

- **Size**: ~50KB (minified)
- **Dependencies**: axios (only runtime dependency)
- **License**: MIT
- **TypeScript**: Full support with strict mode
- **Node.js**: >= 16.0.0 recommended
- **Browser**: Modern browsers (ES6+)

## 🎯 Next Steps

1. **Test the SDK** with your API key
2. **Update documentation** in your frontend to use the npm package
3. **Publish to NPM** when ready
4. **Share with users** for easy integration

## 📝 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Complete API coverage
- ✅ TypeScript support
- ✅ Dual module support (CJS + ESM)
- ✅ Comprehensive documentation

## 🤝 Contributing

To contribute to the SDK:

1. Make changes to `src/index.ts`
2. Run `npm run build`
3. Test with `node test-sdk.js`
4. Update version in `package.json`
5. Publish with `npm publish`

---

**Made with ❤️ for the Hypz platform**
