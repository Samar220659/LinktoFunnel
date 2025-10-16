import { supabase } from './supabase';

export async function runGenerationJob(taskId, url) {
  const updateStatus = async (status, progress = null, result = null, error = null) => {
    const { data, error: updateError } = await supabase
      .from('generations')
      .update({ status, progress, result, error })
      .eq('id', taskId);
    if (updateError) console.error(`[Job ${taskId}]: DB Update Error:`, updateError);
    console.log(`[Job ${taskId}]: Status updated to ${status} (${progress || 0}%)`);
  };

  try {
    await updateStatus('scraping', 10);
    const productData = await scrapeProductData(url);
    await updateStatus('generating_script', 25);
    const script = await generateScript(productData);
    await updateStatus('generating_image', 50);
    const keyframeUrl = await generateKeyframe(script.scene_description);
    await updateStatus('generating_video', 60);
    const videoUrl = await generateVideoWithGemini(keyframeUrl, (progress) => {
        updateStatus('generating_video', 60 + Math.floor(progress * 0.35));
    });
    await updateStatus('finalizing', 95);
    const score = calculateScore(script, keyframeUrl);
    const finalResult = { score, videoUrl, headline: script.headline, cta: script.cta };
    await updateStatus('done', 100, finalResult);
  } catch (error) {
    console.error(`[Job ${taskId}]: Error`, error);
    await updateStatus('error', null, null, error.message);
  }
}

// --- HILFSFUNKTIONEN ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function scrapeProductData(url) {
  console.log("Scraping URL:", url);
  const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=true&extract_rules={"title":{"selector":"h1","output":"text"},"description":{"selector":"meta[name='description']","output":"attribute","attribute":"content"},"image":{"selector":"meta[property='og:image']","output":"attribute","attribute":"content"}}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Scraping fehlgeschlagen.');
  const data = await response.json();
  if (!data.title) throw new Error('Konnte Produktdaten nicht extrahieren.');
  return { name: data.title, description: data.description || 'Ein fantastisches Produkt.', imageUrl: data.imageUrl || null };
}

async function generateScript(productData) {
  console.log("Generating script with GPT-4...");
  const prompt = `Du bist ein Top-Werbetexter. Erstelle ein extrem kurzes Skript für ein 10-Sekunden-Lifestyle-Video für das folgende Produkt. Das Ziel ist es, ein Gefühl und nicht nur das Produkt zu verkaufen. Produkt: ${productData.name} Beschreibung: ${productData.description} Gib die Antwort exakt in diesem JSON-Format zurück: { "persona": "Eine kurze Beschreibung der Zielgruppe und des Settings.", "scene_description": "Eine detaillierte Beschreibung der Szene für die Bild-KI.", "headline": "Ein kurzer, prägnanter Text für das Video.", "cta": "Ein starker Call-to-Action." }`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4-turbo', response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error('GPT-4 Script-Generierung fehlgeschlagen.');
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateKeyframe(sceneDescription) {
  console.log("Generating keyframe with DALL-E 3...");
  const prompt = `Cinematic lifestyle photo, ${sceneDescription}. Shot on a Sony A7III, 50mm lens, shallow depth of field, hyper-realistic, 8K.`;
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: "dall-e-3", prompt, size: "1024x1024", quality: "hd", style: "natural" }),
  });
  if (!response.ok) throw new Error('DALL-E 3 Bild-Generierung fehlgeschlagen.');
  const data = await response.json();
  return data.data[0].url;
}

// NEUE GEMINI VIDEO GENERIERUNG
async function generateVideoWithGemini(imageUrl, onProgress) {
    console.log("Starting video generation with Gemini...");
    // HINWEIS: Gemini's Video-Generierung (z.B. Imagen Video) ist eine neue Funktion.
    // Dieser Code ist ein Platzhalter für die erwartete API-Struktur.
    // Die genaue Implementierung hängt von der offiziellen Google Dokumentation ab.
    
    // Placeholder-Logik: Wir simulieren hier einen Prozess.
    // In der Realität würdest du hier die Google AI API aufrufen.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simuliert Arbeit
    onProgress(0.5);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simuliert Arbeit
    
    // Da Gemini Video noch nicht vollständig verfügbar ist, geben wir ein Demo-Video zurück.
    console.warn("Gemini Video-Integration ist ein Platzhalter. Gibt ein Demo-Video zurück.");
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
}

function calculateScore(script, keyframeUrl) {
  let score = 50;
  if (script.headline.length < 50 && script.headline.length > 10) score += 20;
  if (script.cta.toLowerCase().includes('jetzt') || script.cta.toLowerCase().includes('sicher')) score += 15;
  if (keyframeUrl) score += 15;
  return Math.min(score, 99);
}