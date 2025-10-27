/**
 * Social Media Poster Agent
 * Postet automatisch auf Buffer und Ayrshare
 */

import fetch from 'node-fetch';

export class SocialMediaPoster {
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
      console.log('⚠️  Buffer Token nicht konfiguriert');
      return null;
    }

    if (this.postsThisMonth >= this.bufferLimit) {
      console.log('⚠️  Buffer Limit erreicht (20 Posts/Monat)');
      return null;
    }

    try {
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
      console.log('✅ Buffer Post erfolgreich:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Buffer Fehler:', error.message);
      return null;
    }
  }

  /**
   * Post zu Ayrshare (TikTok, Pinterest, YouTube, Reddit)
   */
  async postToAyrshare(content, platforms = ['tiktok', 'pinterest']) {
    if (!this.ayrshareKey) {
      console.log('⚠️  Ayrshare Key nicht konfiguriert');
      return null;
    }

    if (this.postsThisMonth >= this.ayrshareLimit) {
      console.log('⚠️  Ayrshare Limit erreicht (20 Posts/Monat)');
      return null;
    }

    try {
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
      console.log('✅ Ayrshare Post erfolgreich:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Ayrshare Fehler:', error.message);
      return null;
    }
  }

  /**
   * Smart Posting: Wählt besten Service basierend auf Limit
   */
  async smartPost(content, type = 'product_launch') {
    const bufferRemaining = this.bufferLimit - this.postsThisMonth;
    const ayrshareRemaining = this.ayrshareLimit - this.postsThisMonth;

    // Content-Type basierte Strategie
    const strategies = {
      'product_launch': {
        buffer: ['facebook', 'twitter', 'linkedin'],
        ayrshare: ['pinterest']
      },
      'viral_content': {
        buffer: ['twitter', 'facebook'],
        ayrshare: ['tiktok', 'pinterest']
      },
      'testimonial': {
        buffer: ['facebook', 'linkedin'],
        ayrshare: ['reddit']
      },
      'performance_update': {
        buffer: ['twitter', 'linkedin'],
        ayrshare: []
      }
    };

    const strategy = strategies[type] || strategies['product_launch'];
    const results = [];

    // Buffer Post
    if (bufferRemaining > 0 && strategy.buffer.length > 0) {
      const bufferResult = await this.postToBuffer(content);
      if (bufferResult) {
        results.push({ service: 'buffer', result: bufferResult });
      }
    }

    // Ayrshare Post
    if (ayrshareRemaining > 0 && strategy.ayrshare.length > 0) {
      const ayrshareResult = await this.postToAyrshare(content, strategy.ayrshare);
      if (ayrshareResult) {
        results.push({ service: 'ayrshare', result: ayrshareResult });
      }
    }

    return results;
  }

  /**
   * Generiere Social Media Post aus Produkt-Daten
   */
  generateProductPost(product, script) {
    const templates = [
      `🔥 NEU: ${product.name}

${script.hook}

💰 Commission: €${product.commission}
🎯 Nische: ${product.niche}

Link in Bio! 👆`,

      `💎 Entdeckt: ${product.name}

${script.hook}

✨ Das musst du sehen!
🔗 Jetzt mehr erfahren

#affiliate #passiveincome #${product.niche.replace(/ /g, '')}`,

      `⚡️ VIRAL: ${product.name}

${script.hook}

🚀 Starte noch heute!
💰 ${product.commission}€ pro Sale

Link in Bio 🔗`,
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
🎯 Conversion Rate: ${stats.conversionRate || 0}%
📈 Aktive Kampagnen: ${stats.activeCampaigns || 0}

System läuft im Autopilot! 🤖

#passiveincome #automation #affiliate`;
  }

  /**
   * Hauptfunktion: Post erstellen und publishen
   */
  async createAndPost(content, type = 'product_launch') {
    console.log(`\n📱 Erstelle Social Media Post (${type})...`);

    const results = await this.smartPost(content, type);

    if (results.length > 0) {
      console.log(`✅ Post auf ${results.length} Platform(en) veröffentlicht`);
      console.log(`📊 Verbleibend: Buffer ${this.bufferLimit - this.postsThisMonth} | Ayrshare ${this.ayrshareLimit - this.postsThisMonth}`);
      return true;
    } else {
      console.log('⚠️  Keine Posts veröffentlicht (Limits erreicht oder Fehler)');
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

// Test-Funktion
if (import.meta.url === `file://${process.argv[1]}`) {
  const poster = new SocialMediaPoster();

  const testContent = `🔥 NEU: Automatisiertes Passive Income System

Verdiene Geld während du schläfst! 💰

✅ Vollautomatisch
✅ KI-gesteuert
✅ Bewährt

Link in Bio! 👆

#passiveincome #automation #affiliate`;

  poster.createAndPost(testContent, 'product_launch').then(() => {
    console.log('\n✅ Social Media Test abgeschlossen');
  });
}
