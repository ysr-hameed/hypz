/**
 * Test LemonSqueezy checkout creation
 * Run: node test-checkout.js
 */

import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import dotenv from 'dotenv';

dotenv.config();

const testCheckout = async () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     LemonSqueezy Checkout Creation Test             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('❌ LEMONSQUEEZY_API_KEY not found in .env');
    process.exit(1);
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    console.error('❌ LEMONSQUEEZY_STORE_ID not found in .env');
    process.exit(1);
  }

  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      console.error('❌ LemonSqueezy Setup Error:', error);
    }
  });

  const storeId = parseInt(process.env.LEMONSQUEEZY_STORE_ID, 10);
  const variantId = 1080591; // Pro Plan (as INTEGER)

  console.log(`📦 Store ID: ${storeId} (type: ${typeof storeId})`);
  console.log(`🏷️  Variant ID: ${variantId} (type: ${typeof variantId})`);
  console.log('\n🔄 Creating checkout...\n');

  try {
    const checkoutData = {
      productOptions: {
        redirectUrl: 'http://localhost:3000/dashboard/billing?session=success',
      },
      checkoutData: {
        email: 'test@example.com',
        custom: {
          userId: 'test-user-123',
          planId: 'pro_monthly',
        },
      },
    };

    console.log('📝 Checkout Config:', JSON.stringify(checkoutData, null, 2));
    console.log('\n⏳ Calling LemonSqueezy API...\n');

    const { data, error } = await createCheckout(storeId, variantId, checkoutData);

    if (error) {
      console.error('❌ ERROR RESPONSE:');
      console.error(JSON.stringify(error, null, 2));
      
      if (error.status === 422) {
        console.log('\n💡 UNPROCESSABLE ENTITY (422) - Possible causes:');
        console.log('   1. Store ID is incorrect');
        console.log('   2. Variant is in draft status (but we checked - it\'s published)');
        console.log('   3. Test mode mismatch (variant is test, but API key is live or vice versa)');
        console.log('   4. Variant belongs to different store');
        console.log('\n🔍 Let me check your configuration...');
        console.log(`   Store ID in .env: ${process.env.LEMONSQUEEZY_STORE_ID}`);
        console.log(`   Variant Product ID: 687120 (from earlier test)`);
      }
      
      process.exit(1);
    }

    if (data) {
      console.log('✅ SUCCESS! Checkout created!');
      console.log('\n📄 Checkout Details:');
      console.log(`   Checkout ID: ${data.data.id}`);
      console.log(`   URL: ${data.data.attributes.url}`);
      console.log(`   Status: ${data.data.attributes.status}`);
      console.log(`   Test Mode: ${data.data.attributes.test_mode}`);
      console.log('\n🎉 Your LemonSqueezy integration is working!');
      console.log('\n🔗 Test checkout URL:');
      console.log(`   ${data.data.attributes.url}`);
    }
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    console.error('\n Stack trace:', err.stack);
  }
};

testCheckout().catch(console.error);
