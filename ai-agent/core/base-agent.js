// Base Agent Class - Foundation for all AI agents
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export class BaseAgent {
  constructor(config) {
    this.name = config.name;
    this.role = config.role;
    this.interval = config.interval || 60 * 60 * 1000; // Default: 1 hour
    this.isRunning = false;

    // Initialize Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // System prompt for AI decision-making
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();

    // Performance tracking
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      avgExecutionTime: 0
    };
  }

  getDefaultSystemPrompt() {
    return `You are ${this.name}, an AI agent specialized in ${this.role}.
You make data-driven decisions to optimize business outcomes.
Always respond with valid JSON that can be parsed.
Be precise, analytical, and focused on results.`;
  }

  /**
   * Main execution loop - runs continuously
   */
  async run(options = {}) {
    if (this.isRunning && !options.force) {
      console.log(`⚠️ ${this.name} is already running`);
      return;
    }

    this.isRunning = true;
    console.log(`🚀 ${this.name} starting...`);

    try {
      while (this.isRunning) {
        const startTime = Date.now();

        try {
          // 1. Perceive: Gather information from environment
          console.log(`👁️ ${this.name}: Perceiving environment...`);
          const state = await this.perceive();

          // 2. Decide: Make intelligent decisions based on state
          console.log(`🧠 ${this.name}: Making decisions...`);
          const decision = await this.decide(state);

          // 3. Act: Execute the decision
          console.log(`⚡ ${this.name}: Acting on decision...`);
          const result = await this.act(decision);

          // 4. Learn: Update knowledge based on results
          console.log(`📚 ${this.name}: Learning from results...`);
          await this.learn(result);

          // Update metrics
          const executionTime = Date.now() - startTime;
          this.updateMetrics(true, executionTime);

          console.log(`✅ ${this.name}: Cycle completed in ${executionTime}ms`);

        } catch (error) {
          console.error(`❌ ${this.name} error:`, error);
          this.updateMetrics(false, Date.now() - startTime);
          await this.handleError(error);
        }

        // Check if single-run mode
        if (options.singleRun) {
          this.isRunning = false;
          break;
        }

        // Sleep until next cycle
        console.log(`😴 ${this.name}: Sleeping for ${this.interval / 1000}s...`);
        await this.sleep(this.interval);
      }
    } finally {
      this.isRunning = false;
      console.log(`🛑 ${this.name} stopped`);
    }
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log(`🛑 Stopping ${this.name}...`);
    this.isRunning = false;
  }

  /**
   * PERCEIVE: Gather information from the environment
   * Override this method in subclasses
   */
  async perceive() {
    throw new Error(`${this.name} must implement perceive() method`);
  }

  /**
   * DECIDE: Make intelligent decisions using AI
   * Override this method in subclasses or use default AI decision-making
   */
  async decide(state) {
    const prompt = this.buildPrompt(state);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const decision = JSON.parse(response.choices[0].message.content);
      decision.context = state; // Attach original state for reference

      return decision;
    } catch (error) {
      console.error(`AI decision-making error in ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Build prompt for AI decision-making
   * Override in subclasses for custom prompts
   */
  buildPrompt(state) {
    return `Current state: ${JSON.stringify(state, null, 2)}

Analyze this state and make the best decision to achieve the goal: ${this.role}

Return your decision as JSON with:
- action: what action to take
- reasoning: why you made this decision
- confidence: 0-1 confidence score
- metadata: any additional relevant data`;
  }

  /**
   * ACT: Execute the decision
   * Override this method in subclasses
   */
  async act(decision) {
    throw new Error(`${this.name} must implement act() method`);
  }

  /**
   * LEARN: Update knowledge based on results
   * Stores learning data in Supabase for reinforcement learning
   */
  async learn(result) {
    try {
      const learningData = {
        agent_name: this.name,
        action: result.action || 'unknown',
        reward: this.calculateReward(result),
        state_summary: JSON.stringify(result.state || {}),
        result_summary: JSON.stringify(result.summary || {}),
        metadata: result.metadata || {},
        timestamp: new Date().toISOString()
      };

      await this.supabase
        .from('rl_learning')
        .insert(learningData);

      console.log(`📊 ${this.name}: Learning data stored (reward: ${learningData.reward})`);
    } catch (error) {
      console.error(`Failed to store learning data:`, error);
    }
  }

  /**
   * Calculate reward for reinforcement learning
   * Override in subclasses for custom reward functions
   */
  calculateReward(result) {
    if (result.success === false) return -1;
    if (result.success === true) return 1;

    // Default: calculate based on available metrics
    let reward = 0;

    if (result.revenue) reward += result.revenue * 0.1;
    if (result.conversions) reward += result.conversions * 0.5;
    if (result.engagement_rate) reward += result.engagement_rate * 10;

    return Math.min(Math.max(reward, -10), 10); // Clamp between -10 and 10
  }

  /**
   * Handle errors gracefully
   */
  async handleError(error) {
    // Log to Supabase
    try {
      await this.supabase
        .from('agent_errors')
        .insert({
          agent_name: this.name,
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    // Send notification if critical
    if (this.isCriticalError(error)) {
      await this.sendErrorNotification(error);
    }
  }

  isCriticalError(error) {
    const criticalPatterns = [
      'ECONNREFUSED',
      'Authentication failed',
      'API key invalid',
      'Rate limit exceeded'
    ];

    return criticalPatterns.some(pattern =>
      error.message.includes(pattern)
    );
  }

  async sendErrorNotification(error) {
    // Implement notification logic (Telegram, email, etc.)
    console.error(`🚨 CRITICAL ERROR in ${this.name}:`, error.message);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(success, executionTime) {
    this.metrics.totalRuns++;

    if (success) {
      this.metrics.successfulRuns++;
    } else {
      this.metrics.failedRuns++;
    }

    // Calculate rolling average execution time
    this.metrics.avgExecutionTime =
      (this.metrics.avgExecutionTime * (this.metrics.totalRuns - 1) + executionTime) /
      this.metrics.totalRuns;
  }

  /**
   * Get agent metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRuns > 0
        ? this.metrics.successfulRuns / this.metrics.totalRuns
        : 0
    };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Query Supabase with error handling
   */
  async query(table, options = {}) {
    try {
      let query = this.supabase.from(table).select(options.select || '*');

      if (options.eq) {
        Object.entries(options.eq).forEach(([col, val]) => {
          query = query.eq(col, val);
        });
      }

      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? false
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Query error on ${table}:`, error);
      throw error;
    }
  }

  /**
   * Insert data into Supabase
   */
  async insert(table, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return result;
    } catch (error) {
      console.error(`Insert error on ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update data in Supabase
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return result;
    } catch (error) {
      console.error(`Update error on ${table}:`, error);
      throw error;
    }
  }
}

export default BaseAgent;
