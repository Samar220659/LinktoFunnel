#!/usr/bin/env node

/**
 * 🧪 Z.AI IMAGE GROUNDING TEST SCRIPT
 * Testet alle Funktionen der Z.AI Image Grounding Integration
 */

require('dotenv').config({ path: '.env.local' });
const { ZAIClient } = require('../ai-agent/integrations/zai-image-grounding.js');

const ZAI_API_KEY = process.env.ZAI_API_KEY;

// Test-Bilder
const TEST_IMAGES = {
  beer_bottles: 'https://cloudcovert-1305175928.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87grounding.PNG',
  // Füge weitere Test-Bilder hinzu
};

async function runTests() {
  console.log('🧪 Starting Z.AI Image Grounding Tests...\n');
  console.log('='.repeat(50));

  if (!ZAI_API_KEY) {
    console.error('❌ ERROR: ZAI_API_KEY not found in .env.local');
    console.error('Please add your API key to .env.local\n');
    process.exit(1);
  }

  const client = new ZAIClient(ZAI_API_KEY);
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // ===== TEST 1: Basic Object Detection =====
  console.log('\n📍 TEST 1: Basic Object Detection');
  console.log('-'.repeat(50));

  try {
    const result = await client.findObject(
      TEST_IMAGES.beer_bottles,
      'Where is the second bottle of beer from the right on the table?'
    );

    console.log('✅ API Call successful');
    console.log(`Found coordinates: ${result.found ? 'YES' : 'NO'}`);

    if (result.coordinates.length > 0) {
      console.log('Coordinates:', JSON.stringify(result.coordinates[0], null, 2));
      results.passed++;
      results.tests.push({ name: 'Object Detection', status: 'PASSED' });
    } else {
      console.log('⚠️  No coordinates found in response');
      results.failed++;
      results.tests.push({ name: 'Object Detection', status: 'FAILED' });
    }

    console.log('\nRaw Response Preview:');
    console.log(result.rawResponse.substring(0, 200) + '...\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Object Detection', status: 'ERROR', error: error.message });
  }

  // ===== TEST 2: Product Analysis =====
  console.log('\n📦 TEST 2: Product Image Analysis');
  console.log('-'.repeat(50));

  try {
    const analysis = await client.analyzeProductImage(TEST_IMAGES.beer_bottles);

    console.log('✅ API Call successful');
    console.log(`Products detected: ${analysis.productCount}`);

    if (analysis.productCount > 0) {
      console.log('\nProduct Details:');
      analysis.products.slice(0, 3).forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.id}`);
        console.log(`     Position: [${product.boundingBox.xmin}, ${product.boundingBox.ymin}] to [${product.boundingBox.xmax}, ${product.boundingBox.ymax}]`);
        console.log(`     Area: ${product.area} px²`);
      });

      results.passed++;
      results.tests.push({ name: 'Product Analysis', status: 'PASSED' });
    } else {
      console.log('⚠️  No products detected');
      results.failed++;
      results.tests.push({ name: 'Product Analysis', status: 'FAILED' });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Product Analysis', status: 'ERROR', error: error.message });
  }

  // ===== TEST 3: Content Scoring =====
  console.log('\n⭐ TEST 3: Content Image Scoring');
  console.log('-'.repeat(50));

  try {
    const score = await client.scoreContentImage(TEST_IMAGES.beer_bottles);

    console.log('✅ API Call successful');
    console.log(`Overall Score: ${score.overallScore}/100`);
    console.log(`Recommendation: ${score.recommendation}`);
    console.log(`Key Elements Found: ${score.coordinates.length}`);

    results.passed++;
    results.tests.push({ name: 'Content Scoring', status: 'PASSED' });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Content Scoring', status: 'ERROR', error: error.message });
  }

  // ===== TEST 4: Multiple Objects =====
  console.log('\n🔍 TEST 4: Multiple Object Detection');
  console.log('-'.repeat(50));

  try {
    const queries = [
      'first bottle from the left',
      'last bottle on the right',
      'bottle in the center',
    ];

    const multiResults = await client.findMultipleObjects(TEST_IMAGES.beer_bottles, queries);

    console.log('✅ API Call successful');
    console.log('Results:');

    Object.entries(multiResults).forEach(([query, result]) => {
      const status = result.error ? '❌' : result.found ? '✅' : '⚠️';
      console.log(`  ${status} "${query}": ${result.found ? 'Found' : result.error || 'Not found'}`);
    });

    results.passed++;
    results.tests.push({ name: 'Multiple Objects', status: 'PASSED' });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Multiple Objects', status: 'ERROR', error: error.message });
  }

  // ===== TEST 5: Focal Point Calculation =====
  console.log('\n🎯 TEST 5: Focal Point Calculation');
  console.log('-'.repeat(50));

  try {
    const testCoords = [
      { xmin: 100, ymin: 100, xmax: 200, ymax: 200 },
      { xmin: 300, ymin: 150, xmax: 400, ymax: 250 },
    ];

    const focal = client.calculateFocalPoint(testCoords);

    console.log('✅ Calculation successful');
    console.log(`Normalized: (${focal.x.toFixed(2)}, ${focal.y.toFixed(2)})`);
    console.log(`Absolute: (${focal.absoluteX}, ${focal.absoluteY})`);

    results.passed++;
    results.tests.push({ name: 'Focal Point', status: 'PASSED' });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Focal Point', status: 'ERROR', error: error.message });
  }

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  results.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '⚠️' : '❌';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  console.log('\n' + '-'.repeat(50));
  console.log(`Total: ${results.passed + results.failed} tests`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50) + '\n');

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
