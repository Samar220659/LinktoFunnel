#!/usr/bin/env node

/**
 * 🎬 COMPLETE VIDEO GENERATION PIPELINE
 * Production-ready video generation for TikTok, Instagram Reels, YouTube Shorts
 *
 * Features:
 * - AI Script Generation (GPT-4)
 * - Text-to-Speech (Google TTS / ElevenLabs)
 * - Image Generation (DALL-E 3)
 * - Video Assembly (ffmpeg)
 * - Subtitle Overlay
 * - Platform Optimization (9:16, 30-60s)
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const OUTPUT_DIR = process.env.VIDEO_OUTPUT_DIR || './outputs/videos';
const TEMP_DIR = path.join(OUTPUT_DIR, 'temp');

// ===== MAIN VIDEO GENERATOR CLASS =====

class VideoGenerator {
  constructor(config = {}) {
    this.config = {
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      elevenLabsApiKey: config.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY,
      googleTtsApiKey: config.googleTtsApiKey || process.env.GOOGLE_TTS_API_KEY,
      geminiApiKey: config.geminiApiKey || process.env.GEMINI_API_KEY,
      ...config
    };

    this.init();
  }

  async init() {
    // Create output directories
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }

  /**
   * Generate complete video from product data
   */
  async generateVideo(productData, options = {}) {
    const videoId = `video_${Date.now()}`;
    console.log(`\n🎬 Starting video generation: ${videoId}`);

    try {
      // Step 1: Generate Script
      console.log('📝 Step 1/6: Generating script...');
      const script = await this.generateScript(productData, options);

      // Step 2: Generate voiceover
      console.log('🎤 Step 2/6: Generating voiceover...');
      const audioPath = await this.generateVoiceover(script, videoId);

      // Step 3: Generate visuals
      console.log('🖼️  Step 3/6: Generating visuals...');
      const imagePaths = await this.generateVisuals(script, videoId);

      // Step 4: Create video base
      console.log('🎥 Step 4/6: Assembling video...');
      const videoBasePath = await this.assembleVideo(imagePaths, audioPath, videoId);

      // Step 5: Add subtitles
      console.log('💬 Step 5/6: Adding subtitles...');
      const videoWithSubsPath = await this.addSubtitles(videoBasePath, script, videoId);

      // Step 6: Optimize for platform
      console.log('⚙️  Step 6/6: Optimizing for platform...');
      const finalVideoPath = await this.optimizeForPlatform(
        videoWithSubsPath,
        options.platform || 'tiktok',
        videoId
      );

      console.log(`✅ Video generation complete: ${finalVideoPath}\n`);

      return {
        videoId,
        videoPath: finalVideoPath,
        script,
        metadata: {
          duration: await this.getVideoDuration(finalVideoPath),
          platform: options.platform || 'tiktok',
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`❌ Video generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate optimized script with GPT-4
   */
  async generateScript(productData, options = {}) {
    const platform = options.platform || 'tiktok';
    const duration = options.duration || 30;

    const prompt = `Create a viral ${duration}-second ${platform} video script for this product:

Product: ${productData.name}
Description: ${productData.description}
Target Audience: ${productData.targetAudience || 'DACH, 40-65 years old, interested in passive income'}

Requirements:
1. Hook (0-3s): Immediate attention grabber
2. Value (3-20s): Core benefit/transformation
3. Proof (20-25s): Social proof or results
4. CTA (25-${duration}s): Clear call to action

Format: Conversational, authentic, no salesy language
Tone: Enthusiastic but credible
Length: ${duration} seconds (~${duration * 3} words)

Return JSON:
{
  "hook": "First 3 seconds text",
  "value": "Main value proposition",
  "proof": "Social proof element",
  "cta": "Call to action",
  "visualGuide": {
    "hook": "Visual description for hook",
    "value": "Visual description for value section",
    "proof": "Visual description for proof",
    "cta": "Visual description for CTA"
  },
  "hashtags": ["viral", "niche", "longtail"],
  "caption": "Post caption",
  "viralScore": 95
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 script generation failed: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * Generate voiceover audio using Text-to-Speech
   */
  async generateVoiceover(script, videoId) {
    const fullText = `${script.hook}. ${script.value}. ${script.proof}. ${script.cta}`;
    const audioPath = path.join(TEMP_DIR, `${videoId}_audio.mp3`);

    // Try ElevenLabs first (best quality), fallback to Google TTS
    if (this.config.elevenLabsApiKey) {
      return await this.generateWithElevenLabs(fullText, audioPath);
    } else if (this.config.googleTtsApiKey) {
      return await this.generateWithGoogleTTS(fullText, audioPath);
    } else {
      // Fallback: Use system TTS or create silent audio
      console.warn('⚠️  No TTS API key found, using silent audio');
      return await this.createSilentAudio(30, audioPath);
    }
  }

  async generateWithElevenLabs(text, outputPath) {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(audioBuffer));

    return outputPath;
  }

  async generateWithGoogleTTS(text, outputPath) {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.config.googleTtsApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'de-DE',
            name: 'de-DE-Neural2-D', // Male voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.1,
            pitch: 0
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google TTS failed: ${response.status}`);
    }

    const data = await response.json();
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    await fs.writeFile(outputPath, audioBuffer);

    return outputPath;
  }

  async createSilentAudio(durationSeconds, outputPath) {
    // Create silent audio using ffmpeg
    await execPromise(
      `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${durationSeconds} -acodec libmp3lame ${outputPath} -y`
    );
    return outputPath;
  }

  /**
   * Generate visual images for video scenes
   */
  async generateVisuals(script, videoId) {
    const scenes = [
      { name: 'hook', description: script.visualGuide.hook },
      { name: 'value', description: script.visualGuide.value },
      { name: 'proof', description: script.visualGuide.proof },
      { name: 'cta', description: script.visualGuide.cta }
    ];

    const imagePaths = [];

    for (const scene of scenes) {
      const imagePath = path.join(TEMP_DIR, `${videoId}_${scene.name}.png`);

      try {
        await this.generateImage(scene.description, imagePath);
        imagePaths.push(imagePath);
      } catch (error) {
        console.warn(`⚠️  Failed to generate ${scene.name} image, using placeholder`);
        await this.createPlaceholderImage(imagePath, scene.name);
        imagePaths.push(imagePath);
      }
    }

    return imagePaths;
  }

  async generateImage(description, outputPath) {
    const enhancedPrompt = `${description}. Professional, cinematic, high-quality, lifestyle photography, vibrant colors, engaging composition`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: '1024x1792', // 9:16 aspect ratio for vertical video
        quality: 'hd',
        style: 'vivid'
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(imageBuffer));

    return outputPath;
  }

  async createPlaceholderImage(outputPath, text) {
    // Create a simple colored placeholder image with ffmpeg
    const color = {
      'hook': '#FF6B6B',
      'value': '#4ECDC4',
      'proof': '#45B7D1',
      'cta': '#F7B731'
    }[text] || '#95E1D3';

    await execPromise(
      `ffmpeg -f lavfi -i color=c=${color}:s=1080x1920:d=1 -vf "drawtext=text='${text}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" ${outputPath} -y`
    );
  }

  /**
   * Assemble video from images and audio
   */
  async assembleVideo(imagePaths, audioPath, videoId) {
    const outputPath = path.join(TEMP_DIR, `${videoId}_base.mp4`);

    // Get audio duration
    const audioDuration = await this.getAudioDuration(audioPath);
    const durationPerImage = audioDuration / imagePaths.length;

    // Create input file list for ffmpeg
    const fileListPath = path.join(TEMP_DIR, `${videoId}_filelist.txt`);
    const fileListContent = imagePaths
      .map(p => `file '${p}'\nduration ${durationPerImage}`)
      .join('\n') + `\nfile '${imagePaths[imagePaths.length - 1]}'`; // Repeat last frame

    await fs.writeFile(fileListPath, fileListContent);

    // Assemble video with ffmpeg
    await execPromise(
      `ffmpeg -f concat -safe 0 -i ${fileListPath} -i ${audioPath} -c:v libx264 -c:a aac -pix_fmt yuv420p -shortest ${outputPath} -y`
    );

    return outputPath;
  }

  /**
   * Add subtitles to video
   */
  async addSubtitles(videoPath, script, videoId) {
    const outputPath = path.join(TEMP_DIR, `${videoId}_subs.mp4`);

    // Create SRT subtitle file
    const srtPath = path.join(TEMP_DIR, `${videoId}.srt`);
    const srtContent = this.createSRT(script);
    await fs.writeFile(srtPath, srtContent);

    // Add subtitles with ffmpeg
    const subtitleStyle = "FontName=Arial,FontSize=48,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,MarginV=80";

    await execPromise(
      `ffmpeg -i ${videoPath} -vf "subtitles=${srtPath}:force_style='${subtitleStyle}'" -c:a copy ${outputPath} -y`
    );

    return outputPath;
  }

  createSRT(script) {
    // Create simple SRT with timing based on script sections
    const sections = [
      { text: script.hook, start: 0, end: 3 },
      { text: script.value, start: 3, end: 20 },
      { text: script.proof, start: 20, end: 25 },
      { text: script.cta, start: 25, end: 30 }
    ];

    let srt = '';
    sections.forEach((section, index) => {
      srt += `${index + 1}\n`;
      srt += `${this.formatSRTTime(section.start)} --> ${this.formatSRTTime(section.end)}\n`;
      srt += `${section.text}\n\n`;
    });

    return srt;
  }

  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  /**
   * Optimize video for specific platform
   */
  async optimizeForPlatform(videoPath, platform, videoId) {
    const outputPath = path.join(OUTPUT_DIR, `${videoId}_${platform}.mp4`);

    const platformSpecs = {
      tiktok: {
        resolution: '1080x1920',
        fps: 30,
        bitrate: '5000k',
        maxDuration: 60
      },
      instagram: {
        resolution: '1080x1920',
        fps: 30,
        bitrate: '5000k',
        maxDuration: 60
      },
      youtube: {
        resolution: '1080x1920',
        fps: 30,
        bitrate: '8000k',
        maxDuration: 60
      }
    };

    const spec = platformSpecs[platform] || platformSpecs.tiktok;

    await execPromise(
      `ffmpeg -i ${videoPath} -vf "scale=${spec.resolution}:force_original_aspect_ratio=decrease,pad=${spec.resolution}:(ow-iw)/2:(oh-ih)/2" -r ${spec.fps} -b:v ${spec.bitrate} -c:a aac -b:a 128k -movflags +faststart ${outputPath} -y`
    );

    return outputPath;
  }

  /**
   * Utility functions
   */
  async getAudioDuration(audioPath) {
    const { stdout } = await execPromise(
      `ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`
    );
    return parseFloat(stdout.trim());
  }

  async getVideoDuration(videoPath) {
    const { stdout } = await execPromise(
      `ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`
    );
    return parseFloat(stdout.trim());
  }

  /**
   * Clean up temporary files
   */
  async cleanup(videoId) {
    const files = await fs.readdir(TEMP_DIR);
    const videoFiles = files.filter(f => f.startsWith(videoId));

    for (const file of videoFiles) {
      await fs.unlink(path.join(TEMP_DIR, file));
    }
  }
}

// ===== BATCH GENERATION =====

/**
 * Generate multiple videos from product list
 */
async function generateVideosBatch(products, options = {}) {
  const generator = new VideoGenerator();
  const results = [];

  for (const [index, product] of products.entries()) {
    console.log(`\n📦 Processing product ${index + 1}/${products.length}: ${product.name}`);

    try {
      const result = await generator.generateVideo(product, options);
      results.push({ success: true, product: product.name, ...result });

      // Optional: Clean up temp files after each video
      if (options.cleanup) {
        await generator.cleanup(result.videoId);
      }

    } catch (error) {
      console.error(`❌ Failed to generate video for ${product.name}: ${error.message}`);
      results.push({ success: false, product: product.name, error: error.message });
    }

    // Rate limiting: Wait between generations
    if (index < products.length - 1 && options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }

  return results;
}

module.exports = {
  VideoGenerator,
  generateVideosBatch
};

// ===== CLI USAGE =====
if (require.main === module) {
  const generator = new VideoGenerator();

  // Example product
  const exampleProduct = {
    name: 'Passives Einkommen Blueprint',
    description: 'Lerne wie du in 30 Tagen dein erstes passives Einkommen aufbaust',
    targetAudience: 'DACH, 40-65 Jahre, Interesse an Online-Business'
  };

  generator.generateVideo(exampleProduct, { platform: 'tiktok', duration: 30 })
    .then(result => {
      console.log('\n✅ Video successfully generated!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error.message);
      process.exit(1);
    });
}
