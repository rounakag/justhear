exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('phone').nullable();
    table.enum('role', ['user', 'listener', 'admin']).defaultTo('user');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.boolean('email_verified').defaultTo(false);
    table.boolean('phone_verified').defaultTo(false);
    table.jsonb('profile').nullable(); // For additional profile data
    table.timestamp('last_login').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['role']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
