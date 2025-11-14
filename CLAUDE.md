# CLAUDE.md - AI Assistant Guide

**Last Updated:** 2025-11-14
**Project:** LinktoFunnel - AI Business Agent
**Version:** 2.0.0

---

## 📋 OVERVIEW

LinktoFunnel is an **autonomous AI-powered digital business agent** (German: "Digitaler Zwilling") designed to generate passive income through AI-driven marketing automation. The system uses multiple AI agents to discover products, create content, manage campaigns, and optimize performance using reinforcement learning principles.

### Core Mission
- Automate affiliate marketing (primarily Digistore24)
- Generate AI-powered video content
- Manage multi-platform social media posting
- Create and deploy sales funnels automatically
- Track and optimize campaigns with RL-based learning
- Run entirely from mobile via Termux (Android)

### Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Next.js 14
- **Database:** Supabase (PostgreSQL)
- **AI APIs:** Google Gemini, OpenAI GPT-4, Anthropic Claude
- **Deployment:** Railway, Vercel
- **Mobile Control:** Termux (Android)

---

## 🏗️ ARCHITECTURE

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 MASTER ORCHESTRATOR                                     │
│  - Central decision-making engine                           │
│  - Coordinates all specialized agents                       │
│  - Implements reinforcement learning logic                  │
│  Location: ai-agent/MASTER_ORCHESTRATOR.js                 │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  👥 SPECIALIZED AGENTS                                      │
├─────────────────────────────────────────────────────────────┤
│  • product-scout.js      - Digistore24 analysis            │
│  • viral-content-creator.js - AI video generation          │
│  • cross-poster.js       - Multi-platform posting          │
│  • account-manager.js    - Account/campaign management     │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  🔌 INTEGRATIONS                                            │
├─────────────────────────────────────────────────────────────┤
│  • digistore24.js        - Marketplace integration          │
│  • zz-lobby-bridge.js    - Funnel creation (GetResponse)   │
│  • mega-cross-poster.js  - Social media APIs               │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  💾 DATA LAYER (Supabase)                                   │
│  Schema: ai-agent/data/schema.sql                          │
│  Tables: products, content, campaigns, analytics, rl_*     │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
LinktoFunnel/
├── ai-agent/                    # Core AI Agent System
│   ├── MASTER_ORCHESTRATOR.js   # Main orchestration engine
│   ├── SUPER_AUTOMATION.js      # Extended automation workflows
│   ├── telegram-bot.js          # Telegram bot interface
│   ├── agents/                  # Specialized agent implementations
│   │   ├── product-scout.js     # Product discovery & analysis
│   │   ├── viral-content-creator.js  # Content generation
│   │   ├── cross-poster.js      # Social media automation
│   │   └── account-manager.js   # Campaign management
│   ├── integrations/            # External service integrations
│   │   ├── digistore24.js       # Digistore24 API client
│   │   ├── zz-lobby-bridge.js   # Funnel builder
│   │   ├── mega-cross-poster.js # Social media posting
│   │   └── zz-lobby/            # Python reference code
│   ├── core/                    # Core utilities (legacy)
│   │   └── orchestrator.js      # Original orchestrator (deprecated)
│   ├── data/                    # Database schemas & configs
│   │   └── schema.sql           # Supabase database schema
│   └── ARCHITECTURE.md          # Detailed architecture docs
│
├── ai-trinity/                  # AI Trinity system (Claude/GPT/Gemini)
│   ├── index.js                 # Main entry point
│   ├── core/                    # Core trinity logic
│   └── adapters/                # AI provider adapters
│
├── lib/                         # Shared libraries
│   ├── generator.js             # LinktoFunnel video pipeline
│   ├── video-generator.js       # Video generation logic
│   ├── supabase.js              # Supabase client
│   └── social-media/            # Social media utilities
│
├── scripts/                     # Utility scripts
│   ├── test-apis.js             # API connection tester
│   ├── supabase-inspect.js      # Database inspection tool
│   ├── quickstart.js            # Quick setup script
│   └── import-affiliate-links.js # Bulk import utility
│
├── bin/                         # CLI executables
├── data/                        # Runtime data storage
├── .github/workflows/           # GitHub Actions CI/CD
│   └── deploy.yml               # Deployment automation
│
├── .env.example                 # Environment variables template
├── package.json                 # Node.js dependencies & scripts
├── next.config.js               # Next.js configuration
├── railway.json                 # Railway deployment config
├── server.js                    # Express server entry
│
└── Documentation Files:
    ├── README.md                # User-facing documentation
    ├── ARCHITECTURE.md          # System architecture (in ai-agent/)
    ├── TERMUX_SETUP.md          # Mobile setup guide
    ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
    ├── GETTING_STARTED.md       # Quick start guide
    └── CLAUDE.md                # This file (AI assistant guide)
