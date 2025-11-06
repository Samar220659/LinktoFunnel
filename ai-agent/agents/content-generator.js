#!/usr/bin/env node

/**
 * 🎨 CONTENT GENERATOR AGENT
 * Generiert automatisch Social Media Content mit AI
 *
 * Features:
 * - Posts für TikTok, Instagram, YouTube, Pinterest
 * - Optimierte Captions mit Hashtags
 * - Content-Kalender für 30 Tage
 * - A/B Testing Varianten
 * - Trending Topics Research
 * - ✅ LEGAL COMPLIANCE (DSGVO, UWG, EU AI Act, NetzDG)
 */

require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ===== LEGAL COMPLIANCE =====
const {
  makeCompliant,
  hasAffiliateLinks,
  generateComplianceReport
} = require('../utils/legal-compliance');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

class ContentGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.niche = null;
    this.targetPlatforms = ['tiktok', 'instagram', 'youtube', 'pinterest'];
  }

  /**
   * Hauptmethode: Generiert kompletten Content für einen Tag
   */
  async generateDailyContent(niche, affiliateProducts = []) {
    console.log(`\n🎨 Generiere Daily Content für Nische: ${niche}\n`);

    this.niche = niche;

    const content = {
      date: new Date().toISOString().split('T')[0],
      niche: niche,
      posts: {},
    };

    // Generiere Content für jede Plattform
    for (const platform of this.targetPlatforms) {
      console.log(`  📱 Generiere ${platform} Content...`);

      content.posts[platform] = await this.generatePost(
        platform,
        niche,
        affiliateProducts
      );
    }

    return content;
  }

  /**
   * Generiert einen Post für spezifische Plattform
   */
  async generatePost(platform, niche, products = []) {
    // Store niche for fallback
    this.niche = niche;

    const prompt = this.buildPrompt(platform, niche, products);

    const response = await this.callGeminiAPI(prompt, platform);
    const parsed = this.parseResponse(response, platform);

    return {
      platform: platform,
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Baut den Prompt für Gemini AI
   */
  buildPrompt(platform, niche, products) {
    const platformSpecs = {
      tiktok: {
        maxLength: 2200,
        style: 'viral, energetisch, mit Hook in ersten 3 Sekunden',
        hashtags: 5,
        cta: 'Link in Bio',
      },
      instagram: {
        maxLength: 2200,
        style: 'visuell ansprechend, storytelling, authentisch',
        hashtags: 10,
        cta: 'Link in Bio oder Swipe Up',
      },
      youtube: {
        maxLength: 5000,
        style: 'educational, detailliert, SEO-optimiert',
        hashtags: 3,
        cta: 'Link in Beschreibung',
      },
      pinterest: {
        maxLength: 500,
        style: 'inspirierend, keyword-reich, visuell fokussiert',
        hashtags: 5,
        cta: 'Pin speichern & Link klicken',
      },
    };

    const spec = platformSpecs[platform];
    const productInfo = products.length > 0
      ? `\n\nBewerbe subtil diese Affiliate-Produkte:\n${products.map(p => `- ${p.name}: ${p.description}`).join('\n')}`
      : '';

    return `
Du bist ein Expert für virales ${platform.toUpperCase()} Marketing in der "${niche}" Nische.

**Aufgabe:** Erstelle einen hochkonvertierenden Post.

**Plattform-Spezifikationen:**
- Stil: ${spec.style}
- Max. Länge: ${spec.maxLength} Zeichen
- Hashtags: ${spec.hashtags} trending Hashtags
- CTA: ${spec.cta}

**Content-Anforderungen:**
1. **Hook:** Starke erste Zeile die Aufmerksamkeit fesselt
2. **Value:** Echter Mehrwert für die Zielgruppe
3. **Story:** Emotionale Verbindung aufbauen
4. **CTA:** Klarer Call-to-Action am Ende
5. **Hashtags:** Trending + nischen-spezifisch
${productInfo}

**Format:** Gib die Antwort als JSON zurück:
\`\`\`json
{
  "hook": "Erste aufmerksamkeitsstarke Zeile",
  "caption": "Vollständiger Post-Text ohne Hashtags",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "cta": "Call-to-Action Text",
  "videoIdea": "Idee für visuellen Content (Bild/Video)",
  "bestTime": "Beste Posting-Zeit (z.B. 18:00-20:00)"
}
\`\`\`

Erstelle jetzt einen viralen ${platform.toUpperCase()} Post!
`;
  }

  /**
   * Ruft Gemini API auf (mit curl für Proxy-Support)
   */
  async callGeminiAPI(prompt, platform = 'generic') {
    // Check if API key is configured
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.log('⚠️  Gemini API key not configured, using fallback content');
      return this.generateFallbackJSON(platform);
    }

    try {
      const requestData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      // Escape für Shell
      const jsonData = requestData.replace(/'/g, "'\\''");

      // curl statt fetch (Proxy-Support)
      const curlCommand = `curl -s --location '${GEMINI_API_URL}?key=${this.apiKey}' \
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

      return data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('Gemini API Error:', error.message);

      // Fallback: Einfacher Content ohne AI
      return this.generateFallbackJSON(platform);
    }
  }

  /**
   * Parst die AI-Antwort
   */
  parseResponse(response, platform) {
    try {
      // Extrahiere JSON aus Response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                       response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        return {
          hook: parsed.hook || '',
          caption: parsed.caption || '',
          hashtags: parsed.hashtags || [],
          cta: parsed.cta || '',
          videoIdea: parsed.videoIdea || '',
          bestTime: parsed.bestTime || '18:00',
          fullText: this.buildFullPost(parsed, platform), // ✅ Platform für Legal Compliance
        };
      }

      // Fallback wenn kein JSON gefunden
      return this.parsePlainText(response, platform);

    } catch (error) {
      console.error('Parse Error:', error.message);
      return this.generateFallbackContent();
    }
  }

  /**
   * Baut den vollständigen Post zusammen
   * ✅ LEGAL COMPLIANCE: Automatische Kennzeichnung (DSGVO, UWG, EU AI Act)
   */
  buildFullPost(parsed, platform = 'default') {
    const { hook, caption, hashtags, cta } = parsed;

    // 1. Baue Original-Post
    let fullText = `${hook}\n\n${caption}\n\n${cta}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;

    // 2. Prüfe auf Affiliate-Links
    const containsAffiliateLinks = hasAffiliateLinks(fullText);

    // 3. Legal Compliance anwenden
    const complianceResult = makeCompliant(fullText, {
      platform: platform,
      hasAffiliateLinks: containsAffiliateLinks,
      isAIGenerated: true, // Immer true, da von Gemini AI generiert
      disclosureStyle: 'short', // Kurz für Social Media
      aiDisclosurePosition: 'social', // Am Ende für Social Media
      aiModel: 'gemini-pro',
      strict: true // Blockiere illegale Inhalte
    });

    // 4. Prüfe Compliance
    if (!complianceResult.success) {
      console.error('⚠️  CONTENT BLOCKED BY LEGAL COMPLIANCE:', complianceResult.error);
      console.error('Issues:', complianceResult.issues);

      // Fallback: Sichere Default-Message
      return this.getComplianceFallbackMessage(platform);
    }

    // 5. Warnungen loggen (auch wenn approved)
    if (complianceResult.issues && complianceResult.issues.length > 0) {
      const warnings = complianceResult.issues.filter(i => i.severity === 'warning');
      if (warnings.length > 0) {
        console.log(`⚠️  ${warnings.length} compliance warnings:`);
        warnings.forEach(w => console.log(`   - ${w.message}`));
      }
    }

    // 6. Compliance Report generieren
    const report = generateComplianceReport(complianceResult);
    console.log('✅ Legal Compliance:', {
      platform,
      hasAffiliate: containsAffiliateLinks,
      contentLength: report.contentLength,
      warnings: report.warnings,
      criticalIssues: report.criticalIssues
    });

    // 7. Rückgabe des compliant Content
    return complianceResult.content;
  }

  /**
   * Fallback-Message wenn Content blockiert wurde
   */
  getComplianceFallbackMessage(platform) {
    return `🤖 Automatisch generierter Content\n\n` +
           `Dieser Beitrag wurde aus Compliance-Gründen blockiert.\n\n` +
           `Bitte prüfen Sie die Logs für Details.\n\n` +
           `#ContentCompliance #DSGVO`;
  }

  /**
   * Parst Plain Text Response (falls kein JSON)
   */
  parsePlainText(text, platform) {
    const lines = text.split('\n').filter(l => l.trim());

    return {
      hook: lines[0] || '',
      caption: lines.slice(1, -3).join('\n'),
      hashtags: this.extractHashtags(text),
      cta: lines[lines.length - 2] || 'Link in Bio!',
      videoIdea: 'Visuell ansprechender Content',
      bestTime: '18:00',
      fullText: text,
    };
  }

  /**
   * Extrahiert Hashtags aus Text
   */
  extractHashtags(text) {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(h => h.substring(1));
  }

  /**
   * Generiert Fallback JSON (als String für parseResponse)
   */
  generateFallbackJSON(platform = 'generic') {
    const niche = this.niche || 'Online Geld verdienen';
    const nicheTag = niche.toLowerCase().replace(/\s+/g, '');

    // Platform-spezifische Templates
    const templates = {
      tiktok: {
        hooks: [
          `🔥 ${niche} in 2025 - Das musst du wissen!`,
          `💰 So verdienst du mit ${niche} Geld!`,
          `Niemand spricht über ${niche} - bis jetzt!`,
          `🚀 ${niche} für Anfänger - Einfach erklärt!`
        ],
        captions: [
          `Die meisten machen ${niche} falsch! Hier ist die Strategie, die wirklich funktioniert. Ich zeige dir Schritt für Schritt wie du starten kannst. 💪`,
          `Heute teile ich meine besten ${niche} Tipps, die mir geholfen haben erfolgreich zu werden. Diese Methode ist komplett kostenlos! 🎯`,
          `Wenn du mit ${niche} anfangen willst, musst du diese 3 Dinge beachten. Im Detail erkläre ich alles im Video!`
        ],
        hashtags: [nicheTag, 'fyp', 'viral', 'geldverdienen', 'tutorial', 'tipps', 'erfolg', 'motivation', 'business', 'germany'],
        cta: 'Link in Bio! 👆',
        videoIdea: 'Hook in ersten 3 Sekunden, schnelle Cuts, Text-Overlay'
      },
      instagram: {
        hooks: [
          `✨ ${niche} - Meine ehrliche Erfahrung`,
          `📊 ${niche} Strategie, die wirklich funktioniert`,
          `💡 ${niche} für Anfänger - Der komplette Guide`,
          `🎯 So starte ich heute mit ${niche}`
        ],
        captions: [
          `Nach 6 Monaten ${niche} habe ich so viel gelernt! Heute teile ich meine wichtigsten Erkenntnisse mit dir. Swipe für alle Details! ➡️\n\nWas ich gelernt habe:\n✅ Diese Strategie funktioniert\n✅ Geduld ist der Schlüssel\n✅ Konsistenz zahlt sich aus\n\nHast du Fragen? Drop sie in die Comments! 💬`,
          `${niche} komplett erklärt! 💪\n\nIch bekomme täglich Fragen dazu, also hier ist mein kompletter Guide für dich. Save diesen Post für später! 🔖\n\nSchritt für Schritt zeige ich dir, wie du anfängst und erfolgreich wirst.`,
          `Die Wahrheit über ${niche} die niemand dir sagt... 👀\n\nIn diesem Carousel teile ich meine ehrliche Erfahrung nach monatelangem Testing. Das sind die echten Ergebnisse!`
        ],
        hashtags: [nicheTag, 'geldverdienen', 'business', 'erfolg', 'tipps', 'tutorial', 'motivation', 'selbstständig', 'entrepreneur', 'germany'],
        cta: 'Link in Bio für mehr Details! 🔗',
        videoIdea: 'Carousel Post mit 5-7 Slides, visuell ansprechend'
      },
      youtube: {
        hooks: [
          `${niche} - Der komplette Anfänger Guide 2025`,
          `Wie ich mit ${niche} Geld verdiene (transparente Einblicke)`,
          `${niche} Schritt für Schritt erklärt`,
          `Die Wahrheit über ${niche} - Ehrlicher Erfahrungsbericht`
        ],
        captions: [
          `In diesem Video zeige ich dir alles über ${niche}! 🎯\n\n📚 Timestamps:\n0:00 - Einleitung\n1:30 - Was ist ${niche}?\n4:15 - Wie funktioniert es?\n8:30 - Meine Erfahrungen\n12:00 - Tipps für Anfänger\n15:45 - Fazit\n\nWenn du mit ${niche} starten willst, ist dieses Video perfekt für dich. Ich teile alles was ich gelernt habe!\n\n🔗 Wichtige Links in der Beschreibung!\n\n✅ Kanal abonnieren für mehr Content\n💬 Fragen in die Comments\n👍 Like wenn hilfreich!`,
          `${niche} komplett erklärt - von Anfang bis Erfolg! 💰\n\nIn diesem ausführlichen Tutorial zeige ich dir Schritt für Schritt wie du mit ${niche} anfängst und erfolgreich wirst.\n\nDas lernst du:\n✅ Die Grundlagen von ${niche}\n✅ Praktische Umsetzung\n✅ Häufige Fehler vermeiden\n✅ Meine besten Tipps\n✅ Tools & Ressourcen\n\nPerfekt für Anfänger und Fortgeschrittene!`
        ],
        hashtags: [nicheTag, 'tutorial', 'deutsch', 'geldverdienen'],
        cta: '👉 Links in der Beschreibung!\nAbonnieren nicht vergessen! 🔔',
        videoIdea: 'Ausführliches Tutorial Video mit Screen Recording, klare Struktur'
      },
      pinterest: {
        hooks: [
          `${niche} Tipps für 2025`,
          `So startest du mit ${niche}`,
          `${niche} Anfänger Guide`,
          `${niche} - Die besten Strategien`
        ],
        captions: [
          `Die besten ${niche} Tipps für Anfänger! Pin speichern und später umsetzen. Klick für den kompletten Guide! 📌`,
          `${niche} leicht gemacht - mit dieser Strategie funktioniert es wirklich! Mehr Details auf dem Blog.`,
          `Kompletter ${niche} Guide mit Schritt-für-Schritt Anleitung. Speichern und starten! 💪`
        ],
        hashtags: [nicheTag, 'geldverdienen', 'tipps', 'tutorial', 'anfänger'],
        cta: 'Pin speichern & Link klicken! 📌',
        videoIdea: 'Pin-Design: Vertikales Format, große Schrift, auffällige Farben'
      }
    };

    const template = templates[platform] || templates['tiktok'];
    const hookIndex = Math.floor(Math.random() * template.hooks.length);
    const captionIndex = Math.floor(Math.random() * template.captions.length);

    const fallbackContent = {
      hook: template.hooks[hookIndex],
      caption: template.captions[captionIndex],
      hashtags: template.hashtags.slice(0, platform === 'instagram' ? 10 : 5),
      cta: template.cta,
      videoIdea: template.videoIdea,
      bestTime: platform === 'tiktok' ? '18:00-20:00' : platform === 'instagram' ? '11:00-13:00' : '18:00',
    };

    // Return as JSON string for parseResponse
    return '```json\n' + JSON.stringify(fallbackContent, null, 2) + '\n```';
  }

  /**
   * Fallback Content wenn API nicht verfügbar (returns object)
   */
  generateFallbackContent() {
    const niche = this.niche || 'Online Geld verdienen';
    return {
      hook: `${niche} - Das musst du wissen! 👇`,
      caption: `Heute teile ich mit dir die wichtigsten Tipps zu ${niche}. Diese Strategie hat mir geholfen, meine Ziele zu erreichen!`,
      hashtags: [niche.toLowerCase().replace(/\s+/g, ''), 'tipps', 'tutorial', 'motivation'],
      cta: 'Link in Bio für mehr Infos! 🔗',
      videoIdea: 'Talking Head mit Text-Overlay',
      bestTime: '18:00',
      fullText: 'Fallback content - API nicht verfügbar',
    };
  }

  /**
   * Generiert Content-Kalender für 30 Tage
   */
  async generateMonthlyCalendar(niche, affiliateProducts = []) {
    console.log(`\n📅 Generiere 30-Tage Content-Kalender für: ${niche}\n`);

    const calendar = [];
    const today = new Date();

    // Generiere Content-Ideen für 30 Tage
    const contentThemes = await this.generateContentThemes(niche, 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      calendar.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('de-DE', { weekday: 'long' }),
        theme: contentThemes[i],
        platforms: this.targetPlatforms,
        status: 'planned',
      });

      // Zeige Fortschritt
      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ ${i + 1}/30 Tage geplant`);
      }
    }

    console.log('\n✅ 30-Tage Kalender erstellt!\n');
    return calendar;
  }

  /**
   * Generiert Content-Themen für mehrere Tage
   */
  async generateContentThemes(niche, days) {
    const prompt = `
Erstelle ${days} verschiedene Content-Themen für die "${niche}" Nische.

Jedes Thema sollte:
- Einzigartig und interessant sein
- Mehrwert bieten
- Viral-Potenzial haben
- Für Social Media geeignet sein

Format: Gib eine nummerierte Liste zurück:
1. Thema Titel
2. Thema Titel
...

Erstelle jetzt ${days} Themen:
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const themes = response
        .split('\n')
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return themes.slice(0, days);

    } catch (error) {
      // Fallback Themen
      return Array(days).fill(null).map((_, i) => `${niche} - Tipp #${i + 1}`);
    }
  }

  /**
   * Hashtag Research für Nische
   */
  async researchHashtags(niche, count = 30) {
    console.log(`\n🔍 Recherchiere Hashtags für: ${niche}\n`);

    const prompt = `
Du bist ein Social Media Hashtag Expert.

**Aufgabe:** Finde die ${count} besten Hashtags für die "${niche}" Nische.

**Kategorien:**
1. Trending Hashtags (hohe Reichweite)
2. Nischen-Hashtags (spezifisch)
3. Community-Hashtags (Engagement)
4. Long-tail Hashtags (wenig Konkurrenz)

**Format:** JSON Array:
\`\`\`json
{
  "trending": ["hashtag1", "hashtag2", ...],
  "niche": ["hashtag1", "hashtag2", ...],
  "community": ["hashtag1", "hashtag2", ...],
  "longtail": ["hashtag1", "hashtag2", ...]
}
\`\`\`

Erstelle jetzt die Hashtag-Liste:
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                       response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      return this.generateFallbackHashtags(niche);

    } catch (error) {
      return this.generateFallbackHashtags(niche);
    }
  }

  /**
   * Fallback Hashtags
   */
  generateFallbackHashtags(niche) {
    const base = (niche || 'geldverdienen').toLowerCase().replace(/\s+/g, '');

    return {
      trending: ['viral', 'fyp', 'trending', 'explore'],
      niche: [base, `${base}tipps`, `${base}community`, `${base}deutschland`],
      community: ['community', 'support', 'motivation', 'erfolg'],
      longtail: [`${base}anfänger`, `${base}tutorial`, `${base}2025`, `${base}erfolg`],
    };
  }
}

// ===== EXPORT =====
module.exports = { ContentGenerator };

// ===== CLI USAGE =====
if (require.main === module) {
  async function demo() {
    console.log('🎨 Content Generator Demo\n');
    console.log('='.repeat(50));

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('\n❌ GEMINI_API_KEY nicht gefunden!');
      console.error('Bitte API-Key in .env.local eintragen.\n');
      process.exit(1);
    }

    const generator = new ContentGenerator(GEMINI_API_KEY);

    // Demo: Daily Content generieren
    const niche = process.argv[2] || 'Online Geld verdienen';

    console.log(`\nNische: ${niche}`);
    console.log('Plattformen: TikTok, Instagram, YouTube, Pinterest\n');

    const affiliateProducts = [
      {
        name: 'Geld verdienen Kurs',
        description: 'Schritt-für-Schritt Anleitung zum Online Geld verdienen',
      },
    ];

    try {
      // 1. Daily Content
      console.log('\n📝 Generiere Daily Content...\n');
      const dailyContent = await generator.generateDailyContent(niche, affiliateProducts);

      console.log('\n✅ Daily Content generiert!\n');
      console.log(JSON.stringify(dailyContent, null, 2));

      // 2. Hashtag Research
      console.log('\n\n🔍 Hashtag Research...\n');
      const hashtags = await generator.researchHashtags(niche, 20);

      console.log('✅ Hashtags recherchiert!\n');
      console.log(JSON.stringify(hashtags, null, 2));

      // 3. Content Kalender
      console.log('\n\n📅 30-Tage Kalender...\n');
      const calendar = await generator.generateMonthlyCalendar(niche, affiliateProducts);

      console.log('✅ Kalender erstellt!');
      console.log(`\nErste 5 Tage:\n`);
      calendar.slice(0, 5).forEach(day => {
        console.log(`  ${day.date} (${day.dayOfWeek}): ${day.theme}`);
      });

      console.log('\n\n🎉 Demo abgeschlossen!\n');
      console.log('Nutze diesen Generator für deine tägliche Content-Produktion!\n');

    } catch (error) {
      console.error('\n❌ Fehler:', error.message);
      process.exit(1);
    }
  }

  demo();
}
