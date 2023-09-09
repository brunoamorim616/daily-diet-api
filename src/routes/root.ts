import { FastifyInstance } from 'fastify'
import { transactions } from './transactions'

export async function root(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    reply.send('Server is Up!')
  })
  app.register(transactions, {
    prefix: 'transactions',
  })
}
