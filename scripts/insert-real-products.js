#!/usr/bin/env node

/**
 * INSERT ECHTE AFFILIATE-PRODUKTE IN SUPABASE
 * 15 echte Affiliate-Links vom User bereitgestellt
 *
 * VERWENDUNG:
 * node --env-file=.env.local scripts/insert-real-products.js
 */

import { createClient } from '@supabase/supabase-js';
import { REAL_AFFILIATE_PRODUCTS } from '../config/real-affiliate-products.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function insertRealProducts() {
  log('\n🚀 Inserting 15 real affiliate products to Supabase...\n', 'cyan');

  // Nutze Service Role Key für Admin-Rechte (wenn verfügbar)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey
  );

  try {
    // Prüfe Verbindung
    log('📡 Testing Supabase connection...', 'blue');
    const { data: testData, error: testError } = await supabase
      .from('digistore_products')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`);
    }

    log('✅ Supabase connected\n', 'green');

    // Lösche alte Einträge (optional)
    log('🧹 Cleaning old products...', 'blue');
    const { error: deleteError } = await supabase
      .from('digistore_products')
      .delete()
      .or('product_id.like.DS24-%,product_id.like.M365-%,product_id.like.DREAM-%,product_id.like.CALDWELL-%,product_id.eq.ROHSTOFFE');

    if (deleteError && deleteError.code !== 'PGRST116') {
      log(`⚠️  Cleanup warning: ${deleteError.message}`, 'yellow');
    } else {
      log('✅ Cleanup complete\n', 'green');
    }

    // Füge echte Produkte ein
    log('💾 Inserting real products...\n', 'cyan');

    let successCount = 0;
    let failedCount = 0;

    for (const product of REAL_AFFILIATE_PRODUCTS) {
      try {
        const { data, error } = await supabase
          .from('digistore_products')
          .upsert({
            product_id: product.product_id,
            product_name: product.product_name,
            product_url: product.product_url,
            category: product.category,
            commission_rate: product.commission_rate,
            price: product.price,
            vendor_name: product.vendor_name,
            description: product.description,
            gravity_score: product.gravity_score,
            conversion_score: product.conversion_score,
            trend_score: product.trend_score,
            affiliate_link: product.affiliate_link,
            is_promoted: false,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'product_id'
          })
          .select();

        if (error) {
          throw error;
        }

        log(`✅ ${product.product_name} (${product.category})`, 'green');
        successCount++;

      } catch (err) {
        log(`❌ Failed: ${product.product_name} - ${err.message}`, 'red');
        failedCount++;
      }
    }

    // Statistik
    log('\n' + '='.repeat(70), 'cyan');
    log('📊 INSERTION SUMMARY', 'cyan');
    log('='.repeat(70), 'cyan');
    log(`✅ Success: ${successCount}/${REAL_AFFILIATE_PRODUCTS.length}`, 'green');
    log(`❌ Failed:  ${failedCount}/${REAL_AFFILIATE_PRODUCTS.length}`, failedCount > 0 ? 'red' : 'green');

    // Zeige Produkte nach Kategorie
    const { data: products, error: statsError } = await supabase
      .from('digistore_products')
      .select('category')
      .or('product_id.like.DS24-%,product_id.like.M365-%,product_id.like.DREAM-%,product_id.like.CALDWELL-%,product_id.eq.ROHSTOFFE');

    if (!statsError && products) {
      const categoryStats = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      log('\n📦 Products by Category:', 'blue');
      Object.entries(categoryStats).forEach(([cat, count]) => {
        log(`   ${cat}: ${count}`, 'cyan');
      });
    }

    // Zeige Top 5 nach Conversion Score
    const { data: topProducts } = await supabase
      .from('digistore_products')
      .select('product_name, conversion_score, commission_rate')
      .or('product_id.like.DS24-%,product_id.like.M365-%,product_id.like.DREAM-%,product_id.like.CALDWELL-%,product_id.eq.ROHSTOFFE')
      .order('conversion_score', { ascending: false })
      .limit(5);

    if (topProducts && topProducts.length > 0) {
      log('\n🏆 Top 5 Products (by Conversion Score):', 'blue');
      topProducts.forEach((p, i) => {
        log(`   ${i + 1}. ${p.product_name} (Score: ${p.conversion_score}, Commission: ${p.commission_rate}%)`, 'cyan');
      });
    }

    log('\n✅ Real products successfully inserted!\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, 'red');
    log('💡 Troubleshooting:', 'yellow');
    log('   1. Check if SUPABASE_SERVICE_ROLE_KEY is set in .env.local', 'yellow');
    log('   2. Check internet connection', 'yellow');
    log('   3. Check if digistore_products table exists', 'yellow');
    log('   4. Check RLS policies allow INSERT with service role\n', 'yellow');
    process.exit(1);
  }
}

// Run
insertRealProducts();
