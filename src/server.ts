import { app } from './app'
import { env } from './env'

app.listen(
  {
    // host: '0.0.0.0',
    port: env.PORT,
  },
  async () => {
    try {
      console.log('Server is UP!')
    } catch (error) {
      console.error(error)
    }
  },
)
