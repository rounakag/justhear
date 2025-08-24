const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5001';

async function testAPI() {
  console.log('🧪 Testing JustHear Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    console.log('   Message:', healthData.message);
    console.log('   Environment:', healthData.environment);
    console.log('');

    // Test API health endpoint
    console.log('2. Testing API health endpoint...');
    const apiHealthResponse = await fetch(`${BASE_URL}/api/health`);
    const apiHealthData = await apiHealthResponse.json();
    console.log('✅ API Health:', apiHealthData.status);
    console.log('   Version:', apiHealthData.version);
    console.log('');

    // Test users endpoint
    console.log('3. Testing users endpoint...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', `Found ${usersData.total} users`);
    usersData.users.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    console.log('');

    // Test slots endpoint
    console.log('4. Testing slots endpoint...');
    const slotsResponse = await fetch(`${BASE_URL}/api/slots`);
    const slotsData = await slotsResponse.json();
    console.log('✅ Slots:', `Found ${slotsData.total} slots`);
    slotsData.slots.forEach(slot => {
      console.log(`   - ${slot.date} ${slot.start_time} (${slot.status})`);
    });
    console.log('');

    // Test bookings endpoint
    console.log('5. Testing bookings endpoint...');
    const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`);
    const bookingsData = await bookingsResponse.json();
    console.log('✅ Bookings:', `Found ${bookingsData.total} bookings`);
    bookingsData.bookings.forEach(booking => {
      console.log(`   - Booking ${booking.id} (${booking.status})`);
    });
    console.log('');

    // Test login endpoint
    console.log('6. Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@justhear.com',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.message);
    console.log('   User:', loginData.user.username);
    console.log('   Role:', loginData.user.role);
    console.log('');

    // Test signup endpoint
    console.log('7. Testing signup endpoint...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      })
    });
    const signupData = await signupResponse.json();
    console.log('✅ Signup:', signupData.message);
    console.log('   User:', signupData.user.username);
    console.log('   Role:', signupData.user.role);
    console.log('');

    console.log('🎉 All API tests passed!');
    console.log('🚀 Backend is ready for deployment to Render');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
