# Frequently Asked Questions (FAQ)

## General

### What is Hypz Storage?

Hypz Storage is an S3-compatible object storage service designed specifically for the Indian market. We provide affordable cloud storage with local payment options (Razorpay), competitive pricing in INR, and easy-to-use APIs.

### Is Hypz Storage really free?

Yes! We offer a free plan with 1GB storage and 5GB bandwidth per month. It's perfect for small projects, testing, or personal use. No credit card required to sign up.

### How is Hypz different from AWS S3 or Google Cloud Storage?

- **Affordable**: Significantly cheaper pricing, especially for Indian businesses
- **Local Payment**: Support for UPI, Indian cards, and wallets via Razorpay
- **Pricing in INR**: No currency conversion confusion
- **Simple Pricing**: No complex pricing calculators or surprise bills
- **S3-Compatible**: Works with existing S3 tools and libraries

### What does "S3-compatible" mean?

Our storage is compatible with Amazon S3 API, which means you can use the same tools, libraries, and workflows you use with AWS S3. Popular SDKs like AWS SDK, boto3 (Python), and others work with Hypz Storage.

## Account & Billing

### Do I need a credit card to sign up?

No! You can create a free account without providing any payment information.

### What payment methods do you accept?

We accept all payment methods supported by Razorpay:
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking
- Wallets (Paytm, Mobikwik, etc.)

### Can I upgrade or downgrade my plan?

You can upgrade your plan anytime. Downgrades are currently not supported, but your plan will revert to Free after the paid period expires if you don't renew.

### When will I be charged?

- Free plan: Never
- Paid plans: Monthly billing cycle from the day you upgrade
- You'll receive payment reminders before each billing cycle

### What happens if I exceed my storage limit?

- You'll receive a warning email when you reach 80% of your limit
- At 100%, you won't be able to upload new files until you:
  - Delete some files to free up space
  - Upgrade to a higher plan

### Can I get a refund?

We offer a 7-day money-back guarantee for first-time paid plan subscribers. Contact support@hypz.io with your order ID.

## Technical

### What regions do you support?

Currently, we use Backblaze B2's global infrastructure with primary regions in:
- US West
- EU Central

Data is stored with high redundancy and availability worldwide.

### What is the maximum file size I can upload?

Maximum file size depends on your plan:
- **Free**: 50 MB
- **Pro**: 500 MB
- **Enterprise**: 5 GB

### How long are my files stored?

Files are stored indefinitely until you delete them, unless you set an expiration time during upload.

### Can I set files to expire automatically?

Yes! When uploading a file, you can set an `expiresIn` parameter (in days). The file will be automatically deleted after that period.

```javascript
await client.files.upload({
  file: './temp-file.jpg',
  filename: 'temp.jpg',
  expiresIn: 7 // Delete after 7 days
});
```

### Are my files encrypted?

Yes! Files are:
- Encrypted in transit (HTTPS/TLS)
- Encrypted at rest on Backblaze B2 servers
- Access controlled via secure API keys and JWT tokens

### Can I make files publicly accessible?

Yes! Set `isPublic: true` when uploading. Public files can be accessed without authentication.

```javascript
await client.files.upload({
  file: './logo.png',
  filename: 'logo.png',
  isPublic: true
});
```

### How do I integrate Hypz with my existing app?

We provide:
1. **JavaScript/Node.js SDK**: Easy integration with npm package
2. **REST API**: Use with any programming language
3. **S3-Compatible API**: Use AWS SDK or compatible tools

See our [Getting Started Guide](getting-started.md) for examples.

### Can I use AWS SDK with Hypz?

Yes! Configure AWS SDK to point to our endpoint:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://s3.hypz.io',
  accessKeyId: 'your-hypz-api-key',
  secretAccessKey: 'your-hypz-secret',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});
```

### What happens if Backblaze goes down?

Backblaze B2 has 99.9% uptime SLA. In the rare event of downtime:
- Your files remain safe
- Service resumes automatically when Backblaze recovers
- We monitor status and notify users of any issues

### Do you offer CDN integration?

Not currently built-in, but you can use any CDN (Cloudflare, CloudFront, etc.) with our signed URLs or public file URLs.

## Usage & Limits

### What counts towards my bandwidth usage?

- File uploads
- File downloads
- API requests (minimal)

### What counts as an API call?

Each request to our API counts as one call:
- Upload file: 1 call
- Download file: 1 call
- List files: 1 call
- Delete file: 1 call
- etc.

Downloading files via signed URLs doesn't count as additional API calls.

### When does my usage reset?

Usage resets on a monthly basis from the day you signed up. For example, if you signed up on January 15th, your usage resets on the 15th of each month.

### Can I see my historical usage?

Yes! Visit your dashboard and navigate to Usage → History to see past months' usage statistics.

### What happens if I exceed API call limits?

You'll receive a 429 (Too Many Requests) error. You can:
- Wait for your monthly reset
- Upgrade to a plan with higher limits

## Security & Privacy

### Is my data secure?

Yes! We implement:
- HTTPS/TLS encryption
- Encrypted storage
- Secure authentication (JWT, API keys)
- Regular security audits
- GDPR-compliant practices

### Who can access my files?

- **Private files**: Only you (with valid authentication)
- **Public files**: Anyone with the URL
- **Hypz staff**: Never, unless required by law or with your explicit permission for support

### Can I use Hypz for sensitive data?

While we implement strong security measures, we recommend encrypting sensitive data on your end before uploading for an extra layer of security.

### How do I report a security issue?

Email security@hypz.io with details. We take security seriously and respond within 24 hours.

### Do you comply with GDPR?

Yes! We're GDPR compliant. You have rights to:
- Access your data
- Export your data
- Delete your data
- Request data portability

Contact support@hypz.io for data requests.

## Features & Roadmap

### Do you offer file versioning?

Not currently, but it's on our roadmap for Q2 2025.

### Can I organize files in folders?

Currently, files are stored flat with metadata. Folder/directory support is planned for a future update.

### Do you support image transformations?

Not currently, but we're exploring partnerships with image processing services.

### What SDKs do you provide?

Currently available:
- JavaScript/Node.js

Coming soon:
- Python
- PHP
- Go

### Can I request a feature?

Absolutely! Email support@hypz.io or join our Discord to share your ideas.

## Support

### How do I get help?

- 📖 Documentation: https://docs.hypz.io
- 📧 Email: support@hypz.io
- 💬 Discord: https://discord.gg/hypz
- 🐦 Twitter: @HypzStorage

### What are your support hours?

- Email: 24/7 (response within 24 hours)
- Discord: Community support 24/7
- Priority support: Available for Enterprise plan

### How do I delete my account?

Email support@hypz.io from your registered email with "Delete Account" in the subject. All your data will be permanently deleted within 30 days.

### I found a bug. How do I report it?

Email support@hypz.io or create an issue on our [GitHub repository](https://github.com/hypz/storage/issues).

## Business

### Do you offer enterprise plans?

Yes! Our Enterprise plan includes:
- 1TB storage
- 5TB bandwidth
- 500,000 API calls/month
- Priority support
- Custom solutions available

Contact sales@hypz.io for custom enterprise needs.

### Can I get a volume discount?

Yes! If you need more than our Enterprise plan offers, contact sales@hypz.io for custom pricing.

### Do you offer white-label solutions?

We're exploring white-label options. Express your interest at sales@hypz.io.

### Can I resell Hypz Storage?

We're developing a partner program. Email partners@hypz.io to join the waitlist.

---

**Still have questions?** Contact us at support@hypz.io
