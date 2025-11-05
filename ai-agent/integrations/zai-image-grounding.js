#!/usr/bin/env node

/**
 * 🎯 Z.AI IMAGE GROUNDING INTEGRATION
 * Vollständige Integration mit Z.AI GLM-4.5v für visuelle Analyse
 *
 * Funktionen:
 * - Objekt-Lokalisierung in Bildern (Bounding Boxes)
 * - Produktbild-Analyse für Marketing
 * - Visuelle Content-Analyse
 * - Koordinaten-basierte Bildbearbeitung
 */

require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_URL = process.env.ZAI_API_URL || 'https://api.z.ai/api/paas/v4/chat/completions';

class ZAIClient {
  constructor(apiKey, apiUrl = ZAI_API_URL) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = 'glm-4.5v';
  }

  /**
   * Haupt-Methode für Chat Completions mit Bildern
   * Nutzt curl für Proxy-Kompatibilität
   */
  async chatCompletion(messages, options = {}) {
    const requestData = {
      model: this.model,
      messages: messages,
      ...options,
    };

    try {
      // Escape JSON für Shell
      const jsonData = JSON.stringify(requestData).replace(/'/g, "'\\''");

      // Nutze curl statt fetch wegen Proxy
      const curlCommand = `curl -s --location '${this.apiUrl}' \
        --header 'Authorization: ${this.apiKey}' \
        --header 'Accept-Language: en-US,en' \
        --header 'Content-Type: application/json' \
        --data '${jsonData}'`;

      const { stdout, stderr } = await execAsync(curlCommand);

      if (stderr && !stderr.includes('Trying')) {
        console.error('Curl stderr:', stderr);
      }

      const data = JSON.parse(stdout);

      if (data.error) {
        throw new Error(data.error.message || 'API request failed');
      }

      return data;

    } catch (error) {
      console.error(`Z.AI API Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Objekt-Lokalisierung: Findet Objekte und gibt Koordinaten zurück
   * @param {string} imageUrl - URL des Bildes
   * @param {string} query - Was soll gefunden werden? z.B. "second bottle from the right"
   * @returns {Object} Antwort mit Koordinaten im Format [[xmin,ymin,xmax,ymax]]
   */
  async findObject(imageUrl, query) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: `${query} Provide coordinates in [[xmin,ymin,xmax,ymax]] format`,
          },
        ],
      },
    ];

    const response = await this.chatCompletion(messages, {
      thinking: { type: 'enabled' },
    });

    return this.parseGroundingResponse(response);
  }

  /**
   * Analysiert mehrere Objekte gleichzeitig
   */
  async findMultipleObjects(imageUrl, queries) {
    const results = {};

    for (const query of queries) {
      try {
        results[query] = await this.findObject(imageUrl, query);
      } catch (error) {
        results[query] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Produktbild-Analyse für Marketing
   * Identifiziert alle Produkte im Bild mit Positionen
   */
  async analyzeProductImage(imageUrl) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this product image and identify all visible products.
For each product, provide:
1. Product name/description
2. Coordinates in [[xmin,ymin,xmax,ymax]] format
3. Visual features (color, size, prominence)

Return as structured data.`,
          },
        ],
      },
    ];

    const response = await this.chatCompletion(messages, {
      thinking: { type: 'enabled' },
    });

    return this.parseProductAnalysis(response);
  }

  /**
   * Visual Content Scoring für Marketing
   * Bewertet Bilder für Social Media Performance
   */
  async scoreContentImage(imageUrl) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this image for social media marketing potential. Rate (0-100):
1. Visual Appeal (colors, composition)
2. Product Visibility (clear focal points)
3. Emotional Impact
4. Call-to-Action clarity
5. Mobile-friendliness

Provide coordinates of key visual elements and an overall score.`,
          },
        ],
      },
    ];

    const response = await this.chatCompletion(messages, {
      thinking: { type: 'enabled' },
    });

    return this.parseContentScore(response);
  }

  /**
   * Erkennt und lokalisiert Text in Bildern
   */
  async detectText(imageUrl) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: 'Detect all text in this image. For each text element, provide the text content and coordinates in [[xmin,ymin,xmax,ymax]] format.',
          },
        ],
      },
    ];

    const response = await this.chatCompletion(messages, {
      thinking: { type: 'enabled' },
    });

    return this.parseTextDetection(response);
  }

  /**
   * Vergleicht zwei Produkt-Bilder
   * Nützlich für A/B Testing
   */
  async compareImages(imageUrl1, imageUrl2, comparisonCriteria) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl1 },
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl2 },
          },
          {
            type: 'text',
            text: `Compare these two images based on: ${comparisonCriteria.join(', ')}.
