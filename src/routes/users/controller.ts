import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../../middlewares/session'

export async function users(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        return reply.status(404).send({
          message: 'User not found',
        })
      }

      return { ...user }
    },
  )

  app.post('/', async (request, reply) => {
    const createUserScheme = z.object({
      name: z.string().nonempty("Name can't be empty"),
    })

    const { name } = createUserScheme.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const userExists = await knex('users')
      .where({ session_id: sessionId })
      .first()

    if (userExists) {
      return reply.status(409).send({
        message: 'User already exists',
      })
    }

    await knex('users').insert({
      name,
      id: randomUUID(),
      session_id: sessionId,
    })

    return reply.status(201).send({
      message: 'User created successfully',
    })
  })
}
