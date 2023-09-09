import { FastifyInstance } from 'fastify'
// import { transactions } from './transactions'
import { meals } from './meals/controller'
import { users } from './users/controller'

export async function root(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    reply.send('Server is Up!')
  })
  // app.register(transactions, {
  //   prefix: 'transactions',
  // })
  app.register(meals, {
    prefix: 'meals',
  })
  app.register(users, {
    prefix: 'users',
  })
}
