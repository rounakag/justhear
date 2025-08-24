exports.up = function(knex) {
  return knex.schema.createTable('bookings', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('listener_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('time_slot_id').references('id').inTable('time_slots').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency').defaultTo('USD');
    table.enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).defaultTo('pending');
    table.string('payment_status').defaultTo('pending'); // pending, paid, refunded, failed
    table.string('transaction_id').nullable(); // For payment reference
    table.string('meeting_link').nullable(); // For video call link
    table.text('notes').nullable(); // For session notes
    table.jsonb('metadata').nullable(); // For additional booking data
    table.timestamp('session_start').nullable();
    table.timestamp('session_end').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id']);
    table.index(['listener_id']);
    table.index(['time_slot_id']);
    table.index(['status']);
    table.index(['payment_status']);
    table.index(['user_id', 'status']);
    table.index(['listener_id', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bookings');
};
