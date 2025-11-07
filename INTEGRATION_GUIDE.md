# LinktoFunnel - Complete Integration Guide
## AI-Powered Social Media Automation System

> **Transform your affiliate marketing with autonomous AI agents that handle everything from product discovery to viral content creation and multi-platform posting**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [API Integrations](#api-integrations)
4. [AI Agents Setup](#ai-agents-setup)
5. [OAuth Authentication](#oauth-authentication)
6. [API Endpoints](#api-endpoints)
7. [Deployment](#deployment)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (free tier works)
- API keys for:
  - OpenAI (GPT-4)
  - Social media platforms (TikTok, Instagram, YouTube, Pinterest, Twitter)
  - Digistore24 (optional, for affiliate products)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/LinktoFunnel.git
cd LinktoFunnel

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

### Environment Variables

```bash
# Core Services
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
NODE_ENV=development

# AI Services
OPENAI_API_KEY=sk-...

# Social Media - TikTok
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret

# Social Media - Instagram/Facebook
INSTAGRAM_CLIENT_ID=your-client-id
INSTAGRAM_CLIENT_SECRET=your-client-secret

# Social Media - YouTube
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

# Social Media - Pinterest
PINTEREST_CLIENT_ID=your-client-id
PINTEREST_CLIENT_SECRET=your-client-secret

# Social Media - Twitter/X
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_SECRET=your-access-secret

# Affiliate
DIGISTORE24_API_KEY=your-api-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_ID=your-telegram-id
```

### Database Setup

Run the database migration to create all required tables:

```bash
# Create tables in Supabase
# Go to Supabase Dashboard > SQL Editor
# Copy and paste the contents of ai-agent/data/schema.sql
# Click "Run"
```

### Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API server will start on `http://localhost:3000`

---

## System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        USER LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Browser    │  │  Telegram    │  │   Mobile App     │   │
│  │  Dashboard   │  │     Bot      │  │   (Future)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                      API LAYER                                │
│                   server-enhanced.js                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  REST API Endpoints                                   │    │
│  │  - /auth/*         OAuth authentication               │    │
│  │  - /api/content/*  Content management                 │    │
│  │  - /api/social/*   Social media posting               │    │
│  │  - /api/agents/*   AI agent control                   │    │
│  │  - /api/analytics/* Performance metrics               │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │         OAuth Manager (oauth-manager.js)            │     │
│  │  Handles authentication for all platforms           │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │   Social Media Manager (social-media-manager.js)    │     │
│  │  Unified interface for posting to 9+ platforms      │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              AI AGENTS                               │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │     │
│  │  │   Product    │  │   Content    │  │  Multi-   │ │     │
│  │  │    Scout     │  │   Creator    │  │ Platform  │ │     │
│  │  │   Agent      │  │    Agent     │  │ Publisher │ │     │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                          │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  TikTok  │  │Instagram │  │ YouTube  │  │ Pinterest│     │
│  │   API    │  │   API    │  │   API    │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Twitter  │  │ LinkedIn │  │ Facebook │  │  Reddit  │     │
│  │   API    │  │   API    │  │   API    │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ OpenAI   │  │Digistore │                                  │
│  │   API    │  │24 API    │                                  │
│  └──────────┘  └──────────┘                                  │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                       DATA LAYER                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │         Supabase PostgreSQL Database                │     │
│  │  - digistore_products                               │     │
│  │  - generated_content                                │     │
│  │  - social_media_posts                               │     │
│  │  - social_media_credentials                         │     │
│  │  - analytics_daily                                  │     │
│  │  - rl_learning                                      │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | File | Responsibility |
|-----------|------|----------------|
| **API Server** | `server-enhanced.js` | REST API endpoints, request routing |
| **OAuth Manager** | `ai-agent/core/oauth-manager.js` | OAuth 2.0 authentication flow |
| **Social Media Manager** | `ai-agent/integrations/social-media-manager.js` | Unified social media posting |
| **Base Agent** | `ai-agent/core/base-agent.js` | Agent framework (perceive-decide-act-learn) |
| **Product Scout** | `ai-agent/agents/product-scout.js` | Find profitable products |
| **Content Creator** | `ai-agent/agents/viral-content-creator.js` | Generate viral content |
| **Publisher** | `ai-agent/agents/cross-poster.js` | Post to multiple platforms |
| **TikTok API** | `ai-agent/integrations/platforms/tiktok.js` | TikTok integration |
| **Instagram API** | `ai-agent/integrations/platforms/instagram.js` | Instagram integration |
| **YouTube API** | `ai-agent/integrations/platforms/youtube.js` | YouTube integration |
| **Pinterest API** | `ai-agent/integrations/platforms/pinterest.js` | Pinterest integration |
| **Twitter API** | `ai-agent/integrations/platforms/twitter.js` | Twitter/X integration |

---

## API Integrations

### TikTok API Setup

1. **Create TikTok App**
   - Go to https://developers.tiktok.com/
   - Click "Manage apps" → "Create an app"
   - Fill in app details
   - Add redirect URI: `http://localhost:3000/auth/tiktok/callback`

2. **Get Credentials**
   ```
   Client Key: abcdef123456
   Client Secret: xyz789secret
   ```

3. **Set Scopes**
   - `user.info.basic`
   - `video.upload`
   - `video.publish`

4. **Add to .env**
   ```bash
   TIKTOK_CLIENT_KEY=abcdef123456
   TIKTOK_CLIENT_SECRET=xyz789secret
   ```

### Instagram API Setup

1. **Create Facebook App**
   - Go to https://developers.facebook.com/
   - Create app → Business type
   - Add Instagram Basic Display product

2. **Configure Instagram**
   - Add Instagram test users
   - Add redirect URI: `http://localhost:3000/auth/instagram/callback`

3. **Get Credentials**
   ```
   App ID: 123456789
   App Secret: secret123
   ```

4. **Add to .env**
   ```bash
   INSTAGRAM_CLIENT_ID=123456789
   INSTAGRAM_CLIENT_SECRET=secret123
   ```

### YouTube API Setup

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create new project
   - Enable YouTube Data API v3

2. **Create OAuth Credentials**
   - Go to Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Add redirect URI: `http://localhost:3000/auth/youtube/callback`

3. **Get Credentials**
   ```
   Client ID: 123-abc.apps.googleusercontent.com
   Client Secret: GOCSPX-secret
   ```

4. **Add to .env**
   ```bash
   YOUTUBE_CLIENT_ID=123-abc.apps.googleusercontent.com
   YOUTUBE_CLIENT_SECRET=GOCSPX-secret
   YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback
   ```

### Pinterest API Setup

1. **Create Pinterest App**
   - Go to https://developers.pinterest.com/
   - Create app
   - Add redirect URI: `http://localhost:3000/auth/pinterest/callback`

2. **Get Credentials**
   ```
   App ID: 1234567
   App Secret: secret
   ```

3. **Add to .env**
   ```bash
   PINTEREST_CLIENT_ID=1234567
   PINTEREST_CLIENT_SECRET=secret
   ```

### Twitter/X API Setup

1. **Create Twitter App**
   - Go to https://developer.twitter.com/
   - Create project and app
   - Enable OAuth 1.0a with Read and Write permissions

2. **Get Credentials**
   ```
   API Key: abc123
   API Secret: xyz789
   Access Token: token123
   Access Secret: secret456
   ```

3. **Add to .env**
   ```bash
   TWITTER_API_KEY=abc123
   TWITTER_API_SECRET=xyz789
   TWITTER_ACCESS_TOKEN=token123
   TWITTER_ACCESS_SECRET=secret456
   ```

---

## AI Agents Setup

### Product Scout Agent

**Purpose**: Automatically discovers high-converting affiliate products

**Configuration**:
```javascript
// ai-agent/agents/product-scout.js
const agent = new ProductScoutAgent({
  interval: 6 * 60 * 60 * 1000,  // Run every 6 hours
  minEPC: 0.50,                   // Minimum earnings per click (€)
  minConversionRate: 0.02,        // Minimum 2% conversion rate
  maxProducts: 5                  // Top 5 products per run
});
```

**How it works**:
1. Fetches trending products from Digistore24
2. Analyzes conversion rates and EPC
3. Uses GPT-4 to score products based on viral potential
4. Stores top products in database
5. Learns from historical performance

**Manual trigger**:
```bash
curl -X POST http://localhost:3000/api/agents/scout
```

### Content Creator Agent

**Purpose**: Generates viral short-form video scripts

**Configuration**:
```javascript
// ai-agent/agents/viral-content-creator.js
const agent = new ViralContentCreatorAgent({
  interval: 4 * 60 * 60 * 1000,  // Run every 4 hours
  persona: 'The Super-Seller',    // AI persona
  hookTypes: ['shock', 'question', 'story', 'urgency'],
  platforms: ['tiktok', 'instagram', 'youtube']
});
```

**How it works**:
1. Gets top product from Product Scout
2. Generates viral hooks using proven patterns
3. Creates 45-second script with:
   - Hook (0-3s)
   - Value proposition (3-15s)
   - Social proof (15-30s)
   - Call-to-action (30-45s)
4. Generates keyframe images with DALL-E 3
5. Stores content ready for posting

**Manual trigger**:
```bash
curl -X POST http://localhost:3000/api/agents/create-content \
  -H "Content-Type: application/json" \
  -d '{"product_id": "123"}'
```

### Publisher Agent

**Purpose**: Posts content to multiple platforms at optimal times

**Configuration**:
```javascript
// ai-agent/agents/cross-poster.js
const agent = new MultiPlatformPublisherAgent({
  interval: 60 * 60 * 1000,      // Check every hour
  platforms: ['tiktok', 'instagram', 'youtube', 'pinterest'],
  respectOptimalTimes: true,
  retryOnFailure: true,
  maxRetries: 3
});
```

**Optimal Posting Times**:
- **TikTok**: Tue-Thu at 3PM, 6PM, 9PM
- **Instagram**: Wed-Fri at 11AM, 1PM, 5PM, 7PM
- **YouTube**: Fri-Sun at 2PM, 5PM, 8PM
- **Pinterest**: Sat-Sun at 8PM, 9PM

**How it works**:
1. Checks for ready-to-post content
2. Verifies current time is optimal for target platforms
3. Posts to all selected platforms in parallel
4. Tracks post IDs and URLs
5. Monitors for failures and retries

**Manual trigger**:
```bash
curl -X POST http://localhost:3000/api/agents/publish
```

---

## OAuth Authentication

### Authentication Flow

```
User → GET /auth/:platform/authorize
     ↓
     Generate auth URL with state token
     ↓
     Redirect to platform (TikTok, Instagram, etc.)
     ↓
     User authorizes app
     ↓
     Platform → GET /auth/:platform/callback?code=xxx&state=yyy
     ↓
     Verify state token
     ↓
     Exchange code for access token
     ↓
     Store credentials in database
     ↓
     Redirect to dashboard
```

### Step-by-Step Example (TikTok)

#### 1. Get Authorization URL

```bash
curl http://localhost:3000/auth/tiktok/authorize

# Response:
{
  "success": true,
  "authorization_url": "https://www.tiktok.com/v2/auth/authorize?client_key=...",
  "state": "abc123xyz789"
}
```

#### 2. User Visits URL and Authorizes

The user clicks the URL, logs into TikTok, and authorizes your app.

#### 3. TikTok Redirects to Callback

```
http://localhost:3000/auth/tiktok/callback?code=AUTH_CODE&state=abc123xyz789
```

#### 4. System Handles Callback

- Verifies state token matches
- Exchanges code for access/refresh tokens
- Stores tokens in `social_media_credentials` table
- Redirects to dashboard

#### 5. Tokens Are Stored

```sql
SELECT * FROM social_media_credentials WHERE platform = 'tiktok';

| id | platform | access_token  | refresh_token | expires_at          |
|----|----------|---------------|---------------|---------------------|
| 1  | tiktok   | act_abc123... | rft_xyz789... | 2024-12-07 10:00:00 |
```

### Check Authentication Status

```bash
curl http://localhost:3000/auth/platforms

# Response:
{
  "success": true,
  "platforms": [
    {
      "platform": "tiktok",
      "authenticated_at": "2024-11-07T10:00:00Z",
      "last_updated": "2024-11-07T10:00:00Z"
    },
    {
      "platform": "instagram",
      "authenticated_at": "2024-11-07T09:30:00Z",
      "last_updated": "2024-11-07T09:30:00Z"
    }
  ]
}
```

### Token Refresh

Tokens are automatically refreshed when they expire. The OAuth Manager handles this transparently.

```javascript
// In oauth-manager.js
async getCredentials(platform, userId) {
  const credentials = await this.fetchFromDatabase(platform, userId);

  if (this.isExpired(credentials.expires_at)) {
    // Auto-refresh
    const newTokens = await this.refreshAccessToken(platform, credentials.refresh_token);
    await this.storeCredentials({ ...credentials, ...newTokens });
    return newTokens;
  }

  return credentials;
}
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/:platform/authorize` | Get OAuth authorization URL |
| GET | `/auth/:platform/callback` | Handle OAuth callback |
| GET | `/auth/platforms` | List authenticated platforms |
| DELETE | `/auth/:platform` | Disconnect platform |

### Content Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List generated content |
| GET | `/api/content/:id` | Get content by ID |
| POST | `/api/content` | Create content manually |

### Social Media Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/social/post` | Post to multiple platforms |
| POST | `/api/social/:platform/post` | Post to specific platform |
| GET | `/api/social/:platform/analytics/:post_id` | Get post analytics |
| GET | `/api/social/analytics` | Get all analytics |
| GET | `/api/social/stats` | Get platform statistics |

### AI Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/scout` | Trigger product scout |
| POST | `/api/agents/create-content` | Trigger content creator |
| POST | `/api/agents/publish` | Trigger publisher |
| GET | `/api/agents/metrics` | Get agent performance |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard overview |
| GET | `/api/analytics/revenue` | Revenue analytics |

### Products Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |

---

## Deployment

### Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=sk-...
   railway variables set TIKTOK_CLIENT_KEY=...
   # ... add all variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Vercel Deployment (API)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project settings → Environment Variables
   - Add all variables from `.env`

---

## Monitoring & Analytics

### Dashboard Metrics

Access the dashboard at: `http://localhost:3000/api/analytics/dashboard`

**Key Metrics**:
- Total revenue (last 30 days)
- Total conversions
- Average conversion rate
- Total posts published
- Platform breakdown

### Real-Time Logs

```bash
# View server logs
npm run logs

# View agent logs
tail -f logs/agents.log

# View error logs
tail -f logs/errors.log
```

### Database Queries

```sql
-- Top performing content
SELECT
  gc.id,
  gc.script->>'hook' as hook,
  COUNT(smp.id) as posts_count,
  SUM(sma.views) as total_views,
  SUM(sma.likes) as total_likes,
  SUM(sma.conversions) as total_conversions
FROM generated_content gc
LEFT JOIN social_media_posts smp ON gc.id = smp.content_id
LEFT JOIN social_media_analytics sma ON smp.post_id = sma.post_id
GROUP BY gc.id
ORDER BY total_conversions DESC
LIMIT 10;

-- Platform performance
SELECT
  platform,
  COUNT(*) as total_posts,
  AVG(sma.engagement_rate) as avg_engagement,
  SUM(sma.conversions) as total_conversions
FROM social_media_posts smp
LEFT JOIN social_media_analytics sma ON smp.post_id = sma.post_id
WHERE smp.posted_at >= NOW() - INTERVAL '30 days'
GROUP BY platform;

-- Agent learning progress
SELECT
  agent_name,
  COUNT(*) as total_runs,
  AVG(reward) as avg_reward,
  MAX(reward) as best_reward
FROM rl_learning
GROUP BY agent_name;
```

---

## Troubleshooting

### Common Issues

#### 1. OAuth Authentication Fails

**Symptom**: "Invalid state parameter" or "Token exchange failed"

**Solution**:
- Check redirect URI matches exactly (including http/https)
- Verify credentials in `.env`
- Clear old state tokens:
  ```sql
  DELETE FROM oauth_states WHERE expires_at < NOW();
  ```

#### 2. Video Upload Fails

**Symptom**: "Video processing timeout" or "Upload failed"

**Solution**:
- Check video format (MP4, H.264 codec)
- Verify video size (< 50MB for most platforms)
- Check aspect ratio (9:16 for shorts)
- Ensure stable internet connection

#### 3. Agent Not Running

**Symptom**: No new content being generated

**Solution**:
```bash
# Check agent status
curl http://localhost:3000/api/agents/metrics

# Manually trigger agents
curl -X POST http://localhost:3000/api/agents/scout
curl -X POST http://localhost:3000/api/agents/create-content
curl -X POST http://localhost:3000/api/agents/publish
```

#### 4. API Rate Limits

**Symptom**: "Rate limit exceeded" errors

**Solution**:
- Implement exponential backoff in retry logic
- Reduce posting frequency
- Use multiple accounts (if allowed by platform)

#### 5. Database Connection Issues

**Symptom**: "Connection refused" or "Invalid API key"

**Solution**:
- Verify Supabase URL and key in `.env`
- Check if Supabase project is paused (free tier)
- Test connection:
  ```bash
  curl https://your-project.supabase.co/rest/v1/ \
    -H "apikey: your-key"
  ```

---

## Support

- **Documentation**: See `FULLSTACK_AUTOMATION_GUIDE.md` for detailed guides
- **GitHub Issues**: https://github.com/yourusername/LinktoFunnel/issues
- **Discord Community**: [Join here]

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for entrepreneurs who want to automate their way to freedom**
