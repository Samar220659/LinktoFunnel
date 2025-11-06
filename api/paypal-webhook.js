#!/usr/bin/env node

/**
 * 💰 PAYPAL WEBHOOK & ORDER PROCESSING
 * Verarbeitet PayPal Zahlungen und liefert Produkt aus
 *
 * Features:
 * - PayPal Order Verification
 * - Automatische Produkt-Auslieferung
 * - E-Mail Versand mit Zugangsdaten
 * - Supabase Order Tracking
 * - Webhook Security
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PAYPAL_API_URL = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

class PayPalWebhookHandler {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  }

  /**
   * Verifiziert PayPal Order
   */
  async verifyOrder(orderID) {
    console.log(`🔍 Verifiziere PayPal Order: ${orderID}`);

    try {
      // Get Access Token
      const token = await this.getAccessToken();

      // Get Order Details
      const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`PayPal API Error: ${response.status}`);
      }

      const order = await response.json();

      console.log(`✅ Order verifiziert: ${order.status}`);

      return {
        verified: order.status === 'COMPLETED',
        order: order,
      };

    } catch (error) {
      console.error('❌ Verification Error:', error.message);
      return {
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Holt PayPal Access Token
   */
  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Verarbeitet erfolgreiche Zahlung
   */
  async processPayment(orderID, details) {
    console.log(`💰 Verarbeite Zahlung: ${orderID}`);

    try {
      // 1. Verifiziere Order
      const verification = await this.verifyOrder(orderID);

      if (!verification.verified) {
        throw new Error('Order verification failed');
      }

      // 2. Extrahiere Customer Info
      const order = verification.order;
      const payer = order.payer;
      const email = payer.email_address;
      const name = payer.name.given_name + ' ' + payer.name.surname;

      // 3. Speichere in Supabase
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert([
          {
            order_id: orderID,
            customer_email: email,
            customer_name: name,
            amount: parseFloat(order.purchase_units[0].amount.value),
            currency: order.purchase_units[0].amount.currency_code,
            status: 'completed',
            product: 'AI Automation Guide',
            paypal_details: order,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      console.log(`✅ Order gespeichert:`, orderData);

      // 4. Sende Produkt per E-Mail
      await this.deliverProduct(email, name, orderID);

      // 5. Telegram Benachrichtigung
      await this.sendTelegramNotification(
        `🎉 Neue Bestellung!\n\n` +
        `Kunde: ${name}\n` +
        `E-Mail: ${email}\n` +
        `Betrag: ${order.purchase_units[0].amount.value} ${order.purchase_units[0].amount.currency_code}\n` +
        `Order ID: ${orderID}`
      );

      return {
        success: true,
        orderData: orderData,
      };

    } catch (error) {
      console.error('❌ Payment Processing Error:', error.message);

      // Fehler-Benachrichtigung
      await this.sendTelegramNotification(
        `🚨 Payment Processing Fehler!\n\n` +
        `Order ID: ${orderID}\n` +
        `Error: ${error.message}`
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Liefert Produkt an Kunden aus
   */
  async deliverProduct(email, name, orderID) {
    console.log(`📧 Sende Produkt an: ${email}`);

    // TODO: Implementiere E-Mail Versand
    // Hier würdest du z.B. SendGrid, Mailgun oder Resend nutzen

    const downloadLink = `${process.env.APP_URL}/download?order=${orderID}`;

    // Für Development: Log statt E-Mail
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  📧 E-MAIL AN: ${email}
╠════════════════════════════════════════════════════════════╣
║  Betreff: Dein AI Automation Guide - Zugangsdaten
║
║  Hallo ${name},
║
║  vielen Dank für deinen Kauf! 🎉
║
║  Hier sind deine Zugangsdaten:
║
║  📥 Download: ${downloadLink}
║
║  🔑 Dein persönlicher Code: ${orderID}
║
║  Was du bekommst:
║  ✅ Complete Zero-Budget System
║  ✅ Content Generator Scripts
║  ✅ Termux Automation Setup
║  ✅ Lebenslanger Zugriff + Updates
║
║  Bei Fragen: support@zz-lobby.com
║
║  Viel Erfolg!
║  Dein ZZ-Lobby Team
╚════════════════════════════════════════════════════════════╝
    `);

    // Production: Nutze E-Mail Service
    /*
    await sendEmail({
      to: email,
      subject: 'Dein AI Automation Guide - Zugangsdaten',
      template: 'product-delivery',
      data: {
        name: name,
        downloadLink: downloadLink,
        orderID: orderID,
      },
    });
    */

    return true;
  }

  /**
   * Sendet Telegram Benachrichtigung
   */
  async sendTelegramNotification(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log('ℹ️  Telegram not configured');
      return;
    }

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      console.log('✅ Telegram notification sent');
    } catch (error) {
      console.error('Telegram Error:', error.message);
    }
  }
}

// ===== API ENDPOINT (Express Integration) =====

/**
 * Express Middleware
 */
async function paypalWebhookMiddleware(req, res) {
  const handler = new PayPalWebhookHandler();

  const { orderID, details } = req.body;

  if (!orderID) {
    return res.status(400).json({
      error: 'Missing orderID',
    });
  }

  try {
    const result = await handler.processPayment(orderID, details);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: result.orderData,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

// ===== EXPORT =====

module.exports = {
  PayPalWebhookHandler,
  paypalWebhookMiddleware,
};

// ===== CLI TEST =====

if (require.main === module) {
  async function test() {
    console.log('🧪 PayPal Webhook Test\n');

    const handler = new PayPalWebhookHandler();

    // Test Order ID (aus PayPal Sandbox)
    const testOrderID = process.argv[2] || 'TEST_ORDER_123';

    console.log(`Testing with Order ID: ${testOrderID}\n`);

    const result = await handler.processPayment(testOrderID, {});

    console.log('\n Result:', JSON.stringify(result, null, 2));
  }

  test();
}
