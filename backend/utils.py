#!/usr/bin/env python3
"""
Utility Functions for Jules Backend
"""
import jwt
import hashlib
from datetime import datetime, timedelta
from config import config

def generate_download_token(email, product_id, expires_hours=24):
    """Generate secure JWT token for download links"""
    payload = {
        'email': email,
        'product_id': product_id,
        'exp': datetime.utcnow() + timedelta(hours=expires_hours),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, config.JWT_SECRET, algorithm='HS256')
    return token

def verify_download_token(token):
    """Verify and decode download token"""
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def format_price(amount_cents):
    """Format price in cents to EUR"""
    return f"€{amount_cents / 100:.2f}"

def sanitize_filename(name):
    """Sanitize filename for safe storage"""
    import re
    # Remove special characters
    name = re.sub(r'[^\w\s-]', '', name)
    # Replace spaces with underscores
    name = re.sub(r'[-\s]+', '_', name)
    return name.lower()

def generate_order_id():
    """Generate unique order ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    hash_suffix = hashlib.md5(timestamp.encode()).hexdigest()[:6]
    return f"ORD-{timestamp}-{hash_suffix}"

def log_info(message):
    """Log info message"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] INFO: {message}")

def log_error(message):
    """Log error message"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] ERROR: {message}")

def log_success(message):
    """Log success message"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] ✅ SUCCESS: {message}")
