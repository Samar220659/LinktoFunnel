/**
 * 🛑 GRACEFUL SHUTDOWN HANDLER
 *
 * Ensures proper cleanup when process receives termination signals.
 * Prevents data loss and ensures clean exit.
 *
 * Usage:
 *   const { setupGracefulShutdown } = require('./utils/shutdown-handler');
 *   setupGracefulShutdown(async () => {
 *     // Your cleanup code here
 *     await closeDatabase();
 *     await saveState();
 *   });
 */

let isShuttingDown = false;
const cleanupHandlers = [];

/**
 * Register a cleanup handler
 */
function registerCleanupHandler(handler) {
  cleanupHandlers.push(handler);
}

/**
 * Execute all cleanup handlers
 */
async function executeCleanup() {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;

  console.log('\n🛑 Shutting down gracefully...');
  console.log(`   ${cleanupHandlers.length} cleanup handlers registered\n`);

  for (const [index, handler] of cleanupHandlers.entries()) {
    try {
      console.log(`   [${index + 1}/${cleanupHandlers.length}] Running cleanup handler...`);
      await handler();
      console.log(`   ✅ Cleanup handler ${index + 1} completed`);
    } catch (error) {
      console.error(`   ❌ Cleanup handler ${index + 1} failed:`, error.message);
    }
  }

  console.log('\n✅ Graceful shutdown complete\n');
}

/**
 * Setup graceful shutdown handlers
 *
 * @param {Function} cleanupFn - Async function to run on shutdown
 */
function setupGracefulShutdown(cleanupFn) {
  if (cleanupFn) {
    registerCleanupHandler(cleanupFn);
  }

  // Handle SIGTERM (docker/k8s stop)
  process.on('SIGTERM', async () => {
    console.log('\n📡 Received SIGTERM signal');
    await executeCleanup();
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('\n📡 Received SIGINT signal (Ctrl+C)');
    await executeCleanup();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('\n💥 Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
    await executeCleanup();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('\n💥 Unhandled Promise Rejection:', reason);
    console.error('Promise:', promise);
    await executeCleanup();
    process.exit(1);
  });

  console.log('✅ Graceful shutdown handlers installed');
}

/**
 * Common cleanup utilities
 */
const cleanupUtils = {
  /**
   * Close Supabase client
   */
  async closeSupabase(supabaseClient) {
    console.log('   Closing Supabase connections...');
    // Supabase client doesn't need explicit close, but we can clear any pending requests
    // This is a placeholder for future improvements
  },

  /**
   * Save state to database
   */
  async saveState(supabaseClient, state, tableName = 'system_state') {
    console.log('   Saving system state...');
    try {
      await supabaseClient.from(tableName).upsert({
        id: 'main',
        state: state,
        updated_at: new Date().toISOString(),
      });
      console.log('   ✅ State saved');
    } catch (error) {
      console.error('   ❌ Failed to save state:', error.message);
    }
  },

  /**
   * Flush logs
   */
  async flushLogs(logger) {
    console.log('   Flushing logs...');
    if (logger && typeof logger.end === 'function') {
      return new Promise((resolve) => {
        logger.end(resolve);
      });
    }
  },

  /**
   * Cancel in-flight requests
   */
  async cancelInflightRequests() {
    console.log('   Cancelling in-flight requests...');
    // Placeholder - actual implementation would track and cancel active requests
  },

  /**
   * Send shutdown notification
   */
  async sendShutdownNotification(notificationFn) {
    console.log('   Sending shutdown notification...');
    try {
      await notificationFn('System is shutting down');
    } catch (error) {
      console.error('   ❌ Failed to send notification:', error.message);
    }
  },
};

/**
 * Create a shutdown handler with common operations
 */
function createShutdownHandler(options = {}) {
  const {
    supabaseClient,
    state,
    logger,
    notificationFn,
    customCleanup,
  } = options;

  return async () => {
    // Save state
    if (supabaseClient && state) {
      await cleanupUtils.saveState(supabaseClient, state);
    }

    // Flush logs
    if (logger) {
      await cleanupUtils.flushLogs(logger);
    }

    // Send notification
    if (notificationFn) {
      await cleanupUtils.sendShutdownNotification(notificationFn);
    }

    // Run custom cleanup
    if (customCleanup) {
      console.log('   Running custom cleanup...');
      await customCleanup();
    }

    // Close connections
    if (supabaseClient) {
      await cleanupUtils.closeSupabase(supabaseClient);
    }
  };
}

module.exports = {
  setupGracefulShutdown,
  registerCleanupHandler,
  executeCleanup,
  cleanupUtils,
  createShutdownHandler,
  isShuttingDown: () => isShuttingDown,
};
