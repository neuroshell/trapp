/**
 * Comprehensive API Test Suite for Trapp Backend
 * Tests functional, security, and edge case scenarios
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:4000';
const TEST_USER = 'testuser_api';
const TEST_PASSWORD = 'testpass123';
const VALID_DEVICE_ID = 'device-001';

// Test result tracking
const results = {
  passed: [],
  failed: [],
  skipped: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
    security: '🔒'
  }[type] || '•';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      data: { error: error.message },
      ok: false,
      networkError: true
    };
  }
}

function recordResult(testName, passed, details = '') {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  if (passed) {
    results.passed.push(result);
    log(`PASS: ${testName}`, 'pass');
  } else {
    results.failed.push(result);
    log(`FAIL: ${testName} - ${details}`, 'fail');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: /health endpoint
// ─────────────────────────────────────────────────────────────────────────────
async function testHealthEndpoint() {
  log('Testing /health endpoint...', 'info');
  
  const result = await makeRequest(`${BASE_URL}/health`);
  
  recordResult(
    'Health endpoint returns 200',
    result.status === 200,
    `Got status ${result.status}`
  );
  
  recordResult(
    'Health endpoint returns ok: true',
    result.data.ok === true,
    `Got ok: ${result.data.ok}`
  );
  
  recordResult(
    'Health endpoint returns timestamp',
    typeof result.data.timestamp === 'number',
    `Got timestamp: ${result.data.timestamp}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: POST /sync - Valid data
// ─────────────────────────────────────────────────────────────────────────────
async function testPostSyncValidData() {
  log('Testing POST /sync with valid data...', 'info');
  
  const payload = {
    username: TEST_USER,
    passwordHash: TEST_PASSWORD,
    deviceId: VALID_DEVICE_ID,
    payload: {
      settings: { theme: 'dark', notifications: true },
      data: { items: [1, 2, 3] }
    }
  };
  
  const result = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  recordResult(
    'POST /sync valid data returns 200',
    result.status === 200,
    `Got status ${result.status}: ${JSON.stringify(result.data)}`
  );
  
  recordResult(
    'POST /sync valid data returns ok: true',
    result.data.ok === true,
    `Got ok: ${result.data.ok}`
  );
  
  recordResult(
    'POST /sync returns device info',
    result.data.device && result.data.device.id === VALID_DEVICE_ID,
    `Got device: ${JSON.stringify(result.data.device)}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: POST /sync - Prototype pollution attempts
// ─────────────────────────────────────────────────────────────────────────────
async function testPostSyncPrototypePollution() {
  log('Testing POST /sync - Prototype pollution prevention...', 'security');
  
  const dangerousDeviceIds = [
    '__proto__',
    'constructor',
    'prototype',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString'
  ];
  
  for (const deviceId of dangerousDeviceIds) {
    const payload = {
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      deviceId: deviceId,
      payload: { malicious: true }
    };
    
    const result = await makeRequest(`${BASE_URL}/sync`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    recordResult(
      `POST /sync blocks prototype pollution: ${deviceId}`,
      result.status === 400,
      `Got status ${result.status}: ${JSON.stringify(result.data)}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: POST /sync - Missing required fields
// ─────────────────────────────────────────────────────────────────────────────
async function testPostSyncMissingFields() {
  log('Testing POST /sync - Missing required fields...', 'info');
  
  // Missing deviceId
  const test1 = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      payload: {}
    })
  });
  recordResult(
    'POST /sync rejects missing deviceId',
    test1.status === 400,
    `Got status ${test1.status}`
  );
  
  // Missing username
  const test2 = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({
      passwordHash: TEST_PASSWORD,
      deviceId: VALID_DEVICE_ID,
      payload: {}
    })
  });
  recordResult(
    'POST /sync rejects missing username',
    test2.status === 400 || test2.status === 401,
    `Got status ${test2.status}`
  );
  
  // Missing passwordHash
  const test3 = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_USER,
      deviceId: VALID_DEVICE_ID,
      payload: {}
    })
  });
  recordResult(
    'POST /sync rejects missing passwordHash',
    test3.status === 400 || test3.status === 401,
    `Got status ${test3.status}`
  );
  
  // Missing payload
  const test4 = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      deviceId: VALID_DEVICE_ID
    })
  });
  recordResult(
    'POST /sync rejects missing payload',
    test4.status === 400,
    `Got status ${test4.status}`
  );
  
  // Empty body
  const test5 = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  recordResult(
    'POST /sync rejects empty body',
    test5.status === 400 || test5.status === 401,
    `Got status ${test5.status}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: POST /sync - Special characters in deviceId
// ─────────────────────────────────────────────────────────────────────────────
async function testPostSyncSpecialCharacters() {
  log('Testing POST /sync - Special characters in deviceId...', 'security');
  
  const invalidDeviceIds = [
    'device<script>alert(1)</script>',  // XSS attempt
    'device;DROP TABLE users;',          // SQL injection attempt
    'device`rm -rf /`',                  // Command injection
    'device|cat /etc/passwd',            // Pipe injection
    'device&whoami',                     // Shell command
    'device\ninjection',                 // Newline injection
    'device\rinjection',                 // Carriage return
    'device\tinjection',                 // Tab character
    'device/injection',                  // Path traversal
    'device\\injection',                 // Backslash
    'device injection',                  // Space
    'device@injection',                  // At symbol
    'device#injection',                  // Hash
    'device$injection',                  // Dollar sign
    'device%injection',                  // Percent
    'device^injection',                  // Caret
    'device&injection',                  // Ampersand
    'device*injection',                  // Asterisk
    'device=injection',                  // Equals
    'device+injection',                  // Plus
    'device!injection',                  // Exclamation
    'device?injection',                  // Question mark
    'device~injection',                  // Tilde
    'device[injection]',                 // Brackets
    'device{injection}',                 // Braces
    'device(injection)',                 // Parentheses
  ];
  
  for (const deviceId of invalidDeviceIds) {
    const payload = {
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      deviceId: deviceId,
      payload: { test: true }
    };
    
    const result = await makeRequest(`${BASE_URL}/sync`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    recordResult(
      `POST /sync rejects invalid deviceId: "${deviceId.slice(0, 20)}..."`,
      result.status === 400,
      `Got status ${result.status}`
    );
  }
  
  // Test valid special characters (hyphens and underscores should be allowed)
  const validSpecialDeviceIds = [
    'device-001',
    'device_001',
    'device-001-test',
    'device_001_test',
    'a-b_c-d_e',
    'TEST-device_123'
  ];
  
  for (const deviceId of validSpecialDeviceIds) {
    const payload = {
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      deviceId: deviceId,
      payload: { test: true }
    };
    
    const result = await makeRequest(`${BASE_URL}/sync`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    // These should succeed (200) since hyphens and underscores are valid
    recordResult(
      `POST /sync accepts valid deviceId: "${deviceId}"`,
      result.status === 200,
      `Got status ${result.status}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: GET /sync - Valid credentials
// ─────────────────────────────────────────────────────────────────────────────
async function testGetSyncValidCredentials() {
  log('Testing GET /sync with valid credentials...', 'info');
  
  // First register a device
  await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_USER,
      passwordHash: TEST_PASSWORD,
      deviceId: 'get-test-device',
      payload: { testData: 'value' }
    })
  });
  
  // Now try to GET it
  const result = await makeRequest(
    `${BASE_URL}/sync?username=${TEST_USER}&passwordHash=${TEST_PASSWORD}&deviceId=get-test-device`
  );
  
  recordResult(
    'GET /sync valid credentials returns 200',
    result.status === 200,
    `Got status ${result.status}`
  );
  
  recordResult(
    'GET /sync returns ok: true',
    result.data.ok === true,
    `Got ok: ${result.data.ok}`
  );
  
  recordResult(
    'GET /sync returns device data',
    result.data.device && result.data.device.id === 'get-test-device',
    `Got device: ${JSON.stringify(result.data.device)}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: GET /sync - Invalid credentials
// ─────────────────────────────────────────────────────────────────────────────
async function testGetSyncInvalidCredentials() {
  log('Testing GET /sync with invalid credentials...', 'security');
  
  // Wrong password
  const test1 = await makeRequest(
    `${BASE_URL}/sync?username=${TEST_USER}&passwordHash=wrongpassword&deviceId=${VALID_DEVICE_ID}`
  );
  recordResult(
    'GET /sync rejects wrong password',
    test1.status === 401,
    `Got status ${test1.status}`
  );
  
  // Non-existent user
  const test2 = await makeRequest(
    `${BASE_URL}/sync?username=nonexistentuser&passwordHash=testpass&deviceId=${VALID_DEVICE_ID}`
  );
  recordResult(
    'GET /sync rejects non-existent user',
    test2.status === 401,
    `Got status ${test2.status}`
  );
  
  // Missing credentials
  const test3 = await makeRequest(
    `${BASE_URL}/sync?deviceId=${VALID_DEVICE_ID}`
  );
  recordResult(
    'GET /sync rejects missing credentials',
    test3.status === 400,
    `Got status ${test3.status}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: GET /sync - Unregistered device
// ─────────────────────────────────────────────────────────────────────────────
async function testGetSyncUnregisteredDevice() {
  log('Testing GET /sync with unregistered device...', 'security');
  
  const result = await makeRequest(
    `${BASE_URL}/sync?username=${TEST_USER}&passwordHash=${TEST_PASSWORD}&deviceId=unregistered-device-xyz`
  );
  
  recordResult(
    'GET /sync rejects unregistered device',
    result.status === 403,
    `Got status ${result.status}: ${JSON.stringify(result.data)}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: GET /sync - Invalid deviceId formats
// ─────────────────────────────────────────────────────────────────────────────
async function testGetSyncInvalidDeviceId() {
  log('Testing GET /sync with invalid deviceId formats...', 'security');
  
  const invalidIds = [
    '__proto__',
    'constructor',
    '<script>alert(1)</script>',
    'device;DROP TABLE',
    'device\ninjection'
  ];
  
  for (const deviceId of invalidIds) {
    const result = await makeRequest(
      `${BASE_URL}/sync?username=${TEST_USER}&passwordHash=${TEST_PASSWORD}&deviceId=${encodeURIComponent(deviceId)}`
    );
    
    recordResult(
      `GET /sync rejects invalid deviceId: "${deviceId.slice(0, 15)}..."`,
      result.status === 400,
      `Got status ${result.status}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: Log injection prevention
// ─────────────────────────────────────────────────────────────────────────────
async function testLogInjection() {
  log('Testing log injection prevention...', 'security');
  
  // These requests contain newline characters that could inject fake log entries
  // The backend should sanitize these before logging
  
  const payload = {
    username: TEST_USER,
    passwordHash: TEST_PASSWORD,
    deviceId: 'log-test-device',
    payload: { 
      test: 'value',
      // Attempt to inject newlines into logs
      malicious: 'test\r\n[Fake log entry] Malicious content'
    }
  };
  
  const result = await makeRequest(`${BASE_URL}/sync`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  // The request should still succeed, but the log should be sanitized
  recordResult(
    'POST /sync handles log injection attempt gracefully',
    result.status === 200,
    `Got status ${result.status} (log should be sanitized server-side)`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: Rate limiting / Concurrent requests
// ─────────────────────────────────────────────────────────────────────────────
async function testConcurrentRequests() {
  log('Testing concurrent request handling...', 'info');
  
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(
      makeRequest(`${BASE_URL}/health`)
    );
  }
  
  const results = await Promise.all(requests);
  const allSuccessful = results.every(r => r.status === 200);
  
  recordResult(
    'Server handles 10 concurrent requests',
    allSuccessful,
    `All ${results.length} requests completed`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main test runner
// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  TRAPP BACKEND API TEST SUITE');
  console.log('  Security & Functional Testing');
  console.log('='.repeat(80) + '\n');
  
  // Wait for server to be ready
  log('Waiting for server to be ready...', 'info');
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    const result = await makeRequest(`${BASE_URL}/health`);
    if (result.status === 200) {
      serverReady = true;
      break;
    }
    await setTimeout(1000);
  }
  
  if (!serverReady) {
    log('Server not ready after 30 seconds. Aborting tests.', 'fail');
    process.exit(1);
  }
  
  log('Server is ready! Starting tests...\n', 'pass');
  
  // Run all test suites
  await testHealthEndpoint();
  console.log();
  
  await testPostSyncValidData();
  console.log();
  
  await testPostSyncPrototypePollution();
  console.log();
  
  await testPostSyncMissingFields();
  console.log();
  
  await testPostSyncSpecialCharacters();
  console.log();
  
  await testGetSyncValidCredentials();
  console.log();
  
  await testGetSyncInvalidCredentials();
  console.log();
  
  await testGetSyncUnregisteredDevice();
  console.log();
  
  await testGetSyncInvalidDeviceId();
  console.log();
  
  await testLogInjection();
  console.log();
  
  await testConcurrentRequests();
  console.log();
  
  // Print summary
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(80));
  
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  
  console.log(`\n  Total Tests: ${total}`);
  console.log(`  ✅ Passed: ${results.passed.length}`);
  console.log(`  ❌ Failed: ${results.failed.length}`);
  console.log(`  Pass Rate: ${passRate}%\n`);
  
  if (results.failed.length > 0) {
    console.log('  Failed Tests:');
    console.log('  ' + '-'.repeat(76));
    results.failed.forEach((r, i) => {
      console.log(`    ${i + 1}. ${r.testName}`);
      console.log(`     Details: ${r.details}\n`);
    });
  }
  
  console.log('='.repeat(80));
  
  const overallStatus = results.failed.length === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
  const statusIcon = results.failed.length === 0 ? '✅' : '❌';
  console.log(`\n  ${statusIcon} OVERALL STATUS: ${overallStatus}\n`);
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