```

---

## 🔑 KEY CONCEPTS

### 1. Agent-Based Architecture
- **Master Orchestrator:** Coordinates all agent activities, makes high-level decisions
- **Specialized Agents:** Each agent has a specific responsibility (product scouting, content creation, etc.)
- **Reinforcement Learning:** Agents track performance metrics and optimize over time
- **State Management:** All agent states stored in Supabase for learning continuity

### 2. Database Schema (Supabase)
Key tables you'll work with:

- `digistore_products` - Discovered affiliate products
- `generated_content` - All AI-generated content (videos, posts, etc.)
- `campaigns` - Marketing campaigns tracking
- `analytics_daily` - Daily performance aggregates
- `rl_learning` - Reinforcement learning episodes
- `agent_states` - Agent execution history
- `leads` - Captured leads from landing pages
- `own_products` - User's own digital products
- `workflows` - Automation workflow definitions
- `notifications` - System alerts

### 3. Environment Variables
All configuration is via environment variables (`.env.local`):

**Core Services:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database
- `GEMINI_API_KEY` - Google Gemini AI
- `OPENAI_API_KEY` - OpenAI GPT-4 & DALL-E
- `ANTHROPIC_API_KEY` - Claude AI

**Integrations:**
- `DIGISTORE24_API_KEY` - Affiliate marketplace
- `GETRESPONSE_API_KEY` - Email marketing
- `SCRAPINGBEE_API_KEY` - Web scraping

**Social Media:**
- `TIKTOK_ACCESS_TOKEN` - TikTok posting
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID` - Instagram
- `YOUTUBE_API_KEY`, `YOUTUBE_CREDENTIALS` - YouTube
- `PINTEREST_ACCESS_TOKEN` - Pinterest

**Notifications:**
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` - Telegram alerts

### 4. NPM Scripts
Key commands defined in `package.json`:

```bash
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm start                # Start production server
npm test                 # Test all API connections
npm run ai-trinity       # Run AI Trinity system
npm run automation       # Run super automation
npm run telegram-bot     # Start Telegram bot
npm run generate-video   # Generate video content
npm run post-social      # Post to social media
```

### 5. Termux Mobile Control
This system is designed to run on Android via Termux:

- **Cron automation:** Daily product scouting, content generation, reports
- **Mobile CLI:** Full control from smartphone
- **Low resource usage:** Optimized for mobile hardware
- **Offline capability:** Can queue tasks when offline

---

## 🛠️ DEVELOPMENT WORKFLOWS

### Working with Agents

When modifying or creating agents:

1. **Location:** All agents in `ai-agent/agents/`
2. **Structure:** Agents should export a `run()` function
3. **Logging:** Use console.log with emoji prefixes for readability
4. **State Tracking:** Store execution results in `agent_states` table
5. **Error Handling:** Always wrap in try/catch with detailed error messages

**Example Agent Pattern:**
```javascript
// ai-agent/agents/example-agent.js
const { createClient } = require('@supabase/supabase-js');

async function run(options = {}) {
  console.log('🤖 Starting Example Agent...');

  try {
    // 1. Initialize services
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 2. Perform agent task
    const results = await performTask();

    // 3. Store state for RL
    await supabase.from('agent_states').insert({
      agent_name: 'example-agent',
      state_data: results,
      reward: calculateReward(results),
      action: 'performed_task'
    });

    console.log('✅ Agent completed successfully');
    return results;
  } catch (error) {
    console.error('❌ Agent failed:', error);
    throw error;
  }
}

module.exports = { run };
```

### Database Operations

**Reading data:**
```javascript
const { data, error } = await supabase
  .from('digistore_products')
  .select('*')
  .eq('is_promoted', true)
  .order('conversion_score', { ascending: false })
  .limit(10);
```

**Writing data:**
```javascript
const { data, error } = await supabase
  .from('generated_content')
  .insert({
    product_id: productId,
    content_type: 'video',
    content_url: videoUrl,
    platform: 'tiktok',
    content_data: metadata
  });
```

**Updating analytics:**
```javascript
const { data, error } = await supabase
  .from('campaigns')
  .update({
    total_views: totalViews,
    roi: (revenue - costs) / costs
  })
  .eq('id', campaignId);
