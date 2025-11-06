#!/usr/bin/env node

/**
 * 🏪 DIGISTORE24 API INTEGRATION
 * Vollständige Integration mit Digistore24 Marketplace
 *
 * Funktionen:
 * - Produktsuche und -analyse
 * - Affiliate-Link Generierung
 * - Sales-Tracking
 * - Eigene Produkte hochladen
 */

require('dotenv').config({ path: '.env.local' });

// ✅ PRODUCTION: Retry logic + timeout handling
const { fetchWithRetry } = require('../utils/api-helper');

const DIGISTORE24_API_KEY = process.env.DIGISTORE24_API_KEY;
const API_BASE_URL = 'https://www.digistore24.com/api/call';

class Digistore24Client {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async makeRequest(method, params = {}) {
    const requestData = {
      api_key: this.apiKey,
      method: method,
      ...params,
    };

    try {
      // ✅ Use fetchWithRetry with exponential backoff
      const response = await fetchWithRetry(
        API_BASE_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
        {
          maxRetries: 3,
          timeoutMs: 15000, // 15s timeout for API calls
          initialDelayMs: 1000,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `⚠️  Digistore24 API retry (${attempt}/${maxRetries}): ${error.message}. ` +
              `Waiting ${delay}ms...`
            );
          },
        }
      );

      const data = await response.json();

