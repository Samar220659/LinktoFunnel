#!/usr/bin/env node

// 💰 QUICK MONEY SETUP
// Minimales Setup für schnellste Geld-Generierung

import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

// Colors
const colors = {
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`
};

async function main() {
  console.clear();
  console.log(colors.cyan(colors.bold('\n╔═══════════════════════════════════════════════╗')));
  console.log(colors.cyan(colors.bold('║   💰 QUICK MONEY SETUP - €500 in 14 Tagen    ║')));
  console.log(colors.cyan(colors.bold('╚═══════════════════════════════════════════════╝\n')));

  // Step 1: Nische wählen
  console.log(colors.yellow('📊 SCHRITT 1: Wähle deine Nische\n'));
  console.log('Die profitabelsten Nischen für schnelles Geld:\n');
  console.log('1. 💰 Geld verdienen online (Affiliate, E-Commerce)');
  console.log('2. 🏋️  Fitness & Abnehmen');
  console.log('3. 💑 Dating & Beziehungen');
  console.log('4. 📈 Trading & Krypto');
  console.log('5. 🎓 Online-Kurse erstellen');
  console.log('6. 🎯 Andere (eigene Idee)\n');

  const nicheChoice = await question('Wähle eine Nummer (1-6): ');

  const niches = {
    '1': { name: 'Geld verdienen online', emoji: '💰', tags: '#geldverdienen #passiveseinkommen #affiliatemarketing' },
    '2': { name: 'Fitness & Abnehmen', emoji: '🏋️', tags: '#fitness #abnehmen #gesundheit' },
    '3': { name: 'Dating & Beziehungen', emoji: '💑', tags: '#dating #beziehung #liebe' },
    '4': { name: 'Trading & Krypto', emoji: '📈', tags: '#trading #krypto #investieren' },
    '5': { name: 'Online-Kurse erstellen', emoji: '🎓', tags: '#onlinekurs #digitalesprodukt #passiveseinkommen' },
    '6': { name: 'Custom', emoji: '🎯', tags: '' }
  };

  let selectedNiche = niches[nicheChoice] || niches['1'];

  if (nicheChoice === '6') {
    const customNiche = await question('Deine Nische: ');
    const customTags = await question('Hashtags (z.B. #tag1 #tag2): ');
    selectedNiche = { name: customNiche, emoji: '🎯', tags: customTags };
  }

  console.log(colors.green(`\n✓ Gewählt: ${selectedNiche.emoji} ${selectedNiche.name}\n`));

  // Step 2: Produkte
  console.log(colors.yellow('🛍️  SCHRITT 2: Affiliate-Produkte\n'));
  console.log('Gehe jetzt zu Digistore24 und finde Produkte:\n');
  console.log('1. https://www.digistore24.com/marketplace');
  console.log('2. Suche nach: ' + selectedNiche.name);
  console.log('3. Filter: "Höchste Gravity"');
  console.log('4. Wähle 3-5 Produkte mit >50% Provision\n');

  await question(colors.cyan('Drücke ENTER wenn du bereit bist...'));

  const products = [];
  console.log('\nTrage deine Produkte ein (min. 1, max. 5):\n');

  for (let i = 0; i < 5; i++) {
    const productName = await question(`Produkt ${i + 1} Name (oder ENTER zum Überspringen): `);
    if (!productName) break;

    const affiliateLink = await question(`Affiliate-Link: `);
    const commission = await question(`Provision pro Sale (€): `);

    products.push({
      name: productName,
      link: affiliateLink,
      commission: parseFloat(commission) || 0,
      niche: selectedNiche.name
    });

    console.log(colors.green(`✓ ${productName} hinzugefügt\n`));
  }

  // Step 3: Content-Plan generieren
  console.log(colors.yellow('\n🎬 SCHRITT 3: Content-Plan generiert\n'));

  const contentPlan = {
    niche: selectedNiche,
    products: products,
    videoIdeas: generateVideoIdeas(selectedNiche.name),
    hashtags: selectedNiche.tags,
    targetSales: 20,
    targetRevenue: products.reduce((sum, p) => sum + p.commission, 0) / products.length * 20
  };

  // Save to file
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, 'quick-money-plan.json'),
    JSON.stringify(contentPlan, null, 2)
  );

  // Generate Summary
  console.log(colors.cyan(colors.bold('╔═══════════════════════════════════════════════╗')));
  console.log(colors.cyan(colors.bold('║   📋 DEIN QUICK-MONEY-PLAN                    ║')));
  console.log(colors.cyan(colors.bold('╚═══════════════════════════════════════════════╝\n')));

  console.log(colors.green(`Nische: ${selectedNiche.emoji} ${selectedNiche.name}`));
  console.log(colors.green(`Produkte: ${products.length} Affiliate-Produkte`));
  console.log(colors.green(`Durchschnitts-Provision: €${(products.reduce((s, p) => s + p.commission, 0) / products.length).toFixed(2)}`));
  console.log(colors.green(`\nZiel (14 Tage): ${contentPlan.targetSales} Sales = €${contentPlan.targetRevenue.toFixed(2)}\n`));

  console.log(colors.yellow('📅 NÄCHSTE SCHRITTE (HEUTE):\n'));
  console.log('1. ✅ TikTok Business Account erstellen');
  console.log('2. ✅ Linktree Setup mit deinen Affiliate-Links');
  console.log('3. ✅ Erste 5 Videos erstellen (siehe Video-Ideen unten)');
  console.log('4. ✅ Videos auf TikTok posten\n');

  console.log(colors.yellow('🎬 VIDEO-IDEEN (Top 10):\n'));
  contentPlan.videoIdeas.slice(0, 10).forEach((idea, i) => {
    console.log(`${i + 1}. ${idea}`);
  });

  console.log(colors.yellow('\n\n📱 PLATTFORM-SETUP:\n'));
  console.log('TikTok Bio:');
  console.log(colors.cyan(`"${generateBio(selectedNiche.name)} 👇 Link in Bio"`));
  console.log('\nLinktree URL: https://linktr.ee/DEIN_USERNAME');
  console.log(`Hashtags: ${selectedNiche.tags}\n`);

  console.log(colors.yellow('💡 PRO-TIPPS:\n'));
  console.log('• Poste 3-5 Videos/Tag zu unterschiedlichen Zeiten');
  console.log('• Beste Zeiten: 7-9 Uhr, 12-14 Uhr, 18-22 Uhr');
  console.log('• Nutze IMMER: Hook + Problem + Lösung + CTA');
  console.log('• Call-to-Action: "Link in Bio für mehr Infos"');
  console.log('• Antworte auf ALLE Kommentare (Algorithmus-Boost!)\n');

  console.log(colors.yellow('📊 TRACKING:\n'));
  console.log('Erstelle ein Google Sheet mit diesen Spalten:');
  console.log('Datum | Platform | Views | Klicks | Sales | Revenue\n');

  console.log(colors.green('✨ Plan gespeichert in: data/quick-money-plan.json\n'));

  console.log(colors.cyan(colors.bold('╔═══════════════════════════════════════════════╗')));
  console.log(colors.cyan(colors.bold('║   🚀 LOS GEHTS! ERSTE 5 VIDEOS HEUTE!        ║')));
  console.log(colors.cyan(colors.bold('╚═══════════════════════════════════════════════╝\n')));

  // Generate AI prompts
  console.log(colors.yellow('🤖 BONUS: ChatGPT/Gemini Prompts\n'));
  console.log('Kopiere diese Prompts für schnelle Content-Erstellung:\n');
  console.log(colors.cyan('─'.repeat(50)));
  console.log(generateAIPrompt(selectedNiche.name, products[0]?.name || 'dieses Produkt'));
  console.log(colors.cyan('─'.repeat(50)));
  console.log('');

  rl.close();
}

function generateVideoIdeas(niche) {
  const ideas = {
    'Geld verdienen online': [
      '💰 "Wie ich €1247 in 7 Tagen verdient habe (ohne Startkapital)"',
      '🚀 "Diese Methode kennen 99% NICHT"',
      '💸 "3 Apps die mir €50/Tag zahlen"',
      '🔥 "Der Fehler den jeder Anfänger macht"',
      '✨ "Passives Einkommen für Anfänger erklärt"',
      '🎯 "Von €0 auf €1000 in 30 Tagen - So gehts"',
      '💡 "Affiliate Marketing Schritt-für-Schritt"',
      '📈 "Meine Einnahmen (Beweis-Screenshot)"',
      '⚠️  "3 Dinge die du NICHT tun solltest"',
      '🏆 "Beste Nische für Anfänger 2024"',
      '💪 "Keine Ahnung von Marketing? Kein Problem!"',
      '🎁 "Gratis Tools die ich nutze"',
      '📱 "Geld verdienen nur mit dem Handy"',
      '🔓 "Das Geheimnis erfolgreicher Affiliates"',
      '⏰ "Wie lange dauert es wirklich?"'
    ],
    'Fitness & Abnehmen': [
      '🏋️  "10 kg in 30 Tagen - Mein Weg"',
      '💪 "Der eine Trick der alles änderte"',
      '🍎 "Abnehmen ohne Verzicht - So gehts"',
      '📉 "Meine Transformation (Vorher/Nachher)"',
      '🔥 "5-Minuten Workout für zu Hause"',
      '⚡ "Stoffwechsel ankurbeln in 3 Schritten"',
      '🎯 "Bauchfett loswerden - Die Wahrheit"',
      '✨ "Abnehmen im Schlaf? Ja, so!"',
      '💧 "Wasser-Trick für schnelleres Abnehmen"',
      '🥗 "Meal Prep für Faule"'
    ]
  };

  return ideas[niche] || [
    '🎯 "Mein größter Fehler (und wie du ihn vermeidest)"',
    '💡 "3 Dinge die ich anders machen würde"',
    '🚀 "Von 0 auf 100 - Meine Story"',
    '✨ "Das hat niemand mir gesagt"',
    '💰 "So verdiene ich Geld damit"'
  ];
}

function generateBio(niche) {
  const bios = {
    'Geld verdienen online': '💰 €2000+ online verdient | Zeige dir wie | Anfänger-freundlich',
    'Fitness & Abnehmen': '🏋️  10kg in 30 Tagen | Ohne Verzicht | Dein Fitness-Guide',
    'Dating & Beziehungen': '💑 Beziehungs-Coach | Happy Couples | Tipps & Tricks',
    'Trading & Krypto': '📈 Trading seit 2020 | Krypto-Tipps | Kein Finanzberater',
    'Online-Kurse erstellen': '🎓 Digitale Produkte | Passives Einkommen | Kurs-Creator'
  };

  return bios[niche] || '🎯 Dein Guide für ' + niche;
}

function generateAIPrompt(niche, productName) {
  return `
PROMPT FÜR ChatGPT/Gemini:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Erstelle mir 10 TikTok Video-Skripte für die Nische '${niche}'.

Jedes Video soll:
- 30-45 Sekunden lang sein
- Mit einem starken Hook starten (erste 3 Sekunden)
- Ein konkretes Problem ansprechen
- Eine Lösung präsentieren
- Mit einem Call-to-Action enden ("Link in Bio")

Zielgruppe: 25-45 Jahre, deutsch, will ${niche}

Format:
[Hook - 3 Sek]
[Problem - 7 Sek]
[Lösung - 15 Sek]
[Beweis/Proof - 5 Sek]
[CTA - 3 Sek]

Das beworbene Produkt ist: ${productName}

Mache es authentisch, nicht zu verkaufs-lastig."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

main().catch(console.error);
