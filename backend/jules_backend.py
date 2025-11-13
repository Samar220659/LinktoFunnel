#!/usr/bin/env python3
"""
🤖 JULES BACKEND - AI Business Automation Backend
Complete backend for digital product sales with Stripe, Email, Telegram
"""

import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import stripe

# Import custom modules
from config import config
from utils import (
    generate_download_token,
    verify_download_token,
    generate_order_id,
    log_info,
    log_error,
    log_success
)
from email_sender import send_purchase_email
from telegram_bot import notify_new_sale, notify_system_event
from product_generator import create_pdf_product

# Initialize Flask
app = Flask(__name__)
CORS(app, origins=[config.FRONTEND_URL, config.LANDING_PAGE_BASE_URL])

# Configure Stripe
stripe.api_key = config.STRIPE_SECRET_KEY

# Database initialization
def init_database():
    """Initialize SQLite database for sales tracking"""
    conn = sqlite3.connect(config.DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            stripe_session_id TEXT,
            product_name TEXT,
            customer_email TEXT,
            amount_cents INTEGER,
            download_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT UNIQUE NOT NULL,
            product_name TEXT,
            price_cents INTEGER,
            stripe_product_id TEXT,
            stripe_price_id TEXT,
            payment_link TEXT,
            pdf_filename TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    log_success("Database initialized!")

# Initialize database on startup
init_database()

# ===== ENDPOINTS =====

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Jules Backend',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/create-stripe-product', methods=['POST'])
def create_stripe_product():
    """Create Stripe product and payment link"""
    try:
        data = request.json
        product_name = data.get('product_name')
        price_cents = data.get('price_cents')
        description = data.get('description', '')

        log_info(f"Creating Stripe product: {product_name}")

        # Create Stripe Product
        stripe_product = stripe.Product.create(
            name=product_name,
            description=description
        )

        log_success(f"Stripe Product created: {stripe_product.id}")

        # Create Stripe Price
        stripe_price = stripe.Price.create(
            product=stripe_product.id,
            unit_amount=price_cents,
            currency='eur'
        )

        log_success(f"Stripe Price created: {stripe_price.id}")

        # Create Payment Link
        payment_link = stripe.PaymentLink.create(
            line_items=[{
                'price': stripe_price.id,
                'quantity': 1
            }],
            after_completion={
                'type': 'redirect',
                'redirect': {
                    'url': f"{config.LANDING_PAGE_BASE_URL}/success.html"
                }
            }
        )

        log_success(f"Payment Link created: {payment_link.url}")

        # Generate PDF Product
        pdf_result = create_pdf_product(product_name, description)

        if not pdf_result['success']:
            log_error(f"PDF generation failed: {pdf_result.get('error')}")

        # Save to database
        conn = sqlite3.connect(config.DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO products
            (product_id, product_name, price_cents, stripe_product_id, stripe_price_id, payment_link, pdf_filename)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            stripe_product.id,
            product_name,
            price_cents,
            stripe_product.id,
            stripe_price.id,
            payment_link.url,
            pdf_result.get('filename', '')
        ))

        conn.commit()
        conn.close()

        # Save payment link to file (for landing page to fetch)
        with open(os.path.join(config.LANDING_PAGES_DIR, 'payment_link.txt'), 'w') as f:
            f.write(payment_link.url)

        return jsonify({
            'success': True,
            'product_id': stripe_product.id,
            'payment_link': payment_link.url,
            'pdf_filename': pdf_result.get('filename', '')
        })

    except Exception as e:
        log_error(f"Failed to create product: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/get-payment-link', methods=['GET'])
def get_payment_link():
    """Get the latest payment link"""
    try:
        link_file = os.path.join(config.LANDING_PAGES_DIR, 'payment_link.txt')

        if os.path.exists(link_file):
            with open(link_file, 'r') as f:
                payment_link = f.read().strip()
            return jsonify({
                'success': True,
                'payment_link': payment_link
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No payment link found'
            }), 404

    except Exception as e:
        log_error(f"Failed to get payment link: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, config.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        log_error(f"Invalid payload: {str(e)}")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        log_error(f"Invalid signature: {str(e)}")
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        log_success(f"Checkout session completed: {session['id']}")

        # Extract data
        customer_email = session.get('customer_details', {}).get('email')
        amount_total = session.get('amount_total', 0)

        # Get product info from database
        conn = sqlite3.connect(config.DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM products ORDER BY created_at DESC LIMIT 1')
        product = cursor.fetchone()

        if product:
            product_id = product[1]
            product_name = product[2]
            pdf_filename = product[7]

            # Generate order ID
            order_id = generate_order_id()

            # Generate download token
            download_token = generate_download_token(customer_email, product_id)
            download_url = f"{config.BACKEND_BASE_URL}/download/{download_token}"

            # Log sale
            cursor.execute('''
                INSERT INTO sales
                (order_id, stripe_session_id, product_name, customer_email, amount_cents, download_token)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (order_id, session['id'], product_name, customer_email, amount_total, download_token))

            conn.commit()
            conn.close()

            log_success(f"Sale logged: {order_id}")

            # Send email with download link
            send_purchase_email(customer_email, product_name, download_url)

            # Send Telegram notification
            notify_new_sale(product_name, customer_email, amount_total, order_id)

            log_success("Fulfillment completed!")

        else:
            log_error("No product found in database")
            conn.close()

    return jsonify({'success': True})

@app.route('/download/<token>', methods=['GET'])
def download_product(token):
    """Secure download endpoint with JWT verification"""
    try:
        # Verify token
        payload = verify_download_token(token)

        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 403

        email = payload.get('email')
        product_id = payload.get('product_id')

        log_info(f"Download request from {email} for {product_id}")

        # Get product from database
        conn = sqlite3.connect(config.DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('SELECT pdf_filename FROM products WHERE product_id = ?', (product_id,))
        result = cursor.fetchone()
        conn.close()

        if not result:
            return jsonify({'error': 'Product not found'}), 404

        pdf_filename = result[0]
        pdf_path = os.path.join(config.DIGITAL_PRODUCTS_DIR, pdf_filename)

        if not os.path.exists(pdf_path):
            return jsonify({'error': 'File not found'}), 404

        log_success(f"Serving file: {pdf_filename}")

        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=pdf_filename
        )

    except Exception as e:
        log_error(f"Download failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/test-email', methods=['POST'])
def test_email():
    """Test email sending"""
    try:
        from email_sender import send_test_email
        result = send_test_email()
        return jsonify({'success': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/test-telegram', methods=['POST'])
def test_telegram():
    """Test Telegram notification"""
    try:
        from telegram_bot import send_test_notification
        result = send_test_notification()
        return jsonify({'success': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== MAIN =====

if __name__ == '__main__':
    log_success("🤖 Jules Backend Starting...")

    # Validate configuration
    try:
        config.validate()
        log_success("Configuration validated!")
    except ValueError as e:
        log_error(f"Configuration error: {str(e)}")
        log_error("Please check your .env file!")
        exit(1)

    # Ensure directories exist
    os.makedirs(config.DIGITAL_PRODUCTS_DIR, exist_ok=True)
    os.makedirs(config.LANDING_PAGES_DIR, exist_ok=True)

    log_success("All directories ready!")

    # Notify startup
    notify_system_event('success', '🚀 Jules Backend is now ONLINE!')

    # Start server
    log_success("Starting Flask server on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
