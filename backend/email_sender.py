#!/usr/bin/env python3
"""
Email Sender using Gmail SMTP
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import config
from utils import log_info, log_error, log_success

def send_purchase_email(customer_email, product_name, download_url):
    """Send purchase confirmation email with download link"""
    try:
        log_info(f"Sending email to {customer_email}...")

        # Email content
        subject = f"🎉 Dein {product_name} ist ready!"

        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">🎉 Vielen Dank für deinen Kauf!</h2>

            <p>Hey!</p>

            <p>Dein <strong>{product_name}</strong> ist ready zum Download! 🚀</p>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 15px 0;">Klick auf den Button um dein Produkt herunterzuladen:</p>
                <a href="{download_url}" style="display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    📥 Jetzt Herunterladen
                </a>
            </div>

            <p><strong>Wichtig:</strong> Dieser Link ist 24 Stunden gültig aus Sicherheitsgründen.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 14px; color: #666;">
                Bei Fragen oder Problemen, antworte einfach auf diese E-Mail!<br>
                Viel Erfolg mit deinem neuen Produkt! 💰
            </p>

            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Diese E-Mail wurde automatisch generiert.<br>
                © 2025 LinktoFunnel - AI Business Automation
            </p>
        </body>
        </html>
        """

        text_body = f"""
        🎉 Vielen Dank für deinen Kauf!

        Dein {product_name} ist ready zum Download!

        Download-Link: {download_url}

        Wichtig: Dieser Link ist 24 Stunden gültig.

        Bei Fragen oder Problemen, antworte einfach auf diese E-Mail!
        Viel Erfolg mit deinem neuen Produkt! 💰

        © 2025 LinktoFunnel - AI Business Automation
        """

        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = config.GMAIL_EMAIL
        msg['To'] = customer_email
        msg['Subject'] = subject

        # Attach text and HTML versions
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        # Send email via Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(config.GMAIL_EMAIL, config.GMAIL_APP_PASSWORD)
            server.send_message(msg)

        log_success(f"Email sent to {customer_email}")
        return True

    except Exception as e:
        log_error(f"Failed to send email: {str(e)}")
        return False

def send_test_email(test_email="samar220659@gmail.com"):
    """Send test email to verify configuration"""
    try:
        log_info(f"Sending test email to {test_email}...")

        subject = "🧪 Test Email - Jules Backend"
        body = """
        This is a test email from Jules Backend!

        If you received this, your email configuration is working correctly. ✅

        © 2025 LinktoFunnel
        """

        msg = MIMEText(body)
        msg['From'] = config.GMAIL_EMAIL
        msg['To'] = test_email
        msg['Subject'] = subject

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(config.GMAIL_EMAIL, config.GMAIL_APP_PASSWORD)
            server.send_message(msg)

        log_success("Test email sent successfully!")
        return True

    except Exception as e:
        log_error(f"Test email failed: {str(e)}")
        return False

if __name__ == '__main__':
    # Test email sending
    send_test_email()
