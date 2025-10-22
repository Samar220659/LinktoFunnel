import 'dotenv/config';
import { supabase } from '../lib/supabase.js';

/**
 * Ruft die letzten N Projekte/Generationen aus der Datenbank ab
 * @param {number} limit - Anzahl der abzurufenden Projekte (Standard: 5)
 * @returns {Promise<Array>} Array mit Projekt-Daten
 */
async function getLastProjects(limit = 5) {
  try {
    console.log(`\n🔍 Rufe die letzten ${limit} Projekte ab...\n`);

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Datenbankfehler: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('❌ Keine Projekte gefunden.');
      return [];
    }

    console.log(`✅ ${data.length} Projekt(e) gefunden:\n`);
    console.log('='.repeat(80));

    // Zeige jedes Projekt an
    data.forEach((project, index) => {
      console.log(`\n📊 Projekt ${index + 1}:`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Status: ${getStatusEmoji(project.status)} ${project.status}`);
      console.log(`   Fortschritt: ${project.progress || 0}%`);

      if (project.url) {
        console.log(`   URL: ${project.url}`);
      }

      if (project.created_at) {
        const date = new Date(project.created_at);
        console.log(`   Erstellt: ${date.toLocaleString('de-DE')}`);
      }

      if (project.error) {
        console.log(`   ❌ Fehler: ${project.error}`);
      }

      if (project.result) {
        console.log(`   📹 Ergebnis:`);
        if (project.result.headline) {
          console.log(`      Headline: ${project.result.headline}`);
        }
        if (project.result.cta) {
          console.log(`      CTA: ${project.result.cta}`);
        }
        if (project.result.score) {
          console.log(`      Score: ${project.result.score}/99`);
        }
        if (project.result.videoUrl) {
          console.log(`      Video: ${project.result.videoUrl}`);
        }
      }

      console.log('-'.repeat(80));
    });

    return data;

  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Projekte:', error.message);
    throw error;
  }
}

/**
 * Gibt ein Emoji basierend auf dem Status zurück
 */
function getStatusEmoji(status) {
  const emojis = {
    'scraping': '🔍',
    'generating_script': '✍️',
    'generating_image': '🎨',
    'generating_video': '🎬',
    'finalizing': '⚙️',
    'done': '✅',
    'error': '❌'
  };
  return emojis[status] || '📝';
}

// Hauptfunktion ausführen
getLastProjects(5)
  .then(() => {
    console.log('\n✨ Fertig!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fehler:', error.message);
    process.exit(1);
  });
