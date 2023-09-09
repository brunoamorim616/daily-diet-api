import requestTest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { app } from '../src/app'

beforeAll(async () => await app.ready())

afterAll(async () => await app.close())

describe('Test the application setup', async () => {
  test('GET /', async () => {
    const response = await requestTest(app.server).get('/api/')
    expect(response.status).toBe(200)
    expect(response.text).toBe('Server is Up!')
  })
})
