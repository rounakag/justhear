const databaseService = require('../services/databaseService-improved');
const { checkConnection, getDatabaseStats, testDatabasePerformance } = require('../config/supabase-improved');
const logger = require('./logger');

/**
 * Comprehensive Test Suite for Backend Services
 * Tests all critical functionality with detailed reporting
 */
class TestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [],
      startTime: null,
      endTime: null,
      duration: 0
    };
  }

  /**
   * Run a test and record results
   * @param {string} testName - Name of the test
   * @param {Function} testFn - Test function that returns a promise
   */
  async runTest(testName, testFn) {
    const startTime = Date.now();
    this.results.total++;
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.passed++;
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`✅ ${testName} - PASSED (${duration}ms)`);
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      logger.error(`❌ ${testName} - FAILED (${duration}ms):`, { error: error.message });
      return false;
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    return this.runTest('Database Connection', async () => {
      const status = await checkConnection();
      if (status.status !== 'connected') {
        throw new Error(`Connection failed: ${status.message}`);
      }
    });
  }

  /**
   * Test database statistics
   */
  async testDatabaseStats() {
    return this.runTest('Database Statistics', async () => {
      const stats = await getDatabaseStats();
      if (!stats || typeof stats.users !== 'number') {
        throw new Error('Invalid database statistics returned');
      }
    });
  }

  /**
   * Test database performance
   */
  async testDatabasePerformance() {
    return this.runTest('Database Performance', async () => {
      const performance = await testDatabasePerformance();
      if (!performance || !performance.tests || performance.tests.length === 0) {
        throw new Error('Performance test failed to return results');
      }
      
      // Check if any test took too long
      const slowTests = performance.tests.filter(test => test.duration > 2000);
      if (slowTests.length > 0) {
        throw new Error(`Slow tests detected: ${slowTests.map(t => `${t.name}(${t.duration}ms)`).join(', ')}`);
      }
    });
  }

  /**
   * Test user operations
   */
  async testUserOperations() {
    return this.runTest('User Operations', async () => {
      // Test getting listeners
      const listeners = await databaseService.getListeners();
      if (!Array.isArray(listeners)) {
        throw new Error('getListeners should return an array');
      }
      
      // Test getting system user
      const systemUser = await databaseService._getSystemUser();
      if (!systemUser || systemUser.username !== 'system') {
        throw new Error('System user not found or invalid');
      }
    });
  }

  /**
   * Test slot operations
   */
  async testSlotOperations() {
    return this.runTest('Slot Operations', async () => {
      // Test getting available slots
      const availableSlots = await databaseService.getAvailableSlots(1, 10);
      if (!availableSlots || !availableSlots.slots || !Array.isArray(availableSlots.slots)) {
        throw new Error('getAvailableSlots should return an object with slots array');
      }
      
      // Test getting admin created slots
      const adminSlots = await databaseService.getAdminCreatedSlots();
      if (!Array.isArray(adminSlots)) {
        throw new Error('getAdminCreatedSlots should return an array');
      }
    });
  }

  /**
   * Test cache operations
   */
  async testCacheOperations() {
    return this.runTest('Cache Operations', async () => {
      // Test cache stats
      const cacheStats = databaseService.getCacheStats();
      if (!cacheStats || typeof cacheStats.size !== 'number') {
        throw new Error('Cache stats should return an object with size property');
      }
      
      // Test cache clearing
      databaseService.clearCache();
      const statsAfterClear = databaseService.getCacheStats();
      if (statsAfterClear.size !== 0) {
        throw new Error('Cache should be empty after clearing');
      }
    });
  }

  /**
   * Test health check
   */
  async testHealthCheck() {
    return this.runTest('Health Check', async () => {
      const health = await databaseService.healthCheck();
      if (!health || !health.status) {
        throw new Error('Health check should return status information');
      }
      
      if (health.status !== 'healthy') {
        throw new Error(`Health check failed: ${health.error || 'Unknown error'}`);
      }
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    return this.runTest('Error Handling', async () => {
      // Test invalid user ID
      try {
        await databaseService.getUserById('invalid-uuid');
        throw new Error('Should have thrown an error for invalid UUID');
      } catch (error) {
        if (!error.message.includes('Database operation failed')) {
          throw new Error('Expected database operation error');
        }
      }
      
      // Test invalid slot data
      try {
        await databaseService.createTimeSlot({});
        throw new Error('Should have thrown an error for invalid slot data');
      } catch (error) {
        if (!error.message.includes('Missing required fields')) {
          throw new Error('Expected validation error');
        }
      }
    });
  }

  /**
   * Test statistics operations
   */
  async testStatisticsOperations() {
    return this.runTest('Statistics Operations', async () => {
      const stats = await databaseService.getDashboardStats();
      if (!stats || typeof stats.totalSlots !== 'number') {
        throw new Error('Dashboard stats should return numeric values');
      }
      
      // Test individual stat methods
      const totalSlots = await databaseService.getTotalSlots();
      const totalUsers = await databaseService.getTotalUsers();
      
      if (typeof totalSlots !== 'number' || typeof totalUsers !== 'number') {
        throw new Error('Individual stat methods should return numbers');
      }
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.results.startTime = new Date();
    logger.info('🚀 Starting comprehensive test suite...');
    
    const tests = [
      this.testDatabaseConnection(),
      this.testDatabaseStats(),
      this.testDatabasePerformance(),
      this.testUserOperations(),
      this.testSlotOperations(),
      this.testCacheOperations(),
      this.testHealthCheck(),
      this.testErrorHandling(),
      this.testStatisticsOperations()
    ];
    
    await Promise.allSettled(tests);
    
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
    
    this.printResults();
    return this.results;
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST SUITE RESULTS');
    console.log('='.repeat(60));
    
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏱️  Duration: ${this.results.duration}ms`);
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`   ${status} ${test.name} (${test.duration}ms)`);
    });
    
    console.log('='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 All tests passed! Backend is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Generate test report
   */
  generateReport() {
    return {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(1),
        duration: this.results.duration
      },
      tests: this.results.tests,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TestSuite;
