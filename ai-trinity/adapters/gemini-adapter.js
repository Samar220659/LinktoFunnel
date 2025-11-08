/**
 * ✨ GEMINI ADAPTER
 * Content optimization, viral script enhancement, creative refinement
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAdapter {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192
      }
    });
  }

  async process(task, data) {
    console.log(`✨ Gemini processing: ${task}`);

    switch (task) {
      case 'optimize-video-script':
        return await this.optimizeVideoScript(data);
      case 'enhance-content':
        return await this.enhanceContent(data);
      case 'generate-variants':
        return await this.generateVariants(data);
      case 'analyze-viral-potential':
        return await this.analyzeViralPotential(data);
      default:
        throw new Error(`Unknown task: ${task}`);
    }
  }

  async optimizeVideoScript(data) {
    const { script, targetScore = 93, platform = 'tiktok' } = data;

    const prompt = `# VIDEO SCRIPT OPTIMIZATION - ${targetScore}%+ VIRAL SCORE

Platform: ${platform.toUpperCase()}
Original Script: ${JSON.stringify(script, null, 2)}

Requirements:
1. Hook (0-3s): Pattern interrupt
2. Story (3-25s): Emotional journey
3. CTA (25-30s): Clear action
4. Length: 30 seconds (90-120 words)
5. Engagement: Comment-bait, save-worthy

Output JSON:
{
  "optimizedScript": { "hook": "...", "body": "...", "cta": "..." },
  "visualGuide": { "0-3s": "...", "3-20s": "...", "20-30s": "..." },
  "metadata": {
    "caption": "...",
    "hashtags": { "viral": ["..."], "niche": ["..."], "longTail": ["..."] },
    "viralScorePrediction": 95
  },
  "abTestVariants": [{ "hook": "...", "reason": "..." }],
  "improvements": ["Changed X to Y because..."]
}`;

    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async enhanceContent(data) {
    const { content, contentType, enhancementGoals } = data;

    const prompt = `Enhance this ${contentType}:

${content}

Goals: ${enhancementGoals.join(', ')}

Improve:
1. Engagement
2. Clarity
3. Emotional impact
4. Platform optimization
5. Authenticity

Return enhanced version as JSON with changelog.`;

    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async generateVariants(data) {
    const { baseContent, variantCount = 3 } = data;

    const prompt = `Generate ${variantCount} variants of this content:

${baseContent}

Each variant should:
1. Maintain core message
2. Test different angles
3. Suit A/B testing
4. Have distinct positioning

Return as JSON array with testing recommendations.`;

    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async analyzeViralPotential(data) {
    const { content, platform } = data;

    const prompt = `Analyze viral potential:

Content: ${content}
Platform: ${platform}

Provide:
1. Viral score (0-100)
2. Strengths
3. Weaknesses
4. Optimization opportunities
5. Competitive positioning
6. Recommended improvements

Return as JSON.`;

    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  parseJSON(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                      text.match(/```\n([\s\S]*?)\n```/) ||
                      text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse JSON from Gemini');
      }
    }

    return { raw: text };
  }
}

module.exports = { GeminiAdapter };
