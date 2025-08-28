const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Debugging Supabase Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 
  process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'NOT SET');

// Validate URL format
if (process.env.SUPABASE_URL) {
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  console.log('URL Format Valid:', urlPattern.test(process.env.SUPABASE_URL));
}

// Validate key format
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const keyPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  console.log('Key Format Valid:', keyPattern.test(process.env.SUPABASE_SERVICE_ROLE_KEY));
}

// Try to create client
try {
  console.log('\n🔌 Creating Supabase client...');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  console.log('✅ Supabase client created successfully');
  
  // Test a simple query
  console.log('\n📊 Testing simple query...');
  supabase
    .from('users')
    .select('count(*)', { head: true, count: 'exact' })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Query failed:', error);
      } else {
        console.log('✅ Query successful:', data);
      }
    })
    .catch(err => {
      console.error('❌ Query exception:', err);
    });
    
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
}
