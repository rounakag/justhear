exports.up = function(knex) {
  return knex.schema.createTable('reviews', function(table) {
    table.increments('id').primary();
    table.integer('booking_id').references('id').inTable('bookings').onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('listener_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable(); // 1-5 star rating
    table.text('comment').nullable();
    table.boolean('anonymous').defaultTo(true); // Keep user anonymous
    table.enum('status', ['active', 'hidden', 'deleted']).defaultTo('active');
    table.jsonb('metadata').nullable(); // For additional review data
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['booking_id']);
    table.index(['user_id']);
    table.index(['listener_id']);
    table.index(['rating']);
    table.index(['status']);
    table.index(['listener_id', 'rating']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
