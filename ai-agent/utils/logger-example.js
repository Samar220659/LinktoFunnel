#!/usr/bin/env node

/**
 * 📝 LOGGER USAGE EXAMPLES
 * Demonstrates how to use the structured logger
 */

const { createLogger, logger } = require('./logger');

// ===== EXAMPLE 1: Using default logger =====
logger.info('Application started');
logger.debug('Debug information', { config: { mode: 'production' } });
logger.warn('This is a warning', { user: 'test@example.com' });
logger.error('An error occurred', { error: new Error('Test error') });

// ===== EXAMPLE 2: Creating module-specific loggers =====
const dbLogger = createLogger('database');
dbLogger.info('Database connected', { host: 'localhost', port: 5432 });

const apiLogger = createLogger('api');
apiLogger.info('API request received', {
  method: 'POST',
  path: '/api/products',
  ip: '127.0.0.1',
});

// ===== EXAMPLE 3: Timing operations =====
async function fetchProducts() {
  const timer = logger.time('fetchProducts');

  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  timer(); // Logs: "fetchProducts completed { duration_ms: 100 }"
}

// ===== EXAMPLE 4: Tracing operations with automatic logging =====
async function processOrder(orderId) {
  return await logger.trace(
    'processOrder',
    async () => {
      // Your async operation
      await new Promise(resolve => setTimeout(resolve, 50));
      return { orderId, status: 'completed' };
    },
    { orderId }
  );
}

// ===== EXAMPLE 5: Child loggers with context =====
function handleUserRequest(userId) {
  const userLogger = logger.child({ userId });

  userLogger.info('User request started');
  userLogger.debug('Processing user data');
  userLogger.info('User request completed');

  // All logs will include { userId: '...' }
}

// ===== EXAMPLE 6: Error logging with stack traces =====
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Failed to process request', {
    error,
    additionalContext: { step: 'validation' },
  });
}

// ===== ENVIRONMENT CONFIGURATION =====

/*
  Set these environment variables to configure logging:

  LOG_LEVEL=debug          # error, warn, info, debug (default: info)
  LOG_FORMAT=json          # json or pretty (default: pretty in dev, json in prod)
  LOG_FILE=/var/log/app.log  # Optional: log to file
  NODE_ENV=production      # Automatically switches to JSON format

  Examples:

  # Development (pretty, colored output):
  NODE_ENV=development LOG_LEVEL=debug node your-script.js

  # Production (JSON output for log aggregation):
  NODE_ENV=production LOG_LEVEL=info LOG_FILE=/var/log/app.log node your-script.js
*/

// Run examples
async function runExamples() {
  console.log('\n=== LOGGER EXAMPLES ===\n');

  await fetchProducts();
  const result = await processOrder('ORD-123');
  handleUserRequest('user-456');

  console.log('\n=== END EXAMPLES ===\n');
}

if (require.main === module) {
  runExamples();
}
