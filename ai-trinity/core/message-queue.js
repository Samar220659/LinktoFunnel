/**
 * 📬 MESSAGE QUEUE SYSTEM
 * File-based message queue for AI Trinity Bridge
 * Enables asynchronous communication between Claude AI, Gemini, and Claude Code
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const chokidar = require('chokidar');

class MessageQueue extends EventEmitter {
  constructor(basePath = './ai-trinity/queue') {
    super();
    this.basePath = basePath;
    this.queues = {
      inbox: path.join(basePath, 'inbox'),
      processing: path.join(basePath, 'processing'),
      done: path.join(basePath, 'done'),
      failed: path.join(basePath, 'failed')
    };
    this.watcher = null;
  }

  async init() {
    // Create queue directories
    for (const queuePath of Object.values(this.queues)) {
      await fs.mkdir(queuePath, { recursive: true });
    }

    // Start file watcher
    this.startWatcher();
    console.log('✅ Message Queue initialized');
  }

  startWatcher() {
    this.watcher = chokidar.watch(this.queues.inbox, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher.on('add', async (filePath) => {
      const messageId = path.basename(filePath, '.json');
      console.log(`📨 New message: ${messageId}`);
      await this.processMessage(filePath);
    });

    this.watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });
  }

  async processMessage(filePath) {
    try {
      const messageId = path.basename(filePath, '.json');
      const content = await fs.readFile(filePath, 'utf8');
      const message = JSON.parse(content);

      // Move to processing
      const processingPath = path.join(this.queues.processing, `${messageId}.json`);
      await fs.rename(filePath, processingPath);

      console.log(`🔄 Processing: ${messageId}`);

      // Emit for routing
      this.emit('message', message, messageId, processingPath);

    } catch (error) {
      console.error(`❌ Failed to process message: ${error.message}`);

      // Move to failed queue
      try {
        const failedPath = path.join(this.queues.failed, path.basename(filePath));
        await fs.rename(filePath, failedPath);
      } catch (moveError) {
        console.error('Failed to move to failed queue:', moveError);
      }
    }
  }

  async completeMessage(messageId, result) {
    const processingPath = path.join(this.queues.processing, `${messageId}.json`);
    const donePath = path.join(this.queues.done, `${messageId}.json`);

    try {
      const message = JSON.parse(await fs.readFile(processingPath, 'utf8'));
      message.result = result;
      message.completedAt = new Date().toISOString();

      await fs.writeFile(donePath, JSON.stringify(message, null, 2));
      await fs.unlink(processingPath);

      console.log(`✅ Message completed: ${messageId}`);
    } catch (error) {
      console.error(`Failed to complete message ${messageId}:`, error);
    }
  }

  async failMessage(messageId, error) {
    const processingPath = path.join(this.queues.processing, `${messageId}.json`);
    const failedPath = path.join(this.queues.failed, `${messageId}.json`);

    try {
      const message = JSON.parse(await fs.readFile(processingPath, 'utf8'));
      message.error = error.message || error;
      message.failedAt = new Date().toISOString();

      await fs.writeFile(failedPath, JSON.stringify(message, null, 2));
      await fs.unlink(processingPath);

      console.error(`❌ Message failed: ${messageId} - ${error.message || error}`);
    } catch (err) {
      console.error(`Failed to mark message as failed ${messageId}:`, err);
    }
  }

  async enqueue(from, to, task, data) {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      from,
      to,
      task,
      data,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(this.queues.inbox, `${messageId}.json`);
    await fs.writeFile(filePath, JSON.stringify(message, null, 2));

    console.log(`📤 Message enqueued: ${messageId} (${from} → ${to})`);
    return messageId;
  }

  async getQueueStats() {
    const stats = {};

    for (const [name, queuePath] of Object.entries(this.queues)) {
      try {
        const files = await fs.readdir(queuePath);
        stats[name] = files.length;
      } catch (error) {
        stats[name] = 0;
      }
    }

    return stats;
  }

  async cleanup(olderThanDays = 7) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    for (const queuePath of [this.queues.done, this.queues.failed]) {
      const files = await fs.readdir(queuePath);

      for (const file of files) {
        const filePath = path.join(queuePath, file);
        const stats = await fs.stat(filePath);

        if (stats.mtimeMs < cutoffTime) {
          await fs.unlink(filePath);
          console.log(`🧹 Cleaned up old message: ${file}`);
        }
      }
    }
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      console.log('🛑 Message Queue stopped');
    }
  }
}

module.exports = { MessageQueue };
