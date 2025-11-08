/**
 * 🤖 CLAUDE AI ADAPTER
 * Strategic planning, content creation, and business analysis
 */

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeAdapter {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
    this.model = 'claude-sonnet-4-20250514';
  }

  async process(task, data) {
    console.log(`🤖 Claude AI processing: ${task}`);

    switch (task) {
      case 'plan-strategy':
        return await this.planStrategy(data);
      case 'create-content':
        return await this.createContent(data);
      case 'analyze-results':
        return await this.analyzeResults(data);
      case 'optimize-workflow':
        return await this.optimizeWorkflow(data);
      default:
        throw new Error(`Unknown task: ${task}`);
    }
  }

  async planStrategy(data) {
    const { objective, constraints, context } = data;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `# STRATEGIC PLANNING TASK

## OBJECTIVE
${objective}

## CONSTRAINTS
${JSON.stringify(constraints, null, 2)}

## CONTEXT
${JSON.stringify(context, null, 2)}

## DELIVERABLES
1. High-level strategy
2. Step-by-step implementation plan
3. Resource allocation
4. Risk assessment
5. Success metrics
6. Next actions for Gemini (content optimization)
7. Next actions for Claude Code (technical implementation)

Return as JSON with clear sections.`
      }]
    });

    return this.parseJSON(response.content[0].text);
  }

  async createContent(data) {
    const { contentType, specs, targetAudience } = data;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `Create ${contentType} content:

Specifications: ${JSON.stringify(specs, null, 2)}
Target Audience: ${JSON.stringify(targetAudience, null, 2)}

Requirements:
- Match specifications exactly
- Optimized for target audience
- Include metadata
- Ready for Gemini optimization

Return as JSON.`
      }]
    });

    return this.parseJSON(response.content[0].text);
  }

  async analyzeResults(data) {
    const { metrics, goals } = data;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Analyze performance:

Metrics: ${JSON.stringify(metrics, null, 2)}
Goals: ${JSON.stringify(goals, null, 2)}

Provide:
1. Performance analysis
2. Goal achievement status
3. Insights and patterns
4. Optimization recommendations
5. Next iteration improvements

Return as JSON.`
      }]
    });

    return this.parseJSON(response.content[0].text);
  }

  async optimizeWorkflow(data) {
    const { currentWorkflow, bottlenecks } = data;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Optimize workflow:

Current: ${JSON.stringify(currentWorkflow, null, 2)}
Bottlenecks: ${JSON.stringify(bottlenecks, null, 2)}

Design optimized workflow with:
1. Eliminated bottlenecks
2. Automated steps
3. Improved efficiency
4. Implementation roadmap

Return as JSON.`
      }]
    });

    return this.parseJSON(response.content[0].text);
  }

  parseJSON(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse JSON, returning raw text');
      }
    }

    return { raw: text };
  }
}

module.exports = { ClaudeAdapter };
