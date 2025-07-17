#!/usr/bin/env node

/**
 * Test script to verify microservice communication
 */

const { logWithMeta } = require('@gauravsharmacode/neat-logger');

// Create logger helper functions
const logger = {
  info: (message, extra = {}) => logWithMeta(message, { level: 'info', extra }),
  error: (message, extra = {}) => logWithMeta(message, { level: 'error', extra }),
  warn: (message, extra = {}) => logWithMeta(message, { level: 'warn', extra })
};

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

/**
 * Make HTTP request with timeout
 */
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({ error: 'Invalid JSON' }))
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      error: error.message
    };
  }
}

/**
 * Test service health endpoints
 */
async function testHealthEndpoints() {
  logger.info('🏥 Testing service health endpoints...');

  // Test API Gateway
  logger.info('Testing API Gateway health...');
  const gatewayHealth = await makeRequest(`${API_GATEWAY_URL}/health`);
  
  if (gatewayHealth.ok) {
    logger.info('✅ API Gateway is healthy', { 
      status: gatewayHealth.status,
      services: gatewayHealth.data.services 
    });
  } else {
    logger.error('❌ API Gateway health check failed', { 
      error: gatewayHealth.error 
    });
  }

  // Test User Service
  logger.info('Testing User Service health...');
  const userServiceHealth = await makeRequest(`${USER_SERVICE_URL}/health`);
  
  if (userServiceHealth.ok) {
    logger.info('✅ User Service is healthy', { 
      status: userServiceHealth.status 
    });
  } else {
    logger.error('❌ User Service health check failed', { 
      error: userServiceHealth.error 
    });
  }

  return {
    gateway: gatewayHealth.ok,
    userService: userServiceHealth.ok
  };
}

/**
 * Test API Gateway proxying
 */
async function testProxying() {
  logger.info('🔄 Testing API Gateway proxying...');

  // Test user service proxy through gateway
  logger.info('Testing user service proxy via API Gateway...');
  const proxyResponse = await makeRequest(`${API_GATEWAY_URL}/api/v1/users/health`);
  
  if (proxyResponse.ok) {
    logger.info('✅ API Gateway proxy is working', { 
      status: proxyResponse.status 
    });
    return true;
  } else {
    logger.error('❌ API Gateway proxy failed', { 
      error: proxyResponse.error,
      status: proxyResponse.status,
      data: proxyResponse.data
    });
    return false;
  }
}

/**
 * Test service discovery
 */
async function testServiceDiscovery() {
  logger.info('🔍 Testing service discovery...');

  const discoveryResponse = await makeRequest(`${API_GATEWAY_URL}/`);
  
  if (discoveryResponse.ok && discoveryResponse.data.services) {
    logger.info('✅ Service discovery is working', { 
      services: discoveryResponse.data.services 
    });
    return true;
  } else {
    logger.error('❌ Service discovery failed', { 
      error: discoveryResponse.error 
    });
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  logger.info('🚀 Starting microservice communication tests...');
  
  try {
    const healthResults = await testHealthEndpoints();
    const proxyWorking = await testProxying();
    const discoveryWorking = await testServiceDiscovery();
    
    logger.info('📊 Test Results Summary:', {
      apiGatewayHealth: healthResults.gateway,
      userServiceHealth: healthResults.userService,
      proxyWorking,
      discoveryWorking,
      overallStatus: healthResults.gateway && healthResults.userService && proxyWorking && discoveryWorking ? 'PASS' : 'FAIL'
    });

    if (healthResults.gateway && healthResults.userService && proxyWorking && discoveryWorking) {
      logger.info('🎉 All tests passed! Your microservice architecture is working correctly.');
      process.exit(0);
    } else {
      logger.error('💥 Some tests failed. Check the logs above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('💥 Test execution failed', { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Test interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Test terminated');
  process.exit(1);
});

// Run tests
runTests();
