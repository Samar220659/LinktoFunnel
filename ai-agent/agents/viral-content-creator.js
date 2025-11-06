#!/usr/bin/env node

/**
 * 🎬 VIRAL CONTENT CREATOR AGENT
 * Erstellt hochviralen Content mit "Super-Seller" Charakter
 *
 * Features:
 * - Viral Hooks & Scripts
 * - Platform-optimiert (TikTok, Reels, Shorts)
 * - Super-Seller Persona
 * - Psychologische Trigger
 * - Trend-Integration
 * - ✅ LEGAL COMPLIANCE (DSGVO, UWG, EU AI Act, NetzDG)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// ===== LEGAL COMPLIANCE =====
const {
  makeCompliant,
  hasAffiliateLinks,
  generateComplianceReport
} = require('../utils/legal-compliance');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Super-Seller AI Persona
const SUPER_SELLER_PERSONA = `
Du bist der beste Verkäufer der Welt - charismatisch, authentisch, und viral.

CHARAKTER:
- Energetisch & enthusiastisch (wie Alex Hormozi)
- Direkt & ehrlich (kein Bullshit)
- Storyteller (emotionale Verbindung)
- Pattern Interrupt (stoppt Scrolling sofort)
- Call-to-Action Master (FOMO + Dringlichkeit)

SPRACHE:
- Kurze, knackige Sätze
- Power-Wörter: "Verrückt", "Krass", "Geheim", "Exklusiv"
- Zahlen & Fakten (Glaubwürdigkeit)
- Fragen stellen (Engagement)
- Emoji strategisch (📈💰🔥)

VIRAL-FORMEL:
1. Hook (0-3 Sek): Schock-Moment / Überraschung
2. Value (3-15 Sek): Transformation zeigen
3. Proof (15-30 Sek): Social Proof / Ergebnisse
4. CTA (30-60 Sek): Klare Handlungsaufforderung

PSYCHOLOGIE:
- FOMO (Fear of Missing Out)
- Autorität & Expertise
- Social Proof (andere machen's auch)
- Knappheit (limitiert!)
- Reziprozität (gib zuerst Wert)
`;

// Viral Hooks Library (proven winners)
const VIRAL_HOOKS = {
  shock: [
    "Niemand hat dir das je gesagt über [THEMA]...",
    "Das Geheimnis der Reichen: [THEMA]",
    "In 30 Sekunden wirst du [ERGEBNIS]...",
    "Stop! Scrolle nicht weiter wenn du [ZIEL] willst",
    "Ich habe [X EURO] in 30 Tagen gemacht mit...",
  ],
  question: [
    "Warum verdienst du noch kein Geld mit [THEMA]?",
    "Was wäre wenn [BENEFIT]?",
    "Willst du wissen wie [ERGEBNIS]?",
    "Kennst du den Trick für [THEMA]?",
    "Wie würde sich dein Leben ändern mit [BENEFIT]?",
  ],
  controversy: [
    "Alle lügen über [THEMA] - hier ist die Wahrheit",
    "[THEMA] ist ein Scam - außer du machst DAS",
    "Vergiss [ALTE METHODE] - [NEUE METHODE] ist 10x besser",
    "Die Industrie hasst diesen Trick...",
    "Warum [THEMA] nicht funktioniert (und was stattdessen)",
  ],
  story: [
    "Vor [X ZEIT] war ich [PAIN POINT]...",
    "Mein [MENTOR/FREUND] zeigte mir [LÖSUNG]...",
    "Ich habe [FEHLER] gemacht - so kannst du ihn vermeiden",
    "Der Tag als alles sich änderte...",
    "Niemand glaubte mir als ich sagte...",
  ],
  urgency: [
    "Nur noch [X ZEIT] verfügbar!",
    "Die ersten [X PERSONEN] bekommen...",
    "Dieses Angebot läuft in [X STUNDEN]",
    "Bevor es zu spät ist...",
    "Letzte Chance für [BENEFIT]",
  ]
};

// Platform-specific optimizations
const PLATFORM_SPECS = {
  tiktok: {
    duration: [15, 30, 60],
    aspectRatio: '9:16',
    hooks: ['shock', 'question', 'controversy'],
    hashtags: 12,
    music: 'trending',
    captions: 'short + emojis',
    style: 'fast-paced, energetic, authentic',
  },
  instagram: {
    duration: [15, 30, 60, 90],
    aspectRatio: '9:16',
    hooks: ['story', 'question', 'urgency'],
    hashtags: 30,
    music: 'trending or original',
    captions: 'medium + call-to-action',
    style: 'polished, aesthetic, aspirational',
  },
  youtube: {
    duration: [60, 90, 120],
    aspectRatio: '9:16',
    hooks: ['shock', 'story', 'controversy'],
    hashtags: 10,
    music: 'royalty-free',
    captions: 'detailed + timestamps',
    style: 'educational, value-first, authority',
  },
  pinterest: {
    duration: [6, 15, 30],
    aspectRatio: '2:3',
    hooks: ['question', 'urgency', 'story'],
    hashtags: 20,
    music: 'optional',
    captions: 'SEO-optimized',
    style: 'inspirational, tutorial, lifestyle',
  }
};

class ViralContentCreator {
  constructor() {
    this.generatedContent = [];
  }

  async generateViralScript(product, platform = 'tiktok', hookType = 'shock') {
    console.log(`\n🎬 Generiere viralen Script für: ${product.product_name}`);
    console.log(`   📱 Platform: ${platform.toUpperCase()}`);
    console.log(`   🎯 Hook-Type: ${hookType}`);

    const spec = PLATFORM_SPECS[platform];
    const hook = this.getRandomHook(hookType);

    const prompt = `
${SUPER_SELLER_PERSONA}

AUFGABE: Erstelle ein virales ${platform.toUpperCase()} Script für dieses Produkt:

PRODUKT:
- Name: ${product.product_name}
- Kategorie: ${product.category}
- Commission: ${product.commission_rate}%

PLATFORM: ${platform}
- Dauer: ${spec.duration[0]}-${spec.duration[1]} Sekunden
- Style: ${spec.style}
- Hook-Template: "${hook}"

ERSTELLE:
1. Viral Hook (0-3 Sek) - basierend auf Template
2. Value Proposition (3-15 Sek) - Transformation
3. Social Proof (15-30 Sek) - Ergebnisse/Testimonials
4. Call-to-Action (30-45 Sek) - FOMO + Link

FORMAT (JSON):
{
  "hook": "Schock-Öffner in 1 Satz",
  "value": "Transformation/Benefit in 2-3 Sätzen",
  "proof": "Social Proof / Zahlen / Ergebnisse",
  "cta": "Klarer Call-to-Action mit Dringlichkeit",
  "visual_directions": "Was man im Video sehen soll",
  "captions": "Text-Overlays für das Video",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "music_vibe": "Typ der Musik die passen würde"
}

WICHTIG:
- Extrem kurz & prägnant
- Jedes Wort zählt
- Emotionen triggern
- Pattern Interrupt
- Viral potential maximieren
`;

    try {
      const response = await this.callGeminiAI(prompt);
      const script = this.parseAIResponse(response);

      if (script) {
        console.log('\n✅ Script generiert!');
        console.log(`   Hook: "${script.hook.substring(0, 50)}..."`);
        console.log(`   Hashtags: ${script.hashtags?.length || 0}`);

        // ===== LEGAL COMPLIANCE =====
        // Baue vollständigen Text für Compliance-Check
        const fullText = `${script.hook}\n\n${script.value}\n\n${script.proof}\n\n${script.cta}`;

        // Prüfe auf Affiliate-Links (Produkt ist immer Affiliate!)
        const hasAffiliate = true; // Alle DigiStore24 Produkte sind Affiliate

        // Compliance anwenden
        const complianceResult = makeCompliant(fullText, {
          platform: platform,
          hasAffiliateLinks: hasAffiliate,
          isAIGenerated: true,
          disclosureStyle: platform === 'tiktok' ? 'minimal' : 'short',
          aiDisclosurePosition: 'social',
          aiModel: 'gemini-pro',
          strict: true
        });

        // Check ob Content blockiert wurde
        if (!complianceResult.success) {
          console.error('❌ CONTENT BLOCKED BY LEGAL COMPLIANCE:', complianceResult.error);
          console.error('Issues:', complianceResult.issues);
          return null;
        }

        // Warnungen loggen
        const warnings = complianceResult.issues.filter(i => i.severity === 'warning');
        if (warnings.length > 0) {
          console.log(`⚠️  ${warnings.length} compliance warnings:`);
          warnings.forEach(w => console.log(`   - ${w.message}`));
        }

        // Compliance Report
        const report = generateComplianceReport(complianceResult);
        console.log('✅ Legal Compliance:', {
          platform,
          hasAffiliate,
          contentLength: report.contentLength,
          warnings: report.warnings
        });

        // Füge compliant Text zum Script hinzu
        script.fullTextCompliant = complianceResult.content;
        script.complianceReport = report;

        return {
          product_id: product.id,
          platform: platform,
          script: script,
          created_at: new Date().toISOString(),
        };
      }

    } catch (error) {
      console.error(`❌ Script-Generierung fehlgeschlagen: ${error.message}`);
      return null;
    }
  }

  getRandomHook(type) {
    const hooks = VIRAL_HOOKS[type] || VIRAL_HOOKS.shock;
    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  async callGeminiAI(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9, // Kreativität für viralen Content
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  parseAIResponse(text) {
    try {
      // Suche JSON im Text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (err) {
      console.error('JSON Parse Error:', err.message);
      return null;
    }
  }

  async generateContentForProduct(product) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 Content-Generierung für: ${product.product_name}`);
    console.log('='.repeat(70));

    const platforms = ['tiktok', 'instagram', 'youtube'];
    const hookTypes = ['shock', 'question', 'story'];
    const contentPieces = [];

    for (const platform of platforms) {
      const hookType = hookTypes[Math.floor(Math.random() * hookTypes.length)];

      const content = await this.generateViralScript(product, platform, hookType);

      if (content) {
        contentPieces.push(content);

        // Speichere in Supabase
        try {
          await supabase
            .from('generated_content')
            .insert({
              product_id: product.id,
              content_type: 'video_script',
              platform: platform,
              content_data: content.script,
            });

          console.log(`   💾 Gespeichert in Datenbank`);

        } catch (error) {
          console.log(`   ⚠️  DB-Speicherung übersprungen: ${error.message}`);
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ ${contentPieces.length}/${platforms.length} Content-Pieces erstellt\n`);

    return contentPieces;
  }

  async generateContentForAllProducts() {
    console.log('\n🎬 VIRAL CONTENT CREATOR - BATCH GENERIERUNG\n');

    try {
      // Hole Top 5 Produkte
      const { data: products, error } = await supabase
        .from('digistore_products')
        .select('*')
        .order('conversion_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!products || products.length === 0) {
        console.log('⚠️  Keine Produkte gefunden. Bitte erst Produkte importieren.');
        return;
      }

      console.log(`📦 ${products.length} Produkte für Content-Generierung\n`);

      for (const product of products) {
        await this.generateContentForProduct(product);
      }

      console.log('🎉 Alle Content-Pieces generiert!\n');

    } catch (error) {
      console.error(`❌ Fehler: ${error.message}`);
    }
  }

  // Export als Markdown für manuelles Review
  async exportContentToMarkdown(outputFile = 'data/generated-content.md') {
    console.log('\n📝 Exportiere Content zu Markdown...');

    try {
      const { data: content, error } = await supabase
        .from('generated_content')
        .select('*, digistore_products(*)')
        .eq('content_type', 'video_script')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let markdown = '# 🎬 Generierter Viraler Content\n\n';
      markdown += `Generiert am: ${new Date().toLocaleString('de-DE')}\n\n`;
      markdown += `Total Content-Pieces: ${content?.length || 0}\n\n`;
      markdown += '---\n\n';

      if (content && content.length > 0) {
        content.forEach((item, index) => {
          const script = item.content_data;
          const product = item.digistore_products;

          markdown += `## ${index + 1}. ${product?.product_name || 'Produkt'}\n\n`;
          markdown += `**Platform:** ${item.platform?.toUpperCase()}\n\n`;

          markdown += `### 🎯 Hook\n${script.hook}\n\n`;
          markdown += `### 💎 Value\n${script.value}\n\n`;
          markdown += `### ✅ Proof\n${script.proof}\n\n`;
          markdown += `### 🔥 CTA\n${script.cta}\n\n`;

          if (script.visual_directions) {
            markdown += `### 📹 Visual Directions\n${script.visual_directions}\n\n`;
          }

          if (script.captions) {
            markdown += `### 📝 Captions\n${script.captions}\n\n`;
          }

          if (script.hashtags) {
            markdown += `### #️⃣ Hashtags\n${script.hashtags.join(' ')}\n\n`;
          }

          markdown += '---\n\n';
        });
      }

      fs.writeFileSync(outputFile, markdown);
      console.log(`✅ Export erfolgreich: ${outputFile}\n`);

    } catch (error) {
      console.log(`⚠️  Export übersprungen: ${error.message}`);
    }
  }
}

// CLI Interface
async function main() {
  const creator = new ViralContentCreator();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║           🎬 VIRAL CONTENT CREATOR                             ║');
  console.log('║           Super-Seller AI Powered                              ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  await creator.generateContentForAllProducts();
  await creator.exportContentToMarkdown();

  console.log('🎉 Fertig! Content ready für Cross-Posting!\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n💥 Error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { ViralContentCreator, SUPER_SELLER_PERSONA, VIRAL_HOOKS };
