#!/usr/bin/env node

/**
 * 🌉 ZZ-LOBBY BRIDGE
 * Verbindet das Python-basierte zZ-Lobby System mit dem Node.js AI-Agent
 *
 * Funktionen:
 * - GetResponse E-Mail Automation
 * - Google Forms Lead-Generierung
 * - Digistore24 Funnel-Tracking
 * - Telegram Benachrichtigungen
 * - Automatische Funnel-Erstellung
 */

require('dotenv').config({ path: '.env.local' });

// ✅ PRODUCTION: Retry logic + timeout handling
const { fetchWithRetry } = require('../utils/api-helper');

// ⚠️ SECURITY: Load from environment variables, never hardcode!
const GETRESPONSE_API_KEY = process.env.GETRESPONSE_API_KEY;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class ZZLobbyBridge {
  constructor() {
    // Validate required environment variables
    if (!process.env.GETRESPONSE_API_KEY) {
      throw new Error('GETRESPONSE_API_KEY environment variable is required');
    }
    if (!process.env.TELEGRAM_CHAT_ID) {
      throw new Error('TELEGRAM_CHAT_ID environment variable is required');
    }

    this.getresponseApiKey = GETRESPONSE_API_KEY;
    this.telegramChatId = TELEGRAM_CHAT_ID;
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  // ===== GETRESPONSE INTEGRATION =====

  async getResponseRequest(endpoint, method = 'GET', data = null) {
    const url = `https://api.getresponse.com/v3/${endpoint}`;

    const options = {
      method: method,
      headers: {
        'X-Auth-Token': `api-key ${this.getresponseApiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      // ✅ Use fetchWithRetry with exponential backoff
      const response = await fetchWithRetry(url, options, {
        maxRetries: 3,
        timeoutMs: 10000,
        initialDelayMs: 1000,
        onRetry: (attempt, maxRetries, delay, error) => {
          console.warn(
            `⚠️  GetResponse API retry (${attempt}/${maxRetries}): ${error.message}. ` +
            `Waiting ${delay}ms...`
          );
        },
      });

      return await response.json();

    } catch (error) {
      console.error(`❌ GetResponse Request Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Erstellt eine neue GetResponse Kampagne
   */
  async createCampaign(productName) {
    const campaignData = {
      name: `Leads - ${productName}`,
      languageCode: 'DE',
      confirmation: {
        fromField: {
          fromFieldId: 'default',
        },
        subscriptionConfirmationBodyId: 'default',
        subscriptionConfirmationSubjectId: 'default',
      },
    };

    try {
      const result = await this.getResponseRequest('campaigns', 'POST', campaignData);
      console.log(`✅ GetResponse Kampagne erstellt: ${result.campaignId}`);
      return result;
    } catch (error) {
      console.error('❌ Kampagnen-Erstellung fehlgeschlagen:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Fügt Kontakt zu GetResponse hinzu
   */
  async addContact(email, campaignId, firstName = '', lastName = '', customFields = {}) {
    const contactData = {
      email: email,
      campaign: {
        campaignId: campaignId,
      },
      name: firstName,
      customFieldValues: [],
    };

    // Custom Fields hinzufügen
    for (const [key, value] of Object.entries(customFields)) {
      contactData.customFieldValues.push({
        customFieldId: key,
        value: [value],
      });
    }

    try {
      const result = await this.getResponseRequest('contacts', 'POST', contactData);
      console.log(`✅ Kontakt hinzugefügt: ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Kontakt-Hinzufügen fehlgeschlagen:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Erstellt E-Mail Autoresponder-Sequenz
   */
  async createEmailSequence(campaignId, productName, affiliateLink) {
    const emails = [
      {
        subject: `Willkommen! Hier ist dein ${productName}`,
        content: `
          <h1>Hallo!</h1>
          <p>Vielen Dank für dein Interesse an ${productName}!</p>
          <p>Hier ist dein exklusiver Zugang:</p>
          <p><a href="${affiliateLink}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Jetzt Zugriff erhalten</a></p>
          <p>Viel Erfolg!<br>Dein Team</p>
        `,
        dayOfCycle: 0,
      },
      {
        subject: `Hast du schon reingeschaut? ${productName}`,
        content: `
          <h1>Reminder!</h1>
          <p>Ich wollte mich kurz melden...</p>
          <p>Hast du dir ${productName} schon angeschaut?</p>
          <p><a href="${affiliateLink}">Hier nochmal der Link</a></p>
          <p>Falls du Fragen hast, antworte einfach auf diese E-Mail!</p>
        `,
        dayOfCycle: 3,
      },
      {
        subject: `Letzte Chance! ${productName} - Spezial-Angebot`,
        content: `
          <h1>Letzter Call!</h1>
          <p>Ich wollte dir nochmal Bescheid geben:</p>
          <p>Das Angebot für ${productName} läuft bald aus.</p>
          <p><a href="${affiliateLink}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Jetzt sichern (limitiert!)</a></p>
        `,
        dayOfCycle: 7,
      },
    ];

    const createdAutoresponders = [];

    for (const email of emails) {
      try {
        const autoresponder = await this.getResponseRequest('autoresponders', 'POST', {
          subject: email.subject,
          campaign: { campaignId: campaignId },
          status: 'enabled',
          editor: 'custom',
          content: {
            html: email.content,
          },
          triggerSettings: {
            dayOfCycle: email.dayOfCycle,
          },
        });

        createdAutoresponders.push(autoresponder);
        console.log(`✅ E-Mail ${email.dayOfCycle} erstellt`);

      } catch (error) {
        console.error(`❌ E-Mail ${email.dayOfCycle} fehlgeschlagen:`, error.message);
      }
    }

    return createdAutoresponders;
  }

  // ===== TELEGRAM INTEGRATION =====

  async sendTelegramNotification(message) {
    if (!this.telegramBotToken) {
      console.warn('⚠️  Telegram Bot Token nicht konfiguriert');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.telegramChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      console.log('✅ Telegram-Benachrichtigung gesendet');

    } catch (error) {
      console.error('❌ Telegram-Fehler:', error.message);
    }
  }

  // ===== FUNNEL CREATION =====

  async createCompleteFunnel(productData, linktoFunnelVideo = null) {
    console.log('\n' + '='.repeat(70));
    console.log(`🚀 Erstelle Funnel für: ${productData.name}`);
    console.log('='.repeat(70) + '\n');

    const steps = [];

    // 1. GetResponse Kampagne
    console.log('📧 Schritt 1: GetResponse Kampagne...');
    const campaign = await this.createCampaign(productData.name);

    if (campaign.error) {
      console.error('❌ Abbruch wegen Kampagnen-Fehler');
      return null;
    }

    steps.push({ step: 'campaign', data: campaign });

    // 2. E-Mail-Sequenz
    console.log('\n✉️  Schritt 2: E-Mail-Autoresponder...');
    const emails = await this.createEmailSequence(
      campaign.campaignId,
      productData.name,
      productData.affiliateLink
    );

    steps.push({ step: 'emails', data: emails });

    // 3. Landing Page (Google Forms Alternative)
    console.log('\n📄 Schritt 3: Landing Page...');

    // Wenn LinktoFunnel Video verfügbar, nutze das
    const landingPageUrl = linktoFunnelVideo
      ? await this.createVideoLandingPage(productData, linktoFunnelVideo)
      : await this.createSimpleLandingPage(productData);

    steps.push({ step: 'landing', url: landingPageUrl });

    // 4. Tracking Setup
    const funnel = {
      productName: productData.name,
      affiliateLink: productData.affiliateLink,
      campaignId: campaign.campaignId,
      landingPageUrl: landingPageUrl,
      emailCount: emails.length,
      createdAt: new Date().toISOString(),
      status: 'active',
      stats: {
        totalLeads: 0,
        emailsSent: 0,
        conversions: 0,
      },
    };

    console.log('\n' + '='.repeat(70));
    console.log('✅ FUNNEL ERFOLGREICH ERSTELLT!');
    console.log('='.repeat(70));
    console.log(`\n📋 Funnel-Details:`);
    console.log(`  🔗 Landing Page: ${landingPageUrl}`);
    console.log(`  📧 GetResponse Kampagne: ${campaign.campaignId}`);
    console.log(`  ✉️  E-Mail-Sequenz: ${emails.length} Mails`);
    console.log(`  💰 Affiliate-Link: ${productData.affiliateLink}\n`);

    // Telegram Benachrichtigung
    await this.sendTelegramNotification(
      `🎉 <b>Neuer Funnel erstellt!</b>\n\n` +
      `🎯 Produkt: ${productData.name}\n` +
      `📧 Kampagne: ${campaign.campaignId}\n` +
      `🔗 Landing Page: ${landingPageUrl}`
    );

    return funnel;
  }

  async createSimpleLandingPage(productData) {
    // Placeholder - In production würde hier eine echte Landing Page generiert
    // z.B. mit Vercel, GitHub Pages, oder Google Sites

    console.log('   📝 Generiere Landing Page HTML...');

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productData.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .container { max-width: 600px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; text-align: center; }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
        form { display: flex; flex-direction: column; gap: 15px; }
        input { padding: 15px; border: none; border-radius: 10px; font-size: 1rem; }
        button { padding: 15px; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold; background: #ff6b6b; color: white; cursor: pointer; transition: transform 0.2s; }
        button:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <h1>${productData.name}</h1>
        <p>${productData.description || 'Sichere dir jetzt deinen exklusiven Zugang!'}</p>

        <form id="leadForm">
            <input type="text" name="vorname" placeholder="Vorname" required>
            <input type="email" name="email" placeholder="E-Mail" required>
            <button type="submit">Jetzt kostenlos sichern!</button>
        </form>
    </div>

    <script>
        document.getElementById('leadForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // In production: API Call zu deinem Backend
            console.log('Lead submitted:', data);

            // Weiterleitung zum Affiliate-Link
            window.location.href = '${productData.affiliateLink}';
        });
    </script>
</body>
</html>
    `;

    // In production: Upload zu GitHub Pages, Vercel, etc.
    console.log('   ✅ Landing Page generiert (HTML bereit für Deploy)');

    return `https://your-domain.vercel.app/${productData.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  async createVideoLandingPage(productData, videoUrl) {
    console.log('   🎬 Erstelle Video-Landing Page...');

    // Hier würde die LinktoFunnel Video-Integration kommen
    // Video wird eingebettet + Lead-Formular

    return `https://your-domain.vercel.app/video/${productData.name.toLowerCase().replace(/\s+/g, '-')}`;
  }
}

// ===== CLI INTERFACE =====

async function main() {
  const bridge = new ZZLobbyBridge();

  console.log('\n🌉 ZZ-Lobby Bridge - GetResponse Integration\n');

  // Test: Funnel erstellen
  const testProduct = {
    name: 'Passives Einkommen Masterclass',
    description: 'Lerne wie du 5.000€/Monat passiv verdienst',
    affiliateLink: 'https://www.digistore24.com/redir/test/123456',
  };

  const funnel = await bridge.createCompleteFunnel(testProduct);

  if (funnel) {
    console.log('\n✅ Funnel-Test erfolgreich!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { ZZLobbyBridge };
