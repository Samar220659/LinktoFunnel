# LinktoFunnel Main Helper

Zentralisierte Utility-Bibliothek für den AI-powered LinktoFunnel Business Agent.

## 📋 Übersicht

Der Main Helper bietet eine umfassende Sammlung von Utilities und Klassen für:

- ✅ **Initialisierung & Setup** - Systeminitialisierung und Konfigurationsverwaltung
- 🔧 **Error Handling** - Zentralisierte Fehlerbehandlung mit Retry-Logik
- 📝 **Logging** - Farbcodierte Console-Ausgaben mit verschiedenen Log-Levels
- 💾 **State Management** - Verwaltung des Systemzustands mit Supabase-Persistenz
- 🗄️ **Database Helpers** - Vereinfachte Datenbankoperationen (CRUD)
- 📊 **Metrics Calculator** - Berechnungen für ROI, Conversion Rate, CPA, etc.
- 🔄 **Workflow Manager** - Orchestrierung komplexer Multi-Step-Workflows
- 🌐 **API Helper** - Vereinfachte HTTP-Requests mit Timeout und Retry
- 📢 **Notifications** - Telegram-Benachrichtigungen und Report-Formatierung
- 🛠️ **Utilities** - Verschiedene Hilfsfunktionen (Datum, ID-Generierung, etc.)

## 🚀 Installation

```bash
# Bereits installiert in LinktoFunnel
import MainHelper from './lib/main-helper.js';
```

## 📖 Verwendung

### Basis-Initialisierung

```javascript
import MainHelper from './lib/main-helper.js';

const helper = new MainHelper();
await helper.initialize();

// Zugriff auf Komponenten
const db = helper.getDB();
const state = helper.getState();
const workflow = helper.getWorkflow();
const logger = helper.getLogger();

// System herunterfahren
await helper.shutdown();
```

### Logger

```javascript
import { logger } from './lib/main-helper.js';

logger.debug('Debug-Information');
logger.info('Informative Nachricht');
logger.warn('Warnung');
logger.error('Fehler aufgetreten');
logger.success('Erfolgreich abgeschlossen');

logger.section('ABSCHNITTSTITEL');
logger.step(1, 'Produktanalyse');
```

**Output:**
```
==============================================================
ABSCHNITTSTITEL
==============================================================

► SCHRITT 1: Produktanalyse

[2024-10-24T10:30:45.123Z] [INFO] Informative Nachricht
[2024-10-24T10:30:46.456Z] [SUCCESS] Erfolgreich abgeschlossen
```

### Database Helper

```javascript
const db = helper.getDB();

// Query
const products = await db.query('digistore_products', {
  where: { status: 'active' },
  orderBy: { column: 'conversion_rate', ascending: false },
  limit: 10,
});

// Insert
const newCampaign = await db.insert('campaigns', {
  name: 'Q4 Marketing',
  product_id: 'prod-123',
  status: 'active',
});

// Update
await db.update('campaigns', campaignId, {
  status: 'paused',
  updated_at: new Date().toISOString(),
});

// Delete
await db.delete('campaigns', campaignId);

// Upsert
await db.upsert('agent_states', stateData, 'id');
```

### State Management

```javascript
const state = helper.getState();

// Laden (wird automatisch bei initialize() aufgerufen)
await state.load();

// Lesen
const balance = state.get('balance', 0);
const allState = state.getAll();

// Setzen
state.set('balance', 1000);

// Update (mehrere Werte)
state.update({
  balance: 1500,
  total_revenue: 5000,
  total_costs: 3500,
});

// Speichern
await state.save();
```

### Workflow Manager

```javascript
const workflow = helper.getWorkflow();

// Steps hinzufügen
workflow.addStep('Product Discovery', async () => {
  const products = await fetchProducts();
  return { products };
}, {
  retries: 5,
  timeout: 60000,
  critical: true, // Workflow stoppt bei Fehler
});

workflow.addStep('Content Generation', async () => {
  const content = await generateContent();
  return { content };
}, {
  retries: 3,
  critical: false, // Workflow läuft weiter bei Fehler
});

// Workflow ausführen
const results = await workflow.execute();

console.log(results);
// {
//   'Product Discovery': { products: [...] },
//   'Content Generation': { content: {...} }
// }
```

### Error Handling

```javascript
import { ErrorHandler, AppError } from './lib/main-helper.js';

// Retry-Mechanismus
const result = await ErrorHandler.retry(
  async () => {
    // Potenziell fehleranfällige Operation
    return await fetchFromAPI();
  },
  5, // max retries
  1000, // initial delay (exponential backoff)
  'API Fetch' // context
);

// Wrapped async function
const safeFetch = ErrorHandler.wrapAsync(async () => {
  const data = await fetch('https://api.example.com');
  return data.json();
}, 'External API');

const data = await safeFetch(); // Gibt null zurück bei Fehler

// Custom Error
throw new AppError(
  'Database connection failed',
  'DB_CONNECTION_ERROR',
  { host: 'localhost', port: 5432 }
);
```

### Metrics Calculator

