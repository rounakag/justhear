// Test server startup without actually starting the server
console.log('🔍 Testing server startup...');

try {
  // Test environment variables
  console.log('1️⃣ Checking environment variables...');
  require('dotenv').config();
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'PORT'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    process.exit(1);
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  // Test imports
  console.log('2️⃣ Testing imports...');
  const express = require('express');
  const cors = require('cors');
  const { createClient } = require('@supabase/supabase-js');
  
  console.log('✅ All imports successful');
  
  // Test Supabase connection
  console.log('3️⃣ Testing Supabase connection...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Test database service
  console.log('4️⃣ Testing database service...');
  const DatabaseService = require('./services/databaseService.js');
  console.log('✅ Database service loaded successfully');
  
  // Test meeting service
  console.log('5️⃣ Testing meeting service...');
  const MeetingService = require('./services/meetingService.js');
  console.log('✅ Meeting service loaded successfully');
  
  console.log('🎉 All tests passed! Server should start successfully.');
  
} catch (error) {
  console.error('❌ Error during startup test:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
