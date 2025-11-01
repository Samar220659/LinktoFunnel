#!/usr/bin/env node

/**
 * INSERT TEST PRODUCTS VIA SUPABASE CLIENT
 * Fügt manuelle Test-Produkte über Supabase JS ein
 */

import { createClient } from '@supabase/supabase-js';

const testProducts = [
  {
    product_id: 'TEST001',
    product_name: 'AI Marketing Masterclass 2025',
    product_url: 'https://www.digistore24.com/product/TEST001',
    category: 'Online Marketing',
    commission_rate: 50.0,
    price: 497.00,
    vendor_name: 'MarketingPro GmbH',
    description: 'Kompletter AI Marketing Kurs mit ChatGPT, Midjourney und Automationen. Perfekt für Anfänger und Fortgeschrittene.',
    gravity_score: 85.5
  },
  {
    product_id: 'TEST002',
    product_name: 'Passives Einkommen System',
    product_url: 'https://www.digistore24.com/product/TEST002',
    category: 'Geld verdienen',
    commission_rate: 40.0,
    price: 297.00,
    vendor_name: 'Freiheit Digital',
    description: 'Schritt-für-Schritt Anleitung zum Aufbau passiver Einkommensströme mit Affiliate Marketing und digitalen Produkten.',
    gravity_score: 92.3
  },
  {
    product_id: 'TEST003',
    product_name: 'Social Media Automation Bundle',
    product_url: 'https://www.digistore24.com/product/TEST003',
    category: 'Social Media',
    commission_rate: 45.0,
    price: 197.00,
    vendor_name: 'SocialBoost',
    description: 'Komplettes Tool-Set für automatisierte Social Media Posts auf TikTok, Instagram, YouTube und LinkedIn.',
    gravity_score: 78.9
  },
  {
    product_id: 'TEST004',
    product_name: 'Finanzen Meistern Komplettkurs',
    product_url: 'https://www.digistore24.com/product/TEST004',
    category: 'Finanzen',
    commission_rate: 35.0,
    price: 397.00,
    vendor_name: 'FinanzFrei Academy',
    description: 'Von Schulden zur finanziellen Freiheit - Budgetierung, Investieren, Vermögensaufbau leicht gemacht.',
    gravity_score: 88.7
  },
  {
    product_id: 'TEST005',
    product_name: 'Content Creator Bootcamp',
    product_url: 'https://www.digistore24.com/product/TEST005',
    category: 'Content Creation',
    commission_rate: 50.0,
    price: 597.00,
    vendor_name: 'Creator Hub',
    description: 'Werde erfolgreicher Content Creator - Video Produktion, Storytelling, Monetarisierung auf allen Plattformen.',
    gravity_score: 95.2
  },
  {
    product_id: 'TEST006',
    product_name: 'Gesundheit & Fitness Transformation',
    product_url: 'https://www.digistore24.com/product/TEST006',
    category: 'Gesundheit',
    commission_rate: 30.0,
    price: 147.00,
    vendor_name: 'FitLife Pro',
    description: '12-Wochen Transformationsprogramm mit Ernährungsplan, Workouts und persönlichem Coaching.',
    gravity_score: 81.4
  },
  {
    product_id: 'TEST007',
    product_name: 'E-Commerce Profitmaschine',
    product_url: 'https://www.digistore24.com/product/TEST007',
    category: 'E-Commerce',
    commission_rate: 40.0,
    price: 697.00,
    vendor_name: 'ShopSuccess',
    description: 'Eigenen Online-Shop aufbauen und skalieren - Shopify, Dropshipping, Produktrecherche, Marketing.',
    gravity_score: 89.6
  },
  {
    product_id: 'TEST008',
    product_name: 'Persönlichkeitsentwicklung Masterclass',
    product_url: 'https://www.digistore24.com/product/TEST008',
    category: 'Persönliche Entwicklung',
    commission_rate: 45.0,
    price: 247.00,
    vendor_name: 'MindGrowth Institute',
    description: 'Selbstbewusstsein aufbauen, Ziele erreichen, Gewohnheiten ändern - Komplettes Transformationssystem.',
    gravity_score: 86.1
  },
  {
    product_id: 'TEST009',
    product_name: 'YouTube Erfolgsformel',
    product_url: 'https://www.digistore24.com/product/TEST009',
    category: 'YouTube',
    commission_rate: 50.0,
    price: 497.00,
    vendor_name: 'TubeGrowth',
    description: 'Von 0 auf 100.000 Abonnenten - Kanal aufbauen, Videos optimieren, Monetarisierung maximieren.',
    gravity_score: 93.8
  },
  {
    product_id: 'TEST010',
    product_name: 'Krypto Investieren für Einsteiger',
    product_url: 'https://www.digistore24.com/product/TEST010',
    category: 'Kryptowährungen',
    commission_rate: 35.0,
    price: 197.00,
    vendor_name: 'CryptoAcademy',
    description: 'Sicher in Bitcoin, Ethereum & Altcoins investieren - Wallets, Exchanges, Strategien für Anfänger.',
    gravity_score: 77.5
  }
];

