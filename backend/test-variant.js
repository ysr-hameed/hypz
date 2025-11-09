/**
 * Quick test to verify LemonSqueezy variant IDs
 * Run: node test-variant.js
 */

import { lemonSqueezySetup, getVariant } from '@lemonsqueezy/lemonsqueezy.js';
import dotenv from 'dotenv';

dotenv.config();

const testVariant = async (variantId) => {
  try {
    console.log(`\n🔍 Testing Variant ID: ${variantId}`);
    console.log('━'.repeat(60));

    lemonSqueezySetup({
      apiKey: process.env.LEMONSQUEEZY_API_KEY,
      onError: (error) => {
        console.error('❌ LemonSqueezy Error:', error.message || error);
      }
    });

    const { data, error } = await getVariant(variantId);

    if (error) {
      console.error(`❌ Error: ${error.message || JSON.stringify(error)}`);
      return false;
    }

    if (data) {
      console.log('✅ Variant Found!');
      console.log('   Raw data:', JSON.stringify(data, null, 2));
      
      const attrs = data.data?.attributes || data.attributes;
      if (attrs) {
        console.log(`   Name: ${attrs.name}`);
        console.log(`   Price: $${(attrs.price / 100).toFixed(2)}`);
        console.log(`   Product ID: ${attrs.product_id}`);
        console.log(`   Status: ${attrs.status}`);
        console.log(`   Interval: ${attrs.interval || 'one-time'}`);
      }
      return true;
    }

    console.error('❌ No data returned');
    return false;
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return false;
  }
};

const main = async () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     LemonSqueezy Variant ID Verification Test       ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('\n❌ LEMONSQUEEZY_API_KEY not found in .env file!');
    process.exit(1);
  }

  console.log(`\n📦 Store ID: ${process.env.LEMONSQUEEZY_STORE_ID}`);
  console.log(`🔑 API Key: ${process.env.LEMONSQUEEZY_API_KEY.substring(0, 20)}...`);

  // Test your variant IDs
  const proResult = await testVariant(1080591);  // Pro Plan
  const paygResult = await testVariant(1080598); // PAYG Plan

  console.log('\n' + '━'.repeat(60));
  console.log('📊 RESULTS:');
  console.log('━'.repeat(60));
  console.log(`   Pro Plan (1080591):  ${proResult ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   PAYG Plan (1080598): ${paygResult ? '✅ Valid' : '❌ Invalid'}`);
  console.log('━'.repeat(60));

  if (!proResult || !paygResult) {
    console.log('\n⚠️  POSSIBLE ISSUES:');
    console.log('   1. Variant IDs might be wrong');
    console.log('   2. Variants might be in "draft" status');
    console.log('   3. API key might not have access to these variants');
    console.log('\n💡 HOW TO FIX:');
    console.log('   1. Go to: https://app.lemonsqueezy.com/products');
    console.log('   2. Click your product → Variants tab');
    console.log('   3. Make sure variants are "Published" not "Draft"');
    console.log('   4. Copy the correct variant IDs');
  } else {
    console.log('\n🎉 All variant IDs are valid! You should be good to go!');
  }

  console.log('\n');
};

main().catch(console.error);
