import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/session'

export async function transactions(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId

    const transactions = await knex('transactions')
      .select('*')
      .where({ session_id: sessionId })
      .distinct()

    return { transactions }
  })

  app.get('/:id/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionParamsScheme = z.object({
      id: z.string(),
    })

    const validatedData = getTransactionParamsScheme.parse(request.params)

    const sessionId = request.cookies.sessionId

    const transaction = await knex('transactions')
      .where({
        id: validatedData.id,
        session_id: sessionId,
      })
      .first()

    return { ...transaction }
  })

  app.get(
    '/summary/',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const totalAmount = await knex('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'total_amount' })
        .first()

      const countDebits = await knex('transactions')
        .count('id', { as: 'count_debits' })
        .where({ session_id: sessionId })
        .andWhere('amount', '<', 0)
        .first()

      const countCredits = await knex('transactions')
        .count('id', { as: 'count_credits' })
        .where({ session_id: sessionId })
        .andWhere('amount', '>', 0)
        .first()

      return { summary: { ...totalAmount, ...countDebits, ...countCredits } }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionScheme = z.object({
      title: z.string().nonempty("Title can't be empty"),
      description: z.string().nonempty("Description can't be empty"),
      amount: z.number().min(0.01, "Amount can't be less than 0.01"),
      type: z.enum(['credit', 'debit']).default('credit'),
    })

    const { title, amount, description, type } = createTransactionScheme.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      title,
      description,
      id: randomUUID(),
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send({
      message: 'Transaction created successfully',
    })
  })
}
