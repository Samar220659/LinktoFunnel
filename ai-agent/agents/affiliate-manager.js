#!/usr/bin/env node

/**
 * 💰 AFFILIATE LINK MANAGER
 *
 * Intelligentes Management von Digistore24 Affiliate Links:
 * - Nischen-basierte Link-Auswahl
 * - Performance-Tracking
 * - Automatische Optimierung
 * - Smart Rotation
 */

const fs = require('fs');
const path = require('path');

class AffiliateManager {
  constructor() {
    this.linksFile = path.join(__dirname, '../../affiliate-links.json');
    this.performanceFile = path.join(__dirname, '../../data/affiliate-performance.json');
    this.data = null;

    this.load();
  }

  /**
   * Lädt Affiliate Links aus JSON
   */
  load() {
    try {
      const content = fs.readFileSync(this.linksFile, 'utf8');
      this.data = JSON.parse(content);
    } catch (error) {
      console.error('Fehler beim Laden der Affiliate Links:', error);
      this.data = { digistore24: { links: [] } };
    }
  }

  /**
   * Speichert aktualisierte Daten
   */
  save() {
    try {
      fs.writeFileSync(this.linksFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  /**
   * Wählt optimalen Affiliate Link basierend auf Nische
   */
  selectLink(niche, platform = 'generic') {
    const links = this.data.digistore24.links.filter(l => l.enabled);

    if (links.length === 0) {
      return this.data.digistore24.fallback;
    }

    // Phase 1: Test Phase - Rotiere durch alle Links gleichmäßig
    if (this.data.digistore24.strategy.testPhase.enabled) {
      const needsTesting = links.filter(l =>
        l.performance.clicks < this.data.digistore24.strategy.testPhase.clicks
      );

      if (needsTesting.length > 0) {
        // Wähle Link mit wenigsten Klicks (Equal Distribution)
        const sorted = needsTesting.sort((a, b) =>
          a.performance.clicks - b.performance.clicks
        );
        return this.formatLink(sorted[0], platform);
      }
    }

    // Phase 2: Nischen-Match
    if (this.data.digistore24.strategy.nicheMatching.enabled) {
      const nicheMatches = links.filter(l =>
        l.niche.toLowerCase().includes(niche.toLowerCase()) ||
        niche.toLowerCase().includes(l.niche.toLowerCase())
      );

      if (nicheMatches.length > 0) {
        // Wähle besten Performer in dieser Nische
        const sorted = nicheMatches.sort((a, b) =>
          b.performance.conversionRate - a.performance.conversionRate ||
          b.performance.conversions - a.performance.conversions
        );
        return this.formatLink(sorted[0], platform);
      }
    }

    // Phase 3: Price Optimization - Start mit Low-Ticket
    if (this.data.digistore24.strategy.priceOptimization.enabled) {
      if (this.data.digistore24.strategy.priceOptimization.strategy === 'start_low_ticket') {
        const lowTicket = links.filter(l => l.price < 100);

        if (lowTicket.length > 0) {
          const sorted = lowTicket.sort((a, b) =>
            b.performance.conversionRate - a.performance.conversionRate
          );
          return this.formatLink(sorted[0], platform);
        }
      }
    }

    // Phase 4: Best Overall Performer
    const sorted = links.sort((a, b) => {
      // Sortiere nach: Conversion Rate > Revenue > Conversions
      if (b.performance.conversionRate !== a.performance.conversionRate) {
        return b.performance.conversionRate - a.performance.conversionRate;
      }
      if (b.performance.revenue !== a.performance.revenue) {
        return b.performance.revenue - a.performance.revenue;
      }
      return b.performance.conversions - a.performance.conversions;
    });

    return this.formatLink(sorted[0], platform);
  }

  /**
   * Formatiert Link mit UTM Parameters
   */
  formatLink(linkData, platform) {
    let url = linkData.url;

    // Add UTM Parameters
    if (this.data.tracking.enabled) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}utm_source=${this.data.tracking.utmSource}`;
      url += `&utm_medium=${this.data.tracking.utmMedium}`;

      if (this.data.tracking.platforms[platform]) {
        url += `&${this.data.tracking.platforms[platform]}`;
      }

      url += `&utm_content=${linkData.id}`;
    }

    return {
      id: linkData.id,
      url: url,
      name: linkData.name,
      niche: linkData.niche,
      commission: linkData.commission,
      price: linkData.price,
      category: linkData.category,
    };
  }

  /**
   * Tracked einen Klick
   */
  trackClick(linkId) {
    const link = this.findLinkById(linkId);
    if (link) {
      link.performance.clicks++;
      this.save();
      this.logPerformance('click', linkId);
    }
  }

  /**
   * Tracked eine Conversion
   */
  trackConversion(linkId, amount) {
    const link = this.findLinkById(linkId);
    if (link) {
      link.performance.conversions++;
      link.performance.revenue += amount;
      link.performance.conversionRate =
        (link.performance.conversions / link.performance.clicks * 100).toFixed(2);

      this.save();
      this.logPerformance('conversion', linkId, amount);
    }
  }

  /**
   * Findet Link by ID
   */
  findLinkById(linkId) {
    return this.data.digistore24.links.find(l => l.id === linkId);
  }

  /**
   * Loggt Performance für Analytics
   */
  logPerformance(event, linkId, amount = 0) {
    try {
      let performance = [];

      if (fs.existsSync(this.performanceFile)) {
        performance = JSON.parse(fs.readFileSync(this.performanceFile, 'utf8'));
      }

      performance.push({
        timestamp: new Date().toISOString(),
        event: event,
        linkId: linkId,
        amount: amount,
      });

      // Erstelle Verzeichnis falls nötig
      const dir = path.dirname(this.performanceFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.performanceFile, JSON.stringify(performance, null, 2));
    } catch (error) {
      console.error('Performance Logging Error:', error);
    }
  }

  /**
   * Zeigt Performance Report
   */
  getPerformanceReport() {
    const links = this.data.digistore24.links;

    // Sortiere nach Revenue
    const sorted = [...links].sort((a, b) =>
      b.performance.revenue - a.performance.revenue
    );

    const report = {
      totalClicks: links.reduce((sum, l) => sum + l.performance.clicks, 0),
      totalConversions: links.reduce((sum, l) => sum + l.performance.conversions, 0),
      totalRevenue: links.reduce((sum, l) => sum + l.performance.revenue, 0),
      averageConversionRate: 0,
      topPerformers: sorted.slice(0, 5).map(l => ({
        name: l.name,
        niche: l.niche,
        clicks: l.performance.clicks,
        conversions: l.performance.conversions,
        revenue: l.performance.revenue,
        conversionRate: l.performance.conversionRate + '%',
      })),
      needsTesting: links.filter(l =>
        l.performance.clicks < this.data.digistore24.strategy.testPhase.clicks
      ).length,
    };

    if (report.totalClicks > 0) {
      report.averageConversionRate =
        (report.totalConversions / report.totalClicks * 100).toFixed(2) + '%';
    }

    return report;
  }

  /**
   * Optimiert Links basierend auf Performance
   */
  optimize() {
    const report = this.getPerformanceReport();

    console.log('\n💰 AFFILIATE OPTIMIZATION\n');
    console.log('Total Clicks:', report.totalClicks);
    console.log('Total Conversions:', report.totalConversions);
    console.log('Total Revenue: €' + report.totalRevenue);
    console.log('Avg Conversion Rate:', report.averageConversionRate);
    console.log('');

    // Disable schlechte Performer (nach Test-Phase)
    const tested = this.data.digistore24.links.filter(l =>
      l.performance.clicks >= this.data.digistore24.strategy.testPhase.clicks
    );

    tested.forEach(link => {
      // Disable wenn Conversion Rate < 0.5% nach 100 Klicks
      if (link.performance.conversionRate < 0.5 && link.performance.clicks >= 100) {
        console.log(`⚠️  Disabling low performer: ${link.name} (${link.performance.conversionRate}%)`);
        link.enabled = false;
      }
    });

    this.save();

    console.log('\n✅ Optimization abgeschlossen');
    return report;
  }

  /**
   * Fügt deine echten Digistore24 Links hinzu
   */
  addYourLinks(links) {
    console.log('📝 Füge deine Affiliate Links hinzu...\n');

    links.forEach((link, index) => {
      if (this.data.digistore24.links[index]) {
        this.data.digistore24.links[index].url = link.url;
        this.data.digistore24.links[index].name = link.name || `Produkt ${index + 1}`;
        this.data.digistore24.links[index].niche = link.niche || 'Online Geld verdienen';
        this.data.digistore24.links[index].commission = link.commission || 50;
        this.data.digistore24.links[index].price = link.price || 97;
        this.data.digistore24.links[index].category = link.category || 'courses';

        console.log(`✅ Link ${index + 1} aktualisiert: ${link.name}`);
      }
    });

    this.data.lastUpdated = new Date().toISOString();
    this.save();

    console.log(`\n✅ ${links.length} Links erfolgreich hinzugefügt!`);
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new AffiliateManager();

  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'select':
      const niche = args[1] || 'Online Geld verdienen';
      const platform = args[2] || 'tiktok';
      const link = manager.selectLink(niche, platform);
      console.log('\n💰 Ausgewählter Affiliate Link:\n');
      console.log('Name:', link.name);
      console.log('Niche:', link.niche);
      console.log('URL:', link.url);
      console.log('Commission: €' + link.commission);
      console.log('Price: €' + link.price);
      break;

    case 'report':
      const report = manager.getPerformanceReport();
      console.log('\n📊 AFFILIATE PERFORMANCE REPORT\n');
      console.log('═'.repeat(70));
      console.log('Total Clicks:', report.totalClicks);
      console.log('Total Conversions:', report.totalConversions);
      console.log('Total Revenue: €' + report.totalRevenue);
      console.log('Avg Conversion Rate:', report.averageConversionRate);
      console.log('Links Need Testing:', report.needsTesting);
      console.log('\n🏆 TOP 5 PERFORMERS:\n');
      report.topPerformers.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.niche})`);
        console.log(`   Clicks: ${p.clicks} | Conversions: ${p.conversions} | Revenue: €${p.revenue}`);
        console.log(`   Conversion Rate: ${p.conversionRate}\n`);
      });
      break;