      if (data.result !== 'success') {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;

    } catch (error) {
      console.error(`❌ Digistore24 API Error: ${error.message}`);
      throw error;
    }
  }

  // ===== MARKETPLACE FUNCTIONS =====

  /**
   * Sucht nach Produkten im Marketplace
   */
  async searchProducts(query = '', category = '', limit = 50) {
    return await this.makeRequest('listProducts', {
      search: query,
      category: category,
      limit: limit,
      order_by: 'sales', // Top-Seller zuerst
    });
  }

  /**
   * Holt Details zu einem spezifischen Produkt
   */
  async getProductDetails(productId) {
    return await this.makeRequest('getProduct', {
      product_id: productId,
    });
  }

  /**
   * Holt Statistiken eines Produkts (Conversion-Rate, etc.)
   */
  async getProductStats(productId) {
    return await this.makeRequest('getProductStats', {
      product_id: productId,
    });
  }

  // ===== AFFILIATE FUNCTIONS =====

  /**
   * Generiert Affiliate-Link für ein Produkt
   */
  async generateAffiliateLink(productId, trackingId = '') {
    const affiliateId = this.apiKey.split('-')[0]; // Erste Teil des API-Keys ist meist die ID

    let link = `https://www.digistore24.com/redir/${productId}/${affiliateId}`;

    if (trackingId) {
      link += `/${trackingId}`;
    }

    return link;
  }

  /**
   * Trackt Affiliate-Sales
   */
  async getAffiliateSales(startDate, endDate) {
    return await this.makeRequest('getAffiliateSales', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Holt Affiliate-Kommissionen
   */
  async getCommissions(startDate, endDate) {
    return await this.makeRequest('getCommissions', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  // ===== VENDOR FUNCTIONS (für eigene Produkte) =====

  /**
   * Erstellt ein neues Produkt
   */
  async createProduct(productData) {
    return await this.makeRequest('createProduct', {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      commission_rate: productData.commissionRate || 50,
      category: productData.category,
      delivery_type: productData.deliveryType || 'digital',
      ...productData,
    });
  }

  /**
   * Updated ein existierendes Produkt
   */
  async updateProduct(productId, updates) {
    return await this.makeRequest('updateProduct', {
      product_id: productId,
      ...updates,
    });
  }

  /**
   * Holt eigene Produkt-Performance
   */
  async getVendorStats(productId) {
    return await this.makeRequest('getVendorStats', {
      product_id: productId,
    });
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Analysiert Produkte und gibt Empfehlungen
   */
  async analyzeProductsForAffiliate(category = '') {
    const products = await this.searchProducts('', category, 100);

    // Bewerte Produkte nach Conversion-Potential
    // ✅ PRODUCTION: Use Promise.allSettled to prevent batch failure
    const results = await Promise.allSettled(
      products.map(async (product) => {
        try {
          const stats = await this.getProductStats(product.product_id);

          return {
            ...product,
            conversion_rate: stats.conversion_rate || 0,
            earnings_per_click: stats.epc || 0,
            affiliate_link: await this.generateAffiliateLink(product.product_id),
            score: this.calculateProductScore(product, stats),
          };
        } catch (err) {
          // Wenn Stats nicht verfügbar, nur Basis-Daten
          return {
            ...product,
            score: this.calculateProductScore(product, {}),
          };
        }
      })
    );

    // Extract successful results and log any failures
    const analyzed = results
      .filter(result => {
        if (result.status === 'rejected') {
          console.warn(`⚠️  Product analysis failed: ${result.reason?.message || result.reason}`);
          return false;
        }
        return true;
      })
      .map(result => result.value);

    // Sortiere nach Score
    return analyzed.sort((a, b) => b.score - a.score);
  }

  /**
   * Berechnet Produkt-Score für Affiliate-Empfehlung
   */
  calculateProductScore(product, stats) {
    let score = 0;

    // Commission-Rate (max 50 Punkte)
    score += (product.commission_rate || 30) / 2;

    // Conversion-Rate (max 30 Punkte)
    if (stats.conversion_rate) {
      score += Math.min(stats.conversion_rate * 10, 30);
    }

    // EPC - Earnings per Click (max 20 Punkte)
    if (stats.epc) {
      score += Math.min(stats.epc, 20);
    }

    return score;
  }

  /**
   * Generiert AI-optimiertes Produkt für eigenen Verkauf
   */
  async generateAndUploadProduct(niche, geminiApiKey) {
    console.log(`🤖 Generating product for niche: ${niche}...`);

    // 1. Research mit Gemini
    const productIdea = await this.researchProductIdea(niche, geminiApiKey);

    // 2. Content-Generierung
    const content = await this.generateProductContent(productIdea, geminiApiKey);

    // 3. Upload zu Digistore24
    const product = await this.createProduct({
      name: content.title,
      description: content.description,
      price: content.price,
      commissionRate: 50,
      category: niche,
      deliveryType: 'digital',
    });

    console.log(`✅ Product created: ${product.product_id}`);
    return product;
  }

  async researchProductIdea(niche, geminiApiKey) {
    const prompt = `
Du bist ein Experte für digitale Produktentwicklung.

Niche: ${niche}

Finde eine profitable Produkt-Idee die:
1. Ein spezifisches Problem löst
2. Als digitales Produkt lieferbar ist (E-Book, Kurs, Template)
3. Hohe Nachfrage hat
4. Wenig Konkurrenz

Gib zurück als JSON:
{
  "title": "Produktname",
  "problem": "Welches Problem löst es",
  "target_audience": "Zielgruppe",
  "content_type": "ebook/course/template",
  "price_range": "19-49 EUR"
}
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Could not parse Gemini response');

    } catch (error) {
      console.error('Gemini research failed:', error.message);
      return null;
    }
  }

  async generateProductContent(idea, geminiApiKey) {
    const prompt = `
Erstelle vollständigen Sales-Content für dieses Produkt:

${JSON.stringify(idea, null, 2)}

Gib zurück als JSON:
{
  "title": "Finaler Produktname",
  "description": "Verkaufsbeschreibung (200 Wörter)",
  "sales_page": "Komplette Sales-Page HTML",
  "price": 27,
  "bullet_points": ["Vorteil 1", "Vorteil 2", ...]
}
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Could not parse Gemini response');

    } catch (error) {
      console.error('Content generation failed:', error.message);
      return null;
    }
  }
}

// ===== EXPORT =====

module.exports = { Digistore24Client };

// ===== CLI USAGE =====

if (require.main === module) {
  const client = new Digistore24Client(DIGISTORE24_API_KEY);

  async function demo() {
    console.log('🏪 Digistore24 Integration Demo\n');

    // Demo: Produkte analysieren
    console.log('Analyzing top products in "geld-verdienen" category...\n');

    try {
      const topProducts = await client.analyzeProductsForAffiliate('geld-verdienen');

      console.log(`Found ${topProducts.length} products\n`);
      console.log('Top 5:');

      topProducts.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name || p.product_id}`);
        console.log(`   Score: ${p.score?.toFixed(2) || 'N/A'}`);
        console.log(`   Commission: ${p.commission_rate || 'N/A'}%`);
        console.log(`   Link: ${p.affiliate_link || 'N/A'}\n`);
      });

    } catch (error) {
      console.error('Demo failed:', error.message);
    }
  }

  demo();
}
