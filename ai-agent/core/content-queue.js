#!/usr/bin/env node

/**
 * 📦 CONTENT QUEUE MANAGER
 * Verwaltet Content-Warteschlange für Approval & Auto-Posting
 *
 * Features:
 * - Queue Persistence (JSON)
 * - Status Management (pending/approved/rejected/posted)
 * - Automatic Cleanup
 * - Error Tracking
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const QUEUE_DIR = path.join(__dirname, '../../data/post-queue');
const QUEUE_FILE = path.join(QUEUE_DIR, 'queue.json');
const POSTED_DIR = path.join(QUEUE_DIR, 'posted');

class ContentQueue {
  constructor() {
    this.queue = [];
    this.initialized = false;
  }

  // ===== INITIALIZATION =====

  async init() {
    if (this.initialized) return;

    try {
      // Create directories
      await fs.mkdir(QUEUE_DIR, { recursive: true });
      await fs.mkdir(POSTED_DIR, { recursive: true });

      // Load existing queue
      await this.load();

      this.initialized = true;
      console.log('✅ Content Queue initialized');
    } catch (error) {
      console.error('❌ Queue init error:', error.message);
      this.queue = [];
      this.initialized = true;
    }
  }

  // ===== QUEUE OPERATIONS =====

  /**
   * Add content to queue for approval
   */
  async addToQueue(content, platforms = ['tiktok', 'instagram', 'youtube']) {
    await this.init();

    const queueItem = {
      id: this.generateId(),
      content: content,
      platforms: platforms,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attempts: 0,
      errors: [],
    };

    this.queue.push(queueItem);
    await this.save();

    console.log(`✅ Added to queue: ${queueItem.id}`);
    console.log(`   Platforms: ${platforms.join(', ')}`);

    return queueItem;
  }

  /**
   * Get all pending items
   */
  async getPending() {
    await this.init();
    return this.queue.filter(item => item.status === 'pending');
  }

  /**
   * Get all approved items ready to post
   */
  async getApproved() {
    await this.init();
    return this.queue.filter(item => item.status === 'approved');
  }

  /**
   * Get item by ID
   */
  async getById(id) {
    await this.init();
    return this.queue.find(item => item.id === id);
  }

  /**
   * Approve item for posting
   */
  async approve(id) {
    await this.init();

    const item = await this.getById(id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    if (item.status !== 'pending') {
      throw new Error(`Item ${id} is not pending (status: ${item.status})`);
    }

    item.status = 'approved';
    item.approved_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();

    await this.save();

    console.log(`✅ Approved: ${id}`);

    return item;
  }

  /**
   * Reject item
   */
  async reject(id, reason = '') {
    await this.init();

    const item = await this.getById(id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    if (item.status !== 'pending') {
      throw new Error(`Item ${id} is not pending (status: ${item.status})`);
    }

    item.status = 'rejected';
    item.rejected_at = new Date().toISOString();
    item.rejected_reason = reason;
    item.updated_at = new Date().toISOString();

    await this.save();

    console.log(`❌ Rejected: ${id}`);

    return item;
  }

  /**
   * Mark item as posted
   */
  async markAsPosted(id, postResults) {
    await this.init();

    const item = await this.getById(id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    item.status = 'posted';
    item.posted_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();
    item.post_results = postResults;

    await this.save();

    console.log(`✅ Posted: ${id}`);

    // Archive to posted folder
    await this.archiveItem(item);

    return item;
  }

  /**
   * Mark item as failed
   */
  async markAsFailed(id, error) {
    await this.init();

    const item = await this.getById(id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    item.attempts = (item.attempts || 0) + 1;
    item.errors.push({
      message: error.message || error,
      timestamp: new Date().toISOString(),
      attempt: item.attempts,
    });

    // After 3 failed attempts, mark as failed
    if (item.attempts >= 3) {
      item.status = 'failed';
      item.failed_at = new Date().toISOString();
      console.log(`❌ Failed permanently after 3 attempts: ${id}`);
    } else {
      item.status = 'approved'; // Keep it approved for retry
      console.log(`⚠️ Failed attempt ${item.attempts}/3: ${id}`);
    }

    item.updated_at = new Date().toISOString();

    await this.save();

    return item;
  }

  /**
   * Remove item from queue
   */
  async remove(id) {
    await this.init();

    const index = this.queue.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item not found: ${id}`);
    }

    const item = this.queue[index];
    this.queue.splice(index, 1);

    await this.save();

    console.log(`🗑️ Removed from queue: ${id}`);

    return item;
  }

  // ===== CLEANUP =====

  /**
   * Clean up old items
   */
  async cleanup(maxAgeDays = 7) {
    await this.init();

    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const toRemove = this.queue.filter(item => {
      const age = now - new Date(item.created_at).getTime();
      return (
        age > maxAgeMs &&
        (item.status === 'posted' || item.status === 'rejected' || item.status === 'failed')
      );
    });

    for (const item of toRemove) {
      await this.remove(item.id);
    }

    console.log(`🧹 Cleaned up ${toRemove.length} old items`);

    return toRemove.length;
  }

  // ===== PERSISTENCE =====

  async save() {
    try {
      await fs.writeFile(
        QUEUE_FILE,
        JSON.stringify(this.queue, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Save queue error:', error.message);
    }
  }

  async load() {
    try {
      const data = await fs.readFile(QUEUE_FILE, 'utf-8');
      this.queue = JSON.parse(data);
      console.log(`📦 Loaded ${this.queue.length} items from queue`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet - that's ok
        this.queue = [];
      } else {
        console.error('❌ Load queue error:', error.message);
        this.queue = [];
      }
    }
  }

  async archiveItem(item) {
    try {
      const archiveFile = path.join(POSTED_DIR, `${item.id}.json`);
      await fs.writeFile(
        archiveFile,
        JSON.stringify(item, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('⚠️ Archive error:', error.message);
    }
  }

  // ===== UTILITIES =====

  generateId() {
    return `post_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    await this.init();

    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      approved: this.queue.filter(i => i.status === 'approved').length,
      rejected: this.queue.filter(i => i.status === 'rejected').length,
      posted: this.queue.filter(i => i.status === 'posted').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };
  }

  /**
   * Format item for display
   */
  formatItem(item) {
    const contentPreview = item.content?.caption || item.content?.script?.hook || 'No content';
    const preview = contentPreview.substring(0, 60) + (contentPreview.length > 60 ? '...' : '');

    return {
      id: item.id,
      status: item.status,
      platforms: item.platforms.join(', '),
      preview: preview,
      created: new Date(item.created_at).toLocaleString('de-DE'),
      attempts: item.attempts || 0,
    };
  }
}

// Singleton instance
let queueInstance = null;

function getQueue() {
  if (!queueInstance) {
    queueInstance = new ContentQueue();
  }
  return queueInstance;
}

module.exports = { ContentQueue, getQueue };

// ===== CLI TESTING =====
if (require.main === module) {
  (async () => {
    const queue = new ContentQueue();

    console.log('\n🧪 Testing Content Queue\n');

    // Add test items
    const item1 = await queue.addToQueue({
      script: {
        hook: '🔥 Niemand erzählt dir das...',
        value: 'Mit dieser einen Methode...',
        cta: 'Link in Bio!',
        hashtags: ['geldverdienen', 'passiveinkommen']
      },
      productName: 'Test Product'
    }, ['tiktok', 'instagram']);

    const item2 = await queue.addToQueue({
      script: {
        hook: '💰 So verdienst du 1000€ im Monat',
        value: 'Ohne Vorkenntnisse...',
      }
    }, ['youtube']);

    // Get pending
    console.log('\n📋 Pending items:');
    const pending = await queue.getPending();
    pending.forEach(item => {
      console.log(`   ${item.id}: ${item.content.script.hook}`);
    });

    // Approve
    console.log('\n✅ Approving first item...');
    await queue.approve(item1.id);

    // Get approved
    console.log('\n✅ Approved items:');
    const approved = await queue.getApproved();
    approved.forEach(item => {
      console.log(`   ${item.id}: ${item.content.script.hook}`);
    });

    // Reject
    console.log('\n❌ Rejecting second item...');
    await queue.reject(item2.id, 'Content not good enough');

    // Stats
    console.log('\n📊 Queue Stats:');
    const stats = await queue.getStats();
    console.log(stats);

    console.log('\n✅ Queue tests complete!\n');
  })().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
