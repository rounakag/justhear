exports.up = function(knex) {
  return knex.schema.createTable('time_slots', function(table) {
    table.increments('id').primary();
    table.integer('listener_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.boolean('is_available').defaultTo(true);
    table.string('timezone').defaultTo('UTC');
    table.enum('status', ['available', 'booked', 'cancelled', 'completed']).defaultTo('available');
    table.jsonb('metadata').nullable(); // For additional slot data
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['listener_id']);
    table.index(['date']);
    table.index(['status']);
    table.index(['is_available']);
    table.index(['listener_id', 'date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('time_slots');
};
