import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../../middlewares/session'

export async function meals(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const meals = await knex('meals')
        .select('*')
        .where({ user: user.id })
        .distinct()

      return { meals }
    },
  )

  app.get('/:id/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealParamsScheme = z.object({
      id: z.string(),
    })

    const { id } = getMealParamsScheme.parse(request.params)

    const meal = await knex('meals').where({ id }).first()

    return { ...meal }
  })

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealScheme = z.object({
        name: z.string().nonempty("Name can't be empty"),
        description: z.string().nonempty("Description can't be empty"),
        eaten_at: z.string().nonempty("Eaten at can't be empty"),
        user_id: z.string().nonempty("User id can't be empty"),
        in_diet: z.boolean(),
      })

      const { name, description, in_diet, eaten_at, user_id } =
        createMealScheme.parse(request.body)

      const sessionId = request.cookies.sessionId

      if (!sessionId) {
        return reply
          .status(404)
          .send({ message: 'Start a session to create a meal record' })
      }

      const user = await knex('users')
        .where({ id: user_id, session_id: sessionId })
        .first()

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      await knex('meals').insert({
        name,
        description,
        in_diet,
        eaten_at,
        id: randomUUID(),
        user: user?.id,
      })

      return reply.status(201).send({
        message: 'Meal created successfully',
      })
    },
  )
}
