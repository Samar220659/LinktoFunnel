#!/usr/bin/env node

/**
 * 📝 STRUCTURED LOGGER
 * Production-grade logging without external dependencies
 *
 * Features:
 * - JSON structured output for production
 * - Log levels (error, warn, info, debug)
 * - Timestamps with ISO 8601 format
 * - Colorized console output for development
 * - File output support
 * - Context and metadata support
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Colors for terminal output
const COLORS = {
  error: '\x1b[31m',   // Red
  warn: '\x1b[33m',    // Yellow
  info: '\x1b[36m',    // Cyan
  debug: '\x1b[90m',   // Gray
  reset: '\x1b[0m',
};

class Logger {
  constructor(options = {}) {
    this.level = LOG_LEVELS[options.level || process.env.LOG_LEVEL || 'info'];
    this.service = options.service || 'ai-agent';
    this.format = options.format || process.env.LOG_FORMAT || 'pretty'; // 'pretty' or 'json'
    this.logFile = options.logFile || process.env.LOG_FILE;
    this.context = options.context || {};

    // Create log directory if file logging is enabled
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context = {}) {
    return new Logger({
      level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.level),
      service: this.service,
      format: this.format,
      logFile: this.logFile,
      context: { ...this.context, ...context },
    });
  }

  /**
   * Internal log method
   */
  _log(level, message, meta = {}) {
    // Check if this log level should be output
    if (LOG_LEVELS[level] > this.level) {
      return;
    }

    const timestamp = new Date().toISOString();

    // Build log entry
    const logEntry = {
      timestamp,
      level,
      service: this.service,
      message,
      ...this.context,
      ...meta,
    };

    // Add error stack trace if present
    if (meta.error instanceof Error) {
      logEntry.error = {
        message: meta.error.message,
        stack: meta.error.stack,
        name: meta.error.name,
      };
    }

    // Format output
    let output;

    if (this.format === 'json') {
      // JSON format for production
      output = JSON.stringify(logEntry);
    } else {
      // Pretty format for development
      const color = COLORS[level] || '';
      const levelStr = level.toUpperCase().padEnd(5);
      const metaStr = Object.keys(meta).length > 0 && !meta.error
        ? ' ' + util.inspect(meta, { colors: true, depth: 3, compact: true })
        : '';
      const errorStr = meta.error instanceof Error
        ? '\n' + meta.error.stack
        : '';

      output = `${color}${timestamp} [${levelStr}]${COLORS.reset} ${this.service}: ${message}${metaStr}${errorStr}`;
    }

    // Output to console
    if (level === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }

    // Output to file if configured
    if (this.logFile) {
      const fileOutput = this.format === 'json'
        ? output + '\n'
        : output.replace(/\x1b\[\d+m/g, '') + '\n'; // Strip colors for file

      fs.appendFileSync(this.logFile, fileOutput, 'utf8');
    }
  }

  /**
   * Log methods
   */
  error(message, meta = {}) {
    this._log('error', message, meta);
  }

  warn(message, meta = {}) {
    this._log('warn', message, meta);
  }

  info(message, meta = {}) {
    this._log('info', message, meta);
  }

  debug(message, meta = {}) {
    this._log('debug', message, meta);
  }

  /**
   * Utility method for measuring execution time
   */
  time(label) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration_ms: duration });
    };
  }

  /**
   * Utility method for wrapping async operations with logging
   */
  async trace(operation, fn, meta = {}) {
    const timer = this.time(operation);
    this.debug(`${operation} started`, meta);

    try {
      const result = await fn();
      timer();
      this.info(`${operation} succeeded`, meta);
      return result;
    } catch (error) {
      timer();
      this.error(`${operation} failed`, { ...meta, error });
      throw error;
    }
  }
}

/**
 * Create default logger instance
 */
const defaultLogger = new Logger({
  service: 'ai-agent',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  level: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE,
});

/**
 * Create a logger for a specific module/service
 */
function createLogger(service, options = {}) {
  return new Logger({
    service,
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    level: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE,
    ...options,
  });
}

module.exports = {
  Logger,
  createLogger,
  logger: defaultLogger,
  error: defaultLogger.error.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  debug: defaultLogger.debug.bind(defaultLogger),
};
