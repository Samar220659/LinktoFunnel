# 🎯 Z.AI Image Grounding Integration

Vollständige Integration der Z.AI GLM-4.5v API für visuelle Bildanalyse und Objekt-Lokalisierung.

## 📋 Features

### Hauptfunktionen

1. **Objekt-Lokalisierung** (`findObject`)
   - Findet spezifische Objekte in Bildern
   - Gibt Bounding-Box-Koordinaten zurück: `[[xmin, ymin, xmax, ymax]]`
   - Unterstützt natürliche Sprache ("second bottle from the right")

2. **Produktbild-Analyse** (`analyzeProductImage`)
   - Identifiziert alle Produkte in einem Bild
   - Berechnet Position und Größe jedes Produkts
   - Nützlich für E-Commerce und Marketing

3. **Content-Scoring** (`scoreContentImage`)
   - Bewertet Bilder für Social Media Performance
   - Analysiert: Visual Appeal, Product Visibility, Emotional Impact
   - Gibt Empfehlungen für Optimierung

4. **Text-Erkennung** (`detectText`)
   - Erkennt Text in Bildern (OCR)
   - Gibt Position jedes Textelements zurück
   - Nützlich für Logo/Branding-Analyse

5. **Bildvergleich** (`compareImages`)
   - Vergleicht zwei Bilder nach definierten Kriterien
   - Perfekt für A/B-Testing von Marketing-Material

6. **Mehrfach-Objekt-Suche** (`findMultipleObjects`)
   - Sucht mehrere Objekte gleichzeitig
   - Batch-Processing für Effizienz

## 🚀 Installation & Setup

### 1. Dependencies

Bereits in `package.json` enthalten - keine zusätzlichen Packages nötig!

### 2. API-Key konfigurieren

Trage deinen Z.AI API-Key in `.env.local` ein:

```bash
ZAI_API_KEY=dein_api_key_hier
ZAI_API_URL=https://api.z.ai/api/paas/v4/chat/completions
```