```

### API Integration Patterns

When integrating new APIs:

1. **Create integration file:** `ai-agent/integrations/service-name.js`
2. **Environment variables:** Add to `.env.example`
3. **Error handling:** Graceful fallbacks for API failures
4. **Rate limiting:** Respect API limits (use delays if needed)
5. **Caching:** Cache responses where appropriate

### Testing Changes

Before committing:

```bash
# Test all API connections
npm test

# Test specific agent
node ai-agent/agents/your-agent.js

# Check database
node scripts/supabase-inspect.js

# Test video generation
npm run generate-video

# Test social posting (dry-run mode)
node lib/social-media/unified-poster.js --dry-run
```

---

## 🎯 COMMON TASKS & HOW TO APPROACH THEM

### Task: Add a New Product Source

1. **Create integration:** `ai-agent/integrations/new-source.js`
2. **Update product-scout:** Modify `ai-agent/agents/product-scout.js`
3. **Add database fields:** Update schema if needed (new columns in `digistore_products`)
4. **Test integration:** Use `scripts/test-apis.js` as template
5. **Document:** Update relevant docs

### Task: Improve Content Generation

1. **Locate generators:** `lib/video-generator.js`, `ai-agent/agents/viral-content-creator.js`
2. **Review prompts:** AI prompts are inline - look for Gemini/GPT calls
3. **Modify templates:** Update video templates, voiceover scripts
4. **Test output:** Generate sample content before production
5. **Track performance:** Monitor `generated_content` table metrics

### Task: Add New Social Media Platform

1. **API research:** Ensure platform has posting API
2. **Create adapter:** Add to `lib/social-media/` or `ai-agent/integrations/`
3. **Update cross-poster:** Modify `ai-agent/agents/cross-poster.js`
4. **Environment vars:** Add API credentials to `.env.example`
5. **Test posting:** Start with test account

### Task: Optimize Reinforcement Learning

1. **Review reward function:** Check `MASTER_ORCHESTRATOR.js`
2. **Analyze rl_learning table:** Query historical rewards
3. **Adjust parameters:** Tune learning_rate, exploration_rate
4. **Add metrics:** Track new performance indicators
5. **Monitor improvements:** Compare before/after analytics

### Task: Deploy to Production

1. **Review deployment docs:** `DEPLOYMENT_GUIDE.md`, `RAILWAY_DEPLOY_KOMPLETT.md`
2. **Environment setup:** Configure all `.env` variables
3. **Database migration:** Run `schema.sql` in Supabase
4. **Railway config:** Use `railway.json` configuration
5. **Health checks:** Ensure all APIs are accessible
6. **Monitoring:** Set up Telegram notifications

---

## ⚠️ IMPORTANT CONVENTIONS

### Code Style

1. **Language:** Codebase uses **German** for comments and console output (user-facing)
2. **Emoji logging:** Use emojis for log clarity (🤖 agent, ✅ success, ❌ error, 📊 data, etc.)
3. **Error messages:** Detailed, actionable error messages
4. **Async/await:** Prefer async/await over promises
5. **Destructuring:** Use destructuring for cleaner code

### File Naming

- **JavaScript files:** kebab-case (e.g., `product-scout.js`)
- **Documentation:** UPPERCASE.md (e.g., `README.md`)
- **Configuration:** lowercase (e.g., `package.json`)

### Git Workflow

- **Branch naming:** `feature/description`, `fix/description`, `claude/session-id`
- **Commit messages:** Clear, descriptive (German or English acceptable)
- **No secrets:** Never commit `.env.local` or API keys
- **Auto-backup:** Termux has auto-commit cron jobs

### Security

1. **API keys:** Always use environment variables, never hardcode
2. **Row Level Security:** Enabled on all Supabase tables
3. **Input validation:** Validate all user inputs
4. **Rate limiting:** Implement for public endpoints
5. **GDPR compliance:** EU servers, data protection

---

## 🚨 CRITICAL GOTCHAS

### 1. Supabase Client Initialization
**Always** use environment variables for initialization:
```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### 2. AI API Costs
- **Gemini:** Has generous free tier, use for frequent calls
- **GPT-4:** Expensive, use for critical content generation only
- **Claude:** Use for strategic planning, code generation
- Monitor usage to avoid unexpected bills

### 3. Termux Limitations
- **Storage:** Limited on mobile, clean up old files regularly
- **Memory:** Agents should be memory-efficient
- **Network:** May disconnect, implement retry logic
- **Cron timing:** Uses device timezone

### 4. Video Generation
- **FFmpeg required:** Install via `npm install ffmpeg-static`
- **Resource intensive:** May be slow on mobile
- **File sizes:** Optimize for social media (< 100MB)
- **Formats:** Different platforms require different formats

