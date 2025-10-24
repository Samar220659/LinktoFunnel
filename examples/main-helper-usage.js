/**
 * LinktoFunnel Main Helper - Usage Examples
 *
 * This file demonstrates how to use the main helper module
 * in your LinktoFunnel automation workflows
 */

import MainHelper, {
  logger,
  ErrorHandler,
  MetricsCalculator,
  NotificationHelper,
  Utils,
} from '../lib/main-helper.js';

// ============================================================================
// EXAMPLE 1: Basic Initialization
// ============================================================================

async function example1_BasicInitialization() {
  logger.section('EXAMPLE 1: Basic Initialization');

  const helper = new MainHelper();
  await helper.initialize();

  // Access components
  const db = helper.getDB();
  const state = helper.getState();

  logger.info('Current state:', state.getAll());

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 2: Database Operations
// ============================================================================

async function example2_DatabaseOperations() {
  logger.section('EXAMPLE 2: Database Operations');

  const helper = new MainHelper();
  await helper.initialize();

  const db = helper.getDB();

  // Query data
  const products = await db.query('digistore_products', {
    orderBy: { column: 'conversion_rate', ascending: false },
    limit: 5,
  });

  logger.info(`Found ${products.length} top products`);

  // Insert data
  const newCampaign = await db.insert('campaigns', {
    name: 'Test Campaign',
    product_id: 'test-123',
    status: 'active',
    created_at: new Date().toISOString(),
  });

  logger.success('Campaign created:', newCampaign);

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 3: State Management
// ============================================================================

async function example3_StateManagement() {
  logger.section('EXAMPLE 3: State Management');

  const helper = new MainHelper();
  await helper.initialize();

  const state = helper.getState();

  // Read state
  const currentBalance = state.get('balance', 0);
  logger.info('Current balance:', MetricsCalculator.formatCurrency(currentBalance));

  // Update state
  state.set('balance', currentBalance + 100);
  state.update({
    total_revenue: state.get('total_revenue', 0) + 150,
    total_costs: state.get('total_costs', 0) + 50,
  });

  // Save state
  await state.save();

  logger.success('State updated and saved');

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 4: Workflow Execution
// ============================================================================

async function example4_WorkflowExecution() {
  logger.section('EXAMPLE 4: Workflow Execution');

  const helper = new MainHelper();
  await helper.initialize();

  const workflow = helper.getWorkflow();

  // Define workflow steps
  workflow.addStep('Initialize', async () => {
    logger.info('Initializing workflow...');
    await Utils.sleep(1000);
    return { initialized: true };
  });

  workflow.addStep('Fetch Products', async () => {
    logger.info('Fetching products from Digistore24...');
    await Utils.sleep(2000);
    return { products: ['Product A', 'Product B', 'Product C'] };
  }, { retries: 5 });

  workflow.addStep('Generate Content', async () => {
    logger.info('Generating viral content...');
    await Utils.sleep(1500);
    return { content: 'Amazing viral content!' };
  });

  workflow.addStep('Post to Social Media', async () => {
    logger.info('Posting to TikTok, Instagram, YouTube...');
    await Utils.sleep(2000);
    return { posted: true, platforms: ['TikTok', 'Instagram', 'YouTube'] };
  }, { critical: false }); // Non-critical step

  workflow.addStep('Send Report', async () => {
    logger.info('Sending Telegram report...');
    await Utils.sleep(1000);
    return { sent: true };
  });

  // Execute workflow
  const results = await workflow.execute();

  logger.info('Workflow results:', results);

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 5: Error Handling
// ============================================================================

async function example5_ErrorHandling() {
  logger.section('EXAMPLE 5: Error Handling');

  const helper = new MainHelper();
  await helper.initialize();

  // Retry mechanism
  const unreliableOperation = async () => {
    const random = Math.random();
    if (random < 0.7) {
      throw new Error('Random failure');
    }
    return 'Success!';
  };

  try {
    const result = await ErrorHandler.retry(
      unreliableOperation,
      5, // max retries
      1000, // initial delay
      'Unreliable Operation'
    );
    logger.success('Operation succeeded:', result);
  } catch (error) {
    logger.error('Operation failed after retries');
  }

  // Wrapped async function
  const safeFetch = ErrorHandler.wrapAsync(async () => {
    // Simulated API call
    throw new Error('API Error');
  }, 'API Fetch');

  const result = await safeFetch();
  logger.info('Safe fetch result:', result); // Will return null on error

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 6: Metrics Calculation
// ============================================================================

async function example6_MetricsCalculation() {
  logger.section('EXAMPLE 6: Metrics Calculation');

  // Revenue and costs
  const revenue = 5000;
  const costs = 1500;

  const roi = MetricsCalculator.calculateROI(revenue, costs);
  const profit = MetricsCalculator.calculateProfit(revenue, costs);

  logger.info('Revenue:', MetricsCalculator.formatCurrency(revenue));
  logger.info('Costs:', MetricsCalculator.formatCurrency(costs));
  logger.info('Profit:', MetricsCalculator.formatCurrency(profit));
  logger.info('ROI:', MetricsCalculator.formatPercentage(roi));

  // Conversion metrics
  const conversions = 25;
  const impressions = 10000;
  const clicks = 500;

  const conversionRate = MetricsCalculator.calculateConversionRate(conversions, impressions);
  const ctr = MetricsCalculator.calculateCTR(clicks, impressions);
  const cpa = MetricsCalculator.calculateCPA(costs, conversions);

  logger.info('Conversions:', conversions);
  logger.info('Impressions:', MetricsCalculator.formatNumber(impressions));
  logger.info('Conversion Rate:', MetricsCalculator.formatPercentage(conversionRate));
  logger.info('CTR:', MetricsCalculator.formatPercentage(ctr));
  logger.info('CPA:', MetricsCalculator.formatCurrency(cpa));
}

// ============================================================================
// EXAMPLE 7: Telegram Notifications
// ============================================================================

async function example7_TelegramNotifications() {
  logger.section('EXAMPLE 7: Telegram Notifications');

  const helper = new MainHelper();
  await helper.initialize();

  const state = helper.getState();

  // Format and send report
  const reportData = {
    balance: state.get('balance', 0),
    revenue: state.get('total_revenue', 0),
    costs: state.get('total_costs', 0),
    profit: state.get('total_revenue', 0) - state.get('total_costs', 0),
    roi: MetricsCalculator.calculateROI(
      state.get('total_revenue', 0),
      state.get('total_costs', 0)
    ),
    activeCampaigns: state.get('active_campaigns', 0),
    conversions: state.get('total_conversions', 0),
    conversionRate: 3.5,
    productsAnalyzed: 42,
    topProduct: 'Social Media Mastery Kurs',
  };

  const report = NotificationHelper.formatReport(reportData);
  logger.info('Report:\n' + report);

  await NotificationHelper.sendTelegram(report);

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 8: Utilities
// ============================================================================

async function example8_Utilities() {
  logger.section('EXAMPLE 8: Utilities');

  // Date/Time formatting
  const now = new Date();
  logger.info('Date:', Utils.formatDate(now));
  logger.info('Time:', Utils.formatTime(now));
  logger.info('DateTime:', Utils.formatDateTime(now));

  // ID generation
  const id = Utils.generateId();
  logger.info('Generated ID:', id);

  // Array utilities
  const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const chunks = Utils.chunk(items, 3);
  logger.info('Chunked:', chunks);

  const randomItem = Utils.randomChoice(items);
  logger.info('Random choice:', randomItem);

  const randomNum = Utils.randomInt(1, 100);
  logger.info('Random number (1-100):', randomNum);

  // File utilities
  const filename = 'My Product! @2024.json';
  logger.info('Sanitized filename:', Utils.sanitizeFilename(filename));
}

// ============================================================================
// EXAMPLE 9: Complete Automation Workflow
// ============================================================================

async function example9_CompleteAutomationWorkflow() {
  logger.section('EXAMPLE 9: Complete Automation Workflow');

  const helper = new MainHelper();
  await helper.initialize();

  const db = helper.getDB();
  const state = helper.getState();
  const workflow = helper.getWorkflow();

  // Step 1: Fetch top products
  workflow.addStep('Product Discovery', async () => {
    const products = await db.query('digistore_products', {
      orderBy: { column: 'conversion_rate', ascending: false },
      limit: 10,
    });

    logger.info(`Found ${products.length} top-converting products`);
    return { products };
  });

  // Step 2: Select best product
  workflow.addStep('Product Selection', async () => {
    await Utils.sleep(1000);
    const selectedProduct = {
      id: 'prod-123',
      name: 'AI Marketing Masterclass',
      price: 497,
      commission: 50,
    };

    logger.info(`Selected product: ${selectedProduct.name}`);
    return { selectedProduct };
  });

  // Step 3: Generate content
  workflow.addStep('Content Generation', async () => {
    await Utils.sleep(2000);
    const content = {
      script: 'Viral TikTok script about AI marketing...',
      images: ['image1.jpg', 'image2.jpg'],
      video: 'final-video.mp4',
    };

    logger.info('Content generated successfully');
    return { content };
  });

  // Step 4: Create campaign
  workflow.addStep('Campaign Creation', async () => {
    const campaign = await db.insert('campaigns', {
      name: 'AI Marketing Q4 2024',
      product_id: 'prod-123',
      status: 'active',
      budget: 500,
      created_at: new Date().toISOString(),
    });

    logger.info('Campaign created:', campaign[0].name);
    return { campaign: campaign[0] };
  });

  // Step 5: Update state
  workflow.addStep('State Update', async () => {
    state.update({
      active_campaigns: state.get('active_campaigns', 0) + 1,
      balance: state.get('balance', 0) - 500, // Campaign budget
      total_costs: state.get('total_costs', 0) + 500,
    });

    await state.save();
    logger.info('State updated and saved');
    return { stateUpdated: true };
  });

  // Step 6: Send notification
  workflow.addStep('Send Notification', async () => {
    const message = `
🚀 *Neue Kampagne gestartet!*

📦 Produkt: AI Marketing Masterclass
💰 Budget: ${MetricsCalculator.formatCurrency(500)}
📊 Status: Aktiv

Viel Erfolg! 🎯
    `.trim();

    await NotificationHelper.sendTelegram(message);
    return { notificationSent: true };
  }, { critical: false });

  // Execute workflow
  const results = await workflow.execute();

  logger.success('Automation workflow completed!');
  logger.info('Results:', results);

  await helper.shutdown();
}

// ============================================================================
// EXAMPLE 10: Health Check
// ============================================================================

async function example10_HealthCheck() {
  logger.section('EXAMPLE 10: Health Check');

  const helper = new MainHelper();
  await helper.initialize();

  const health = await helper.healthCheck();

  logger.info('Health check results:', health);

  await helper.shutdown();
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function runAllExamples() {
  try {
    // Uncomment the examples you want to run:

    // await example1_BasicInitialization();
    // await example2_DatabaseOperations();
    // await example3_StateManagement();
    // await example4_WorkflowExecution();
    // await example5_ErrorHandling();
    // await example6_MetricsCalculation();
    // await example7_TelegramNotifications();
    // await example8_Utilities();
    // await example9_CompleteAutomationWorkflow();
    await example10_HealthCheck();

    logger.success('All examples completed!');
  } catch (error) {
    logger.error('Example failed:', error.message);
    console.error(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_BasicInitialization,
  example2_DatabaseOperations,
  example3_StateManagement,
  example4_WorkflowExecution,
  example5_ErrorHandling,
  example6_MetricsCalculation,
  example7_TelegramNotifications,
  example8_Utilities,
  example9_CompleteAutomationWorkflow,
  example10_HealthCheck,
};