Which performs better for marketing? Provide detailed analysis.`,
          },
        ],
      },
    ];

    const response = await this.chatCompletion(messages, {
      thinking: { type: 'enabled' },
    });

    return response;
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Parst Grounding-Response und extrahiert Koordinaten
   */
  parseGroundingResponse(response) {
    try {
      const content = response.choices?.[0]?.message?.content || '';

      // Suche nach Koordinaten im Format [[x1,y1,x2,y2]]
      const coordRegex = /\[\s*\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]\s*\]/g;
      const matches = [...content.matchAll(coordRegex)];

      const coordinates = matches.map(match => ({
        xmin: parseInt(match[1]),
        ymin: parseInt(match[2]),
        xmax: parseInt(match[3]),
        ymax: parseInt(match[4]),
      }));

      return {
        rawResponse: content,
        coordinates: coordinates,
        found: coordinates.length > 0,
        thinking: response.choices?.[0]?.message?.thinking || null,
      };
    } catch (error) {
      console.error('Parse error:', error.message);
      return {
        rawResponse: response,
        coordinates: [],
        found: false,
        error: error.message,
      };
    }
  }

  /**
   * Parst Produktanalyse-Response
   */
  parseProductAnalysis(response) {
    const parsed = this.parseGroundingResponse(response);

    return {
      ...parsed,
      productCount: parsed.coordinates.length,
      products: parsed.coordinates.map((coord, i) => ({
        id: `product_${i + 1}`,
        boundingBox: coord,
        area: (coord.xmax - coord.xmin) * (coord.ymax - coord.ymin),
      })),
    };
  }

  /**
   * Parst Content-Score
   */
  parseContentScore(response) {
    const content = response.choices?.[0]?.message?.content || '';
    const parsed = this.parseGroundingResponse(response);

    // Versuche Scores zu extrahieren
    const scoreRegex = /(\d+)\/100|(\d+)%/g;
    const scores = [...content.matchAll(scoreRegex)].map(m =>
      parseInt(m[1] || m[2])
    );

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      ...parsed,
      overallScore: Math.round(avgScore),
      individualScores: scores,
      recommendation: avgScore > 70 ? 'high-potential' : avgScore > 50 ? 'medium-potential' : 'needs-improvement',
    };
  }

  /**
   * Parst Text-Detection
   */
  parseTextDetection(response) {
    const parsed = this.parseGroundingResponse(response);
    const content = response.choices?.[0]?.message?.content || '';

    // Versuche Text-Inhalte zu extrahieren
    // Dies ist eine einfache Implementierung - kann verbessert werden
    const lines = content.split('\n').filter(line => line.trim());

    return {
      ...parsed,
      textElements: parsed.coordinates.map((coord, i) => ({
        boundingBox: coord,
        text: lines[i] || 'N/A',
      })),
    };
  }

  /**
   * Berechnet den Fokuspunkt eines Bildes
   * Nützlich für automatisches Cropping
   */
  calculateFocalPoint(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return { x: 0.5, y: 0.5 }; // Mitte als Fallback
    }

    // Berechne Zentrum aller Bounding Boxes
    const centers = coordinates.map(coord => ({
      x: (coord.xmin + coord.xmax) / 2,
      y: (coord.ymin + coord.ymax) / 2,
    }));

    const avgX = centers.reduce((sum, c) => sum + c.x, 0) / centers.length;
    const avgY = centers.reduce((sum, c) => sum + c.y, 0) / centers.length;

    // Normalisiere (angenommen das Bild ist 1000x1000)
    return {
      x: avgX / 1000,
      y: avgY / 1000,
      absoluteX: Math.round(avgX),
      absoluteY: Math.round(avgY),
    };
  }
}

// ===== EXPORT =====

module.exports = { ZAIClient };

// ===== CLI USAGE =====

if (require.main === module) {
  const client = new ZAIClient(ZAI_API_KEY);

  async function demo() {
    console.log('🎯 Z.AI Image Grounding Demo\n');

    // Demo-Bild (aus deinem Beispiel)
    const testImage = 'https://cloudcovert-1305175928.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87grounding.PNG';

    try {
      console.log('1. Object Detection Test...\n');

      const result = await client.findObject(
        testImage,
        'Where is the second bottle of beer from the right on the table?'
      );

      console.log('Result:');
      console.log(`Found: ${result.found}`);
      console.log(`Coordinates: ${JSON.stringify(result.coordinates, null, 2)}`);
      console.log(`\nRaw Response:\n${result.rawResponse}\n`);

      if (result.coordinates.length > 0) {
        const focal = client.calculateFocalPoint(result.coordinates);
        console.log(`\nFocal Point: (${focal.absoluteX}, ${focal.absoluteY})`);
      }

      console.log('\n2. Product Analysis Test...\n');

      const analysis = await client.analyzeProductImage(testImage);
      console.log(`Products found: ${analysis.productCount}`);
      console.log('Products:', JSON.stringify(analysis.products, null, 2));

    } catch (error) {
      console.error('Demo failed:', error.message);
      console.error('\nMake sure your ZAI_API_KEY is set in .env.local');
    }
  }

  demo();
}
