/**
 * Social Media Poster Agent (CommonJS)
 * Postet automatisch auf Buffer und Ayrshare
 */

class SocialMediaPoster {
  constructor() {
    this.bufferToken = process.env.BUFFER_ACCESS_TOKEN;
    this.ayrshareKey = process.env.AYRSHARE_API_KEY;
    this.postsThisMonth = 0;
    this.bufferLimit = 20;
    this.ayrshareLimit = 20;
  }

  /**
   * Post zu Buffer (Facebook, Twitter, LinkedIn, Instagram)
   */
  async postToBuffer(content, profileIds = []) {
    if (!this.bufferToken) {
      console.log('⚠️  Buffer Token nicht konfiguriert (Optional)');
      return null;
    }

    if (this.postsThisMonth >= this.bufferLimit) {
      console.log('⚠️  Buffer Limit erreicht (20 Posts/Monat)');
      return null;
    }

    try {
      // Dynamic import for fetch in CommonJS
      const fetch = (await import('node-fetch')).default;

      const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.bufferToken}`
        },
        body: JSON.stringify({
          text: content,
          profile_ids: profileIds,
          now: true
        })
      });

      if (!response.ok) {
        throw new Error(`Buffer API Error: ${response.status}`);
      }

      const data = await response.json();
      this.postsThisMonth++;
      console.log('   ✅ Buffer Post erfolgreich:', data.id);
      return data;
    } catch (error) {
      console.error('   ⚠️  Buffer Fehler:', error.message);
      return null;
    }
  }

  /**
   * Post zu Ayrshare (TikTok, Pinterest, YouTube, Reddit)
   */
  async postToAyrshare(content, platforms = ['pinterest']) {
    if (!this.ayrshareKey) {
      console.log('⚠️  Ayrshare Key nicht konfiguriert (Optional)');
      return null;
    }

    if (this.postsThisMonth >= this.ayrshareLimit) {
      console.log('⚠️  Ayrshare Limit erreicht (20 Posts/Monat)');
      return null;
    }

    try {
      // Dynamic import for fetch in CommonJS
      const fetch = (await import('node-fetch')).default;

      const response = await fetch('https://app.ayrshare.com/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ayrshareKey}`
        },
        body: JSON.stringify({
          post: content,
          platforms: platforms
        })
      });

      if (!response.ok) {
        throw new Error(`Ayrshare API Error: ${response.status}`);
      }

      const data = await response.json();
      this.postsThisMonth++;
      console.log('   ✅ Ayrshare Post erfolgreich:', data.id);
      return data;
    } catch (error) {
      console.error('   ⚠️  Ayrshare Fehler:', error.message);
      return null;
    }
  }

  /**
   * Smart Posting: Wählt besten Service basierend auf Limit
   */
  async smartPost(content, type = 'product_launch') {
    const results = [];

    // Nur posten wenn APIs konfiguriert sind
    if (this.bufferToken || this.ayrshareKey) {
      console.log('   📱 Poste auf Social Media...');

      // Buffer Post (bevorzugt für Facebook, Twitter, LinkedIn)
      if (this.bufferToken && this.postsThisMonth < this.bufferLimit) {
        const bufferResult = await this.postToBuffer(content);
        if (bufferResult) {
          results.push({ service: 'buffer', result: bufferResult });
        }
      }

      // Ayrshare Post (für TikTok, Pinterest, etc.)
      if (this.ayrshareKey && this.postsThisMonth < this.ayrshareLimit) {
        const ayrshareResult = await this.postToAyrshare(content, ['pinterest']);
        if (ayrshareResult) {
          results.push({ service: 'ayrshare', result: ayrshareResult });
        }
      }
    }

    return results;
  }

  /**
   * Generiere Social Media Post aus Produkt-Daten
   */
  generateProductPost(product, scriptHook = null) {
    const hook = scriptHook || `Neu entdeckt: ${product.name || product.product_name}!`;

    const templates = [
      `🔥 NEU: ${product.name || product.product_name}

${hook}

💰 Commission: €${product.commission}
🎯 Nische: ${product.niche}

Link in Bio! 👆`,

      `💎 ${product.name || product.product_name}

${hook}

✨ Das musst du sehen!
🔗 Jetzt mehr erfahren

#affiliate #passiveincome #${(product.niche || '').replace(/ /g, '')}`,

      `⚡️ VIRAL: ${product.name || product.product_name}

${hook}

🚀 Starte noch heute!
💰 €${product.commission} pro Sale

#affiliate #makemoneyonline`,
    ];

    // Zufälligen Template wählen
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generiere Performance Post
   */
  generatePerformancePost(stats) {
    return `📊 PERFORMANCE UPDATE

💰 Umsatz heute: €${stats.revenue || 0}
🎯 Conversion Rate: ${(stats.conversionRate || 0).toFixed(1)}%
📈 Aktive Kampagnen: ${stats.activeCampaigns || 0}

System läuft im Autopilot! 🤖

#passiveincome #automation #affiliate`;
  }

  /**
   * Hauptfunktion: Post erstellen und publishen
   */
  async createAndPost(content, type = 'product_launch') {
    const results = await this.smartPost(content, type);

    if (results.length > 0) {
      console.log(`   ✅ Post auf ${results.length} Platform(en) veröffentlicht`);
      console.log(`   📊 Verbleibend: ${this.bufferLimit + this.ayrshareLimit - this.postsThisMonth} Posts`);
      return true;
    } else {
      // Keine Fehler wenn APIs nicht konfiguriert
      return false;
    }
  }

  /**
   * Monatliches Limit zurücksetzen (am 1. des Monats)
   */
  resetMonthlyLimits() {
    this.postsThisMonth = 0;
    console.log('✅ Social Media Limits zurückgesetzt');
  }
}

module.exports = { SocialMediaPoster };
