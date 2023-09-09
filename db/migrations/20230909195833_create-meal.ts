/* eslint-disable prettier/prettier */
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary().index().notNullable()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('in_diet').notNullable()
    table.timestamp('eaten_at').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user').references('id').inTable('users').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