### 5. Social Media APIs
- **Rate limits:** All platforms have strict limits
- **Authentication:** OAuth tokens expire, implement refresh
- **Content policies:** AI-generated content must follow platform rules
- **Testing:** Use test/developer accounts first

### 6. Database Migrations
- **Backup first:** Always backup before schema changes
- **RLS policies:** Don't forget to update policies after table changes
- **Indexes:** Add indexes for frequently queried columns
- **Foreign keys:** CASCADE carefully to avoid data loss

---

## 📚 QUICK REFERENCE

### Environment Check
```bash
node -e "console.log('Node:', process.version)"
npm test                    # Test all APIs
node scripts/supabase-inspect.js  # Check database
```

### Common Queries

**Get top performing products:**
```sql
SELECT * FROM digistore_products
ORDER BY conversion_score DESC
LIMIT 10;
```

**Check recent agent activity:**
```sql
SELECT agent_name, COUNT(*) as runs, AVG(reward) as avg_reward
FROM agent_states
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_name;
```

**Campaign performance:**
```sql
SELECT c.campaign_name, c.revenue, c.costs, c.roi,
       p.product_name
FROM campaigns c
JOIN digistore_products p ON c.product_id = p.id
ORDER BY c.roi DESC;
```

### Useful Files to Reference

- **API Testing:** `scripts/test-apis.js` - Template for testing integrations
- **Supabase Setup:** `ai-agent/data/schema.sql` - Complete database schema
- **Agent Example:** `ai-agent/agents/product-scout.js` - Well-documented agent
- **Deployment:** `railway.json` - Production deployment config

---

## 🎓 LEARNING THE CODEBASE

### Start Here (Recommended Reading Order):

1. **README.md** - User-facing overview
2. **ai-agent/ARCHITECTURE.md** - System design & philosophy
3. **ai-agent/MASTER_ORCHESTRATOR.js** - Main orchestration logic
4. **ai-agent/agents/product-scout.js** - Example of agent implementation
5. **lib/supabase.js** - Database interaction patterns
6. **scripts/test-apis.js** - How APIs are tested
7. **TERMUX_SETUP.md** - Mobile deployment workflow

### Key Patterns to Understand:

1. **Agent Pattern:** Independent modules that can run standalone
2. **Event-Driven:** Agents react to data changes and schedules
3. **Data-First:** All decisions based on database state
4. **RL Loop:** Action → Reward → Learning → Optimization
5. **Zero-Budget:** Maximize free tiers, minimize costs

---

## 🤝 BEST PRACTICES FOR AI ASSISTANTS

### When Making Changes:

1. **Read existing code first:** Understand current patterns before changing
2. **Preserve German text:** Keep user-facing strings in German
3. **Add emoji logging:** Makes mobile logs easier to read
4. **Update documentation:** Keep docs in sync with code changes
5. **Test before commit:** Use `npm test` and manual testing
6. **Consider mobile:** Changes should work in Termux environment

### When Answering Questions:

1. **Provide file paths:** Use `file:line` format for references
2. **Show context:** Include surrounding code for clarity
3. **Explain trade-offs:** Discuss pros/cons of approaches
4. **Link documentation:** Reference relevant docs
5. **Mobile-first mindset:** Remember this runs on Android

### When Adding Features:

1. **Check dependencies:** Ensure mobile-compatible libraries
2. **Environment vars:** Add to `.env.example` with description
3. **Database first:** Design schema before coding
4. **Agent-based:** New features should be new agents when possible
5. **RL-ready:** Track metrics for learning system

### When Debugging:

1. **Check logs:** Review console output for emoji markers
2. **Database state:** Use `supabase-inspect.js`
3. **API connectivity:** Run `test-apis.js`
4. **Environment vars:** Verify all required vars are set
5. **Termux-specific:** Consider mobile environment limitations

---

## 🔄 DEVELOPMENT LIFECYCLE

### Local Development (PC)
```bash
git clone https://github.com/Samar220659/LinktoFunnel.git
cd LinktoFunnel
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev  # Next.js dev server
node ai-agent/MASTER_ORCHESTRATOR.js  # Test orchestrator
```

### Testing
```bash
npm test                    # All API tests
node ai-agent/agents/product-scout.js  # Individual agent
node scripts/supabase-inspect.js       # Database check
```

### Deployment to Production
```bash
# Via Railway (recommended)
./deploy-to-railway.sh

# Via Vercel (frontend only)
vercel deploy --prod

# Manual
npm run build
npm start
```

