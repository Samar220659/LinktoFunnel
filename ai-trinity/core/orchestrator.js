/**
 * 🎯 AI TRINITY ORCHESTRATOR
 * Central coordination for Claude AI, Gemini, and Claude Code
 */

const { MessageQueue } = require('./message-queue');
const { ClaudeAdapter } = require('../adapters/claude-adapter');
const { GeminiAdapter } = require('../adapters/gemini-adapter');

class AITrinityOrchestrator {
  constructor(config = {}) {
    this.queue = new MessageQueue();

    this.adapters = {
      claude: new ClaudeAdapter(config.claudeApiKey),
      gemini: new GeminiAdapter(config.geminiApiKey)
    };

    this.setupRouting();
  }

  async init() {
    await this.queue.init();
    console.log('✅ AI Trinity Orchestrator initialized');
  }

  setupRouting() {
    this.queue.on('message', async (message, messageId, processingPath) => {
      try {
        await this.routeMessage(message, messageId);
      } catch (error) {
        await this.queue.failMessage(messageId, error);
      }
    });
  }

  async routeMessage(message, messageId) {
    const { to, task, data } = message;

    console.log(`🔀 Routing message ${messageId} to ${to}`);

    const adapter = this.adapters[to];
    if (!adapter) {
      throw new Error(`Unknown adapter: ${to}`);
    }

    const result = await adapter.process(task, data);

    // Check for next step
    if (result.nextStep) {
      await this.executeWorkflow(result.nextStep, result);
    }

    await this.queue.completeMessage(messageId, result);
    return result;
  }

  async executeWorkflow(workflow, previousResult) {
    console.log(`🔄 Executing workflow: ${workflow.name}`);

    for (const step of workflow.steps) {
      const { adapter, task, dataMapper } = step;
      const data = dataMapper ? dataMapper(previousResult) : previousResult;

      await this.queue.enqueue(workflow.name, adapter, task, data);
    }
  }

  // === HIGH-LEVEL API METHODS ===

  async createVideoContent(specs) {
    console.log('🎬 Starting video content creation workflow');

    const scriptId = await this.queue.enqueue(
      'orchestrator',
      'claude',
      'create-content',
      {
        contentType: 'video-script',
        specs,
        targetAudience: specs.audience
      }
    );

    return { workflowId: scriptId };
  }

  async optimizeExistingContent(content, platform) {
    console.log('✨ Starting content optimization');

    const optimizationId = await this.queue.enqueue(
      'orchestrator',
      'gemini',
      'optimize-video-script',
      {
        script: content,
        platform,
        targetScore: 93
      }
    );

    return { workflowId: optimizationId };
  }

  async analyzePerformance(metrics) {
    console.log('📊 Starting performance analysis');

    const analysisId = await this.queue.enqueue(
      'orchestrator',
      'claude',
      'analyze-results',
      {
        metrics,
        goals: metrics.goals || {}
      }
    );

    return { workflowId: analysisId };
  }

  async getQueueStatus() {
    return await this.queue.getQueueStats();
  }

  async cleanup() {
    await this.queue.cleanup();
  }

  async stop() {
    await this.queue.stop();
  }
}

module.exports = { AITrinityOrchestrator };
