/**
 * 🔄 API HELPER - Retry Logic + Timeout Handling
 *
 * Production-grade API helper with:
 * - Exponential backoff retry
 * - Timeout handling
 * - Error classification (retryable vs permanent)
 * - Request/response logging
 *
 * Usage:
 *   const { fetchWithRetry } = require('./utils/api-helper');
 *   const data = await fetchWithRetry('https://api.example.com/endpoint', options);
 */

const { createLogger } = require('./logger');
const logger = createLogger('api-helper');

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error.status) {
    return (
      error.status === 408 || // Request Timeout
      error.status === 429 || // Too Many Requests
      error.status === 500 || // Internal Server Error
      error.status === 502 || // Bad Gateway
      error.status === 503 || // Service Unavailable
      error.status === 504    // Gateway Timeout
    );
  }

  // Generic timeout errors
  if (error.message && error.message.toLowerCase().includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Fetch with retry and exponential backoff
 *
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {object} retryConfig - Retry configuration
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRetry(
  url,
  options = {},
  retryConfig = {}
) {
  const {
    maxRetries = 3,
    timeoutMs = 10000,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    onRetry = null,
  } = retryConfig;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Add abort signal to fetch options
      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };

      // Make the request
      const response = await fetch(url, fetchOptions);

      // Clear timeout
      clearTimeout(timeoutId);

      // Check if response is ok (2xx status)
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;

        // If not retryable, throw immediately
        if (!isRetryableError(error)) {
          throw error;
        }

        // Otherwise, treat as retryable error
        lastError = error;

        // If last attempt, throw
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelayMs * Math.pow(backoffMultiplier, attempt),
          maxDelayMs
        );

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, maxRetries, delay, error);
        } else {
          logger.warn(`API request failed, retrying`, {
            attempt: attempt + 1,
            maxRetries,
            delayMs: delay,
            error: error.message,
            url,
          });
        }

        await sleep(delay);
        continue;
      }

      // Success!
      return response;

    } catch (error) {
      lastError = error;

      // Handle abort/timeout errors
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
        timeoutError.isTimeout = true;
        lastError = timeoutError;
      }

      // If not retryable, throw immediately
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // If last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, lastError);
      } else {
        logger.warn(`Request timeout, retrying`, {
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
          error: lastError.message,
        });
      }

      await sleep(delay);
    }
  }

  // Should never reach here, but just in case
  throw lastError;
}

/**
 * Fetch JSON with retry
 */
async function fetchJSONWithRetry(url, options = {}, retryConfig = {}) {
  const response = await fetchWithRetry(url, options, retryConfig);
  return await response.json();
}

/**
 * Fetch text with retry
 */
async function fetchTextWithRetry(url, options = {}, retryConfig = {}) {
  const response = await fetchWithRetry(url, options, retryConfig);
  return await response.text();
}

/**
 * Retry any async function (not just fetch)
 */
async function retryAsync(
  fn,
  args = [],
  retryConfig = {}
) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    shouldRetry = isRetryableError,
    onRetry = null,
  } = retryConfig;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;

      // Check if should retry
      if (!shouldRetry(error)) {
        throw error;
      }

      // If last attempt, throw
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error);
      } else {
        logger.warn(`Operation failed, retrying`, {
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
          error: error.message,
        });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Rate limiter utility
 */
class RateLimiter {
  constructor(requestsPerSecond = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.minInterval = 1000 / requestsPerSecond; // ms between requests
    this.lastRequestTime = 0;
  }

  async acquire() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  async execute(fn) {
    await this.acquire();
    return await fn();
  }
}

/**
 * Circuit breaker pattern
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.error(`Circuit breaker opened`, {
        failureCount: this.failureCount,
        resetTimeoutMs: this.resetTimeout,
      });
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
    };
  }
}

module.exports = {
  fetchWithRetry,
  fetchJSONWithRetry,
  fetchTextWithRetry,
  retryAsync,
  isRetryableError,
  RateLimiter,
  CircuitBreaker,
  sleep,
};
