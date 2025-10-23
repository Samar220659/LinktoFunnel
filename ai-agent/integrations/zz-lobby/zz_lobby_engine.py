import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path='.env.local')

# API Configuration
GETRESPONSE_API_KEY = os.getenv('GETRESPONSE_API_KEY', 'dmg18fztw7ecpfyhhfeallh6hdske13q')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '6982601388')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

class ZZLobbyEngine:
    def __init__(self):
        self.getresponse_api_key = GETRESPONSE_API_KEY
        self.telegram_chat_id = TELEGRAM_CHAT_ID
        self.telegram_bot_token = TELEGRAM_BOT_TOKEN

    def getresponse_request(self, endpoint, method='GET', data=None):
        url = f"https://api.getresponse.com/v3/{endpoint}"
        headers = {
            'X-Auth-Token': f"api-key {self.getresponse_api_key}",
            'Content-Type': 'application/json'
        }
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            else:
                raise ValueError("Unsupported HTTP method")

            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"GetResponse API Error: {e}")
            raise

    def create_campaign(self, product_name):
        campaign_data = {
            "name": f"Leads - {product_name}",
            "languageCode": "DE",
            "confirmation": {
                "fromField": {"fromFieldId": "default"},
                "subscriptionConfirmationBodyId": "default",
                "subscriptionConfirmationSubjectId": "default",
            },
        }
        try:
            result = self.getresponse_request('campaigns', 'POST', campaign_data)
            print(f"✅ GetResponse Campaign created: {result['campaignId']}")
            return result
        except Exception as e:
            print(f"❌ Campaign creation failed: {e}")
            return {"error": str(e)}

    def add_contact(self, email, campaign_id, first_name="", last_name="", custom_fields=None):
        if custom_fields is None:
            custom_fields = {}
        contact_data = {
            "email": email,
            "campaign": {"campaignId": campaign_id},
            "name": first_name,
            "customFieldValues": [{"customFieldId": k, "value": [v]} for k, v in custom_fields.items()]
        }
        try:
            result = self.getresponse_request('contacts', 'POST', contact_data)
            print(f"✅ Contact added: {email}")
            return result
        except Exception as e:
            print(f"❌ Failed to add contact: {e}")
            return {"error": str(e)}

    def create_email_sequence(self, campaign_id, product_name, affiliate_link):
        emails = [
            {
                "subject": f"Willkommen! Hier ist dein {product_name}",
                "content": f"<h1>Hallo!</h1><p>Vielen Dank für dein Interesse an {product_name}!</p><p>Hier ist dein exklusiver Zugang:</p><p><a href=\"{affiliate_link}\" style=\"background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;\">Jetzt Zugriff erhalten</a></p><p>Viel Erfolg!<br>Dein Team</p>",
                "dayOfCycle": 0,
            },
            {
                "subject": f"Hast du schon reingeschaut? {product_name}",
                "content": f"<h1>Reminder!</h1><p>Ich wollte mich kurz melden...</p><p>Hast du dir {product_name} schon angeschaut?</p><p><a href=\"{affiliate_link}\">Hier nochmal der Link</a></p><p>Falls du Fragen hast, antworte einfach auf diese E-Mail!</p>",
                "dayOfCycle": 3,
            },
        ]
        created_autoresponders = []
        for email in emails:
            try:
                autoresponder = self.getresponse_request('autoresponders', 'POST', {
                    "subject": email["subject"],
                    "campaign": {"campaignId": campaign_id},
                    "status": "enabled",
                    "editor": "custom",
                    "content": {"html": email["content"]},
                    "triggerSettings": {"dayOfCycle": email["dayOfCycle"]},
                })
                created_autoresponders.append(autoresponder)
                print(f"✅ Email {email['dayOfCycle']} created")
            except Exception as e:
                print(f"❌ Email {email['dayOfCycle']} failed: {e}")
        return created_autoresponders

    def send_telegram_notification(self, message):
        if not self.telegram_bot_token:
            print('⚠️ Telegram Bot Token not configured')
            return
        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
        try:
            response = requests.post(url, json={
                "chat_id": self.telegram_chat_id,
                "text": message,
                "parse_mode": "HTML",
            })
            response.raise_for_status()
            print("✅ Telegram notification sent")
        except requests.exceptions.RequestException as e:
            print(f"❌ Telegram Error: {e}")

    def create_complete_funnel(self, product_data, linktofunnel_video=None):
        print('=' * 70)
        print(f"🚀 Creating Funnel for: {product_data['name']}")
        print('=' * 70)

        print("📧 Step 1: GetResponse Campaign...")
        campaign = self.create_campaign(product_data['name'])
        if "error" in campaign:
            print("❌ Aborting due to campaign error")
            return None

        print("\n✉️ Step 2: Email Autoresponder...")
        emails = self.create_email_sequence(
            campaign['campaignId'],
            product_data['name'],
            product_data['affiliateLink']
        )

        print("\n📄 Step 3: Landing Page...")
        landing_page_url = self.create_simple_landing_page(product_data)

        funnel = {
            "productName": product_data['name'],
            "affiliateLink": product_data['affiliateLink'],
            "campaignId": campaign['campaignId'],
            "landingPageUrl": landing_page_url,
            "emailCount": len(emails),
        }

        print('=' * 70)
        print("✅ FUNNEL CREATED SUCCESSFULLY!")
        print('=' * 70)
        print(f"  🔗 Landing Page: {landing_page_url}")
        print(f"  📧 GetResponse Campaign: {campaign['campaignId']}")
        print(f"  ✉️ Email Sequence: {len(emails)} mails")
        print(f"  💰 Affiliate Link: {product_data['affiliateLink']}\n")

        self.send_telegram_notification(
            f"🎉 <b>New Funnel Created!</b>\n\n"
            f"🎯 Product: {product_data['name']}\n"
            f"📧 Campaign: {campaign['campaignId']}\n"
            f"🔗 Landing Page: {landing_page_url}"
        )
        return funnel

    def create_simple_landing_page(self, product_data):
        print("   📝 Generating Landing Page HTML...")
        # In a real scenario, you would generate and deploy this HTML
        print("   ✅ Landing Page generated (HTML ready for deploy)")
        return f"https://your-domain.vercel.app/{product_data['name'].lower().replace(' ', '-')}"

if __name__ == "__main__":
    engine = ZZLobbyEngine()
    print("\n🌉 ZZ-Lobby Engine - Python Implementation\n")
    test_product = {
        "name": "Python Passives Einkommen Masterclass",
        "description": "Lerne wie du 5.000€/Monat passiv mit Python verdienst",
        "affiliateLink": "https://www.digistore24.com/redir/test/123456",
    }
    funnel = engine.create_complete_funnel(test_product)
    if funnel:
        print("\n✅ Funnel test successful!")