### Mobile Deployment (Termux)
```bash
# On Android device with Termux
pkg install git nodejs
git clone https://github.com/Samar220659/LinktoFunnel.git
cd LinktoFunnel
npm install
# Setup cron jobs (see TERMUX_SETUP.md)
```

---

## 📞 GETTING HELP

### Documentation Hierarchy

1. **This file (CLAUDE.md)** - AI assistant guide
2. **README.md** - User documentation
3. **ARCHITECTURE.md** - System design
4. **TERMUX_SETUP.md** - Mobile setup
5. **DEPLOYMENT_GUIDE.md** - Production deployment
6. **Code comments** - Inline documentation

### When Stuck:

1. **Search codebase:** Use grep/search for similar implementations
2. **Check schemas:** Database structure often reveals intent
3. **Review git history:** See how similar issues were solved
4. **Test incrementally:** Build features piece by piece
5. **Ask user:** When unclear, ask for clarification

### External Resources:

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Gemini API:** https://ai.google.dev/docs
- **Termux Wiki:** https://wiki.termux.com/wiki/Main_Page
- **Railway Docs:** https://docs.railway.app/

---

## 🎯 PROJECT GOALS & PHILOSOPHY

### Mission
Create a **fully autonomous business system** that generates passive income with minimal human intervention, accessible entirely from a mobile device.

### Core Principles

1. **Zero-Budget First:** Maximize free tiers, minimize costs
2. **Mobile-Native:** Must run efficiently on Android/Termux
3. **AI-Driven:** All decisions powered by AI (Gemini/GPT/Claude)
4. **Learning System:** Continuous improvement via RL
5. **German Market Focus:** Digistore24, German-speaking audience
6. **Ethical Automation:** Comply with platform policies, GDPR

### Success Metrics

- **Revenue:** €500-2000/month after 3 months (affiliate)
- **Content:** Daily AI-generated videos/posts
- **Automation:** 90%+ tasks automated
- **Mobile Operation:** Fully controllable via Termux
- **Learning:** Measurable improvement in campaign ROI

---

## 🚀 QUICK START FOR NEW AI ASSISTANTS

If you're an AI assistant encountering this codebase for the first time:

1. **Read this file completely** (you're doing it!)
2. **Scan README.md** for user perspective
3. **Review directory structure** to know where things are
4. **Check .env.example** to understand required services
5. **Look at package.json scripts** to see available commands
6. **Read MASTER_ORCHESTRATOR.js** to understand flow
7. **Explore one agent** (e.g., product-scout.js) in detail
8. **Review schema.sql** to understand data model
9. **Now you're ready to help!**

### Common User Requests:

- "Add support for [new platform]" → Create integration, update agents
- "Why isn't [agent] working?" → Check logs, test APIs, verify env vars
- "How do I deploy this?" → Point to DEPLOYMENT_GUIDE.md, assist with Railway
- "Optimize performance" → Review RL metrics, adjust parameters
- "Add new product source" → Create integration, update product-scout

---

## 📝 MAINTENANCE NOTES

### Regular Tasks

- **Weekly:** Review RL metrics, adjust learning parameters
- **Monthly:** Update dependencies (`npm update`)
- **Quarterly:** Review API costs, optimize usage
- **As needed:** Clean up old generated content, compress videos

### Known Issues & Limitations

1. **Digistore24 API:** May require web scraping (rate limits apply)
2. **TikTok API:** Requires business account verification
3. **Video generation:** CPU-intensive on mobile (consider cloud fallback)
4. **Termux cron:** Requires wake lock for reliability
5. **API keys expiration:** OAuth tokens need periodic refresh

### Future Enhancements (Roadmap)

- Advanced RL with neural networks
- Multi-language support (expand beyond German)
- WordPress auto-posting for SEO
- Product development agent (create own digital products)
- Advanced A/B testing framework
- Revenue forecasting with ML

---

## ✅ FINAL CHECKLIST FOR AI ASSISTANTS

Before making significant changes, verify:

- [ ] Read relevant documentation files
- [ ] Understand current implementation
- [ ] Changes compatible with Termux/mobile
- [ ] Environment variables properly configured
- [ ] Database schema updated if needed
- [ ] German language preserved for user output
- [ ] Emoji logging maintained
- [ ] Error handling implemented
- [ ] Testing performed locally
- [ ] Documentation updated
- [ ] No API keys committed
- [ ] Mobile resource usage considered

---

**Remember:** This is a production system generating real income. Changes should be thoughtful, tested, and documented. When in doubt, ask the user for clarification.

Happy coding! 🚀

---

**Document Version:** 1.0
**Maintained By:** AI Assistants working with this codebase
**Last Updated:** 2025-11-14
