#!/usr/bin/env node

/**
 * 🚀 PRODUCT IMPORTER
 * Importiert deine 15 Affiliate-Links in das System
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Deine 15 Affiliate-Links
const affiliateProducts = [
  // Checkout-DS24
  {
    product_id: 'ds24-580935',
    product_name: 'Produkt 580935 (Checkout-DS24)',
    category: 'online-marketing',
    affiliate_link: 'https://www.checkout-ds24.com/redir/580935/Samarkande/',
    commission_rate: 40,
    conversion_score: 7.5,
    trend_score: 8.0,
    source: 'checkout-ds24',
  },
  {
    product_id: 'ds24-580934',
    product_name: 'Produkt 580934 (Checkout-DS24)',
    category: 'online-marketing',
    affiliate_link: 'https://www.checkout-ds24.com/redir/580934/Samarkande/',
    commission_rate: 40,
    conversion_score: 7.5,
    trend_score: 8.0,
    source: 'checkout-ds24',
  },
  {
    product_id: 'ds24-547379',
    product_name: 'Produkt 547379 (Checkout-DS24)',
    category: 'online-marketing',
    affiliate_link: 'https://www.checkout-ds24.com/redir/547379/Samarkande/',
    commission_rate: 40,
    conversion_score: 7.5,
    trend_score: 8.0,
    source: 'checkout-ds24',
  },

  // Marketing365.online
  {
    product_id: 'marketing365-affiliate-secrets',
    product_name: 'Affiliate Secrets Blackbook',
    category: 'online-marketing',
    affiliate_link: 'https://marketing365.online/affiliate-secrets-blackbook/#aff=Samarkande',
    commission_rate: 50,
    conversion_score: 9.0,
    trend_score: 8.5,
    source: 'marketing365',
  },
  {
    product_id: 'marketing365-monster-traffic',
    product_name: 'Monster Traffic Strategien',
    category: 'online-marketing',
    affiliate_link: 'https://marketing365.online/monster-traffic-strategien/#aff=Samarkande',
    commission_rate: 50,
    conversion_score: 8.5,
    trend_score: 8.0,
    source: 'marketing365',
  },
  {
    product_id: 'marketing365-wordpress',
    product_name: 'Das WordPress Kompendium',
    category: 'software-tools',
    affiliate_link: 'https://marketing365.online/das-wordpress-kompendium/#aff=Samarkande',
    commission_rate: 50,
    conversion_score: 7.0,
    trend_score: 7.5,
    source: 'marketing365',
  },
  {
    product_id: 'marketing365-webseiten',
    product_name: 'Webseiten Komplettpaket',
    category: 'software-tools',
    affiliate_link: 'https://marketing365.online/webseiten-komplettpaket/#aff=Samarkande',
    commission_rate: 50,
    conversion_score: 7.5,
    trend_score: 7.0,
    source: 'marketing365',
  },
  {
    product_id: 'marketing365-email-vorlagen',
    product_name: '42 Monster Email-Vorlagen',
    category: 'online-marketing',
    affiliate_link: 'https://marketing365.online/42-monster-email-vorlagen/#aff=Samarkande',
    commission_rate: 50,
    conversion_score: 8.0,
    trend_score: 7.5,
    source: 'marketing365',
  },

  // Digistore24
  {
    product_id: 'digistore-411008',
    product_name: 'Produkt 411008 (Digistore24)',
    category: 'geld-verdienen',
    affiliate_link: 'https://www.digistore24.com/redir/411008/Samarkande/',
    commission_rate: 45,
    conversion_score: 8.0,
    trend_score: 8.5,
    source: 'digistore24',
  },
  {
    product_id: 'digistore-526734',
    product_name: 'Produkt 526734 (Digistore24)',
    category: 'geld-verdienen',
    affiliate_link: 'https://www.digistore24.com/redir/526734/Samarkande/',
    commission_rate: 45,
    conversion_score: 8.0,
    trend_score: 8.5,
    source: 'digistore24',
  },
  {
    product_id: 'digistore-528678',
    product_name: 'Produkt 528678 (Digistore24)',
    category: 'geld-verdienen',
    affiliate_link: 'https://www.digistore24.com/redir/528678/Samarkande/',
    commission_rate: 45,
    conversion_score: 8.0,
    trend_score: 8.5,
    source: 'digistore24',
  },
  {
    product_id: 'digistore-355316',
    product_name: 'Produkt 355316 (Digistore24)',
    category: 'geld-verdienen',
    affiliate_link: 'https://www.digistore24.com/redir/355316/Samarkande/',
    commission_rate: 45,
    conversion_score: 8.0,
    trend_score: 8.5,
    source: 'digistore24',
  },

  // Andere Quellen
  {
    product_id: '60daydream-abnehmen',
    product_name: 'Abnehmen ohne Diät',
    category: 'gesundheit-fitness',
    affiliate_link: 'https://produkte.60daydreambody.com/abnehmenohnediaet/#aff=Samarkande',
    commission_rate: 40,
    conversion_score: 9.0,
    trend_score: 9.0,
    source: '60daydreambody',
  },
  {
    product_id: 'claudia-caldwell',
    product_name: 'Claudia Caldwell Angebot',
    category: 'gesundheit-fitness',
    affiliate_link: 'https://www.claudiacaldwell.com/oto-uf61a?el=splittest-1214-bradflow-control#aff=Samarkande',
    commission_rate: 40,
    conversion_score: 8.5,
    trend_score: 8.0,
    source: 'claudiacaldwell',
  },
  {
    product_id: 'sharedeals-rohstoffe',
    product_name: 'Reich mit Rohstoffen',
    category: 'finanzen',
    affiliate_link: 'https://www.sharedeals.de/reich_mit_rohstoffen_geschenk/#aff=Samarkande',
    commission_rate: 35,
    conversion_score: 7.0,
    trend_score: 7.5,
    source: 'sharedeals',
  },
];

async function importProducts() {
  console.log('\n🚀 Importiere deine 15 Affiliate-Produkte...\n');
  console.log('━'.repeat(70));

  let successCount = 0;
  let errorCount = 0;

  for (const product of affiliateProducts) {
    try {
      const { data, error } = await supabase
        .from('digistore_products')
        .upsert(product, { onConflict: 'product_id' });

      if (error) throw error;

      console.log(`✅ ${product.product_name}`);
      console.log(`   🔗 ${product.affiliate_link.substring(0, 60)}...`);
      console.log(`   💰 Commission: ${product.commission_rate}%`);
      console.log(`   📊 Score: ${product.conversion_score}/10\n`);

      successCount++;

    } catch (error) {
      console.log(`❌ Fehler bei ${product.product_name}: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('━'.repeat(70));
  console.log(`\n✅ Import abgeschlossen!`);
  console.log(`   Erfolgreich: ${successCount}/${affiliateProducts.length}`);
  if (errorCount > 0) {
    console.log(`   ⚠️  Fehler: ${errorCount}`);
  }
  console.log('');
}

async function analyzeTopProducts() {
  console.log('\n📊 TOP 5 PRODUKTE nach Conversion-Score:\n');
  console.log('━'.repeat(70));

  try {
    const { data: products, error } = await supabase
      .from('digistore_products')
      .select('*')
      .order('conversion_score', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (products && products.length > 0) {
      products.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.product_name}`);
        console.log(`   📈 Conversion: ${p.conversion_score}/10`);
        console.log(`   📊 Trend: ${p.trend_score}/10`);
        console.log(`   💰 Commission: ${p.commission_rate}%`);
        console.log(`   🎯 Kategorie: ${p.category}`);
      });

      console.log('\n' + '━'.repeat(70));
      console.log('\n🎯 EMPFEHLUNG: Starte mit diesen Top 5 Produkten!\n');

    } else {
      console.log('⚠️  Keine Produkte gefunden');
    }

  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║          🚀 AFFILIATE PRODUCT IMPORTER                       ║');
  console.log('║          15 Links → Datenbank                                ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await importProducts();
  await analyzeTopProducts();

  console.log('\n🎉 Bereit für Content-Generierung & Funnel-Erstellung!\n');
  console.log('Nächste Schritte:');
  console.log('  1. node ai-agent/MASTER_ORCHESTRATOR.js  → Starte Automation');
  console.log('  2. Videos & Funnels werden automatisch erstellt');
  console.log('  3. Passives Einkommen läuft! 💰\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n💥 Error:', err.message);
    process.exit(1);
  });
}

module.exports = { affiliateProducts, importProducts };
