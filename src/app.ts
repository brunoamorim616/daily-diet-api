import fastify from 'fastify'
import { root } from './routes/root'
import cookie from '@fastify/cookie'

const app = fastify()

app.addHook('onSend', async (request, reply) =>
  console.log(`[${request.method}] ${request.url} - [${reply.statusCode}]`),
)

app.register(cookie)

app.register(root, { prefix: 'api' })

export { app }
