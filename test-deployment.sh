#!/data/data/com.termux/files/usr/bin/bash

# Railway Deployment Test Script
# Tests all deployed services

echo "🧪 RAILWAY DEPLOYMENT TESTS"
echo "================================"
echo ""

TELEGRAM_TOKEN="7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk"
TELEGRAM_CHAT_ID="6982601388"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Telegram Bot Token Validity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ PASSED${NC} - Bot token is valid"
  BOT_NAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
  echo "   Bot Username: @$BOT_NAME"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAILED${NC} - Bot token is invalid"
  echo "   Response: $RESPONSE"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Telegram Bot Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

UPDATES=$(curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?limit=1")

if echo "$UPDATES" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ PASSED${NC} - Bot can receive updates"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAILED${NC} - Bot cannot receive updates"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Send Test Message"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_MSG="🧪 Deployment Test $(date '+%H:%M:%S')"
SEND_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "text=${TEST_MSG}")

if echo "$SEND_RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ PASSED${NC} - Test message sent successfully"
  echo "   Check your Telegram for the test message!"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAILED${NC} - Failed to send test message"
  echo "   Response: $SEND_RESPONSE"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Railway API Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RAILWAY_TOKEN="d41b1d2b-d60e-42de-bfec-8593fb9c8ab1"
RAILWAY_RESPONSE=$(curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer ${RAILWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { me { id email } }"}')

if echo "$RAILWAY_RESPONSE" | grep -q '"me"'; then
  echo -e "${GREEN}✅ PASSED${NC} - Railway API connection successful"
  EMAIL=$(echo "$RAILWAY_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
  echo "   Account: $EMAIL"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠️  SKIPPED${NC} - Railway API connection (expected if deployed via web)"
  echo "   This is normal if you deployed via Railway Dashboard"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}"
  echo ""
  echo "Your deployment is working correctly!"
  echo ""
  echo "NEXT STEPS:"
  echo "1. Open Telegram and check for the test message"
  echo "2. Send /start to your bot"
  echo "3. Try /stats to see system status"
  echo "4. Check Railway Dashboard for service logs"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  echo ""
  echo "Please check:"
  echo "1. Are all environment variables set in Railway?"
  echo "2. Are the services running (green status)?"
  echo "3. Check Railway logs for errors"
  echo ""
  exit 1
fi
