const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('reviews').del();
  await knex('bookings').del();
  await knex('time_slots').del();
  await knex('users').del();

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const [adminUser] = await knex('users').insert({
    username: 'admin',
    email: 'admin@justhear.com',
    password_hash: adminPasswordHash,
    role: 'admin',
    status: 'active',
    email_verified: true
  }).returning('*');

  // Create sample listeners
  const listeners = [
    {
      username: 'sarah_johnson',
      email: 'sarah@justhear.com',
      password_hash: await bcrypt.hash('password123', 12),
      role: 'listener',
      status: 'active',
      email_verified: true,
      profile: JSON.stringify({
        bio: 'Experienced listener with 5+ years in mental health support',
        specializations: ['Stress Management', 'Relationship Issues', 'Anxiety'],
        hourly_rate: 75
      })
    },
    {
      username: 'mike_chen',
      email: 'mike@justhear.com',
      password_hash: await bcrypt.hash('password123', 12),
      role: 'listener',
      status: 'active',
      email_verified: true,
      profile: JSON.stringify({
        bio: 'Certified counselor specializing in work-life balance',
        specializations: ['Career Stress', 'Work-Life Balance', 'Depression'],
        hourly_rate: 80
      })
    },
    {
      username: 'emma_wilson',
      email: 'emma@justhear.com',
      password_hash: await bcrypt.hash('password123', 12),
      role: 'listener',
      status: 'active',
      email_verified: true,
      profile: JSON.stringify({
        bio: 'Compassionate listener focused on personal growth',
        specializations: ['Personal Growth', 'Self-Esteem', 'Life Transitions'],
        hourly_rate: 70
      })
    }
  ];

  const createdListeners = await knex('users').insert(listeners).returning('*');

  // Create sample time slots for the next 7 days
  const timeSlots = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Create slots for each listener
    createdListeners.forEach(listener => {
      const hourlyRate = JSON.parse(listener.profile).hourly_rate;
      
      // Morning slots (9 AM - 12 PM)
      for (let hour = 9; hour < 12; hour++) {
        timeSlots.push({
          listener_id: listener.id,
          date: dateStr,
          start_time: `${hour.toString().padStart(2, '0')}:00:00`,
          end_time: `${(hour + 1).toString().padStart(2, '0')}:00:00`,
          price: hourlyRate,
          is_available: true,
          timezone: 'UTC',
          status: 'available'
        });
      }
      
      // Afternoon slots (2 PM - 6 PM)
      for (let hour = 14; hour < 18; hour++) {
        timeSlots.push({
          listener_id: listener.id,
          date: dateStr,
          start_time: `${hour.toString().padStart(2, '0')}:00:00`,
          end_time: `${(hour + 1).toString().padStart(2, '0')}:00:00`,
          price: hourlyRate,
          is_available: true,
          timezone: 'UTC',
          status: 'available'
        });
      }
    });
  }

  await knex('time_slots').insert(timeSlots);

  console.log('✅ Seed data created successfully!');
  console.log('👤 Admin user: admin@justhear.com / admin123');
  console.log('🎧 Sample listeners created with password: password123');
};