```javascript
import { MetricsCalculator } from './lib/main-helper.js';

const revenue = 5000;
const costs = 2000;
const conversions = 50;
const impressions = 10000;

// Finanz-Metriken
const roi = MetricsCalculator.calculateROI(revenue, costs); // 150%
const profit = MetricsCalculator.calculateProfit(revenue, costs); // 3000

// Marketing-Metriken
const conversionRate = MetricsCalculator.calculateConversionRate(conversions, impressions); // 0.5%
const cpa = MetricsCalculator.calculateCPA(costs, conversions); // 40€

// Formatierung
const formattedRevenue = MetricsCalculator.formatCurrency(revenue); // "5.000,00 €"
const formattedROI = MetricsCalculator.formatPercentage(roi); // "150.00%"
const formattedNumber = MetricsCalculator.formatNumber(impressions); // "10.000"
```

### API Helper

```javascript
import { APIHelper } from './lib/main-helper.js';

// GET Request
const data = await APIHelper.get('https://api.example.com/products', {
  headers: { 'Authorization': 'Bearer token' },
  timeout: 30000,
});

// POST Request
const result = await APIHelper.post('https://api.example.com/campaigns', {
  name: 'New Campaign',
  budget: 500,
}, {
  headers: { 'Content-Type': 'application/json' },
});

// PUT Request
await APIHelper.put('https://api.example.com/campaigns/123', {
  status: 'paused',
});

// DELETE Request
await APIHelper.delete('https://api.example.com/campaigns/123');
```

### Notifications

```javascript
import { NotificationHelper, MetricsCalculator } from './lib/main-helper.js';

// Einfache Nachricht
await NotificationHelper.sendTelegram('🚀 Neue Kampagne gestartet!');

// Formatierter Report
const reportData = {
  balance: 1500,
  revenue: 5000,
  costs: 2000,
  profit: 3000,
  roi: 150,
  activeCampaigns: 5,
  conversions: 50,
  conversionRate: 2.5,
  productsAnalyzed: 42,
  topProduct: 'AI Marketing Kurs',
};

const report = NotificationHelper.formatReport(reportData);
await NotificationHelper.sendTelegram(report);
```

**Output:**
```
📊 LinktoFunnel Report

📅 Datum: 24.10.2024
⏰ Zeit: 10:30:45

💰 Finanzen
└ Balance: 1.500,00 €
└ Umsatz: 5.000,00 €
└ Kosten: 2.000,00 €
└ Gewinn: 3.000,00 €
└ ROI: 150.00%

📈 Kampagnen
└ Aktiv: 5
└ Conversions: 50
└ Conversion Rate: 2.50%

🎯 Produkte
└ Analysiert: 42
└ Top Produkt: AI Marketing Kurs

✨ Erstellt von LinktoFunnel AI
```

### Utilities

```javascript
import { Utils } from './lib/main-helper.js';

// Sleep
await Utils.sleep(2000); // 2 Sekunden warten

// Datum/Zeit
const date = Utils.formatDate(new Date()); // "24.10.2024"
const time = Utils.formatTime(new Date()); // "10:30:45"
const dateTime = Utils.formatDateTime(new Date()); // "24.10.2024 10:30:45"

// ID-Generierung
const id = Utils.generateId(); // "1729762245123-x5k8p9m2a"

// Dateiname-Sanitierung
const filename = Utils.sanitizeFilename('Mein Produkt! @2024.json'); // "mein_produkt__2024.json"

// Verzeichnis erstellen
Utils.ensureDir('./data/products');

// JSON lesen/schreiben
const data = Utils.readJSON('./data/config.json');
Utils.writeJSON('./data/output.json', { result: 'success' });

// Array-Utilities
const chunks = Utils.chunk([1, 2, 3, 4, 5, 6], 2); // [[1,2], [3,4], [5,6]]
const randomItem = Utils.randomChoice(['A', 'B', 'C']); // Zufälliges Element
const randomNum = Utils.randomInt(1, 100); // Zufällige Zahl zwischen 1-100
```

## 🏗️ Architektur

```
MainHelper
├── Logger                  # Farbcodierte Console-Ausgaben
├── ConfigManager          # Environment-Validierung
├── DatabaseHelper         # Supabase CRUD-Operationen
├── StateManager           # System State Management
├── MetricsCalculator      # ROI, Conversion Rate, etc.
├── WorkflowManager        # Multi-Step Workflows
├── APIHelper              # HTTP Requests
├── NotificationHelper     # Telegram & Reports
├── ErrorHandler           # Retry & Error Handling
└── Utils                  # Verschiedene Utilities
```

## 🎯 Use Cases

### 1. Master Orchestrator Integration

```javascript
import MainHelper from './lib/main-helper.js';

async function runDailyAutomation() {
  const helper = new MainHelper();
  await helper.initialize();

  const workflow = helper.getWorkflow();
  const state = helper.getState();

  workflow.addStep('Product Analysis', async () => {
    // Digistore24 scraping
  });

  workflow.addStep('Content Generation', async () => {
    // Viral content creation
  });

  workflow.addStep('Campaign Optimization', async () => {
    // ROI optimization
  });

  const results = await workflow.execute();

  await NotificationHelper.sendTelegram(
    NotificationHelper.formatReport({...})
  );

  await helper.shutdown();
}
```

