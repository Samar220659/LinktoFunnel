#!/usr/bin/env python3
"""
Telegram Bot for Notifications
"""
import requests
from config import config
from utils import log_info, log_error, log_success, format_price

def send_telegram_message(message, parse_mode='HTML'):
    """Send message to Telegram"""
    try:
        url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"

        payload = {
            'chat_id': config.TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': parse_mode
        }

        response = requests.post(url, json=payload, timeout=10)

        if response.status_code == 200:
            log_success("Telegram message sent!")
            return True
        else:
            log_error(f"Telegram API error: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        log_error(f"Failed to send Telegram message: {str(e)}")
        return False

def notify_new_sale(product_name, customer_email, amount_cents, order_id):
    """Send new sale notification"""
    price = format_price(amount_cents)

    message = f"""
🎉 <b>NEUER VERKAUF!</b> 🎉

💰 <b>Produkt:</b> {product_name}
💵 <b>Preis:</b> {price}
📧 <b>Kunde:</b> {customer_email}
🔖 <b>Order ID:</b> {order_id}

✅ Email mit Download-Link wurde versendet!
📊 Fulfillment automatisch abgeschlossen!

💸 <b>Passives Einkommen läuft!</b> 🚀
    """

    return send_telegram_message(message)

def notify_system_event(event_type, details):
    """Send system event notification"""
    icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    }

    icon = icons.get(event_type, 'ℹ️')

    message = f"{icon} <b>SYSTEM EVENT</b>\n\n{details}"

    return send_telegram_message(message)

def send_test_notification():
    """Send test notification"""
    message = """
🧪 <b>TEST NOTIFICATION</b>

Jules Backend ist online und bereit!
Telegram-Integration funktioniert! ✅

© 2025 LinktoFunnel
    """

    return send_telegram_message(message)

if __name__ == '__main__':
    # Test Telegram notification
    send_test_notification()