async function insertTestProducts() {
  console.log('🚀 Starting test product insertion via Supabase...\n');

  // Verwende ANON key - reicht für INSERT wenn RLS richtig konfiguriert
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Prüfe ob Tabelle existiert
    console.log('📋 Checking existing products...');
    const { data: existing, error: checkError } = await supabase
      .from('digistore_products')
      .select('product_id')
      .like('product_id', 'TEST%');

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('⚠️  Error checking existing products:', checkError.message);
      console.log('🔄 Trying with service role key if available...\n');
    }

    console.log(`📊 Found ${existing?.length || 0} existing test products\n`);

    // Lösche alte Test-Produkte
    if (existing && existing.length > 0) {
      console.log('🧹 Cleaning old test products...');
      const { error: deleteError } = await supabase
        .from('digistore_products')
        .delete()
        .like('product_id', 'TEST%');

      if (deleteError) {
        console.log('⚠️  Warning during cleanup:', deleteError.message);
      } else {
        console.log('✅ Old test products removed\n');
      }
    }

    // Füge neue Test-Produkte ein
    console.log('💾 Inserting new test products...\n');

    let inserted = 0;
    let failed = 0;

    for (const product of testProducts) {
      const { data, error } = await supabase
        .from('digistore_products')
        .insert([product])
        .select();

      if (error) {
        console.log(`❌ Failed: ${product.product_name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Inserted: ${product.product_name} (${product.category})`);
        inserted++;
      }
    }

    console.log(`\n🎉 Insertion complete!`);
    console.log(`   ✅ Success: ${inserted}`);
    console.log(`   ❌ Failed: ${failed}\n`);

    // Zeige Statistik
    const { data: stats, error: statsError } = await supabase
      .from('digistore_products')
      .select('*')
      .like('product_id', 'TEST%');

    if (!statsError && stats) {
      const avgCommission = stats.reduce((sum, p) => sum + parseFloat(p.commission_rate), 0) / stats.length;
      const avgPrice = stats.reduce((sum, p) => sum + parseFloat(p.price), 0) / stats.length;
      const avgGravity = stats.reduce((sum, p) => sum + parseFloat(p.gravity_score), 0) / stats.length;

      console.log('📊 Statistics:');
      console.log(`   Total Products: ${stats.length}`);
      console.log(`   Avg Commission: ${avgCommission.toFixed(2)}%`);
      console.log(`   Avg Price: €${avgPrice.toFixed(2)}`);
      console.log(`   Avg Gravity: ${avgGravity.toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
    console.error('   2. Check if digistore_products table exists');
    console.error('   3. Check RLS policies allow INSERT');
    process.exit(1);
  }
}

insertTestProducts();
