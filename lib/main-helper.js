/**
 * LinktoFunnel Main Helper
 *
 * Centralized utilities for the AI-powered autonomous business agent
 * Provides initialization, error handling, state management, and workflow orchestration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 4,
};

// ============================================================================
// LOGGER
// ============================================================================

class Logger {
  constructor(level = LOG_LEVELS.INFO) {
    this.level = level;
  }

  _log(level, color, prefix, ...args) {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      console.log(
        `${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}${prefix}${COLORS.reset}`,
        ...args
      );
    }
  }

  debug(...args) {
    this._log(LOG_LEVELS.DEBUG, COLORS.cyan, '[DEBUG]', ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.INFO, COLORS.blue, '[INFO]', ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.WARN, COLORS.yellow, '[WARN]', ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.ERROR, COLORS.red, '[ERROR]', ...args);
  }

  success(...args) {
    this._log(LOG_LEVELS.SUCCESS, COLORS.green, '[SUCCESS]', ...args);
  }

  section(title) {
    console.log('\n' + COLORS.bright + COLORS.cyan + '='.repeat(60) + COLORS.reset);
    console.log(COLORS.bright + COLORS.white + title.toUpperCase() + COLORS.reset);
    console.log(COLORS.bright + COLORS.cyan + '='.repeat(60) + COLORS.reset + '\n');
  }

  step(stepNumber, stepName) {
    console.log(
      `\n${COLORS.bright}${COLORS.magenta}► SCHRITT ${stepNumber}:${COLORS.reset} ${COLORS.white}${stepName}${COLORS.reset}\n`
    );
  }
}

const logger = new Logger(LOG_LEVELS.DEBUG);

// ============================================================================
// ERROR HANDLING
// ============================================================================

class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ErrorHandler {
  static handle(error, context = '') {
    if (error instanceof AppError) {
      logger.error(`${context} - ${error.message}`, error.details);
    } else {
      logger.error(`${context} - ${error.message}`);
    }
    return null;
  }

  static async retry(fn, maxRetries = 3, delay = 1000, context = '') {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          logger.error(`${context} - Failed after ${maxRetries} attempts:`, error.message);
          throw error;
        }
        logger.warn(`${context} - Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  static wrapAsync(fn, context = '') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return ErrorHandler.handle(error, context);
      }
    };
  }
}

// ============================================================================
// CONFIGURATION MANAGER
// ============================================================================

class ConfigManager {
  static validate() {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_GEMINI_KEY',
    ];

    const optional = [
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_CHAT_ID',
      'DIGISTORE24_API_KEY',
      'GETRESPONSE_API_KEY',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new AppError(
        'Missing required environment variables',
        'CONFIG_ERROR',
        { missing }
      );
    }

    const missingOptional = optional.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
      logger.warn('Missing optional environment variables:', missingOptional);
    }

    logger.success('Configuration validated successfully');
    return true;
  }

  static get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  static getAll() {
    return {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
      },
      gemini: {
        apiKey: process.env.GOOGLE_GEMINI_KEY,
      },
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
      },
      digistore24: {
        apiKey: process.env.DIGISTORE24_API_KEY,
      },
      getresponse: {
        apiKey: process.env.GETRESPONSE_API_KEY,
      },
    };
  }
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

class DatabaseHelper {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }

  async query(table, options = {}) {
    try {
      let query = this.db.from(table).select(options.select || '*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new AppError(`Database query failed: ${error.message}`, 'DB_QUERY_ERROR');
    }
  }

  async insert(table, data) {
    try {
      const { data: result, error } = await this.db
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      throw new AppError(`Database insert failed: ${error.message}`, 'DB_INSERT_ERROR');
    }
  }

  async update(table, id, data) {
    try {
      const { data: result, error } = await this.db
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      throw new AppError(`Database update failed: ${error.message}`, 'DB_UPDATE_ERROR');
    }
  }

  async delete(table, id) {
    try {
      const { error } = await this.db
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new AppError(`Database delete failed: ${error.message}`, 'DB_DELETE_ERROR');
    }
  }

  async upsert(table, data, onConflict = 'id') {
    try {
      const { data: result, error } = await this.db
        .from(table)
        .upsert(data, { onConflict })
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      throw new AppError(`Database upsert failed: ${error.message}`, 'DB_UPSERT_ERROR');
    }
  }
}

// ============================================================================
// STATE MANAGER
// ============================================================================

class StateManager {
  constructor(dbHelper) {
    this.db = dbHelper;
    this.state = {};
  }

  async load() {
    try {
      logger.info('Loading system state from database...');

      // Load agent state
      const agentStates = await this.db.query('agent_states', {
        orderBy: { column: 'created_at', ascending: false },
        limit: 1,
      });

      if (agentStates && agentStates.length > 0) {
        this.state = agentStates[0];
      } else {
        // Initialize default state
        this.state = {
          balance: 0,
          total_revenue: 0,
          total_costs: 0,
          active_campaigns: 0,
          total_conversions: 0,
          epsilon: 0.2,
          learning_rate: 0.01,
          last_action: null,
          last_reward: 0,
        };
      }

      logger.success('State loaded successfully');
      return this.state;
    } catch (error) {
      throw new AppError(`Failed to load state: ${error.message}`, 'STATE_LOAD_ERROR');
    }
  }

  async save() {
    try {
      logger.info('Saving system state to database...');

      const stateData = {
        ...this.state,
        updated_at: new Date().toISOString(),
      };

      await this.db.insert('agent_states', stateData);
      logger.success('State saved successfully');
      return true;
    } catch (error) {
      throw new AppError(`Failed to save state: ${error.message}`, 'STATE_SAVE_ERROR');
    }
  }

  get(key, defaultValue = null) {
    return this.state[key] !== undefined ? this.state[key] : defaultValue;
  }

  set(key, value) {
    this.state[key] = value;
  }

  update(updates) {
    this.state = { ...this.state, ...updates };
  }

  getAll() {
    return { ...this.state };
  }
}

// ============================================================================
// METRICS CALCULATOR
// ============================================================================

class MetricsCalculator {
  static calculateROI(revenue, costs) {
    if (costs === 0) return revenue > 0 ? Infinity : 0;
    return ((revenue - costs) / costs) * 100;
  }

  static calculateProfit(revenue, costs) {
    return revenue - costs;
  }

  static calculateConversionRate(conversions, impressions) {
    if (impressions === 0) return 0;
    return (conversions / impressions) * 100;
  }

  static calculateCTR(clicks, impressions) {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  }

  static calculateCPA(costs, conversions) {
    if (conversions === 0) return 0;
    return costs / conversions;
  }

  static calculateLTV(avgOrderValue, purchaseFrequency, customerLifespan) {
    return avgOrderValue * purchaseFrequency * customerLifespan;
  }

  static formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
  }

  static formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}

// ============================================================================
// WORKFLOW MANAGER
// ============================================================================

class WorkflowManager {
  constructor() {
    this.steps = [];
    this.currentStep = 0;
    this.results = {};
  }

  addStep(name, fn, options = {}) {
    this.steps.push({
      name,
      fn,
      retries: options.retries || 3,
      timeout: options.timeout || 60000,
      critical: options.critical !== false,
    });
  }

  async execute() {
    logger.section('WORKFLOW EXECUTION');

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      this.currentStep = i + 1;

      logger.step(this.currentStep, step.name);

      try {
        const result = await ErrorHandler.retry(
          () => this._executeWithTimeout(step.fn, step.timeout),
          step.retries,
          1000,
          step.name
        );

        this.results[step.name] = result;
        logger.success(`✓ ${step.name} completed successfully`);
      } catch (error) {
        logger.error(`✗ ${step.name} failed:`, error.message);

        if (step.critical) {
          logger.error('Critical step failed. Aborting workflow.');
          throw error;
        } else {
          logger.warn('Non-critical step failed. Continuing workflow.');
          this.results[step.name] = null;
        }
      }
    }

    logger.success('Workflow completed!');
    return this.results;
  }

  async _executeWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      ),
    ]);
  }

  getResults() {
    return this.results;
  }

  reset() {
    this.steps = [];
    this.currentStep = 0;
    this.results = {};
  }
}

// ============================================================================
// API REQUEST HELPER
// ============================================================================

class APIHelper {
  static async request(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const config = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR',
          { url, status: response.status }
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AppError('Request timeout', 'TIMEOUT_ERROR', { url });
      }
      throw error;
    }
  }

  static async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  static async post(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async put(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// ============================================================================
// NOTIFICATION HELPER
// ============================================================================

class NotificationHelper {
  static async sendTelegram(message, options = {}) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      logger.warn('Telegram credentials not configured. Skipping notification.');
      return null;
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await APIHelper.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode || 'Markdown',
      });
      logger.success('Telegram notification sent');
      return true;
    } catch (error) {
      logger.error('Failed to send Telegram notification:', error.message);
      return null;
    }
  }

  static formatReport(data) {
    const lines = [
      '📊 *LinktoFunnel Report*',
      '',
      `📅 Datum: ${new Date().toLocaleDateString('de-DE')}`,
      `⏰ Zeit: ${new Date().toLocaleTimeString('de-DE')}`,
      '',
      '💰 *Finanzen*',
      `└ Balance: ${MetricsCalculator.formatCurrency(data.balance || 0)}`,
      `└ Umsatz: ${MetricsCalculator.formatCurrency(data.revenue || 0)}`,
      `└ Kosten: ${MetricsCalculator.formatCurrency(data.costs || 0)}`,
      `└ Gewinn: ${MetricsCalculator.formatCurrency(data.profit || 0)}`,
      `└ ROI: ${MetricsCalculator.formatPercentage(data.roi || 0)}`,
      '',
      '📈 *Kampagnen*',
      `└ Aktiv: ${data.activeCampaigns || 0}`,
      `└ Conversions: ${data.conversions || 0}`,
      `└ Conversion Rate: ${MetricsCalculator.formatPercentage(data.conversionRate || 0)}`,
      '',
      '🎯 *Produkte*',
      `└ Analysiert: ${data.productsAnalyzed || 0}`,
      `└ Top Produkt: ${data.topProduct || 'N/A'}`,
      '',
      '✨ Erstellt von LinktoFunnel AI',
    ];

    return lines.join('\n');
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

class Utils {
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static formatDate(date, format = 'de-DE') {
    return new Date(date).toLocaleDateString(format);
  }

  static formatTime(date, format = 'de-DE') {
    return new Date(date).toLocaleTimeString(format);
  }

  static formatDateTime(date, format = 'de-DE') {
    return `${this.formatDate(date, format)} ${this.formatTime(date, format)}`;
  }

  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
  }

  static ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static readJSON(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new AppError(`Failed to read JSON file: ${error.message}`, 'FILE_READ_ERROR');
    }
  }

  static writeJSON(filePath, data) {
    try {
      Utils.ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new AppError(`Failed to write JSON file: ${error.message}`, 'FILE_WRITE_ERROR');
    }
  }

  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ============================================================================
// MAIN HELPER CLASS
// ============================================================================

class MainHelper {
  constructor() {
    this.logger = logger;
    this.config = null;
    this.supabase = null;
    this.db = null;
    this.state = null;
    this.workflow = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      logger.section('SYSTEM INITIALIZATION');

      // Validate configuration
      logger.info('Validating configuration...');
      ConfigManager.validate();

      // Get configuration
      this.config = ConfigManager.getAll();

      // Initialize Supabase
      logger.info('Initializing Supabase...');
      this.supabase = createClient(
        this.config.supabase.url,
        this.config.supabase.key
      );

      // Initialize database helper
      this.db = new DatabaseHelper(this.supabase);

      // Initialize state manager
      this.state = new StateManager(this.db);
      await this.state.load();

      // Initialize workflow manager
      this.workflow = new WorkflowManager();

      this.initialized = true;
      logger.success('System initialized successfully!');

      return this;
    } catch (error) {
      logger.error('Initialization failed:', error.message);
      throw error;
    }
  }

  async healthCheck() {
    logger.section('HEALTH CHECK');

    const checks = {
      config: false,
      database: false,
      openai: false,
      gemini: false,
    };

    // Check config
    try {
      ConfigManager.validate();
      checks.config = true;
      logger.success('✓ Configuration OK');
    } catch (error) {
      logger.error('✗ Configuration FAILED:', error.message);
    }

    // Check database
    try {
      const { data, error } = await this.supabase
        .from('agent_states')
        .select('count')
        .limit(1);

      if (!error) {
        checks.database = true;
        logger.success('✓ Database OK');
      } else {
        throw error;
      }
    } catch (error) {
      logger.error('✗ Database FAILED:', error.message);
    }

    // Check OpenAI (basic validation)
    if (process.env.OPENAI_API_KEY) {
      checks.openai = true;
      logger.success('✓ OpenAI API Key configured');
    } else {
      logger.error('✗ OpenAI API Key missing');
    }

    // Check Gemini (basic validation)
    if (process.env.GOOGLE_GEMINI_KEY) {
      checks.gemini = true;
      logger.success('✓ Gemini API Key configured');
    } else {
      logger.error('✗ Gemini API Key missing');
    }

    const allHealthy = Object.values(checks).every(check => check);

    if (allHealthy) {
      logger.success('All systems operational!');
    } else {
      logger.warn('Some systems are not operational');
    }

    return checks;
  }

  getLogger() {
    return logger;
  }

  getDB() {
    return this.db;
  }

  getState() {
    return this.state;
  }

  getWorkflow() {
    return this.workflow;
  }

  async shutdown() {
    logger.info('Shutting down system...');

    if (this.state) {
      await this.state.save();
    }

    logger.success('System shutdown complete');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MainHelper,
  Logger,
  logger,
  ErrorHandler,
  AppError,
  ConfigManager,
  DatabaseHelper,
  StateManager,
  MetricsCalculator,
  WorkflowManager,
  APIHelper,
  NotificationHelper,
  Utils,
  COLORS,
  LOG_LEVELS,
};

export default MainHelper;
