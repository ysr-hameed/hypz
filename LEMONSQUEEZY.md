# LemonSqueezy Payment Integration

## Variant IDs

Your LemonSqueezy variant IDs are configured in the backend:
- **Pro Plan:** `1080591` ($5/month)
- **Pay-as-you-go:** `1080598` (usage-based)

## Frontend Usage

Send `planId` only - the backend will automatically use the correct variant ID:

```javascript
// Pro Plan
const response = await fetch('/api/subscriptions/subscribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planId: 2,  // Pro plan
    autoRenew: true
  })
});

// Pay-as-you-go
const response = await fetch('/api/subscriptions/subscribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planId: 3,  // PAYG plan
    autoRenew: true
  })
});

const data = await response.json();
if (data.success) {
  window.location.href = data.data.checkoutUrl;
}
```

## Webhook Setup (Production)

1. Add webhook in LemonSqueezy: https://app.lemonsqueezy.com/settings/webhooks
2. URL: `https://your-domain.com/api/payments/webhook/lemonsqueezy`
3. Select events: `subscription_created`, `subscription_payment_success`, etc.
4. Copy signing secret to `.env`: `LEMONSQUEEZY_WEBHOOK_SECRET=your_secret`

## Local Development Webhook (with ngrok)

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start ngrok
ngrok http 5000

# Use ngrok HTTPS URL in LemonSqueezy webhook settings
```

## Test Card

Card: `4242 4242 4242 4242`  
Expiry: Any future date  
CVC: Any 3 digits
