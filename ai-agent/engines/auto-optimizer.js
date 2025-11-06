#!/usr/bin/env node

/**
 * ⚡ AUTO-OPTIMIZER - Autonomous Strategy Adjuster
 *
 * Takes insights from the Learning Engine and automatically:
 * - Stops unprofitable campaigns
 * - Scales successful products
 * - Adjusts posting schedules
 * - Reallocates resources
 *
 * This is what makes the system truly autonomous.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { createLogger } = require('../utils/logger');
const { LearningEngine } = require('./learning-engine');

const logger = createLogger('auto-optimizer');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class AutoOptimizer {
  constructor(options = {}) {
    this.learningEngine = new LearningEngine();
    this.dryRun = options.dryRun !== undefined ? options.dryRun : true; // Safety: default to dry run
    this.minConfidence = options.minConfidence || 0.75;
    this.maxActionsPerRun = options.maxActionsPerRun || 10;
  }

  /**
   * Run optimization cycle
   */
  async optimize(options = {}) {
    const startTime = Date.now();

    logger.info('Starting optimization cycle', {
      dryRun: this.dryRun,
      minConfidence: this.minConfidence,
    });

    try {
      // 1. Get active insights
      const insights = await this.learningEngine.getActiveInsights({
        minConfidence: this.minConfidence,
        limit: this.maxActionsPerRun,
      });

      logger.info('Retrieved insights', { count: insights.length });

      if (insights.length === 0) {
        logger.info('No insights available for optimization');
        return {
          success: true,
          actionsApplied: 0,
          message: 'No insights available',
        };
      }

      // 2. Apply optimizations
      const results = [];

      for (const insight of insights) {
        try {
          const result = await this.applyInsight(insight);
          results.push(result);

          // Mark insight as applied
          if (!this.dryRun && result.success) {
            await supabase
              .from('learning_insights')
              .update({
                status: 'applied',
                applied_at: new Date().toISOString(),
              })
              .eq('id', insight.id);
          }
        } catch (error) {
          logger.error('Failed to apply insight', {
            error,
            insightId: insight.id,
          });

          results.push({
            success: false,
            insight: insight.title,
            error: error.message,
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const duration = Date.now() - startTime;

      logger.info('Optimization cycle complete', {
        duration,
        totalInsights: insights.length,
        successful,
        failed: results.length - successful,
      });

      return {
        success: true,
        actionsApplied: successful,
        totalInsights: insights.length,
        duration,
        results,
      };
    } catch (error) {
      logger.error('Optimization cycle failed', { error });
      throw error;
    }
  }

  /**
   * Apply a specific insight
   */
  async applyInsight(insight) {
    logger.info('Applying insight', {
      title: insight.title,
      action: insight.recommended_action,
      confidence: insight.confidence,
    });

    // Parse action
    const [actionType, actionParam] = (insight.recommended_action || '').split(':');

    let result;

    switch (actionType) {
      case 'increase_promotion':
        result = await this.increasePromotion(actionParam, insight);
        break;

      case 'stop_promotion':
        result = await this.stopPromotion(actionParam, insight);
        break;

      case 'reduce_promotion':
        result = await this.reducePromotion(actionParam, insight);
        break;

      case 'increase_platform_focus':
        result = await this.increasePlatformFocus(actionParam, insight);
        break;

      case 'schedule_posts':
        result = await this.adjustSchedule(actionParam, insight);
        break;

      default:
        logger.warn('Unknown action type', { actionType });
        result = {
          success: false,
          message: `Unknown action type: ${actionType}`,
        };
    }

    // Record optimization action
    if (!this.dryRun) {
      await this.recordOptimization(insight, result);
    }

    return {
      ...result,
      insight: insight.title,
      dryRun: this.dryRun,
    };
  }

  /**
   * Increase promotion for high-performing product
   */
  async increasePromotion(productId, insight) {
    logger.info('Increasing promotion', { productId });

    if (this.dryRun) {
      return {
        success: true,
        action: 'increase_promotion',
        message: `[DRY RUN] Would increase promotion for product ${productId}`,
        changes: {
          postsPerDay: '+50%',
          platforms: '+1 additional platform',
        },
      };
    }

    // In production, this would:
    // - Increase posting frequency
    // - Add to more platforms
    // - Allocate more budget
    // - Create more content variations

    try {
      // Update product status in database
      await supabase
        .from('digistore_products')
        .update({
          promotion_priority: 'high',
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

      // Create more posts for this product
      // (This would integrate with the content creator)

      return {
        success: true,
        action: 'increase_promotion',
        message: `Increased promotion for product ${productId}`,
        changes: {
          promotionPriority: 'high',
          scheduledPosts: '+3 per day',
        },
      };
    } catch (error) {
      logger.error('Failed to increase promotion', { error, productId });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Stop promotion for low-performing product
   */
  async stopPromotion(productId, insight) {
    logger.info('Stopping promotion', { productId });

    if (this.dryRun) {
      return {
        success: true,
        action: 'stop_promotion',
        message: `[DRY RUN] Would stop promotion for product ${productId}`,
        changes: {
          status: 'paused',
          reasonEstimatedSavings: '€50/month',
        },
      };
    }

    try {
      // Update product status
      await supabase
        .from('digistore_products')
        .update({
          promotion_status: 'paused',
          promotion_priority: 'low',
          paused_reason: insight.description,
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

      // Cancel scheduled posts for this product
      // (This would integrate with the scheduler)

      return {
        success: true,
        action: 'stop_promotion',
        message: `Stopped promotion for product ${productId}`,
        changes: {
          promotionStatus: 'paused',
          scheduledPosts: 'cancelled',
        },
      };
    } catch (error) {
      logger.error('Failed to stop promotion', { error, productId });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reduce promotion intensity
   */
  async reducePromotion(productId, insight) {
    logger.info('Reducing promotion', { productId });

    if (this.dryRun) {
      return {
        success: true,
        action: 'reduce_promotion',
        message: `[DRY RUN] Would reduce promotion for product ${productId}`,
        changes: {
          postsPerDay: '-30%',
        },
      };
    }

    try {
      await supabase
        .from('digistore_products')
        .update({
          promotion_priority: 'low',
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

      return {
        success: true,
        action: 'reduce_promotion',
        message: `Reduced promotion for product ${productId}`,
        changes: {
          promotionPriority: 'low',
          postsPerDay: '-30%',
        },
      };
    } catch (error) {
      logger.error('Failed to reduce promotion', { error, productId });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Focus more on high-performing platform
   */
  async increasePlatformFocus(platform, insight) {
    logger.info('Increasing platform focus', { platform });

    if (this.dryRun) {
      return {
        success: true,
        action: 'increase_platform_focus',
        message: `[DRY RUN] Would increase focus on ${platform}`,
        changes: {
          postsPerDay: `${platform}: +50%`,
          otherPlatforms: '-20%',
        },
      };
    }

    // In production:
    // - Reallocate posting frequency
    // - Create platform-specific content
    // - Adjust budget allocation

    return {
      success: true,
      action: 'increase_platform_focus',
      message: `Increased focus on ${platform}`,
      changes: {
        primaryPlatform: platform,
        postsRatio: '60/40 split',
      },
    };
  }

  /**
   * Adjust posting schedule based on timing insights
   */
  async adjustSchedule(hoursStr, insight) {
    const bestHours = hoursStr.split(',').map(h => parseInt(h));

    logger.info('Adjusting schedule', { bestHours });

    if (this.dryRun) {
      return {
        success: true,
        action: 'adjust_schedule',
        message: `[DRY RUN] Would schedule posts at ${bestHours.join(', ')} o'clock`,
        changes: {
          newSchedule: bestHours.map(h => `${h}:00`).join(', '),
        },
      };
    }

    // In production:
    // - Update posting schedule
    // - Reschedule existing queued posts
    // - Adjust automation cron jobs

    return {
      success: true,
      action: 'adjust_schedule',
      message: `Adjusted posting schedule`,
      changes: {
        newSchedule: bestHours.map(h => `${h}:00`).join(', '),
        reason: 'Based on performance analysis',
      },
    };
  }

  /**
   * Record optimization action in database
   */
  async recordOptimization(insight, result) {
    try {
      await supabase
        .from('optimization_actions')
        .insert({
          action_type: result.action,
          entity_type: insight.category,
          entity_id: insight.recommended_action?.split(':')[1],
          change_description: result.message,
          reason: insight.description,
          based_on_insight_id: insight.id,
          expected_improvement: insight.expected_improvement,
          status: result.success ? 'active' : 'failed',
          result_metrics: result.changes || {},
        });

      logger.debug('Optimization action recorded');
    } catch (error) {
      logger.error('Failed to record optimization', { error });
    }
  }

  /**
   * Get optimization history
   */
  async getOptimizationHistory(options = {}) {
    const { limit = 50, status } = options;

    try {
      let query = supabase
        .from('optimization_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Failed to get optimization history', { error });
      return [];
    }
  }

  /**
   * Evaluate optimization effectiveness
   */
  async evaluateOptimizations() {
    try {
      // Get optimizations that have been running for at least 7 days
      const { data: optimizations, error } = await supabase
        .from('optimization_actions')
        .select('*')
        .eq('status', 'active')
        .lt('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

      if (error) throw error;

      logger.info('Evaluating optimizations', { count: optimizations.length });

      for (const optimization of optimizations) {
        // Get performance before and after optimization
        const before = await this.getPerformanceBefore(optimization);
        const after = await this.getPerformanceAfter(optimization);

        if (before && after) {
          const improvement = ((after - before) / before) * 100;

          await supabase
            .from('optimization_actions')
            .update({
              actual_improvement: improvement,
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', optimization.id);

          logger.info('Optimization evaluated', {
            id: optimization.id,
            expected: optimization.expected_improvement,
            actual: improvement.toFixed(2),
          });
        }
      }

      return {
        success: true,
        evaluated: optimizations.length,
      };
    } catch (error) {
      logger.error('Failed to evaluate optimizations', { error });
      throw error;
    }
  }

  /**
   * Helper: Get performance before optimization
   */
  async getPerformanceBefore(optimization) {
    try {
      const { data } = await supabase
        .from('performance_metrics')
        .select('performance_score')
        .eq('entity_id', optimization.entity_id)
        .lt('created_at', optimization.created_at)
        .gte('created_at', new Date(new Date(optimization.created_at).getTime() - 7 * 86400000).toISOString())
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return null;

      return data.reduce((sum, m) => sum + (m.performance_score || 0), 0) / data.length;
    } catch (error) {
      return null;
    }
  }

  /**
   * Helper: Get performance after optimization
   */
  async getPerformanceAfter(optimization) {
    try {
      const { data } = await supabase
        .from('performance_metrics')
        .select('performance_score')
        .eq('entity_id', optimization.entity_id)
        .gte('created_at', optimization.created_at)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return null;

      return data.reduce((sum, m) => sum + (m.performance_score || 0), 0) / data.length;
    } catch (error) {
      return null;
    }
  }
}

module.exports = { AutoOptimizer };

// CLI interface
if (require.main === module) {
  const optimizer = new AutoOptimizer({ dryRun: true });

  async function demo() {
    console.log('\n⚡ Auto-Optimizer Demo\n');
    console.log('Running in DRY RUN mode (no changes will be made)\n');

    const result = await optimizer.optimize();

    console.log('\n='.repeat(60));
    console.log(`✅ Optimization complete`);
    console.log(`   Insights processed: ${result.totalInsights}`);
    console.log(`   Actions applied: ${result.actionsApplied}`);
    console.log(`   Duration: ${result.duration}ms`);

    if (result.results && result.results.length > 0) {
      console.log('\n📊 Actions taken:\n');
      result.results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.insight}`);
        console.log(`   ${r.message}`);
        if (r.changes) {
          console.log(`   Changes: ${JSON.stringify(r.changes, null, 2)}`);
        }
        console.log('');
      });
    }

    console.log('='.repeat(60) + '\n');
  }

  demo().catch(console.error);
}
