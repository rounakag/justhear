#!/usr/bin/env node

const TestSuite = require('./utils/testSuite');
const logger = require('./utils/logger');

/**
 * Main test runner script
 */
async function main() {
  console.log('🧪 JustHear Backend Test Suite');
  console.log('='.repeat(50));
  
  try {
    const testSuite = new TestSuite();
    const results = await testSuite.runAllTests();
    
    // Generate detailed report
    const report = testSuite.generateReport();
    
    // Save report to file
    const fs = require('fs');
    const reportPath = `./test-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    if (results.failed === 0) {
      console.log('🎉 All tests passed! Backend is production-ready.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('Test suite execution failed:', { error: error.message });
    console.error('❌ Test suite execution failed:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in test runner:', { error: error.message });
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection in test runner:', { reason: reason.message });
  console.error('❌ Unhandled rejection:', reason.message);
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = { main };