**Wichtig:** Der bereitgestellte API-Key ist nur ein Beispiel. Du benötigst deinen eigenen Key von [Z.AI](https://z.ai).

### 3. Integration testen

```bash
# Vollständiger Test aller Funktionen
node scripts/test-image-grounding.js

# Oder Demo direkt ausführen
node ai-agent/integrations/zai-image-grounding.js
```

## 💻 Verwendung

### Basic Example

```javascript
const { ZAIClient } = require('./ai-agent/integrations/zai-image-grounding.js');

const client = new ZAIClient(process.env.ZAI_API_KEY);

// Objekt finden
const result = await client.findObject(
  'https://example.com/image.jpg',
  'Where is the product logo?'
);

console.log(result.coordinates); // [[xmin, ymin, xmax, ymax]]
```

### Erweiterte Beispiele

#### 1. Produktbild analysieren

```javascript
const analysis = await client.analyzeProductImage(imageUrl);

console.log(`Gefundene Produkte: ${analysis.productCount}`);

analysis.products.forEach(product => {
  console.log(`${product.id}:`);
  console.log(`  Position: ${JSON.stringify(product.boundingBox)}`);
  console.log(`  Fläche: ${product.area} px²`);
});
```

#### 2. Marketing-Bild bewerten

```javascript
const score = await client.scoreContentImage(imageUrl);

console.log(`Score: ${score.overallScore}/100`);
console.log(`Empfehlung: ${score.recommendation}`);
// recommendation: 'high-potential' | 'medium-potential' | 'needs-improvement'
```

#### 3. Mehrere Objekte finden

```javascript
const queries = [
  'main product',
  'price tag',
  'brand logo'
];

const results = await client.findMultipleObjects(imageUrl, queries);

Object.entries(results).forEach(([query, result]) => {
  if (result.found) {
    console.log(`✅ ${query}: ${JSON.stringify(result.coordinates[0])}`);
  }
});
```

#### 4. Fokuspunkt berechnen (für Auto-Crop)

```javascript
const result = await client.findObject(imageUrl, 'main subject');

if (result.found) {
  const focal = client.calculateFocalPoint(result.coordinates);

  console.log(`Fokuspunkt: (${focal.absoluteX}, ${focal.absoluteY})`);
  // Nutze für automatisches Cropping oder Thumbnail-Generierung
}
```

## 🎨 Use Cases für Marketing-Automation

### 1. Automatische Produktbild-Optimierung

```javascript
// Analysiere Upload
const score = await client.scoreContentImage(uploadedImage);

if (score.overallScore < 70) {
  // Sende Verbesserungsvorschläge
  console.log('Bild-Qualität nicht optimal. Empfehlungen:');
  console.log('- Produkt deutlicher hervorheben');
  console.log('- Hellere Beleuchtung verwenden');
}
```

### 2. Social Media Content-Analyse

```javascript
// Finde optimale Crop-Position für Instagram
const products = await client.analyzeProductImage(image);
const focal = client.calculateFocalPoint(
  products.products.map(p => p.boundingBox)
);

// Crop um Fokuspunkt für 1:1 Instagram-Format
const instagramCrop = {
  centerX: focal.absoluteX,
  centerY: focal.absoluteY,
  width: 1080,
  height: 1080
};
```

### 3. A/B Testing von Produktbildern

```javascript
const comparison = await client.compareImages(
  variantA_imageUrl,
  variantB_imageUrl,
  ['product visibility', 'emotional appeal', 'call-to-action clarity']
);

// Wähle beste Variante für Kampagne
```

### 4. Automatische Bild-Tags generieren

```javascript
const analysis = await client.analyzeProductImage(productImage);

const tags = analysis.products.map((p, i) =>
  `product_${i + 1}_position_${p.boundingBox.xmin}_${p.boundingBox.ymin}`
);

// Nutze für Datenbank/SEO
```

## 📊 Response-Format

### Objekt-Lokalisierung

```javascript
{
  rawResponse: "The second bottle from the right is located at [[450, 200, 550, 450]]",
  coordinates: [
    { xmin: 450, ymin: 200, xmax: 550, ymax: 450 }
  ],
  found: true,
  thinking: "..." // Optional: AI-Reasoning
}
```

### Produktanalyse

```javascript
{
  productCount: 3,
  products: [
    {
      id: "product_1",
      boundingBox: { xmin: 100, ymin: 150, xmax: 250, ymax: 400 },
      area: 37500
    },
    // ...
  ],
  coordinates: [...],
  found: true
}
```

### Content-Score

```javascript
{
  overallScore: 85,
  individualScores: [90, 85, 80, 85, 88],
  recommendation: "high-potential",
  coordinates: [...], // Key visual elements
  rawResponse: "..."
}
```

## 🔧 Technische Details

### Proxy-Support

Die Integration nutzt `curl` statt `fetch` für volle Proxy-Unterstützung. Dies ermöglicht:

- Funktioniert in Corporate-Netzwerken
- Respektiert `https_proxy` Umgebungsvariablen
- Keine zusätzlichen Proxy-Packages nötig

### Rate Limits

Prüfe die Z.AI Dokumentation für aktuelle Rate Limits. Empfehlung:

```javascript
// Für Batch-Processing: Delays einbauen
for (const image of images) {
  const result = await client.findObject(image, query);
  await new Promise(r => setTimeout(r, 1000)); // 1s delay
}
```

### Error Handling

```javascript
try {
  const result = await client.findObject(imageUrl, query);

  if (!result.found) {
    console.log('Objekt nicht gefunden - Bild prüfen');
  }
} catch (error) {
  if (error.message.includes('Access denied')) {
    console.error('API-Key ungültig oder abgelaufen');
  } else {
    console.error('Netzwerkfehler:', error.message);
  }
}
```

## 🎯 Integration in Marketing-Agent

### Beispiel: Viral Content Creator Agent

```javascript
// In: ai-agent/agents/viral-content-creator.js

const { ZAIClient } = require('../integrations/zai-image-grounding.js');

class ViralContentCreator {
  async analyzeAndOptimize(imageUrl) {
    const zai = new ZAIClient(process.env.ZAI_API_KEY);

    // 1. Score das Bild
    const score = await zai.scoreContentImage(imageUrl);

    // 2. Wenn Score niedrig: Verbesserungen vorschlagen
    if (score.overallScore < 70) {
      const products = await zai.analyzeProductImage(imageUrl);

      return {
        shouldOptimize: true,
        suggestions: [
          'Produkt-Fokus verbessern',
          `${products.productCount} Produkte gefunden - zu voll?`
        ]
      };
    }

    return { shouldOptimize: false, score: score.overallScore };
  }
}
```

## 📚 Weitere Ressourcen

- **API Dokumentation:** Siehe [Z.AI Docs](https://z.ai/docs)
- **GLM-4.5v Model:** [Model Card](https://z.ai/models/glm-4.5v)
- **Test-Skript:** `scripts/test-image-grounding.js`
- **Demo:** `node ai-agent/integrations/zai-image-grounding.js`

## 🐛 Troubleshooting

### "Access denied" Error

- Prüfe API-Key in `.env.local`
- Stelle sicher, dass Key gültig ist
- Prüfe Account-Guthaben bei Z.AI

### "fetch failed" Error

- Integration nutzt jetzt curl (sollte behoben sein)
- Prüfe Internetverbindung
- Prüfe Firewall-Einstellungen

### Keine Koordinaten gefunden

- Stelle sicherere Fragen ("Where is X?" statt "Find X")
- Verwende `thinking: enabled` für bessere Ergebnisse
- Prüfe Bildqualität (zu klein/unscharf?)

## ✅ Nächste Schritte

1. ✅ Integration erstellt
2. ✅ Test-Skripte vorhanden
3. ✅ Dokumentation komplett
4. 🔄 Eigenen API-Key eintragen
5. 🔄 In Viral Content Creator integrieren
6. 🔄 In Product Scout Agent integrieren

---

**Happy Grounding! 🎯**
