#!/usr/bin/env node

/**
 * INSERT TEST PRODUCTS INTO DIGISTORE_PRODUCTS TABLE
 * Fügt manuelle Test-Produkte für Content-Generierung ein
 */

import pkg from 'pg';
const { Client } = pkg;

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
    gravity_score: 85.5,
    last_updated: new Date().toISOString()
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
    gravity_score: 92.3,
    last_updated: new Date().toISOString()
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
    gravity_score: 78.9,
    last_updated: new Date().toISOString()
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
    gravity_score: 88.7,
    last_updated: new Date().toISOString()
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
    gravity_score: 95.2,
    last_updated: new Date().toISOString()
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
    gravity_score: 81.4,
    last_updated: new Date().toISOString()
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
    gravity_score: 89.6,
    last_updated: new Date().toISOString()
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
    gravity_score: 86.1,
    last_updated: new Date().toISOString()
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
    gravity_score: 93.8,
    last_updated: new Date().toISOString()
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
    gravity_score: 77.5,
    last_updated: new Date().toISOString()
  }
];

async function insertTestProducts() {
  console.log('🚀 Starting test product insertion...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Erstelle Tabelle falls nicht existiert
    await client.query(`
      CREATE TABLE IF NOT EXISTS digistore_products (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        product_url TEXT,
        category TEXT,
        commission_rate DECIMAL(5,2),
        price DECIMAL(10,2),
        vendor_name TEXT,
        description TEXT,
        gravity_score DECIMAL(5,2),
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table digistore_products ready\n');

    // Lösche alte Test-Produkte
    await client.query(`DELETE FROM digistore_products WHERE product_id LIKE 'TEST%'`);
    console.log('🧹 Cleaned old test products\n');

    // Füge neue Test-Produkte ein
    let inserted = 0;
    for (const product of testProducts) {
      await client.query(`
        INSERT INTO digistore_products (
          product_id, product_name, product_url, category,
          commission_rate, price, vendor_name, description,
          gravity_score, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        product.product_id,
        product.product_name,
        product.product_url,
        product.category,
        product.commission_rate,
        product.price,
        product.vendor_name,
        product.description,
        product.gravity_score,
        product.last_updated
      ]);

      console.log(`✅ Inserted: ${product.product_name} (${product.category})`);
      inserted++;
    }

    console.log(`\n🎉 Successfully inserted ${inserted} test products!\n`);

    // Zeige Statistik
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        AVG(commission_rate) as avg_commission,
        AVG(price) as avg_price,
        AVG(gravity_score) as avg_gravity
      FROM digistore_products
      WHERE product_id LIKE 'TEST%'
    `);

    console.log('📊 Statistics:');
    console.log(`   Total Products: ${stats.rows[0].total}`);
    console.log(`   Avg Commission: ${parseFloat(stats.rows[0].avg_commission).toFixed(2)}%`);
    console.log(`   Avg Price: €${parseFloat(stats.rows[0].avg_price).toFixed(2)}`);
    console.log(`   Avg Gravity: ${parseFloat(stats.rows[0].avg_gravity).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

insertTestProducts();
