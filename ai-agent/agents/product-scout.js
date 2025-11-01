#!/usr/bin/env node

/**
 * 🔍 PRODUCT SCOUT AGENT
 * Findet hochkonvertierende Produkte auf Digistore24
 *
 * Funktionen:
 * - Scrapet Digistore24 Marketplace
 * - Analysiert Conversion-Raten
 * - Identifiziert Trends
 * - Speichert Top-Produkte in Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class ProductScout {
  constructor() {
    this.foundProducts = [];
  }

  async scrapeDigistore24() {
    log('\n🔍 Scanning Digistore24 Marketplace...', 'cyan');

    // Digistore24 Kategorien mit hohen Conversions
    const categories = [
      'gesundheit-fitness',
      'geld-verdienen',
      'persoenlichkeitsentwicklung',
      'software-tools',
      'online-marketing',
    ];

    for (const category of categories) {
      log(`   📂 Category: ${category}`, 'blue');

      try {
        // Option 1: ScrapingBee (wenn API verfügbar)
        const products = await this.scrapeWithScrapingBee(category);

        // Option 2: Fallback - Manuelle Produktliste
        if (!products || products.length === 0) {
          const manualProducts = await this.getManualProductList(category);
          this.foundProducts.push(...manualProducts);
        } else {
          this.foundProducts.push(...products);
        }

      } catch (error) {
        log(`   ⚠️  Error in ${category}: ${error.message}`, 'yellow');
      }
    }

    log(`   ✅ Found ${this.foundProducts.length} products`, 'green');
    return this.foundProducts;
  }

  async scrapeWithScrapingBee(category) {
    const url = `https://www.digistore24.com/content/category/${category}`;
    const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=true`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Parse HTML (simplified - in production use cheerio or similar)
      // This is a placeholder - actual implementation would parse real data
      return this.parseDigistoreHTML(html, category);

    } catch (error) {
      log(`   ⚠️  ScrapingBee failed: ${error.message}`, 'yellow');
      return null;
    }
  }

  parseDigistoreHTML(html, category) {
    // Placeholder - in production, use proper HTML parsing
    // For now, return mock data structure
    return [];
  }

  async getManualProductList(category) {
    // Fallback: Manuelle High-Converting Produkte
    // Diese würdest du manuell pflegen oder aus deinen Claude.ai Projekten importieren

    const manualProducts = {
      'gesundheit-fitness': [
        {
          product_id: 'TEST006',
          product_name: 'Gesundheit & Fitness Transformation',
          product_url: 'https://www.digistore24.com/product/TEST006',
          category: 'gesundheit-fitness',
          commission_rate: 30,
          price: 147.00,
          vendor_name: 'FitLife Pro',
          description: '12-Wochen Transformationsprogramm mit Ernährungsplan, Workouts und persönlichem Coaching.',
          gravity_score: 81.4,
          conversion_score: 8.5,
          trend_score: 9.0,
          affiliate_link: 'https://www.digistore24.com/redir/TEST006',
        },
      ],
      'geld-verdienen': [
        {
          product_id: 'TEST002',
          product_name: 'Passives Einkommen System',
          product_url: 'https://www.digistore24.com/product/TEST002',
          category: 'geld-verdienen',
          commission_rate: 40,
          price: 297.00,
          vendor_name: 'Freiheit Digital',
          description: 'Schritt-für-Schritt Anleitung zum Aufbau passiver Einkommensströme mit Affiliate Marketing und digitalen Produkten.',
          gravity_score: 92.3,
          conversion_score: 9.2,
          trend_score: 8.8,
          affiliate_link: 'https://www.digistore24.com/redir/TEST002',
        },
        {
          product_id: 'TEST010',
          product_name: 'Krypto Investieren für Einsteiger',
          product_url: 'https://www.digistore24.com/product/TEST010',
          category: 'geld-verdienen',
          commission_rate: 35,
          price: 197.00,
          vendor_name: 'CryptoAcademy',
          description: 'Sicher in Bitcoin, Ethereum & Altcoins investieren - Wallets, Exchanges, Strategien für Anfänger.',
          gravity_score: 77.5,
          conversion_score: 8.0,
          trend_score: 8.5,
          affiliate_link: 'https://www.digistore24.com/redir/TEST010',
        },
      ],
      'persoenlichkeitsentwicklung': [
        {
          product_id: 'TEST008',
          product_name: 'Persönlichkeitsentwicklung Masterclass',
          product_url: 'https://www.digistore24.com/product/TEST008',
          category: 'persoenlichkeitsentwicklung',
          commission_rate: 45,
          price: 247.00,
          vendor_name: 'MindGrowth Institute',
          description: 'Selbstbewusstsein aufbauen, Ziele erreichen, Gewohnheiten ändern - Komplettes Transformationssystem.',
          gravity_score: 86.1,
          conversion_score: 8.8,
          trend_score: 7.9,
          affiliate_link: 'https://www.digistore24.com/redir/TEST008',
        },
      ],
      'software-tools': [
        {
          product_id: 'TEST003',
          product_name: 'Social Media Automation Bundle',
          product_url: 'https://www.digistore24.com/product/TEST003',
          category: 'software-tools',
          commission_rate: 45,
          price: 197.00,
          vendor_name: 'SocialBoost',
          description: 'Komplettes Tool-Set für automatisierte Social Media Posts auf TikTok, Instagram, YouTube und LinkedIn.',
          gravity_score: 78.9,
          conversion_score: 7.5,
          trend_score: 9.2,
          affiliate_link: 'https://www.digistore24.com/redir/TEST003',
        },
      ],
      'online-marketing': [
        {
          product_id: 'TEST001',
          product_name: 'AI Marketing Masterclass 2025',
          product_url: 'https://www.digistore24.com/product/TEST001',
          category: 'online-marketing',
          commission_rate: 50,
          price: 497.00,
          vendor_name: 'MarketingPro GmbH',
          description: 'Kompletter AI Marketing Kurs mit ChatGPT, Midjourney und Automationen. Perfekt für Anfänger und Fortgeschrittene.',
          gravity_score: 85.5,
          conversion_score: 9.0,
          trend_score: 9.5,
          affiliate_link: 'https://www.digistore24.com/redir/TEST001',
        },
        {
          product_id: 'TEST005',
          product_name: 'Content Creator Bootcamp',
          product_url: 'https://www.digistore24.com/product/TEST005',
          category: 'online-marketing',
          commission_rate: 50,
          price: 597.00,
          vendor_name: 'Creator Hub',
          description: 'Werde erfolgreicher Content Creator - Video Produktion, Storytelling, Monetarisierung auf allen Plattformen.',
          gravity_score: 95.2,
          conversion_score: 9.3,
          trend_score: 9.0,
          affiliate_link: 'https://www.digistore24.com/redir/TEST005',
        },
        {
          product_id: 'TEST009',
          product_name: 'YouTube Erfolgsformel',
          product_url: 'https://www.digistore24.com/product/TEST009',
          category: 'online-marketing',
          commission_rate: 50,
          price: 497.00,
          vendor_name: 'TubeGrowth',
          description: 'Von 0 auf 100.000 Abonnenten - Kanal aufbauen, Videos optimieren, Monetarisierung maximieren.',
          gravity_score: 93.8,
          conversion_score: 9.1,
          trend_score: 8.7,
          affiliate_link: 'https://www.digistore24.com/redir/TEST009',
        },
      ],
    };

    return manualProducts[category] || [];
  }

  async analyzeWithGemini(products) {
    log('\n🤖 Analyzing products with Gemini AI...', 'cyan');

    const prompt = `
Analysiere diese Digistore24 Produkte und bewerte sie für Affiliate-Marketing:

${JSON.stringify(products, null, 2)}

Bewerte jedes Produkt nach:
1. Conversion-Wahrscheinlichkeit (1-10)
2. Trend-Score (1-10)
3. Konkurrenz-Level (niedrig/mittel/hoch)
4. Zielgruppen-Match

Gib die Analyse als JSON zurück mit Empfehlungen.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error('Gemini API error');

      const data = await response.json();
      const analysis = data.candidates[0].content.parts[0].text;

      log('   ✅ AI analysis complete', 'green');
      return analysis;

    } catch (error) {
      log(`   ⚠️  Gemini analysis failed: ${error.message}`, 'yellow');
      return null;
    }
  }

  async saveToDatabase(products) {
    log('\n💾 Saving products to database...', 'cyan');

    let savedCount = 0;

    for (const product of products) {
      try {
        const { data, error } = await supabase
          .from('digistore_products')
          .upsert(product, { onConflict: 'product_id' });

        if (error) throw error;
        savedCount++;

      } catch (error) {
        log(`   ⚠️  Failed to save ${product.product_name}: ${error.message}`, 'yellow');
      }
    }

    log(`   ✅ Saved ${savedCount}/${products.length} products`, 'green');
  }

  async selectTopProducts(limit = 10) {
    log('\n⭐ Selecting top products for promotion...', 'cyan');

    // Score = (conversion_score * 0.6) + (trend_score * 0.3) + (commission_rate / 10 * 0.1)
    const topProducts = this.foundProducts
      .map(p => ({
        ...p,
        total_score: (p.conversion_score * 0.6) + (p.trend_score * 0.3) + (p.commission_rate / 10 * 0.1)
      }))
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);

    log(`   📊 Top ${topProducts.length} products selected`, 'green');

    topProducts.forEach((p, i) => {
      log(`   ${i + 1}. ${p.product_name} (Score: ${p.total_score.toFixed(2)})`, 'blue');
    });

    return topProducts;
  }
}

async function main() {
  const scout = new ProductScout();

  try {
    log('🚀 Product Scout Agent Starting...', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // 1. Scrape Digistore24
    await scout.scrapeDigistore24();

    // 2. AI Analysis
    if (scout.foundProducts.length > 0) {
      await scout.analyzeWithGemini(scout.foundProducts);
    }

    // 3. Select Top Products
    const topProducts = await scout.selectTopProducts(10);

    // 4. Save to Database
    if (topProducts.length > 0) {
      await scout.saveToDatabase(topProducts);
    }

    log('\n✅ Product Scout completed successfully!', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ProductScout };