    case 'optimize':
      manager.optimize();
      break;

    case 'test':
      console.log('\n🧪 TEST MODE - Zeige Link-Auswahl für verschiedene Nischen:\n');
      const niches = [
        'Online Geld verdienen',
        'Affiliate Marketing',
        'Social Media Marketing',
        'Content Creator',
        'Passive Einkommen'
      ];

      niches.forEach(n => {
        const l = manager.selectLink(n, 'tiktok');
        console.log(`📌 Nische: ${n}`);
        console.log(`   → ${l.name} (€${l.price}, ${l.commission}€ Commission)`);
        console.log('');
      });
      break;

    case 'help':
    default:
      console.log(`
💰 Affiliate Link Manager

USAGE:
  node affiliate-manager.js [COMMAND] [OPTIONS]

COMMANDS:
  select <niche> <platform>   Wähle optimalen Link für Nische
  report                      Zeige Performance Report
  optimize                    Optimiere Links basierend auf Performance
  test                        Teste Link-Auswahl für verschiedene Nischen
  help                        Zeige diese Hilfe

EXAMPLES:
  node affiliate-manager.js select "Online Geld verdienen" tiktok
  node affiliate-manager.js report
  node affiliate-manager.js optimize
  node affiliate-manager.js test

DEINE LINKS HINZUFÜGEN:
  1. Öffne: affiliate-links.json
  2. Ersetze die URL/Name/Niche Felder mit deinen echten Links
  3. Speichern und fertig!
      `);
      break;
  }
}

module.exports = { AffiliateManager };