### 2. Agent Integration

```javascript
import MainHelper, { logger } from './lib/main-helper.js';

class ProductScout {
  constructor(helper) {
    this.db = helper.getDB();
    this.state = helper.getState();
  }

  async discover() {
    logger.section('PRODUCT DISCOVERY');

    const products = await this.scrapeDigistore24();

    await this.db.insert('digistore_products', products);

    logger.success(`${products.length} Produkte gespeichert`);
  }
}
```

### 3. Standalone Script

```javascript
import MainHelper, { MetricsCalculator } from './lib/main-helper.js';

async function analyzePerformance() {
  const helper = new MainHelper();
  await helper.initialize();

  const campaigns = await helper.getDB().query('campaigns', {
    where: { status: 'active' },
  });

  for (const campaign of campaigns) {
    const roi = MetricsCalculator.calculateROI(
      campaign.revenue,
      campaign.costs
    );

    if (roi < 50) {
      await helper.getDB().update('campaigns', campaign.id, {
        status: 'paused',
      });
    }
  }

  await helper.shutdown();
}
```

## 🔍 Health Check

```javascript
const helper = new MainHelper();
await helper.initialize();

const health = await helper.healthCheck();

// Returns:
// {
//   config: true,
//   database: true,
//   openai: true,
//   gemini: true,
// }
```

## 🌟 Features

### Automatisches Retry mit Exponential Backoff
```javascript
// Automatische Wiederholungsversuche bei Fehlern
await ErrorHandler.retry(operation, 5, 1000, 'Context');
// Versuche: 1s, 2s, 4s, 8s, 16s Delay
```

### Workflow Error Recovery
```javascript
// Non-critical steps setzen Workflow fort
workflow.addStep('Optional Step', async () => {
  // ...
}, { critical: false });
```

### Timeout Protection
```javascript
// Automatische Timeouts für alle Operationen
workflow.addStep('API Call', async () => {
  // ...
}, { timeout: 30000 }); // 30 Sekunden
```

### State Persistenz
```javascript
// Automatisches Speichern in Supabase
state.update({ balance: 1000 });
await state.save(); // Persistent in DB
```

## 📚 API Reference

Vollständige API-Dokumentation siehe: [examples/main-helper-usage.js](../examples/main-helper-usage.js)

## 🤝 Integration mit bestehenden Systemen

### MASTER_ORCHESTRATOR.js

```javascript
import MainHelper from './lib/main-helper.js';

const helper = new MainHelper();
await helper.initialize();

// Nutze helper.getDB(), helper.getState(), helper.getWorkflow()
```

### SUPER_AUTOMATION.js

```javascript
import { logger, MetricsCalculator, NotificationHelper } from './lib/main-helper.js';

// Verwende Logger für farbcodierte Ausgaben
// Nutze MetricsCalculator für Berechnungen
// Sende Reports mit NotificationHelper
```

### Agents (product-scout.js, viral-content-creator.js, etc.)

```javascript
import { logger, ErrorHandler } from './lib/main-helper.js';

// Verwende Logger und ErrorHandler in allen Agents
```

## ⚙️ Konfiguration

Erforderliche Environment-Variablen in `.env.local`:

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_KEY=your_gemini_key

# Optional
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id
DIGISTORE24_API_KEY=your_digistore_key
GETRESPONSE_API_KEY=your_getresponse_key
```

## 🧪 Testing

```bash
# Beispiele ausführen
node examples/main-helper-usage.js

# Health Check
node -e "import('./lib/main-helper.js').then(m => { const h = new m.default(); h.initialize().then(() => h.healthCheck()).then(() => h.shutdown()); })"
```

## 📝 Best Practices

1. **Immer initialize() aufrufen** vor der Verwendung
2. **Immer shutdown() aufrufen** am Ende
3. **Nutze WorkflowManager** für komplexe Multi-Step-Operationen
4. **Nutze ErrorHandler.retry()** für fehleranfällige Operationen
5. **Speichere State regelmäßig** mit `state.save()`
6. **Verwende Logger** statt console.log für bessere Lesbarkeit
7. **Formatiere Zahlen** mit MetricsCalculator für konsistente Ausgabe

## 🐛 Troubleshooting

### "Missing required environment variables"
→ Überprüfe `.env.local` Datei

### "Database query failed"
→ Stelle sicher, dass Supabase korrekt konfiguriert ist

### "Operation timed out"
→ Erhöhe das Timeout in der Workflow-Step-Konfiguration

### "Failed to send Telegram notification"
→ Überprüfe `TELEGRAM_BOT_TOKEN` und `TELEGRAM_CHAT_ID`

## 📄 Lizenz

Teil des LinktoFunnel-Projekts

## 👨‍💻 Autor

LinktoFunnel Team

---

**Made with ❤️ for autonomous AI business automation**
