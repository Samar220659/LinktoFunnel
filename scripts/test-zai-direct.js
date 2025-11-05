#!/usr/bin/env node

/**
 * Direkter Z.AI API Test
 */

require('dotenv').config({ path: '.env.local' });

const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';

async function testAPI() {
  console.log('Testing Z.AI API...\n');
  console.log('API Key:', ZAI_API_KEY ? `${ZAI_API_KEY.substring(0, 20)}...` : 'NOT FOUND');
  console.log('API URL:', ZAI_API_URL);
  console.log('\nSending request...\n');

  const requestData = {
    model: 'glm-4.5v',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: 'https://cloudcovert-1305175928.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87grounding.PNG',
            },
          },
          {
            type: 'text',
            text: 'Where is the second bottle of beer from the right on the table? Provide coordinates in [[xmin,ymin,xmax,ymax]] format',
          },
        ],
      },
    ],
    thinking: {
      type: 'enabled',
    },
  };

  try {
    const response = await fetch(ZAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': ZAI_API_KEY,
        'Accept-Language': 'en-US,en',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\nResponse Body:');
    console.log(JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]) {
      console.log('\n✅ SUCCESS!');
      console.log('\nMessage Content:');
      console.log(data.choices[0].message.content);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
