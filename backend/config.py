#!/usr/bin/env python3
"""
Configuration Management for Jules Backend
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for Jules Backend"""

    # Gemini API
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

    # Stripe
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

    # Email
    GMAIL_EMAIL = os.getenv('GMAIL_EMAIL', 'samar220659@gmail.com')
    GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD', '')

    # Telegram
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '6982601388')

    # Security
    JWT_SECRET = os.getenv('JWT_SECRET', 'change-me-in-production')

    # URLs
    BACKEND_BASE_URL = os.getenv('BACKEND_BASE_URL', 'http://localhost:5001')
    LANDING_PAGE_BASE_URL = os.getenv('LANDING_PAGE_BASE_URL', 'http://localhost:8080')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    # Paths
    DIGITAL_PRODUCTS_DIR = os.path.join(os.path.dirname(__file__), 'digital_products')
    LANDING_PAGES_DIR = os.path.join(os.path.dirname(__file__), 'landing_pages')
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'sales.db')

    @classmethod
    def validate(cls):
        """Validate required configuration"""
        required = [
            ('GEMINI_API_KEY', cls.GEMINI_API_KEY),
            ('STRIPE_SECRET_KEY', cls.STRIPE_SECRET_KEY),
            ('GMAIL_APP_PASSWORD', cls.GMAIL_APP_PASSWORD),
            ('TELEGRAM_BOT_TOKEN', cls.TELEGRAM_BOT_TOKEN),
        ]

        missing = [name for name, value in required if not value or value.startswith('YOUR_')]

        if missing:
            raise ValueError(f"Missing required config: {', '.join(missing)}")

        return True

config = Config()
